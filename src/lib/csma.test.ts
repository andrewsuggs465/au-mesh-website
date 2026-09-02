/**
 * Checks on the CSMA/CA model. No test framework: run it with `npm test`, which
 * is `node --experimental-strip-types`.
 *
 * The animation is the only place this model is used, and a browser cannot be
 * asked whether a backoff counter froze, so the protocol behaviour is pinned
 * here instead.
 */
import { Simulation, Frame, Carrier, type Rng } from './csma.ts';

/** mulberry32, so every run draws the same backoffs. */
function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAME = ['none','RTS','CTS','DATA','ACK'];
let failures = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failures++;
};

// ── 1. a single frame completes the RTS / CTS / DATA / ACK exchange ──
{
  const sim = new Simulation(false, seeded(1));
  sim.stations[0].enqueue();
  const seq: string[] = [];
  for (let t = 0; t < 400; t++) {
    const s = sim.step();
    for (let n = 0; n < 4; n++) {
      const f = s[n].frame;
      if (f !== Frame.None) {
        const tag = `${n === 3 ? 'AP' : 'ABC'[n]}:${NAME[f]}`;
        if (seq[seq.length - 1] !== tag) seq.push(tag);
      }
    }
  }
  check('A: full exchange in order', seq.join(' ') === 'A:RTS AP:CTS A:DATA AP:ACK', seq.join(' '));
  check('A: queue drained', sim.stations[0].queue === 0 && sim.stations[0].delivered === 1);
}

// ── 2. frame lengths match the TKN timings ──
{
  const sim = new Simulation(false, seeded(1));
  sim.stations[0].enqueue();
  const runs = new Map<number, number>();
  for (let t = 0; t < 400; t++) {
    const s = sim.step();
    for (let n = 0; n < 4; n++) if (s[n].frame !== Frame.None) runs.set(s[n].frame, (runs.get(s[n].frame) ?? 0) + 1);
  }
  check('RTS is 10 slots', runs.get(Frame.Rts) === 10, String(runs.get(Frame.Rts)));
  check('CTS is 10 slots', runs.get(Frame.Cts) === 10, String(runs.get(Frame.Cts)));
  check('DATA is 80 slots', runs.get(Frame.Data) === 80, String(runs.get(Frame.Data)));
  check('ACK is 10 slots', runs.get(Frame.Ack) === 10, String(runs.get(Frame.Ack)));
}

// ── 3. an idle station that overhears the exchange sets its NAV ──
{
  const sim = new Simulation(false, seeded(1));
  sim.stations[0].enqueue();
  let bNav = 0, bBusyOnly = 0;
  for (let t = 0; t < 300; t++) {
    const s = sim.step();
    if (s[1].carrier === Carrier.Nav) bNav++;
    if (s[1].carrier === Carrier.Busy) bBusyOnly++;
  }
  check('B holds off on NAV while A transmits', bNav > 50, `${bNav} slots NAV, ${bBusyOnly} busy`);
}

// ── 4. hidden terminals: B cannot sense A, but the CTS still silences it ──
{
  const sim = new Simulation(true, seeded(1));
  sim.stations[0].enqueue();
  let bNav = 0, bPhysicalBusy = 0;
  for (let t = 0; t < 300; t++) {
    const s = sim.step();
    if (s[1].carrier === Carrier.Nav) bNav++;
    if (s[1].carrier === Carrier.Busy) bPhysicalBusy++;
  }
  check('hidden B never hears A directly on data', bPhysicalBusy < 40, `${bPhysicalBusy} busy slots (CTS+ACK from AP only)`);
  check('hidden B is silenced by the AP CTS', bNav > 50, `${bNav} slots NAV`);
}

// ── 5. three stations contending all get through, hidden or not ──
for (const hidden of [false, true]) {
  const sim = new Simulation(hidden, seeded(7));
  for (const s of sim.stations) { s.enqueue(); s.enqueue(); }
  let collisionSlots = 0;
  for (let t = 0; t < 20000; t++) {
    const s = sim.step();
    if (s.filter((x) => x.frame !== Frame.None).length > 1) collisionSlots++;
  }
  const delivered = sim.stations.map((s) => s.delivered);
  check(
    `${hidden ? 'hidden  ' : 'visible '} all six frames delivered, nobody starved`,
    delivered.every((d) => d === 2),
    `delivered=${delivered.join(',')} overlapSlots=${collisionSlots}`
  );
}

// ── 6. backoff counter freezes rather than restarting ──
{
  const sim = new Simulation(false, seeded(1));
  sim.stations[0].enqueue();
  sim.stations[1].enqueue();
  let sawFreeze = false, prev = -1, frozenFor = 0;
  for (let t = 0; t < 2000; t++) {
    sim.step();
    const b = sim.stations[1].backoff();
    if (b > 0 && b === prev) { frozenFor++; if (frozenFor > 20) sawFreeze = true; }
    else frozenFor = 0;
    prev = b;
  }
  check('backoff freezes while the medium is busy', sawFreeze);
}

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
