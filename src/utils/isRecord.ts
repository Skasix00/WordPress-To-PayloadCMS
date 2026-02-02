/* * */

import type { UnknownRecord } from '@/types';

/* * */

export function isRecord(value: unknown): value is UnknownRecord {
	//

	//
	// A. Return

	return Boolean(value) && typeof value === 'object';

	//
}
