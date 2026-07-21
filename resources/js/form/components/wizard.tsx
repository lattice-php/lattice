import type { RendererComponent } from "@lattice-php/lattice/core/types";

export const WizardComponent: RendererComponent<"wizard"> = ({ children }) => (
  <div data-slot="wizard">{children}</div>
);

export const WizardStepComponent: RendererComponent<"wizard-step"> = ({ children, node }) => (
  <section data-slot="wizard-step" id={`wizard-step-${node.props.name}-panel`}>
    {children}
  </section>
);
