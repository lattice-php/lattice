import type { RendererComponent } from "@lattice-php/core/types";
import { useT } from "@lattice-php/lattice/runtime";

const Signature: RendererComponent<"signature"> = ({ node }) => {
  const { t } = useT("signature-example");
  const label =
    typeof node.props?.label === "string" ? node.props.label : t("placeholder", "Sign here");

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
