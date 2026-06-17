import {
  type ActionEffect,
  type ActionResponse,
  dispatchActionError,
  getActionEffects,
} from "@lattice-php/lattice/effects/dispatch";

/**
 * Runs an action request and dispatches the effects from its response, routing
 * any failure through dispatchActionError. Returns whether the request
 * succeeded so callers run their own post-success cleanup (closing a dialog,
 * reloading a table). Shared by the single action button and the bulk bar so
 * the invocation contract stays in one place.
 */
export async function runAction(
  request: () => Promise<ActionResponse>,
  dispatch: (effects: ActionEffect[]) => void,
): Promise<boolean> {
  try {
    const response = await request();
    dispatch(getActionEffects(response.effects));

    return true;
  } catch (error) {
    dispatchActionError(error);

    return false;
  }
}
