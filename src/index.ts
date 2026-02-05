/* * */

import 'dotenv/config';
import { htmlToLexical } from '@/html-to-lexical';
import { createLogger, createNewsInPayload, fetchNewsImages, fetchWordpressNews, isoNow } from '@/utils';
import { } from '@/utils/isNow';
import { } from '@/utils/logger';
import { makeSummaryFromTitleAndText } from '@/utils/makeSummaryFromTitleAndText';
import { safeFilePart } from '@/utils/safeFilePart';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/* * */

async function run() {
	//

	//
	// A. Setup Variables

	const log = createLogger({ debug: process.env.DEBUG === '1', prefix: 'import' });
	const wpUrl = process.env.WP_NEWS_URL ?? 'https://carrismetropolitana.pt/api/news';
	const outputDir = path.resolve(process.cwd(), 'output');

	await mkdir(outputDir, { recursive: true });

	//
	// B. Fetch Data

	const limitNews = process.env.LIMIT_NEWS ? parseInt(process.env.LIMIT_NEWS) : undefined;

	log.section('WP → Payload (Lexical) Export (.txt)');
	log('info', 'config', { limitNews, outputDir, wpUrl });

	const items = await fetchWordpressNews(wpUrl);
	log('info', 'wp: fetched', { count: items.length });

	const baseOrigin = new URL(wpUrl).origin;
	const itemsToProcess = limitNews ? items.slice(0, limitNews) : items;

	//
	// C. For each news: collect image URLs → upload to Payload → build lexical with media IDs → create news

	for (const item of itemsToProcess) {
		const itemLog = createLogger({ debug: process.env.DEBUG === '1', prefix: `news:${item._id}` });
		itemLog.section(`News ${item._id}`);

		const html = item.content ?? '';
		const publishedAt = item.publish_date ?? isoNow();
		const updatedAt = isoNow();
		const summary = makeSummaryFromTitleAndText({ html, title: item.title });

		const imageUrls = new Set<string>();
		let coverUrl: null | string = null;
		if (item.cover_image_src) {
			coverUrl = item.cover_image_src.startsWith('http')
				? item.cover_image_src
				: new URL(item.cover_image_src, baseOrigin).href;
			imageUrls.add(coverUrl);
		}

		itemLog('info', 'input', {
			cover_image_src: item.cover_image_src ?? null,
			htmlLength: html.length,
			id: item._id,
			publish_date: item.publish_date ?? null,
			publishedAt,
			summaryLength: summary.length,
			title: item.title,
			updatedAt,
		});

		// Pass collectImageUrl to gather inline image URLs from HTML
		htmlToLexical(html, { baseOrigin, collectImageUrl: url => imageUrls.add(url), log: itemLog });

		// Upload images to Payload, get url → mediaId and mediaDoc maps
		const urls = Array.from(imageUrls);
		itemLog('info', 'uploading images', { count: urls.length, urls: urls.slice(0, 3) });
		const { urlToPayloadMediaDoc, urlToPayloadMediaId } = await fetchNewsImages({
			log: itemLog,
			outputDir,
			urls,
		});

		// Build lexical with urlToMediaDoc so inline images become Payload upload blocks
		const lexical = htmlToLexical(html, {
			baseOrigin,
			collectImageUrl: url => imageUrls.add(url),
			log: itemLog,
			urlToMediaDoc: url => urlToPayloadMediaDoc[url],
		});

		const featuredImageId = coverUrl ? urlToPayloadMediaId[coverUrl] : null;
		const out = {
			body: lexical,
			featured_image: featuredImageId,
			publishedAt,
			summary,
			title: item.title,
			updatedAt,
		};

		const filename = path.join(outputDir, `news-${item._id}-${safeFilePart(item.title)}.txt`);
		await writeFile(filename, JSON.stringify(out, null, '\t'), 'utf8');
		itemLog('info', 'saved', { filename });

		const { ok } = await createNewsInPayload(
			{
				body: out.body,
				featured_image: featuredImageId,
				publishedAt: out.publishedAt as string,
				summary: out.summary as string,
				title: out.title as string,
				updatedAt: out.updatedAt as string,
			},
			itemLog,
		);
		if (ok) itemLog('info', 'imported to Payload');
	}

	log.section('Finished');

	//
}

run().catch((err: unknown) => {
	console.error(err);
	process.exit(1);
});
