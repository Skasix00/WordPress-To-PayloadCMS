export interface CreateNewsPayload {
	_status?: 'draft' | 'published'
	body: unknown
	featured_image: null | string
	publishedAt: string
	summary: string
	title: string
	updatedAt: string
}
