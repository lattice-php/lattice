import type { ComponentType, LazyExoticComponent } from "react";
import { useExtensionRegistry } from "@lattice-php/core/registry-context";
import type { Node } from "@lattice-php/core";

export const PDF_ENGINE_EXTENSION = "pdf.engine";

export type PdfEngineProps = {
  node: Node<"pdf">;
};

export type PdfEngineComponent =
  | ComponentType<PdfEngineProps>
  | LazyExoticComponent<ComponentType<PdfEngineProps>>;

export type PdfEngineRegistry = Record<string, PdfEngineComponent>;

export function usePdfEngineRegistry(): PdfEngineRegistry {
  return useExtensionRegistry<PdfEngineRegistry>(PDF_ENGINE_EXTENSION);
}
