/**
 * Convert MDX doc source into plain markdown for agent consumption: strip
 * imports/exports and JS expressions, and flatten Starlight components into
 * markdown equivalents so no JSX reaches the output.
 */
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";

type Node = Record<string, any>;

const ASIDE_LABELS: Record<string, string> = {
	note: "Note",
	tip: "Tip",
	caution: "Caution",
	danger: "Danger",
};

function attribute(node: Node, name: string): string | undefined {
	for (const attr of node.attributes ?? []) {
		if (attr.type === "mdxJsxAttribute" && attr.name === name) {
			if (typeof attr.value === "string") return attr.value;
		}
	}
	return undefined;
}

function bold(text: string): Node {
	return {
		type: "paragraph",
		children: [{ type: "strong", children: [{ type: "text", value: text }] }],
	};
}

/** Replace a JSX element with plain markdown nodes (or [] to drop it). */
function replaceElement(node: Node): Node[] {
	const children = transformChildren(node.children ?? []);
	switch (node.name) {
		case "Aside": {
			const label =
				attribute(node, "title") ??
				ASIDE_LABELS[attribute(node, "type") ?? "note"] ??
				"Note";
			return [
				{ type: "blockquote", children: [bold(`${label}:`), ...children] },
			];
		}
		case "TabItem": {
			const label = attribute(node, "label");
			return label ? [bold(label), ...children] : children;
		}
		case "Card": {
			const title = attribute(node, "title");
			return title ? [bold(title), ...children] : children;
		}
		case "LinkCard":
		case "LinkButton": {
			const href = attribute(node, "href");
			const title =
				attribute(node, "title") ??
				(node.children?.[0]?.value as string | undefined);
			if (href) {
				return [
					{
						type: "paragraph",
						children: [
							{
								type: "link",
								url: href,
								children: [{ type: "text", value: title ?? href }],
							},
						],
					},
				];
			}
			return children;
		}
		// Tabs, Steps, CardGrid, FileTree, and anything unrecognized: unwrap.
		default:
			return children;
	}
}

function transformChildren(children: Node[]): Node[] {
	const result: Node[] = [];
	for (const child of children) {
		switch (child.type) {
			case "mdxjsEsm":
			case "mdxFlowExpression":
			case "mdxTextExpression":
				break;
			case "mdxJsxFlowElement":
			case "mdxJsxTextElement":
				result.push(...replaceElement(child));
				break;
			default:
				if (Array.isArray(child.children)) {
					child.children = transformChildren(child.children);
				}
				result.push(child);
		}
	}
	return result;
}

const parser = remark().use(remarkMdx).use(remarkGfm);
// Stringify without the MDX extensions so output uses plain markdown escaping.
const printer = remark().use(remarkGfm);

export function mdxToMarkdown(source: string): string {
	const tree = parser.parse(source) as Node;
	tree.children = transformChildren(tree.children);
	return printer.stringify(tree as any);
}
