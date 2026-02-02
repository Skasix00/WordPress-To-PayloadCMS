/* * */

export function makeSummaryFromTitleAndText(args: { html: string, title: string }): string {
	//

	//
	// A. Setup Variables

	const { html, title } = args;

	//
	// B. Transform Data

	const text = html
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\u00A0/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	const base = text.length > 0 ? text : title;

	//
	// C. Return

	return base.slice(0, 180);

	//
}
