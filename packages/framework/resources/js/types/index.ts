import type { Breadcrumb, PageWidth as GeneratedPageWidth } from "@lattice-php/core";
import type { NodeType, PageLayoutPayload, PagePayload as GeneratedPagePayload } from "./generated";

export type * from "@lattice-php/core";

export type LayoutPayload = PageLayoutPayload;

export type PageBreadcrumb = Breadcrumb;

export type PagePayload = Omit<GeneratedPagePayload, "width"> & {
  width: PageWidth;
};

export type PageWidth = GeneratedPageWidth | (string & {});

export type { NodeType };
export type KnownPageWidth = GeneratedPageWidth;
