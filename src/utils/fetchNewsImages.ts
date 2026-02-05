/* * */

import type { FetchNewsImagesOptions, FetchNewsImagesResult } from '@/types';

import { processImage } from '@/utils';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/* * */

export async function fetchNewsImages(options: FetchNewsImagesOptions): Promise<FetchNewsImagesResult> {
	const { limit, log, outputDir, urls } = options;
	const imagesDir = path.join(outputDir, 'images');
	await mkdir(imagesDir, { recursive: true });

	const saved: string[] = [];
	const urlToPayloadMedia: Record<string, string> = {};
	const urlToPayloadMediaId: Record<string, string> = {};
	const urlToPayloadMediaDoc: Record<string, Record<string, unknown>> = {};
	const max = limit !== undefined ? Math.min(limit, urls.length) : urls.length;

	for (const [index, url] of urls.slice(0, max).entries()) {
		if (!url) continue;

		try {
			const processed = await processImage(url, index, imagesDir, log);
			if (!processed) continue;

			const { mediaDoc, mediaId, mediaUrl, saved: filepath } = processed;
			if (filepath) saved.push(filepath);
			urlToPayloadMedia[url] = mediaUrl;
			if (mediaId) urlToPayloadMediaId[url] = mediaId;
			if (mediaDoc) urlToPayloadMediaDoc[url] = mediaDoc;
		} catch (err) {
			log?.('warn', 'fetchNewsImages: failed', { err, url });
		}
	}

	return { saved, urlToPayloadMedia, urlToPayloadMediaDoc, urlToPayloadMediaId };
}
