import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp";
import type { ComponentProps } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";

function Slot({ char, hasFakeCaret, isActive }: SlotProps) {
  return (
    <div
      className={cn(
        "relative flex h-lt-control-md w-10 items-center justify-center border-y border-r border-lt-input text-base shadow-lt-xs transition-all first:rounded-l-lt-sm first:border-l last:rounded-r-lt-sm",
        isActive && "z-10 border-lt-ring ring-lt-ring/50 ring-[3px]",
      )}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-lt-fg h-5 w-px animate-pulse" />
        </div>
      ) : null}
    </div>
  );
}

type InputOTPProps = Omit<ComponentProps<typeof OTPInput>, "children" | "maxLength" | "render"> & {
  length: number;
};

export function InputOTP({
  length,
  containerClassName,
  pattern = REGEXP_ONLY_DIGITS,
  ...props
}: InputOTPProps) {
  return (
    <OTPInput
      maxLength={length}
      pattern={pattern}
      containerClassName={cn(
        "flex items-center gap-2 has-[:disabled]:opacity-50",
        containerClassName,
      )}
      render={({ slots }) => (
        <div className="flex items-center">
          {slots.map((slot, index) => (
            <Slot key={index} {...slot} />
          ))}
        </div>
      )}
      {...props}
    />
  );
}
