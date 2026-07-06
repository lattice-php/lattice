import type { RendererComponent } from "@lattice-php/lattice/core/types";

const Signature: RendererComponent<"signature"> = ({ node }) => {
  const label = typeof node.props?.label === "string" ? node.props.label : "Sign here";

  return (
    <div
      data-test="signature-pad"
      className="rounded-lt-sm border border-lt-border bg-lt-surface p-4 text-sm text-lt-fg"
    >
      {label}
    </div>
  );
};

export default Signature;
