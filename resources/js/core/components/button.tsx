import { Link } from "@inertiajs/react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { IconRenderer } from "@lattice-php/lattice/icons";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import {
  ActionTrigger,
  type TriggerState,
  useClickBehavior,
} from "@lattice-php/lattice/core/use-click-behavior";
import type { ButtonVariant } from "@lattice-php/lattice/types/generated";

export type { ButtonVariant };

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lt-sm text-base font-medium transition-[color,box-shadow] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-lt-icon-md [&_svg]:shrink-0 outline-none focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[3px] aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger",
  {
    variants: {
      variant: {
        default:
          "bg-lt-primary text-lt-primary-fg shadow-lt-xs hover:bg-lt-primary-hover active:bg-lt-primary-active disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:shadow-none",
        destructive:
          "bg-lt-danger text-lt-danger-fg shadow-lt-xs hover:bg-lt-danger-hover active:bg-lt-danger-active focus-visible:ring-lt-danger/20 dark:focus-visible:ring-lt-danger/40 disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:shadow-none",
        success:
          "bg-lt-success text-lt-success-fg shadow-lt-xs hover:bg-lt-success-hover active:bg-lt-success-active disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:shadow-none",
        info: "bg-lt-info text-lt-info-fg shadow-lt-xs hover:bg-lt-info-hover active:bg-lt-info-active disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:shadow-none",
        outline:
          "border border-lt-input bg-lt-bg shadow-lt-xs hover:bg-lt-accent hover:text-lt-accent-fg disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:border-transparent disabled:shadow-none",
        secondary:
          "bg-lt-secondary text-lt-secondary-fg shadow-lt-xs hover:bg-lt-secondary-hover active:bg-lt-secondary-active disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:shadow-none",
        ghost: "hover:bg-lt-accent hover:text-lt-accent-fg disabled:text-lt-disabled-fg",
        link: "text-lt-primary underline-offset-4 hover:underline disabled:text-lt-disabled-fg disabled:no-underline",
      },
      size: {
        default: "h-lt-control-md px-4 py-2 has-[>svg]:px-3",
        sm: "h-lt-control-sm rounded-lt-sm px-3 has-[>svg]:px-2.5",
        lg: "h-lt-control-lg rounded-lt-sm px-6 has-[>svg]:px-4",
        icon: "size-lt-control-md",
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
  const { label, icon } = node.props;
  const variant = node.props.variant ?? "default";
  const testId = nodeIdentity(node);
  const behavior = useClickBehavior(node.props);
  const size = icon ? "icon" : "default";
  const content = icon ? (
    <>
      <IconRenderer className="size-lt-icon-md" icon={icon} />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  ) : (
    label
  );

  const triggerButton = ({ onClick, processing }: TriggerState) => (
    <Button
      data-test={testId}
      disabled={processing}
      onClick={onClick}
      size={size}
      variant={variant}
    >
      {content}
    </Button>
  );

  if (behavior.kind === "navigate") {
    return (
      <Button asChild data-test={testId} variant={variant} size={size}>
        <Link href={behavior.href} method={behavior.method}>
          {content}
        </Link>
      </Button>
    );
  }

  if (behavior.kind === "action") {
    return <ActionTrigger action={behavior.action}>{triggerButton}</ActionTrigger>;
  }

  if (behavior.kind === "effects") {
    return triggerButton({ onClick: behavior.onClick, processing: false });
  }

  return (
    <Button data-test={testId} size={size} type={node.props.buttonType} variant={variant}>
      {content}
    </Button>
  );
};

export default ButtonComponent;
export { Button, buttonVariants };
