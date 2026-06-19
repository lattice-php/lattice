import { createPlugin, lazyComponent } from "@lattice-php/lattice/core/registry";
import type { RendererComponent, RendererComponentModule } from "@lattice-php/lattice/core/types";
import { FormSkeletonComponent } from "./skeleton";

type FormComponentName =
  | "BuilderComponent"
  | "CheckboxComponent"
  | "ChoiceComponent"
  | "DateInputComponent"
  | "FileUploadComponent"
  | "FormComponent"
  | "HiddenInputComponent"
  | "NumberInputComponent"
  | "OtpInputComponent"
  | "PasswordInputComponent"
  | "RepeaterComponent"
  | "SelectComponent"
  | "TextareaComponent"
  | "TextInputComponent"
  | "ToggleComponent";

const loadFormComponents = () => import("./components");

function loadFormComponent<TType extends string>(
  name: FormComponentName,
): () => Promise<RendererComponentModule<TType>> {
  return async () => {
    const components = await loadFormComponents();

    return {
      default: components[name] as unknown as RendererComponent<TType>,
    };
  };
}

export const formComponents = createPlugin({
  components: {
    form: lazyComponent(loadFormComponent("FormComponent"), {
      fallback: FormSkeletonComponent,
    }),
    "field.builder": lazyComponent(loadFormComponent("BuilderComponent")),
    "field.checkbox": lazyComponent(loadFormComponent("CheckboxComponent")),
    "field.choice": lazyComponent(loadFormComponent("ChoiceComponent")),
    "field.date-input": lazyComponent(loadFormComponent("DateInputComponent")),
    "field.file-upload": lazyComponent(loadFormComponent("FileUploadComponent")),
    "field.hidden-input": lazyComponent(loadFormComponent("HiddenInputComponent")),
    "field.number-input": lazyComponent(loadFormComponent("NumberInputComponent")),
    "field.otp": lazyComponent(loadFormComponent("OtpInputComponent")),
    "field.password-input": lazyComponent(loadFormComponent("PasswordInputComponent")),
    "field.repeater": lazyComponent(loadFormComponent("RepeaterComponent")),
    // Loaded from its own module so TipTap is split into a separate chunk,
    // only fetched on pages that actually render a rich editor.
    "field.rich-editor": lazyComponent<"field.rich-editor">(async () => {
      const { RichEditorComponent } = await import("./components/fields/rich-editor");

      return { default: RichEditorComponent };
    }),
    "field.select": lazyComponent(loadFormComponent("SelectComponent")),
    "field.textarea": lazyComponent(loadFormComponent("TextareaComponent")),
    "field.text-input": lazyComponent(loadFormComponent("TextInputComponent")),
    "field.toggle": lazyComponent(loadFormComponent("ToggleComponent")),
  },
  name: "lattice/form",
});
