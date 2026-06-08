import { useEffect, useMemo, useState } from "react";
import { getBooleanProp } from "@lattice/core/props";
import type { Node } from "@lattice/core/types";
import { useFormValues, useSetFormValue } from "./values";

type ResolveResponse = {
  fields?: Record<string, Node>;
  values?: Record<string, unknown>;
};

function collectWatch(nodes: Node[] | undefined, keys: Set<string>, state: { any: boolean }): void {
  for (const child of nodes ?? []) {
    const dependsOnKeys = child.props?.dependsOnKeys;
    if (Array.isArray(dependsOnKeys)) {
      for (const key of dependsOnKeys) {
        keys.add(String(key));
      }
    }
    if (getBooleanProp(child.props, "dependsOnAny")) {
      state.any = true;
    }
    collectWatch(child.children, keys, state);
  }
}

function xsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : "";
}

export function useFormResolver(
  action: string,
  componentRef: string,
  nodes: Node[] | undefined,
): Record<string, Node> {
  const values = useFormValues();
  const setValue = useSetFormValue();
  const [resolved, setResolved] = useState<Record<string, Node>>({});

  const watch = useMemo(() => {
    const keys = new Set<string>();
    const state = { any: false };
    collectWatch(nodes, keys, state);
    return { keys: [...keys], any: state.any };
  }, [nodes]);

  const watched = watch.any
    ? JSON.stringify(values)
    : JSON.stringify(watch.keys.map((key) => values[key]));

  useEffect(() => {
    if (watch.keys.length === 0 && !watch.any) {
      return;
    }

    const endpoint = componentRef
      ? `${action}?_lattice=${encodeURIComponent(componentRef)}`
      : action;
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      void fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": xsrfToken(),
        },
        body: JSON.stringify({ _resolve: true, ...values }),
      })
        .then((response) => (response.ok ? (response.json() as Promise<ResolveResponse>) : null))
        .then((response) => {
          if (!response) {
            return;
          }
          for (const [name, value] of Object.entries(response.values ?? {})) {
            setValue(name, value);
          }
          if (response.fields) {
            setResolved(response.fields);
          }
        })
        .catch(() => {});
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched, action, componentRef, watch.keys.length, watch.any, setValue]);

  return resolved;
}
