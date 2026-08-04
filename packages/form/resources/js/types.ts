import type { NodeUnionOf } from "@lattice-php/core";
import type { ComponentPropsMap, FormNodeType } from "@lattice-php/form/generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  Checkbox,
  Choice,
  DateInput,
  DateTimeInput,
  Form,
  FormNodeType,
  HiddenInput,
  LabelAction,
  NumberInput,
  PasswordInput,
  RichEditor,
  Select,
  Textarea,
  TextInput,
  TimeInput,
} from "@lattice-php/form/generated";

export type FormNode = NodeUnionOf<FormNodeType>;
