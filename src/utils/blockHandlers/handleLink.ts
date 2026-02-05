/* * */

import type { BlockHandlerContext } from './types';
import type { LexicalNode } from '@/types';

import { paragraphNode, payloadLinkBlockNode } from '@/components';
import { hasMeaningfulInline } from '@/utils/hasMeaningfulInline';
import { isValidHttpUrl } from '@/utils/isValidHttpUrl';
import { normalizeText } from '@/utils/normalizeText';
import { parseInline } from '@/utils/parseInline';
import { resolveUrl } from '@/utils/resolveUrl';

/* * */

export function handleLink(el: Element, ctx: BlockHandlerContext): LexicalNode[] | null {
	//

	//
	// A. Setup Variables

	const { baseOrigin, log } = ctx;
	const trimmedHref = (el.getAttribute('href') ?? '').trim();
	const trimmedResolved = resolveUrl(trimmedHref, baseOrigin)?.trim() ?? '';

	//
	// B. Transform Data

	const inline = parseInline(el, 0, log, baseOrigin);
	const linkText = normalizeText(el.textContent ?? '').trim() || trimmedResolved;
	const newTab = el.getAttribute('target') === '_blank';

	//
	// C. Return

	if (!trimmedHref || !isValidHttpUrl(trimmedResolved)) {
		if (!trimmedHref) {
			log?.('debug', 'block: <a> skipped (no href)', { href: el.getAttribute('href') });
		} else {
			log?.('debug', 'block: <a> skipped (invalid URL)', { href: trimmedHref, resolvedUrl: trimmedResolved });
		}

		return hasMeaningfulInline(inline) ? [paragraphNode(inline)] : [];
	}

	log?.('info', 'block: <a> -> link block', { href: trimmedHref, resolvedUrl: trimmedResolved, text: linkText });
	return [payloadLinkBlockNode(trimmedResolved, linkText, newTab)];

	//
}

/* * */
