/**
 * FLIP reorder: animates registered elements from their previous to current
 * position whenever `orderSignature` changes. Imperative style writes only, so
 * it does not affect React render or the memoised rows.
 */
export declare function useFlipReorder(orderSignature: string): (key: string, el: HTMLElement | null) => void;
