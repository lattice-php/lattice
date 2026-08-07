import type { Node } from "@lattice-php/core";

export type Action = {
  confirmation: Confirmation | null;
  emphasis: Emphasis | null;
  endpoint: string | null;
  form: Node<"form"> | null;
  icon: string | null;
  label: string | null;
  lazyForm: boolean;
  method: HttpMethod | null;
  modalSide: Side | null;
  modalWidth: ModalWidth | null;
  ref: string | null;
  variant: Variant | null;
};
export type ActionGroup = {
  label: string | null;
  orientation: Orientation | null;
  ref: string | null;
};
export type ActionNodeType = "action" | "action.bulk" | "action.group";
export type ActionResult = {
  readonly data: Record<string, unknown>;
  readonly effects: Effect[];
};
export type BulkAction = {
  confirmation: Confirmation | null;
  emphasis: Emphasis | null;
  endpoint: string | null;
  form: Node<"form"> | null;
  icon: string | null;
  label: string | null;
  lazyForm: boolean;
  method: HttpMethod | null;
  modalSide: Side | null;
  modalWidth: ModalWidth | null;
  ref: string | null;
  variant: Variant | null;
};
export type ComponentPropsMap = {
  action: Action;
  "action.bulk": BulkAction;
  "action.group": ActionGroup;
};
export type Confirmation = {
  readonly cancelLabel: string | null;
  readonly confirmLabel: string | null;
  readonly description: string | null;
  readonly title: string | null;
};
export type Effect = {
  type: string;
  props: Record<string, unknown>;
};
export type Emphasis = "solid" | "outline" | "ghost" | "link";
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
export type ModalWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type NodeType = "action" | "action.bulk" | "action.group";
export type Orientation = "horizontal" | "vertical";
export type Side = "start" | "end";
export type Variant = "primary" | "secondary" | "success" | "info" | "warning" | "danger";
