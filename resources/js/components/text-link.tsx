import { Link } from "@inertiajs/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Link>;

export default function TextLink({ className = "", children, ...props }: Props) {
  return (
    <Link
      className={cn(
        "text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
