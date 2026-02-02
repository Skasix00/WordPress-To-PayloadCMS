/* * */

import type { CssLength } from '@/types';

/* * */

export function parseCssHeightFromStyle(style: string): CssLength | null {
	//

	//
	// A. Fetch Data

	const match = style.match(/height\s*:\s*([0-9]*\.?[0-9]+)\s*(px|em|rem|vh|vw|%)?/i);
	const unitRaw = (match[2] ?? 'px').toLowerCase();
	const value = Number(match[1]);

	//
	// B. Return

	if (!match) return null;

	if (!Number.isFinite(value)) return null;

	if (
		unitRaw !== 'px'
		&& unitRaw !== 'em'
		&& unitRaw !== 'rem'
		&& unitRaw !== 'vh'
		&& unitRaw !== 'vw'
		&& unitRaw !== '%'
	) return null;

	return { unit: unitRaw, value };

	//
}
