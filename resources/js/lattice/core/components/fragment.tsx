import { useCallback, useEffect, useState } from "react";
import { getStringProp } from "@/lattice/core/props";
import { LatticeRenderer, useLatticeRendererContext } from "@/lattice/core/renderer";
import type { LatticeNode, LatticeRendererComponent } from "@/lattice/core/types";

type FragmentResponse = {
  components?: LatticeNode[];
};

type ReloadComponentEvent = CustomEvent<{
  component?: string;
}>;

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    fragment: {
      endpoint?: string;
      lazy?: boolean;
    };
  }
}

function getComponents(value: unknown): LatticeNode[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (node): node is LatticeNode =>
      typeof node === "object" &&
      node !== null &&
      "type" in node &&
      typeof node.type === "string",
  );
}

const FragmentComponent: LatticeRendererComponent<"fragment"> = ({ node }) => {
  const endpoint = getStringProp(node.props, "endpoint");
  const isLazy = node.props?.lazy === true;
  const [components, setComponents] = useState(() => node.children ?? []);
  const [hasLoaded, setHasLoaded] = useState(!isLazy);
  const [processing, setProcessing] = useState(isLazy && endpoint !== "");
  const { fallback, missingComponent, registry } = useLatticeRendererContext();

  const load = useCallback(async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
        },
      });
      const result = (await response.json()) as FragmentResponse;

      setComponents(getComponents(result.components));
      setHasLoaded(true);
    } finally {
      setProcessing(false);
    }
  }, [endpoint]);

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

    window.addEventListener("lattice:reload-component", reload);

    return () => window.removeEventListener("lattice:reload-component", reload);
  }, [load, node.id]);

  return (
    <div data-lattice-fragment={node.id}>
      {processing && components.length === 0 ? (
        <div className="h-16 animate-pulse rounded-md bg-muted" />
      ) : (
        <LatticeRenderer
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
