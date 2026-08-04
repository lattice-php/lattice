import { cn } from "./lib/utils.js";
import { Icon } from "./icons/sprite.js";
import { useT } from "./i18n/instance.js";
import { useDebouncedCallback } from "./lib/use-debounced-callback.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/combobox.tsx
var SEARCH_DEBOUNCE_MS = 250;
/**
* A popover select list with an optional search box and single/multi selection.
*
* Selection state is controlled by the consumer (`selected` + `onSelect`); the
* consumer also owns option fetching. Pass `onSearch` for remote search (the
* combobox debounces the query and renders `options` as given); omit it to
* filter the provided `options` locally by label. The combobox closes itself
* after a single-select. Pass `renderOption` to render rich option rows; the
* option's label stays the accessible name. `onSelect` toggles selection
* (used by dropdown-row clicks); tag-entry commits (Enter/comma/paste) that
* match an existing option call `onCommit` instead, falling back to
* `onSelect` when it is not provided, so consumers can make tag entry
* additive instead of toggling.
*/
function Combobox({ contentClassName, creatable = false, emptyLabel, loading = false, multiple = false, onCommit, onCreate, onSearch, onSelect, open, onOpenChange, options, renderOption, searchLabel, searchPlaceholder, selected, showSearch = true, testId, trigger, triggerClassName, triggerProps }) {
	const { t } = useT("lattice");
	const [query, setQuery] = useState("");
	function commitCreate(raw) {
		const tokens = raw.split(",").map((token) => token.trim()).filter(Boolean);
		for (const token of tokens) {
			const match = options.find((option) => option.label.toLowerCase() === token.toLowerCase());
			if (match) (onCommit ?? onSelect)(match.value);
			else onCreate?.(token);
		}
		if (multiple) setQuery("");
		else close();
	}
	const exactMatch = options.some((option) => option.label.toLowerCase() === query.trim().toLowerCase());
	const runSearch = useDebouncedCallback((next) => onSearch?.(next), SEARCH_DEBOUNCE_MS);
	useEffect(() => {
		if (!onSearch || !open) return;
		runSearch(query);
		return () => runSearch.cancel();
	}, [
		query,
		onSearch,
		open,
		runSearch
	]);
	const visibleOptions = onSearch ? options : options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
	function close() {
		setQuery("");
		onOpenChange(false);
	}
	function choose(value) {
		onSelect(value);
		if (!multiple) close();
	}
	return /* @__PURE__ */ jsxs(Popover, {
		open,
		onOpenChange: (next) => next ? onOpenChange(true) : close(),
		children: [/* @__PURE__ */ jsx(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsx("button", {
				type: "button",
				className: triggerClassName,
				...triggerProps,
				children: trigger
			})
		}), /* @__PURE__ */ jsxs(PopoverContent, {
			align: "start",
			className: cn("w-[var(--radix-popover-trigger-width)] overflow-hidden p-0", contentClassName),
			children: [showSearch && /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 border-b border-lt-border px-3 py-2",
				children: [/* @__PURE__ */ jsx("input", {
					"aria-label": searchLabel ?? t("form.search-options", "Search options"),
					"data-slot": "combobox-search",
					"data-test": testId ? `${testId}-search` : void 0,
					className: "w-full bg-transparent text-sm outline-none placeholder:text-lt-muted-fg",
					onChange: (event) => {
						const next = event.target.value;
						if (creatable && next.includes(",")) {
							commitCreate(next);
							return;
						}
						setQuery(next);
					},
					onKeyDown: (event) => {
						if (creatable && event.key === "Enter" && query.trim() !== "") {
							event.preventDefault();
							commitCreate(query);
						}
					},
					placeholder: searchPlaceholder,
					value: query
				}), loading && /* @__PURE__ */ jsx(Icon, {
					name: "loader-2",
					"aria-hidden": "true",
					className: "size-lt-icon-md shrink-0 animate-spin text-lt-muted-fg"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "max-h-60 overflow-y-auto p-1",
				role: "listbox",
				children: [creatable && query.trim() !== "" && !exactMatch && /* @__PURE__ */ jsxs("button", {
					className: "flex w-full items-center gap-2 rounded-lt-sm px-3 py-1.5 text-left text-sm transition-colors hover:bg-lt-accent hover:text-lt-accent-fg",
					"data-test": testId ? `${testId}-create` : void 0,
					onClick: () => commitCreate(query),
					type: "button",
					children: [/* @__PURE__ */ jsx(Icon, {
						name: "plus",
						"aria-hidden": "true",
						className: "size-lt-icon-md shrink-0"
					}), t("form.create-option", "Create \"{{label}}\"", { label: query.trim() })]
				}), visibleOptions.length === 0 && !(creatable && query.trim() !== "" && !exactMatch) ? /* @__PURE__ */ jsx("p", {
					className: "px-3 py-2 text-sm text-lt-muted-fg",
					children: emptyLabel
				}) : visibleOptions.map((option) => {
					const isSelected = selected.includes(option.value);
					return /* @__PURE__ */ jsxs("button", {
						"aria-label": renderOption ? option.label : void 0,
						"aria-selected": isSelected,
						className: cn("flex w-full items-center justify-between gap-2 rounded-lt-sm px-3 py-1.5 text-left text-sm transition-colors hover:bg-lt-accent hover:text-lt-accent-fg", isSelected && "bg-lt-accent/60"),
						"data-slot": "combobox-option",
						"data-test": testId ? `${testId}-option-${option.value}` : void 0,
						"data-value": option.value,
						onClick: () => choose(option.value),
						role: "option",
						type: "button",
						children: [renderOption ? /* @__PURE__ */ jsx("span", {
							className: "flex min-w-0 flex-1 items-center gap-2",
							children: renderOption(option)
						}) : option.label, isSelected && /* @__PURE__ */ jsx(Icon, {
							name: "check",
							"aria-hidden": "true",
							className: "size-lt-icon-md shrink-0"
						})]
					}, option.value);
				})]
			})]
		})]
	});
}
//#endregion
export { Combobox };

//# sourceMappingURL=combobox.js.map