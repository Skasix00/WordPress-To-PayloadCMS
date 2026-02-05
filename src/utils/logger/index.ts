import type { LogFn, Logger } from '@/types';

import { ANSI, DIVIDER_LINE, DIVIDER_WIDTH, LEVEL_CONFIG } from '@/config/consts';
import { safeJson } from '@/utils';

/* * */

function colorize(code: string, text: string): string {
	return `${code}${text}${ANSI.reset}`;
}

/* * */

export function createLogger(options?: { debug?: boolean, prefix?: string }): Logger {
	const prefix = options?.prefix ? `[${options.prefix}]` : '';
	const debugEnabled = Boolean(options?.debug);

	const color = (code: string, text: string) => colorize(code, text);

	const base: LogFn = (level, message, meta) => {
		if (level === 'debug' && !debugEnabled) return;

		const config = LEVEL_CONFIG[level] ?? { color: ANSI.gray, label: level.toUpperCase() };
		const ts = color(ANSI.gray, new Date().toISOString());
		const lvl = color(ANSI.bold + config.color, config.label);
		const pfx = prefix ? color(ANSI.magenta, prefix) : '';

		console.log(`${ts} ${lvl} ${pfx} ${message}${safeJson(meta)}`);
	};

	const logger = base as unknown as Logger;

	logger.divider = (title?: string) => {
		if (!title) {
			console.log(color(ANSI.gray, DIVIDER_LINE));
			return;
		}
		const padded = ` ${title} `;
		const remaining = Math.max(0, DIVIDER_WIDTH - padded.length - 1);
		console.log(color(ANSI.gray, `─${padded}${'─'.repeat(remaining)}`));
	};

	logger.section = (title: string) => {
		logger.divider();
		console.log(color(ANSI.bold + ANSI.blue, title));
		logger.divider();
	};

	logger.subsection = (title: string) => {
		console.log(color(ANSI.bold + ANSI.cyan, `• ${title}`));
	};

	return logger;
}
