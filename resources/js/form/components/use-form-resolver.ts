import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Node } from "@lattice/lattice/core/types";
import { walkFields } from "./field-props";
import { FORM_DEBOUNCE_MS, postFormAction } from "./form-transport";
import {
  applyPrefillValue,
  collectPrefillTargets,
  getPath,
  pathsToClear,
  pruneOverrides,
  seededOverrides,
  targetByPath,
} from "./prefill-targets";
import type { PrefillController } from "./prefill-context";
import { useFormValues, useSetFormValue } from "./values";

type ResolveResponse = {
  fields?: Record<string, Node>;
  values?: Record<string, unknown>;
  prefill?: Record<string, unknown>;
};

export type FormResolver = {
  nodes: Record<string, Node>;
  markUserEdit: PrefillController["markUserEdit"];
};

export function useFormResolver(
  action: string,
  componentRef: string,
  nodes: Node[] | undefined,
): FormResolver {
  const values = useFormValues();
  const setValue = useSetFormValue();
  const [resolved, setResolved] = useState<Record<string, Node>>({});

  const targets = useMemo(() => collectPrefillTargets(nodes, values), [nodes, values]);

  const overrides = useRef<Set<string>>(new Set());
  const seededOverrideKeys = useRef<Set<string>>(new Set());
  const previousValues = useRef<Record<string, unknown>>(values);
  const previousTargets = useRef(targets);

  // Read targets via a ref inside the effect: `targets` changes identity on every
  // value change, but the effect must fire only when `watchSignature` changes
  // (which already reflects added/removed target paths). Keeping `targets` out of
  // the dep array preserves the targeted watch in non-"any" mode.
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  useLayoutEffect(() => {
    const freshTargets = targets.filter(
      (target) => !seededOverrideKeys.current.has(target.overrideKey),
    );

    for (const overrideKey of seededOverrides(freshTargets, values)) {
      overrides.current.add(overrideKey);
    }

    for (const target of freshTargets) {
      seededOverrideKeys.current.add(target.overrideKey);
    }
  }, [targets, values]);

  const markUserEdit = useCallback((path: string) => {
    overrides.current.add(path);
  }, []);

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

  const watchPaths = useMemo(() => {
    const set = new Set<string>(watch.keys);
    for (const target of targets) {
      for (const dep of target.resetOn) {
        set.add(dep);
      }
      for (const dep of target.refreshOn) {
        set.add(dep);
      }
    }
    return [...set];
  }, [watch.keys, targets]);

  // In "any" mode the values store keeps a stable reference until something
  // actually changes, so its identity is the change signal. Otherwise hash the
  // watched paths (form-level and per-row).
  const watchSignature = watch.any
    ? values
    : JSON.stringify(watchPaths.map((path) => getPath(values, path)));

  useEffect(() => {
    if (watchPaths.length === 0 && !watch.any) {
      return;
    }

    const previous = previousValues.current;
    previousValues.current = values;

    // `resetOn` deps unlock a path (a fresh product gives a fresh price); `refreshOn`
    // deps only re-ask the server and never clear an override (a customer change
    // re-prices untouched rows but leaves user-edited ones alone).
    for (const overrideKey of pathsToClear(
      previousTargets.current,
      previous,
      targetsRef.current,
      values,
    )) {
      overrides.current.delete(overrideKey);
    }
    previousTargets.current = targetsRef.current;

    overrides.current = pruneOverrides(overrides.current, targetsRef.current);

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
          const targetsByPath = targetByPath(targetsRef.current);
          for (const [path, value] of Object.entries(response.prefill ?? {})) {
            const target = targetsByPath.get(path);

            if (target && !overrides.current.has(target.overrideKey)) {
              applyPrefillValue(setValue, path, value);
            }
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
  }, [watchSignature, action, componentRef, watch.any, setValue]);

  return { nodes: resolved, markUserEdit };
}
