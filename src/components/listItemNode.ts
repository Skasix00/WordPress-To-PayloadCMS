/* * */

import { LexicalNode } from '@/types';

/* * */

export function listItemNode(children: LexicalNode[], value: number): LexicalNode {
	//

	//
	// A.Return

	return {
		children,
		direction: 'ltr',
		format: '',
		indent: 0,
		type: 'listitem',
		value,
		version: 1,
	};

	//
}
