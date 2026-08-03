//#region resources/js/lib/color.ts
var names = /* @__PURE__ */ new Set([
	"default",
	"muted",
	"primary",
	"success",
	"info",
	"warning",
	"danger",
	"gray",
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple"
]);
function namedColor(value) {
	return {
		kind: "named",
		value,
		dark: null
	};
}
function coerceColor(value) {
	if (typeof value === "string" && value !== "") return names.has(value) ? namedColor(value) : {
		kind: "css",
		value,
		dark: null
	};
	if (typeof value === "object" && value !== null && "kind" in value && "value" in value) return value;
}
function colorValue(color) {
	if (color.kind === "named") return `var(--lt-color-${color.value})`;
	return color.dark === null ? color.value : `light-dark(${color.value}, ${color.dark})`;
}
function toneProps(color) {
	if (color.kind === "named") return { className: `lt-tone-${color.value}` };
	const paint = colorValue(color);
	return { style: {
		"--lt-tone-bg": `color-mix(in oklab, ${paint} 12%, transparent)`,
		"--lt-tone-fg": paint
	} };
}
//#endregion
export { coerceColor, colorValue, namedColor, toneProps };

//# sourceMappingURL=color.js.map