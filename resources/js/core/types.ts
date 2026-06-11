import type { ComponentType as ReactComponentType, ReactNode } from "react";
import type {
  Node as WireNode,
  NodeType,
  PageContainer as KnownPageContainer,
} from "@lattice/lattice/types/generated";

export type { KnownPageContainer, NodeType, WireNode };

/** Loose props bag, read through the typed getters in `core/props`. */
export type NodeProps = Record<string, unknown>;

/**
 * A node whose `type` is not one of the generated built-ins. This is the escape
 * hatch that keeps the renderer open to components registered by consumers.
 */
export type LooseNode<TType extends string = string> = {
  id?: string;
  key?: string;
  props?: NodeProps;
  schema?: Schema;
  type: TType;
};

type PropsOf<TType extends string> = [Extract<WireNode, { type: TType }>] extends [never]
  ? NodeProps
  : Extract<WireNode, { type: TType }> extends { props: infer TProps }
    ? TProps
    : NodeProps;

/**
 * Resolves a wire `type` string to its node shape: built-ins narrow to their
 * generated props, unknown types fall back to a loose props bag so custom
 * components still type-check. `props` is optional throughout to mirror the
 * sparse wire shape (empty props are dropped before serialization).
 */
export type NodeOfType<TType extends string = string> = string extends TType
  ? LooseNode
  : {
      id?: string;
      key?: string;
      props?: PropsOf<TType>;
      schema?: Schema;
      type: TType;
    };

export type Node<TType extends string = string> = NodeOfType<TType>;

/** An ordered list of component nodes — the content of a page, form, or container. */
export type Schema = Node[];

/** A server-composed layout shell: its key plus a schema containing one Outlet. */
export type LayoutPayload = {
  key: string;
  schema: Schema;
};

export type PagePayload = {
  breadcrumbs: PageBreadcrumb[];
  container: PageContainer;
  layout: LayoutPayload | null;
  schema: Schema;
  title: string | null;
};

export type PageBreadcrumb = {
  href: string;
  title: string;
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
