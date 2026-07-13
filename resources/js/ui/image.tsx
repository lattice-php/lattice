import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { PreviewableImage } from "./image-preview";

const ImageComponent: RendererComponent<"image"> = ({ node }) => {
  const { src, alt, size, circular, previewable } = node.props;

  return (
    <PreviewableImage
      alt={alt ?? ""}
      className={cn("object-cover", circular ? "rounded-full" : "rounded-lt-sm")}
      height={size ?? undefined}
      previewable={previewable}
      src={src}
      testId={nodeIdentity(node)}
      width={size ?? undefined}
    />
  );
};

export default ImageComponent;
