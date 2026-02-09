/* * */

import { LexicalNode } from '@/types/LexicalNode';

/* * */

export function addPaddingTop(node: LexicalNode, px: number): void {
	//

	//
	// A. Setup Variables

	const existing = (node.style ?? '').trim();

	//
	// B. Return

	node.style = existing ? `${existing}; padding-top: ${px}px` : `padding-top: ${px}px`;

	//
}
