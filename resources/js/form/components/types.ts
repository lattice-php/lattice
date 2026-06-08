import type { Method } from "@inertiajs/core";

export type FormMethod = Method;

export type FormLabelAction = {
  href: string;
  label: string;
  tabIndex?: number;
};
