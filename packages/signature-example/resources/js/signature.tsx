import type { RendererComponent } from "@lattice-php/core/types";
import { Icon } from "@lattice-php/ui/icons";
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
      <Icon name="signature-example-pen" data-test="signature-icon" className="size-4" />
      {label}
      <span data-test="signature-css-probe" className="signature-example-css-probe">
        package css missing
      </span>
      <span data-test="signature-scan-probe" className="[display:none]">
        package tailwind scan missing
      </span>
    </div>
  );
};

export default Signature;
