/* * */

import { htmlToLexical } from '@/html-to-lexical';
import { createLogger, fetchNewsImages, fetchWordpressNews, isoNow } from '@/utils';
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

	log.section('WP → Payload (Lexical) Export (.txt)');
	log('info', 'config', { outputDir, wpUrl });

	const items = await fetchWordpressNews(wpUrl);
	log('info', 'wp: fetched', { count: items.length });

	//
	// C. Transform Data (collect image URLs, build lexical)

	const baseOrigin = new URL(wpUrl).origin;
	const imageUrls = new Set<string>();
	const pendingWrites: { coverUrl: null | string, item: (typeof items)[0], out: Record<string, unknown> }[] = [];

	for (const item of items) {
		const itemLog = createLogger({ debug: process.env.DEBUG === '1', prefix: `news:${item._id}` });

		itemLog.section(`News ${item._id}`);

		const html = item.content ?? '';
		const publishedAt = item.publish_date ?? isoNow();
		const updatedAt = isoNow();
		const summary = makeSummaryFromTitleAndText({ html, title: item.title });

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

		const lexical = htmlToLexical(html, { baseOrigin, collectImageUrl: url => imageUrls.add(url), log: itemLog });

		const out = {
			body: lexical,
			featured_image: item.cover_image_src ?? null,
			publishedAt,
			summary,
			title: item.title,
			updatedAt,
		};

		pendingWrites.push({ coverUrl, item, out });
	}

	//
	// D. Fetch images, upload to Payload, then write files

	log.section('News images → output/images (+ Payload upload)');
	const { saved: savedImages, urlToPayloadMedia } = await fetchNewsImages({
		limit: 1,
		log,
		outputDir,
		urls: Array.from(imageUrls),
	});
	log('info', 'images saved', { count: savedImages.length });

	for (const { coverUrl, item, out } of pendingWrites) {
		const itemLog = createLogger({ debug: process.env.DEBUG === '1', prefix: `news:${item._id}` });
		out.featured_image = (coverUrl && urlToPayloadMedia[coverUrl]) ?? item.cover_image_src ?? null;
		const filename = path.join(outputDir, `news-${item._id}-${safeFilePart(item.title)}.txt`);
		await writeFile(filename, JSON.stringify(out, null, '\t'), 'utf8');
		itemLog('info', 'saved', { filename });
	}

	log.section('Finished');

	//
}

run().catch((err: unknown) => {
	console.error(err);
	process.exit(1);
});
