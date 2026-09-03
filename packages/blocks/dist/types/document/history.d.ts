export type History<T> = {
  past: T[];
  present: T;
  future: T[];
  lastKey: string | null;
  lastAt: number;
};
export declare function createHistory<T>(present: T): History<T>;
/**
 * Record a new present. Consecutive edits sharing a `coalesceKey` within the
 * window replace the present instead of stacking, so typing into one field
 * undoes as a whole rather than keystroke by keystroke.
 */
export declare function push<T>(
  history: History<T>,
  present: T,
  options?: {
    coalesceKey?: string | null;
    now?: number;
    limit?: number;
  },
): History<T>;
export declare function undo<T>(history: History<T>): History<T>;
export declare function redo<T>(history: History<T>): History<T>;
export declare function canUndo<T>(history: History<T>): boolean;
export declare function canRedo<T>(history: History<T>): boolean;
