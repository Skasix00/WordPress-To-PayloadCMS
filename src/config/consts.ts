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
