import { createPlugin, lazyComponent } from "@lattice/lattice/core/registry";
import type { RendererComponent, RendererComponentModule } from "@lattice/lattice/core/types";
import { FormSkeletonComponent } from "./skeleton";

type FormComponentName =
  | "CheckboxComponent"
  | "ChoiceComponent"
  | "DateInputComponent"
  | "FormComponent"
  | "HiddenInputComponent"
  | "NumberInputComponent"
  | "PasswordInputComponent"
  | "SelectComponent"
  | "TextareaComponent"
  | "TextInputComponent";

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
    "form.checkbox": lazyComponent(loadFormComponent("CheckboxComponent")),
    "form.choice": lazyComponent(loadFormComponent("ChoiceComponent")),
    "form.date-input": lazyComponent(loadFormComponent("DateInputComponent")),
    "form.hidden-input": lazyComponent(loadFormComponent("HiddenInputComponent")),
    "form.number-input": lazyComponent(loadFormComponent("NumberInputComponent")),
    "form.password-input": lazyComponent(loadFormComponent("PasswordInputComponent")),
    // Loaded from its own module so TipTap is split into a separate chunk,
    // only fetched on pages that actually render a rich editor.
    "form.rich-editor": lazyComponent<"form.rich-editor">(async () => {
      const { RichEditorComponent } = await import("./components/fields/rich-editor");

      return { default: RichEditorComponent };
    }),
    "form.select": lazyComponent(loadFormComponent("SelectComponent")),
    "form.textarea": lazyComponent(loadFormComponent("TextareaComponent")),
    "form.text-input": lazyComponent(loadFormComponent("TextInputComponent")),
  },
  name: "lattice/form",
});
