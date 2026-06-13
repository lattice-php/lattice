import { Link } from "@inertiajs/react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeTestId } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import type { ButtonVariant } from "@lattice-php/lattice/types/generated";

export type { ButtonVariant };

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lt-sm text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-lt-icon-md [&_svg]:shrink-0 outline-none focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[3px] aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger",
  {
    variants: {
      variant: {
        default: "bg-lt-primary text-lt-primary-fg shadow-xs hover:bg-lt-primary/90",
        destructive:
          "bg-lt-danger text-lt-danger-fg shadow-xs hover:bg-lt-danger/90 focus-visible:ring-lt-danger/20 dark:focus-visible:ring-lt-danger/40",
        success: "bg-lt-success text-lt-success-fg shadow-xs hover:bg-lt-success/90",
        info: "bg-lt-info text-lt-info-fg shadow-xs hover:bg-lt-info/90",
        outline:
          "border border-lt-input bg-lt-bg shadow-xs hover:bg-lt-accent hover:text-lt-accent-fg",
        secondary: "bg-lt-secondary text-lt-secondary-fg shadow-xs hover:bg-lt-secondary/80",
        ghost: "hover:bg-lt-accent hover:text-lt-accent-fg",
        link: "text-lt-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lt-sm px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lt-sm px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

const ButtonComponent: RendererComponent<"button"> = ({ node }) => {
  const { href, label } = node.props;
  const variant = node.props.variant ?? "default";
  const testId = nodeTestId(node);

  if (href) {
    return (
      <Button asChild data-test={testId} variant={variant} size="lg">
        <Link href={href}>{label}</Link>
      </Button>
    );
  }

  return (
    <Button data-test={testId} type={node.props.buttonType} variant={variant} size="lg">
      {label}
    </Button>
  );
};

export default ButtonComponent;
export { Button, buttonVariants };
