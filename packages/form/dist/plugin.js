import { BuilderComponent } from "./components/fields/builder.js";
import { CheckboxComponent } from "./components/fields/checkbox.js";
import { ChoiceComponent } from "./components/fields/choice.js";
import { ColorPickerFieldComponent } from "./components/fields/color-picker-field.js";
import { DateInputComponent } from "./components/fields/date-input.js";
import { DateTimeInputComponent } from "./components/fields/date-time-input.js";
import { FileUploadComponent } from "./components/fields/file-upload.js";
import { FormComponent } from "./components/form.js";
import { HiddenInputComponent } from "./components/fields/hidden-input.js";
import { NumberInputComponent } from "./components/fields/number-input.js";
import { OtpInputComponent } from "./components/fields/otp-input.js";
import { PasswordInputComponent } from "./components/fields/password-input.js";
import { RepeaterComponent } from "./components/fields/repeater.js";
import { SelectComponent } from "./components/fields/select.js";
import { TextareaComponent } from "./components/fields/textarea.js";
import { TextInputComponent } from "./components/fields/text-input.js";
import { TimeInputComponent } from "./components/fields/time-input.js";
import { ToggleComponent } from "./components/fields/toggle.js";
import { WizardComponent, WizardStepComponent } from "./components/wizard.js";
import { RichEditorComponent } from "./components/fields/rich-editor.js";
import { eagerComponent } from "@lattice-php/core/registry";
//#region resources/js/plugin.ts
var formComponents = {
	components: {
		form: eagerComponent(FormComponent),
		"field.builder": eagerComponent(BuilderComponent),
		"field.checkbox": eagerComponent(CheckboxComponent),
		"field.choice": eagerComponent(ChoiceComponent),
		"field.color-picker": eagerComponent(ColorPickerFieldComponent),
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
		wizard: eagerComponent(WizardComponent),
		"wizard-step": eagerComponent(WizardStepComponent)
	},
	name: "lattice/form"
};
//#endregion
export { formComponents as default, formComponents };

//# sourceMappingURL=plugin.js.map