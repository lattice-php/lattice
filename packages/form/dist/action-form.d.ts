import { DialogPlacement } from '../../../ui/dist/dialog.js';
import { Node } from '@lattice-php/core/types';
import { ModalWidth } from '@lattice-php/core/generated';
import { ActionResponse } from '../../../ui/dist/effects/dispatch.js';
type ActionFormProps = {
    cancelLabel: string;
    componentRef: string;
    description?: string;
    endpoint: string;
    /** Extra payload merged into every request, e.g. a bulk action's selection. */
    extraData?: Record<string, unknown>;
    /** The form to render; null while a lazy schema is still being fetched. */
    formNode: Node | null;
    method: string;
    onClose: () => void;
    onSuccess: (response: ActionResponse) => void;
    /** Dialog placement for the form modal; sheets dock to a viewport edge. */
    placement?: DialogPlacement;
    submitLabel: string;
    title: string;
    width?: ModalWidth;
};
/**
 * Fetch a lazily-served form schema from the action endpoint while `enabled`,
 * so it can be prefilled per record. Returns null until it arrives.
 */
export declare function useLazyActionForm(endpoint: string, componentRef: string, enabled: boolean): Node | null;
export declare function ActionForm({ description, formNode, onClose, placement, title, width, ...rest }: ActionFormProps): import("react").JSX.Element;
export {};
