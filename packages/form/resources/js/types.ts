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
  FieldConditions,
  Form,
  FormNodeType,
  HiddenInput,
  NumberInput,
  PasswordInput,
  PatternInput,
  PatternTokenData,
  RichEditor,
  Select,
  SignedUpload,
  Textarea,
  TextInput,
  TimeInput,
} from "@lattice-php/form/generated";

export type FormNode = NodeUnionOf<FormNodeType>;
