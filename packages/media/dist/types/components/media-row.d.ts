/** The display descriptor the upload response, the picker, and the preview endpoint all carry. */
export type MediaDescriptor = {
    id: number;
    url: string | null;
    /** The library conversion when it was generated, the original otherwise. */
    preview_url: string | null;
    name: string;
    mime_type: string;
    alt?: string | null;
};
export type MediaRow = MediaDescriptor & {
    size: number;
    alt: string | null;
    folder_id: number | null;
    created_at: string;
    attachments_count: number;
};
export type PickMode = {
    multiple: boolean;
    max?: number;
    onConfirm: (items: MediaRow[]) => void;
};
export type ViewMode = "grid" | "list";
