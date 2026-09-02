/**
 * CSMA/CA medium access model.
 *
 * Behavioural reimplementation of the CSMA/CA applet by the Telecommunication
 * Networks Group (TKN) at TU Berlin:
 * https://www.tkn.tu-berlin.de/teaching/rn/animations/csma/
 *
 * Their page carries no licence, so none of their code is reused here. This was
 * rebuilt from the behaviour it shows: three stations and one access point on a
 * shared medium, RTS/CTS/data/ACK, DIFS and SIFS, binary exponential backoff
 * with a freezing counter, and NAV set from overheard RTS and CTS frames. Their
 * slot timings are kept so the animation reads the same way theirs does.
 *
 * Every node keeps its own copy of the medium, and a frame is written into each
 * listener's copy offset by the propagation delay. That is what makes the
 * hidden terminal case fall out on its own rather than being special-cased: two
 * stations that are not in each other's listener list never write into each
 * other's medium, so carrier sensing between them never fires.
 */

// ── slot timings, from the TKN applet ──────────────────────────────────────
export const SIFS = 10;
export const DIFS = 30;
export const CTRL_LEN = 10; // RTS, CTS and ACK are all this long
export const DATA_LEN = 80;
export const REPLY_TIMEOUT = SIFS + CTRL_LEN + 10;
export const CW_MIN = 20;
export const CW_MAX = 400;
export const PROP = 1; // propagation delay between any two nodes, in slots

const RING = 1024; // medium history, must exceed SIFS + PROP + DATA_LEN
const FUTURE = 512;

export const Frame = {
	None: 0,
	Rts: 1,
	Cts: 2,
	Data: 3,
	Ack: 4,
} as const;
export type FrameType = (typeof Frame)[keyof typeof Frame];

export const Carrier = {
	Free: 0,
	Busy: 1,
	Nav: 2,
} as const;
export type CarrierType = (typeof Carrier)[keyof typeof Carrier];

interface Part {
	type: FrameType;
	len: number;
	part: number;
	from: number;
	to: number;
	nav: number;
}

/** One node's activity in one slot, which is all the view needs to draw it. */
export interface Sample {
	frame: FrameType;
	carrier: CarrierType;
	counting: boolean;
}

/**
 * Source of randomness for backoff draws. Injectable so tests can seed it:
 * with unbounded retries and the contention window clamped at CW_MAX, a
 * station can genuinely starve for thousands of slots, so assertions about
 * who gets through need a fixed sequence to be meaningful.
 */
export type Rng = () => number;

const randInt = (rng: Rng, max: number) => Math.floor(rng() * (max + 1));

/**
 * One node's view of the shared medium: a ring of slots, each holding the frame
 * parts arriving in it. More than one part in a slot is a collision.
 */
class Medium {
	private slots: Part[][] = Array.from({ length: RING }, () => []);
	private pos = 0;

	private idx(k: number) {
		return (((this.pos + k) % RING) + RING) % RING;
	}

	at(k: number) {
		return this.slots[this.idx(k)];
	}

	free() {
		return this.at(0).length === 0;
	}

	put(part: Part, delay: number) {
		this.at(delay).push(part);
	}

	/**
	 * The frame finishing in this slot, or null. Null covers three cases:
	 * nothing here, more than one thing here, and a frame whose earlier parts
	 * overlapped somebody else. A receiver only ever sees a frame it heard
	 * cleanly from beginning to end.
	 */
	complete(): Part | null {
		const now = this.at(0);
		if (now.length !== 1) return null;
		const f = now[0];
		if (f.part !== f.len) return null;
		for (let i = 1; i < f.len; i += 1) if (this.at(-i).length > 1) return null;
		return f;
	}

	/** What `from` is putting on the air right now. */
	emitting(from: number): Part | null {
		return this.at(0).find((f) => f.from === from) ?? null;
	}

	advance() {
		this.pos += 1;
		this.slots[this.idx(FUTURE)] = [];
	}
}

abstract class Node {
	medium = new Medium();
	listeners: Node[] = [];
	readonly id: number;
	protected sending = 0;

	constructor(id: number) {
		this.id = id;
	}

	/** What this node is transmitting in the current slot. */
	frameType(): FrameType {
		return this.medium.emitting(this.id)?.type ?? Frame.None;
	}

	abstract carrierType(): CarrierType;
	abstract counting(): boolean;
	abstract step(): void;

	sample(): Sample {
		return { frame: this.frameType(), carrier: this.carrierType(), counting: this.counting() };
	}

	/**
	 * Put a frame on the air after `delay` slots. It is written into every
	 * listener's medium and into this node's own, so a node hears itself.
	 */
	protected send(frame: Part, delay: number) {
		for (const target of [...this.listeners, this]) {
			const distance = target === this ? 0 : PROP;
			for (let i = 0; i < frame.len; i += 1) {
				target.medium.put({ ...frame, part: i + 1 }, delay + distance + i);
			}
		}
		this.sending = frame.len + delay;
	}

	protected sent() {
		return this.sending <= 0;
	}

	advance() {
		this.medium.advance();
		this.sending -= 1;
	}
}

const S = {
	Idle: 0,
	Sense: 1,
	Transmit: 2,
	Sending: 3,
	AwaitReply: 4,
	BackoffDraw: 5,
	BackoffDifs: 6,
	CountDown: 7,
} as const;

export class Station extends Node {
	queue = 0;
	private readonly rng: Rng;
	/** Frames this station got an ACK for. Not shown, but useful to assert on. */
	delivered = 0;
	private state: number = S.Idle;
	private collisions = 0;
	private gotCts = false;
	private justDelivered = false;
	private nav = 0;
	private difs = 0;
	private replyTimeout = 0;
	private countdown = 0;
	private isCounting = false;
	private readonly dest = 3;

	constructor(id: number, rng: Rng = Math.random) {
		super(id);
		this.rng = rng;
	}

	enqueue() {
		this.queue += 1;
	}

	backoff() {
		return Math.max(this.countdown, 0);
	}

	navLeft() {
		return Math.max(this.nav, 0);
	}

	counting() {
		return this.isCounting;
	}

	private busy() {
		return !this.medium.free() || this.nav > 0;
	}

	carrierType(): CarrierType {
		if (this.nav > 0) return Carrier.Nav;
		if (!this.medium.free() || this.frameType() !== Frame.None) return Carrier.Busy;
		return Carrier.Free;
	}

	/**
	 * Virtual carrier sense. An RTS or CTS addressed to somebody else carries how
	 * long the exchange will take, and overhearing it is what keeps a hidden
	 * station quiet.
	 */
	private readNav() {
		const f = this.medium.complete();
		if (!f || f.from === this.id) return;
		if ((f.type === Frame.Rts || f.type === Frame.Cts) && f.to !== this.id) {
			if (f.nav > this.nav) this.nav = f.nav;
		}
	}

	step() {
		this.nav -= 1;
		this.isCounting = false;

		// The state machine runs to completion each slot: several of these states
		// are pure transitions that must not cost a slot of their own.
		for (;;) {
			switch (this.state) {
				case S.Idle: {
					this.collisions = 0;
					this.gotCts = false;
					this.justDelivered = false;
					this.readNav();
					if (this.queue === 0) return;
					this.difs = DIFS;
					this.state = S.Sense;
					continue;
				}

				case S.Sense: {
					this.readNav();
					if (this.busy()) {
						this.state = S.BackoffDraw;
						return;
					}
					if (this.medium.free() && this.countdown <= 0 && this.difs <= 0) {
						this.state = S.Transmit;
						continue;
					}
					if (this.countdown > 0) {
						this.countdown -= 1;
						this.isCounting = true;
					} else {
						this.difs -= 1;
					}
					return;
				}

				case S.Transmit: {
					if (!this.gotCts) {
						// The reservation covers CTS, data and ACK, plus the three SIFS
						// gaps between them.
						const nav = 3 * SIFS + CTRL_LEN + DATA_LEN + 3;
						this.send(
							{ type: Frame.Rts, len: CTRL_LEN, part: 1, from: this.id, to: this.dest, nav },
							SIFS
						);
					} else {
						this.send(
							{ type: Frame.Data, len: DATA_LEN, part: 1, from: this.id, to: this.dest, nav: 0 },
							SIFS
						);
					}
					this.state = S.Sending;
					continue;
				}

				case S.Sending: {
					if (this.sent()) {
						this.state = S.AwaitReply;
						this.replyTimeout = REPLY_TIMEOUT;
					}
					return;
				}

				case S.AwaitReply: {
					this.readNav();
					this.replyTimeout -= 1;
					const f = this.medium.complete();

					if (f && f.from !== this.id && (f.type === Frame.Cts || f.type === Frame.Ack)) {
						if (!this.gotCts) {
							if (f.type !== Frame.Cts || f.to !== this.id) return;
							this.gotCts = true;
							this.state = S.Transmit;
							continue;
						}
						if (f.type !== Frame.Ack || f.to !== this.id) return;
						// Delivered. Back off once more before the next frame, so one
						// station cannot hold the medium by sending back to back.
						this.collisions = 0;
						this.justDelivered = true;
						this.queue -= 1;
						this.delivered += 1;
						this.state = S.BackoffDraw;
						return;
					}

					// Silence where a reply should have been means the frame was lost.
					if (this.replyTimeout === 0) {
						this.collisions += 1;
						this.state = S.BackoffDraw;
					}
					return;
				}

				case S.BackoffDraw: {
					if (this.countdown <= 0) {
						const cw = Math.min(Math.max(2 ** this.collisions - 1, CW_MIN), CW_MAX);
						this.countdown = randInt(this.rng, cw);
					}
					this.difs = DIFS;
					this.state = S.BackoffDifs;
					continue;
				}

				case S.BackoffDifs: {
					this.readNav();
					if (this.busy()) {
						this.difs = DIFS;
						return;
					}
					if (this.difs-- > 0) return;
					this.state = S.CountDown;
					continue;
				}

				case S.CountDown: {
					this.readNav();
					if (this.busy()) {
						// The counter freezes rather than resetting, which is why a station
						// that has already waited keeps its place in the queue.
						this.difs = DIFS;
						this.state = S.BackoffDifs;
						return;
					}
					this.isCounting = true;
					this.countdown -= 1;
					if (this.countdown > 0) return;
					this.isCounting = false;
					this.state = this.justDelivered ? S.Idle : S.Transmit;
					continue;
				}
			}
		}
	}
}

const R = { Wait: 0, Reply: 1, Replying: 2 } as const;

export class AccessPoint extends Node {
	private state: number = R.Wait;
	private received: Part | null = null;
	private reservedFor = -1;

	counting() {
		return false;
	}

	carrierType(): CarrierType {
		return this.medium.free() && this.frameType() === Frame.None ? Carrier.Free : Carrier.Busy;
	}

	step() {
		for (;;) {
			switch (this.state) {
				case R.Wait: {
					const f = this.medium.complete();
					if (!f || f.from === this.id) return;
					this.received = f;
					this.state = R.Reply;
					continue;
				}

				case R.Reply: {
					const got = this.received!;
					// Once the medium is reserved for one station, everybody else is
					// ignored until that exchange finishes.
					if (this.reservedFor !== -1 && got.from !== this.reservedFor) {
						this.state = R.Wait;
						return;
					}
					if (got.type === Frame.Rts) {
						this.reservedFor = got.from;
						this.send(
							{
								type: Frame.Cts,
								len: CTRL_LEN,
								part: 1,
								from: this.id,
								to: got.from,
								nav: got.nav - CTRL_LEN - SIFS,
							},
							SIFS
						);
					} else if (got.type === Frame.Data) {
						this.send(
							{ type: Frame.Ack, len: CTRL_LEN, part: 1, from: this.id, to: got.from, nav: 0 },
							SIFS
						);
					} else {
						this.state = R.Wait;
						return;
					}
					this.state = R.Replying;
					continue;
				}

				case R.Replying: {
					if (!this.sent()) return;
					if (this.received!.type === Frame.Data) this.reservedFor = -1;
					this.state = R.Wait;
					continue;
				}
			}
		}
	}
}

export class Simulation {
	readonly stations: Station[];
	readonly ap: AccessPoint;
	readonly nodes: Node[];

	/**
	 * @param hiddenTerminals when true the stations reach the access point and
	 * nothing else, so none of them can sense any of the others.
	 * @param rng backoff randomness; pass a seeded generator for a repeatable run.
	 */
	constructor(hiddenTerminals = false, rng: Rng = Math.random) {
		this.stations = [0, 1, 2].map((i) => new Station(i, rng));
		this.ap = new AccessPoint(3);
		this.nodes = [...this.stations, this.ap];

		if (hiddenTerminals) {
			for (const s of this.stations) {
				s.listeners = [this.ap];
				this.ap.listeners.push(s);
			}
		} else {
			for (const a of this.nodes) a.listeners = this.nodes.filter((b) => b !== a);
		}
	}

	/** Advance one slot and return what each node did in it. */
	step(): Sample[] {
		for (const n of this.nodes) n.step();
		const samples = this.nodes.map((n) => n.sample());
		for (const n of this.nodes) n.advance();
		return samples;
	}
}
