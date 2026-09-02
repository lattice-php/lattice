import { useEffect, useRef } from "react";
import { saveDraft, type EditorEndpoint } from "./endpoint";
import { markConflict, markError, markSaved, markSaving, type EditorStore } from "./document/store";

export const AUTOSAVE_DELAY_MS = 5_000;

/**
 * Saves the draft a few seconds after the last change and immediately when the
 * page hides, so closing the tab does not lose work. A 409 stops further saves
 * until the user reloads; the store surfaces it as a conflict.
 */
export function useAutosave(
  store: EditorStore,
  endpoint: EditorEndpoint | null,
  delayMs = AUTOSAVE_DELAY_MS,
): void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!endpoint) {
      return;
    }

    const flush = async (keepalive = false) => {
      const state = store.getState();

      if (state.saveState !== "dirty" || inFlight.current) {
        return;
      }

      inFlight.current = true;
      store.setState(markSaving);
      const document = state.document;

      try {
        const result = await saveDraft(endpoint, document, state.revision, keepalive);

        store.setState((current) => {
          switch (result.status) {
            case "saved":
              return markSaved(current, result.revision, result.errors, document);
            case "conflict":
              return markConflict(current, result.revision);
            case "invalid":
              return markError({ ...current, errors: result.errors });
            case "failed":
              return markError(current);
          }
        });
      } catch {
        store.setState(markError);
      } finally {
        inFlight.current = false;
      }
    };

    const schedule = () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        timer.current = null;
        void flush();
      }, delayMs);
    };

    const unsubscribe = store.subscribe(() => {
      const { saveState } = store.getState();

      if (saveState === "dirty") {
        schedule();
      }
    });

    const onHide = () => {
      if (document.visibilityState === "hidden") {
        void flush(true);
      }
    };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);

      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, [delayMs, endpoint, store]);
}
