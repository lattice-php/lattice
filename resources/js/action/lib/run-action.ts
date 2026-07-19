import {
  type ActionEffect,
  type ActionResponse,
  dispatchActionError,
  getActionEffects,
} from "@lattice-php/lattice/effects/dispatch";

/**
 * Runs an action request and dispatches the effects from its response body,
 * whether the action succeeded or was rejected (non-2xx). Returns whether the
 * response was ok so callers run their own post-success cleanup (closing a
 * dialog, reloading a table) only on success; a rejected action leaves the
 * dialog open. A thrown/network error routes through dispatchActionError.
 */
export async function runAction(
  request: () => Promise<Response>,
  dispatch: (effects: ActionEffect[]) => void,
): Promise<boolean> {
  try {
    const response = await request();
    const body = (await response.json().catch(() => ({}))) as ActionResponse;
    dispatch(getActionEffects(body.effects));

    return response.ok;
  } catch (error) {
    dispatchActionError(error);

    return false;
  }
}
