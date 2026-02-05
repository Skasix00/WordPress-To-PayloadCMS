/* * */

import type { WordPressNewsItem } from '@/types';

/* * */

export async function fetchWordPressNews(): Promise<WordPressNewsItem[]> {
	//

	//
	// A. Setup Variables

	const wpUrl = process.env.WP_NEWS_URL;

	//
	// B. Fetch Data

	const res = await fetch(wpUrl);
	if (!res.ok) throw new Error(`Failed to fetch WordPress news: ${res.status}`);

	const data = (await res.json());
	if (!Array.isArray(data)) throw new Error('Unexpected WordPress API response (expected array)');

	//
	// C. Return Data

	return data as WordPressNewsItem[];

	//
}
