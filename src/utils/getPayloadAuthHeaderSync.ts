/* * */

import { PAYLOAD_AUTH } from '@/config/consts';

/* * */

export function getPayloadAuthHeaderSync(): string | undefined {
	//

	//
	// A. Setup Variables

	const apiKey = process.env.PAYLOAD_API_KEY;

	//
	// B. Return

	if (!apiKey) return undefined;
	return `${PAYLOAD_AUTH.AUTH_COLLECTION_SLUG} API-Key ${apiKey}`;

	//
}
