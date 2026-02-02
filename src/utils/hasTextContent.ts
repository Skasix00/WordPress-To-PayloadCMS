/* * */

import type { DomTextNode } from '@/types';

import { isRecord } from '@/utils/isRecord';

/* * */

export function hasTextContent(value: unknown): value is DomTextNode {
	//
	// A. Return

	return isRecord(value) && ('textContent' in value);

	//
}
