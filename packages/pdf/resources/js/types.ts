import type { ComponentPropsMap } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type { PdfNodeType, PdfViewer } from "./generated";
