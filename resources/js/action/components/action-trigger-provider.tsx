import type { ReactNode } from "react";
import type { Node } from "@lattice-php/lattice/core/types";
import { ActionTriggerProvider, type TriggerState } from "@lattice-php/lattice/ui/click-behavior";
import { useAction } from "@lattice-php/lattice/action/hooks/use-action";

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

export function ActionInteractionProvider({ children }: { children: ReactNode }) {
  return (
    <ActionTriggerProvider
      render={(props) => <ActionTrigger action={props.action}>{props.children}</ActionTrigger>}
    >
      {children}
    </ActionTriggerProvider>
  );
}
