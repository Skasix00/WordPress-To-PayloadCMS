/* * */

import { LexicalNode } from '@/types';

/* * */

export function headingNode(tag: string, children: LexicalNode[]): LexicalNode {
	//

	//
	// A. Return

	return {
		children,
		direction: null,
		format: '',
		indent: 0,
		tag,
		type: 'heading',
		version: 1,
	};

	//
}
