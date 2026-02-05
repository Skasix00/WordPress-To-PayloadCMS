/* * */

import path from 'node:path';

/* * */

export function fileNameFromUrl(url: string, index: number): string {
	//

	//
	// A. Setup Variables

	const seg = path.basename(new URL(url).pathname);

	//
	// B. Return

	if (seg) return seg;

	return `image-${index}`;

	//
}
