import type { NodeUnionOf } from "@lattice-php/core/types";
import type { ComponentPropsMap, FormNodeType } from "@lattice-php/core/generated";

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
} from "@lattice-php/core/generated";

export type FormNode = NodeUnionOf<FormNodeType>;
