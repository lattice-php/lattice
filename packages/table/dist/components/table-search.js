import { useEffect, useRef, useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { jsx, jsxs } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
import { Input } from "@lattice-php/ui/input";
import { useDebouncedCallback } from "@lattice-php/ui/lib/use-debounced-callback";
//#region resources/js/components/table-search.tsx
var DEBOUNCE_MS = 300;
/**
* The table-level quick-search box. Keystrokes update the input immediately and
* commit the term to the server after a short debounce; an externally-changed
* value (e.g. a filter reset) is adopted without echoing keystroke round-trips.
*/
function TableSearch({ value, onSearch }) {
	const { t } = useT("lattice");
	const [term, setTerm] = useState(value);
	const committed = useRef(value);
	useEffect(() => {
		if (value !== committed.current) {
			committed.current = value;
			setTerm(value);
		}
	}, [value]);
	function commit(next) {
		committed.current = next;
		onSearch(next);
	}
	const commitDebounced = useDebouncedCallback(commit, DEBOUNCE_MS);
	function change(next) {
		setTerm(next);
		commitDebounced(next);
	}
	function clear() {
		commitDebounced.cancel();
		setTerm("");
		commit("");
	}
	const label = t("table.search.placeholder", "Search");
	return /* @__PURE__ */ jsxs("div", {
		className: "relative w-full max-w-xs",
		children: [
			/* @__PURE__ */ jsx(Icon, {
				name: "search",
				"aria-hidden": "true",
				className: "pointer-events-none absolute left-2.5 top-1/2 size-lt-icon-sm -translate-y-1/2 text-lt-muted-fg"
			}),
			/* @__PURE__ */ jsx(Input, {
				type: "search",
				"data-test": "table-search",
				value: term,
				placeholder: label,
				"aria-label": label,
				onChange: (event) => change(event.target.value),
				className: cn("px-8", "[&::-webkit-search-cancel-button]:hidden")
			}),
			term !== "" && /* @__PURE__ */ jsx(IconButton, {
				size: "xs",
				icon: "x",
				label: t("table.search.clear", "Clear search"),
				"data-test": "table-search-clear",
				className: "absolute right-1.5 top-1/2 -translate-y-1/2",
				onClick: clear
			})
		]
	});
}
//#endregion
export { TableSearch };

//# sourceMappingURL=table-search.js.map