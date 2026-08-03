import { cn } from "./lib/utils.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
//#region resources/js/input-otp.tsx
function Slot({ char, hasFakeCaret, isActive }) {
	return /* @__PURE__ */ jsxs("div", {
		className: cn("relative flex h-lt-control-md w-10 items-center justify-center border-y border-r border-lt-input text-base shadow-lt-xs transition-all first:rounded-l-lt-sm first:border-l last:rounded-r-lt-sm", isActive && "z-10 border-lt-ring ring-lt-ring/50 ring-[length:var(--lt-ring-width)]"),
		children: [char, hasFakeCaret ? /* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute inset-0 flex items-center justify-center",
			children: /* @__PURE__ */ jsx("div", { className: "bg-lt-fg h-5 w-px animate-pulse" })
		}) : null]
	});
}
function InputOTP({ length, containerClassName, pattern = REGEXP_ONLY_DIGITS, ...props }) {
	return /* @__PURE__ */ jsx(OTPInput, {
		maxLength: length,
		pattern,
		containerClassName: cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName),
		render: ({ slots }) => /* @__PURE__ */ jsx("div", {
			className: "flex items-center",
			children: slots.map((slot, index) => /* @__PURE__ */ jsx(Slot, { ...slot }, index))
		}),
		...props
	});
}
//#endregion
export { InputOTP };

//# sourceMappingURL=input-otp.js.map