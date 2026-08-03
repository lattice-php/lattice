import { ReactNode } from 'react';
interface PreviewableImageProps {
    src: string;
    alt: string;
    previewable: boolean;
    width?: number;
    height?: number;
    className?: string;
    testId?: string;
}
export declare function PreviewableImage({ src, alt, previewable, width, height, className, testId, }: PreviewableImageProps): ReactNode;
export {};
