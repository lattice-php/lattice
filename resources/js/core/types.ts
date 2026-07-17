import type { ComponentType as ReactComponentType, ReactNode } from "react";
import type {
  CommonNodeProps,
  ComponentProps,
  Node,
  NodeProps,
  NodeType,
  NodeUnionOf,
  Option,
  PageContainer as KnownPageContainer,
  ComponentPropsOf,
  ResolveProps,
  Schema,
} from "@lattice-php/lattice/types/generated";
import type {
  Breadcrumb,
  PageLayoutPayload,
  PagePayload as GeneratedPagePayload,
} from "@lattice-php/lattice/types/generated";

export type {
  CommonNodeProps,
  ComponentProps,
  KnownPageContainer,
  Node,
  NodeProps,
  NodeType,
  NodeUnionOf,
  Option,
  ComponentPropsOf,
  ResolveProps,
  Schema,
};

/** Its `schema` holds exactly one Outlet node. */
export type LayoutPayload = PageLayoutPayload;

export type PageBreadcrumb = Breadcrumb;

/**
 * The page payload the server hydrates onto `lattice` — the generated
 * `PagePayload` (PHP `Http\PagePayload`), with `container` refined to the
 * known-container union custom containers extend.
 */
export type PagePayload = Omit<GeneratedPagePayload, "container"> & {
  container: PageContainer;
};

export type PageContainer = KnownPageContainer | (string & {});

export type RendererComponentProps<TType extends string = string> = {
  children: ReactNode;
  node: Node<TType>;
};

export type RendererComponent<TType extends string = string> = ReactComponentType<
  RendererComponentProps<TType>
>;

export type RendererComponentModule<TType extends string = string> = {
  default: RendererComponent<TType>;
};

export type UnknownComponent = ReactComponentType<{
  node: Node;
}>;
