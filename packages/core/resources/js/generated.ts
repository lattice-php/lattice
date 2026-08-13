export type Affix = {
  readonly icon: string | null;
  readonly text: string | null;
};
export type Breadcrumb = {
  readonly href: string;
  readonly title: string;
};
export type BrowserToken = {
  readonly accessToken: string;
  readonly audience: string;
  readonly expiresIn: number;
  readonly scopes: string[];
  readonly tokenType: string;
};
export type Color = {
  readonly dark: string | null;
  readonly kind: ColorKind;
  readonly value: string;
};
export type ColorKind = "named" | "css";
export type ColorName =
  | "default"
  | "muted"
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";
export type Op =
  | "contains"
  | "starts_with"
  | "ends_with"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "before"
  | "after"
  | "empty"
  | "filled";
export type PageLayout = "app" | "auth" | "none";
export type PageWidth = "full" | "lg" | "md" | "sm";
export type RemoteAccess = {
  readonly audience: string;
  readonly nodeId: string;
  readonly nodeType: string;
  readonly ref: string;
  readonly scopes: string[];
  readonly source: string;
  readonly tokenEndpoint: string;
};
