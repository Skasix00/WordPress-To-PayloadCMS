/* * */

import { LexicalNode } from '@/types/LexicalNode';

/* * */

export function addPaddingBottom(node: LexicalNode, px: number): void {
	//

	//
	// A. Setup Variables

	const existing = (node.style ?? '').trim();

	//
	// B. Return

	node.style = existing ? `${existing}; padding-bottom: ${px}px` : `padding-bottom: ${px}px`;

	//
}
