import { Button } from "@lattice-php/lattice/ui/button";
import { Spinner } from "@lattice-php/lattice/ui/spinner";
import { prefixedTestId } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { IconRenderer } from "@lattice-php/lattice/icons";
import {
  actionMenuItemClassName,
  useActionMenu,
} from "@lattice-php/lattice/ui/action-menu-context";
import { useAction } from "@lattice-php/lattice/action/hooks/use-action";
import { actionLabel } from "@lattice-php/lattice/action/lib/action-label";

const ActionComponent: RendererComponent<"action"> = ({ node }) => {
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
