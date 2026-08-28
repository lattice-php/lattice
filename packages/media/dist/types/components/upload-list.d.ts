import { UploadItem } from './use-media-upload';
export declare function UploadList({ uploads, retry, dismiss, }: {
    uploads: UploadItem[];
    retry: (item: UploadItem) => void;
    dismiss: (id: string) => void;
}): import("react").JSX.Element | null;
