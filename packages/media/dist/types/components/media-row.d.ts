export type MediaRow = {
    id: number;
    url: string | null;
    /** The library conversion when it was generated, the original otherwise. */
    preview_url: string | null;
    name: string;
    mime_type: string;
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
