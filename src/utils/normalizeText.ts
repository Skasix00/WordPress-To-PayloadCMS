export function normalizeText(text: string): string {
	//

	//
	// A. Return

	return text.replace(/\u00A0/g, ' ').replace(/\r\n/g, '\n');

	//
}
