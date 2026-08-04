import { ModalWidth, Side } from './types.js';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
export type DialogPlacement = "center" | Side;
declare function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>): React.JSX.Element;
declare function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>): React.JSX.Element;
declare function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>): React.JSX.Element;
declare function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>): React.JSX.Element;
declare function DialogContent({ children, className, placement, width, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & {
    placement?: DialogPlacement;
    width?: ModalWidth;
}): React.JSX.Element;
/**
 * The shared dialog header: a title with an optional description and a ghost
 * close button. Pass `description` as `undefined` to suppress the description
 * and the matching `aria-describedby` wiring on the content.
 */
declare function DialogHeader({ closeLabel, description, title, }: {
    closeLabel?: string;
    description?: React.ReactNode;
    title: React.ReactNode;
}): React.JSX.Element;
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle };
