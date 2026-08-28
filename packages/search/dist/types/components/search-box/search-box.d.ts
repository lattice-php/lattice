import { ReactNode } from "react";
export type SearchBoxProps = {
  endpoint: string;
  perPage?: number;
  placeholder?: string | null;
  title?: string | null;
  /** Register ⌘K / Ctrl+K to open (and close) the palette. */
  shortcut?: boolean;
  /** Icon-only trigger for collapsed chrome. */
  collapsed?: boolean;
  /** Custom palette composition; defaults to input, categories, results and preview. */
  children?: ReactNode;
  "data-test"?: string;
};
/**
 * The search trigger: a button (plus optional keyboard shortcut) that opens a
 * `SearchPalette` through the nearest `ModalProvider`.
 */
export declare function SearchBox({
  endpoint,
  perPage,
  placeholder,
  title,
  shortcut,
  collapsed,
  children,
  "data-test": testId,
}: SearchBoxProps): import("react").JSX.Element;
