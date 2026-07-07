import type { Method } from "@inertiajs/core";
import type { NodeUnionOf } from "@lattice-php/lattice/core/types";
import type { FormFieldNodeType, FormNodeType } from "@lattice-php/lattice/types/generated";

export type {
  Checkbox,
  Choice,
  DateInput,
  DateTimeInput,
  Form,
  FormNodeType,
  HiddenInput,
  NumberInput,
  PasswordInput,
  RichEditor,
  Select,
  Textarea,
  TextInput,
  TimeInput,
} from "@lattice-php/lattice/types/generated";

/** The form field nodes, discriminated by wire type — built from the generated field-type union. */
export type FormFieldNode = NodeUnionOf<FormFieldNodeType>;

/** A form node: any field, or the form container itself. */
export type FormNode = NodeUnionOf<FormNodeType>;

export type FormMethod = Method;

export type FormLabelAction = {
  href: string;
  label: string;
  tabIndex?: number;
};
