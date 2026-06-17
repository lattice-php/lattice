import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";

function Card({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface py-6 text-lt-surface-fg shadow-lt-sm",
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
  const { title, description } = node.props;

  return (
    <Card data-lattice-component={nodeIdentity(node)}>
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
