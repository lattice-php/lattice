export type UploadItem = {
    id: string;
    name: string;
    status: "uploading" | "error";
    progress: number;
    reason?: string;
    file: File;
};
export type UploadTarget = {
    endpoint: string;
    ref: string;
    signed: boolean;
};
export type MediaUpload = {
    uploads: UploadItem[];
    addFiles: (files: FileList | File[] | null) => void;
    retry: (item: UploadItem) => void;
    dismiss: (id: string) => void;
};
/**
 * Drives the media library's uploads. Each file gets its own request, so
 * progress and validation failures are per file. A settled item leaves the
 * list — a single batched `reload-component` effect, dispatched once the whole
 * batch has settled, brings the new rows into the grid — so `uploads` only
 * ever holds in-flight and failed files.
 */
export declare function useMediaUpload({ endpoint, ref, signed }: UploadTarget): MediaUpload;
