import type { NodeUnionOf } from "@lattice-php/core";
import type { ComponentPropsMap, UiNodeType } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type { Affix, Color, ColorKind, ColorName } from "@lattice-php/core";
export type {
  Align,
  AvatarShape,
  Breakpoint,
  Callout,
  ColumnWidth,
  ComponentPropsMap,
  DateFormat,
  DateTimeStyle,
  Gap,
  Height,
  HttpMethod,
  Justify,
  ModalHeight,
  ModalWidth,
  NumberFormat,
  NumberFormatUnit,
  Orientation,
  Placement,
  ProgressShape,
  RetractCallout,
  Side,
  Size,
  StackDirection,
  TabsAlignment,
  TextAlign,
  Toast,
  Translatable,
  UiNodeType,
  Width,
} from "./generated";

export type UiNode = NodeUnionOf<UiNodeType>;

export type I18nConfig = {
  readonly enabled: boolean;
  readonly locales: string[];
  readonly preloadLocales: string[];
  readonly saveMissing: boolean;
  readonly timezone: string | null;
};
