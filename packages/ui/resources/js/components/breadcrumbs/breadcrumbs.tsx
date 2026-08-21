import { Fragment } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { useNavigation } from "../../navigation";

export type BreadcrumbItem = {
  href?: string;
  label: ReactNode;
};

export type BreadcrumbsProps = Omit<ComponentProps<"nav">, "children"> & {
  items: readonly BreadcrumbItem[];
  separator?: ReactNode;
};

export function Breadcrumbs({
  "aria-label": ariaLabel = "Breadcrumb",
  className,
  items,
  separator = "/",
  ...props
}: BreadcrumbsProps) {
  const { Link } = useNavigation();

  if (items.length === 0) {
    return null;
  }

  return (
    <nav {...props} aria-label={ariaLabel} className={cn("min-w-0 flex-1", className)}>
      <ol className="flex items-center gap-2 text-sm text-lt-muted-fg">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={item.href ?? index}>
              <li className="min-w-0">
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn("block truncate", isLast && "text-lt-fg")}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link className="block truncate hover:text-lt-fg" href={item.href}>
                    {item.label}
                  </Link>
                )}
              </li>
              {isLast ? null : <li aria-hidden="true">{separator}</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
