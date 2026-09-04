import { RichDocument } from './typing';
export type TypingHandlers = {
    /** Enter in the middle or at the end of the text: keep `before`, open a paragraph holding `after`. */
    splitRich: (before: RichDocument | null, after: RichDocument | null) => boolean;
    splitText: (before: string, after: string) => boolean;
    /** Backspace at the very start: hand the content to the previous block and leave. */
    mergeBackward: (content: RichDocument | null) => boolean;
    /** Arrow keys at the first or last line: move into the neighbouring block. */
    arrow: (direction: "up" | "down") => boolean;
    /** Slash menu: swap an empty block for another type, or add the type below. */
    insertType: (typeKey: string, replaceWhenEmpty: boolean) => void;
};
/**
 * The Gutenberg-style keyboard behaviours shared by every inline editor of a
 * block, expressed as document transitions plus focus hand-offs.
 */
export declare function useTypingHandlers(blockId: string, field: string): TypingHandlers;
