/* * */

import { WordpressNews } from '@/types';

/* * */

interface WordpressNewsApiResponse {
	data?: unknown
}

export async function fetchWordpressNews(url: string): Promise<WordpressNews[]> {
	//

	//
	// A. Setup Variables

	let res: Response;
	let data: unknown;

	//
	// B. Fetch Data

	if (!url?.trim()) throw new Error('fetchWordpressNews: URL is required');

	try {
		res = await fetch(url);
	} catch (err) {
		throw new Error(`fetchWordpressNews: Network error: ${err instanceof Error ? err.message : String(err)}`);
	}

	if (!res.ok) throw new Error(`fetchWordpressNews: Failed to fetch (${res.status}): ${res.statusText}`);

	//
	// C. Parse Response

	try {
		data = await res.json();
	} catch (err) {
		throw new Error(`fetchWordpressNews: Invalid JSON response: ${err instanceof Error ? err.message : String(err)}`);
	}

	//
	// D. Normalise Shape

	let items: unknown;

	// Support both `[ ... ]` and `{ data: [ ... ] }` shapes
	if (Array.isArray(data)) {
		items = data;
	} else if (data && typeof data === 'object' && 'data' in (data as WordpressNewsApiResponse)) {
		items = (data as WordpressNewsApiResponse).data;
	} else {
		throw new Error('fetchWordpressNews: Unexpected response shape (expected array or { data })');
	}

	if (!Array.isArray(items)) {
		throw new Error('fetchWordpressNews: Expected "data" to be an array');
	}

	//
	// E. Return

	return items as WordpressNews[];

	//
}
