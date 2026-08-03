import { ReactNode } from 'react';
export declare function copyToClipboard(text: string): Promise<boolean>;
interface CopyButtonProps {
    value: string;
    label: string;
    testId?: string;
    className?: string;
    iconOnly?: boolean;
    children?: ReactNode;
}
export declare function CopyButton({ value, label, testId, className, iconOnly, children, }: CopyButtonProps): ReactNode;
interface CopyableTextProps {
    value: string;
    label: string;
    testId?: string;
    children?: ReactNode;
}
export declare function CopyableText({ value, label, testId, children }: CopyableTextProps): ReactNode;
export {};
