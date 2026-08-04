import { ActionEffect } from './dispatch.js';
/**
 * Returns a dispatcher bound to the built-in handlers plus any consumer handlers
 * in the current registry. The built-ins are merged in directly so they fire even
 * with no <Provider> in scope (effects are infrastructural) — this is the single
 * place built-ins enter dispatch.
 */
export declare function useEffectDispatcher(): (effects: ActionEffect[]) => void;
