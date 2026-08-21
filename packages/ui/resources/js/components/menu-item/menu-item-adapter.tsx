import type { Affix } from "@lattice-php/core";
import { nodeIdentity, prefixedNodeTestId } from "@lattice-php/core/test-id";
import type { RendererComponent, Schema } from "@lattice-php/core/types";
import { ActionTrigger, useClickBehavior } from "../../click-behavior";
import { IconRenderer } from "../../icons";
import { cn } from "../../lib/utils";
import { useNavigation } from "../../navigation";
import { NavMenuItem } from "./menu-item";

function MenuAffix({ affix, className }: { affix: Affix; className?: string }) {
  if (affix.icon) {
    return <IconRenderer className={cn("size-lt-icon-md shrink-0", className)} icon={affix.icon} />;
  }

  return <span className={cn("shrink-0 text-sm text-lt-muted-fg", className)}>{affix.text}</span>;
}

function schemaContainsPath(schema: Schema | undefined, path: string | undefined): boolean {
  return (schema ?? []).some(
    (child) => child.props?.href === path || schemaContainsPath(child.schema, path),
  );
}

const MenuItemAdapter: RendererComponent<"menu-item"> = ({ children, node }) => {
  const { icon, label: rawLabel, prefix, suffix } = node.props;
  const label = rawLabel ?? "";
  const { currentUrl } = useNavigation();
  const behavior = useClickBehavior(node.props);
  const identity = nodeIdentity(node);
  const testId = prefixedNodeTestId("menu", node);
  const shared = {
    "data-lattice-component": identity,
    "data-test": testId,
    icon: icon ? <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} /> : undefined,
    label,
    prefix: prefix ? <MenuAffix affix={prefix} /> : undefined,
    suffix: suffix ? <MenuAffix affix={suffix} /> : undefined,
  };

  if (behavior.kind === "action") {
    return (
      <ActionTrigger action={behavior.action}>
        {({ onClick, processing }) => (
          <NavMenuItem {...shared} disabled={processing} onClick={onClick} />
        )}
      </ActionTrigger>
    );
  }

  if (behavior.kind === "effects" || behavior.kind === "modal") {
    return <NavMenuItem {...shared} onClick={behavior.onClick} />;
  }

  if (behavior.kind === "navigate") {
    return (
      <NavMenuItem
        {...shared}
        active={currentUrl === behavior.href}
        href={behavior.href}
        method={behavior.method}
      />
    );
  }

  return (
    <NavMenuItem {...shared} defaultOpen={schemaContainsPath(node.schema, currentUrl)}>
      {children}
    </NavMenuItem>
  );
};

export default MenuItemAdapter;
