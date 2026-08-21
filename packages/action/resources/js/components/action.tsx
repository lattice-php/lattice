import { Button } from "@lattice-php/ui/components/button/button";
import { Spinner } from "@lattice-php/ui/primitives/spinner";
import { prefixedTestId } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { IconRenderer } from "@lattice-php/ui/icons";
import { actionMenuItemClassName, useActionMenu } from "@lattice-php/ui/action-menu-context";
import { useAction } from "@lattice-php/action/hooks/use-action";
import { actionLabel } from "@lattice-php/action/lib/action-label";

export const ActionComponent: RendererComponent<"action"> = ({ node }) => {
  const endpoint = node.props.endpoint ?? "";
  const icon = node.props.icon;
  const label = actionLabel(node);
  const isMenuItem = useActionMenu();
  const { variant, emphasis } = node.props;
  const { processing, requestSubmit } = useAction(node);
  const testId = node.key ?? prefixedTestId("action", node.id);

  return (
    <Button
      className={isMenuItem ? actionMenuItemClassName : undefined}
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
  );
};
