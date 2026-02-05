export type Logger = LogFn & {
	divider: (title?: string) => void
	section: (title: string) => void
	subsection: (title: string) => void
};
