import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import type { FormNodeType } from "@lattice-php/lattice/types/generated";
import {
  BuilderComponent,
  CheckboxComponent,
  ChoiceComponent,
  DateInputComponent,
  DateTimeInputComponent,
  FileUploadComponent,
  FormComponent,
  HiddenInputComponent,
  NumberInputComponent,
  OtpInputComponent,
  PasswordInputComponent,
  RepeaterComponent,
  SelectComponent,
  TextareaComponent,
  TextInputComponent,
  TimeInputComponent,
  ToggleComponent,
} from "./components";
import { RichEditorComponent } from "./components/fields/rich-editor";

export const formComponents = createPlugin({
  components: {
    form: eagerComponent(FormComponent),
    "field.builder": eagerComponent(BuilderComponent),
    "field.checkbox": eagerComponent(CheckboxComponent),
    "field.choice": eagerComponent(ChoiceComponent),
    "field.date-input": eagerComponent(DateInputComponent),
    "field.date-time-input": eagerComponent(DateTimeInputComponent),
    "field.file-upload": eagerComponent(FileUploadComponent),
    "field.hidden-input": eagerComponent(HiddenInputComponent),
    "field.number-input": eagerComponent(NumberInputComponent),
    "field.otp": eagerComponent(OtpInputComponent),
    "field.password-input": eagerComponent(PasswordInputComponent),
    "field.repeater": eagerComponent(RepeaterComponent),
    "field.rich-editor": eagerComponent(RichEditorComponent),
    "field.select": eagerComponent(SelectComponent),
    "field.textarea": eagerComponent(TextareaComponent),
    "field.text-input": eagerComponent(TextInputComponent),
    "field.time-input": eagerComponent(TimeInputComponent),
    "field.toggle": eagerComponent(ToggleComponent),
  } satisfies ComponentRegistryFor<FormNodeType>,
  name: "lattice/form",
});
