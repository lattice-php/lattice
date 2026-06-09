import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@lattice/lattice/lib/utils";
import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lt-sm border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[3px] aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-lt-primary text-lt-primary-fg [a&]:hover:bg-lt-primary/90",
        secondary:
          "border-transparent bg-lt-secondary text-lt-secondary-fg [a&]:hover:bg-lt-secondary/90",
        destructive:
          "border-transparent bg-lt-danger text-lt-danger-fg [a&]:hover:bg-lt-danger/90 focus-visible:ring-lt-danger/20 dark:focus-visible:ring-lt-danger/40 dark:bg-lt-danger/60",
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

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    badge: {
      label?: string;
    };
  }
}

const BadgeComponent: RendererComponent<"badge"> = ({ node }) => (
  <Badge variant="secondary" className="w-fit px-3 py-1">
    {getStringProp(node.props, "label")}
  </Badge>
);

export default BadgeComponent;
export { Badge, badgeVariants };
