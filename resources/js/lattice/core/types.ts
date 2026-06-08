import type { ComponentType, ReactNode } from "react";

export type LatticeNodeProps = Record<string, unknown>;

export interface LatticeComponentProps {
  [component: string]: LatticeNodeProps;
}

export type LatticeComponentType = keyof LatticeComponentProps & string;

export type LatticePropsFor<TType extends string> = TType extends LatticeComponentType
  ? LatticeComponentProps[TType] & LatticeNodeProps
  : LatticeNodeProps;

export type LatticeNode<TType extends string = string> = {
  children?: LatticeNode[];
  id?: string;
  key?: string;
  props?: LatticePropsFor<TType>;
  type: TType;
};

export type LatticePagePayload = {
  components: LatticeNode[];
  container: LatticePageContainer;
  layout: LatticePageLayout;
  sidebar: LatticeSidebarPayload;
  title: string | null;
};

export type LatticeSidebarItem = {
  active: boolean;
  href: string;
  icon: string | null;
  key: string;
  label: string;
};

export type LatticeSidebarGroup = {
  items: LatticeSidebarItem[];
  label: string | null;
};

export type LatticeSidebarPayload = {
  groups: LatticeSidebarGroup[];
};

export type LatticeKnownPageContainer = "centered" | "default";

export type LatticePageContainer = LatticeKnownPageContainer | (string & {});

export type LatticeKnownPageLayout = "app" | "auth" | "none" | "settings";

export type LatticePageLayout = LatticeKnownPageLayout | (string & {});

export type LatticeRendererComponentProps<TType extends string = string> = {
  children: ReactNode;
  node: LatticeNode<TType>;
};

export type LatticeRendererComponent<TType extends string = string> = ComponentType<
  LatticeRendererComponentProps<TType>
>;

export type LatticeRendererComponentModule<TType extends string = string> = {
  default: LatticeRendererComponent<TType>;
};

export type LatticeUnknownComponent = ComponentType<{
  node: LatticeNode;
}>;
