export function safeJson(meta?: Record<string, unknown>): string {
	//

	//
	// A. Return

	if (!meta) return '';
	try {
		return ` ${JSON.stringify(meta)}`;
	} catch {
		return '';
	}

	//
}
