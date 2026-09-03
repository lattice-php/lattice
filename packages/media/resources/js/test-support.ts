import type { MediaRow } from "./components/library-view";

export function libraryRow(id: number, overrides: Partial<MediaRow> = {}): MediaRow {
  return {
    id,
    url: null,
    preview_url: null,
    name: `file-${id}.jpg`,
    mime_type: "image/jpeg",
    size: 100,
    alt: null,
    folder_id: null,
    created_at: "2026-07-29T00:00:00Z",
    attachments_count: 0,
    ...overrides,
  };
}
