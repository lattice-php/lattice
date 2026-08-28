import { ReactNode } from "react";
export type SearchPaletteProps = {
  endpoint: string;
  perPage?: number;
  placeholder?: string | null;
  title?: string | null;
  /** Replaces the default input/categories/results/preview composition. */
  children?: ReactNode;
  onClosed?: () => void;
};
/**
 * The command palette behind `SearchBox`. Renders through the embedded modal
 * host it was opened in, so mount it via `useModal().open(...)`.
 */
export declare function SearchPalette({
  endpoint,
  perPage,
  placeholder,
  title,
  children,
  onClosed,
}: SearchPaletteProps): ReactNode;
