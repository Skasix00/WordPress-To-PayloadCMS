/* * */

export function isValidHttpUrl(url: null | string | undefined): boolean {
	const trimmed = url?.trim() ?? '';

	if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
		return false;
	}

	try {
		new URL(trimmed);
		return true;
	} catch {
		return false;
	}
}

/* * */
