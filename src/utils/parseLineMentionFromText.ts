export function parseLineMentionFromText(text: string): null | { id: string, label: string } {
	//

	//
	// A. Setup Variables

	const trimmed = text.trim();
	const match = trimmed.match(/^:?\s*(\d{3,6})\s*\|\s*(.+)$/);

	//
	// B. Return

	if (!match) return null;

	return {
		id: match[1],
		label: match[2].trim(),
	};

	//
}
