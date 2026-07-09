import type { Method } from "@inertiajs/core";
import type { ReactNode } from "react";
import { useAction } from "@lattice-php/lattice/action/hooks/use-action";
import type { Node } from "@lattice-php/lattice/core/types";
import { getActionEffects } from "@lattice-php/lattice/effects/dispatch";
import { useEffectDispatcher } from "@lattice-php/lattice/effects/use-effect-dispatcher";
import type { Effect } from "@lattice-php/lattice/types/generated";

export type ClickBehavior =
  | { kind: "navigate"; href: string; method: Method }
  | { kind: "action"; action: Node<"action"> }
  | { kind: "effects"; onClick: () => void }
  | { kind: "none" };

/**
 * The shared click model for Link/Button/MenuItem: a clickable carries exactly
 * one behavior — navigate to an href, run a server action, or dispatch client
 * effects. This resolves it without touching the action machinery, so plain
 * links/labels stay cheap; the `action` behavior renders through {@link ActionTrigger}.
 */
export function useClickBehavior(props: {
  href?: string | null;
  method?: Method | null;
  action?: Node | null;
  effects?: Effect[] | null;
}): ClickBehavior {
  const dispatch = useEffectDispatcher();
  const action = (props.action ?? null) as Node<"action"> | null;
  const effects = props.effects ?? [];

  if (action) {
    return { kind: "action", action };
  }

  if (effects.length > 0) {
    return { kind: "effects", onClick: () => dispatch(getActionEffects(effects)) };
  }

  if (props.href != null && props.href !== "") {
    return { kind: "navigate", href: props.href, method: props.method ?? "get" };
  }

  return { kind: "none" };
}

export type TriggerState = { onClick: () => void; processing: boolean };

/**
 * Runs a server action's gate (confirm/form) and renders its overlays, handing
 * the host a click handler + processing state to render its own element with.
 * Only mounted for the `action` behavior, so a plain link never runs `useAction`.
 */
export function ActionTrigger({
  action,
  children,
}: {
  action: Node<"action">;
  children: (trigger: TriggerState) => ReactNode;
}) {
  const { processing, requestSubmit, overlays } = useAction(action);

  return (
    <>
      {children({ onClick: requestSubmit, processing })}
      {overlays}
    </>
  );
}
