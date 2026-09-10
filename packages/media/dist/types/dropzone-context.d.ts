import { ReactNode } from 'react';
export type DropzoneApi = {
    disabled: boolean;
    remove(): void;
};
export declare function DropzoneProvider({ value, children }: {
    value: DropzoneApi;
    children: ReactNode;
}): import("react").JSX.Element;
/** The dropzone a remove control belongs to; null outside one, where the control renders nothing. */
export declare function useDropzone(): DropzoneApi | null;
