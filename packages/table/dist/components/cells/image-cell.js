import { cn } from "@lattice-php/ui/lib/utils";
import { jsx } from "react/jsx-runtime";
import { PreviewableImage } from "@lattice-php/ui/image-preview";
//#region resources/js/components/cells/image-cell.tsx
var ImageCell = ({ column, props, value }) => {
	const url = typeof value === "string" ? value : "";
	if (url === "") return null;
	const size = props.size ?? 32;
	return /* @__PURE__ */ jsx(PreviewableImage, {
		alt: column.props.label ?? "",
		className: cn("object-cover", props.circular ? "rounded-full" : "rounded-lt-sm"),
		height: size,
		previewable: props.previewable,
		src: url,
		testId: `preview-${column.key}`,
		width: size
	});
};
//#endregion
export { ImageCell };

//# sourceMappingURL=image-cell.js.map