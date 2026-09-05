import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import { ActionTrigger, useClickBehavior } from "@lattice-php/ui/click-behavior";
import { useNavigation } from "@lattice-php/ui/navigation";

export type RowTriggerState = {
  clickable: boolean;
  href: string | null;
  processing: boolean;
  onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

const INTERACTIVE_SELECTOR =
  "a, button, input, label, select, textarea, [role=menuitem], [role=checkbox]";

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) != null;
}

function activatesRow(event: KeyboardEvent<HTMLElement>): boolean {
  return event.target === event.currentTarget && (event.key === "Enter" || event.key === " ");
}

const idle: RowTriggerState = { clickable: false, href: null, processing: false };

function activation(activate: () => void, processing: boolean): RowTriggerState {
  return {
    clickable: true,
    href: null,
    processing,
    onClick: (event) => {
      if (processing || isInteractiveTarget(event.target)) {
        return;
      }

      activate();
    },
    onKeyDown: (event) => {
      if (processing || !activatesRow(event)) {
        return;
      }

      event.preventDefault();
      activate();
    },
  };
}

/**
 * A row's click behavior, resolved from the `rowClick` node the server put on
 * the row: the hooks live here because a row is rendered inside a `.map()`.
 * An action row leans on `ActionTrigger`, so confirmation, action forms, and
 * effects behave exactly as they do on an action button.
 */
export function RowTrigger({
  children,
  click,
}: {
  children: (state: RowTriggerState) => ReactNode;
  click: Node<"table.row-click"> | null;
}): ReactNode {
  const behavior = useClickBehavior(click?.props ?? {});
  const { visit } = useNavigation();

  if (behavior.kind === "action") {
    return (
      <ActionTrigger action={behavior.action}>
        {({ onClick, processing }) => children(activation(onClick, processing))}
      </ActionTrigger>
    );
  }

  if (behavior.kind === "modal" || behavior.kind === "effects") {
    return children(activation(behavior.onClick, false));
  }

  if (behavior.kind === "navigate") {
    const { href } = behavior;
    const openInNewTab = (): void => {
      window.open(href, "_blank");
    };

    return children({
      ...activation(() => visit(href), false),
      href,
      onClick: (event) => {
        if (isInteractiveTarget(event.target)) {
          return;
        }

        if (event.metaKey || event.ctrlKey) {
          openInNewTab();

          return;
        }

        visit(href);
      },
      onAuxClick: (event) => {
        if (event.button !== 1 || isInteractiveTarget(event.target)) {
          return;
        }

        openInNewTab();
      },
    });
  }

  return children(idle);
}
