/* * */

import type { DomElement } from '@/types';

import { NODE_TYPE } from '@/config/consts';
import { getNodeType } from '@/utils/getNodeType';
import { isRecord } from '@/utils/isRecord';

/* * */

export function asElement(value: unknown): DomElement | null {
	//

	//
	// A. Return

	if (!isRecord(value)) return null;
	if (getNodeType(value) !== NODE_TYPE.ELEMENT) return null;
	if (typeof (value as { tagName?: unknown }).tagName !== 'string') return null;
	if (typeof (value as { getAttribute?: unknown }).getAttribute !== 'function') return null;
	if (typeof (value as { querySelector?: unknown }).querySelector !== 'function') return null;
	if (typeof (value as { cloneNode?: unknown }).cloneNode !== 'function') return null;

	return value as DomElement;

	//
}
