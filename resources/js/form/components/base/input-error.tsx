import type { HTMLAttributes } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";

export default function InputError({
  message,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
  return message ? (
    <p {...props} className={cn("text-sm text-lt-danger", className)}>
      {message}
    </p>
  ) : null;
}
