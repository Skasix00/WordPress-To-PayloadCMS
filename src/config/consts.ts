// NODE_TYPE
export const NODE_TYPE = {
	COMMENT: 8,
	ELEMENT: 1,
	TEXT: 3,
} as const;

//
// TEXT_FORMAT

export const TEXT_FORMAT = {
	BOLD: 1,
	CODE: 16,
	ITALIC: 2,
	STRIKETHROUGH: 8,
	UNDERLINE: 4,
} as const;

//
// PAYLOAD AUTH
// https://payloadcms.com/docs/authentication/api-keys
// Format: "{slug} API-Key {key}" (case-sensitive)

export const PAYLOAD_AUTH = {
	AUTH_COLLECTION_SLUG: process.env.PAYLOAD_AUTH_COLLECTION_SLUG ?? 'users',
	AUTH_TYPE: process.env.PAYLOAD_AUTH_TYPE ?? 'api-key',
} as const;

/** Block slug for images in body. Must match BlocksFeature in Payload (e.g. 'image', 'upload', 'media'). */
export const PAYLOAD_BODY_IMAGE_BLOCK_SLUG = process.env.PAYLOAD_BODY_IMAGE_BLOCK_SLUG ?? 'image';
/** Upload field name inside the image block. Must match your block's upload field name. */
export const PAYLOAD_BODY_IMAGE_BLOCK_FIELD = process.env.PAYLOAD_BODY_IMAGE_BLOCK_FIELD ?? 'image';
/** Set to '1' to skip image blocks in body (use when Block image not found). Images still upload; inline blocks are skipped. */
export const PAYLOAD_SKIP_BODY_IMAGE_BLOCKS = process.env.PAYLOAD_SKIP_BODY_IMAGE_BLOCKS === '1';

export function getPayloadAuthHeaderSync(): string | undefined {
	const apiKey = process.env.PAYLOAD_API_KEY;
	if (!apiKey) return undefined;
	if (PAYLOAD_AUTH.AUTH_TYPE === 'bearer') return `Bearer ${apiKey}`;
	return `${PAYLOAD_AUTH.AUTH_COLLECTION_SLUG} API-Key ${apiKey}`;
}

//
// ANSI

export const ANSI = {
	blue: '\x1b[34m',
	bold: '\x1b[1m',
	cyan: '\x1b[36m',
	dim: '\x1b[2m',
	gray: '\x1b[90m',
	green: '\x1b[32m',
	magenta: '\x1b[35m',
	red: '\x1b[31m',
	reset: '\x1b[0m',
	yellow: '\x1b[33m',
} as const;

//
