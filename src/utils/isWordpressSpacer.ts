/* * */

import { DomElement } from '@/types';

/* * */

export function isWordPressSpacer(el: DomElement): boolean {
	//

	//
	// A. Setup Variables

	const cls = el.getAttribute('class') ?? '';

	//
	// B. Return

	if (el.tagName.toLowerCase() !== 'div') return false;

	if (cls.includes('wp-block-spacer')) return true;

	return el.classList?.contains('wp-block-spacer') === true;

	//
}
