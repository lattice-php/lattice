import type { Method } from "@inertiajs/core";

export type {
  Checkbox,
  Choice,
  DateInput,
  DateTimeInput,
  Form,
  FormFieldNode,
  FormNode,
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

export type FormMethod = Method;

export type FormLabelAction = {
  href: string;
  label: string;
  tabIndex?: number;
};
