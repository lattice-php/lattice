import { cn } from "./lib/utils.js";
import { Input } from "./input.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { HexColorPicker } from "react-colorful";
//#region resources/js/color-picker.tsx
function normalizeHex(input) {
	const raw = input.trim().replace(/^#/, "").toLowerCase();
	if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;
	if (/^[0-9a-f]{3}$/.test(raw)) return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
	return null;
}
function ColorPicker({ value, onChange, palette, hexLabel = "Hex color", paletteLabel = "Color palette" }) {
	const [draft, setDraft] = useState(null);
	const color = normalizeHex(value) ?? "#6b7280";
	return /* @__PURE__ */ jsxs("div", {
		className: "flex w-56 flex-col gap-3",
		"data-slot": "color-picker",
		children: [
			/* @__PURE__ */ jsx(HexColorPicker, {
				className: "!w-full",
				color,
				onChange
			}),
			palette.length > 0 && /* @__PURE__ */ jsx("div", {
				"aria-label": paletteLabel,
				className: "flex flex-wrap gap-1.5",
				role: "listbox",
				children: palette.map((swatch) => {
					const normalized = normalizeHex(swatch) ?? swatch;
					return /* @__PURE__ */ jsx("button", {
						"aria-label": normalized,
						"aria-selected": normalized === color,
						className: cn("size-6 shrink-0 rounded-full border border-lt-border", normalized === color && "ring-2 ring-lt-ring ring-offset-1"),
						onClick: () => onChange(normalized),
						role: "option",
						style: { background: swatch },
						type: "button"
					}, swatch);
				})
			}),
			/* @__PURE__ */ jsx(Input, {
				"aria-label": hexLabel,
				onBlur: () => setDraft(null),
				onChange: (event) => {
					const text = event.target.value;
					const hex = normalizeHex(text);
					setDraft(text);
					if (hex !== null) onChange(hex);
				},
				value: draft ?? color
			})
		]
	});
}
//#endregion
export { ColorPicker, normalizeHex };

//# sourceMappingURL=color-picker.js.map