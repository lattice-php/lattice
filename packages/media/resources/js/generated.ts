import type { Node } from "@lattice-php/core";
import type { FieldConditions } from "@lattice-php/form";
import type { ColumnWidth } from "@lattice-php/ui";

export type ComponentPropsMap = {
  "field.media-picker": MediaPicker;
  "media.library": MediaLibrary;
};
export type EditorExtensionPropsMap = {
  "media-image": EditorMediaImage;
};
export type EditorMediaImage = {
  conversions: string[];
  library: Node<"media.library"> | null;
};
export type FilterNodeType = "filter.media-folder" | "filter.media-type";
export type FilterPropsMap = {
  "filter.media-folder": MediaFolderFilter;
  "filter.media-type": MediaTypeFilter;
};
export type FormFieldNodeType = "field.media-picker";
export type FormNodeType = "field.media-picker";
export type MediaFolderFilter = {
  label: string;
};
export type MediaLibrary = {
  accept: string | null;
  folders: boolean;
  inspector: boolean;
  picker: boolean;
  signed: boolean;
};
export type MediaPicker = {
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  labelAction: Node | null;
  maxFiles: number | null;
  multiple: boolean;
  name: string;
  pickerLabel: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  selected:
    | {
        id: number;
        mime_type: string;
        name: string;
        preview_url: string | null;
        url: string | null;
        values: Record<string, unknown>;
      }[]
    | null;
  tooltip: string | null;
  uploadOnly: boolean;
  value: unknown;
};
export type MediaTypeFilter = {
  label: string;
};
export type MediumNodeType = "media.library";
