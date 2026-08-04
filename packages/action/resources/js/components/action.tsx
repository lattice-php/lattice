import { Button } from "@lattice-php/ui/button";
import { Spinner } from "@lattice-php/ui/spinner";
import { prefixedTestId } from "@lattice-php/core/test-id";
import type { Node } from "@lattice-php/core/generated";
import { IconRenderer } from "@lattice-php/ui/icons";
import { actionMenuItemClassName, useActionMenu } from "../action-menu-context";
import { useAction } from "../hooks/use-action";
import { actionLabel } from "../lib/action-label";
import type { ReactNode } from "react";

const ActionComponent = ({ node }: { children: ReactNode; node: Node<"action"> }) => {
  const endpoint = node.props.endpoint ?? "";
  const icon = node.props.icon;
  const label = actionLabel(node);
  const isMenuItem = useActionMenu();
  const { variant, emphasis } = node.props;
  const { processing, requestSubmit, overlays } = useAction(node);
  const testId = node.key ?? prefixedTestId("action", node.id);

  return (
    <>
      <Button
        className={isMenuItem ? actionMenuItemClassName : undefined}
        data-lattice-component={node.id}
        data-test={testId}
        disabled={processing || !endpoint}
        onClick={requestSubmit}
        type="button"
        emphasis={isMenuItem ? "ghost" : emphasis}
        variant={isMenuItem ? null : variant}
      >
        {processing ? (
          <Spinner className={isMenuItem ? "size-lt-icon-sm" : undefined} />
        ) : (
          icon && (
            <IconRenderer
              className={isMenuItem ? "size-lt-icon-sm" : "size-lt-icon-md"}
              icon={icon}
            />
          )
        )}
        {label}
      </Button>

      {overlays}
    </>
  );
};

export default ActionComponent;
