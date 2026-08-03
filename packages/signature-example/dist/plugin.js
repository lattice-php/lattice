import { createElement } from "react";
import { eagerComponent, useT } from "@lattice-php/lattice/runtime";

const Signature = ({ node }) => {
  const { t } = useT("signature-example");
  const label =
    typeof node.props?.label === "string" ? node.props.label : t("placeholder", "Sign here");

  return createElement(
    "div",
    {
      "data-test": "signature-pad",
      className: "rounded-lt-sm border border-lt-border bg-lt-surface p-4 text-sm text-lt-fg",
    },
    label,
  );
};

export default {
  name: "signature-example",
  components: {
    signature: eagerComponent(Signature),
  },
};
