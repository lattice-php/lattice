import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { InputOTP } from "@lattice-php/lattice/ui/input-otp";
import { SimpleField } from "./simple-field";

export const OtpInputComponent: RendererComponent<"field.otp"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }) => (
        <InputOTP
          autoFocus={props.autoFocus ?? false}
          data-test={testId}
          disabled={disabled || readOnly}
          id={name}
          length={props.length}
          name={name}
          onChange={(next) => commit(next)}
          value={value}
        />
      )}
    </SimpleField>
  );
};
