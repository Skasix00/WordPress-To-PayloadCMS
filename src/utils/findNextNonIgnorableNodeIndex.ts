/* * */

import { NODE_TYPE } from '@/config/consts';
import { DomTextNode } from '@/types';
import { getNodeType, hasTextContent, isWhitespaceOnlyText } from '@/utils';

/* * */

export function findNextNonIgnorableNodeIndex(nodes: unknown[], fromIndex: number): number {
	for (let i = fromIndex; i < nodes.length; i += 1) {
		const nt = getNodeType(nodes[i]);
		if (nt === null) continue;
		if (nt === NODE_TYPE.COMMENT) continue;

		if (nt === NODE_TYPE.TEXT && hasTextContent(nodes[i])) {
			const raw = String((nodes[i] as DomTextNode).textContent ?? '');
			if (isWhitespaceOnlyText(raw)) continue;
		}

		return i;
	}

	return -1;
}
