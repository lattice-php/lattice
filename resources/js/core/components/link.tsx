import { Link } from "@inertiajs/react";
import type { ComponentProps, ReactNode } from "react";
import { useAction } from "@lattice-php/lattice/action/use-action";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import {
  actionMenuItemClassName,
  useActionMenu,
} from "@lattice-php/lattice/action/components/action-menu-context";

const textLinkClassName =
  "text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border";

function TextLink({ className = "", children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={cn(textLinkClassName, className)} {...props}>
      {children}
    </Link>
  );
}

function ActionLink({
  action,
  className,
  children,
  testId,
}: {
  action: Node<"action">;
  className?: string;
  children: ReactNode;
  testId?: string;
}) {
  const { processing, requestSubmit, overlays } = useAction(action);

  return (
    <>
      <button
        className={cn(textLinkClassName, className)}
        data-test={testId}
        disabled={processing}
        onClick={requestSubmit}
        type="button"
      >
        {children}
      </button>
      {overlays}
    </>
  );
}

const LinkComponent: RendererComponent<"link"> = ({ node }) => {
  const isMenuItem = useActionMenu();
  const action = node.props.action;

  if (action) {
    return (
      <ActionLink
        action={action as Node<"action">}
        className={isMenuItem ? actionMenuItemClassName : undefined}
        testId={nodeIdentity(node)}
      >
        {node.props.label}
      </ActionLink>
    );
  }

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
