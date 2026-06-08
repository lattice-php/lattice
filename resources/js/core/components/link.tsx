import type { Method } from "@inertiajs/core";
import TextLink from "@/components/text-link";
import { getOptionalNumberProp, getStringProp } from "@/lattice/core/props";
import type { RendererComponent } from "@/lattice/core/types";

declare module "@/lattice/core/types" {
  interface ComponentProps {
    link: {
      href?: string;
      label?: string;
      method?: Method;
      tabIndex?: number;
    };
  }
}

function getLinkMethod(method: string): Method {
  if (method === "delete" || method === "patch" || method === "post" || method === "put") {
    return method;
  }

  return "get";
}

const LinkComponent: RendererComponent<"link"> = ({ node }) => (
  <TextLink
    href={getStringProp(node.props, "href", "#")}
    method={getLinkMethod(getStringProp(node.props, "method", "get"))}
    tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
  >
    {getStringProp(node.props, "label", "Link")}
  </TextLink>
);

export default LinkComponent;
