/* * */

import { LexicalNode } from '@/types';

/* * */
export function linkNode(url: string, children: LexicalNode[]): LexicalNode {
	//

	//
	// A. Setup Variables

	const trimmedUrl = url?.trim() ?? '';
	const validUrl = trimmedUrl && /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : '';

	if (!validUrl) {
		throw new Error(`linkNode: Invalid or empty URL provided: "${url}"`);
	}

	//
	// B. Return

	return {
		children,
		direction: 'ltr',
		format: '',
		indent: 0,
		rel: 'noreferrer',
		target: null,
		title: null,
		type: 'link',
		url: validUrl,
		version: 1,
	};

	//
}
