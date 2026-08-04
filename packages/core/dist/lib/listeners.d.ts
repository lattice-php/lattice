export type Listeners = {
  subscribe: (callback: () => void) => () => void;
  notify: () => void;
};
export declare function createListeners(): Listeners;
