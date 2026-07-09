import { Icon } from "@lattice-php/lattice/icons";
import type { ComponentProps, Ref } from "react";
import { useState } from "react";
import { Input } from "@lattice-php/lattice/ui/input";
import { cn } from "@lattice-php/lattice/lib/utils";

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  passwordrules?: string;
  ref?: Ref<HTMLInputElement>;
};

export default function PasswordInput({ className, ref, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        data-test={
          typeof props.name === "string" ? `${props.name}-visibility` : "password-visibility"
        }
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-lt-sm px-3 text-lt-muted-fg hover:text-lt-fg focus-visible:ring-[3px] focus-visible:ring-lt-ring focus-visible:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {showPassword ? (
          <Icon name="eye-off" className="size-lt-icon-md" />
        ) : (
          <Icon name="eye" className="size-lt-icon-md" />
        )}
      </button>
    </div>
  );
}
