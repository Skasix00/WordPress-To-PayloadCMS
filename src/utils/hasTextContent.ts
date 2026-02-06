/* * */

import type { DomTextNode } from '@/types';

import { isRecord } from '@/utils';

/* * */

export function hasTextContent(value: unknown): value is DomTextNode {
	//
	// A. Return

	return isRecord(value) && ('textContent' in value);

	//
}
