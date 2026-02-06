/* * */

import { CssLength } from '@/types';

/* * */

export function cssLengthToApproxPx(len: CssLength): number {
	//

	//
	// A. Return

	if (len.unit === 'px') return len.value;
	if (len.unit === 'em' || len.unit === 'rem') return len.value * 16;
	if (len.unit === 'vh' || len.unit === 'vw') return len.value * 10;
	if (len.unit === '%') return len.value * 2;

	return len.value;

	//
}
