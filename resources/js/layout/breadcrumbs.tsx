import { Link, usePage } from "@inertiajs/react";
import { Fragment } from "react";
import type { RendererComponent } from "@lattice/lattice/core/types";

type Crumb = { href: string; title: string };

const BreadcrumbsComponent: RendererComponent<"breadcrumbs"> = ({ node }) => {
  const page = usePage();
  const crumbs = (page.props.lattice as { breadcrumbs?: Crumb[] } | undefined)?.breadcrumbs ?? [];

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" data-lattice-component={node.id}>
      <ol className="flex items-center gap-2 text-sm text-lt-muted-fg">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={crumb.href}>
              <li>
                {isLast ? (
                  <span aria-current="page" className="text-lt-fg">
                    {crumb.title}
                  </span>
                ) : (
                  <Link className="hover:text-lt-fg" href={crumb.href}>
                    {crumb.title}
                  </Link>
                )}
              </li>
              {isLast ? null : <li aria-hidden="true">/</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbsComponent;
