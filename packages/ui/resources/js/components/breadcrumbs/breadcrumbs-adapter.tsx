import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { UI_NAMESPACE, useT } from "../../i18n";
import { Breadcrumbs } from "./breadcrumbs";

export const BreadcrumbsAdapter: RendererComponent<"breadcrumbs"> = ({ node }) => {
  const { t } = useT(UI_NAMESPACE);

  return (
    <Breadcrumbs
      aria-label={t("common.breadcrumb", "Breadcrumb")}
      className={node.props.class ?? undefined}
      data-test={nodeIdentity(node)}
      items={node.props.items.map((crumb) => ({ href: crumb.href, label: crumb.title }))}
    />
  );
};
