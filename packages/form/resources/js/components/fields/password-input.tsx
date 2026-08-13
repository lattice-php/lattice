import type { RendererComponent } from "@lattice-php/core";
import { testIdentity } from "@lattice-php/core/test-id";
import { AffixGroup } from "@lattice-php/ui/affix-group";
import { TextLink } from "@lattice-php/ui/text-link";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import PasswordInput from "@lattice-php/ui/password-input";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useControlledField } from "@lattice-php/form/hooks/use-controlled-field";
import { useFieldCommit } from "@lattice-php/form/hooks/use-field-commit";
import { useFormContext } from "@lattice-php/form/hooks/context";

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
        labelAction={
          props.labelAction && (
            <TextLink
              href={props.labelAction.href}
              tabIndex={props.labelAction.tabIndex ?? undefined}
            >
              {props.labelAction.label}
            </TextLink>
          )
        }
        id={field.name}
        required={field.required}
      >
        {(controlProps) => (
          <AffixGroup prefix={props.prefix} suffix={props.suffix}>
            {(controlClassName) => (
              <PasswordInput
                {...controlProps}
                autoComplete={props.autoComplete ?? ""}
                autoFocus={props.autoFocus ?? false}
                className={controlClassName}
                data-test={field.testId}
                disabled={field.disabled}
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
        )}
      </FormFieldFrame>

      {confirmation && (
        <FormFieldFrame
          error={errors[confirmationErrorKey]}
          label={confirmation.label ?? "Confirm password"}
          id={confirmationName}
          required={field.required}
        >
          {(controlProps) => (
            <PasswordInput
              {...controlProps}
              autoComplete="new-password"
              data-test={testIdentity(confirmationLocalName)}
              disabled={field.disabled}
              name={confirmationName}
              onChange={(event) => {
                commit(confirmationLocalName, event.target.value);
              }}
              placeholder={confirmation.placeholder ?? confirmation.label ?? "Confirm password"}
              passwordrules={passwordRules}
              readOnly={field.readOnly}
              tabIndex={props.tabIndex ?? undefined}
            />
          )}
        </FormFieldFrame>
      )}
    </div>
  );
};
