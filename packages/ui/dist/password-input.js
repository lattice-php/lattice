import { cn } from "./lib/utils.js";
import { Icon } from "./icons/sprite.js";
import { Input } from "./input.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/password-input.tsx
function PasswordInput({ className, ref, ...props }) {
	const [showPassword, setShowPassword] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx(Input, {
			type: showPassword ? "text" : "password",
			className: cn("pr-10", className),
			ref,
			...props
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			"data-test": typeof props.name === "string" ? `${props.name}-visibility` : "password-visibility",
			onClick: () => setShowPassword((prev) => !prev),
			className: "absolute inset-y-0 right-0 flex items-center rounded-r-lt-sm px-3 text-lt-muted-fg hover:text-lt-fg focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 focus-visible:outline-none",
			"aria-label": showPassword ? "Hide password" : "Show password",
			tabIndex: -1,
			children: showPassword ? /* @__PURE__ */ jsx(Icon, {
				name: "eye-off",
				className: "size-lt-icon-md"
			}) : /* @__PURE__ */ jsx(Icon, {
				name: "eye",
				className: "size-lt-icon-md"
			})
		})]
	});
}
//#endregion
export { PasswordInput as default };

//# sourceMappingURL=password-input.js.map