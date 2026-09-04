import { EditorEndpoint } from '../../endpoint';
import { EditorStore } from '../../document/store';
export declare const RENDER_DEBOUNCE_MS = 300;
/**
 * Re-renders blocks on the server after their data changed. Requests for the
 * same block within the debounce window collapse into one, and a response
 * that arrives after a newer request for the same block is dropped.
 */
export declare function useRenderQueue(store: EditorStore, endpoint: EditorEndpoint | null, delayMs?: number): (id: string) => void;
