import { Link } from "@inertiajs/react";
import type { ComponentProps } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeTestId } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";

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

const LinkComponent: RendererComponent<"link"> = ({ node }) => (
  <TextLink
    data-test={nodeTestId(node)}
    href={node.props.href ?? "#"}
    method={node.props.method ?? "get"}
    tabIndex={node.props.tabIndex ?? undefined}
  >
    {node.props.label}
  </TextLink>
);

export default LinkComponent;
export { TextLink };
