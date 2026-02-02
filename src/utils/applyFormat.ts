/* * */

import { LexicalNode } from '@/types';

/* * */

export function applyFormat(nodes: LexicalNode[], bit: number): void {
	//

	//
	// A. Transform Data

	for (const n of nodes) {
		if (n.type === 'text') {
			n.format = (((n.format as number) ?? 0) | bit);
		} else if (n.type === 'link' && n.children) {
			applyFormat(n.children, bit);
		}
	}

	//
}
