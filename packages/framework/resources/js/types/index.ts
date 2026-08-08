import type { Breadcrumb, PageContainer as GeneratedPageContainer } from "@lattice-php/core";
import type { NodeType, PageLayoutPayload, PagePayload as GeneratedPagePayload } from "./generated";

export type * from "@lattice-php/core";

export type LayoutPayload = PageLayoutPayload;

export type PageBreadcrumb = Breadcrumb;

export type PagePayload = Omit<GeneratedPagePayload, "container"> & {
  container: PageContainer;
};

export type PageContainer = GeneratedPageContainer | (string & {});

export type { NodeType };
export type KnownPageContainer = GeneratedPageContainer;
