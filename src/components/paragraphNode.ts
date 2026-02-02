/* * */

import { LexicalNode } from '@/types';

/* * */

export function paragraphNode(children: LexicalNode[]): LexicalNode {
	//

	//
	// A. Return

	return {
		children,
		direction: null,
		format: '',
		indent: 0,
		type: 'paragraph',
		version: 1,
	};

	//
}
