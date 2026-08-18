import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Tooltip } from "../tooltip/tooltip";

export type CardProps = Omit<ComponentProps<"article">, "children" | "title"> & {
  children?: ReactNode;
  description?: ReactNode;
  headerActions?: ReactNode;
  title?: ReactNode;
  tooltip?: ReactNode;
};

export function Card({
  children,
  className,
  description,
  headerActions,
  title,
  tooltip,
  ...props
}: CardProps) {
  const hasTitle = hasContent(title);
  const hasDescription = hasContent(description);
  const hasHeaderActions = hasContent(headerActions);
  const hasHeader = hasTitle || hasDescription || hasHeaderActions;

  return (
    <article
      {...props}
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface py-lt-gutter text-lt-surface-fg shadow-lt-sm",
        className,
      )}
    >
      {hasHeader ? (
        <CardHeader>
          {hasTitle || hasHeaderActions ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center">
                {hasTitle ? <CardTitle>{title}</CardTitle> : null}
                {hasTitle ? <Tooltip content={tooltip} /> : null}
              </div>
              {hasHeaderActions ? (
                <div className="flex items-center gap-2">{headerActions}</div>
              ) : null}
            </div>
          ) : null}
          {hasDescription ? (
            <div className="flex items-center">
              <CardDescription>{description}</CardDescription>
              {!hasTitle ? <Tooltip content={tooltip} /> : null}
            </div>
          ) : null}
        </CardHeader>
      ) : null}
      {hasContent(children) ? (
        <CardContent className="flex flex-col gap-6">{children}</CardContent>
      ) : null}
    </article>
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-lt-gutter", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-lt-muted-fg", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-lt-gutter", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-lt-gutter", className)}
      {...props}
    />
  );
}

function hasContent(node: ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== "";
}
