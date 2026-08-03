import { buildColumnGridTemplate, defaultColumnWidthPx, maxColumnWidthPx, minColumnWidthPx } from "./column-sizing.js";
import { useCallback, useMemo, useRef } from "react";
import { usePersistentState } from "@lattice-php/core/lib/use-persistent-state";
//#region resources/js/hooks/use-column-resizing.ts
var emptyTracks = [];
function useColumnResizing({ columnGapPx = 0, columns, enabled, leadingTracks = emptyTracks, showIndicator = false, storageKey, trailingTracks = emptyTracks }) {
	const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);
	const [overrides, setOverrides] = usePersistentState(storageKey ?? "", {}, {
		enabled: Boolean(storageKey),
		parse: (raw) => parseStoredOverrides(raw, columns),
		serialize: (value) => serializeOverrides(value, columnKeys)
	});
	const overridesRef = useRef(overrides);
	const drag = useRef(null);
	const resizeRootRef = useRef(null);
	const templateForOverrides = useCallback((nextOverrides) => buildColumnGridTemplate({
		columns,
		leadingTracks,
		trailingTracks,
		overrides: enabled ? nextOverrides : {}
	}), [
		columns,
		enabled,
		leadingTracks,
		trailingTracks
	]);
	const gridTemplateColumns = useMemo(() => templateForOverrides(overrides), [overrides, templateForOverrides]);
	const applyTemplate = useCallback((template) => {
		const root = resizeRootRef.current;
		if (!root) return;
		root.style.gridTemplateColumns = template;
		root.style.setProperty("--lattice-table-columns", template);
	}, []);
	const commitOverrides = useCallback((next) => {
		overridesRef.current = next;
		setOverrides(next);
		applyTemplate(templateForOverrides(next));
	}, [
		applyTemplate,
		setOverrides,
		templateForOverrides
	]);
	const overridesWithColumnWidth = useCallback((current, column, width, maxWidth) => ({
		...current,
		[column.key]: Math.min(maxWidth ?? 1024, Math.max(minColumnWidthPx(column), width))
	}), []);
	const setColumnWidth = useCallback((column, width, maxWidth) => {
		commitOverrides(overridesWithColumnWidth(overridesRef.current, column, width, maxWidth));
	}, [commitOverrides, overridesWithColumnWidth]);
	const resetColumnWidth = useCallback((column) => {
		const next = { ...overridesRef.current };
		delete next[column.key];
		commitOverrides(next);
	}, [commitOverrides]);
	const resetColumns = useCallback(() => {
		commitOverrides({});
	}, [commitOverrides]);
	const hasOverrides = enabled && Object.values(overrides).some((width) => typeof width === "number");
	const currentColumnWidth = useCallback((column) => overridesRef.current[column.key] ?? defaultColumnWidthPx(column), []);
	return {
		getResizeHandleProps: useCallback((column) => {
			const max = maxColumnWidthPx;
			const min = minColumnWidthPx(column);
			const current = currentColumnWidth(column);
			const label = column.label ?? column.key;
			const indicatorClass = showIndicator ? "after:bg-lt-border" : "after:bg-transparent";
			const maxWidthForHandle = (handle) => maxColumnWidthForGrid({
				column,
				columnGapPx,
				columns,
				grid: resizeRootRef.current ?? handle.parentElement?.parentElement,
				leadingTracks,
				trailingTracks
			});
			const resizeBy = (handle, delta) => setColumnWidth(column, current + delta, maxWidthForHandle(handle));
			const finishDrag = (event, releaseCapture) => {
				const active = drag.current;
				if (active?.key !== column.key) return;
				drag.current = null;
				if (active.overrides !== null) commitOverrides(active.overrides);
				if (releaseCapture) event.currentTarget.releasePointerCapture?.(event.pointerId);
			};
			return {
				"aria-label": `Resize ${label}`,
				"aria-orientation": "vertical",
				"aria-valuemax": max,
				"aria-valuemin": min,
				"aria-valuenow": current,
				className: `absolute inset-y-0 right-0 hidden w-2 cursor-col-resize touch-none items-stretch justify-center md:flex after:my-1 after:w-px ${indicatorClass} hover:after:bg-lt-border focus-visible:outline-none focus-visible:after:bg-lt-ring`,
				onDoubleClick: () => resetColumnWidth(column),
				onKeyDown: (event) => {
					if (!enabled) return;
					const step = event.shiftKey ? 32 : 8;
					if (event.key === "ArrowLeft") {
						event.preventDefault();
						resizeBy(event.currentTarget, -step);
					}
					if (event.key === "ArrowRight") {
						event.preventDefault();
						resizeBy(event.currentTarget, step);
					}
					if (event.key === "Home") {
						event.preventDefault();
						setColumnWidth(column, min);
					}
					if (event.key === "End") {
						event.preventDefault();
						const handleMax = maxWidthForHandle(event.currentTarget);
						setColumnWidth(column, handleMax, handleMax);
					}
					if (event.key === "Enter" || event.key === "Escape") {
						event.preventDefault();
						resetColumnWidth(column);
					}
				},
				onPointerDown: (event) => {
					if (!enabled) return;
					const parentWidth = event.currentTarget.parentElement?.getBoundingClientRect().width ?? 0;
					drag.current = {
						key: column.key,
						maxWidth: maxWidthForHandle(event.currentTarget),
						overrides: null,
						startWidth: parentWidth > 0 ? parentWidth : current,
						startX: event.clientX
					};
					event.currentTarget.setPointerCapture?.(event.pointerId);
					event.preventDefault();
				},
				onPointerMove: (event) => {
					const active = drag.current;
					if (!enabled || active?.key !== column.key) return;
					const next = overridesWithColumnWidth(overridesRef.current, column, active.startWidth + event.clientX - active.startX, active.maxWidth);
					active.overrides = next;
					overridesRef.current = next;
					applyTemplate(templateForOverrides(next));
				},
				onPointerUp: (event) => {
					finishDrag(event, true);
				},
				onPointerCancel: (event) => {
					finishDrag(event, true);
				},
				onLostPointerCapture: (event) => {
					finishDrag(event, false);
				},
				role: "separator",
				tabIndex: 0
			};
		}, [
			columnGapPx,
			columns,
			currentColumnWidth,
			enabled,
			leadingTracks,
			applyTemplate,
			commitOverrides,
			overridesWithColumnWidth,
			resetColumnWidth,
			setColumnWidth,
			showIndicator,
			templateForOverrides,
			trailingTracks
		]),
		gridTemplateColumns,
		hasOverrides,
		resizeRootRef,
		resetColumns,
		resetColumnWidth
	};
}
function maxColumnWidthForGrid({ column, columnGapPx, columns, grid, leadingTracks, trailingTracks }) {
	const gridWidth = grid?.getBoundingClientRect().width ?? 0;
	if (gridWidth <= 0) return maxColumnWidthPx;
	const utilityWidth = [...leadingTracks, ...trailingTracks].reduce((sum, track) => sum + fixedTrackWidthPx(track), 0);
	const siblingMinWidth = columns.reduce((sum, sibling) => sibling.key === column.key ? sum : sum + minColumnWidthPx(sibling), 0);
	const trackCount = columns.length + leadingTracks.length + trailingTracks.length;
	const gapWidth = Math.max(0, trackCount - 1) * columnGapPx;
	const available = gridWidth - utilityWidth - siblingMinWidth - gapWidth;
	return Math.min(maxColumnWidthPx, Math.max(minColumnWidthPx(column), available));
}
function parseStoredOverrides(raw, columns) {
	const overrides = JSON.parse(raw)?.overrides;
	if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) throw new Error("unexpected stored column widths shape");
	const sanitized = sanitizeOverrides(overrides, columns);
	if (Object.keys(sanitized).length === 0) throw new Error("stored column widths hold no usable overrides");
	return sanitized;
}
function serializeOverrides(overrides, columnKeys) {
	const stored = {};
	const knownKeys = new Set(columnKeys);
	for (const [key, value] of Object.entries(overrides)) if (knownKeys.has(key) && typeof value === "number" && Number.isFinite(value)) stored[key] = value;
	if (Object.keys(stored).length === 0) return null;
	return JSON.stringify({ overrides: stored });
}
function sanitizeOverrides(overrides, columns) {
	const next = {};
	for (const column of columns) {
		const value = overrides[column.key];
		if (typeof value !== "number" || !Number.isFinite(value)) continue;
		next[column.key] = Math.min(maxColumnWidthPx, Math.max(minColumnWidthPx(column), value));
	}
	return next;
}
function fixedTrackWidthPx(track) {
	const value = track.trim();
	const px = value.match(/^([0-9.]+)px$/);
	if (px) return Number.parseFloat(px[1]);
	const rem = value.match(/^([0-9.]+)rem$/);
	if (rem) return Number.parseFloat(rem[1]) * rootFontSizePx();
	return 0;
}
function rootFontSizePx() {
	if (typeof window === "undefined") return 16;
	const parsed = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}
//#endregion
export { useColumnResizing };

//# sourceMappingURL=use-column-resizing.js.map