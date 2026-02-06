/* * */

import type { LogFn } from '@/types';

import { getPayloadAuthHeaderSync } from '@/utils';
import { createLogger } from '@/utils';
import path from 'node:path';
import process from 'node:process';

/* * */

export function payloadMediaUrl(mediaId: string): string {
	return `${process.env.PAYLOAD_URL}/admin/api/media/${mediaId}?depth=2&draft=false&locale=undefined&trash=false`;
}

export function imageUrlToPayloadMediaUrl(url: string): string {
	try {
		const name = path.basename(new URL(url).pathname) || 'image';
		const id = path.extname(name) ? name : `${name}.jpg`;
		return payloadMediaUrl(id);
	} catch {
		return payloadMediaUrl('image');
	}
}

export async function uploadToPayload(buffer: Buffer, filename: string, contentType: string, log?: LogFn): Promise<null | Record<string, unknown>> {
	//

	//
	// A. Setup Variables

	const uploadLog = log ?? createLogger({ debug: process.env.DEBUG === '1', prefix: 'uploadToPayload' });

	const sizeMb = (buffer.length / 1024 / 1024).toFixed(2);
	uploadLog('info', 'Uploading to Payload', { contentType, filename, size: buffer.length, sizeMb: `${sizeMb} MB` });

	try {
		const form = new FormData();
		const file = new File([new Uint8Array(buffer)], filename, { type: contentType });
		form.append('file', file);
		const headers: Record<string, string> = {};
		const auth = getPayloadAuthHeaderSync();
		if (auth) {
			headers['Authorization'] = auth;
		} else {
			uploadLog('warn', 'uploadToPayload: no auth header (PAYLOAD_API_KEY not set or .env not loaded)');
		}
		const base = process.env.PAYLOAD_URL?.replace(/\/$/, '') ?? '';
		const apiPath = process.env.PAYLOAD_API_PATH ?? '/admin/api';
		const url = `${base}${apiPath}/media`;
		uploadLog('debug', 'uploadToPayload: POST', {
			...(auth && { authHeader: `${auth.replace(/\s+\S+$/, ' ***')}` }),
			url,
		});

		const res = await fetch(url, {
			body: form,
			headers,
			method: 'POST',
		});

		if (!res.ok) {
			const text = await res.text();
			const isHtml = text.trimStart().startsWith('<!');
			const hints: string[] = [];
			if (res.status === 403) {
				hints.push('403 = access denied. Ensure PAYLOAD_API_KEY is set and the user has create access on media.');
			} else if (res.status === 500 && isHtml) {
				hints.push('Try PAYLOAD_API_PATH=/admin/api or check server body size limit');
			}
			uploadLog('error', 'uploadToPayload: failed', {
				body: isHtml ? `(HTML error page, ${text.length} chars)` : text.slice(0, 500),
				filename,
				hint: hints.length ? hints.join(' ') : undefined,
				status: res.status,
			});
			return null;
		}

		const data = (await res.json()) as { doc?: Record<string, unknown>, id?: string };
		const doc = data.doc ?? (data.id ? { id: data.id } : null);
		const id: null | string = doc ? (doc.id as string) ?? (data.id ?? null) : null;
		uploadLog('info', 'uploadToPayload: success', { filename, mediaId: id });
		return doc ? { id, ...doc } as Record<string, unknown> : null;
	} catch (err) {
		uploadLog('error', 'uploadToPayload: error', { err, filename });
		return null;
	}
}
