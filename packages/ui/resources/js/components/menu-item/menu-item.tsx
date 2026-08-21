import { useState } from "react";
import type { ReactNode } from "react";
import { useCollapsed } from "@lattice-php/core/collapsed-context";
import type { HttpMethod } from "../../generated";
import { Icon } from "../../icons";
import { cn } from "../../lib/utils";
import { useNavigation } from "../../navigation";
import { Dropdown } from "../dropdown/dropdown";

export const navMenuItemRowClassName =
  "flex items-center gap-2 rounded-lt-sm px-3 py-2 text-base font-medium text-lt-fg transition-colors hover:bg-lt-muted";

type DataAttributes = { [dataAttribute: `data-${string}`]: string | undefined };

export type NavMenuItemProps = DataAttributes & {
  /** Marks the link as the current page. */
  active?: boolean;
  /** Nested items turn this item into a group: collapsible when expanded, a flyout in a collapsed rail. */
  children?: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  href?: string;
  /** Icon-only rendering: the label becomes the accessible name. */
  icon?: ReactNode;
  label: ReactNode;
  method?: HttpMethod;
  onClick?: () => void;
  onOpenChange?: (open: boolean) => void;
  /** Controls a group's expanded state. */
  open?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

function accessibleName(label: ReactNode): string | undefined {
  return typeof label === "string" ? label : undefined;
}

/**
 * One entry of a `NavMenu`: a link (`href`), a button (`onClick`), a section
 * header (neither), or a group (`children`). Reads the surrounding sidebar's
 * collapsed state through `useCollapsed()` and shrinks to its icon with a hover
 * label while collapsed.
 */
export function NavMenuItem({
  active = false,
  children,
  defaultOpen = false,
  disabled = false,
  href,
  icon,
  label,
  method,
  onClick,
  onOpenChange,
  open,
  prefix,
  suffix,
  ...dataAttributes
}: NavMenuItemProps) {
  const collapsed = useCollapsed();
  const { Link } = useNavigation();
  const iconOnly = icon != null;
  const name = accessibleName(label);

  const content = iconOnly ? (
    icon
  ) : (
    <>
      {prefix}
      {collapsed ? (
        <span
          className="pointer-events-none absolute top-1/2 left-full z-lt-popover ml-2 hidden -translate-y-1/2 rounded-lt-sm border border-lt-border bg-lt-popover px-2 py-1 text-sm whitespace-nowrap text-lt-popover-fg shadow-lt-md group-hover:block"
          role="tooltip"
        >
          {label}
        </span>
      ) : (
        <span>{label}</span>
      )}
      {suffix ? <span className="ml-auto flex shrink-0 items-center">{suffix}</span> : null}
    </>
  );

  const rowClassName = cn(
    navMenuItemRowClassName,
    "w-full",
    collapsed && "group relative justify-center",
    iconOnly && "justify-center",
  );
  const ariaLabel = collapsed || iconOnly ? name : undefined;

  if (children) {
    if (collapsed) {
      return (
        <li>
          <Dropdown
            {...dataAttributes}
            aria-label={name}
            className={cn(navMenuItemRowClassName, "justify-center")}
            contentClassName="min-w-48"
            placement="right"
            title={name}
            trigger={icon ?? prefix ?? <span>{label}</span>}
          >
            <ul className="flex flex-col gap-1">
              <li className="px-3 py-1.5 text-xs font-semibold tracking-wide text-lt-muted-fg uppercase">
                {label}
              </li>
              {children}
            </ul>
          </Dropdown>
        </li>
      );
    }

    return (
      <NavMenuGroup
        {...dataAttributes}
        content={content}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        open={open}
      >
        {children}
      </NavMenuGroup>
    );
  }

  if (href !== undefined) {
    return (
      <li>
        <Link
          {...dataAttributes}
          aria-current={active ? "page" : undefined}
          aria-label={ariaLabel}
          className={cn(rowClassName, active && "bg-lt-muted font-medium")}
          href={href}
          method={method}
        >
          {content}
        </Link>
      </li>
    );
  }

  if (onClick) {
    return (
      <li>
        <button
          {...dataAttributes}
          aria-label={ariaLabel}
          className={rowClassName}
          disabled={disabled}
          onClick={onClick}
          type="button"
        >
          {content}
        </button>
      </li>
    );
  }

  if (collapsed) {
    return null;
  }

  return (
    <li>
      <span
        {...dataAttributes}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wide text-lt-muted-fg uppercase"
      >
        {content}
      </span>
    </li>
  );
}

function NavMenuGroup({
  children,
  content,
  defaultOpen,
  onOpenChange,
  open,
  ...dataAttributes
}: DataAttributes & {
  children: ReactNode;
  content: ReactNode;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  function toggle(): void {
    if (open === undefined) {
      setUncontrolledOpen(!isOpen);
    }

    onOpenChange?.(!isOpen);
  }

  return (
    <li>
      <button
        {...dataAttributes}
        aria-expanded={isOpen}
        className={cn(navMenuItemRowClassName, "w-full")}
        onClick={toggle}
        type="button"
      >
        {content}
        <Icon
          name="chevron-right"
          className={cn(
            "ml-auto size-lt-icon-md shrink-0 transition-transform",
            isOpen && "rotate-90",
          )}
        />
      </button>
      {isOpen ? <ul className="mt-1 flex flex-col gap-1 pl-3">{children}</ul> : null}
    </li>
  );
}
