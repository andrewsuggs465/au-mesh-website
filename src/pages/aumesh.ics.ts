/**
 * The whole club calendar as a subscribable feed at /aumesh.ics.
 *
 * Subscribing by URL beats a one-off import: the workflow rebuilds weekly, so
 * anyone subscribed picks up new events without doing anything. It also lands
 * in its own "AU Mesh Club" calendar rather than mixing into a personal one.
 */
import type { APIRoute } from 'astro';
import { allEntries, toIcs } from '../lib/calendar';

export const GET: APIRoute = ({ site }) => {
	const base = site ? site.origin : 'https://aumesh.club';
	return new Response(toIcs(allEntries(), base), {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="aumesh.ics"',
		},
	});
};
