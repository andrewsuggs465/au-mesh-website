import events from '../data/events.yaml';

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

const all = events as ClubEvent[];

// YAML dates parse as UTC midnight, so compare and format in UTC to
// avoid off-by-one-day shifts on the build machine.
export function eventDate(event: ClubEvent): Date | null {
	if (!event.date) return null;
	return event.date instanceof Date ? event.date : new Date(`${event.date}T00:00:00Z`);
}

export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	});
}

function startOfTodayUTC(): number {
	const now = new Date();
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Dated events from today onward (soonest first), then undated/TBD events. */
export function upcomingEvents(): ClubEvent[] {
	const today = startOfTodayUTC();
	const dated = all
		.filter((e) => eventDate(e) !== null && eventDate(e)!.getTime() >= today)
		.sort((a, b) => eventDate(a)!.getTime() - eventDate(b)!.getTime());
	const undated = all.filter((e) => eventDate(e) === null);
	return [...dated, ...undated];
}

/** Dated events before today, most recent first. */
export function pastEvents(): ClubEvent[] {
	const today = startOfTodayUTC();
	return all
		.filter((e) => eventDate(e) !== null && eventDate(e)!.getTime() < today)
		.sort((a, b) => eventDate(b)!.getTime() - eventDate(a)!.getTime());
}

/** The next dated upcoming event, if any. */
export function nextEvent(): ClubEvent | undefined {
	return upcomingEvents().find((e) => eventDate(e) !== null);
}
