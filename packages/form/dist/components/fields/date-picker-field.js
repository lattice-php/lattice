import { parseTimeString } from "./time-picker-columns.js";
import { TimePicker } from "./time-picker.js";
import { formatDateDisplayValue, formatDateTimeDisplayValue, formatDateTimeValue, formatDateValue, formatTimeInputValue, parseDateDisplayValue, parseDateTimeDisplayValue, parseDateTimeValue, parseDateValue } from "./date-picker-value.js";
import { createElement, useId, useMemo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useLocale } from "@lattice-php/ui/i18n";
import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { Button } from "@lattice-php/ui/button";
import { Input } from "@lattice-php/ui/input";
import * as datePicker from "@zag-js/date-picker";
import { normalizeProps, useMachine } from "@zag-js/react";
//#region resources/js/components/fields/date-picker-field.tsx
function DatePickerField({ mode, controlProps, label, name, testId, value, min, max, step, disabled, readOnly, autoFocus = false, tabIndex, timezone = "UTC", onChange, onBlur }) {
	const id = useId();
	const { locale } = useLocale();
	const selected = useMemo(() => [mode === "date" ? parseDateValue(value) : parseDateTimeValue(value, timezone)].filter(Boolean), [
		mode,
		timezone,
		value
	]);
	const service = useMachine(datePicker.machine, {
		id,
		name,
		value: selected.length > 0 ? selected : void 0,
		min: min ? parseDateValue(min) : void 0,
		max: max ? parseDateValue(max) : void 0,
		disabled,
		readOnly,
		locale,
		selectionMode: "single",
		timeZone: timezone,
		closeOnSelect: mode === "date",
		format(date) {
			return mode === "date" ? formatDateDisplayValue(date, locale) : formatDateTimeDisplayValue(date, locale, timezone);
		},
		parse(text) {
			return mode === "date" ? parseDateDisplayValue(text, locale) : parseDateTimeDisplayValue(text, locale, timezone);
		},
		onValueChange(details) {
			const next = details.value[0];
			onChange(mode === "date" ? formatDateValue(next) : formatDateTimeValue(next, timezone));
		},
		onOpenChange(details) {
			if (!details.open) onBlur?.();
		}
	});
	const api = datePicker.connect(service, normalizeProps);
	const { name: _inputName, onInput, ...inputProps } = api.getInputProps();
	const submittedValue = mode === "date" ? formatDateValue(selected[0]) : formatDateTimeValue(selected[0], timezone);
	return /* @__PURE__ */ jsxs("div", {
		...api.getRootProps(),
		className: cn("relative", api.open && "z-lt-popover"),
		children: [
			/* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: submittedValue,
				"data-test": `${testId}-value`
			}),
			/* @__PURE__ */ jsxs("div", {
				...api.getControlProps(),
				className: "flex gap-2",
				children: [/* @__PURE__ */ jsx(Input, {
					...inputProps,
					...controlProps,
					"aria-label": label,
					autoFocus,
					"data-test": testId,
					disabled,
					onInput: (event) => {
						onInput?.(event);
						if (mode !== "date") return;
						const normalized = normalizeDateInputValue(event.currentTarget.value);
						if (!normalized) return;
						const next = parseDateValue(normalized);
						if (!next) return;
						event.currentTarget.value = normalized;
						api.setValue([next]);
						event.currentTarget.value = formatDateDisplayValue(next, locale);
						onChange(formatDateValue(next));
					},
					readOnly,
					tabIndex: tabIndex ?? void 0
				}), /* @__PURE__ */ jsx(Button, {
					...api.getTriggerProps(),
					"aria-label": `Open ${label || name} calendar`,
					disabled: disabled || readOnly,
					size: "icon",
					type: "button",
					variant: "secondary",
					children: /* @__PURE__ */ jsx(Icon, {
						name: "calendar",
						className: "size-lt-icon-md",
						"aria-hidden": "true"
					})
				})]
			}),
			api.open ? /* @__PURE__ */ jsx("div", {
				...api.getPositionerProps(),
				className: "absolute z-lt-popover mt-2 rounded-lt-sm border border-lt-border bg-lt-popover p-3 text-lt-popover-fg shadow-lt-md",
				children: /* @__PURE__ */ jsxs("div", {
					...api.getContentProps(),
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-2",
							children: [
								/* @__PURE__ */ jsx(Button, {
									...api.getPrevTriggerProps(),
									emphasis: "ghost",
									size: "icon",
									type: "button",
									children: /* @__PURE__ */ jsx(Icon, {
										name: "chevron-left",
										className: "size-lt-icon-md",
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ jsx("div", {
									...api.getRangeTextProps(),
									className: "text-sm font-medium text-lt-fg"
								}),
								/* @__PURE__ */ jsx(Button, {
									...api.getNextTriggerProps(),
									emphasis: "ghost",
									size: "icon",
									type: "button",
									children: /* @__PURE__ */ jsx(Icon, {
										name: "chevron-right",
										className: "size-lt-icon-md",
										"aria-hidden": "true"
									})
								})
							]
						}),
						/* @__PURE__ */ jsxs("table", {
							...api.getTableProps(),
							className: "w-full border-collapse text-sm",
							children: [/* @__PURE__ */ jsx("thead", {
								...api.getTableHeadProps(),
								children: /* @__PURE__ */ jsx("tr", {
									...api.getTableRowProps(),
									children: api.weekDays.map((day) => /* @__PURE__ */ createElement("th", {
										...api.getTableHeaderProps(),
										"aria-label": day.long,
										key: day.value.toString(),
										className: "size-8 text-center text-xs font-medium text-lt-muted-fg"
									}, day.narrow))
								})
							}), /* @__PURE__ */ jsx("tbody", {
								...api.getTableBodyProps(),
								children: api.weeks.map((week, weekIndex) => /* @__PURE__ */ createElement("tr", {
									...api.getTableRowProps(),
									key: weekIndex
								}, week.map((day) => {
									const state = api.getDayTableCellState({ value: day });
									return /* @__PURE__ */ createElement("td", {
										...api.getDayTableCellProps({ value: day }),
										key: day.toString(),
										className: "p-0 text-center"
									}, /* @__PURE__ */ jsx("button", {
										...api.getDayTableCellTriggerProps({ value: day }),
										type: "button",
										className: cn("size-8 rounded-lt-sm text-sm text-lt-fg hover:bg-lt-muted", state.selected && "bg-lt-primary text-lt-primary-fg", state.outsideRange && "text-lt-muted-fg", state.disabled && "cursor-not-allowed opacity-40"),
										children: day.day
									}));
								})))
							})]
						}),
						mode === "date-time" ? /* @__PURE__ */ jsx(TimePicker, {
							value: parseTimeString(formatTimeInputValue(selected[0], timezone)),
							onChange: (next) => api.setTime({
								hour: next.hour,
								minute: next.minute,
								second: next.second
							}),
							step,
							disabled,
							readOnly,
							testId: `${testId}-time`
						}) : null
					]
				})
			}) : null
		]
	});
}
function normalizeDateInputValue(value) {
	const compact = value.replace(/\D/g, "");
	if (compact.length !== 8) return;
	return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}
//#endregion
export { DatePickerField };

//# sourceMappingURL=date-picker-field.js.map