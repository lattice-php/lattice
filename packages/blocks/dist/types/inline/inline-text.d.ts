import { InlineHandle } from '../components/editor/focus-registry';
export type InlineTextProps = {
    value: string;
    placeholder?: string | null;
    multiline?: boolean;
    className?: string;
    testId: string;
    label: string;
    onChange: (value: string) => void;
    /** Enter (without Shift): return true when the key was consumed. */
    onEnter?: (before: string, after: string) => boolean;
    /** Backspace in an empty editor: return true when the key was consumed. */
    onBackspaceEmpty?: () => boolean;
    /** Arrow up on the first line or down on the last: return true when the key was consumed. */
    onArrow?: (direction: "up" | "down") => boolean;
    handle?: (handle: InlineHandle | null) => void;
};
/**
 * A plain-text contenteditable that keeps the surrounding typography: the
 * DOM owns the caret while typing, the store value wins whenever it changes
 * from elsewhere (undo, a server render).
 */
export declare function InlineText({ value, placeholder, multiline, className, testId, label, onChange, onEnter, onBackspaceEmpty, onArrow, handle, }: InlineTextProps): import("react").JSX.Element;
