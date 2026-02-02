/* * */

import { linebreakNode, linkNode, mentionNode } from '@/components';
import { NODE_TYPE, TEXT_FORMAT } from '@/config/consts';
import { LexicalNode, LogFn } from '@/types';
import { applyFormat, asElement, flattenInlineChildren, getNodeType, hasTextContent, normalizeText, parseLineMentionFromText, parseTextIntoNodesWithMentions } from '@/utils';

/* * */

export function parseInline(node: unknown, inheritedFormat = 0, log?: LogFn): LexicalNode[] {
	//

	//
	// A. Setup Variables

	const nodeType = getNodeType(node);

	//
	// B. Transform Data

	if (nodeType === NODE_TYPE.TEXT && hasTextContent(node)) {
		return parseTextIntoNodesWithMentions(String(node.textContent ?? ''), inheritedFormat, log);
	}

	const el = asElement(node);
	if (!el) return [];

	const tag = el.tagName.toLowerCase();

	if (tag === 'br') {
		log?.('debug', 'inline: <br> -> linebreak');
		return [linebreakNode()];
	}

	if (tag === 'strong' || tag === 'b') {
		const out = flattenInlineChildren(el, inheritedFormat, log);
		applyFormat(out, TEXT_FORMAT.BOLD);
		return out;
	}

	if (tag === 'em' || tag === 'i') {
		const out = flattenInlineChildren(el, inheritedFormat, log);
		applyFormat(out, TEXT_FORMAT.ITALIC);
		return out;
	}

	if (tag === 'u') {
		const out = flattenInlineChildren(el, inheritedFormat, log);
		applyFormat(out, TEXT_FORMAT.UNDERLINE);
		return out;
	}

	if (tag === 's' || tag === 'del' || tag === 'strike') {
		const out = flattenInlineChildren(el, inheritedFormat, log);
		applyFormat(out, TEXT_FORMAT.STRIKETHROUGH);
		return out;
	}

	if (tag === 'code') {
		const out = flattenInlineChildren(el, inheritedFormat, log);
		applyFormat(out, TEXT_FORMAT.CODE);
		return out;
	}

	if (tag === 'a') {
		// Links are not coming with href. Only parse text for mention.
		const linkText = normalizeText(el.textContent ?? '').trim();

		const parsed = parseLineMentionFromText(linkText);
		if (parsed) {
			log?.('info', 'inline: <a> -> mention (text-only)', { id: parsed.id, label: parsed.label });
			return [mentionNode(parsed.id, parsed.label, 'line')];
		}

		const href = el.getAttribute('href') ?? '';
		if (!href) return flattenInlineChildren(el, inheritedFormat, log);

		const children = flattenInlineChildren(el, inheritedFormat, log);
		return [linkNode(href, children)];
	}

	//
	// C. Return

	return flattenInlineChildren(el, inheritedFormat, log);
}
