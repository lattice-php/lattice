import { useCallback, useEffect, useRef } from "react";
import { renderBlock, type EditorEndpoint } from "../../endpoint";
import { setRendered, type EditorStore } from "../../document/store";
import { findBlock } from "../../document/tree";

export const RENDER_DEBOUNCE_MS = 300;

/**
 * Re-renders blocks on the server after their data changed. Requests for the
 * same block within the debounce window collapse into one, and a response
 * that arrives after a newer request for the same block is dropped.
 */
export function useRenderQueue(
  store: EditorStore,
  endpoint: EditorEndpoint | null,
  delayMs = RENDER_DEBOUNCE_MS,
) {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const generations = useRef(new Map<string, number>());

  const run = useCallback(
    async (id: string) => {
      if (!endpoint) {
        return;
      }

      const entry = findBlock(store.getState().document, id);

      if (!entry) {
        return;
      }

      const generation = (generations.current.get(id) ?? 0) + 1;
      generations.current.set(id, generation);
      const result = await renderBlock(endpoint, entry.node).catch(() => null);

      if (!result || generations.current.get(id) !== generation) {
        return;
      }

      store.setState((state) =>
        findBlock(state.document, id) ? setRendered(state, id, result.node, result.errors) : state,
      );
    },
    [endpoint, store],
  );

  const requestRender = useCallback(
    (id: string) => {
      const pending = timers.current.get(id);

      if (pending) {
        clearTimeout(pending);
      }

      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          void run(id);
        }, delayMs),
      );
    },
    [delayMs, run],
  );

  useEffect(() => {
    const queued = new Set<string>();
    const unsubscribe = store.subscribe(() => {
      for (const id of store.getState().staleIds) {
        if (!queued.has(id)) {
          queued.add(id);
          requestRender(id);
        }
      }

      const settled = Array.from(queued).filter((id) => !store.getState().staleIds.includes(id));
      settled.forEach((id) => queued.delete(id));
    });

    return () => {
      unsubscribe();
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, [requestRender, store]);

  return requestRender;
}
