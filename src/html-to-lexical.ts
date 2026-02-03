/* * */

import type { LexicalNode } from '@/types';

import { headingNode, horizontalRuleNode, linebreakNode, paragraphNode, payloadBlockNode, payloadLinkBlockNode, payloadUploadNode } from '@/components';
import { NODE_TYPE, PAYLOAD_SKIP_BODY_IMAGE_BLOCKS } from '@/config/consts';
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
	const urlToMediaDoc = options?.urlToMediaDoc;
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

			const inline = parseInline(node, 0, log, baseOrigin);
			if (hasMeaningfulInline(inline)) {
				children.push(paragraphNode(inline));
			}
			continue;
		}

		const el = asElement(node);
		if (!el) continue;

		const tag = el.tagName.toLowerCase();

		if (tag === 'script') {
			log?.('debug', 'block: <script> skipped', {});
			continue;
		}

		if (tag === 'div') {
			const detailsElements = Array.from(el.querySelectorAll('details'));
			if (detailsElements.length > 0) {
				// This div contains details - process them directly and skip the wrapper
				log?.('debug', 'block: <div> contains details, processing details only', { detailsCount: detailsElements.length });
				for (const detailsEl of detailsElements) {
					const detailsTag = (detailsEl as HTMLElement).tagName.toLowerCase();
					if (detailsTag === 'details') {
						// Process this details element as an accordion
						const summaryRaw = (detailsEl as HTMLElement).querySelector('summary');
						const summaryEl = asElement(summaryRaw);
						const title = normalizeText(summaryEl?.textContent ?? '').trim();

						// Skip empty accordions
						if (!title) {
							log?.('debug', 'block: <details> skipped (empty title)', {});
							continue;
						}

						const cloneRaw = (detailsEl as HTMLElement).cloneNode(true);
						const cloneEl = asElement(cloneRaw);

						if (cloneEl) {
							const summaryToRemoveRaw = cloneEl.querySelector('summary');
							const removeFn = (summaryToRemoveRaw as unknown as { remove?: () => void }).remove;

							if (typeof removeFn === 'function') removeFn.call(summaryToRemoveRaw);

							const content = normalizeText(cloneEl.textContent ?? '').trim();

							log?.('info', 'block: <details> -> accordion', { title });

							children.push(
								payloadBlockNode({
									accordion: [{ content, title }],
									blockName: 'Accordion',
									blockType: 'accordion',
								}),
							);
						}
					}
				}
				// Skip processing the wrapper div itself
				continue;
			}
		}

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
			const inline = parseInline(el, 0, log, baseOrigin);
			if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
			continue;
		}

		if (/^h[1-6]$/.test(tag)) {
			const inline = parseInline(el, 0, log, baseOrigin);
			if (hasMeaningfulInline(inline)) children.push(headingNode(tag, inline));
			continue;
		}

		if (tag === 'hr') {
			children.push(horizontalRuleNode());
			continue;
		}

		if (tag === 'ol') {
			children.push(parseList(el, 'number', 'ol', log, baseOrigin));
			continue;
		}

		if (tag === 'ul') {
			children.push(parseList(el, 'bullet', 'ul', log, baseOrigin));
			continue;
		}

		if (tag === 'a') {
			const href = el.getAttribute('href') ?? '';
			if (!href?.trim()) {
				const inline = parseInline(el, 0, log, baseOrigin);
				if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
				continue;
			}

			const resolvedUrl = resolveUrl(href.trim(), baseOrigin);
			const trimmedResolved = resolvedUrl?.trim() ?? '';
			if (!trimmedResolved || !/^https?:\/\//i.test(trimmedResolved)) {
				log?.('debug', 'block: <a> skipped (invalid URL)', { href, resolvedUrl: trimmedResolved });
				const inline = parseInline(el, 0, log, baseOrigin);
				if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
				continue;
			}

			try {
				new URL(trimmedResolved);
			} catch {
				log?.('debug', 'block: <a> skipped (URL parse error)', { href, resolvedUrl: trimmedResolved });
				const inline = parseInline(el, 0, log, baseOrigin);
				if (hasMeaningfulInline(inline)) children.push(paragraphNode(inline));
				continue;
			}

			const linkText = normalizeText(el.textContent ?? '').trim() || trimmedResolved;
			const newTab = el.getAttribute('target') === '_blank';
			log?.('info', 'block: <a> -> link block', { href, resolvedUrl: trimmedResolved, text: linkText });
			children.push(payloadLinkBlockNode(trimmedResolved, linkText, newTab));
			continue;
		}

		if (tag === 'details') {
			const summaryRaw = el.querySelector('summary');
			const summaryEl = asElement(summaryRaw);
			const title = normalizeText(summaryEl?.textContent ?? '').trim();

			// Skip empty accordions
			if (!title) {
				log?.('debug', 'block: <details> skipped (empty title)', {});
				continue;
			}

			const cloneRaw = el.cloneNode(true);
			const cloneEl = asElement(cloneRaw);

			if (cloneEl) {
				const summaryToRemoveRaw = cloneEl.querySelector('summary');
				const removeFn = (summaryToRemoveRaw as unknown as { remove?: () => void }).remove;

				if (typeof removeFn === 'function') removeFn.call(summaryToRemoveRaw);

				const content = normalizeText(cloneEl.textContent ?? '').trim();

				log?.('info', 'block: <details> -> accordion', { title });

				children.push(
					payloadBlockNode({
						accordion: [{ content, title }],
						blockName: 'Accordion',
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
				const resolvedUrl = resolveUrl(imgSrc, baseOrigin);
				collectImageUrl?.(resolvedUrl);
				const mediaDoc = urlToMediaDoc?.(resolvedUrl);
				if (mediaDoc && !PAYLOAD_SKIP_BODY_IMAGE_BLOCKS) {
					const mediaId = (mediaDoc.id as string) ?? '';
					if (mediaId) {
						log?.('info', 'block: <figure><img> -> upload block', { mediaId, src: imgSrc });
						children.push(payloadUploadNode(mediaId));
					} else {
						log?.('warn', 'block: <figure><img> skipped (no mediaId in mediaDoc)', { src: imgSrc });
					}
				} else if (mediaDoc && PAYLOAD_SKIP_BODY_IMAGE_BLOCKS) {
					log?.('info', 'block: <figure><img> skipped (PAYLOAD_SKIP_BODY_IMAGE_BLOCKS=1)', { src: imgSrc });
				} else {
					log?.('info', 'block: <figure><img> skipped (no mediaDoc)', { src: imgSrc });
				}
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

		const inline = parseInline(el, 0, log, baseOrigin);
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
