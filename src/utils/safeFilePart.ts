export function safeFilePart(value: string): string {
	//

	//
	// A. Return

	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);

	//
}
