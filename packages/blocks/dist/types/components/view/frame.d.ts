import { ReactNode } from 'react';
import { FrameClasses } from '../../types';
export type FrameProps = {
    classes: FrameClasses;
    anchor?: string | null;
    children: ReactNode;
    className?: string;
};
/** Applies a block's resolved style classes around its rendered content. */
export declare function Frame({ classes, anchor, children, className }: FrameProps): import("react").JSX.Element;
