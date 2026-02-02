/* * */

import { LexicalNode } from '@/types';

/* * */
export function linkNode(url: string, children: LexicalNode[]): LexicalNode {
	//

	//
	// A. Return

	return {
		children,
		direction: 'ltr',
		format: '',
		indent: 0,
		rel: 'noreferrer',
		target: null,
		title: null,
		type: 'link',
		url: url ? 'https://www.carrismetropolitana.pt' : url,
		version: 1,
	};

	//
}
