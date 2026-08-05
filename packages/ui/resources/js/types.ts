import type { NodeUnionOf } from "@lattice-php/core";
import type { ComponentPropsMap, UiNodeType } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  Affix,
  Color,
  ColorKind,
  ColumnWidth,
  ComponentPropsMap,
  DateTimeStyle,
  ModalWidth,
  NumberFormat,
  NumberFormatUnit,
  Side,
  Translatable,
  UiNodeType,
} from "./generated";

export type UiNode = NodeUnionOf<UiNodeType>;

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

export type I18nConfig = {
  readonly enabled: boolean;
  readonly locales: string[];
  readonly preloadLocales: string[];
  readonly saveMissing: boolean;
  readonly timezone: string | null;
};
