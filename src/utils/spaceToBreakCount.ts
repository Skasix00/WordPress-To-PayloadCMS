/* * */
import type { CssLength, DomElement } from '@/types';

import { clampInt, cssLengthToApproxPx, parseCssHeightFromStyle } from '@/utils/';

/* * */

export function spacerToBreakCount(el: DomElement): { breaks: number, height?: CssLength } {
	//

	//
	// A. Fetch Data

	const style = el.getAttribute('style') ?? '';
	const height = parseCssHeightFromStyle(style);
	const approxPx = cssLengthToApproxPx(height);
	const linePx = 24;
	const raw = Math.round(approxPx / linePx);

	//
	// B. Return

	if (!height) return { breaks: 1 };

	return { breaks: clampInt(raw, 1, 12), height };
}
