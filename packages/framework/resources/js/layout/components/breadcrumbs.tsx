import { usePage } from "@inertiajs/react";
import type { RendererComponent } from "@lattice-php/core/types";
import type { PagePayload } from "@lattice-php/lattice/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Breadcrumbs } from "@lattice-php/ui/components/breadcrumbs/breadcrumbs";
import { useT } from "@lattice-php/ui/i18n";

const BreadcrumbsComponent: RendererComponent<"breadcrumbs"> = ({ node }) => {
  const { t } = useT("lattice");
  const page = usePage();
  const crumbs = (page.props.lattice as PagePayload | undefined)?.breadcrumbs ?? [];

  return (
    <Breadcrumbs
      aria-label={t("common.breadcrumb", "Breadcrumb")}
      data-lattice-component={nodeIdentity(node)}
      items={crumbs.map((crumb) => ({ href: crumb.href, label: crumb.title }))}
    />
  );
};

export default BreadcrumbsComponent;
