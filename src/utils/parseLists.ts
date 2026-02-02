/* * */

import type { DomElement, LexicalNode, LogFn } from '@/types';

import { listItemNode, listNode, textNode } from '@/components';
import { asElement, hasMeaningfulInline, parseInline } from '@/utils';

/* * */

export function parseList(el: DomElement, listType: 'bullet' | 'number', tag: 'ol' | 'ul', log?: LogFn): LexicalNode {
//

	//
	// A. Setup Variables

	const items: LexicalNode[] = [];
	let value = 1;

	//
	// B. Transform Data

	for (const liRaw of Array.from(el.children)) {
		const li = asElement(liRaw);
		if (!li) continue;
		if (li.tagName.toLowerCase() !== 'li') continue;

		const inline: LexicalNode[] = [];

		for (const child of Array.from(li.childNodes)) {
			const childEl = asElement(child);
			if (childEl) {
				const childTag = childEl.tagName.toLowerCase();
				if (childTag === 'ol' || childTag === 'ul') continue;
			}

			inline.push(...parseInline(child, 0, log));
		}

		const children = hasMeaningfulInline(inline) ? inline : [textNode('', 0)];

		for (const childElRaw of Array.from(li.children)) {
			const childEl = asElement(childElRaw);
			if (!childEl) continue;

			const childTag = childEl.tagName.toLowerCase();
			if (childTag === 'ol') children.push(parseList(childEl, 'number', 'ol', log));
			if (childTag === 'ul') children.push(parseList(childEl, 'bullet', 'ul', log));
		}

		items.push(listItemNode(children, value));
		if (tag === 'ol') value += 1;
	}

	return listNode(listType, tag, items, 1);
}
