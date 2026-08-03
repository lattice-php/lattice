import { HTMLAttributes } from "react";
export default function InputError({
  message,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  message?: string;
}): import("react").JSX.Element | null;
