/* * */

import { linebreakNode, mentionNode } from '@/components';
import { NODE_TYPE, TEXT_FORMAT } from '@/config/consts';
import { LexicalNode, LogFn } from '@/types';
import { applyFormat, applyStyle, asElement, flattenInlineChildren, getNodeType, hasTextContent, normalizeText, parseBackgroundColorFromStyle, parseLineMentionFromText, parseTextIntoNodesWithMentions, resolveUrl } from '@/utils';

/* * */

function withFormat(el: Element, inheritedFormat: number, format: number, log?: LogFn, baseOrigin = ''): LexicalNode[] {
	const out = flattenInlineChildren(el, inheritedFormat, log, baseOrigin);
	applyFormat(out, format);
	return out;
}

export function parseInline(node: unknown, inheritedFormat = 0, log?: LogFn, baseOrigin = ''): LexicalNode[] {
	//

	//
	// A. Setup Variables

	const nodeType = getNodeType(node);
	const el = asElement(node);
	const tag = el.tagName.toLowerCase();

	//
	// B. Transform Data

	if (nodeType === NODE_TYPE.TEXT && hasTextContent(node)) {
		return parseTextIntoNodesWithMentions(String(node.textContent ?? ''), inheritedFormat, log);
	}

	//
	// C. Return

	if (!el) return [];

	if (tag === 'br') {
		log?.('debug', 'inline: <br> -> linebreak');
		return [linebreakNode()];
	}

	if (tag === 'strong' || tag === 'b') return withFormat(el, inheritedFormat, TEXT_FORMAT.BOLD, log, baseOrigin);

	if (tag === 'em' || tag === 'i') return withFormat(el, inheritedFormat, TEXT_FORMAT.ITALIC, log, baseOrigin);

	if (tag === 'u') return withFormat(el, inheritedFormat, TEXT_FORMAT.UNDERLINE, log, baseOrigin);

	if (tag === 's' || tag === 'del' || tag === 'strike') return withFormat(el, inheritedFormat, TEXT_FORMAT.STRIKETHROUGH, log, baseOrigin);

	if (tag === 'code') return withFormat(el, inheritedFormat, TEXT_FORMAT.CODE, log, baseOrigin);

	if (tag === 'mark') {
		const out = flattenInlineChildren(el, inheritedFormat, log, baseOrigin);
		const styleAttr = el.getAttribute('style');
		const bgStyle = parseBackgroundColorFromStyle(styleAttr);
		if (bgStyle) {
			applyStyle(out, bgStyle);
			log?.('debug', 'inline: <mark> -> background', { style: bgStyle });
		}
		return out;
	}

	if (tag === 'a') {
		const linkText = normalizeText(el.textContent ?? '').trim();

		const parsed = parseLineMentionFromText(linkText);
		if (parsed) {
			log?.('info', 'inline: <a> -> mention (text-only)', { id: parsed.id, label: parsed.label });
			return [mentionNode(parsed.id, parsed.label, 'line')];
		}

		const href = el.getAttribute('href') ?? '';
		if (!href?.trim()) return flattenInlineChildren(el, inheritedFormat, log, baseOrigin);

		const resolvedUrl = resolveUrl(href.trim(), baseOrigin);

		const trimmedResolved = resolvedUrl?.trim() ?? '';
		if (!trimmedResolved || !/^https?:\/\//i.test(trimmedResolved)) {
			log?.('debug', 'inline: <a> skipped (invalid URL)', { href, resolvedUrl: trimmedResolved });
			return flattenInlineChildren(el, inheritedFormat, log, baseOrigin);
		}

		try {
			new URL(trimmedResolved);
		} catch {
			log?.('debug', 'inline: <a> skipped (URL parse error)', { href, resolvedUrl: trimmedResolved });
			return flattenInlineChildren(el, inheritedFormat, log, baseOrigin);
		}
		log?.('debug', 'inline: <a> -> text (Payload does not support inline links)', { href, resolvedUrl: trimmedResolved, text: linkText });

		return flattenInlineChildren(el, inheritedFormat, log, baseOrigin);
	}

	return flattenInlineChildren(el, inheritedFormat, log, baseOrigin);

	//
}
