export interface FetchNewsImagesResult {
	saved: string[]
	urlToPayloadMedia: Record<string, string>
	urlToPayloadMediaDoc: Record<string, Record<string, unknown>>
	urlToPayloadMediaId: Record<string, string>
}
