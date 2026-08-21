import type { RendererComponent } from "@lattice-php/core";
import { InputOTP } from "./otp-input";
import { SimpleField } from "../base/simple-field";

export const OtpInputAdapter: RendererComponent<"field.otp"> = ({ node }) => {
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
