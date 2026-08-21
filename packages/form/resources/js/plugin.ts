import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { FormNodeType } from "@lattice-php/form/generated";
import {
  BuilderComponent,
  CheckboxAdapter,
  ChoiceComponent,
  ColorPickerAdapter,
  DateInputComponent,
  DateTimeInputComponent,
  FileUploadComponent,
  FormComponent,
  HiddenInputComponent,
  NumberInputComponent,
  OtpInputAdapter,
  PasswordInputAdapter,
  RepeaterComponent,
  SelectComponent,
  TextareaAdapter,
  TextInputComponent,
  TimeInputComponent,
  ToggleAdapter,
  WizardComponent,
  WizardStepComponent,
} from "./components";
import { PatternInputComponent } from "./components/fields/pattern-input";
import { RichEditorComponent } from "./components/fields/rich-editor";

export const formComponents: Plugin = {
  components: {
    form: eagerComponent(FormComponent),
    "field.builder": eagerComponent(BuilderComponent),
    "field.checkbox": eagerComponent(CheckboxAdapter),
    "field.choice": eagerComponent(ChoiceComponent),
    "field.color-picker": eagerComponent(ColorPickerAdapter),
    "field.date-input": eagerComponent(DateInputComponent),
    "field.date-time-input": eagerComponent(DateTimeInputComponent),
    "field.file-upload": eagerComponent(FileUploadComponent),
    "field.hidden-input": eagerComponent(HiddenInputComponent),
    "field.number-input": eagerComponent(NumberInputComponent),
    "field.otp": eagerComponent(OtpInputAdapter),
    "field.password-input": eagerComponent(PasswordInputAdapter),
    "field.pattern-input": eagerComponent(PatternInputComponent),
    "field.repeater": eagerComponent(RepeaterComponent),
    "field.rich-editor": eagerComponent(RichEditorComponent),
    "field.select": eagerComponent(SelectComponent),
    "field.textarea": eagerComponent(TextareaAdapter),
    "field.text-input": eagerComponent(TextInputComponent),
    "field.time-input": eagerComponent(TimeInputComponent),
    "field.toggle": eagerComponent(ToggleAdapter),
    wizard: eagerComponent(WizardComponent),
    "wizard-step": eagerComponent(WizardStepComponent),
  } satisfies ComponentRegistryFor<FormNodeType>,
  name: "lattice/form",
};

export default formComponents;
