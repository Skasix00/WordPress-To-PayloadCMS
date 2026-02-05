/* * */

import { LogFn } from '@/types';
import { ProcessedImage } from '@/types';
import { imageUrlToPayloadMediaUrl, payloadMediaUrl, saveImageToDisk, uploadToPayload } from '@/utils';

/* * */

export async function processImage(url: string, index: number, imagesDir: string, log?: LogFn): Promise<null | ProcessedImage> {
	//

	//
	// A. Setup Variables

	const saved = await saveImageToDisk(url, index, imagesDir);
	const { buffer, contentType, filename, filepath } = saved;
	const mediaDoc = await uploadToPayload(buffer, filename, contentType, log);
	const mediaId = (mediaDoc.id as string) ?? '';

	// B. Return

	if (!mediaDoc) {
		log?.('error', 'fetchNewsImages: Payload upload failed, using fallback', { filename, url });
		return { mediaUrl: imageUrlToPayloadMediaUrl(url), saved: filepath };
	}

	log?.('info', 'fetchNewsImages: saved + Payload', { filename, mediaId, url });

	if (!saved) return null;

	return {
		mediaDoc,
		mediaId,
		mediaUrl: payloadMediaUrl(mediaId),
		saved: filepath,
	};

	//
}
