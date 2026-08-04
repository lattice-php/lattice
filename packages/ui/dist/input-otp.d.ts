import { OTPInput } from "input-otp";
import { ComponentProps } from "react";
type InputOTPProps = Omit<ComponentProps<typeof OTPInput>, "children" | "maxLength" | "render"> & {
  length: number;
};
export declare function InputOTP({
  length,
  containerClassName,
  pattern,
  ...props
}: InputOTPProps): import("react").JSX.Element;
