/* * */

import type { LexicalNode } from '@/types';

/* * */

export function hasMeaningfulInline(inline: LexicalNode[]): boolean {
	//

	//
	// A. Return

	return inline.some((n) => {
		if (n.type === 'linebreak') return true;
		if (n.type !== 'text') return true;
		return (n.text ?? '').trim().length > 0;
	});

	//
}
