/* * */

import type { LogFn } from '@/types';

import { imageUrlToPayloadMediaUrl, payloadMediaUrl, uploadToPayload } from '@/utils/uploadToPayload';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/* * */

function filenameFromUrl(url: string, index: number): string {
	try {
		const seg = path.basename(new URL(url).pathname);
		if (seg) return seg;
	} catch {
		// ignore
	}
	return `image-${index}`;
}

/* * */

export interface FetchNewsImagesOptions {
	limit?: number
	log?: LogFn
	outputDir: string
	urls: string[]
}

export interface FetchNewsImagesResult {
	saved: string[]
	urlToPayloadMedia: Record<string, string>
}

export async function fetchNewsImages(options: FetchNewsImagesOptions): Promise<FetchNewsImagesResult> {
	const { limit, log, outputDir, urls } = options;
	const imagesDir = path.join(outputDir, 'images');
	await mkdir(imagesDir, { recursive: true });

	const saved: string[] = [];
	const urlToPayloadMedia: Record<string, string> = {};
	const max = limit !== undefined ? Math.min(limit, urls.length) : urls.length;

	for (let i = 0; i < max; i++) {
		const url = urls[i];
		if (!url) continue;
		try {
			const res = await fetch(url);
			if (!res.ok) continue;
			const type = res.headers.get('content-type') ?? '';
			if (!type.startsWith('image/')) continue;
			const buffer = Buffer.from(await res.arrayBuffer());
			const filename = filenameFromUrl(url, i);
			const filepath = path.join(imagesDir, filename);
			await writeFile(filepath, buffer);
			saved.push(filepath);

			const mediaId = await uploadToPayload(buffer, filename, type, log);
			if (mediaId) {
				urlToPayloadMedia[url] = payloadMediaUrl(mediaId);
				log?.('info', 'fetchNewsImages: saved + Payload', { filename, mediaId, url });
			} else {
				urlToPayloadMedia[url] = imageUrlToPayloadMediaUrl(url);
				log?.('error', 'fetchNewsImages: Payload upload failed, using fallback', { filename, url });
			}
		} catch (err) {
			log?.('warn', 'fetchNewsImages: failed', { err, url });
		}
	}

	return { saved, urlToPayloadMedia };
}
