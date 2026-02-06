/* * */

import { WordpressNews } from '@/types';

/* * */

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
	// D. Return

	return data as WordpressNews[];

	//
}
