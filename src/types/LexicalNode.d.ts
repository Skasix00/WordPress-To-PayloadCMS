export interface LexicalNode {
	children?: LexicalNode[]
	detail?: number
	direction?: 'ltr' | null
	fields?: null | Record<string, unknown>
	format?: number | string
	id?: string
	indent?: number
	label?: string
	listType?: 'bullet' | 'number'
	mentionType?: string
	mode?: 'normal'
	rel?: string
	start?: number
	style?: string
	tag?: string
	target?: null | string
	text?: string
	title?: null | string
	type: string
	url?: string
	value?: number
	version: number
}
