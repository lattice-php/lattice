import type { NodeUnionOf } from "@lattice-php/core";
import type { ComponentPropsMap, FormNodeType } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  Checkbox,
  Checkbox as CheckboxWireProps,
  Choice,
  DateInput,
  DateTimeInput,
  FieldConditions,
  Form,
  FormNodeType,
  HiddenInput,
  NumberInput,
  PasswordInput,
  PasswordInput as PasswordInputWireProps,
  PatternInput,
  PatternTokenData,
  RichEditor,
  RowTemplateData,
  Select,
  SignedUpload,
  Textarea,
  Textarea as TextareaWireProps,
  TextInput,
  TimeInput,
} from "./generated";

export type FormNode = NodeUnionOf<FormNodeType>;
