import { ANSI } from '@/config/consts';
import { LogFn, LogLevel } from '@/types';

export type Logger = LogFn & {
	divider: (title?: string) => void
	section: (title: string) => void
	subsection: (title: string) => void
};

function now() {
	return new Date().toISOString();
}

function safeJson(meta?: Record<string, unknown>) {
	if (!meta) return '';
	try {
		return ` ${JSON.stringify(meta)}`;
	} catch {
		return '';
	}
}

function shouldColorize() {
	if (process.env.NO_COLOR) return false;
	if (process.env.FORCE_COLOR === '0') return false;
	if (process.env.FORCE_COLOR === '1') return true;
	return Boolean(process.stdout.isTTY);
}

function colorize(enabled: boolean, code: string, text: string) {
	if (!enabled) return text;
	return `${code}${text}${ANSI.reset}`;
}

function levelLabel(level: LogLevel) {
	switch (level) {
		case 'debug':
			return 'DEBUG';
		case 'error':
			return 'ERROR';
		case 'info':
			return 'INFO ';
		case 'warn':
			return 'WARN ';
		default:
			return String(level).toUpperCase();
	}
}

function levelColor(level: LogLevel) {
	switch (level) {
		case 'debug':
			return ANSI.cyan;
		case 'error':
			return ANSI.red;
		case 'info':
			return ANSI.green;
		case 'warn':
			return ANSI.yellow;
		default:
			return ANSI.gray;
	}
}

export function createLogger(options?: {
	debug?: boolean
	prefix?: string
}): Logger {
	const prefix = options?.prefix ? `[${options.prefix}]` : '';
	const debugEnabled = Boolean(options?.debug);
	const colorEnabled = shouldColorize();

	const base: LogFn = (level, message, meta) => {
		if (level === 'debug' && !debugEnabled) return;

		const ts = colorize(colorEnabled, ANSI.gray, now());
		const lvl = colorize(colorEnabled, ANSI.bold + levelColor(level), levelLabel(level));
		const pfx = prefix
			? colorize(colorEnabled, ANSI.magenta, `${prefix}`)
			: '';

		const metaText = safeJson(meta);

		console.log(`${ts} ${lvl} ${pfx} ${message}${metaText}`);
	};

	const logger = base as unknown as Logger;

	logger.divider = (title?: string) => {
		const width = 72;
		const line = '─'.repeat(width);

		if (!title) {
			console.log(colorize(colorEnabled, ANSI.gray, line));
			return;
		}

		const left = ` ${title} `;
		const remaining = Math.max(0, width - left.length);
		const out = `─${left}${'─'.repeat(remaining - 1)}`;

		console.log(colorize(colorEnabled, ANSI.gray, out));
	};

	logger.section = (title: string) => {
		logger.divider();

		console.log(colorize(colorEnabled, ANSI.bold + ANSI.blue, title));
		logger.divider();
	};

	logger.subsection = (title: string) => {
		console.log(colorize(colorEnabled, ANSI.bold + ANSI.cyan, `• ${title}`));
	};

	return logger;
}
