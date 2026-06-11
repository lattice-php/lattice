import { useEffect, useMemo, useState } from "react";
import type { Node } from "@lattice/lattice/core/types";
import { walkFields } from "./field-props";
import { FORM_DEBOUNCE_MS, postFormAction } from "./form-transport";
import { useFormValues, useSetFormValue } from "./values";

type ResolveResponse = {
  fields?: Record<string, Node>;
  values?: Record<string, unknown>;
};

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
    let any = false;
    walkFields(nodes, (props) => {
      if (Array.isArray(props.dependsOnKeys)) {
        for (const key of props.dependsOnKeys) {
          keys.add(String(key));
        }
      }
      if (props.dependsOnAny) {
        any = true;
      }
    });
    return { keys: [...keys], any };
  }, [nodes]);

  // In "any" mode the resolve fires on any value change, and the values store
  // keeps a stable reference until something actually changes (Object.is short-
  // circuit in setValue), so the object identity is the change signal — no need
  // to serialize every value each keystroke. Otherwise hash only the watched keys.
  const watchSignature = watch.any ? values : JSON.stringify(watch.keys.map((key) => values[key]));

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
  }, [watchSignature, action, componentRef, watch.keys.length, watch.any, setValue]);

  return resolved;
}
