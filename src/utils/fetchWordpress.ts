/* * */

import { WordpressNews } from '@/types';

/* * */

export async function fetchWordpressNews(url: string): Promise<WordpressNews[]> {
	//

	//
	// A. Fetch Data

	const res = await fetch(url);

	//
	// B. Transform Data

	const data = (await res.json()) as unknown;

	//
	// C. Return

	if (!res.ok) throw new Error(`Failed to fetch WP news (${res.status})`);

	if (!Array.isArray(data)) throw new Error('WP news response is not an array');

	return data as WordpressNews[];

	//
}
