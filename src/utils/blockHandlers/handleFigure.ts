/* * */

import type { BlockHandlerContext } from '@/types';
import type { LexicalNode } from '@/types';

import { payloadBlockNode, payloadUploadNode } from '@/components';
import { asElement } from '@/utils/asElement';
import { resolveUrl } from '@/utils/resolveUrl';

/* * */

export function handleFigure(el: Element, ctx: BlockHandlerContext): LexicalNode[] | null {
	//

	//
	// A. Setup Variables

	const { baseOrigin, collectImageUrl, log, urlToMediaDoc } = ctx;
	const imgSrc = asElement(el.querySelector('img'))?.getAttribute('src');

	//
	// B. Handle Image

	if (imgSrc) {
		const resolvedUrl = resolveUrl(imgSrc, baseOrigin);
		collectImageUrl?.(resolvedUrl);

		const mediaDoc = urlToMediaDoc?.(resolvedUrl);
		if (!mediaDoc) {
			log?.('info', 'block: <figure><img> skipped (no mediaDoc)', { src: imgSrc });
			return [];
		}

		const mediaId = (mediaDoc.id as string) ?? '';
		if (!mediaId) {
			log?.('warn', 'block: <figure><img> skipped (no mediaId in mediaDoc)', { src: imgSrc });
			return [];
		}

		log?.('info', 'block: <figure><img> -> upload block', { mediaId, src: imgSrc });
		return [payloadUploadNode(mediaId)];
	}

	//
	// C. Handle Video

	const videoSrc = asElement(el.querySelector('video'))?.getAttribute('src');
	if (videoSrc) {
		log?.('info', 'block: <figure><video> -> video block', { src: videoSrc });
		return [payloadBlockNode({ blockName: '', blockType: 'video', caption: '', source: 'external', videoUrl: videoSrc })];
	}

	//
	// D. Return

	return null;
}

/* * */
