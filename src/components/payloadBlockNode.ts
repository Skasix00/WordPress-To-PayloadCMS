/* * */

import { LexicalNode } from '@/types';
import { randomBytes } from 'node:crypto';

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

export function payloadUploadNode(mediaId: string): LexicalNode {
	//
	// Generate a unique ID for the node
	const id = randomBytes(12).toString('hex');

	//
	// A. Return

	return {
		fields: null,
		format: '',
		id,
		relationTo: 'media',
		type: 'upload',
		value: mediaId,
		version: 3,
	};

	//
}

export function payloadLinkBlockNode(url: string, text: string, newTab = false): LexicalNode {
	//
	// Generate a unique ID for the node
	const id = randomBytes(12).toString('hex');

	//
	// A. Return

	return payloadBlockNode({
		blockName: '',
		blockType: 'link',
		id,
		newTab,
		text,
		url,
	});

	//
}
