import type { NodeProps, RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import PasswordInput from "../base/password-input";
import type { PasswordInput as PasswordInputProps } from "../types";
import { useDependentField } from "../use-dependent-field";
import { useFieldCommit } from "../use-field-commit";
import { useFormContext } from "../context";

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

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    "form.password-input": PasswordInputProps;
  }
}

export const PasswordInputComponent: RendererComponent<"form.password-input"> = ({ node }) => {
  const props = node.props ?? ({} as PasswordInputProps);
  const { errors } = useFormContext();
  const { hidden, required, readonly, disabled } = useDependentField(node);
  const { commit } = useFieldCommit();
  const name = props.name ?? "";
  const confirmation = getPasswordConfirmation(node.props);
  const confirmationName = confirmation?.name ?? `${name}_confirmation`;
  const passwordRules = (props.passwordRules ?? "") || undefined;

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
        label={props.label ?? ""}
        labelAction={props.labelAction ?? undefined}
        name={name}
        required={required}
      >
        <PasswordInput
          autoComplete={props.autoComplete ?? ""}
          autoFocus={props.autoFocus ?? false}
          disabled={disabled}
          id={name}
          name={name}
          onChange={onChange(name)}
          placeholder={props.placeholder ?? ""}
          passwordrules={passwordRules}
          readOnly={readonly}
          tabIndex={props.tabIndex ?? undefined}
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
            tabIndex={props.tabIndex ?? undefined}
          />
        </FormFieldFrame>
      )}
    </div>
  );
};
