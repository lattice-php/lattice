import type { Method } from "@inertiajs/core";
import { Link } from "@inertiajs/react";
import type { ComponentProps } from "react";
import { cn } from "@lattice/lattice/lib/utils";
import { getOptionalNumberProp, getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import type { Link as LinkProps } from "@lattice/lattice/generated/types";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    link: LinkProps;
  }
}

function TextLink({ className = "", children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
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
export { TextLink };
