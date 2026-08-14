// Monochrome Expressive Code themes: pure black & white, with hierarchy
// carried by grayscale dimming and font style instead of hue — code blocks
// read like the bomb.sh hero (white on black in a hairline frame). Terminal
// ANSI colors keep the brand palette so rendered terminal output still pops.
import { ExpressiveCodeTheme } from "@astrojs/starlight/expressive-code";

const palette = {
	dark: {
		bg: "#000000",
		fg: "#f4f5f9", // --color-gray-20
		bright: "#ffffff",
		string: "#a9abb6", // --color-gray-40
		punctuation: "#6c6e79", // --color-gray-60
		comment: "#484a54", // --color-gray-70
		selection: "#97979b33",
	},
	light: {
		bg: "#ffffff",
		fg: "#191b23", // --color-gray-90
		bright: "#000000",
		string: "#484a54", // --color-gray-70
		punctuation: "#8a8e9b", // --color-gray-50
		comment: "#a9abb6", // --color-gray-40
		selection: "#97979b33",
	},
};

function makeTheme(name, type, c) {
	return new ExpressiveCodeTheme({
		name,
		type,
		colors: {
			"editor.background": c.bg,
			"editor.foreground": c.fg,
			"editor.selectionBackground": c.selection,
			"editorLineNumber.foreground": c.comment,
			"terminal.ansiBlack": "#0a0a0d",
			"terminal.ansiRed": "#ff3e47",
			"terminal.ansiGreen": "#07f53f",
			"terminal.ansiYellow": "#e8cf27",
			"terminal.ansiBlue": "#054bff",
			"terminal.ansiMagenta": "#ff00d2",
			"terminal.ansiCyan": "#00e5ff",
			"terminal.ansiWhite": "#ffffff",
		},
		tokenColors: [
			{
				scope: ["comment", "punctuation.definition.comment"],
				settings: { foreground: c.comment, fontStyle: "italic" },
			},
			{
				scope: [
					"punctuation",
					"meta.brace",
					"punctuation.definition.tag",
					"keyword.operator",
				],
				settings: { foreground: c.punctuation },
			},
			{
				scope: [
					"keyword",
					"storage.type",
					"storage.modifier",
					"keyword.control",
					"entity.name.tag",
					"punctuation.definition.keyword",
				],
				settings: { foreground: c.bright, fontStyle: "bold" },
			},
			{
				scope: [
					"string",
					"string.template",
					"punctuation.definition.string",
					"markup.inline.raw",
				],
				settings: { foreground: c.string },
			},
			{
				scope: [
					"entity.name.function",
					"support.function",
					"meta.function-call entity.name.function",
					"variable.function",
					"entity.name.type",
					"entity.name.class",
					"support.type",
					"support.class",
					"entity.other.inherited-class",
					"constant.numeric",
					"constant.language",
					"constant.character",
					"constant.other",
					"variable.other.constant",
					"entity.other.attribute-name",
					"support.type.property-name.json",
				],
				settings: { foreground: c.bright },
			},
			{
				scope: ["variable", "variable.parameter", "meta.object-literal.key"],
				settings: { foreground: c.fg },
			},
			{
				scope: [
					"string.regexp",
					"constant.character.escape",
					"punctuation.definition.template-expression",
				],
				settings: { foreground: c.fg },
			},
			{
				scope: ["invalid", "markup.deleted"],
				settings: { foreground: c.punctuation },
			},
			{ scope: ["markup.inserted"], settings: { foreground: c.bright } },
			{ scope: ["markup.changed"], settings: { foreground: c.string } },
			{
				scope: ["markup.heading", "entity.name.section"],
				settings: { foreground: c.bright, fontStyle: "bold" },
			},
			{ scope: ["markup.bold"], settings: { fontStyle: "bold" } },
			{ scope: ["markup.italic"], settings: { fontStyle: "italic" } },
			{
				scope: ["markup.underline.link", "string.other.link"],
				settings: { foreground: c.fg, fontStyle: "underline" },
			},
		],
	});
}

export const ecThemes = [
	makeTheme("bombshell-dark", "dark", palette.dark),
	makeTheme("bombshell-light", "light", palette.light),
];
