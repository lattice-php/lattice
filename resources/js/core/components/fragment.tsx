import { useCallback, useEffect, useState } from "react";
import { apiJson } from "@lattice-php/lattice/core/api";
import { Skeleton } from "@lattice-php/lattice/core/components/skeleton";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { Node, RendererComponent, Schema } from "@lattice-php/lattice/core/types";
import { LATTICE_EVENT, type ReloadComponentEvent } from "@lattice-php/lattice/events/event-names";

type FragmentResponse = {
  schema?: Schema;
};

const skeletonHeights = {
  lg: 320,
  md: 64,
  sm: 40,
  xl: 384,
  xs: 32,
} as const;

function getComponents(value: unknown): Node[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (node): node is Node =>
      typeof node === "object" && node !== null && "type" in node && typeof node.type === "string",
  );
}

const FragmentComponent: RendererComponent<"fragment"> = ({ node }) => {
  const endpoint = node.props.endpoint ?? "";
  const isLazy = node.props.lazy === true;
  const componentRef = node.props.ref ?? "";
  const skeletonHeight = skeletonHeights[node.props.size];
  const [components, setComponents] = useState(() => node.schema ?? []);
  const [hasLoaded, setHasLoaded] = useState(!isLazy);
  const [processing, setProcessing] = useState(isLazy && endpoint !== "");

  const load = useCallback(async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    setProcessing(true);

    try {
      const result = await apiJson<FragmentResponse>(endpoint, { ref: componentRef });

      setComponents(getComponents(result.schema));
      setHasLoaded(true);
    } finally {
      setProcessing(false);
    }
  }, [endpoint, componentRef]);

  useEffect(() => {
    if (!isLazy || hasLoaded) {
      return;
    }

    void load();
  }, [hasLoaded, isLazy, load]);

  useEffect(() => {
    function reload(event: Event): void {
      const detail = (event as ReloadComponentEvent).detail;

      if (detail?.component !== node.id) {
        return;
      }

      void load();
    }

    window.addEventListener(LATTICE_EVENT.reloadComponent, reload);

    return () => window.removeEventListener(LATTICE_EVENT.reloadComponent, reload);
  }, [load, node.id]);

  useEffect(() => {
    function reloadOnLocaleChange(): void {
      if (!hasLoaded) {
        return;
      }

      void load();
    }

    window.addEventListener(LATTICE_EVENT.localeChange, reloadOnLocaleChange);

    return () => window.removeEventListener(LATTICE_EVENT.localeChange, reloadOnLocaleChange);
  }, [hasLoaded, load]);

  return (
    <div
      data-lattice-fragment={node.id}
      style={processing && components.length === 0 ? { minHeight: skeletonHeight } : undefined}
    >
      {processing && components.length === 0 ? (
        <Skeleton className="w-full" style={{ height: skeletonHeight }} />
      ) : (
        <Renderer nodes={components} />
      )}
    </div>
  );
};

export default FragmentComponent;
