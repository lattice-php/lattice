import type { NodeUnionOf } from "@lattice-php/lattice/core/types";
import type { FormNodeType } from "@lattice-php/lattice/types/generated";

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
} from "@lattice-php/lattice/types/generated";

export type FormNode = NodeUnionOf<FormNodeType>;
