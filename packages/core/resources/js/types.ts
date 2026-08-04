import type { ComponentType as ReactComponentType, ReactNode } from "react";

export type NodeProps = Record<string, unknown>;

export type CommonNodeProps = {
  columnSpan?: Record<string, number | string> | null;
  dataBindings?: Record<string, string> | null;
  hideWhenCollapsed?: boolean | null;
};

export interface ComponentProps {}

export interface ColumnProps {}

export interface FilterProps {}

export interface EffectProps {}

export type ResolveProps<
  TAugment,
  TBuiltins,
  TType extends string,
  TFallback,
> = TType extends keyof TAugment
  ? TAugment[TType]
  : TType extends keyof TBuiltins
    ? TBuiltins[TType]
    : TFallback;

export type ComponentPropsOf<TType extends string> = ResolveProps<
  ComponentProps,
  Record<never, never>,
  TType,
  NodeProps
>;

type LooseNode = {
  id?: string;
  key?: string;
  type: string;
  props?: NodeProps;
  schema?: Schema;
};

export type Node<TType extends string = string> = string extends TType
  ? LooseNode
  : {
      id?: string;
      key?: string;
      props: ComponentPropsOf<TType> & CommonNodeProps;
      schema?: Schema;
      type: TType;
    };

export type NodeUnionOf<TTypes extends string> = TTypes extends string ? Node<TTypes> : never;

export type Schema = Node[];

export type Option = {
  readonly data: Record<string, unknown> | null;
  readonly label: string;
  readonly value: string;
};

export type Breadcrumb = {
  readonly label: string;
  readonly url: string | null;
};

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
