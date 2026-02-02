/* * */

import { LexicalNode } from '@/types';

/* * */

export function payloadBlockNode(fields: Record<string, unknown>): LexicalNode {
	//

	//
	// A. Return

	return {
		fields,
		format: '',
		type: 'block',
		version: 2,
	};

	//
}
