import { Button } from "./button.js";
import { useT } from "./i18n/instance.js";
import { IconButton } from "./icon-button.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/copyable-text.tsx
async function copyToClipboard(text) {
	if (!navigator?.clipboard) return false;
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}
function CopyButton({ value, label, testId, className, iconOnly = false, children }) {
	const { t } = useT("lattice");
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		if (!copied) return;
		const timeout = window.setTimeout(() => setCopied(false), 1500);
		return () => window.clearTimeout(timeout);
	}, [copied]);
	async function handleCopy() {
		if (await copyToClipboard(value)) setCopied(true);
	}
	const ariaLabel = copied ? t("common.copied-value", "Copied {{label}}", { label }) : t("common.copy-value", "Copy {{label}}", { label });
	if (iconOnly) return /* @__PURE__ */ jsx(IconButton, {
		icon: copied ? "check" : "copy",
		label: ariaLabel,
		"data-test": testId,
		className,
		onClick: () => void handleCopy()
	});
	return /* @__PURE__ */ jsx(Button, {
		type: "button",
		size: "sm",
		emphasis: "outline",
		icon: copied ? "check" : "copy",
		"data-test": testId,
		className,
		"aria-label": ariaLabel,
		onClick: () => void handleCopy(),
		children: copied ? t("common.copied", "Copied") : children ?? t("common.copy", "Copy")
	});
}
function CopyableText({ value, label, testId, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "inline-flex items-center gap-2",
		children: [children ?? value, /* @__PURE__ */ jsx(CopyButton, {
			value,
			label,
			testId
		})]
	});
}
//#endregion
export { CopyButton, CopyableText, copyToClipboard };

//# sourceMappingURL=copyable-text.js.map