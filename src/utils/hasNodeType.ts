/* * */

import type { UnknownRecord } from '@/types';

import { isRecord } from '@/utils/isRecord';

/* * */

export function hasNodeType(value: unknown): value is UnknownRecord & { nodeType: number } {
	//

	//
	// A. Return

	return isRecord(value) && typeof value.nodeType === 'number';
	//
}
