import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { NodeProps, RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import PasswordInput from "../base/password-input";
import { useFormContext } from "../context";
import type { FormLabelAction } from "../types";

type PasswordConfirmation = {
  label?: string;
  name?: string;
  placeholder?: string;
};

function getPasswordConfirmation(props: NodeProps | undefined): PasswordConfirmation | undefined {
  const value = props?.confirmation;

  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const confirmation = value as Record<string, unknown>;

  return {
    label: typeof confirmation.label === "string" ? confirmation.label : undefined,
    name: typeof confirmation.name === "string" ? confirmation.name : undefined,
    placeholder:
      typeof confirmation.placeholder === "string" ? confirmation.placeholder : undefined,
  };
}

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.password-input": {
      autoComplete?: string;
      autoFocus?: boolean;
      confirmation?: PasswordConfirmation;
      label?: string;
      labelAction?: FormLabelAction;
      name?: string;
      passwordRules?: string;
      placeholder?: string;
      required?: boolean;
      tabIndex?: number;
    };
  }
}

export const PasswordInputComponent: RendererComponent<"form.password-input"> = ({ node }) => {
  const { errors } = useFormContext();
  const name = getStringProp(node.props, "name");
  const confirmation = getPasswordConfirmation(node.props);
  const confirmationName = confirmation?.name ?? `${name}_confirmation`;
  const passwordRules = getStringProp(node.props, "passwordRules") || undefined;

  return (
    <div className="grid gap-6">
      <FormFieldFrame
        error={errors[name]}
        label={getStringProp(node.props, "label")}
        labelAction={node.props?.labelAction}
        name={name}
      >
        <PasswordInput
          autoComplete={getStringProp(node.props, "autoComplete")}
          autoFocus={getBooleanProp(node.props, "autoFocus")}
          id={name}
          name={name}
          placeholder={getStringProp(node.props, "placeholder")}
          passwordrules={passwordRules}
          required={getBooleanProp(node.props, "required")}
          tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        />
      </FormFieldFrame>

      {confirmation && (
        <FormFieldFrame
          error={errors[confirmationName]}
          label={confirmation.label ?? "Confirm password"}
          name={confirmationName}
        >
          <PasswordInput
            autoComplete="new-password"
            id={confirmationName}
            name={confirmationName}
            placeholder={confirmation.placeholder ?? confirmation.label ?? "Confirm password"}
            passwordrules={passwordRules}
            required={getBooleanProp(node.props, "required")}
            tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
          />
        </FormFieldFrame>
      )}
    </div>
  );
};
