import { ReactNode } from 'react';
import { Node } from '@lattice-php/core/generated';
type UseAction = {
    /** Whether the action request is in flight. */
    processing: boolean;
    /** Gate then run the action: open the form, confirm, or dispatch directly. */
    requestSubmit: () => void;
    /** The confirm dialog and action form rendered next to the trigger. */
    overlays: ReactNode;
};
/**
 * The shared action machinery behind the Action button, action menu items, and
 * action links: it gates submission (form → modal, confirmation → confirm,
 * otherwise dispatch) and renders the matching overlays. The host owns the
 * trigger element so each surface keeps its own styling.
 */
export declare function useAction(node: Node<"action" | "action.bulk">): UseAction;
export {};
