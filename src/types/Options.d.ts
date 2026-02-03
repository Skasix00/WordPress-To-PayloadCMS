import { LogFn } from '@/utils/LogFn';

export interface Options {
	baseOrigin?: string
	collectImageUrl?: (url: string) => void
	log?: LogFn
	urlToMediaDoc?: (url: string) => Record<string, unknown> | undefined
}
