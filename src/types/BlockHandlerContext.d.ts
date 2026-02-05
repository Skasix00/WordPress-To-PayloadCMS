export interface BlockHandlerContext {
	baseOrigin: string
	collectImageUrl?: (url: string) => void
	log?: LogFn
	urlToMediaDoc?: (url: string) => Record<string, unknown> | undefined
}
