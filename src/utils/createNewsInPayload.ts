/* * */

import type { LogFn } from '@/types';

import { createLogger } from '@/utils/logger';
import process from 'node:process';

/* * */

import { payloadAuthHeader } from '@/utils/uploadToPayload';

const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:49001';
const NEWS_SLUG = process.env.PAYLOAD_NEWS_SLUG ?? 'news';

export interface CreateNewsPayload {
	body: unknown
	featured_image: null | string
	publishedAt: string
	summary: string
	title: string
	updatedAt: string
}

export interface CreateNewsInPayloadResult {
	id: null | string
	ok: boolean
}

export async function createNewsInPayload(
	data: CreateNewsPayload,
	log?: LogFn,
): Promise<CreateNewsInPayloadResult> {
	const createLog = log ?? createLogger({ debug: process.env.DEBUG === '1', prefix: 'createNewsInPayload' });

	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};
		const auth = await payloadAuthHeader();
		if (auth) headers['Authorization'] = auth;

		const base = PAYLOAD_URL.replace(/\/$/, '');
		const apiPath = process.env.PAYLOAD_API_PATH ?? '/admin/api';
		const url = `${base}${apiPath}/${NEWS_SLUG}`;

		createLog('debug', 'createNewsInPayload: POST', { title: data.title, url });

		const res = await fetch(url, {
			body: JSON.stringify(data),
			headers,
			method: 'POST',
		});

		if (!res.ok) {
			const text = await res.text();
			const isHtml = text.trimStart().startsWith('<!');
			createLog('error', 'createNewsInPayload: failed', {
				body: isHtml ? `(HTML error page, ${text.length} chars)` : text.slice(0, 500),
				status: res.status,
				title: data.title,
			});
			return { id: null, ok: false };
		}

		const result = (await res.json()) as { doc?: { id: string }, id?: string };
		const id: null | string = result.doc?.id ?? result.id ?? null;
		createLog('info', 'createNewsInPayload: success', { id, title: data.title });
		return { id, ok: true };
	} catch (err) {
		createLog('error', 'createNewsInPayload: error', { err, title: data.title });
		return { id: null, ok: false };
	}
}
