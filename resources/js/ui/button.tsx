import { Link } from "@inertiajs/react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { Icon, IconRenderer } from "@lattice-php/lattice/icons";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { ActionTrigger, type TriggerState, useClickBehavior } from "./click-behavior";
import type { ButtonVariant, Intent } from "@lattice-php/lattice/types/generated";

export type { ButtonVariant, Intent };

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lt-sm text-base font-medium transition-[color,box-shadow] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-lt-icon-md [&_svg]:shrink-0 outline-none focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)] aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger",
  {
    variants: {
      variant: {
        solid:
          "shadow-lt-xs disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:shadow-none",
        outline:
          "border border-lt-input bg-lt-bg shadow-lt-xs hover:bg-lt-accent hover:text-lt-accent-fg disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:border-transparent disabled:shadow-none",
        ghost: "hover:bg-lt-accent hover:text-lt-accent-fg disabled:text-lt-disabled-fg",
        link: "underline-offset-4 hover:underline disabled:text-lt-disabled-fg disabled:no-underline",
      },
      color: {
        primary: "",
        secondary: "",
        success: "",
        info: "",
        warning: "",
        danger: "",
      },
      size: {
        md: "h-lt-control-md px-4 py-2 has-[>svg]:px-3",
        sm: "h-lt-control-sm rounded-lt-sm px-3 has-[>svg]:px-2.5",
        lg: "h-lt-control-lg rounded-lt-sm px-6 has-[>svg]:px-4",
        icon: "size-lt-control-md",
      },
    },
    compoundVariants: [
      {
        variant: "solid",
        color: "primary",
        class:
          "bg-lt-primary text-lt-primary-fg hover:bg-lt-primary-hover active:bg-lt-primary-active",
      },
      {
        variant: "solid",
        color: "secondary",
        class:
          "bg-lt-secondary text-lt-secondary-fg hover:bg-lt-secondary-hover active:bg-lt-secondary-active",
      },
      {
        variant: "solid",
        color: "success",
        class:
          "bg-lt-success text-lt-success-fg hover:bg-lt-success-hover active:bg-lt-success-active",
      },
      {
        variant: "solid",
        color: "info",
        class: "bg-lt-info text-lt-info-fg hover:bg-lt-info-hover active:bg-lt-info-active",
      },
      {
        variant: "solid",
        color: "warning",
        class:
          "bg-lt-warning text-lt-warning-fg hover:bg-lt-warning-hover active:bg-lt-warning-active",
      },
      {
        variant: "solid",
        color: "danger",
        class:
          "bg-lt-danger text-lt-danger-fg hover:bg-lt-danger-hover active:bg-lt-danger-active focus-visible:ring-lt-danger/20 dark:focus-visible:ring-lt-danger/40",
      },
      {
        variant: "outline",
        color: "primary",
        class: "border-lt-primary/40 text-lt-primary hover:bg-lt-primary/10 hover:text-lt-primary",
      },
      {
        variant: "outline",
        color: "secondary",
        class:
          "border-lt-secondary text-lt-secondary-fg hover:bg-lt-secondary hover:text-lt-secondary-fg",
      },
      {
        variant: "outline",
        color: "success",
        class: "border-lt-success/40 text-lt-success hover:bg-lt-success/10 hover:text-lt-success",
      },
      {
        variant: "outline",
        color: "info",
        class: "border-lt-info/40 text-lt-info hover:bg-lt-info/10 hover:text-lt-info",
      },
      {
        variant: "outline",
        color: "warning",
        class: "border-lt-warning/40 text-lt-warning hover:bg-lt-warning/10 hover:text-lt-warning",
      },
      {
        variant: "outline",
        color: "danger",
        class: "border-lt-danger/40 text-lt-danger hover:bg-lt-danger/10 hover:text-lt-danger",
      },
      {
        variant: "ghost",
        color: "primary",
        class: "text-lt-primary hover:bg-lt-primary/10 hover:text-lt-primary",
      },
      {
        variant: "ghost",
        color: "secondary",
        class: "text-lt-secondary-fg hover:bg-lt-secondary hover:text-lt-secondary-fg",
      },
      {
        variant: "ghost",
        color: "success",
        class: "text-lt-success hover:bg-lt-success/10 hover:text-lt-success",
      },
      {
        variant: "ghost",
        color: "info",
        class: "text-lt-info hover:bg-lt-info/10 hover:text-lt-info",
      },
      {
        variant: "ghost",
        color: "warning",
        class: "text-lt-warning hover:bg-lt-warning/10 hover:text-lt-warning",
      },
      {
        variant: "ghost",
        color: "danger",
        class: "text-lt-danger hover:bg-lt-danger/10 hover:text-lt-danger",
      },
      { variant: "link", color: "primary", class: "text-lt-primary" },
      { variant: "link", color: "secondary", class: "text-lt-secondary-fg" },
      { variant: "link", color: "success", class: "text-lt-success" },
      { variant: "link", color: "info", class: "text-lt-info" },
      { variant: "link", color: "warning", class: "text-lt-warning" },
      { variant: "link", color: "danger", class: "text-lt-danger" },
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

/**
 * Solid and link buttons read as primary when no colour is given; outline and
 * ghost stay neutral so chrome buttons do not turn teal by default.
 */
function resolveButtonColor(
  variant: ButtonVariant | null | undefined,
  color: Intent | null | undefined,
): Intent | undefined {
  if (color) {
    return color;
  }

  return (variant ?? "solid") === "solid" || variant === "link" ? "primary" : undefined;
}

function Button({
  className,
  variant,
  color,
  size,
  asChild = false,
  icon,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "color"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Leading icon glyph. Ignored with `asChild` (Slot needs a single child). */
    icon?: string;
  }) {
  const Comp = asChild ? Slot : "button";
  const content =
    icon && !asChild ? (
      <>
        <Icon name={icon} aria-hidden="true" />
        {children}
      </>
    ) : (
      children
    );

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, color: resolveButtonColor(variant, color), size, className }),
      )}
      {...props}
    >
      {content}
    </Comp>
  );
}

const ButtonComponent: RendererComponent<"button"> = ({ node }) => {
  const { label, icon } = node.props;
  const variant = node.props.variant ?? "solid";
  const color = node.props.color ?? null;
  const testId = nodeIdentity(node);
  const behavior = useClickBehavior(node.props);
  const size = icon ? "icon" : "md";
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
      color={color}
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
      <Button asChild color={color} data-test={testId} variant={variant} size={size}>
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
    <Button
      color={color}
      data-test={testId}
      size={size}
      type={node.props.buttonType}
      variant={variant}
    >
      {content}
    </Button>
  );
};

export default ButtonComponent;
export { Button, buttonVariants };
