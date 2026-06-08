import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { getStringProp } from "@/lattice/core/props";
import type { RendererComponent } from "@/lattice/core/types";

type ButtonVariant = "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";

declare module "@/lattice/core/types" {
  interface ComponentProps {
    button: {
      href?: string;
      label?: string;
      variant?: ButtonVariant;
    };
  }
}

function getButtonVariant(variant: string): ButtonVariant {
  if (
    variant === "default" ||
    variant === "destructive" ||
    variant === "outline" ||
    variant === "secondary" ||
    variant === "ghost" ||
    variant === "link"
  ) {
    return variant;
  }

  return "default";
}

const ButtonComponent: RendererComponent<"button"> = ({ node }) => {
  const href = getStringProp(node.props, "href");
  const label = getStringProp(node.props, "label", "Action");
  const variant = getButtonVariant(getStringProp(node.props, "variant", "default"));

  if (href) {
    return (
      <Button asChild variant={variant} size="lg">
        <Link href={href}>{label}</Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} size="lg">
      {label}
    </Button>
  );
};

export default ButtonComponent;
