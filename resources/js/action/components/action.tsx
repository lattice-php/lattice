import { Button } from "@lattice-php/lattice/ui/button";
import { Spinner } from "@lattice-php/lattice/ui/spinner";
import { prefixedTestId } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { IconRenderer } from "@lattice-php/lattice/icons";
import { useAction } from "../hooks/use-action";
import { actionMenuItemClassName, useActionMenu } from "./action-menu-context";

const ActionComponent: RendererComponent<"action"> = ({ node }) => {
  const endpoint = node.props.endpoint ?? "";
  const icon = node.props.icon;
  const label = node.props.label ?? "Run action";
  const isMenuItem = useActionMenu();
  const variant = node.props.variant ?? "default";
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
        variant={isMenuItem ? "ghost" : variant}
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
