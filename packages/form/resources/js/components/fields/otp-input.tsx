import type { RendererComponent } from "@lattice-php/core/types";
import { InputOTP } from "@lattice-php/ui/input-otp";
import { SimpleField } from "./simple-field";

export const OtpInputComponent: RendererComponent<"field.otp"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }, controlProps) => (
        <InputOTP
          {...controlProps}
          autoFocus={props.autoFocus ?? false}
          data-test={testId}
          disabled={disabled || readOnly}
          length={props.length}
          name={name}
          onChange={(next) => commit(next)}
          value={value}
        />
      )}
    </SimpleField>
  );
};
