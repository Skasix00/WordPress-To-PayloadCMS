export function resolveUrl(url: string, baseOrigin: string): string {
	//

	//
	// A. Setup Variables

	const trimmed = url.trim();

	//
	// B. Return

	if (/^https?:\/\//i.test(trimmed)) return trimmed;

	if (!baseOrigin) return trimmed;

	try {
		return new URL(trimmed, baseOrigin).href;
	} catch {
		return trimmed;
	}

	//
}
