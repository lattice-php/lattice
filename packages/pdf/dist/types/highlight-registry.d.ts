export declare const MATCH_HIGHLIGHT = "lt-pdf-match";
export declare const CURRENT_MATCH_HIGHLIGHT = "lt-pdf-match-current";
export type HighlightRanges = {
    all: Range[];
    current: Range[];
};
export declare function supportsHighlightApi(): boolean;
/**
 * CSS.highlights holds one document-global Highlight per name, so every page
 * (and viewer instance) contributes its ranges to a shared registry that is
 * merged into the two named highlights on each change.
 */
export declare function setHighlightRanges(owner: object, ranges: HighlightRanges): void;
export declare function clearHighlightRanges(owner: object): void;
