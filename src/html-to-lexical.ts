/* * */

import type { LexicalNode } from '@/types';

import { headingNode, horizontalRuleNode, linebreakNode, paragraphNode, payloadBlockNode } from '@/components';
import { NODE_TYPE } from '@/config/consts';
import { Options } from '@/types/Options';
import { asElement, countVisualBreaksFromWhitespace, findNextNonIgnorableNodeIndex, getNodeType, hasMeaningfulInline, hasTextContent, isWhitespaceOnlyText, isWordPressSpacer, normalizeText, parseInline, parseList, resolveUrl, spacerToBreakCount } from '@/utils';
import { JSDOM } from 'jsdom';

/* * */

export function htmlToLexical(html: string, options?: Options) {
	//

	//
	// A. Setup Variables

	const log = options?.log;
	const baseOrigin = options?.baseOrigin ?? '';
	const collectImageUrl = options?.collectImageUrl;
	const dom = new JSDOM(html);
	const document = dom.window.document;
	const children: LexicalNode[] = [];
	const topNodes = Array.from(document.body.childNodes);

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

			const inline = parseInline(node, 0, log);
			if (hasMeaningfulInline(inline)) {
				children.push(paragraphNode(inline));
			}
			continue;
		}

		const el = asElement(node);
		if (!el) continue;

		const tag = el.tagName.toLowerCase();

		if (tag === 'script') continue;

		if (isWordPressSpacer(el)) {
			const { breaks, height } = spacerToBreakCount(el);

			log?.('info', 'block: wp spacer -> linebreaks', {
				breaks,
				height,
				style: el.getAttribute('style') ?? '',
			});

			for (let i = 0; i < breaks; i += 1) {
				children.push(paragraphNode([linebreakNode()]));
			}

			continue;
		}

		if (tag === 'p') {
			const inline = parseInline(el, 0, log);
			if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
			continue;
		}

		if (/^h[1-6]$/.test(tag)) {
			const inline = parseInline(el, 0, log);
			if (hasMeaningfulInline(inline)) children.push(headingNode(tag, inline));
			continue;
		}

		if (tag === 'hr') {
			children.push(horizontalRuleNode());
			continue;
		}

		if (tag === 'ol') {
			children.push(parseList(el, 'number', 'ol', log));
			continue;
		}

		if (tag === 'ul') {
			children.push(parseList(el, 'bullet', 'ul', log));
			continue;
		}

		if (tag === 'details') {
			const summaryRaw = el.querySelector('summary');
			const summaryEl = asElement(summaryRaw);
			const title = normalizeText(summaryEl?.textContent ?? '').trim();

			const cloneRaw = el.cloneNode(true);
			const cloneEl = asElement(cloneRaw);

			if (cloneEl) {
				const summaryToRemoveRaw = cloneEl.querySelector('summary');
				const removeFn = (summaryToRemoveRaw as unknown as { remove?: () => void }).remove;

				if (typeof removeFn === 'function') removeFn.call(summaryToRemoveRaw);

				const content = normalizeText(cloneEl.textContent ?? '').trim();

				children.push(
					payloadBlockNode({
						accordion: [
							{
								content,
								title,
							},
						],
						blockName: 'FAQ',
						blockType: 'accordion',
					}),
				);

				continue;
			}
		}

		if (tag === 'figure') {
			const imgRaw = el.querySelector('img');
			const imgEl = asElement(imgRaw);
			const imgSrc = imgEl?.getAttribute('src') ?? null;

			if (imgSrc) {
				collectImageUrl?.(resolveUrl(imgSrc, baseOrigin));
				log?.('info', 'block: <figure><img> skipped (images disabled)', { src: imgSrc });
				continue;
			}

			const videoRaw = el.querySelector('video');
			const videoEl = asElement(videoRaw);
			const videoSrc = videoEl?.getAttribute('src') ?? null;

			if (videoSrc) {
				log?.('info', 'block: <figure><video> -> video block', { src: videoSrc });
				children.push(
					payloadBlockNode({
						blockName: '',
						blockType: 'video',
						caption: '',
						source: 'external',
						videoUrl: videoSrc,
					}),
				);
				continue;
			}
		}

		const inline = parseInline(el, 0, log);
		if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
	}

	//
	// C. Return

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
