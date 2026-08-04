import { ComponentType as ReactComponentType, ReactNode } from "react";
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
export { CollapsedContext, useCollapsed } from "./collapsed-context.js";
export {
  clearRefreshedRefs,
  latestRef,
  LATTICE_REF_HEADER,
  storeRefreshedRef,
  withRefHeader,
} from "./component-ref.js";
export { LATTICE_EVENT } from "./event-names.js";
export type { ReloadComponentEvent } from "./event-names.js";
export {
  dataBindings,
  isRecord,
  materializeNode,
  materializeProps,
  materializeSchema,
  rowValue,
} from "./materialize.js";
export type { DataBindings, RemoteRow } from "./materialize.js";
export { nodeKey, toNodes } from "./nodes.js";
export {
  createRegistry,
  eagerComponent,
  extendRegistry,
  lazyComponent,
  loadPluginModules,
} from "./registry.js";
export type {
  ComponentRegistryFor,
  ExtensionRegistries,
  ExtensionRegistry,
  Plugin,
  PluginI18n,
  Registry,
} from "./registry.js";
export {
  RegistryContext,
  setDefaultRegistry,
  useColumnRegistry,
  useComponentRegistry,
  useEffectHandlerRegistry,
  useExtensionRegistry,
} from "./registry-context.js";
export { Renderer, RenderNode } from "./renderer.js";
export {
  leafTestIdentity,
  nodeIdentity,
  prefixedNodeTestId,
  prefixedTestId,
  testIdentity,
} from "./test-id.js";
export { useWindowEvent } from "./hooks/use-window-event.js";
