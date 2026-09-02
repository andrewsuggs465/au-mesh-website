/**
 * The club calendar.
 *
 * `src/data/calendar.yaml` is the one list officers edit. Everything downstream
 * reads from here: the Calendar page, the homepage "next up" card, and the .ics
 * feed at /aumesh.ics.
 */
import calendarData from '../data/calendar.yaml';

/** One entry exactly as it is written in the YAML. */
export interface ClubEvent {
	title: string;
	date?: string | Date;
	dateText?: string;
	time?: string;
	location?: string;
	type?: 'meeting' | 'workshop' | 'social' | 'special';
	tentative?: boolean;
	details?: string;
	link?: string;
}

/** Auburn is on Central time. Every free-text `time:` is read in this zone. */
export const CLUB_TZ = 'America/Chicago';

export type EntryType = 'meeting' | 'workshop' | 'social' | 'special';

export interface CalendarEntry extends ClubEvent {
	/** Stable id, used for the anchor link and the iCalendar UID. */
	id: string;
	type: EntryType;
	date?: Date;
	/** Resolved start, when the `time:` field could be read. */
	start?: Date;
	end?: Date;
	/** True when there is a date but no usable time, so it is an all-day entry. */
	allDay: boolean;
}

/**
 * YAML dates parse as UTC midnight, so everything compares and formats in UTC
 * to avoid off-by-one-day shifts on whichever machine runs the build.
 */
export function eventDate(event: ClubEvent): Date | null {
	if (!event.date) return null;
	const date = event.date instanceof Date ? event.date : new Date(`${event.date}T00:00:00Z`);
	// `date: TBD` and other free text parse to an Invalid Date. Treat those the
	// same as a missing date so the entry lands in the undated group instead of
	// disappearing out of every comparison.
	return Number.isNaN(date.getTime()) ? null : date;
}

function slug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Read a wall-clock time in `tz` as a real instant.
 *
 * Treat the fields as if they were UTC, measure how far that lands from the
 * zone, then correct. Two passes settle the case where the correction itself
 * crosses a DST boundary.
 */
function zonedTimeToUtc(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	tz: string
): Date {
	const naive = Date.UTC(year, month - 1, day, hour, minute);
	let stamp = naive;
	for (let i = 0; i < 2; i += 1) {
		stamp = naive - zoneOffset(new Date(stamp), tz);
	}
	return new Date(stamp);
}

/** Milliseconds that `tz` is ahead of UTC at the given instant. */
function zoneOffset(at: Date, tz: string): number {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		hour12: false,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).formatToParts(at);
	const f = Object.fromEntries(parts.map((p) => [p.type, p.value])) as Record<string, string>;
	const asUtc = Date.UTC(
		Number(f.year),
		Number(f.month) - 1,
		Number(f.day),
		Number(f.hour) % 24,
		Number(f.minute),
		Number(f.second)
	);
	return asUtc - at.getTime();
}

/**
 * Pull clock times out of a free-text `time:` field.
 *
 * Handles the shapes the YAML actually uses: "4:00 PM", "4:00 PM - 5:00 PM",
 * "10:00 AM - 2:00 PM". Anything else falls back to an all-day entry rather
 * than guessing.
 */
function parseTimes(time: string | undefined): { h: number; m: number }[] {
	if (!time) return [];
	const found: { h: number; m: number }[] = [];
	const re = /(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/gi;
	let match: RegExpExecArray | null;
	while ((match = re.exec(time)) !== null) {
		let h = Number(match[1]) % 12;
		if (/^p/i.test(match[3])) h += 12;
		found.push({ h, m: Number(match[2] ?? 0) });
	}
	return found;
}

function toEntry(raw: ClubEvent): CalendarEntry {
	const date = eventDate(raw) ?? undefined;
	const type = (raw.type as EntryType) ?? 'meeting';
	// YAML gives back a Date object, whose default string form is a paragraph.
	// Key off the ISO day so ids stay short and stable.
	const key = date ? date.toISOString().slice(0, 10) : (raw.dateText ?? 'tbd');
	const entry: CalendarEntry = {
		...raw,
		id: slug(`${raw.title}-${key}`),
		type,
		date,
		allDay: true,
	};
	if (!date) return entry;

	const times = parseTimes(raw.time);
	if (times.length === 0) return entry;

	const y = date.getUTCFullYear();
	const mo = date.getUTCMonth() + 1;
	const d = date.getUTCDate();
	entry.start = zonedTimeToUtc(y, mo, d, times[0].h, times[0].m, CLUB_TZ);
	entry.end =
		times.length > 1
			? zonedTimeToUtc(y, mo, d, times[1].h, times[1].m, CLUB_TZ)
			: new Date(entry.start.getTime() + 60 * 60 * 1000);
	// A range that runs backwards means it crossed midnight, so push the end on
	// a day. Nothing in the file does this yet, but an evening social could.
	if (entry.end <= entry.start) entry.end = new Date(entry.end.getTime() + 24 * 60 * 60 * 1000);
	entry.allDay = false;
	return entry;
}

/**
 * Every entry, soonest first, followed by the undated ones.
 *
 * The YAML is kept in date order by hand, but sorting here means a misfiled
 * entry still lands in the right place rather than breaking the page.
 */
export function allEntries(): CalendarEntry[] {
	const all = (calendarData as ClubEvent[]).map(toEntry);
	const dated = all.filter((e) => e.date).sort((a, b) => a.date!.getTime() - b.date!.getTime());
	return [...dated, ...all.filter((e) => !e.date)];
}

function startOfTodayUtc(): number {
	const now = new Date();
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Dated entries from today onward, then undated ones. */
export function upcomingEntries(): CalendarEntry[] {
	const today = startOfTodayUtc();
	const all = allEntries();
	return [
		...all.filter((e) => e.date && e.date.getTime() >= today),
		...all.filter((e) => !e.date),
	];
}

/** Dated entries before today, most recent first. */
export function pastEntries(): CalendarEntry[] {
	const today = startOfTodayUtc();
	return allEntries()
		.filter((e) => e.date && e.date.getTime() < today)
		.reverse();
}

/** The next dated entry, if there is one. */
export function nextEntry(): CalendarEntry | undefined {
	return upcomingEntries().find((e) => e.date);
}

// ── iCalendar ──────────────────────────────────────────────────────────────

function escapeIcs(text: string): string {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r?\n/g, '\\n');
}

/** RFC 5545 wants content lines folded at 75 octets. */
function fold(line: string): string {
	if (line.length <= 75) return line;
	const out: string[] = [line.slice(0, 75)];
	let rest = line.slice(75);
	while (rest.length > 74) {
		out.push(` ${rest.slice(0, 74)}`);
		rest = rest.slice(74);
	}
	if (rest) out.push(` ${rest}`);
	return out.join('\r\n');
}

const stampUtc = (d: Date) => `${d.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
const stampDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

/** One VEVENT. Undated entries are skipped, since there is nothing to put in a calendar. */
function toVevent(entry: CalendarEntry, siteUrl: string): string[] {
	if (!entry.date) return [];

	const lines = ['BEGIN:VEVENT', `UID:${entry.id}@aumesh.club`];
	// DTSTAMP is derived from the event rather than the build clock, so a
	// rebuild that changes nothing produces a byte-identical file.
	lines.push(`DTSTAMP:${stampUtc(entry.date)}`);

	if (entry.allDay || !entry.start || !entry.end) {
		const next = new Date(entry.date.getTime() + 24 * 60 * 60 * 1000);
		lines.push(`DTSTART;VALUE=DATE:${stampDate(entry.date)}`);
		lines.push(`DTEND;VALUE=DATE:${stampDate(next)}`);
	} else {
		lines.push(`DTSTART:${stampUtc(entry.start)}`);
		lines.push(`DTEND:${stampUtc(entry.end)}`);
	}

	lines.push(`SUMMARY:${escapeIcs(entry.tentative ? `${entry.title} (tentative)` : entry.title)}`);
	if (entry.location) lines.push(`LOCATION:${escapeIcs(entry.location)}`);

	const description = [entry.details?.trim(), entry.link ? `More info: ${entry.link}` : '']
		.filter(Boolean)
		.join('\n\n');
	if (description) lines.push(`DESCRIPTION:${escapeIcs(description)}`);

	lines.push(`URL:${entry.link ?? `${siteUrl}/calendar/#${entry.id}`}`);
	// No CATEGORIES. The type is a filter on the page, but in a calendar app it
	// files the imported events under a group per type, so one download turned
	// into WORKSHOP, SOCIAL and SPECIAL sitting alongside each other. Everything
	// belongs in the one AU Mesh Club calendar that `X-WR-CALNAME` names.
	if (entry.tentative) lines.push('STATUS:TENTATIVE');
	lines.push('END:VEVENT');
	return lines;
}

/**
 * A whole calendar as iCalendar text.
 *
 * `X-WR-CALNAME` is what makes Google, Apple, and Outlook file these under
 * "AU Mesh Club" instead of dumping them into the user's default calendar.
 */
export function toIcs(entries: CalendarEntry[], siteUrl: string, name = 'AU Mesh Club'): string {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//AU Mesh Club//aumesh.club//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${escapeIcs(name)}`,
		'X-WR-CALDESC:Meetings, workshops, and events from the Auburn University Mesh Club.',
		`X-WR-TIMEZONE:${CLUB_TZ}`,
		...entries.flatMap((e) => toVevent(e, siteUrl)),
		'END:VCALENDAR',
	];
	return `${lines.map(fold).join('\r\n')}\r\n`;
}
