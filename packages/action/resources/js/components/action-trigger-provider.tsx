import type { ReactNode } from "react";
import type { Node } from "@lattice-php/core/generated";
import { ActionTriggerProvider, type TriggerState } from "../click-behavior";
import { useAction } from "../hooks/use-action";

export function ActionTrigger({
  action,
  children,
}: {
  action: Node<"action" | "action.bulk">;
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

export function ActionInteractionProvider({ children }: { children: ReactNode }) {
  return (
    <ActionTriggerProvider
      render={(props) => <ActionTrigger action={props.action}>{props.children}</ActionTrigger>}
    >
      {children}
    </ActionTriggerProvider>
  );
}
