/* * */

import 'dotenv/config';
import { htmlToLexical } from '@/html-to-lexical';
import { createLogger, createNewsInPayload, fetchNewsImages, fetchWordpressNews, isoNow, makeSummaryFromTitleAndText, resolveCoverUrl, safeFilePart } from '@/utils';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/* * */

async function run() {
	//

	//
	// A. Setup Variables

	const debug = process.env.DEBUG === '1';
	const log = createLogger({ debug, prefix: 'import' });
	const wpUrl = process.env.WP_NEWS_URL;
	const limitNews = process.env.LIMIT_NEWS ? parseInt(process.env.LIMIT_NEWS) : undefined;
	const outputDir = path.resolve(process.cwd(), 'output');
	const imagesDir = path.join(outputDir, 'images');

	await mkdir(outputDir, { recursive: true });
	await mkdir(imagesDir, { recursive: true });

	//
	// B. Fetch Data

	log.section('WP → Payload (Lexical) Export (.txt)');
	log('info', 'config', { limitNews, outputDir, wpUrl });

	if (!wpUrl?.trim()) throw new Error('WP_NEWS_URL environment variable is required');
	const items = await fetchWordpressNews(wpUrl);
	log('info', 'wp: fetched', { count: items.length });

	const baseOrigin = new URL(wpUrl).origin;
	const itemsToProcess = limitNews ? items.slice(0, limitNews) : items;

	//
	// C. Transform Data

	for (const item of itemsToProcess) {
		const itemLog = createLogger({ debug, prefix: `news:${item._id}` });
		itemLog.section(`News ${item._id}`);

		const html = item.content ?? '';
		const publishedAt = item.publish_date ?? isoNow();
		const updatedAt = isoNow();
		const summary = makeSummaryFromTitleAndText({ html, title: item.title });
		const coverUrl = resolveCoverUrl(item.cover_image_src, baseOrigin);

		itemLog('info', 'input', {
			cover_image_src: item.cover_image_src ?? null,
			htmlLength: html.length,
			id: item._id,
			publish_date: item.publish_date ?? null,
			title: item.title,
		});

		// Collect image URLs from HTML
		const imageUrls = new Set<string>();
		if (coverUrl) imageUrls.add(coverUrl);
		htmlToLexical(html, { baseOrigin, collectImageUrl: url => imageUrls.add(url), log: itemLog });

		// Upload images to Payload
		const urls = Array.from(imageUrls);
		itemLog('info', 'uploading images', { count: urls.length, urls: urls.slice(0, 3) });
		const { urlToPayloadMediaDoc, urlToPayloadMediaId } = await fetchNewsImages({ imagesDir, log: itemLog, urls });

		// Build lexical with media IDs
		const body = htmlToLexical(html, {
			baseOrigin,
			log: itemLog,
			urlToMediaDoc: url => urlToPayloadMediaDoc[url],
		});

		const featured_image = coverUrl ? urlToPayloadMediaId[coverUrl] : null;
		const payload = { _status: 'published' as const, body, featured_image, publishedAt, summary, title: item.title, updatedAt };

		// Save to file
		const filename = path.join(outputDir, `news-${item._id}-${safeFilePart(item.title)}.txt`);
		await writeFile(filename, JSON.stringify(payload, null, '\t'), 'utf8');
		itemLog('info', 'saved', { filename });

		// Create in Payload
		const { ok } = await createNewsInPayload(payload, itemLog);
		if (ok) itemLog('info', 'imported to Payload');
	}

	//
	// D. Finish

	log.section('Finished');

	//
}

run().catch((err: unknown) => {
	console.error(err);
	process.exit(1);
});
