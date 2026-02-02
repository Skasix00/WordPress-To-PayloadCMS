/* * */

import { LexicalNode } from '@/types';

/* * */

export function listNode(listType: 'bullet' | 'number', tag: 'ol' | 'ul', children: LexicalNode[], start = 1): LexicalNode {
	//

	//
	// A. Return

	return {
		children,
		direction: 'ltr',
		format: '',
		indent: 0,
		listType,
		start,
		tag,
		type: 'list',
		version: 1,
	};

	//
}
