import type { NodeUnionOf } from "@lattice-php/core";
import type { ComponentPropsMap, UiNodeType } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  Affix,
  Breadcrumb,
  Breakpoint,
  Color,
  ColorKind,
  ColorName,
  Op,
  Option,
} from "@lattice-php/core";
export type {
  Align,
  AvatarShape,
  Callout,
  Callout as CalloutWireProps,
  ColumnWidth,
  ComponentPropsMap,
  ContentAlign,
  DateFormat,
  DateTimeStyle,
  DescriptionListSemantic,
  Emphasis,
  FloatingPlacement,
  Gap,
  Height,
  HttpMethod,
  I18nConfig,
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
  TextAlign,
  Toast,
  Toast as ToastWireProps,
  Translatable,
  UiNodeType,
  Variant,
  Width,
} from "./generated";

export type UiNode = NodeUnionOf<UiNodeType>;
