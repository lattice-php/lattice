import type { Method } from "@inertiajs/core";
import { Link } from "@inertiajs/react";
import type { ComponentProps } from "react";
import { cn } from "@bambamboole/lattice/lib/utils";
import { getOptionalNumberProp, getStringProp } from "@bambamboole/lattice/core/props";
import type { RendererComponent } from "@bambamboole/lattice/core/types";

declare module "@bambamboole/lattice/core/types" {
  interface ComponentProps {
    link: {
      href?: string;
      label?: string;
      method?: Method;
      tabIndex?: number;
    };
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
