import type { HttpMethod } from "./generated";
import { createContext, useContext, type ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import { getActionEffects } from "./effects/dispatch";
import { useEffectDispatcher } from "./effects/use-effect-dispatcher";
import type { Effect } from "./effects/types";
import { MODAL_HOST_MISSING_ERROR, useOptionalModal } from "./modal-host";

type ActionNode = Node<"action" | "action.bulk">;

export type ClickBehavior =
  | { kind: "navigate"; href: string; method: HttpMethod }
  | { kind: "action"; action: ActionNode }
  | { kind: "modal"; onClick: () => void }
  | { kind: "effects"; onClick: () => void }
  | { kind: "none" };

export type TriggerState = { onClick: () => void; processing: boolean };

export type ActionSubmitOptions = {
  /** Evaluated fresh at submit time, e.g. a bulk action's current selection. */
  extraData?: () => Record<string, unknown>;
  onSuccess?: () => void;
};

export type ActionTriggerRenderer = (props: {
  action: ActionNode;
  children: (trigger: TriggerState) => ReactNode;
  options?: ActionSubmitOptions;
}) => ReactNode;

const ActionTriggerContext = createContext<ActionTriggerRenderer | null>(null);

function isActionNode(node: Node): node is ActionNode {
  return node.type === "action" || node.type === "action.bulk";
}

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
  options,
}: {
  action: ActionNode;
  children: (trigger: TriggerState) => ReactNode;
  options?: ActionSubmitOptions;
}) {
  const render = useActionTrigger();

  if (!render) {
    throw new Error("Action triggers require an ActionTriggerProvider.");
  }

  return <>{render({ action, children, options })}</>;
}

export function useClickBehavior(props: {
  href?: string | null;
  method?: HttpMethod | null;
  action?: Node | null;
  effects?: Effect[] | null;
  modal?: Node<"modal"> | null;
}): ClickBehavior {
  const dispatch = useEffectDispatcher();
  const host = useOptionalModal();
  const action = props.action ?? null;
  const effects = props.effects ?? [];
  const modal = props.modal ?? null;

  if (modal) {
    return {
      kind: "modal",
      onClick: () => {
        if (!host) {
          throw new Error(MODAL_HOST_MISSING_ERROR);
        }

        host.open(modal);
      },
    };
  }

  if (action) {
    if (!isActionNode(action)) {
      throw new Error("Clickable action nodes must have type [action] or [action.bulk].");
    }

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
