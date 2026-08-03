/**
 * Subscribe to a window event for the lifetime of the component. The handler is
 * read through a ref, so a fresh handler each render never re-subscribes; pass
 * `enabled: false` to detach without unmounting.
 */
export declare function useWindowEvent(type: string, handler: (event: Event) => void, options?: {
    enabled?: boolean;
}): void;
