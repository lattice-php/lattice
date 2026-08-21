import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { FormNodeType } from "./generated";
import {
  BuilderAdapter,
  CheckboxAdapter,
  ChoiceAdapter,
  ColorPickerAdapter,
  DateInputAdapter,
  DateTimeInputAdapter,
  FileUploadAdapter,
  FormAdapter,
  HiddenInputAdapter,
  NumberInputAdapter,
  OtpInputAdapter,
  PasswordInputAdapter,
  RepeaterAdapter,
  SelectAdapter,
  TextareaAdapter,
  TextInputAdapter,
  TimeInputAdapter,
  ToggleAdapter,
  WizardAdapter,
  WizardStepAdapter,
} from "./components";
import { PatternInputAdapter } from "./components/pattern-input/pattern-input-adapter";
import { RichEditorAdapter } from "./components/rich-editor/rich-editor-adapter";

export const formComponents: Plugin = {
  components: {
    form: eagerComponent(FormAdapter),
    "field.builder": eagerComponent(BuilderAdapter),
    "field.checkbox": eagerComponent(CheckboxAdapter),
    "field.choice": eagerComponent(ChoiceAdapter),
    "field.color-picker": eagerComponent(ColorPickerAdapter),
    "field.date-input": eagerComponent(DateInputAdapter),
    "field.date-time-input": eagerComponent(DateTimeInputAdapter),
    "field.file-upload": eagerComponent(FileUploadAdapter),
    "field.hidden-input": eagerComponent(HiddenInputAdapter),
    "field.number-input": eagerComponent(NumberInputAdapter),
    "field.otp": eagerComponent(OtpInputAdapter),
    "field.password-input": eagerComponent(PasswordInputAdapter),
    "field.pattern-input": eagerComponent(PatternInputAdapter),
    "field.repeater": eagerComponent(RepeaterAdapter),
    "field.rich-editor": eagerComponent(RichEditorAdapter),
    "field.select": eagerComponent(SelectAdapter),
    "field.textarea": eagerComponent(TextareaAdapter),
    "field.text-input": eagerComponent(TextInputAdapter),
    "field.time-input": eagerComponent(TimeInputAdapter),
    "field.toggle": eagerComponent(ToggleAdapter),
    wizard: eagerComponent(WizardAdapter),
    "wizard-step": eagerComponent(WizardStepAdapter),
  } satisfies ComponentRegistryFor<FormNodeType>,
  name: "lattice/form",
};

export default formComponents;
