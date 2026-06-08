import { createPlugin, lazyComponent } from "@lattice/core/registry";
import type { RendererComponent, RendererComponentModule } from "@lattice/core/types";
import { FormSkeletonComponent } from "./skeleton";

type FormComponentName =
  | "CheckboxComponent"
  | "ChoiceComponent"
  | "DateInputComponent"
  | "FormComponent"
  | "HiddenInputComponent"
  | "NumberInputComponent"
  | "PasswordInputComponent"
  | "SubmitButtonComponent"
  | "TextareaComponent"
  | "TextInputComponent";

const loadFormComponents = () => import("./components");

function loadFormComponent<TType extends string>(
  name: FormComponentName,
): () => Promise<RendererComponentModule<TType>> {
  return async () => {
    const components = await loadFormComponents();

    return {
      default: components[name] as RendererComponent<TType>,
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
    "form.submit-button": lazyComponent(loadFormComponent("SubmitButtonComponent")),
    "form.textarea": lazyComponent(loadFormComponent("TextareaComponent")),
    "form.text-input": lazyComponent(loadFormComponent("TextInputComponent")),
  },
  name: "lattice/form",
});
