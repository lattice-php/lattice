import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import { AffixGroup } from "../base/affix-group";
import { FormFieldFrame } from "../base/field";
import PasswordInput from "../base/password-input";
import { useFieldScope } from "../field-scope";
import { useControlledField } from "../use-controlled-field";
import { useFieldCommit } from "../use-field-commit";
import { useFormContext } from "../context";

export const PasswordInputComponent: RendererComponent<"field.password-input"> = ({ node }) => {
  const props = node.props;
  const { errors } = useFormContext();
  const field = useControlledField(node);
  const { commit } = useFieldCommit();
  const scope = useFieldScope();
  const confirmation = props.confirmation;
  const confirmationLocalName = confirmation?.name ?? `${field.localName}_confirmation`;
  const confirmationName = scope ? scope.scopedName(confirmationLocalName) : confirmationLocalName;
  const confirmationErrorKey = scope
    ? scope.errorKey(confirmationLocalName)
    : confirmationLocalName;
  const passwordRules = (props.passwordRules ?? "") || undefined;

  if (field.hidden) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <FormFieldFrame
        error={field.error}
        helperText={props.helperText ?? undefined}
        tooltip={props.tooltip ?? undefined}
        label={props.label ?? ""}
        labelAction={props.labelAction ?? undefined}
        name={field.name}
        required={field.required}
      >
        <AffixGroup prefix={props.prefix} suffix={props.suffix}>
          {(controlClassName) => (
            <PasswordInput
              autoComplete={props.autoComplete ?? ""}
              autoFocus={props.autoFocus ?? false}
              className={controlClassName}
              data-test={field.testId}
              disabled={field.disabled}
              id={field.name}
              name={field.name}
              onChange={(event) => {
                field.commit(event.target.value);
              }}
              placeholder={props.placeholder ?? ""}
              passwordrules={passwordRules}
              readOnly={field.readOnly}
              tabIndex={props.tabIndex ?? undefined}
              value={field.value}
            />
          )}
        </AffixGroup>
      </FormFieldFrame>

      {confirmation && (
        <FormFieldFrame
          error={errors[confirmationErrorKey]}
          label={confirmation.label ?? "Confirm password"}
          name={confirmationName}
          required={field.required}
        >
          <PasswordInput
            autoComplete="new-password"
            data-test={testIdentity(confirmationLocalName)}
            disabled={field.disabled}
            id={confirmationName}
            name={confirmationName}
            onChange={(event) => {
              commit(confirmationLocalName, event.target.value);
            }}
            placeholder={confirmation.placeholder ?? confirmation.label ?? "Confirm password"}
            passwordrules={passwordRules}
            readOnly={field.readOnly}
            tabIndex={props.tabIndex ?? undefined}
          />
        </FormFieldFrame>
      )}
    </div>
  );
};
