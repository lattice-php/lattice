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

export type Color = {
  readonly dark: string | null;
  readonly kind: ColorKind;
  readonly value: string;
};

export type DateTimeStyle = "full" | "long" | "medium" | "short";
export type ColumnWidth = "xs" | "sm" | "md" | "lg" | "xl";
export type ModalWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type Side = "start" | "end";

export type I18nConfig = {
  readonly enabled: boolean;
  readonly locales: string[];
  readonly preloadLocales: string[];
  readonly saveMissing: boolean;
  readonly timezone: string | null;
};

export type Translatable = {
  key: string;
  payload: Record<string, string>;
  replacements: Record<string, string | number | boolean>;
};
