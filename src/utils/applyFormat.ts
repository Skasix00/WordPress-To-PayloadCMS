/* * */

import { LexicalNode } from '@/types';

/* * */

export function applyFormat(nodes: LexicalNode[], bit: number): void {
	//

	//
	// A. Transform Data

	for (const n of nodes) {
		if (n.type === 'text') {
			n.format = (((n.format as number) ?? 0) | bit);
		} else if (n.type === 'link' && n.children) {
			applyFormat(n.children, bit);
		}
	}

	//
}

export function parseBackgroundColorFromStyle(styleAttr: null | string): null | string {
	if (!styleAttr?.trim()) return null;
	const match = styleAttr.match(/background-color\s*:\s*([^;]+)/i);
	if (!match) return null;
	const value = match[1].trim().toLowerCase();
	if (value === 'transparent' || value === 'inherit') return null;
	const rgbaMatch = value.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
	if (rgbaMatch) {
		const alpha = parseFloat(rgbaMatch[4]);
		if (alpha === 0) return null;
	}
	return `background-color: ${match[1].trim()}`;
}

export function applyStyle(nodes: LexicalNode[], styleToAdd: string): void {
	if (!styleToAdd?.trim()) return;
	for (const n of nodes) {
		if (n.type === 'text') {
			const existing = (n.style ?? '').trim();
			n.style = existing ? `${existing}; ${styleToAdd}` : styleToAdd;
		} else if (n.type === 'link' && n.children) {
			applyStyle(n.children, styleToAdd);
		}
	}
}
