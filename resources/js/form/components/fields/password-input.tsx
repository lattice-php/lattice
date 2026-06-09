import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { NodeProps, RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import PasswordInput from "../base/password-input";
import { useDependentField } from "../use-dependent-field";
import { useFieldCommit } from "../use-field-commit";
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
      conditions?: unknown;
      confirmation?: PasswordConfirmation;
      disabled?: boolean;
      hidden?: boolean;
      label?: string;
      labelAction?: FormLabelAction;
      name?: string;
      passwordRules?: string;
      placeholder?: string;
      readonly?: boolean;
      required?: boolean;
      tabIndex?: number;
    };
  }
}

export const PasswordInputComponent: RendererComponent<"form.password-input"> = ({ node }) => {
  const { errors } = useFormContext();
  const { hidden, required, readonly, disabled } = useDependentField(node);
  const { commit } = useFieldCommit();
  const name = getStringProp(node.props, "name");
  const confirmation = getPasswordConfirmation(node.props);
  const confirmationName = confirmation?.name ?? `${name}_confirmation`;
  const passwordRules = getStringProp(node.props, "passwordRules") || undefined;

  if (hidden) {
    return null;
  }

  const onChange =
    (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      commit(field, event.target.value);
    };

  return (
    <div className="grid gap-6">
      <FormFieldFrame
        error={errors[name]}
        label={getStringProp(node.props, "label")}
        labelAction={node.props?.labelAction}
        name={name}
        required={required}
      >
        <PasswordInput
          autoComplete={getStringProp(node.props, "autoComplete")}
          autoFocus={getBooleanProp(node.props, "autoFocus")}
          disabled={disabled}
          id={name}
          name={name}
          onChange={onChange(name)}
          placeholder={getStringProp(node.props, "placeholder")}
          passwordrules={passwordRules}
          readOnly={readonly}
          tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        />
      </FormFieldFrame>

      {confirmation && (
        <FormFieldFrame
          error={errors[confirmationName]}
          label={confirmation.label ?? "Confirm password"}
          name={confirmationName}
          required={required}
        >
          <PasswordInput
            autoComplete="new-password"
            disabled={disabled}
            id={confirmationName}
            name={confirmationName}
            onChange={onChange(confirmationName)}
            placeholder={confirmation.placeholder ?? confirmation.label ?? "Confirm password"}
            passwordrules={passwordRules}
            readOnly={readonly}
            tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
          />
        </FormFieldFrame>
      )}
    </div>
  );
};
