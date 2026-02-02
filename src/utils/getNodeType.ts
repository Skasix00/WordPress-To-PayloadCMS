/* * */

import { hasNodeType } from '@/utils/hasNodeType';

/* * */

export function getNodeType(value: unknown): null | number {
	//

	//
	// A. Return

	if (!hasNodeType(value)) return null;
	return value.nodeType;

	//
}
