/* * */

import type { BlockHandlerContext } from '@/types';
import type { LexicalNode } from '@/types';

import { parseDetailsToAccordion } from '@/utils';

/* * */

export function handleDiv(el: Element, ctx: BlockHandlerContext): LexicalNode[] | null {
	//

	//
	// A. Setup Variables

	const { log } = ctx;
	const nodes: LexicalNode[] = [];
	const detailsElements = el.querySelectorAll('details') as NodeListOf<HTMLElement>;

	//
	// B. Render Nodes

	if (detailsElements.length === 0) {
		return null;
	}

	log?.('debug', 'block: <div> contains details, processing details only', { detailsCount: detailsElements.length });

	for (const element of detailsElements) {
		const accordionNode = parseDetailsToAccordion(element, log);
		if (accordionNode) nodes.push(accordionNode);
	}

	return nodes;
}

/* * */
