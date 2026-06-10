import { useCallback, useEffect, useState } from "react";
import { withRefHeader } from "@lattice/lattice/core/component-ref";
import { getStringProp } from "@lattice/lattice/core/props";
import { Renderer, useRendererContext } from "@lattice/lattice/core/renderer";
import type { Node, RendererComponent, Schema } from "@lattice/lattice/core/types";
import { LATTICE_EVENT, type ReloadComponentEvent } from "@lattice/lattice/events/event-names";

type FragmentResponse = {
  schema?: Schema;
};

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    fragment: {
      endpoint?: string;
      ref?: string;
      lazy?: boolean;
    };
  }
}

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
  const endpoint = getStringProp(node.props, "endpoint");
  const isLazy = node.props?.lazy === true;
  const componentRef = getStringProp(node.props, "ref");
  const [components, setComponents] = useState(() => node.schema ?? []);
  const [hasLoaded, setHasLoaded] = useState(!isLazy);
  const [processing, setProcessing] = useState(isLazy && endpoint !== "");
  const { fallback, missingComponent, registry } = useRendererContext();

  const load = useCallback(async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
          ...withRefHeader(componentRef),
        },
      });
      const result = (await response.json()) as FragmentResponse;

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

  return (
    <div data-lattice-fragment={node.id}>
      {processing && components.length === 0 ? (
        <div className="h-16 animate-pulse rounded-lt-sm bg-lt-muted" />
      ) : (
        <Renderer
          fallback={fallback}
          missingComponent={missingComponent}
          nodes={components}
          registry={registry}
        />
      )}
    </div>
  );
};

export default FragmentComponent;
