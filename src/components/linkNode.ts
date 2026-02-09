/* * */

import { LexicalNode } from '@/types';

/* * */

export function linkNode(url: string, children: LexicalNode[], newTab = false): LexicalNode {
	//

	//
	// A. Setup Variables

	const trimmedUrl = url?.trim() ?? '';
	const validUrl = trimmedUrl && /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : 'https://www.carrismetropolitana.pt';

	//
	// B. Return

	return {
		children,
		direction: 'ltr',
		fields: { linkType: 'custom', newTab, url: validUrl },
		format: '',
		indent: 0,
		type: 'link',
		version: 1,
	};

	//
}
