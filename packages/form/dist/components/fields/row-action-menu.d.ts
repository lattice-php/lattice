import { RowAction as WireRowAction } from '@lattice-php/core/generated';
import { RowAction } from './row-actions.js';
type RowActionTranslate = (key: string, fallback: string) => string;
export type RowActionContext = {
    index: number;
    removable: boolean;
    onRemove: (index: number) => void;
    onDuplicate: (index: number) => void;
    t: RowActionTranslate;
};
/**
 * Resolves the declared wire row actions into the click-wired client actions the
 * kebab renders. `null` (undeclared) falls back to the built-in remove; an empty
 * array disables row actions entirely. Remove is dropped while the row is at its
 * minimum, and built-in labels resolve through i18n when the server sends none.
 */
export declare function buildRowActions(declared: WireRowAction[] | null, ctx: RowActionContext): RowAction[];
export {};
