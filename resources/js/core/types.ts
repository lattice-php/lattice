import type { Method } from "@inertiajs/core";
import type { ComponentType as ReactComponentType, ReactNode } from "react";

export type NodeProps = Record<string, unknown>;

export interface ComponentProps {
  [component: string]: NodeProps;
}

export type ComponentType = keyof ComponentProps & string;

export type PropsFor<TType extends string> = TType extends ComponentType
  ? ComponentProps[TType] & NodeProps
  : NodeProps;

export type Node<TType extends string = string> = {
  id?: string;
  key?: string;
  props?: PropsFor<TType>;
  schema?: Schema;
  type: TType;
};

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
  menus: Record<string, MenuPayload | undefined>;
  schema: Schema;
  title: string | null;
};

export type PageBreadcrumb = {
  href: string;
  title: string;
};

export type MenuItem = {
  active: boolean;
  href: string;
  icon: string | null;
  key: string;
  label: string;
  method: Method;
};

export type MenuGroup = {
  items: MenuItem[];
  label: string | null;
};

export type MenuPayload = {
  groups: MenuGroup[];
};

export type KnownPageContainer = "centered" | "default";

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
