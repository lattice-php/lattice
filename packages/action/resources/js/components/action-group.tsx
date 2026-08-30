import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { cn } from "@lattice-php/ui/lib/utils";
import { useT } from "@lattice-php/ui/i18n";
import { ActionsDropdown } from "./actions-dropdown";

export const ActionGroupComponent: RendererComponent<"action.group"> = ({ children, node }) => {
  const { t } = useT("lattice");
  const label = node.props.label ?? t("common.action-group.label", "Actions");
  const orientation = node.props.orientation;

  if (orientation) {
    return (
      <div
        aria-label={label}
        className={cn(
          "inline-flex max-w-full gap-1",
          orientation === "vertical" ? "flex-col items-stretch" : "flex-row flex-wrap items-center",
        )}
        data-test={nodeIdentity(node)}
        role="group"
      >
        {children}
      </div>
    );
  }

  return (
    <ActionsDropdown data-test={nodeIdentity(node)} label={label}>
      {children}
    </ActionsDropdown>
  );
};
