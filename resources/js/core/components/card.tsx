import * as React from "react";
import { cn } from "@lattice/lattice/lib/utils";
import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import type { Card as CardProps } from "@lattice/lattice/generated/types";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    card: CardProps;
  }
}

function Card({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface py-6 text-lt-surface-fg shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-lt-muted-fg", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center px-6", className)} {...props} />
  );
}

const CardComponent: RendererComponent<"card"> = ({ children, node }) => {
  const title = getStringProp(node.props, "title");
  const description = getStringProp(node.props, "description");

  return (
    <Card data-lattice-component={node.id}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      {children && <CardContent className="flex flex-col gap-6">{children}</CardContent>}
    </Card>
  );
};

export default CardComponent;
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
