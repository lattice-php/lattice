import * as React from "react";
import { cn } from "@lattice/lib/utils";
import { getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";

declare module "@lattice/core/types" {
  interface ComponentProps {
    card: {
      description?: string;
      title?: string;
    };
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

const CardComponent: RendererComponent<"card"> = ({ children, node }) => (
  <Card data-lattice-component={node.id}>
    <CardHeader>
      <CardTitle>{getStringProp(node.props, "title")}</CardTitle>
      <CardDescription>{getStringProp(node.props, "description")}</CardDescription>
    </CardHeader>
    {children && <CardContent>{children}</CardContent>}
  </Card>
);

export default CardComponent;
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
