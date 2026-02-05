/* * */

import type { LexicalNode, LogFn } from '@/types';

import { payloadBlockNode } from '@/components';
import { asElement } from '@/utils/asElement';
import { buildAccordionLexicalContent } from '@/utils/buildAccordionLexicalContent';
import { normalizeText } from '@/utils/normalizeText';

/* * */

export function parseDetailsToAccordion(el: Element, log?: LogFn): LexicalNode | null {
	const summaryRaw = el.querySelector('summary');
	const summaryEl = asElement(summaryRaw);
	const title = normalizeText(summaryEl?.textContent ?? '').trim();

	// Skip empty accordions
	if (!title) {
		log?.('debug', 'block: <details> skipped (empty title)', {});
		return null;
	}

	const cloneRaw = el.cloneNode(true);
	const cloneEl = asElement(cloneRaw);

	if (!cloneEl) {
		return null;
	}

	const summaryToRemoveRaw = cloneEl.querySelector('summary');
	const removeFn = (summaryToRemoveRaw as unknown as { remove?: () => void }).remove;

	if (typeof removeFn === 'function') removeFn.call(summaryToRemoveRaw);

	const contentText = normalizeText(cloneEl.textContent ?? '').trim();
	const content = buildAccordionLexicalContent(contentText, log);

	const mentionCount = (content.root as { children: LexicalNode[] }).children
		.flatMap(p => (p.children as LexicalNode[]) || [])
		.filter(n => n.type === 'mention').length;

	log?.('info', 'block: <details> -> accordion (richText)', {
		mentionCount,
		title,
	});

	const accordionItem: Record<string, unknown> = { content, title };

	return payloadBlockNode({
		accordion: [accordionItem],
		blockName: 'Accordion',
		blockType: 'accordion',
	});
}

/* * */
