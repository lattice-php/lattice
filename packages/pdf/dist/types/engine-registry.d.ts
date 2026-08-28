import { ComponentType, LazyExoticComponent } from "react";
import { Node } from "@lattice-php/core";
export declare const PDF_ENGINE_EXTENSION = "pdf.engine";
export type PdfEngineProps = {
  node: Node<"pdf">;
};
export type PdfEngineComponent =
  | ComponentType<PdfEngineProps>
  | LazyExoticComponent<ComponentType<PdfEngineProps>>;
export type PdfEngineRegistry = Record<string, PdfEngineComponent>;
export declare function usePdfEngineRegistry(): PdfEngineRegistry;
