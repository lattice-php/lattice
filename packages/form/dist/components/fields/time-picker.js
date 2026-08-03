import { buildTimeColumns } from "./time-picker-columns.js";
import { useEffect, useRef } from "react";
import { jsx } from "react/jsx-runtime";
import { cn } from "@lattice-php/ui/lib/utils";
//#region resources/js/components/fields/time-picker.tsx
function TimePicker({ value, onChange, step, min, max, disabled = false, readOnly = false, labels, testId }) {
	const containerRef = useRef(null);
	const columns = buildTimeColumns(step, {
		min,
		max,
		current: value
	});
	const current = value ?? {
		hour: 0,
		minute: 0,
		second: 0
	};
	const interactive = !disabled && !readOnly;
	const columnList = [
		{
			key: "hour",
			label: labels?.hour ?? "Hour",
			options: columns.hours,
			selected: current.hour
		},
		{
			key: "minute",
			label: labels?.minute ?? "Minute",
			options: columns.minutes,
			selected: current.minute
		},
		...columns.seconds ? [{
			key: "second",
			label: labels?.second ?? "Second",
			options: columns.seconds,
			selected: current.second
		}] : []
	];
	function focusColumn(index) {
		const target = (containerRef.current?.querySelectorAll("[role=\"listbox\"]"))?.[index];
		if (!target) return;
		(target.querySelector("[data-active=\"true\"]") ?? target.querySelector("[role=\"option\"]"))?.focus();
	}
	return /* @__PURE__ */ jsx("div", {
		ref: containerRef,
		className: "flex gap-1",
		"data-test": testId,
		children: columnList.map((column, index) => /* @__PURE__ */ jsx(TimeColumn, {
			label: column.label,
			options: column.options,
			selected: value ? column.selected : null,
			disabled: !interactive,
			onSelect: (optionValue) => interactive && onChange({
				...current,
				[column.key]: optionValue
			}),
			onHorizontal: (direction) => focusColumn(index + direction)
		}, column.key))
	});
}
function TimeColumn({ label, options, selected, disabled, onSelect, onHorizontal }) {
	const listRef = useRef(null);
	const enabledValues = options.filter((option) => !option.disabled).map((option) => option.value);
	const activeValue = selected ?? enabledValues[0] ?? options[0]?.value ?? 0;
	useEffect(() => {
		(listRef.current?.querySelector("[data-active=\"true\"]"))?.scrollIntoView?.({ block: "nearest" });
	}, [selected]);
	function moveTo(nextValue) {
		if (nextValue == null) return;
		listRef.current?.querySelector(`[data-value="${nextValue}"]`)?.focus();
		onSelect(nextValue);
	}
	function handleKeyDown(event) {
		if (disabled) return;
		const index = enabledValues.indexOf(activeValue);
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveTo(enabledValues[Math.min(index + 1, enabledValues.length - 1)]);
				break;
			case "ArrowUp":
				event.preventDefault();
				moveTo(enabledValues[Math.max(index - 1, 0)]);
				break;
			case "Home":
				event.preventDefault();
				moveTo(enabledValues[0]);
				break;
			case "End":
				event.preventDefault();
				moveTo(enabledValues[enabledValues.length - 1]);
				break;
			case "ArrowRight":
				event.preventDefault();
				onHorizontal(1);
				break;
			case "ArrowLeft":
				event.preventDefault();
				onHorizontal(-1);
		}
	}
	return /* @__PURE__ */ jsx("div", {
		ref: listRef,
		role: "listbox",
		"aria-label": label,
		"aria-orientation": "vertical",
		tabIndex: -1,
		className: "flex max-h-40 w-14 flex-col overflow-y-auto",
		onKeyDown: handleKeyDown,
		children: options.map((option) => {
			const isSelected = selected === option.value;
			return /* @__PURE__ */ jsx("button", {
				type: "button",
				role: "option",
				"aria-selected": isSelected,
				"aria-label": `${label} ${option.label}`,
				"data-value": option.value,
				"data-active": activeValue === option.value,
				disabled: disabled || option.disabled,
				tabIndex: activeValue === option.value ? 0 : -1,
				onClick: () => onSelect(option.value),
				className: cn("shrink-0 rounded-lt-sm px-2 py-1 text-sm text-lt-fg hover:bg-lt-muted", isSelected && "bg-lt-primary text-lt-primary-fg", (disabled || option.disabled) && "cursor-not-allowed opacity-40"),
				children: option.label
			}, option.value);
		})
	});
}
//#endregion
export { TimePicker };

//# sourceMappingURL=time-picker.js.map