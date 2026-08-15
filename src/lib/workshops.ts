import workshops from '../data/workshops.yaml';
import { eventDate, type ClubEvent } from './events';

const all = workshops as ClubEvent[];

function startOfTodayUTC(): number {
	const now = new Date();
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function upcomingWorkshops(): ClubEvent[] {
	const today = startOfTodayUTC();
	const dated = all
		.filter((w) => eventDate(w) !== null && eventDate(w)!.getTime() >= today)
		.sort((a, b) => eventDate(a)!.getTime() - eventDate(b)!.getTime());
	const undated = all.filter((w) => eventDate(w) === null);
	return [...dated, ...undated];
}

export function pastWorkshops(): ClubEvent[] {
	const today = startOfTodayUTC();
	return all
		.filter((w) => eventDate(w) !== null && eventDate(w)!.getTime() < today)
		.sort((a, b) => eventDate(b)!.getTime() - eventDate(a)!.getTime());
}
