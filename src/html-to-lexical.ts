/* * */

import type { LexicalNode } from '@/types';

import { headingNode, horizontalRuleNode, linebreakNode, paragraphNode } from '@/components';
import { NODE_TYPE } from '@/config/consts';
import { Options } from '@/types/Options';
import { asElement, countVisualBreaksFromWhitespace, findNextNonIgnorableNodeIndex, getNodeType, hasMeaningfulInline, hasTextContent, isWhitespaceOnlyText, isWordPressSpacer, normalizeText, parseInline, parseList, spacerToBreakCount } from '@/utils';
import { handleDiv } from '@/utils/blockHandlers/handleDiv';
import { handleFigure } from '@/utils/blockHandlers/handleFigure';
import { handleLink } from '@/utils/blockHandlers/handleLink';
import { parseDetailsToAccordion } from '@/utils/parseDetailsToAccordion';
import { JSDOM } from 'jsdom';

/* * */

function addPaddingTop(node: LexicalNode, px = 20): void {
	const existing = (node.style ?? '').trim();
	node.style = existing ? `${existing}; padding-top: ${px}px` : `padding-top: ${px}px`;
}

export function htmlToLexical(html: string, options?: Options) {
	//

	//
	// A. Setup Variables

	const log = options?.log;
	const baseOrigin = options?.baseOrigin ?? '';
	const collectImageUrl = options?.collectImageUrl;
	const urlToMediaDoc = options?.urlToMediaDoc;
	const dom = new JSDOM(html);
	const document = dom.window.document;
	const children: LexicalNode[] = [];
	const topNodes = Array.from(document.body.childNodes);
	const ctx = { baseOrigin, collectImageUrl, log, urlToMediaDoc };

	//
	// B. Transform Data

	for (let idx = 0; idx < topNodes.length; idx += 1) {
		const node = topNodes[idx];
		const nodeType = getNodeType(node);

		if (nodeType === NODE_TYPE.COMMENT) continue;

		if (nodeType === NODE_TYPE.TEXT && hasTextContent(node)) {
			const raw = String(node.textContent ?? '');
			const normalized = normalizeText(raw);

			if (isWhitespaceOnlyText(normalized)) {
				if (children.length === 0) continue;

				const nextIdx = findNextNonIgnorableNodeIndex(topNodes, idx + 1);
				if (nextIdx === -1) continue;

				const breaks = countVisualBreaksFromWhitespace(normalized);
				if (breaks > 0) {
					log?.('info', 'block: inter-block whitespace -> linebreaks', { breaks });
					for (let i = 0; i < breaks; i += 1) {
						children.push(paragraphNode([linebreakNode()]));
					}
				}

				continue;
			}

			const inline = parseInline(node, 0, log, baseOrigin);
			if (hasMeaningfulInline(inline)) {
				children.push(paragraphNode(inline));
			}
			continue;
		}

		const el = asElement(node);
		if (!el) continue;

		const tag = el.tagName.toLowerCase();

		// Handle script
		if (tag === 'script') {
			log?.('debug', 'block: <script> skipped', {});
			continue;
		}

		// Handle div
		if (tag === 'div') {
			const result = handleDiv(el, ctx);
			if (result) {
				children.push(...result);
				continue;
			}
		}

		// Handle WordPress spacer
		if (isWordPressSpacer(el)) {
			const { breaks, height } = spacerToBreakCount(el);
			log?.('info', 'block: wp spacer -> linebreaks', { breaks, height, style: el.getAttribute('style') ?? '' });
			for (let i = 0; i < breaks; i += 1) {
				children.push(paragraphNode([linebreakNode()]));
			}
			continue;
		}

		// Handle paragraph
		if (tag === 'p') {
			const inline = parseInline(el, 0, log, baseOrigin);
			if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
			continue;
		}

		// Handle headings
		if (/^h[1-6]$/.test(tag)) {
			const inline = parseInline(el, 0, log, baseOrigin);
			if (hasMeaningfulInline(inline)) children.push(headingNode(tag, inline));
			continue;
		}

		// Handle horizontal rule
		if (tag === 'hr') {
			children.push(horizontalRuleNode());
			continue;
		}

		// Handle ordered list
		if (tag === 'ol') {
			children.push(parseList(el, 'number', 'ol', log, baseOrigin));
			continue;
		}

		// Handle unordered list
		if (tag === 'ul') {
			children.push(parseList(el, 'bullet', 'ul', log, baseOrigin));
			continue;
		}

		// Handle block-level links
		if (tag === 'a') {
			const result = handleLink(el, ctx);
			if (result) {
				children.push(...result);
				continue;
			}
		}

		// Handle details/accordion
		if (tag === 'details') {
			const result = parseDetailsToAccordion(el, log);
			if (result) {
				children.push(result);
				continue;
			}
		}

		// Handle figure (images/videos)
		if (tag === 'figure') {
			const result = handleFigure(el, ctx);
			if (result) {
				children.push(...result);
				continue;
			}
		}

		// Fallback: parse as inline content
		const inline = parseInline(el, 0, log, baseOrigin);
		if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
	}

	//
	// C. Transform Nodes

	for (let i = 1; i < children.length; i += 1) {
		addPaddingTop(children[i]);
	}

	//
	// D. Return

	return {
		root: {
			children,
			direction: 'ltr',
			format: '',
			indent: 0,
			type: 'root',
			version: 1,
		},
	};

	//
}
