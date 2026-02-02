export type DomElement = UnknownRecord & {
	childNodes: ArrayLike<unknown>
	children: ArrayLike<unknown>
	classList?: {
		contains: (name: string) => boolean
	}
	cloneNode: (deep?: boolean) => unknown
	getAttribute: (name: string) => null | string
	querySelector: (selector: string) => unknown
	tagName: string
	textContent: null | string
};
