/* * */

import { DomElement, LexicalNode, LogFn } from '@/types';
import { parseInline } from '@/utils';

/* * */

export function flattenInlineChildren(el: DomElement, inheritedFormat: number, log?: LogFn, baseOrigin = ''): LexicalNode[] {
	//

	//
	// A. Setup Variables

	const out: LexicalNode[] = [];

	//
	// B. Transform Data

	for (const child of Array.from(el.childNodes)) {
		out.push(...parseInline(child, inheritedFormat, log, baseOrigin));
	}

	//
	// C. Return

	return out;

	//
}
