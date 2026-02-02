/* * */

import type { LexicalNode, LogFn } from '@/types';

import { linebreakNode, mentionNode, textNode } from '@/components';
import { normalizeText } from '@/utils';

/* * */

export function parseTextIntoNodesWithMentions(raw: string, inheritedFormat: number, log?: LogFn): LexicalNode[] {
	const text = normalizeText(raw);
	if (!text) return [];

	const lines = text.split('\n');
	const out: LexicalNode[] = [];

	const mentionRe = /:?\b(\d{3,6})\s*\|\s*([^\n]+)$/;

	for (let li = 0; li < lines.length; li += 1) {
		const line = lines[li];

		if (line.length === 0) {
			out.push(linebreakNode());
			continue;
		}

		const m = line.match(mentionRe);

		if (m) {
			const fullStart = m.index ?? 0;
			const before = line.slice(0, fullStart);
			const id = m[1];
			const label = String(m[2] ?? '').trim();

			if (before.length > 0) out.push(textNode(before, inheritedFormat));

			log?.('info', 'inline: mention from text', { id, label });
			out.push(mentionNode(id, label, 'line'));
		} else {
			out.push(textNode(line, inheritedFormat));
		}

		if (li < lines.length - 1) out.push(linebreakNode());
	}

	return out;
}
