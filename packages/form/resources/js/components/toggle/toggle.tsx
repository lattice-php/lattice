import type { ComponentProps } from "react";
import { cn } from "@lattice-php/ui/lib/utils";

export type ToggleProps = Omit<ComponentProps<"button">, "children" | "onClick" | "type"> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Toggle({ checked, className, onCheckedChange, ...props }: ToggleProps) {
  return (
    <button
      {...props}
      aria-checked={checked}
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-lt-muted p-0.5 shadow-lt-xs transition-colors outline-none focus-visible:border-lt-ring focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 aria-readonly:cursor-default disabled:cursor-not-allowed disabled:bg-lt-disabled data-[state=checked]:bg-lt-primary disabled:data-[state=checked]:bg-lt-disabled",
        className,
      )}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange?.(!checked)}
      role="switch"
      type="button"
    >
      <span
        className="size-5 rounded-full bg-lt-bg shadow-lt-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        data-state={checked ? "checked" : "unchecked"}
      />
    </button>
  );
}
