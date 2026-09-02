export type History<T> = {
  past: T[];
  present: T;
  future: T[];
  lastKey: string | null;
  lastAt: number;
};

export const COALESCE_WINDOW_MS = 800;

export function createHistory<T>(present: T): History<T> {
  return { future: [], lastAt: 0, lastKey: null, past: [], present };
}

/**
 * Record a new present. Consecutive edits sharing a `coalesceKey` within the
 * window replace the present instead of stacking, so typing into one field
 * undoes as a whole rather than keystroke by keystroke.
 */
export function push<T>(
  history: History<T>,
  present: T,
  options: { coalesceKey?: string | null; now?: number; limit?: number } = {},
): History<T> {
  const { coalesceKey = null, now = Date.now(), limit = 100 } = options;

  if (present === history.present) {
    return history;
  }

  const coalesce =
    coalesceKey !== null &&
    coalesceKey === history.lastKey &&
    now - history.lastAt <= COALESCE_WINDOW_MS;

  if (coalesce) {
    return { ...history, lastAt: now, present };
  }

  return {
    future: [],
    lastAt: now,
    lastKey: coalesceKey,
    past: [...history.past, history.present].slice(-limit),
    present,
  };
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past[history.past.length - 1];

  if (previous === undefined) {
    return history;
  }

  return {
    future: [history.present, ...history.future],
    lastAt: 0,
    lastKey: null,
    past: history.past.slice(0, -1),
    present: previous,
  };
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...future] = history.future;

  if (next === undefined) {
    return history;
  }

  return {
    future,
    lastAt: 0,
    lastKey: null,
    past: [...history.past, history.present],
    present: next,
  };
}

export function canUndo<T>(history: History<T>): boolean {
  return history.past.length > 0;
}

export function canRedo<T>(history: History<T>): boolean {
  return history.future.length > 0;
}
