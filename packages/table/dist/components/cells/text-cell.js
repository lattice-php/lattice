import { CopyableCell } from "./copyable-cell.js";
import { DateTime } from "@lattice-php/ui/i18n";
import { jsx } from "react/jsx-runtime";
import { Badge } from "@lattice-php/ui/badge";
import { formatCell, resolveLink } from "@lattice-php/table/lib/format";
//#region resources/js/components/cells/text-cell.tsx
var TextCell = (args) => {
	if (args.props.multiple) return /* @__PURE__ */ jsx(MultipleCell, { ...args });
	if (args.props.badge) return /* @__PURE__ */ jsx(SingleBadgeCell, { ...args });
	return /* @__PURE__ */ jsx(PlainTextCell, { ...args });
};
function TextBadge({ label, color }) {
	if (label === "") return null;
	return /* @__PURE__ */ jsx(Badge, {
		color,
		children: label
	});
}
function MultipleCell({ column, props, value }) {
	const items = Array.isArray(value) ? value : [];
	if (items.length === 0) return null;
	if (!props.badge) return /* @__PURE__ */ jsx("span", { children: items.map((item) => formatCell(item, column)).join(", ") });
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-wrap gap-1",
		children: items.map((item, index) => {
			const chip = item;
			return /* @__PURE__ */ jsx(TextBadge, {
				label: formatCell(chip.value, column),
				color: chip.color
			}, index);
		})
	});
}
function SingleBadgeCell({ column, props, row, value }) {
	const colorKey = props.badge.colorKey;
	return /* @__PURE__ */ jsx(TextBadge, {
		label: formatCell(value, column),
		color: String(row[colorKey] ?? "")
	});
}
function PlainTextCell({ column, props, row, value }) {
	const dateProps = column.props.date;
	const href = resolveLink(column, row, value);
	const text = formatCell(value, column);
	const content = href ? /* @__PURE__ */ jsx("a", {
		className: "underline underline-offset-2",
		href,
		rel: props.link?.external ? "noreferrer" : void 0,
		target: props.link?.external ? "_blank" : void 0,
		children: text
	}) : text;
	if (dateProps && !href && !props.copyable && value !== null && value !== void 0) return /* @__PURE__ */ jsx(DateTime, {
		value,
		dateStyle: dateProps.dateStyle,
		timeStyle: dateProps.timeStyle
	});
	return /* @__PURE__ */ jsx(CopyableCell, {
		column,
		copyable: props.copyable,
		value: text,
		children: content
	});
}
//#endregion
export { TextCell };

//# sourceMappingURL=text-cell.js.map