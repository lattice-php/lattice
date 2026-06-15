import { Link } from "@inertiajs/react";
import type { ComponentProps } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import {
  actionMenuItemClassName,
  useActionMenu,
} from "@lattice-php/lattice/action/components/action-menu-context";

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

const LinkComponent: RendererComponent<"link"> = ({ node }) => {
  const isMenuItem = useActionMenu();

  return (
    <TextLink
      className={isMenuItem ? actionMenuItemClassName : undefined}
      data-test={nodeIdentity(node)}
      href={node.props.href ?? "#"}
      method={node.props.method ?? "get"}
      tabIndex={node.props.tabIndex ?? undefined}
    >
      {node.props.label}
    </TextLink>
  );
};

export default LinkComponent;
export { TextLink };
