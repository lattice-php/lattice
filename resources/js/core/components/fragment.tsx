import { useCallback, useEffect, useState } from "react";
import { getStringProp } from "@lattice/core/props";
import { Renderer, useRendererContext } from "@lattice/core/renderer";
import type { Node, RendererComponent } from "@lattice/core/types";

type FragmentResponse = {
  components?: Node[];
};

type ReloadComponentEvent = CustomEvent<{
  component?: string;
}>;

declare module "@lattice/core/types" {
  interface ComponentProps {
    fragment: {
      endpoint?: string;
      ref?: string;
      lazy?: boolean;
    };
  }
}

function endpointWithRef(endpoint: string, componentRef: string): string {
  if (!componentRef) {
    return endpoint;
  }

  const url = new URL(endpoint, window.location.origin);

  url.searchParams.set("_lattice", componentRef);

  return `${url.pathname}${url.search}`;
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
  const [components, setComponents] = useState(() => node.children ?? []);
  const [hasLoaded, setHasLoaded] = useState(!isLazy);
  const [processing, setProcessing] = useState(isLazy && endpoint !== "");
  const { fallback, missingComponent, registry } = useRendererContext();

  const load = useCallback(async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(endpointWithRef(endpoint, componentRef), {
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

    window.addEventListener("lattice:reload-component", reload);

    return () => window.removeEventListener("lattice:reload-component", reload);
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
