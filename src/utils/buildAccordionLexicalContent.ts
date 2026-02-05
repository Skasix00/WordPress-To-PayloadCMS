/* * */

import type { LexicalNode, LogFn } from '@/types';

import { linebreakNode, mentionNode, paragraphNode, textNode } from '@/components';
import { parseLineMentionFromText } from '@/utils';

/* * */

export function buildAccordionLexicalContent(text: string, log?: LogFn): Record<string, unknown> {
	//

	//
	// A. Setup Variables

	const paragraphs: LexicalNode[] = [];
	const lines = text.split('\n');

	//
	// B. Transform Data

	for (const line of lines) {
		const trimmedLine = line.trim();

		if (!trimmedLine) {
			paragraphs.push(paragraphNode([linebreakNode()]));
			continue;
		}

		const mention = parseLineMentionFromText(trimmedLine);

		if (mention) {
			log?.('debug', 'accordion: mention found', { id: mention.id, label: mention.label });
			paragraphs.push(paragraphNode([mentionNode(mention.id, mention.label, 'line')]));
		} else {
			paragraphs.push(paragraphNode([textNode(trimmedLine, 0)]));
		}
	}

	//
	// C. Return

	return {
		root: {
			children: paragraphs.length > 0 ? paragraphs : [paragraphNode([textNode('', 0)])],
			direction: 'ltr',
			format: '',
			indent: 0,
			type: 'root',
			version: 1,
		},
	};

	//
}

/* * */
