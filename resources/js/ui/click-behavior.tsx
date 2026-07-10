import type { Method } from "@inertiajs/core";
import { createContext, useContext, type ReactNode } from "react";
import type { Node } from "@lattice-php/lattice/core/types";
import { getActionEffects } from "@lattice-php/lattice/effects/dispatch";
import { useEffectDispatcher } from "@lattice-php/lattice/effects/use-effect-dispatcher";
import type { Effect } from "@lattice-php/lattice/types/generated";

export type ClickBehavior =
  | { kind: "navigate"; href: string; method: Method }
  | { kind: "action"; action: Node<"action"> }
  | { kind: "effects"; onClick: () => void }
  | { kind: "none" };

export type TriggerState = { onClick: () => void; processing: boolean };

export type ActionTriggerRenderer = (props: {
  action: Node<"action">;
  children: (trigger: TriggerState) => ReactNode;
}) => ReactNode;

const ActionTriggerContext = createContext<ActionTriggerRenderer | null>(null);

export function ActionTriggerProvider({
  children,
  render,
}: {
  children: ReactNode;
  render: ActionTriggerRenderer;
}) {
  return <ActionTriggerContext.Provider value={render}>{children}</ActionTriggerContext.Provider>;
}

export function useActionTrigger(): ActionTriggerRenderer | null {
  return useContext(ActionTriggerContext);
}

export function ActionTrigger({
  action,
  children,
}: {
  action: Node<"action">;
  children: (trigger: TriggerState) => ReactNode;
}) {
  const render = useActionTrigger();

  if (!render) {
    throw new Error("Action triggers require an ActionTriggerProvider.");
  }

  return <>{render({ action, children })}</>;
}

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
