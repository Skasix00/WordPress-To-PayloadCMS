import type { LogFn } from './LogFn';

export interface Options {
	baseOrigin?: string
	collectImageUrl?: (url: string) => void
	log?: LogFn
	paddingTopPx?: number
	urlToMediaDoc?: (url: string) => Record<string, unknown> | undefined
}
