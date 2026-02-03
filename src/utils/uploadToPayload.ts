/* * */

import type { LogFn } from '@/types';

import { createLogger } from '@/utils/logger';
import path from 'node:path';
import process from 'node:process';

/* * */

const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:49001';

export function payloadAuthHeader(): string | undefined {
	const apiKey = process.env.PAYLOAD_API_KEY;
	if (!apiKey) return undefined;
	// Payload API key format: "users API-Key <key>" (not Bearer)
	const slug = process.env.PAYLOAD_AUTH_COLLECTION_SLUG ?? 'users';
	return `${slug} API-Key ${apiKey}`;
}

export function payloadMediaUrl(mediaId: string): string {
	return `${PAYLOAD_URL}/admin/api/media/${mediaId}?depth=2&draft=false&locale=undefined&trash=false`;
}

/** Fallback when Payload upload is not used – uses path basename as id. */
export function imageUrlToPayloadMediaUrl(url: string): string {
	try {
		const name = path.basename(new URL(url).pathname) || 'image';
		const id = path.extname(name) ? name : `${name}.jpg`;
		return payloadMediaUrl(id);
	} catch {
		return payloadMediaUrl('image');
	}
}

export async function uploadToPayload(
	buffer: Buffer,
	filename: string,
	contentType: string,
	log?: LogFn,
): Promise<null | string> {
	const uploadLog = log ?? createLogger({ debug: process.env.DEBUG === '1', prefix: 'uploadToPayload' });

	const sizeMb = (buffer.length / 1024 / 1024).toFixed(2);
	uploadLog('info', 'uploadToPayload: start', { contentType, filename, size: buffer.length, sizeMb: `${sizeMb} MB` });

	try {
		const form = new FormData();
		const file = new File([new Uint8Array(buffer)], filename, { type: contentType });
		form.append('file', file);
		const headers: Record<string, string> = {};
		const auth = payloadAuthHeader();
		if (auth) headers['Authorization'] = auth;
		const base = PAYLOAD_URL.replace(/\/$/, '');
		const apiPath = process.env.PAYLOAD_API_PATH ?? '/admin/api';
		const url = `${base}${apiPath}/media`;
		uploadLog('debug', 'uploadToPayload: POST', { url });

		const res = await fetch(url, {
			body: form,
			headers,
			method: 'POST',
		});

		if (!res.ok) {
			const text = await res.text();
			const isHtml = text.trimStart().startsWith('<!');
			uploadLog('error', 'uploadToPayload: failed', {
				body: isHtml ? `(HTML error page, ${text.length} chars)` : text.slice(0, 500),
				filename,
				hint: res.status === 500 && isHtml ? 'Try PAYLOAD_API_PATH=/admin/api or check server body size limit' : undefined,
				status: res.status,
			});
			return null;
		}

		const data = (await res.json()) as { doc?: { id: string }, id?: string };
		const id: null | string = data.doc?.id ?? data.id ?? null;
		uploadLog('info', 'uploadToPayload: success', { filename, mediaId: id });
		return id;
	} catch (err) {
		uploadLog('error', 'uploadToPayload: error', { err, filename });
		return null;
	}
}
