export function resolveCoverUrl(src: string | undefined, baseOrigin: string): null | string {
	//

	//
	// A. Returns

	if (!src) return null;
	return src.startsWith('http') ? src : new URL(src, baseOrigin).href;

	//
}
