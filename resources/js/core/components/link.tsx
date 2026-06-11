import type { Method } from "@inertiajs/core";
import { Link } from "@inertiajs/react";
import type { ComponentProps } from "react";
import { cn } from "@lattice/lattice/lib/utils";
import type { RendererComponent } from "@lattice/lattice/core/types";

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
    href={node.props.href ?? "#"}
    method={getLinkMethod(node.props.method ?? "get")}
    tabIndex={node.props.tabIndex ?? undefined}
  >
    {node.props.label}
  </TextLink>
);

export default LinkComponent;
export { TextLink };
