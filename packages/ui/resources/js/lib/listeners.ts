export type Listeners = {
  subscribe: (callback: () => void) => () => void;
  notify: () => void;
};

export function createListeners(): Listeners {
  const listeners = new Set<() => void>();

  return {
    subscribe(callback) {
      listeners.add(callback);

      return () => {
        listeners.delete(callback);
      };
    },
    notify() {
      listeners.forEach((listener) => listener());
    },
  };
}
