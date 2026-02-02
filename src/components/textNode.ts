/* * */

import { LexicalNode } from '@/types';

/* * */

export function textNode(text: string, format = 0): LexicalNode {
	//

	//
	// A. Return

	return {
		detail: 0,
		format,
		mode: 'normal',
		style: '',
		text,
		type: 'text',
		version: 1,
	};

	//
}
