import { useEffect, useMemo, useState } from "react";
import type { Node } from "@lattice/lattice/core/types";
import { fieldProps } from "./field-props";
import { FORM_DEBOUNCE_MS, postFormAction } from "./form-transport";
import { useFormValues, useSetFormValue } from "./values";

type ResolveResponse = {
  fields?: Record<string, Node>;
  values?: Record<string, unknown>;
};

function collectWatch(nodes: Node[] | undefined, keys: Set<string>, state: { any: boolean }): void {
  for (const child of nodes ?? []) {
    const props = fieldProps(child);
    if (Array.isArray(props.dependsOnKeys)) {
      for (const key of props.dependsOnKeys) {
        keys.add(String(key));
      }
    }
    if (props.dependsOnAny) {
      state.any = true;
    }
    collectWatch(child.schema, keys, state);
  }
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

    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      void postFormAction<ResolveResponse>(
        action,
        componentRef,
        { _resolve: true, ...values },
        controller.signal,
      )
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
    }, FORM_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched, action, componentRef, watch.keys.length, watch.any, setValue]);

  return resolved;
}
