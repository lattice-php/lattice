import type { ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import {
  ActionTriggerProvider,
  type ActionSubmitOptions,
  type TriggerState,
} from "@lattice-php/ui/click-behavior";
import { useAction } from "@lattice-php/action/hooks/use-action";

export function ActionTrigger({
  action,
  children,
  options,
}: {
  action: Node<"action" | "action.bulk">;
  children: (trigger: TriggerState) => ReactNode;
  options?: ActionSubmitOptions;
}) {
  const { processing, requestSubmit } = useAction(action, options);

  return children({ onClick: requestSubmit, processing });
}

export function ActionInteractionProvider({ children }: { children: ReactNode }) {
  return (
    <ActionTriggerProvider
      render={(props) => (
        <ActionTrigger action={props.action} options={props.options}>
          {props.children}
        </ActionTrigger>
      )}
    >
      {children}
    </ActionTriggerProvider>
  );
}
