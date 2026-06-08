import { createPlugin, lazyComponent } from "@/lattice/core/registry";
import type { RendererComponent, RendererComponentModule } from "@/lattice/core/types";
import { FormSkeletonComponent } from "./skeleton";

type FormComponentName =
  | "CheckboxComponent"
  | "ChoiceComponent"
  | "FormComponent"
  | "HiddenInputComponent"
  | "PasswordInputComponent"
  | "SubmitButtonComponent"
  | "TextInputComponent";

const loadFormComponents = () => import("./components/form-components");

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
    "form.hidden-input": lazyComponent(loadFormComponent("HiddenInputComponent")),
    "form.password-input": lazyComponent(loadFormComponent("PasswordInputComponent")),
    "form.submit-button": lazyComponent(loadFormComponent("SubmitButtonComponent")),
    "form.text-input": lazyComponent(loadFormComponent("TextInputComponent")),
  },
  name: "lattice/form",
});
