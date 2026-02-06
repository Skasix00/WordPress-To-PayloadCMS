/* * */

import type { FetchNewsImagesOptions, FetchNewsImagesResult } from '@/types';

import { processImage } from '@/utils';

/* * */

export async function fetchNewsImages(options: FetchNewsImagesOptions): Promise<FetchNewsImagesResult> {
	//

	//
	// B. Setup Variables

	const { imagesDir, limit, log, urls } = options;
	const saved: string[] = [];
	const urlToPayloadMedia: Record<string, string> = {};
	const urlToPayloadMediaId: Record<string, string> = {};
	const urlToPayloadMediaDoc: Record<string, Record<string, unknown>> = {};
	const max = limit !== undefined ? Math.min(limit, urls.length) : urls.length;

	//
	// C. Process Images

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

	//
	// D. Return

	if (!options?.urls || !Array.isArray(options.urls)) throw new Error('fetchNewsImages: urls must be an array');
	if (!options?.imagesDir?.trim()) throw new Error('fetchNewsImages: imagesDir is required');

	return { saved, urlToPayloadMedia, urlToPayloadMediaDoc, urlToPayloadMediaId };

	//
}
