/* * */

import type { LogFn } from '@/types';

import { CreateNewsInPayloadResult, CreateNewsPayload } from '@/types';
import { getPayloadAuthHeaderSync } from '@/utils';
import { createLogger } from '@/utils';
import process from 'node:process';

/* * */

export async function createNewsInPayload(data: CreateNewsPayload, log?: LogFn): Promise<CreateNewsInPayloadResult> {
	//

	//
	// A. Setup Variables

	const createLog = log ?? createLogger({ debug: process.env.DEBUG === '1', prefix: 'createNewsInPayload' });

	//
	// B. Return

	try {
		const base = (process.env.PAYLOAD_URL ?? 'http://localhost:49001').replace(/\/$/, '');
		const apiPath = process.env.PAYLOAD_API_PATH ?? '/admin/api';
		const slug = process.env.PAYLOAD_NEWS_SLUG ?? 'news';
		const url = `${base}${apiPath}/${slug}`;

		const auth = getPayloadAuthHeaderSync();
		const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) };

		createLog('debug', 'createNewsInPayload: POST', { title: data.title, url });

		const res = await fetch(url, { body: JSON.stringify(data), headers, method: 'POST' });

		if (!res.ok) {
			const text = await res.text();
			createLog('error', 'createNewsInPayload: failed', { body: text.trimStart().startsWith('<!') ? `(HTML error page, ${text.length} chars)` : text.slice(0, 500), status: res.status, title: data.title });
			return { id: null, ok: false };
		}

		const result = (await res.json()) as { doc?: { id: string }, id?: string };
		const id = result.doc?.id ?? result.id ?? null;

		createLog('info', 'createNewsInPayload: success', { id, title: data.title });
		return { id, ok: true };
	} catch (err) {
		createLog('error', 'createNewsInPayload: error', { err, title: data.title });
		return { id: null, ok: false };
	}
}
