import { Suspense } from "react";
import type { RendererComponent } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { useMapProviderRegistry } from "./provider-registry";

const MapComponent: RendererComponent<"map"> = ({ node }) => {
  const { t } = useT("map");
  const providers = useMapProviderRegistry();
  const Provider = providers[node.props.provider.name];

  if (!Provider) {
    return (
      <div
        className="rounded-lt border border-lt-border bg-lt-muted p-4 text-sm text-lt-muted-fg"
        role="alert"
      >
        {t("map.provider-missing", "Map provider “{{provider}}” is not available.", {
          provider: node.props.provider.name,
        })}
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="lt-map lt-map--pending" style={{ height: node.props.height }}>
          <span role="status">{t("map.loading", "Loading map…")}</span>
        </div>
      }
    >
      <Provider node={node} />
    </Suspense>
  );
};

export default MapComponent;
