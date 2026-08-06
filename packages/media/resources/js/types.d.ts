import "@lattice-php/lattice";
import type { Node } from "@lattice-php/core/types";
import type { ColumnWidth, FieldConditions } from "@lattice-php/lattice/types/generated";

declare module "@lattice-php/form/rich-editor/registry" {
  interface EditorExtensionProps {
    "media-image": {
      conversions: string[];
      library: Node | null;
    };
  }
}

declare module "@lattice-php/core" {
  interface ComponentProps {
    "media.library": {
      picker: boolean;
      accept: string | null;
      signed: boolean;
    };
    "field.media-picker": {
      columnWidth: ColumnWidth;
      conditions: FieldConditions | null;
      dependsOnAny: boolean;
      dependsOnKeys: string[] | null;
      disabled: boolean;
      editablePrefill: boolean;
      helperText: string | null;
      label: string | null;
      maxFiles: number | null;
      multiple: boolean;
      name: string;
      prefillRefreshOn: string[] | null;
      prefillResetOn: string[] | null;
      readOnly: boolean;
      required: boolean;
      selected:
        | {
            id: number;
            name: string;
            url: string | null;
            preview_url: string | null;
            mime_type: string;
            values?: Record<string, unknown>;
          }[]
        | null;
      tooltip: string | null;
      value: unknown;
    };
  }
}
