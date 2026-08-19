import { useCallback } from "react";
import type { Node } from "@lattice-php/core/types";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { callAction } from "@lattice-php/action/lib/call-action";
import type { CallActionResult } from "@lattice-php/action/lib/call-action";

/**
 * `callAction` bound to the current effect dispatcher, for custom components
 * that receive a serialized action as a prop.
 */
export function useCallAction(): (
  action: Node<"action" | "action.bulk">,
  payload: Record<string, unknown>,
) => Promise<CallActionResult> {
  const dispatch = useEffectDispatcher();

  return useCallback(
    (action: Node<"action" | "action.bulk">, payload: Record<string, unknown>) =>
      callAction(action, payload, dispatch),
    [dispatch],
  );
}
