/* * */

import { fileNameFromUrl } from '@/utils';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

/* * */

export interface SavedImage {
	buffer: Buffer
	contentType: string
	filename: string
	filepath: string
}

export async function saveImageToDisk(url: string, index: number, imagesDir: string): Promise<null | SavedImage> {
	//

	//
	// A. Setup Variables

	const res = await fetch(url);
	const buffer = Buffer.from(await res.arrayBuffer());
	const filename = fileNameFromUrl(url, index);
	const filepath = path.join(imagesDir, filename);
	const contentType = res.headers.get('content-type') ?? '';

	//
	// B. Return

	if (!contentType.startsWith('image/')) return null;

	await writeFile(filepath, buffer);

	if (!res.ok) return null;
	return { buffer, contentType, filename, filepath };

	//
}
