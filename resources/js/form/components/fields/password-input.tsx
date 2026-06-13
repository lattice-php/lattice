import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import { FormFieldFrame } from "../base/field";
import PasswordInput from "../base/password-input";
import { useFieldScope } from "../field-scope";
import { useDependentField } from "../use-dependent-field";
import { useFieldCommit } from "../use-field-commit";
import { useFormContext } from "../context";

export const PasswordInputComponent: RendererComponent<"form.password-input"> = ({ node }) => {
  const props = node.props;
  const { errors } = useFormContext();
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const { commit } = useFieldCommit();
  const scope = useFieldScope();
  const localName = props.name ?? "";
  const name = scope ? scope.scopedName(localName) : localName;
  const errorKey = scope ? scope.errorKey(localName) : localName;
  const confirmation = props.confirmation;
  const confirmationLocalName = confirmation?.name ?? `${localName}_confirmation`;
  const confirmationName = scope ? scope.scopedName(confirmationLocalName) : confirmationLocalName;
  const confirmationErrorKey = scope
    ? scope.errorKey(confirmationLocalName)
    : confirmationLocalName;
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
        error={errors[errorKey]}
        helperText={props.helperText ?? undefined}
        label={props.label ?? ""}
        labelAction={props.labelAction ?? undefined}
        name={name}
        required={required}
      >
        <PasswordInput
          autoComplete={props.autoComplete ?? ""}
          autoFocus={props.autoFocus ?? false}
          data-test={testIdentity(localName)}
          disabled={disabled}
          id={name}
          name={name}
          onChange={onChange(localName)}
          placeholder={props.placeholder ?? ""}
          passwordrules={passwordRules}
          readOnly={readOnly}
          tabIndex={props.tabIndex ?? undefined}
        />
      </FormFieldFrame>

      {confirmation && (
        <FormFieldFrame
          error={errors[confirmationErrorKey]}
          label={confirmation.label ?? "Confirm password"}
          name={confirmationName}
          required={required}
        >
          <PasswordInput
            autoComplete="new-password"
            data-test={testIdentity(confirmationLocalName)}
            disabled={disabled}
            id={confirmationName}
            name={confirmationName}
            onChange={onChange(confirmationLocalName)}
            placeholder={confirmation.placeholder ?? confirmation.label ?? "Confirm password"}
            passwordrules={passwordRules}
            readOnly={readOnly}
            tabIndex={props.tabIndex ?? undefined}
          />
        </FormFieldFrame>
      )}
    </div>
  );
};
