import { ReactNode } from 'react';
import { BlockBinding } from './use-block-binding';
/**
 * Edits a bound field that has no inline control of its own (selects, toggles,
 * numbers, media) in a popover anchored to the element that shows it.
 */
export declare function BindingPopover({ binding, children, className, }: {
    binding: BlockBinding;
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
