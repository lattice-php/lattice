import { EditorEndpoint } from "./endpoint";
import { EditorStore } from "./document/store";
export declare const AUTOSAVE_DELAY_MS = 5000;
/**
 * Saves the draft a few seconds after the last change and immediately when the
 * page hides, so closing the tab does not lose work. A 409 stops further saves
 * until the user resolves the conflict; the store surfaces it as a conflict.
 * The returned `saveNow` runs the same save on demand, for example to
 * overwrite a newer server revision on purpose.
 */
export declare function useAutosave(
  store: EditorStore,
  endpoint: EditorEndpoint | null,
  delayMs?: number,
): {
  saveNow: () => Promise<void>;
};
