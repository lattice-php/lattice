import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { RendererComponent } from "@lattice-php/lattice/core/types";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lt-sm border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-lt-icon-xs gap-1 [&>svg]:pointer-events-none focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[3px] aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-lt-primary text-lt-primary-fg [a&]:hover:bg-lt-primary-hover",
        secondary:
          "border-transparent bg-lt-secondary text-lt-secondary-fg [a&]:hover:bg-lt-secondary-hover",
        destructive:
          "border-transparent bg-lt-danger text-lt-danger-fg [a&]:hover:bg-lt-danger-hover focus-visible:ring-lt-danger/20 dark:focus-visible:ring-lt-danger/40 dark:bg-lt-danger/60",
        outline: "border-lt-border text-lt-fg [a&]:hover:bg-lt-accent [a&]:hover:text-lt-accent-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

const BadgeComponent: RendererComponent<"badge"> = ({ node }) => (
  <Badge variant="secondary" className="w-fit px-3 py-1">
    {node.props.label}
  </Badge>
);

export default BadgeComponent;
export { Badge, badgeVariants };
