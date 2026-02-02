import { LogFn } from '@/utils/LogFn';

export interface Options {
	baseOrigin?: string
	collectImageUrl?: (url: string) => void
	log?: LogFn
}
