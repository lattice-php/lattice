import { useEffect, useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { jsx, jsxs } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
import { NativeSelect } from "@lattice-php/ui/native-select";
import { Input } from "@lattice-php/ui/input";
//#region resources/js/components/filter-value-input.tsx
function FilterValueInput({ type, label, value, processing, withSearchIcon = false, grouped = false, ariaLabel, testId, onCommit, onClear }) {
	const { t } = useT("lattice");
	const [draft, setDraft] = useState(value);
	const inputLabel = ariaLabel ?? t("table.filter.filter-by", "Filter {{label}}", { label });
	const groupedClass = grouped ? "rounded-r-none" : "";
	useEffect(() => {
		setDraft(value);
	}, [value]);
	if (type === "boolean") return /* @__PURE__ */ jsxs(NativeSelect, {
		density: "compact",
		"aria-label": inputLabel,
		"data-test": testId,
		className: groupedClass,
		disabled: processing,
		value,
		onChange: (event) => onCommit(event.target.value),
		children: [
			/* @__PURE__ */ jsx("option", {
				value: "",
				children: t("table.filter.all", "All")
			}),
			/* @__PURE__ */ jsx("option", {
				value: "true",
				children: t("table.filter.true", "True")
			}),
			/* @__PURE__ */ jsx("option", {
				value: "false",
				children: t("table.filter.false", "False")
			})
		]
	});
	if (type === "date") return /* @__PURE__ */ jsx(Input, {
		type: "date",
		density: "compact",
		"aria-label": inputLabel,
		"data-test": testId,
		className: groupedClass,
		disabled: processing,
		value: draft,
		onChange: (event) => {
			setDraft(event.target.value);
			onCommit(event.target.value);
		}
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex w-full min-w-0 items-center",
		children: [
			withSearchIcon && /* @__PURE__ */ jsx(Icon, {
				name: "search",
				"aria-hidden": "true",
				className: "pointer-events-none absolute left-2 size-lt-icon-md text-lt-muted-fg"
			}),
			/* @__PURE__ */ jsx(Input, {
				type: type === "number" ? "number" : "text",
				density: "compact",
				"aria-label": inputLabel,
				"data-test": testId,
				className: cn(groupedClass, withSearchIcon && "pl-8", onClear && "pr-8"),
				disabled: processing,
				value: draft,
				onChange: (event) => setDraft(event.target.value),
				onKeyDown: (event) => {
					if (event.key === "Enter") onCommit(draft);
				},
				onBlur: () => {
					if (draft !== value) onCommit(draft);
				}
			}),
			onClear && draft !== "" && /* @__PURE__ */ jsx(IconButton, {
				size: "xs",
				icon: "x",
				label: t("table.filter.clear", "Clear {{label}} filter", { label }),
				"data-test": testId ? `${testId}-clear` : void 0,
				className: "absolute right-1 size-6",
				disabled: processing,
				onClick: onClear
			})
		]
	});
}
//#endregion
export { FilterValueInput };

//# sourceMappingURL=filter-value-input.js.map