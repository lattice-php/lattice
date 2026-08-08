import * as React from "react";
import { cn } from "../lib/utils";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { RenderNode } from "@lattice-php/core/renderer";
import type { RendererComponent } from "@lattice-php/core/types";
import { InfoTooltip } from "../info-tooltip";

function Card({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface py-lt-gutter text-lt-surface-fg shadow-lt-sm",
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
      className={cn("flex flex-col gap-1.5 px-lt-gutter", className)}
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
  return <div data-slot="card-content" className={cn("px-lt-gutter", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-lt-gutter", className)}
      {...props}
    />
  );
}

const CardComponent: RendererComponent<"card"> = ({ children, node }) => {
  const { title, description, tooltip, headerActions } = node.props;
  const actionNodes = headerActions ?? [];

  return (
    <Card data-lattice-component={nodeIdentity(node)}>
      {(title || description || actionNodes.length > 0) && (
        <CardHeader>
          {(title || actionNodes.length > 0) && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center">
                {title && <CardTitle>{title}</CardTitle>}
                {title && <InfoTooltip content={tooltip} />}
              </div>
              {actionNodes.length > 0 && (
                <div className="flex items-center gap-2">
                  {actionNodes.map((actionNode, index) => (
                    <RenderNode key={actionNode.key ?? actionNode.id ?? index} node={actionNode} />
                  ))}
                </div>
              )}
            </div>
          )}
          {description && (
            <div className="flex items-center">
              <CardDescription>{description}</CardDescription>
              {!title && <InfoTooltip content={tooltip} />}
            </div>
          )}
        </CardHeader>
      )}
      {children && <CardContent className="flex flex-col gap-6">{children}</CardContent>}
    </Card>
  );
};

export default CardComponent;
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
