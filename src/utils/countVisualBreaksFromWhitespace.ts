/* * */

import { clampInt } from '@/utils';

/* * */

export function countVisualBreaksFromWhitespace(raw: string): number {
	//

	//
	// A. Setup Variables

	const s = raw.replace(/\r\n/g, '\n');
	const matches = s.match(/\n[ \t]*\n/g);
	const breaks = matches?.length ?? 0;
	const fallback = breaks === 0 && s.includes('\n') ? 1 : breaks;

	//
	// B. Return

	return clampInt(fallback, 0, 6);

	//
}
