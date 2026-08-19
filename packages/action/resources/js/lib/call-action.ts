import { apiFetch } from "@lattice-php/core/api";
import type { Node } from "@lattice-php/core/types";
import type { ActionEffect } from "@lattice-php/ui/effects/dispatch";
import { runAction } from "./run-action";

export type CallActionResult = {
  data: Record<string, unknown>;
  ok: boolean;
  status: number;
};

function actionData(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null) {
    return {};
  }

  const { data } = body as { data?: unknown };

  return typeof data === "object" && data !== null && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

/**
 * Runs a serialized action node against its endpoint with a JSON payload and
 * dispatches the response effects, like the built-in Action trigger does — but
 * also resolves the `ActionResult` data so a custom component can read what the
 * server produced. A node without an endpoint (the server hid or denied the
 * action) resolves ok with status 0 and no request, so optimistic UI keyed on
 * the result stays put. A thrown/network error routes through the action error
 * event and resolves not-ok with status 0.
 */
export async function callAction(
  action: Node<"action" | "action.bulk">,
  payload: Record<string, unknown>,
  dispatch: (effects: ActionEffect[]) => void,
): Promise<CallActionResult> {
  const endpoint = action.props.endpoint;
  const result: CallActionResult = { data: {}, ok: true, status: 0 };

  if (!endpoint) {
    return result;
  }

  result.ok = await runAction(async () => {
    const response = await apiFetch(endpoint, {
      body: JSON.stringify(payload),
      method: action.props.method ?? "post",
      ref: action.props.ref ?? "",
      throwOnError: false,
    });

    result.status = response.status;
    result.data = actionData(
      await response
        .clone()
        .json()
        .catch(() => ({})),
    );

    return response;
  }, dispatch);

  return result;
}
