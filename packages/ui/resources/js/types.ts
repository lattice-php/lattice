import type { NodeUnionOf } from "@lattice-php/core";
import type { ComponentPropsMap, UiNodeType } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type { Affix, Color, ColorKind, ColorName } from "@lattice-php/core";
export type {
  Callout,
  ColumnWidth,
  ComponentPropsMap,
  DateFormat,
  DateTimeStyle,
  HttpMethod,
  Justify,
  ModalWidth,
  NumberFormat,
  NumberFormatUnit,
  Orientation,
  Placement,
  RetractCallout,
  Side,
  Size,
  Toast,
  Translatable,
  UiNodeType,
} from "./generated";

export type UiNode = NodeUnionOf<UiNodeType>;

export type I18nConfig = {
  readonly enabled: boolean;
  readonly locales: string[];
  readonly preloadLocales: string[];
  readonly saveMissing: boolean;
  readonly timezone: string | null;
};
