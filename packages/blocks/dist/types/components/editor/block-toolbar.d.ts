import { ReactNode, RefObject } from 'react';
export declare function BlockToolbar({ id, label, icon, handleRef, inlineToolbar, }: {
    id: string;
    label: string;
    icon: string | null;
    handleRef: RefObject<HTMLButtonElement | null>;
    inlineToolbar?: ReactNode;
}): import("react").JSX.Element;
