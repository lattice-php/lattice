import type { Method } from "@inertiajs/core";

export type {
  Checkbox,
  Choice,
  DateInput,
  Form,
  FormFieldNode,
  FormNode,
  FormNodeType,
  HiddenInput,
  NumberInput,
  PasswordInput,
  RichEditor,
  Select,
  SubmitButton,
  Textarea,
  TextInput,
} from "@lattice/lattice/types/generated";

export type FormMethod = Method;

export type FormLabelAction = {
  href: string;
  label: string;
  tabIndex?: number;
};
