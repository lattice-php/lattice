import { useFormValues, useSetFormValue } from "./values.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { walkFields } from "@lattice-php/form/lib/field-props";
import { useLayoutEffect } from "@lattice-php/ui/lib/use-layout-effect";
import { FORM_DEBOUNCE_MS, postFormAction } from "@lattice-php/form/lib/form-transport";
import { collectPrefillTargets, getPath, pathsToClear, pruneOverrides, seededOverrides } from "@lattice-php/form/lib/prefill-targets";
//#region resources/js/hooks/use-form-resolver.ts
function useFormResolver(action, componentRef, nodes) {
	const values = useFormValues();
	const setValue = useSetFormValue();
	const [resolved, setResolved] = useState({});
	const targets = useMemo(() => collectPrefillTargets(nodes, values), [nodes, values]);
	const overrides = useRef(/* @__PURE__ */ new Set());
	const seededOverrideKeys = useRef(/* @__PURE__ */ new Set());
	const previousValues = useRef(values);
	const previousTargets = useRef(targets);
	const targetsRef = useRef(targets);
	targetsRef.current = targets;
	useLayoutEffect(() => {
		const liveOverrideKeys = new Set(targets.map((target) => target.overrideKey));
		seededOverrideKeys.current = new Set([...seededOverrideKeys.current].filter((overrideKey) => liveOverrideKeys.has(overrideKey)));
		const freshTargets = targets.filter((target) => !seededOverrideKeys.current.has(target.overrideKey));
		for (const overrideKey of seededOverrides(freshTargets, values)) overrides.current.add(overrideKey);
		for (const target of freshTargets) seededOverrideKeys.current.add(target.overrideKey);
	}, [targets, values]);
	const markUserEdit = useCallback((overrideKey) => {
		overrides.current.add(overrideKey);
	}, []);
	const watch = useMemo(() => {
		const keys = /* @__PURE__ */ new Set();
		let any = false;
		walkFields(nodes, (props) => {
			if (Array.isArray(props.dependsOnKeys)) for (const key of props.dependsOnKeys) keys.add(String(key));
			if (props.dependsOnAny) any = true;
		});
		return {
			keys: [...keys],
			any
		};
	}, [nodes]);
	const watchPaths = useMemo(() => {
		const set = new Set(watch.keys);
		for (const target of targets) {
			for (const dep of target.resetOn) set.add(dep);
			for (const dep of target.refreshOn) set.add(dep);
		}
		return [...set];
	}, [watch.keys, targets]);
	const watchSignature = watch.any ? values : JSON.stringify(watchPaths.map((path) => getPath(values, path)));
	useEffect(() => {
		if (watchPaths.length === 0 && !watch.any) return;
		const previous = previousValues.current;
		previousValues.current = values;
		for (const overrideKey of pathsToClear({
			targets: previousTargets.current,
			values: previous
		}, {
			targets: targetsRef.current,
			values
		})) overrides.current.delete(overrideKey);
		previousTargets.current = targetsRef.current;
		overrides.current = pruneOverrides(overrides.current, targetsRef.current);
		const controller = new AbortController();
		const timer = window.setTimeout(() => {
			postFormAction(action, componentRef, {
				_sub: "resolve",
				...values
			}, controller.signal).then((response) => {
				if (!response) return;
				for (const [name, value] of Object.entries(response.values ?? {})) setValue(name, value);
				const targetsByPath = new Map(targetsRef.current.map((target) => [target.path, target]));
				for (const [path, value] of Object.entries(response.prefill ?? {})) {
					const target = targetsByPath.get(path);
					if (target && !overrides.current.has(target.overrideKey)) setValue(path, value);
				}
				if (response.fields) setResolved(response.fields);
			}).catch(() => {});
		}, FORM_DEBOUNCE_MS);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [
		watchSignature,
		action,
		componentRef,
		watch.any,
		setValue
	]);
	return {
		nodes: resolved,
		markUserEdit
	};
}
//#endregion
export { useFormResolver };

//# sourceMappingURL=use-form-resolver.js.map