/* * */

import { LexicalNode } from '@/types';

/* * */

export function mentionNode(id: string, label: string, mentionType = 'line'): LexicalNode {
	//

	//
	// A. Return

	return {
		id,
		label,
		mentionType,
		type: 'mention',
		version: 1,
	};

	//
}
