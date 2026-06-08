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
  children?: Node[];
  id?: string;
  key?: string;
  props?: PropsFor<TType>;
  type: TType;
};

export type PagePayload = {
  breadcrumbs: PageBreadcrumb[];
  components: Node[];
  container: PageContainer;
  layout: PageLayout;
  menus: Record<string, MenuPayload | undefined>;
  title: string | null;
};

export type PageBreadcrumb = {
  href: string;
  title: string;
};

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | (string & {});

export type MenuItem = {
  active: boolean;
  href: string;
  icon: string | null;
  key: string;
  label: string;
  method: HttpMethod;
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

export type KnownPageLayout = "app" | "auth" | "none" | "settings";

export type PageLayout = KnownPageLayout | (string & {});

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
