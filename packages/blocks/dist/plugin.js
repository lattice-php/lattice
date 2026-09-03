import * as e from "react";
import t, { Suspense as n, createContext as r, forwardRef as i, lazy as a, useCallback as o, useContext as s, useDebugValue as c, useEffect as l, useId as u, useLayoutEffect as d, useMemo as f, useRef as p, useState as m, useSyncExternalStore as h } from "react";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
import y from "react-dom";
//#region \0rolldown/runtime.js
var b = Object.defineProperty, x = Object.getOwnPropertyDescriptor, ee = Object.getOwnPropertyNames, te = Object.prototype.hasOwnProperty, S = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, ne = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), re = (e, t) => {
	let n = {};
	for (var r in e) b(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || b(n, Symbol.toStringTag, { value: "Module" }), n;
}, C = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = ee(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !te.call(e, s) && s !== n && b(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = x(t, s)) || r.enumerable
	});
	return e;
}, ie = (e, t, n) => (C(e, t, "default"), n && C(n, t, "default")), w = /* @__PURE__ */ re({});
import * as ae from "@lattice-php/lattice/runtime";
ie(w, ae);
var T = S((() => {}));
//#endregion
//#region resources/js/endpoint.ts
async function oe(e, t, n, r = !1) {
	return (0, w.apiFetch)(e.url, {
		body: JSON.stringify(n),
		headers: { "Content-Type": "application/json" },
		keepalive: r,
		method: t,
		ref: e.ref,
		throwOnError: !1
	});
}
async function se(e, t) {
	let n = await oe(e, "POST", {
		_op: "render",
		block: t
	});
	if (!n.ok) return null;
	let r = await n.json();
	return {
		errors: de(r.errors),
		node: r.node
	};
}
async function ce(e, t, n, r = !1) {
	return ue(await oe(e, "PATCH", {
		document: t,
		revision: n
	}, r));
}
async function le(e, t, n) {
	return ue(await oe(e, "POST", {
		_op: "publish",
		document: t,
		revision: n
	}));
}
async function ue(e) {
	if (e.status === 409) return {
		revision: (await e.json()).revision,
		status: "conflict"
	};
	if (e.status === 422) return {
		errors: fe((await e.json()).errors),
		status: "invalid"
	};
	if (!e.ok) return {
		httpStatus: e.status,
		status: "failed"
	};
	let t = await e.json();
	return {
		errors: fe(t.errors),
		revision: t.revision,
		status: "saved"
	};
}
function de(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function fe(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
var pe = S((() => {
	T();
}));
//#endregion
//#region resources/js/document/history.ts
function me(e) {
	return {
		future: [],
		lastAt: 0,
		lastKey: null,
		past: [],
		present: e
	};
}
function he(e, t, n = {}) {
	let { coalesceKey: r = null, now: i = Date.now(), limit: a = 100 } = n;
	return t === e.present ? e : r !== null && r === e.lastKey && i - e.lastAt <= 800 ? {
		...e,
		lastAt: i,
		present: t
	} : {
		future: [],
		lastAt: i,
		lastKey: r,
		past: [...e.past, e.present].slice(-a),
		present: t
	};
}
function ge(e) {
	let t = e.past[e.past.length - 1];
	return t === void 0 ? e : {
		future: [e.present, ...e.future],
		lastAt: 0,
		lastKey: null,
		past: e.past.slice(0, -1),
		present: t
	};
}
function _e(e) {
	let [t, ...n] = e.future;
	return t === void 0 ? e : {
		future: n,
		lastAt: 0,
		lastKey: null,
		past: [...e.past, e.present],
		present: t
	};
}
var ve = S((() => {}));
//#endregion
//#region resources/js/document/bindings.ts
function ye(e) {
	let t = e.props.name;
	return typeof t == "string" ? t : null;
}
function be(e, t) {
	for (let n of e) {
		if (n.type.startsWith("field.") && ye(n) === t) return n;
		let e = n.schema ? be(n.schema, t) : null;
		if (e) return e;
	}
	return null;
}
function xe(e, t) {
	let n = be(e, t);
	if (!n) return null;
	let r = n.props.placeholder;
	return {
		kind: ke.has(n.type) ? "text" : n.type === "field.rich-editor" ? "rich" : n.type === "field.media-picker" ? "media" : "field",
		multiline: n.type === "field.textarea",
		name: t,
		node: n,
		placeholder: typeof r == "string" ? r : null
	};
}
function Se(e) {
	let t = e.props.binding;
	return typeof t == "string" ? t : null;
}
function Ce(e) {
	let t = [], n = (e) => {
		let r = Se(e);
		r !== null && !t.includes(r) && t.push(r), e.type !== "blocks.slot" && e.schema?.forEach(n);
	};
	return n(e), t;
}
function we(e, t) {
	let n = [];
	for (let r of e) {
		if (r.type.startsWith("field.")) {
			let e = ye(r);
			(e === null || !t.includes(e)) && n.push(r);
			continue;
		}
		if (!r.schema) {
			n.push(r);
			continue;
		}
		let e = we(r.schema, t);
		(e.length > 0 || r.schema.length === 0) && n.push(e === r.schema ? r : {
			...r,
			schema: e
		});
	}
	return n;
}
function Te(e, t, n) {
	if (e.type === "blocks.slot") return e;
	let r = e;
	if (Se(e) === t && (r = {
		...e,
		props: n(e.props, e)
	}), !e.schema) return r;
	let i = !1, a = e.schema.map((e) => {
		let r = Te(e, t, n);
		return i ||= r !== e, r;
	});
	return i ? {
		...r,
		schema: a
	} : r;
}
function Ee(e) {
	switch (e) {
		case "heading":
		case "text": return "text";
		case "button": return "label";
		default: return null;
	}
}
function De(e, t, n) {
	return Te(e, t, (e, t) => {
		let r = Ee(t.type);
		return r === null ? e : {
			...e,
			[r]: n
		};
	});
}
function Oe(e, t, n) {
	return Te(e, t, (e) => ({
		...e,
		document: n
	}));
}
var ke, Ae = S((() => {
	ke = /* @__PURE__ */ new Set(["field.text-input", "field.textarea"]);
}));
//#endregion
//#region resources/js/document/tree.ts
function je() {
	return {
		align: null,
		anchor: null,
		background: null,
		hideOnDesktop: !1,
		hideOnMobile: !1,
		marginBottom: null,
		marginTop: null,
		paddingBottom: null,
		paddingTop: null,
		width: null
	};
}
function Me() {
	return `b_${(typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "") : Math.random().toString(36).slice(2).padEnd(12, "0")).slice(0, 8)}`;
}
function Ne(e, t = Me()) {
	return {
		data: { ...e.defaults },
		id: t,
		slots: {},
		style: je(),
		type: e.type
	};
}
function Pe(e) {
	let t = [], n = (e, r, i, a) => {
		e.forEach((e, o) => {
			t.push({
				depth: a,
				index: o,
				node: e,
				parentId: r,
				slot: i
			});
			for (let [t, r] of Object.entries(e.slots)) n(r, e.id, t, a + 1);
		});
	};
	return n(e.blocks, null, null, 0), t;
}
function E(e, t) {
	return Pe(e).find((e) => e.node.id === t) ?? null;
}
function Fe(e, t, n) {
	if (t === null) return e.blocks;
	let r = E(e, t);
	return r && n !== null ? r.node.slots[n] ?? [] : [];
}
function Ie(e, t, n) {
	let r = E(e, t);
	return r ? Pe({
		blocks: [r.node],
		version: e.version
	}).some((e) => e.node.id === n && e.node.id !== t) : !1;
}
function Le(e, t, n) {
	let r = !1, i = e.map((e) => {
		if (e.id === t) {
			let t = n(e);
			return r ||= t !== e, t;
		}
		let i = !1, a = {};
		for (let [r, o] of Object.entries(e.slots)) {
			let e = Le(o, t, n);
			a[r] = e, i ||= e !== o;
		}
		return i ? (r = !0, {
			...e,
			slots: a
		}) : e;
	});
	return r ? i : e;
}
function Re(e, t, n) {
	let r = Le(e.blocks, t, n);
	return r === e.blocks ? e : {
		...e,
		blocks: r
	};
}
function ze(e, t, n) {
	if (t.parentId === null) return {
		...e,
		blocks: n(e.blocks)
	};
	let r = t.slot;
	return r === null ? e : Re(e, t.parentId, (e) => ({
		...e,
		slots: {
			...e.slots,
			[r]: n(e.slots[r] ?? [])
		}
	}));
}
function Be(e, t, n) {
	return ze(e, n, (e) => {
		let r = Math.max(0, Math.min(n.index, e.length));
		return [
			...e.slice(0, r),
			t,
			...e.slice(r)
		];
	});
}
function Ve(e, t) {
	let n = E(e, t);
	return n ? ze(e, n, (e) => e.filter((e) => e.id !== t)) : e;
}
function He(e, t, n) {
	let r = E(e, t);
	if (!r || n.parentId !== null && (n.parentId === t || Ie(e, t, n.parentId))) return e;
	let i = r.parentId === n.parentId && r.slot === n.slot && n.index > r.index ? n.index - 1 : n.index;
	return Be(Ve(e, t), r.node, {
		...n,
		index: i
	});
}
function Ue(e) {
	let t = {};
	for (let [n, r] of Object.entries(e.slots)) t[n] = r.map(Ue);
	return {
		...e,
		id: Me(),
		slots: t,
		style: {
			...e.style,
			anchor: null
		}
	};
}
function We(e, t) {
	let n = E(e, t);
	if (!n) return {
		document: e,
		id: null
	};
	let r = Ue(n.node);
	return {
		document: Be(e, r, {
			index: n.index + 1,
			parentId: n.parentId,
			slot: n.slot
		}),
		id: r.id
	};
}
function Ge(e, t, n) {
	return n.length === 0 ? e : Re(e, t, (e) => {
		let t = Object.entries(e.slots).filter(([e, t]) => !n.includes(e) && t.length > 0);
		if (t.length === 0) return e;
		let r = n[n.length - 1], i = {};
		for (let t of n) i[t] = [...e.slots[t] ?? []];
		for (let [, e] of t) i[r].push(...e);
		return {
			...e,
			slots: i
		};
	});
}
function Ke(e) {
	return Pe(e).map((e) => e.node.id);
}
function qe(e, t) {
	let n = Pe(e), r = [], i = n.find((e) => e.node.id === t) ?? null;
	for (; i;) {
		r.unshift(i);
		let e = i.parentId;
		i = e === null ? null : n.find((t) => t.node.id === e) ?? null;
	}
	return r;
}
function Je(e, t) {
	let n = new Map(Pe(e).map((e) => [e.node.id, e.node.data]));
	return Pe(t).filter((e) => {
		let t = n.get(e.node.id);
		return t === void 0 || JSON.stringify(t) !== JSON.stringify(e.node.data);
	}).map((e) => e.node.id);
}
var Ye = S((() => {}));
//#endregion
//#region resources/js/document/rules.ts
function Xe(e, t) {
	return e.find((e) => e.type === t) ?? null;
}
function Ze(e, t, n) {
	return Xe(e, t)?.slots.find((e) => e.name === n) ?? null;
}
function Qe({ document: e, types: t, blockType: n, parentId: r, slot: i, movingId: a = null }) {
	if (r === null) return !0;
	let o = E(e, r);
	if (!o || i === null) return !1;
	let s = Ze(t, o.node.type, i);
	return !s || s.allows !== null && !s.allows.includes(n) ? !1 : s.max === null || Fe(e, r, i).filter((e) => e.id !== a).length < s.max;
}
function $e(e, t, n, r) {
	return t.filter((i) => Qe({
		blockType: i.type,
		document: e,
		parentId: n,
		slot: r,
		types: t
	}));
}
var et = S((() => {
	Ye();
}));
//#endregion
//#region resources/js/document/store.ts
function tt(e) {
	let t = {
		canvasWidth: "desktop",
		document: e.document,
		errors: {},
		history: me(e.document),
		patterns: e.patterns ?? [],
		publishedAt: null,
		publishing: !1,
		rendered: e.rendered,
		revision: e.revision,
		saveState: "idle",
		selectedId: null,
		staleIds: [],
		travelCount: 0,
		types: e.types
	}, n = /* @__PURE__ */ new Set();
	return {
		getState: () => t,
		setState: (e) => {
			let r = e(t);
			r !== t && (t = r, n.forEach((e) => e()));
		},
		subscribe: (e) => (n.add(e), () => {
			n.delete(e);
		})
	};
}
function nt(e, t, n = null, r = []) {
	return t === e.document ? e : {
		...e,
		document: t,
		history: he(e.history, t, { coalesceKey: n }),
		saveState: e.saveState === "conflict" ? "conflict" : "dirty",
		staleIds: r.length === 0 ? e.staleIds : [...e.staleIds, ...r]
	};
}
function rt(e, t) {
	return e.selectedId === t ? e : {
		...e,
		selectedId: t
	};
}
function it(e, t) {
	return e.canvasWidth === t ? e : {
		...e,
		canvasWidth: t
	};
}
function at(e, t) {
	let n = e.selectedId ? E(e.document, e.selectedId) : null, r = {
		index: e.document.blocks.length,
		parentId: null,
		slot: null
	};
	if (!n) return r;
	let i = {
		index: n.index + 1,
		parentId: n.parentId,
		slot: n.slot
	};
	return t.every((t) => Qe({
		blockType: t,
		document: e.document,
		parentId: i.parentId,
		slot: i.slot,
		types: e.types
	})) ? i : r;
}
function ot(e, t, n) {
	let r = e.patterns.find((e) => e.key === t);
	if (!r || r.blocks.length === 0) return {
		ids: [],
		state: e
	};
	let i = r.blocks.map(Ue), a = e.document;
	for (let [t, r] of i.entries()) {
		if (!Qe({
			blockType: r.type,
			document: a,
			parentId: n.parentId,
			slot: n.slot,
			types: e.types
		})) return {
			ids: [],
			state: e
		};
		a = Be(a, r, {
			...n,
			index: n.index + t
		});
	}
	let o = i.flatMap(pt);
	return {
		ids: o,
		state: {
			...nt(e, a, null, o),
			selectedId: i[0]?.id ?? null
		}
	};
}
function st(e, t) {
	let n = Xe(t, Mt);
	return e.blocks.length > 0 || !n ? e : {
		...e,
		blocks: [Ne(n)]
	};
}
function ct(e, t, n, r = {}) {
	let i = Xe(e.types, t);
	if (!i || !Qe({
		blockType: t,
		document: e.document,
		parentId: n.parentId,
		slot: n.slot,
		types: e.types
	})) return {
		id: null,
		state: e
	};
	let a = Ne(i), o = {
		...a,
		data: {
			...a.data,
			...r
		}
	}, s = Be(e.document, o, n);
	return {
		id: o.id,
		state: {
			...nt(e, s, null, [o.id]),
			selectedId: o.id
		}
	};
}
function lt(e, t, n) {
	let r = E(e.document, t);
	if (!r) return {
		id: null,
		state: e
	};
	let i = Ve(e.document, t), a = Xe(e.types, n);
	if (!a || !Qe({
		blockType: n,
		document: i,
		parentId: r.parentId,
		slot: r.slot,
		types: e.types
	})) return {
		id: null,
		state: e
	};
	let o = Ne(a), s = Be(i, o, {
		index: r.index,
		parentId: r.parentId,
		slot: r.slot
	});
	return {
		id: o.id,
		state: {
			...nt(e, s, null, [o.id]),
			selectedId: o.id
		}
	};
}
function ut(e, t) {
	let n = nt(e, Ve(e.document, t));
	return n.selectedId === t ? {
		...n,
		selectedId: null
	} : n;
}
function dt(e, t, n) {
	let r = E(e.document, t);
	return r && Qe({
		blockType: r.node.type,
		document: e.document,
		movingId: t,
		parentId: n.parentId,
		slot: n.slot,
		types: e.types
	}) ? nt(e, He(e.document, t, n)) : e;
}
function ft(e, t) {
	let n = We(e.document, t);
	if (n.id === null) return e;
	let r = E(n.document, n.id), i = { ...e.rendered }, a = e.rendered[t];
	r && a && (i[n.id] = mt(a, n.id));
	let o = r ? pt(r.node).filter((e) => e !== n.id) : [];
	return {
		...nt(e, n.document, null, o),
		rendered: i,
		selectedId: n.id
	};
}
function pt(e) {
	return [e.id, ...Object.values(e.slots).flat().flatMap(pt)];
}
function mt(e, t) {
	return {
		...e,
		props: {
			...e.props,
			blockId: t
		}
	};
}
function ht(e, t, n, r) {
	return nt(e, Re(e.document, t, (e) => ({
		...e,
		data: {
			...e.data,
			[n]: r
		}
	})), `data:${t}:${n}`);
}
function gt(e, t, n, r) {
	let i = ht(e, t, n, r), a = i.rendered[t];
	return a ? {
		...i,
		rendered: {
			...i.rendered,
			[t]: De(a, n, r)
		}
	} : i;
}
function _t(e, t, n, r) {
	let i = ht(e, t, n, r), a = i.rendered[t];
	return a ? {
		...i,
		rendered: {
			...i.rendered,
			[t]: Oe(a, n, r)
		}
	} : i;
}
function vt(e, t, n) {
	return nt(e, Re(e.document, t, (e) => ({
		...e,
		style: {
			...e.style,
			...n
		}
	})), `style:${t}:${Object.keys(n).join(",")}`);
}
function yt(e, t, n, r) {
	let i = bt(n), a = Ge(e.document, t, i), o = { ...e.errors };
	r && Object.keys(r).length > 0 ? o[t] = r : delete o[t];
	let s = {
		...e,
		errors: o,
		rendered: {
			...e.rendered,
			[t]: n
		},
		staleIds: e.staleIds.filter((e) => e !== t)
	};
	return a === e.document ? s : nt(s, a, `slots:${t}`);
}
function bt(e) {
	let t = [], n = (e) => {
		if (e.type === "blocks.slot") {
			let n = e.props?.name;
			typeof n == "string" && t.push(n);
			return;
		}
		e.schema?.forEach(n);
	};
	return e.schema?.forEach(n), t;
}
function xt(e) {
	return Ct(e, ge(e.history));
}
function St(e) {
	return Ct(e, _e(e.history));
}
function Ct(e, t) {
	if (t === e.history) return e;
	let n = Je(e.document, t.present), r = e.selectedId !== null && E(t.present, e.selectedId) !== null;
	return {
		...e,
		document: t.present,
		history: t,
		saveState: e.saveState === "conflict" ? "conflict" : "dirty",
		selectedId: r ? e.selectedId : null,
		staleIds: [...e.staleIds, ...n],
		travelCount: e.travelCount + 1
	};
}
function wt(e) {
	return {
		...e,
		saveState: "saving"
	};
}
function Tt(e, t, n, r) {
	return {
		...e,
		errors: n,
		revision: t,
		saveState: e.document === r ? "saved" : "dirty"
	};
}
function Et(e, t) {
	return {
		...e,
		revision: t,
		saveState: "conflict"
	};
}
function Dt(e) {
	return e.saveState === "conflict" ? {
		...e,
		saveState: "dirty"
	} : e;
}
function Ot(e) {
	return {
		...e,
		saveState: "error"
	};
}
function kt(e, t) {
	return {
		...e,
		publishing: t
	};
}
function At(e, t) {
	return {
		...e,
		publishedAt: Date.now(),
		publishing: !1,
		revision: t,
		saveState: "saved"
	};
}
function jt(e, t) {
	return {
		...e,
		errors: t
	};
}
var Mt, D = S((() => {
	ve(), Ae(), et(), Ye(), Mt = "lattice.paragraph";
}));
//#endregion
//#region resources/js/autosave.ts
function Nt(e, t, n = Pt) {
	let r = p(null), i = p(!1), a = o(async (n = !1) => {
		let r = e.getState();
		if (!t || r.saveState !== "dirty" || i.current) return;
		i.current = !0, e.setState(wt);
		let a = r.document;
		try {
			let i = await ce(t, a, r.revision, n);
			e.setState((e) => {
				switch (i.status) {
					case "saved": return Tt(e, i.revision, i.errors, a);
					case "conflict": return Et(e, i.revision);
					case "invalid": return Ot({
						...e,
						errors: i.errors
					});
					case "failed": return Ot(e);
				}
			});
		} catch {
			e.setState(Ot);
		} finally {
			i.current = !1;
		}
	}, [t, e]);
	return l(() => {
		if (!t) return;
		let i = () => {
			r.current !== null && clearTimeout(r.current), r.current = setTimeout(() => {
				r.current = null, a();
			}, n);
		}, o = e.subscribe(() => {
			e.getState().saveState === "dirty" && i();
		}), s = () => {
			document.visibilityState === "hidden" && a(!0);
		};
		return document.addEventListener("visibilitychange", s), window.addEventListener("pagehide", s), () => {
			o(), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", s), r.current !== null && clearTimeout(r.current);
		};
	}, [
		n,
		t,
		a,
		e
	]), { saveNow: o(() => a(), [a]) };
}
var Pt, Ft = S((() => {
	pe(), D(), Pt = 5e3;
}));
//#endregion
//#region resources/js/components/editor/editor-context.tsx
function It({ value: e, children: t }) {
	return /* @__PURE__ */ _(zt.Provider, {
		value: e,
		children: t
	});
}
function O() {
	let e = s(zt);
	if (!e) throw Error("Block editor components must render inside <EditorProvider>.");
	return e;
}
function k(e) {
	let { store: t } = O(), n = p(e);
	n.current = e;
	let r = o(() => n.current(t.getState()), [t]);
	return h(t.subscribe, r, r);
}
function Lt(e) {
	let { types: t } = O();
	return f(() => t.find((t) => t.type === e) ?? null, [e, t]);
}
function Rt() {
	let e = p(/* @__PURE__ */ new Map()), t = o((t, n) => {
		n ? e.current.set(t, n) : e.current.delete(t);
	}, []);
	return {
		focusBlock: o((t) => {
			e.current.get(t)?.focus({ preventScroll: !1 });
		}, []),
		registerBlock: t
	};
}
var zt, A = S((() => {
	zt = r(null);
}));
//#endregion
//#region resources/js/components/inspector/field-row.tsx
function Bt({ label: e, children: t, htmlFor: n }) {
	return /* @__PURE__ */ v("div", {
		className: "grid grid-cols-[6.5rem_1fr] items-center gap-2 text-xs text-lt-fg-2",
		children: [/* @__PURE__ */ _("label", {
			htmlFor: n,
			className: "text-lt-muted-fg",
			children: e
		}), /* @__PURE__ */ _("div", {
			className: "min-w-0",
			children: t
		})]
	});
}
function Vt({ title: e, children: t }) {
	return /* @__PURE__ */ v("section", {
		className: "grid gap-2.5 border-b border-lt-border px-3 py-3",
		children: [/* @__PURE__ */ _("h3", {
			className: "text-xs font-semibold text-lt-fg",
			children: e
		}), t]
	});
}
var Ht = S((() => {}));
//#endregion
//#region resources/js/components/inspector/advanced-panel.tsx
function Ut({ id: e, style: t, supports: n }) {
	let { t: r } = (0, w.useT)("blocks"), { store: i } = O(), a = u();
	return /* @__PURE__ */ v("div", {
		"data-test": "blocks-advanced-panel",
		children: [n.anchor && /* @__PURE__ */ v(Vt, {
			title: r("blocks.editor.inspector.anchor", "HTML anchor"),
			children: [/* @__PURE__ */ _(Bt, {
				label: "#",
				htmlFor: a,
				children: /* @__PURE__ */ _(w.Input, {
					id: a,
					density: "compact",
					value: t.anchor ?? "",
					"data-test": "blocks-style-anchor",
					onChange: (t) => i.setState((n) => vt(n, e, { anchor: t.target.value.trim() === "" ? null : t.target.value.trim() }))
				})
			}), /* @__PURE__ */ _("p", {
				className: "text-xs text-lt-muted-fg",
				children: r("blocks.editor.inspector.anchor-help", "Lets you link directly to this block.")
			})]
		}), /* @__PURE__ */ _(Vt, {
			title: "ID",
			children: /* @__PURE__ */ _("code", {
				className: "text-xs text-lt-muted-fg",
				children: e
			})
		})]
	});
}
var Wt = S((() => {
	T(), D(), A(), Ht();
}));
//#endregion
//#region resources/js/components/inspector/field-embed.tsx
function Gt({ id: e, schema: t, initial: n, errors: r, onChange: i }) {
	let a = f(() => {
		let e = {};
		for (let [t, n] of Object.entries(r ?? {})) e[t] = n[0];
		return e;
	}, [r]), o = f(() => ({
		action: "#",
		clearErrors: () => {},
		componentId: `blocks-fields-${e}`,
		componentRef: "",
		errors: a,
		fieldIdPrefix: `blocks-fields-${e}`,
		fieldLabels: {},
		precognitive: !1,
		processing: !1,
		touch: () => {},
		validate: () => {},
		validateFields: () => {},
		validating: !1
	}), [a, e]);
	return /* @__PURE__ */ _(w.FormProvider, {
		value: o,
		children: /* @__PURE__ */ _(w.PrefillProvider, {
			value: { markUserEdit: () => {} },
			children: /* @__PURE__ */ _(w.ResolvedNodesProvider, {
				nodes: {},
				children: /* @__PURE__ */ _(w.FormValuesProvider, {
					initial: n,
					children: /* @__PURE__ */ _(Kt, {
						onChange: i,
						children: /* @__PURE__ */ _(w.Renderer, { nodes: t })
					})
				})
			})
		})
	});
}
function Kt({ children: e, onChange: t }) {
	let n = (0, w.useFormValues)(), r = (0, w.useSetFormValue)(), i = p(n);
	i.current = n;
	let a = o((e, n) => {
		let a = typeof n == "function" ? n((0, w.getPath)(i.current, e)) : n;
		i.current = (0, w.setPath)(i.current, e, a), r(e, a);
		let o = e.split(".")[0];
		t(o, (0, w.getPath)(i.current, o));
	}, [t, r]), s = f(() => ({
		blur: () => {},
		change: a,
		commit: a
	}), [a]);
	return /* @__PURE__ */ _(w.FieldCommitOverrideProvider, {
		value: s,
		children: e
	});
}
var qt = S((() => {
	T();
}));
//#endregion
//#region resources/js/components/inspector/content-panel.tsx
function Jt(e, t) {
	let n = k((t) => t.rendered[e]);
	return f(() => t ? n ? we(t.schema, Ce(n)) : t.schema : [], [n, t]);
}
function Yt({ id: e, type: t, data: n }) {
	let { t: r } = (0, w.useT)("blocks"), { store: i, requestRender: a } = O(), s = k((t) => t.errors[e]), c = Jt(e, t), l = f(() => ({
		...t.defaults,
		...n
	}), [n, t.defaults]), u = o((t, n) => {
		i.setState((r) => ht(r, e, t, n)), a(e);
	}, [
		e,
		a,
		i
	]);
	return c.length === 0 ? /* @__PURE__ */ _("p", {
		className: "px-3 py-3 text-sm text-lt-muted-fg",
		children: r("blocks.editor.inspector.no-content-fields", "This block has no content fields.")
	}) : /* @__PURE__ */ _("div", {
		className: "grid gap-4 px-3 py-3",
		"data-test": "blocks-content-panel",
		children: /* @__PURE__ */ _(Gt, {
			id: e,
			schema: c,
			initial: l,
			errors: s,
			onChange: u
		})
	});
}
var Xt = S((() => {
	T(), Ae(), D(), A(), qt();
}));
//#endregion
//#region resources/js/components/inspector/structure-panel.tsx
function Zt() {
	let { t: e } = (0, w.useT)("blocks"), { store: t, types: n, focusBlock: r } = O(), i = k((e) => e.document), a = k((e) => e.selectedId), o = f(() => Pe(i), [i]);
	return o.length === 0 ? /* @__PURE__ */ _("p", {
		className: "px-3 py-3 text-sm text-lt-muted-fg",
		children: e("blocks.editor.empty", "This page has no blocks yet. Pick one from the library.")
	}) : /* @__PURE__ */ _("ul", {
		className: "py-2",
		"data-test": "blocks-structure",
		"aria-label": e("blocks.editor.inspector.structure", "Structure"),
		children: o.map((e) => {
			let i = n.find((t) => t.type === e.node.type), o = e.node.id === a;
			return /* @__PURE__ */ _("li", { children: /* @__PURE__ */ v("button", {
				type: "button",
				"aria-current": o || void 0,
				"data-test": `structure-${e.node.id}`,
				className: (0, w.cn)("flex w-full items-center gap-2 px-3 py-1 text-left text-xs hover:bg-lt-accent hover:text-lt-accent-fg", o && "bg-lt-accent font-medium text-lt-accent-fg"),
				style: { paddingLeft: `${.75 + e.depth * .9}rem` },
				onClick: () => {
					t.setState((t) => rt(t, e.node.id)), r(e.node.id);
				},
				children: [
					i?.icon && /* @__PURE__ */ _(w.Icon, {
						name: i.icon,
						className: "size-lt-icon-sm text-lt-muted-fg"
					}),
					/* @__PURE__ */ _("span", {
						className: "truncate",
						children: i?.label ?? e.node.type
					}),
					e.slot && /* @__PURE__ */ _("span", {
						className: "ml-auto truncate text-[10px] text-lt-muted-fg",
						children: e.slot
					})
				]
			}) }, e.node.id);
		})
	});
}
var Qt = S((() => {
	T(), D(), Ye(), A();
}));
//#endregion
//#region resources/js/components/inspector/style-panel.tsx
function $t({ id: e, style: t, supports: n }) {
	let { t: r } = (0, w.useT)("blocks"), { store: i } = O(), a = u(), o = (t) => i.setState((n) => vt(n, e, t));
	if (!n.width && !n.spacing && !n.background && !n.align && !n.visibility) return /* @__PURE__ */ _("p", {
		className: "px-3 py-3 text-sm text-lt-muted-fg",
		children: r("blocks.editor.inspector.no-style-options", "This block has no style options.")
	});
	let s = (e, n) => /* @__PURE__ */ _(Bt, {
		label: n,
		htmlFor: `${a}-${e}`,
		children: /* @__PURE__ */ v(w.NativeSelect, {
			id: `${a}-${e}`,
			density: "compact",
			value: t[e] ?? "",
			"data-test": `blocks-style-${e}`,
			onChange: (t) => o({ [e]: t.target.value === "" ? null : t.target.value }),
			children: [/* @__PURE__ */ _("option", {
				value: "",
				children: r("blocks.editor.inspector.spacing-default", "Default")
			}), en.map((e) => /* @__PURE__ */ _("option", {
				value: e,
				children: e
			}, e))]
		})
	});
	return /* @__PURE__ */ v("div", {
		"data-test": "blocks-style-panel",
		children: [
			n.width && /* @__PURE__ */ _(Vt, {
				title: r("blocks.editor.inspector.width", "Width"),
				children: /* @__PURE__ */ _(w.SegmentedControl, {
					"aria-label": r("blocks.editor.inspector.width", "Width"),
					"data-test": "blocks-style-width",
					value: t.width ?? "full",
					onValueChange: (e) => o({ width: e }),
					options: [
						{
							label: r("blocks.editor.inspector.width-content", "Content"),
							value: "content"
						},
						{
							label: r("blocks.editor.inspector.width-wide", "Wide"),
							value: "wide"
						},
						{
							label: r("blocks.editor.inspector.width-full", "Full"),
							value: "full"
						}
					]
				})
			}),
			n.spacing && /* @__PURE__ */ v(Vt, {
				title: r("blocks.editor.inspector.padding-top", "Padding top").replace(/ top$/i, ""),
				children: [
					s("paddingTop", r("blocks.editor.inspector.padding-top", "Padding top")),
					s("paddingBottom", r("blocks.editor.inspector.padding-bottom", "Padding bottom")),
					s("marginTop", r("blocks.editor.inspector.margin-top", "Margin top")),
					s("marginBottom", r("blocks.editor.inspector.margin-bottom", "Margin bottom"))
				]
			}),
			n.background && /* @__PURE__ */ _(Vt, {
				title: r("blocks.editor.inspector.background", "Background"),
				children: /* @__PURE__ */ _(w.SegmentedControl, {
					"aria-label": r("blocks.editor.inspector.background", "Background"),
					"data-test": "blocks-style-background",
					value: t.background ?? "none",
					onValueChange: (e) => o({ background: e }),
					options: [
						{
							label: r("blocks.editor.inspector.background-none", "None"),
							value: "none"
						},
						{
							label: r("blocks.editor.inspector.background-muted", "Muted"),
							value: "muted"
						},
						{
							label: r("blocks.editor.inspector.background-inverted", "Inverted"),
							value: "inverted"
						},
						{
							label: r("blocks.editor.inspector.background-primary", "Primary"),
							value: "primary"
						}
					]
				})
			}),
			n.align && /* @__PURE__ */ _(Vt, {
				title: r("blocks.editor.inspector.align", "Alignment"),
				children: /* @__PURE__ */ _(w.SegmentedControl, {
					"aria-label": r("blocks.editor.inspector.align", "Alignment"),
					"data-test": "blocks-style-align",
					value: t.align ?? "start",
					onValueChange: (e) => o({ align: e }),
					options: [{
						label: r("blocks.editor.inspector.align-start", "Start"),
						value: "start"
					}, {
						label: r("blocks.editor.inspector.align-center", "Center"),
						value: "center"
					}]
				})
			}),
			n.visibility && /* @__PURE__ */ v(Vt, {
				title: r("blocks.editor.inspector.visibility", "Visibility"),
				children: [/* @__PURE__ */ v("label", {
					className: "flex items-center gap-2 text-xs",
					children: [/* @__PURE__ */ _(w.Checkbox, {
						checked: t.hideOnMobile,
						"data-test": "blocks-style-hide-mobile",
						onCheckedChange: (e) => o({ hideOnMobile: e === !0 })
					}), r("blocks.editor.inspector.hide-on-mobile", "Hide on mobile")]
				}), /* @__PURE__ */ v("label", {
					className: "flex items-center gap-2 text-xs",
					children: [/* @__PURE__ */ _(w.Checkbox, {
						checked: t.hideOnDesktop,
						"data-test": "blocks-style-hide-desktop",
						onCheckedChange: (e) => o({ hideOnDesktop: e === !0 })
					}), r("blocks.editor.inspector.hide-on-desktop", "Hide on desktop")]
				})]
			})
		]
	});
}
var en, tn = S((() => {
	T(), D(), A(), Ht(), en = [
		"none",
		"xs",
		"sm",
		"md",
		"lg",
		"xl"
	];
}));
//#endregion
//#region resources/js/components/inspector/inspector.tsx
function nn() {
	let { t: e } = (0, w.useT)("blocks"), t = k((e) => e.selectedId), n = k((e) => e.document), r = k((e) => e.travelCount), i = f(() => t ? E(n, t) : null, [n, t]), a = Lt(i?.node.type ?? ""), [o, s] = m("style"), c = Jt(i?.node.id ?? "", a).length > 0, l = i ? o === "content" && !c ? "style" : o : "structure", u = [
		{
			key: "style",
			label: e("blocks.editor.inspector.style", "Style")
		},
		{
			hidden: !c,
			key: "content",
			label: e("blocks.editor.inspector.content", "Content")
		},
		{
			key: "advanced",
			label: e("blocks.editor.inspector.advanced", "Advanced")
		},
		{
			key: "structure",
			label: e("blocks.editor.inspector.structure", "Structure")
		}
	];
	return /* @__PURE__ */ v("aside", {
		className: "flex w-80 shrink-0 flex-col border-l border-lt-border bg-lt-surface",
		"data-test": "blocks-inspector",
		"data-blocks-inspector": !0,
		"aria-label": e("blocks.editor.inspector.title", "Block"),
		children: [/* @__PURE__ */ v("div", {
			className: "flex h-10 items-center gap-2 border-b border-lt-border px-3 text-sm font-semibold",
			children: [
				a?.icon && /* @__PURE__ */ _(w.Icon, {
					name: a.icon,
					className: "size-lt-icon-md text-lt-muted-fg"
				}),
				/* @__PURE__ */ _("span", {
					"data-test": "blocks-inspector-title",
					children: a?.label ?? e("blocks.editor.inspector.title", "Block")
				}),
				i && /* @__PURE__ */ _("span", {
					className: "ml-auto font-mono text-[10px] font-normal text-lt-muted-fg",
					children: i.node.type
				})
			]
		}), i ? /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _("div", {
			role: "tablist",
			className: "flex border-b border-lt-border px-2",
			children: u.filter((e) => !e.hidden).map((e) => /* @__PURE__ */ _("button", {
				type: "button",
				role: "tab",
				"aria-selected": l === e.key,
				"data-test": `blocks-inspector-tab-${e.key}`,
				className: (0, w.cn)("-mb-px border-b-2 px-2.5 py-2 text-xs font-medium", l === e.key ? "border-lt-fg text-lt-fg" : "border-transparent text-lt-muted-fg hover:text-lt-fg"),
				onClick: () => s(e.key),
				children: e.label
			}, e.key))
		}), /* @__PURE__ */ v("div", {
			className: "min-h-0 flex-1 overflow-y-auto",
			role: "tabpanel",
			children: [
				l === "style" && a && /* @__PURE__ */ _($t, {
					id: i.node.id,
					style: i.node.style,
					supports: a.supports
				}),
				l === "content" && a && /* @__PURE__ */ _(Yt, {
					id: i.node.id,
					type: a,
					data: i.node.data
				}, `${i.node.id}:${r}`),
				l === "advanced" && a && /* @__PURE__ */ _(Ut, {
					id: i.node.id,
					style: i.node.style,
					supports: a.supports
				}),
				l === "structure" && /* @__PURE__ */ _(Zt, {})
			]
		})] }) : /* @__PURE__ */ v("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ _("p", {
				className: "border-b border-lt-border px-3 py-3 text-sm text-lt-muted-fg",
				"data-test": "blocks-inspector-empty",
				children: e("blocks.editor.inspector.none", "Select a block to edit its settings.")
			}), /* @__PURE__ */ _("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: /* @__PURE__ */ _(Zt, {})
			})]
		})]
	});
}
var rn = S((() => {
	T(), Ye(), A(), Wt(), Xt(), Qt(), tn();
}));
//#endregion
//#region resources/js/dnd/block-dnd.ts
function an(e, t) {
	return {
		blockType: t,
		id: e,
		type: pn
	};
}
function on(e) {
	return {
		blockType: e,
		type: mn
	};
}
function sn(e) {
	return e.type === "lattice-blocks/block" && typeof e.id == "string" && typeof e.blockType == "string" ? {
		blockType: e.blockType,
		id: e.id,
		kind: "block"
	} : e.type === "lattice-blocks/library" && typeof e.blockType == "string" ? {
		blockType: e.blockType,
		kind: "library"
	} : null;
}
function cn(e, t) {
	let n = (0, w.attachClosestEdge)({
		blockId: e,
		kind: "block"
	}, {
		allowedEdges: ["top", "bottom"],
		element: t.element,
		input: t.input
	});
	return {
		...n,
		edge: (0, w.extractClosestEdge)(n)
	};
}
function ln(e) {
	return e.edge === "top" || e.edge === "bottom" ? e.edge : null;
}
function un(e, t) {
	return {
		kind: "slot",
		parentId: e,
		slot: t
	};
}
function dn(e, t, n) {
	let r = t[0];
	if (!r) return null;
	if (r.data.kind === "block" && typeof r.data.blockId == "string") {
		let t = E(e, r.data.blockId);
		if (!t) return null;
		let i = ln(r.data), a = {
			parentId: t.parentId,
			slot: t.slot
		}, o = n?.kind === "block" ? E(e, n.id) : null;
		if (o != null && o.parentId === a.parentId && o.slot === a.slot && o) {
			let e = (0, w.getReorderDestinationIndex)({
				axis: "vertical",
				closestEdgeOfTarget: i,
				indexOfTarget: t.index,
				startIndex: o.index
			});
			return {
				...a,
				index: e > o.index ? e + 1 : e
			};
		}
		return {
			...a,
			index: i === "bottom" ? t.index + 1 : t.index
		};
	}
	if (r.data.kind === "slot") {
		let t = typeof r.data.parentId == "string" ? r.data.parentId : null, n = typeof r.data.slot == "string" ? r.data.slot : null;
		return {
			index: t === null ? e.blocks.length : E(e, t)?.node.slots[n ?? ""]?.length ?? 0,
			parentId: t,
			slot: n
		};
	}
	return null;
}
function fn(e, t, n, r) {
	return Qe({
		blockType: n.blockType,
		document: e,
		movingId: n.kind === "block" ? n.id : null,
		parentId: r.parentId,
		slot: r.slot,
		types: t
	});
}
var pn, mn, hn = S((() => {
	T(), et(), Ye(), pn = "lattice-blocks/block", mn = "lattice-blocks/library";
}));
//#endregion
//#region resources/js/components/editor/block-list.tsx
function gn({ ids: e }) {
	return /* @__PURE__ */ _(g, { children: e.map((e) => /* @__PURE__ */ _(_n, { id: e }, e)) });
}
function _n({ id: e }) {
	let t = k((t) => t.rendered[e]);
	return t ? /* @__PURE__ */ _(w.RenderNode, { node: t }) : /* @__PURE__ */ _(vn, { id: e });
}
function vn({ id: e }) {
	let { t } = (0, w.useT)("blocks"), { requestRender: n } = O();
	return l(() => {
		n(e);
	}, [e, n]), /* @__PURE__ */ v("div", {
		className: "flex h-16 items-center justify-center gap-2 rounded-lt border border-dashed border-lt-border text-sm text-lt-muted-fg",
		"data-test": `block-${e}`,
		"data-block-pending": !0,
		children: [/* @__PURE__ */ _(w.Spinner, {}), t("blocks.editor.rendering", "Rendering…")]
	});
}
var yn = S((() => {
	T(), A();
}));
//#endregion
//#region resources/js/components/editor/breadcrumbs.tsx
function bn() {
	let { store: e, types: t, focusBlock: n } = O(), r = k((e) => e.document), i = k((e) => e.selectedId), a = f(() => i ? qe(r, i) : [], [r, i]);
	return a.length === 0 ? null : /* @__PURE__ */ _("nav", {
		"aria-label": "Block path",
		"data-test": "blocks-breadcrumbs",
		className: "sticky bottom-0 flex items-center gap-1 border-t border-lt-border bg-lt-surface px-4 py-1.5 text-xs text-lt-muted-fg",
		children: a.map((r, i) => {
			let o = t.find((e) => e.type === r.node.type)?.label ?? r.node.type, s = i === a.length - 1;
			return /* @__PURE__ */ v("span", {
				className: "flex items-center gap-1",
				children: [i > 0 && /* @__PURE__ */ _(w.Icon, {
					name: "chevron-right",
					className: "size-lt-icon-sm",
					"aria-hidden": "true"
				}), /* @__PURE__ */ _("button", {
					type: "button",
					className: s ? "font-medium text-lt-fg" : "hover:text-lt-fg",
					"aria-current": s ? "location" : void 0,
					onClick: () => {
						e.setState((e) => rt(e, r.node.id)), n(r.node.id);
					},
					children: o
				})]
			}, r.node.id);
		})
	});
}
var xn = S((() => {
	T(), D(), Ye(), A();
}));
//#endregion
//#region resources/js/inline/binding-popover.tsx
function Sn({ binding: e, children: t, className: n }) {
	let { t: r } = (0, w.useT)("blocks"), { store: i, requestRender: a } = O(), { block: s, field: c } = e, [l, u] = m(!1), d = k((e) => E(e.document, s.id)?.node.data), f = k((e) => e.errors[s.id]), p = c.node.props.label ?? c.name, [h] = m(() => d ?? {}), g = o((e, t) => {
		i.setState((n) => ht(n, s.id, e, t)), a(s.id);
	}, [
		s.id,
		a,
		i
	]);
	return /* @__PURE__ */ v(w.Popover, {
		open: l,
		onOpenChange: u,
		children: [/* @__PURE__ */ _(w.PopoverTrigger, {
			asChild: !0,
			children: /* @__PURE__ */ _("span", {
				role: "button",
				tabIndex: 0,
				"aria-label": r("blocks.editor.edit-field", "Edit {{label}}", { label: p }),
				"data-test": `inline-${s.id}-${c.name}`,
				className: (0, w.cn)("lt-blocks-ui block cursor-pointer rounded-lt outline-none ring-lt-primary ring-offset-2 ring-offset-lt-surface focus-visible:ring-2 data-[state=open]:ring-2", n),
				children: t
			})
		}), /* @__PURE__ */ _(w.PopoverContent, {
			className: "lt-blocks-ui w-80 p-3",
			"data-test": `inline-popover-${s.id}-${c.name}`,
			onKeyDown: (e) => {
				e.key === "Escape" && e.stopPropagation();
			},
			children: /* @__PURE__ */ _(Gt, {
				id: `${s.id}-${c.name}`,
				schema: [c.node],
				initial: h,
				errors: f,
				onChange: g
			})
		})]
	});
}
var Cn = S((() => {
	T(), D(), Ye(), A(), qt();
}));
//#endregion
//#region resources/js/inline/editable-media.tsx
function wn({ node: e, binding: t }) {
	let { t: n } = (0, w.useT)("blocks"), r = e.type === "image";
	return /* @__PURE__ */ v(Sn, {
		binding: t,
		className: "group relative",
		children: [/* @__PURE__ */ _(QC, { node: e }), /* @__PURE__ */ v("span", {
			className: "pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lt-full border border-lt-border bg-lt-popover px-2 py-0.5 text-[11px] font-medium text-lt-popover-fg shadow-lt-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[state=open]:opacity-100",
			children: [/* @__PURE__ */ _(w.Icon, {
				name: "image",
				className: "size-lt-icon-sm"
			}), r ? n("blocks.editor.replace-image", "Replace image") : n("blocks.editor.choose-image", "Choose image")]
		})]
	});
}
var Tn = S((() => {
	T(), nw(), Cn();
}));
//#endregion
//#region ../../node_modules/orderedmap/dist/index.js
function En(e) {
	this.content = e;
}
var Dn = S((() => {
	En.prototype = {
		constructor: En,
		find: function(e) {
			for (var t = 0; t < this.content.length; t += 2) if (this.content[t] === e) return t;
			return -1;
		},
		get: function(e) {
			var t = this.find(e);
			return t == -1 ? void 0 : this.content[t + 1];
		},
		update: function(e, t, n) {
			var r = n && n != e ? this.remove(n) : this, i = r.find(e), a = r.content.slice();
			return i == -1 ? a.push(n || e, t) : (a[i + 1] = t, n && (a[i] = n)), new En(a);
		},
		remove: function(e) {
			var t = this.find(e);
			if (t == -1) return this;
			var n = this.content.slice();
			return n.splice(t, 2), new En(n);
		},
		addToStart: function(e, t) {
			return new En([e, t].concat(this.remove(e).content));
		},
		addToEnd: function(e, t) {
			var n = this.remove(e).content.slice();
			return n.push(e, t), new En(n);
		},
		addBefore: function(e, t, n) {
			var r = this.remove(t), i = r.content.slice(), a = r.find(e);
			return i.splice(a == -1 ? i.length : a, 0, t, n), new En(i);
		},
		forEach: function(e) {
			for (var t = 0; t < this.content.length; t += 2) e(this.content[t], this.content[t + 1]);
		},
		prepend: function(e) {
			return e = En.from(e), e.size ? new En(e.content.concat(this.subtract(e).content)) : this;
		},
		append: function(e) {
			return e = En.from(e), e.size ? new En(this.subtract(e).content.concat(e.content)) : this;
		},
		subtract: function(e) {
			var t = this;
			e = En.from(e);
			for (var n = 0; n < e.content.length; n += 2) t = t.remove(e.content[n]);
			return t;
		},
		toObject: function() {
			var e = {};
			return this.forEach(function(t, n) {
				e[t] = n;
			}), e;
		},
		get size() {
			return this.content.length >> 1;
		}
	}, En.from = function(e) {
		if (e instanceof En) return e;
		var t = [];
		if (e) for (var n in e) t.push(n, e[n]);
		return new En(t);
	};
}));
//#endregion
//#region ../../node_modules/prosemirror-model/dist/index.js
function On(e, t, n) {
	for (let r = 0;; r++) {
		if (r == e.childCount || r == t.childCount) return e.childCount == t.childCount ? null : n;
		let i = e.child(r), a = t.child(r);
		if (i == a) {
			n += i.nodeSize;
			continue;
		}
		if (!i.sameMarkup(a)) return n;
		if (i.isText && i.text != a.text) {
			let e = i.text, t = a.text, r = 0;
			for (; e[r] == t[r]; r++) n++;
			return r && r < e.length && r < t.length && jn(e.charCodeAt(r - 1)) && An(e.charCodeAt(r)) && n--, n;
		}
		if (i.content.size || a.content.size) {
			let e = On(i.content, a.content, n + 1);
			if (e != null) return e;
		}
		n += i.nodeSize;
	}
}
function kn(e, t, n, r) {
	for (let i = e.childCount, a = t.childCount;;) {
		if (i == 0 || a == 0) return i == a ? null : {
			a: n,
			b: r
		};
		let o = e.child(--i), s = t.child(--a), c = o.nodeSize;
		if (o == s) {
			n -= c, r -= c;
			continue;
		}
		if (!o.sameMarkup(s)) return {
			a: n,
			b: r
		};
		if (o.isText && o.text != s.text) {
			let e = o.text, t = s.text, i = e.length, a = t.length;
			for (; i > 0 && a > 0 && e[i - 1] == t[a - 1];) i--, a--, n--, r--;
			return i && a && i < e.length && jn(e.charCodeAt(i - 1)) && An(e.charCodeAt(i)) && (n++, r++), {
				a: n,
				b: r
			};
		}
		if (o.content.size || s.content.size) {
			let e = kn(o.content, s.content, n - 1, r - 1);
			if (e) return e;
		}
		n -= c, r -= c;
	}
}
function An(e) {
	return e >= 56320 && e < 57344;
}
function jn(e) {
	return e >= 55296 && e < 56320;
}
function Mn(e, t) {
	return Cr.index = e, Cr.offset = t, Cr;
}
function Nn(e, t) {
	if (e === t) return !0;
	if (!(e && typeof e == "object") || !(t && typeof t == "object")) return !1;
	let n = Array.isArray(e);
	if (Array.isArray(t) != n) return !1;
	if (n) {
		if (e.length != t.length) return !1;
		for (let n = 0; n < e.length; n++) if (!Nn(e[n], t[n])) return !1;
	} else {
		for (let n in e) if (!(n in t) || !Nn(e[n], t[n])) return !1;
		for (let n in t) if (!(n in e)) return !1;
	}
	return !0;
}
function Pn(e, t, n) {
	let { index: r, offset: i } = e.findIndex(t), a = e.maybeChild(r), { index: o, offset: s } = e.findIndex(n);
	if (i == t || a.isText) {
		if (s != n && !e.child(o).isText) throw RangeError("Removing non-flat range");
		return e.cut(0, t).append(e.cut(n));
	}
	if (r != o) throw RangeError("Removing non-flat range");
	return e.replaceChild(r, a.copy(Pn(a.content, t - i - 1, n - i - 1)));
}
function Fn(e, t, n, r, i, a) {
	let { index: o, offset: s } = e.findIndex(t), c = e.maybeChild(o);
	if (s == t || c.isText) return a && r <= 0 && i <= 0 && !a.canReplace(o, o, n) ? null : e.cut(0, t).append(n).append(e.cut(t));
	let l = Fn(c.content, t - s - 1, n, o == 0 ? r - 1 : 0, o == e.childCount - 1 ? i - 1 : 0, c);
	return l && e.replaceChild(o, c.copy(l));
}
function In(e, t, n) {
	if (n.openStart > e.depth) throw new wr("Inserted content deeper than insertion position");
	if (e.depth - n.openStart != t.depth - n.openEnd) throw new wr("Inconsistent open depths");
	return Ln(e, t, n, 0);
}
function Ln(e, t, n, r) {
	let i = e.index(r), a = e.node(r);
	if (i == t.index(r) && r < e.depth - n.openStart) {
		let o = Ln(e, t, n, r + 1);
		return a.copy(a.content.replaceChild(i, o));
	}
	if (!n.content.size) return Hn(a, Wn(e, t, r));
	if (!n.openStart && !n.openEnd && e.depth == r && t.depth == r) {
		let r = e.parent, i = r.content;
		return Hn(r, i.cut(0, e.parentOffset).append(n.content).append(i.cut(t.parentOffset)));
	}
	{
		let { start: i, end: o } = Gn(n, e);
		return Hn(a, Un(e, i, o, t, r));
	}
}
function Rn(e, t) {
	if (!t.type.compatibleContent(e.type)) throw new wr("Cannot join " + t.type.name + " onto " + e.type.name);
}
function zn(e, t, n) {
	let r = e.node(n);
	return Rn(r, t.node(n)), r;
}
function Bn(e, t) {
	let n = t.length - 1;
	n >= 0 && e.isText && e.sameMarkup(t[n]) ? t[n] = e.withText(t[n].text + e.text) : t.push(e);
}
function Vn(e, t, n, r) {
	let i = (t || e).node(n), a = 0, o = t ? t.index(n) : i.childCount;
	e && (a = e.index(n), e.depth > n ? a++ : e.textOffset && (Bn(e.nodeAfter, r), a++));
	for (let e = a; e < o; e++) Bn(i.child(e), r);
	t && t.depth == n && t.textOffset && Bn(t.nodeBefore, r);
}
function Hn(e, t) {
	if (!e.type.validContent(t)) throw new wr("Invalid content for node " + e.type.name);
	return e.copy(t);
}
function Un(e, t, n, r, i) {
	let a = e.depth > i && zn(e, t, i + 1), o = r.depth > i && zn(n, r, i + 1), s = [];
	return Vn(null, e, i, s), a && o && t.index(i) == n.index(i) ? (Rn(a, o), Bn(Hn(a, Un(e, t, n, r, i + 1)), s)) : (a && Bn(Hn(a, Wn(e, t, i + 1)), s), Vn(t, n, i, s), o && Bn(Hn(o, Wn(n, r, i + 1)), s)), Vn(r, null, i, s), new j(s);
}
function Wn(e, t, n) {
	let r = [];
	return Vn(null, e, n, r), e.depth > n && Bn(Hn(zn(e, t, n + 1), Wn(e, t, n + 1)), r), Vn(t, null, n, r), new j(r);
}
function Gn(e, t) {
	let n = t.depth - e.openStart, r = t.node(n).copy(e.content);
	for (let e = n - 1; e >= 0; e--) r = t.node(e).copy(j.from(r));
	return {
		start: r.resolveNoCache(e.openStart + n),
		end: r.resolveNoCache(r.content.size - e.openEnd - n)
	};
}
function Kn(e, t) {
	for (let n = e.length - 1; n >= 0; n--) t = e[n].type.name + "(" + t + ")";
	return t;
}
function qn(e) {
	let t = [];
	do
		t.push(Jn(e));
	while (e.eat("|"));
	return t.length == 1 ? t[0] : {
		type: "choice",
		exprs: t
	};
}
function Jn(e) {
	let t = [];
	do
		t.push(Yn(e));
	while (e.next && e.next != ")" && e.next != "|");
	return t.length == 1 ? t[0] : {
		type: "seq",
		exprs: t
	};
}
function Yn(e) {
	let t = $n(e);
	for (;;) if (e.eat("+")) t = {
		type: "plus",
		expr: t
	};
	else if (e.eat("*")) t = {
		type: "star",
		expr: t
	};
	else if (e.eat("?")) t = {
		type: "opt",
		expr: t
	};
	else if (e.eat("{")) t = Zn(e, t);
	else break;
	return t;
}
function Xn(e) {
	/\D/.test(e.next) && e.err("Expected number, got '" + e.next + "'");
	let t = Number(e.next);
	return e.pos++, t;
}
function Zn(e, t) {
	let n = Xn(e), r = n;
	return e.eat(",") && (r = e.next == "}" ? -1 : Xn(e)), e.eat("}") || e.err("Unclosed braced range"), {
		type: "range",
		min: n,
		max: r,
		expr: t
	};
}
function Qn(e, t) {
	let n = e.nodeTypes, r = n[t];
	if (r) return [r];
	let i = [];
	for (let e in n) {
		let r = n[e];
		r.isInGroup(t) && i.push(r);
	}
	return i.length == 0 && e.err("No node type or group '" + t + "' found"), i;
}
function $n(e) {
	if (e.eat("(")) {
		let t = qn(e);
		return e.eat(")") || e.err("Missing closing paren"), t;
	}
	if (/\W/.test(e.next)) e.err("Unexpected token '" + e.next + "'");
	else {
		let t = Qn(e, e.next).map((t) => (e.inline == null ? e.inline = t.isInline : e.inline != t.isInline && e.err("Mixing inline and block content"), {
			type: "name",
			value: t
		}));
		return e.pos++, t.length == 1 ? t[0] : {
			type: "choice",
			exprs: t
		};
	}
}
function er(e) {
	let t = [[]];
	return i(a(e, 0), n()), t;
	function n() {
		return t.push([]) - 1;
	}
	function r(e, n, r) {
		let i = {
			term: r,
			to: n
		};
		return t[e].push(i), i;
	}
	function i(e, t) {
		e.forEach((e) => e.to = t);
	}
	function a(e, t) {
		if (e.type == "choice") return e.exprs.reduce((e, n) => e.concat(a(n, t)), []);
		if (e.type == "seq") for (let r = 0;; r++) {
			let o = a(e.exprs[r], t);
			if (r == e.exprs.length - 1) return o;
			i(o, t = n());
		}
		else if (e.type == "star") {
			let o = n();
			return r(t, o), i(a(e.expr, o), o), [r(o)];
		} else if (e.type == "plus") {
			let o = n();
			return i(a(e.expr, t), o), i(a(e.expr, o), o), [r(o)];
		} else if (e.type == "opt") return [r(t)].concat(a(e.expr, t));
		else if (e.type == "range") {
			let o = t;
			for (let t = 0; t < e.min; t++) {
				let t = n();
				i(a(e.expr, o), t), o = t;
			}
			if (e.max == -1) i(a(e.expr, o), o);
			else for (let t = e.min; t < e.max; t++) {
				let t = n();
				r(o, t), i(a(e.expr, o), t), o = t;
			}
			return [r(o)];
		} else if (e.type == "name") return [r(t, void 0, e.value)];
		else throw Error("Unknown expr type");
	}
}
function tr(e, t) {
	return t - e;
}
function nr(e, t) {
	let n = [];
	return r(t), n.sort(tr);
	function r(t) {
		let i = e[t];
		if (i.length == 1 && !i[0].term) return r(i[0].to);
		n.push(t);
		for (let e = 0; e < i.length; e++) {
			let { term: t, to: a } = i[e];
			!t && n.indexOf(a) == -1 && r(a);
		}
	}
}
function rr(e) {
	let t = Object.create(null);
	return n(nr(e, 0));
	function n(r) {
		let i = [];
		r.forEach((t) => {
			e[t].forEach(({ term: t, to: n }) => {
				if (!t) return;
				let r;
				for (let e = 0; e < i.length; e++) i[e][0] == t && (r = i[e][1]);
				nr(e, n).forEach((e) => {
					r || i.push([t, r = []]), r.indexOf(e) == -1 && r.push(e);
				});
			});
		});
		let a = t[r.join(",")] = new Nr(r.indexOf(e.length - 1) > -1);
		for (let e = 0; e < i.length; e++) {
			let r = i[e][1].sort(tr);
			a.next.push({
				type: i[e][0],
				next: t[r.join(",")] || n(r)
			});
		}
		return a;
	}
}
function ir(e, t) {
	for (let n = 0, r = [e]; n < r.length; n++) {
		let e = r[n], i = !e.validEnd, a = [];
		for (let t = 0; t < e.next.length; t++) {
			let { type: n, next: o } = e.next[t];
			a.push(n.name), i && !(n.isText || n.hasRequiredAttrs()) && (i = !1), r.indexOf(o) == -1 && r.push(o);
		}
		i && t.err("Only non-generatable nodes (" + a.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
	}
}
function ar(e) {
	let t = Object.create(null);
	for (let n in e) {
		let r = e[n];
		if (!r.hasDefault) return null;
		t[n] = r.default;
	}
	return t;
}
function or(e, t) {
	let n = Object.create(null);
	for (let r in e) {
		let i = t && t[r];
		if (i === void 0) {
			let t = e[r];
			if (t.hasDefault) i = t.default;
			else throw RangeError("No value supplied for attribute " + r);
		}
		n[r] = i;
	}
	return n;
}
function sr(e, t, n, r) {
	for (let i in t) if (!(i in e)) throw RangeError(`Unsupported attribute ${i} for ${n} of type ${r}`);
	for (let n in e) e[n].validate && e[n].validate(t[n]);
}
function cr(e, t) {
	let n = Object.create(null);
	if (t) for (let r in t) n[r] = new Ir(e, r, t[r]);
	return n;
}
function lr(e, t, n) {
	let r = n.split("|");
	return (n) => {
		let i = n === null ? "null" : typeof n;
		if (r.indexOf(i) < 0) throw RangeError(`Expected value of type ${r} for attribute ${t} on type ${e}, got ${i}`);
	};
}
function ur(e, t) {
	let n = [];
	for (let r = 0; r < t.length; r++) {
		let i = t[r], a = e.marks[i], o = a;
		if (a) n.push(a);
		else for (let t in e.marks) {
			let r = e.marks[t];
			(i == "_" || r.spec.group && r.spec.group.split(" ").indexOf(i) > -1) && n.push(o = r);
		}
		if (!o) throw SyntaxError("Unknown mark type: '" + t[r] + "'");
	}
	return n;
}
function dr(e) {
	return e.tag != null;
}
function fr(e) {
	return e.style != null;
}
function pr(e, t, n) {
	return t == null ? e && e.whitespace == "pre" ? 3 : n & -5 : (t ? Ur : 0) | (t === "full" ? Wr : 0);
}
function mr(e) {
	for (let t = e.firstChild, n = null; t; t = t.nextSibling) {
		let e = t.nodeType == 1 ? t.nodeName.toLowerCase() : null;
		e && Hr.hasOwnProperty(e) && n ? (n.appendChild(t), t = n) : e == "li" ? n = t : e && (n = null);
	}
}
function hr(e, t) {
	return (e.matches || e.msMatchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector).call(e, t);
}
function gr(e) {
	let t = {};
	for (let n in e) t[n] = e[n];
	return t;
}
function _r(e, t) {
	let n = t.schema.nodes;
	for (let r in n) {
		let i = n[r];
		if (!i.allowsMarkType(e)) continue;
		let a = [], o = (e) => {
			a.push(e);
			for (let n = 0; n < e.edgeCount; n++) {
				let { type: r, next: i } = e.edge(n);
				if (r == t || a.indexOf(i) < 0 && o(i)) return !0;
			}
		};
		if (o(i.contentMatch)) return !0;
	}
}
function vr(e) {
	let t = {};
	for (let n in e) {
		let r = e[n].spec.toDOM;
		r && (t[n] = r);
	}
	return t;
}
function yr(e) {
	return e.document || window.document;
}
function br(e) {
	let t = Yr.get(e);
	return t === void 0 && Yr.set(e, t = xr(e)), t;
}
function xr(e) {
	let t = null;
	function n(e) {
		if (e && typeof e == "object") if (Array.isArray(e)) if (typeof e[0] == "string") t ||= [], t.push(e);
		else for (let t = 0; t < e.length; t++) n(e[t]);
		else for (let t in e) n(e[t]);
	}
	return n(e), t;
}
function Sr(e, t, n, r) {
	if (t.nodeType == 1) return { dom: t };
	if (t.dom && t.dom.nodeType == 1) return t;
	let i = t[0], a;
	if (typeof i != "string") throw RangeError("Invalid array passed to renderSpec");
	if (r && (a = br(r)) && a.indexOf(t) > -1) throw RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
	let o = i.indexOf(" ");
	o > 0 && (n = i.slice(0, o), i = i.slice(o + 1));
	let s, c = n ? e.createElementNS(n, i) : e.createElement(i), l = t[1], u = 1;
	if (l && typeof l == "object" && l.nodeType == null && !Array.isArray(l)) {
		u = 2;
		for (let e in l) if (l[e] != null) {
			let t = e.indexOf(" ");
			t > 0 ? c.setAttributeNS(e.slice(0, t), e.slice(t + 1), l[e]) : e == "style" && c.style ? c.style.cssText = l[e] : c.setAttribute(e, l[e]);
		}
	}
	for (let i = u; i < t.length; i++) {
		let a = t[i];
		if (a === 0) {
			if (i < t.length - 1 || i > u) throw RangeError("Content hole must be the only child of its parent node");
			return {
				dom: c,
				contentDOM: c
			};
		}
		if (typeof a == "string") c.appendChild(e.createTextNode(a));
		else {
			let { dom: t, contentDOM: i } = Sr(e, a, n, r);
			if (c.appendChild(t), i) {
				if (s) throw RangeError("Multiple content holes");
				s = i;
			}
		}
	}
	return {
		dom: c,
		contentDOM: s
	};
}
var j, Cr, M, wr, N, Tr, Er, Dr, Or, kr, Ar, jr, Mr, Nr, Pr, Fr, Ir, Lr, Rr, zr, Br, Vr, Hr, Ur, Wr, Gr, Kr, qr, Jr, Yr, Xr = S((() => {
	Dn(), j = class e {
		constructor(e, t) {
			if (this.content = e, this.size = t || 0, t == null) for (let t = 0; t < e.length; t++) this.size += e[t].nodeSize;
		}
		nodesBetween(e, t, n, r = 0, i) {
			for (let a = 0, o = 0; o < t; a++) {
				let s = this.content[a], c = o + s.nodeSize;
				if (c > e && n(s, r + o, i || null, a) !== !1 && s.content.size) {
					let i = o + 1;
					s.nodesBetween(Math.max(0, e - i), Math.min(s.content.size, t - i), n, r + i);
				}
				o = c;
			}
		}
		descendants(e) {
			this.nodesBetween(0, this.size, e);
		}
		textBetween(e, t, n, r) {
			let i = "", a = !0;
			return this.nodesBetween(e, t, (o, s) => {
				let c = o.isText ? o.text.slice(Math.max(e, s) - s, t - s) : o.isLeaf ? r ? typeof r == "function" ? r(o) : r : o.type.spec.leafText ? o.type.spec.leafText(o) : "" : "";
				o.isBlock && (o.isLeaf && c || o.isTextblock) && n && (a ? a = !1 : i += n), i += c;
			}, 0), i;
		}
		append(t) {
			if (!t.size) return this;
			if (!this.size) return t;
			let n = this.lastChild, r = t.firstChild, i = this.content.slice(), a = 0;
			for (n.isText && n.sameMarkup(r) && (i[i.length - 1] = n.withText(n.text + r.text), a = 1); a < t.content.length; a++) i.push(t.content[a]);
			return new e(i, this.size + t.size);
		}
		cut(t, n = this.size) {
			if (t == 0 && n == this.size) return this;
			let r = [], i = 0;
			if (n > t) for (let e = 0, a = 0; a < n; e++) {
				let o = this.content[e], s = a + o.nodeSize;
				s > t && ((a < t || s > n) && (o = o.isText ? o.cut(Math.max(0, t - a), Math.min(o.text.length, n - a)) : o.cut(Math.max(0, t - a - 1), Math.min(o.content.size, n - a - 1))), r.push(o), i += o.nodeSize), a = s;
			}
			return new e(r, i);
		}
		cutByIndex(t, n) {
			return t == n ? e.empty : t == 0 && n == this.content.length ? this : new e(this.content.slice(t, n));
		}
		replaceChild(t, n) {
			let r = this.content[t];
			if (r == n) return this;
			let i = this.content.slice(), a = this.size + n.nodeSize - r.nodeSize;
			return i[t] = n, new e(i, a);
		}
		addToStart(t) {
			return new e([t].concat(this.content), this.size + t.nodeSize);
		}
		addToEnd(t) {
			return new e(this.content.concat(t), this.size + t.nodeSize);
		}
		eq(e) {
			if (this.content.length != e.content.length) return !1;
			for (let t = 0; t < this.content.length; t++) if (!this.content[t].eq(e.content[t])) return !1;
			return !0;
		}
		get firstChild() {
			return this.content.length ? this.content[0] : null;
		}
		get lastChild() {
			return this.content.length ? this.content[this.content.length - 1] : null;
		}
		get childCount() {
			return this.content.length;
		}
		child(e) {
			let t = this.content[e];
			if (!t) throw RangeError("Index " + e + " out of range for " + this);
			return t;
		}
		maybeChild(e) {
			return this.content[e] || null;
		}
		forEach(e) {
			for (let t = 0, n = 0; t < this.content.length; t++) {
				let r = this.content[t];
				e(r, n, t), n += r.nodeSize;
			}
		}
		findDiffStart(e, t = 0) {
			return On(this, e, t);
		}
		findDiffEnd(e, t = this.size, n = e.size) {
			return kn(this, e, t, n);
		}
		findIndex(e) {
			if (e == 0) return Mn(0, e);
			if (e == this.size) return Mn(this.content.length, e);
			if (e > this.size || e < 0) throw RangeError(`Position ${e} outside of fragment (${this})`);
			for (let t = 0, n = 0;; t++) {
				let r = this.child(t), i = n + r.nodeSize;
				if (i >= e) return i == e ? Mn(t + 1, i) : Mn(t, n);
				n = i;
			}
		}
		toString() {
			return "<" + this.toStringInner() + ">";
		}
		toStringInner() {
			return this.content.join(", ");
		}
		toJSON() {
			return this.content.length ? this.content.map((e) => e.toJSON()) : null;
		}
		static fromJSON(t, n) {
			if (!n) return e.empty;
			if (!Array.isArray(n)) throw RangeError("Invalid input for Fragment.fromJSON");
			return e.fromArray(n.map(t.nodeFromJSON));
		}
		static fromArray(t) {
			if (!t.length) return e.empty;
			let n, r = 0;
			for (let e = 0; e < t.length; e++) {
				let i = t[e];
				r += i.nodeSize, e && i.isText && t[e - 1].sameMarkup(i) ? (n ||= t.slice(0, e), n[n.length - 1] = i.withText(n[n.length - 1].text + i.text)) : n && n.push(i);
			}
			return new e(n || t, r);
		}
		static from(t) {
			if (!t) return e.empty;
			if (t instanceof e) return t;
			if (Array.isArray(t)) return this.fromArray(t);
			if (t.attrs) return new e([t], t.nodeSize);
			throw RangeError("Can not convert " + t + " to a Fragment" + (t.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
		}
	}, j.empty = new j([], 0), Cr = {
		index: 0,
		offset: 0
	}, M = class e {
		constructor(e, t) {
			this.type = e, this.attrs = t;
		}
		addToSet(e) {
			let t, n = !1;
			for (let r = 0; r < e.length; r++) {
				let i = e[r];
				if (this.eq(i)) return e;
				if (this.type.excludes(i.type)) t ||= e.slice(0, r);
				else if (i.type.excludes(this.type)) return e;
				else !n && i.type.rank > this.type.rank && (t ||= e.slice(0, r), t.push(this), n = !0), t && t.push(i);
			}
			return t ||= e.slice(), n || t.push(this), t;
		}
		removeFromSet(e) {
			for (let t = 0; t < e.length; t++) if (this.eq(e[t])) return e.slice(0, t).concat(e.slice(t + 1));
			return e;
		}
		isInSet(e) {
			for (let t = 0; t < e.length; t++) if (this.eq(e[t])) return !0;
			return !1;
		}
		eq(e) {
			return this == e || this.type == e.type && Nn(this.attrs, e.attrs);
		}
		toJSON() {
			let e = { type: this.type.name };
			for (let t in this.attrs) {
				e.attrs = this.attrs;
				break;
			}
			return e;
		}
		static fromJSON(e, t) {
			if (!t) throw RangeError("Invalid input for Mark.fromJSON");
			let n = e.marks[t.type];
			if (!n) throw RangeError(`There is no mark type ${t.type} in this schema`);
			let r = n.create(t.attrs);
			return n.checkAttrs(r.attrs), r;
		}
		static sameSet(e, t) {
			if (e == t) return !0;
			if (e.length != t.length) return !1;
			for (let n = 0; n < e.length; n++) if (!e[n].eq(t[n])) return !1;
			return !0;
		}
		static setFrom(t) {
			if (!t || Array.isArray(t) && t.length == 0) return e.none;
			if (t instanceof e) return [t];
			let n = t.slice();
			return n.sort((e, t) => e.type.rank - t.type.rank), n;
		}
	}, M.none = [], wr = class extends Error {}, N = class e {
		constructor(e, t, n) {
			this.content = e, this.openStart = t, this.openEnd = n;
		}
		get size() {
			return this.content.size - this.openStart - this.openEnd;
		}
		insertAt(t, n) {
			let r = Fn(this.content, t + this.openStart, n, this.openStart + 1, this.openEnd + 1);
			return r && new e(r, this.openStart, this.openEnd);
		}
		removeBetween(t, n) {
			return new e(Pn(this.content, t + this.openStart, n + this.openStart), this.openStart, this.openEnd);
		}
		eq(e) {
			return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
		}
		toString() {
			return this.content + "(" + this.openStart + "," + this.openEnd + ")";
		}
		toJSON() {
			if (!this.content.size) return null;
			let e = { content: this.content.toJSON() };
			return this.openStart > 0 && (e.openStart = this.openStart), this.openEnd > 0 && (e.openEnd = this.openEnd), e;
		}
		static fromJSON(t, n) {
			if (!n) return e.empty;
			let r = n.openStart || 0, i = n.openEnd || 0;
			if (typeof r != "number" || typeof i != "number") throw RangeError("Invalid input for Slice.fromJSON");
			return new e(j.fromJSON(t, n.content), r, i);
		}
		static maxOpen(t, n = !0) {
			let r = 0, i = 0;
			for (let e = t.firstChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.firstChild) r++;
			for (let e = t.lastChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.lastChild) i++;
			return new e(t, r, i);
		}
	}, N.empty = new N(j.empty, 0, 0), Tr = class e {
		constructor(e, t, n) {
			this.pos = e, this.path = t, this.parentOffset = n, this.depth = t.length / 3 - 1;
		}
		resolveDepth(e) {
			return e == null ? this.depth : e < 0 ? this.depth + e : e;
		}
		get parent() {
			return this.node(this.depth);
		}
		get doc() {
			return this.node(0);
		}
		node(e) {
			return this.path[this.resolveDepth(e) * 3];
		}
		index(e) {
			return this.path[this.resolveDepth(e) * 3 + 1];
		}
		indexAfter(e) {
			return e = this.resolveDepth(e), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1);
		}
		start(e) {
			return e = this.resolveDepth(e), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
		}
		end(e) {
			return e = this.resolveDepth(e), this.start(e) + this.node(e).content.size;
		}
		before(e) {
			if (e = this.resolveDepth(e), !e) throw RangeError("There is no position before the top-level node");
			return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
		}
		after(e) {
			if (e = this.resolveDepth(e), !e) throw RangeError("There is no position after the top-level node");
			return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
		}
		get textOffset() {
			return this.pos - this.path[this.path.length - 1];
		}
		get nodeAfter() {
			let e = this.parent, t = this.index(this.depth);
			if (t == e.childCount) return null;
			let n = this.pos - this.path[this.path.length - 1], r = e.child(t);
			return n ? e.child(t).cut(n) : r;
		}
		get nodeBefore() {
			let e = this.index(this.depth), t = this.pos - this.path[this.path.length - 1];
			return t ? this.parent.child(e).cut(0, t) : e == 0 ? null : this.parent.child(e - 1);
		}
		posAtIndex(e, t) {
			t = this.resolveDepth(t);
			let n = this.path[t * 3], r = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
			for (let t = 0; t < e; t++) r += n.child(t).nodeSize;
			return r;
		}
		marks() {
			let e = this.parent, t = this.index();
			if (e.content.size == 0) return M.none;
			if (this.textOffset) return e.child(t).marks;
			let n = e.maybeChild(t - 1), r = e.maybeChild(t);
			if (!n) {
				let e = n;
				n = r, r = e;
			}
			let i = n.marks;
			for (var a = 0; a < i.length; a++) i[a].type.spec.inclusive === !1 && (!r || !i[a].isInSet(r.marks)) && (i = i[a--].removeFromSet(i));
			return i;
		}
		marksAcross(e) {
			let t = this.parent.maybeChild(this.index());
			if (!t || !t.isInline) return null;
			let n = t.marks, r = e.parent.maybeChild(e.index());
			for (var i = 0; i < n.length; i++) n[i].type.spec.inclusive === !1 && (!r || !n[i].isInSet(r.marks)) && (n = n[i--].removeFromSet(n));
			return n;
		}
		sharedDepth(e) {
			for (let t = this.depth; t > 0; t--) if (this.start(t) <= e && this.end(t) >= e) return t;
			return 0;
		}
		blockRange(e = this, t) {
			if (e.pos < this.pos) return e.blockRange(this);
			for (let n = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); n >= 0; n--) if (e.pos <= this.end(n) && (!t || t(this.node(n)))) return new kr(this, e, n);
			return null;
		}
		sameParent(e) {
			return this.pos - this.parentOffset == e.pos - e.parentOffset;
		}
		max(e) {
			return e.pos > this.pos ? e : this;
		}
		min(e) {
			return e.pos < this.pos ? e : this;
		}
		toString() {
			let e = "";
			for (let t = 1; t <= this.depth; t++) e += (e ? "/" : "") + this.node(t).type.name + "_" + this.index(t - 1);
			return e + ":" + this.parentOffset;
		}
		static resolve(t, n) {
			if (!(n >= 0 && n <= t.content.size)) throw RangeError("Position " + n + " out of range");
			let r = [], i = 0, a = n;
			for (let e = t;;) {
				let { index: t, offset: n } = e.content.findIndex(a), o = a - n;
				if (r.push(e, t, i + n), !o || (e = e.child(t), e.isText)) break;
				a = o - 1, i += n + 1;
			}
			return new e(n, r, a);
		}
		static resolveCached(t, n) {
			let r = Or.get(t);
			if (r) for (let e = 0; e < r.elts.length; e++) {
				let t = r.elts[e];
				if (t.pos == n) return t;
			}
			else Or.set(t, r = new Er());
			let i = r.elts[r.i] = e.resolve(t, n);
			return r.i = (r.i + 1) % Dr, i;
		}
	}, Er = class {
		constructor() {
			this.elts = [], this.i = 0;
		}
	}, Dr = 12, Or = /* @__PURE__ */ new WeakMap(), kr = class {
		constructor(e, t, n) {
			this.$from = e, this.$to = t, this.depth = n;
		}
		get start() {
			return this.$from.before(this.depth + 1);
		}
		get end() {
			return this.$to.after(this.depth + 1);
		}
		get parent() {
			return this.$from.node(this.depth);
		}
		get startIndex() {
			return this.$from.index(this.depth);
		}
		get endIndex() {
			return this.$to.indexAfter(this.depth);
		}
	}, Ar = Object.create(null), jr = class e {
		constructor(e, t, n, r = M.none) {
			this.type = e, this.attrs = t, this.marks = r, this.content = n || j.empty;
		}
		get children() {
			return this.content.content;
		}
		get nodeSize() {
			return this.isLeaf ? 1 : 2 + this.content.size;
		}
		get childCount() {
			return this.content.childCount;
		}
		child(e) {
			return this.content.child(e);
		}
		maybeChild(e) {
			return this.content.maybeChild(e);
		}
		forEach(e) {
			this.content.forEach(e);
		}
		nodesBetween(e, t, n, r = 0) {
			this.content.nodesBetween(e, t, n, r, this);
		}
		descendants(e) {
			this.nodesBetween(0, this.content.size, e);
		}
		get textContent() {
			return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
		}
		textBetween(e, t, n, r) {
			return this.content.textBetween(e, t, n, r);
		}
		get firstChild() {
			return this.content.firstChild;
		}
		get lastChild() {
			return this.content.lastChild;
		}
		eq(e) {
			return this == e || this.sameMarkup(e) && this.content.eq(e.content);
		}
		sameMarkup(e) {
			return this.hasMarkup(e.type, e.attrs, e.marks);
		}
		hasMarkup(e, t, n) {
			return this.type == e && Nn(this.attrs, t || e.defaultAttrs || Ar) && M.sameSet(this.marks, n || M.none);
		}
		copy(t = null) {
			return t == this.content ? this : new e(this.type, this.attrs, t, this.marks);
		}
		mark(t) {
			return t == this.marks ? this : new e(this.type, this.attrs, this.content, t);
		}
		cut(e, t = this.content.size) {
			return e == 0 && t == this.content.size ? this : this.copy(this.content.cut(e, t));
		}
		slice(e, t = this.content.size, n = !1) {
			if (e == t) return N.empty;
			let r = this.resolve(e), i = this.resolve(t), a = n ? 0 : r.sharedDepth(t), o = r.start(a), s = r.node(a).content.cut(r.pos - o, i.pos - o);
			return new N(s, r.depth - a, i.depth - a);
		}
		replace(e, t, n) {
			return In(this.resolve(e), this.resolve(t), n);
		}
		nodeAt(e) {
			for (let t = this;;) {
				let { index: n, offset: r } = t.content.findIndex(e);
				if (t = t.maybeChild(n), !t) return null;
				if (r == e || t.isText) return t;
				e -= r + 1;
			}
		}
		childAfter(e) {
			let { index: t, offset: n } = this.content.findIndex(e);
			return {
				node: this.content.maybeChild(t),
				index: t,
				offset: n
			};
		}
		childBefore(e) {
			if (e == 0) return {
				node: null,
				index: 0,
				offset: 0
			};
			let { index: t, offset: n } = this.content.findIndex(e);
			if (n < e) return {
				node: this.content.child(t),
				index: t,
				offset: n
			};
			let r = this.content.child(t - 1);
			return {
				node: r,
				index: t - 1,
				offset: n - r.nodeSize
			};
		}
		resolve(e) {
			return Tr.resolveCached(this, e);
		}
		resolveNoCache(e) {
			return Tr.resolve(this, e);
		}
		rangeHasMark(e, t, n) {
			let r = !1;
			return t > e && this.nodesBetween(e, t, (e) => (n.isInSet(e.marks) && (r = !0), !r)), r;
		}
		get isBlock() {
			return this.type.isBlock;
		}
		get isTextblock() {
			return this.type.isTextblock;
		}
		get inlineContent() {
			return this.type.inlineContent;
		}
		get isInline() {
			return this.type.isInline;
		}
		get isText() {
			return this.type.isText;
		}
		get isLeaf() {
			return this.type.isLeaf;
		}
		get isAtom() {
			return this.type.isAtom;
		}
		toString() {
			if (this.type.spec.toDebugString) return this.type.spec.toDebugString(this);
			let e = this.type.name;
			return this.content.size && (e += "(" + this.content.toStringInner() + ")"), Kn(this.marks, e);
		}
		contentMatchAt(e) {
			let t = this.type.contentMatch.matchFragment(this.content, 0, e);
			if (!t) throw Error("Called contentMatchAt on a node with invalid content");
			return t;
		}
		canReplace(e, t, n = j.empty, r = 0, i = n.childCount) {
			let a = this.contentMatchAt(e).matchFragment(n, r, i), o = a && a.matchFragment(this.content, t);
			if (!o || !o.validEnd) return !1;
			for (let e = r; e < i; e++) if (!this.type.allowsMarks(n.child(e).marks)) return !1;
			return !0;
		}
		canReplaceWith(e, t, n, r) {
			if (r && !this.type.allowsMarks(r)) return !1;
			let i = this.contentMatchAt(e).matchType(n), a = i && i.matchFragment(this.content, t);
			return a ? a.validEnd : !1;
		}
		canAppend(e) {
			return e.content.size ? this.canReplace(this.childCount, this.childCount, e.content) : this.type.compatibleContent(e.type);
		}
		check() {
			this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
			let e = M.none;
			for (let t = 0; t < this.marks.length; t++) {
				let n = this.marks[t];
				n.type.checkAttrs(n.attrs), e = n.addToSet(e);
			}
			if (!M.sameSet(e, this.marks)) throw RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((e) => e.type.name)}`);
			this.content.forEach((e) => e.check());
		}
		toJSON() {
			let e = { type: this.type.name };
			for (let t in this.attrs) {
				e.attrs = this.attrs;
				break;
			}
			return this.content.size && (e.content = this.content.toJSON()), this.marks.length && (e.marks = this.marks.map((e) => e.toJSON())), e;
		}
		static fromJSON(e, t) {
			if (!t) throw RangeError("Invalid input for Node.fromJSON");
			let n;
			if (t.marks) {
				if (!Array.isArray(t.marks)) throw RangeError("Invalid mark data for Node.fromJSON");
				n = t.marks.map(e.markFromJSON);
			}
			if (t.type == "text") {
				if (typeof t.text != "string") throw RangeError("Invalid text node in JSON");
				return e.text(t.text, n);
			}
			let r = j.fromJSON(e, t.content), i = e.nodeType(t.type).create(t.attrs, r, n);
			return i.type.checkAttrs(i.attrs), i;
		}
	}, jr.prototype.text = void 0, Mr = class e extends jr {
		constructor(e, t, n, r) {
			if (super(e, t, null, r), !n) throw RangeError("Empty text nodes are not allowed");
			this.text = n;
		}
		toString() {
			return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : Kn(this.marks, JSON.stringify(this.text));
		}
		get textContent() {
			return this.text;
		}
		textBetween(e, t) {
			return this.text.slice(e, t);
		}
		get nodeSize() {
			return this.text.length;
		}
		mark(t) {
			return t == this.marks ? this : new e(this.type, this.attrs, this.text, t);
		}
		withText(t) {
			return t == this.text ? this : new e(this.type, this.attrs, t, this.marks);
		}
		cut(e = 0, t = this.text.length) {
			return e == 0 && t == this.text.length ? this : this.withText(this.text.slice(e, t));
		}
		eq(e) {
			return this.sameMarkup(e) && this.text == e.text;
		}
		toJSON() {
			let e = super.toJSON();
			return e.text = this.text, e;
		}
	}, Nr = class e {
		constructor(e) {
			this.validEnd = e, this.next = [], this.wrapCache = [];
		}
		static parse(t, n) {
			let r = new Pr(t, n);
			if (r.next == null) return e.empty;
			let i = qn(r);
			r.next && r.err("Unexpected trailing text");
			let a = rr(er(i));
			return ir(a, r), a;
		}
		matchType(e) {
			for (let t = 0; t < this.next.length; t++) if (this.next[t].type == e) return this.next[t].next;
			return null;
		}
		matchFragment(e, t = 0, n = e.childCount) {
			let r = this;
			for (let i = t; r && i < n; i++) r = r.matchType(e.child(i).type);
			return r;
		}
		get inlineContent() {
			return this.next.length != 0 && this.next[0].type.isInline;
		}
		get defaultType() {
			for (let e = 0; e < this.next.length; e++) {
				let { type: t } = this.next[e];
				if (!(t.isText || t.hasRequiredAttrs())) return t;
			}
			return null;
		}
		compatible(e) {
			for (let t = 0; t < this.next.length; t++) for (let n = 0; n < e.next.length; n++) if (this.next[t].type == e.next[n].type) return !0;
			return !1;
		}
		fillBefore(e, t = !1, n = 0) {
			let r = [this];
			function i(a, o) {
				let s = a.matchFragment(e, n);
				if (s && (!t || s.validEnd)) return j.from(o.map((e) => e.createAndFill()));
				for (let e = 0; e < a.next.length; e++) {
					let { type: t, next: n } = a.next[e];
					if (!(t.isText || t.hasRequiredAttrs()) && r.indexOf(n) == -1) {
						r.push(n);
						let e = i(n, o.concat(t));
						if (e) return e;
					}
				}
				return null;
			}
			return i(this, []);
		}
		findWrapping(e) {
			for (let t = 0; t < this.wrapCache.length; t += 2) if (this.wrapCache[t] == e) return this.wrapCache[t + 1];
			let t = this.computeWrapping(e);
			return this.wrapCache.push(e, t), t;
		}
		computeWrapping(e) {
			let t = Object.create(null), n = [{
				match: this,
				type: null,
				via: null
			}];
			for (; n.length;) {
				let r = n.shift(), i = r.match;
				if (i.matchType(e)) {
					let e = [];
					for (let t = r; t.type; t = t.via) e.push(t.type);
					return e.reverse();
				}
				for (let e = 0; e < i.next.length; e++) {
					let { type: a, next: o } = i.next[e];
					!a.isLeaf && !a.hasRequiredAttrs() && !(a.name in t) && (!r.type || o.validEnd) && (n.push({
						match: a.contentMatch,
						type: a,
						via: r
					}), t[a.name] = !0);
				}
			}
			return null;
		}
		get edgeCount() {
			return this.next.length;
		}
		edge(e) {
			if (e >= this.next.length) throw RangeError(`There's no ${e}th edge in this content match`);
			return this.next[e];
		}
		toString() {
			let e = [];
			function t(n) {
				e.push(n);
				for (let r = 0; r < n.next.length; r++) e.indexOf(n.next[r].next) == -1 && t(n.next[r].next);
			}
			return t(this), e.map((t, n) => {
				let r = n + (t.validEnd ? "*" : " ") + " ";
				for (let n = 0; n < t.next.length; n++) r += (n ? ", " : "") + t.next[n].type.name + "->" + e.indexOf(t.next[n].next);
				return r;
			}).join("\n");
		}
	}, Nr.empty = new Nr(!0), Pr = class {
		constructor(e, t) {
			this.string = e, this.nodeTypes = t, this.inline = null, this.pos = 0, this.tokens = e.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
		}
		get next() {
			return this.tokens[this.pos];
		}
		eat(e) {
			return this.next == e && (this.pos++ || !0);
		}
		err(e) {
			throw SyntaxError(e + " (in content expression '" + this.string + "')");
		}
	}, Fr = class e {
		constructor(e, t, n) {
			this.name = e, this.schema = t, this.spec = n, this.markSet = null, this.groups = n.group ? n.group.split(" ") : [], this.attrs = cr(e, n.attrs), this.defaultAttrs = ar(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(n.inline || e == "text"), this.isText = e == "text";
		}
		get isInline() {
			return !this.isBlock;
		}
		get isTextblock() {
			return this.isBlock && this.inlineContent;
		}
		get isLeaf() {
			return this.contentMatch == Nr.empty;
		}
		get isAtom() {
			return this.isLeaf || !!this.spec.atom;
		}
		isInGroup(e) {
			return this.groups.indexOf(e) > -1;
		}
		get whitespace() {
			return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
		}
		hasRequiredAttrs() {
			for (let e in this.attrs) if (this.attrs[e].isRequired) return !0;
			return !1;
		}
		compatibleContent(e) {
			return this == e || this.contentMatch.compatible(e.contentMatch);
		}
		computeAttrs(e) {
			return !e && this.defaultAttrs ? this.defaultAttrs : or(this.attrs, e);
		}
		create(e = null, t, n) {
			if (this.isText) throw Error("NodeType.create can't construct text nodes");
			return new jr(this, this.computeAttrs(e), j.from(t), M.setFrom(n));
		}
		createChecked(e = null, t, n) {
			return t = j.from(t), this.checkContent(t), new jr(this, this.computeAttrs(e), t, M.setFrom(n));
		}
		createAndFill(e = null, t, n) {
			if (e = this.computeAttrs(e), t = j.from(t), t.size) {
				let e = this.contentMatch.fillBefore(t);
				if (!e) return null;
				t = e.append(t);
			}
			let r = this.contentMatch.matchFragment(t), i = r && r.fillBefore(j.empty, !0);
			return i ? new jr(this, e, t.append(i), M.setFrom(n)) : null;
		}
		validContent(e) {
			let t = this.contentMatch.matchFragment(e);
			if (!t || !t.validEnd) return !1;
			for (let t = 0; t < e.childCount; t++) if (!this.allowsMarks(e.child(t).marks)) return !1;
			return !0;
		}
		checkContent(e) {
			if (!this.validContent(e)) throw RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
		}
		checkAttrs(e) {
			sr(this.attrs, e, "node", this.name);
		}
		allowsMarkType(e) {
			return this.markSet == null || this.markSet.indexOf(e) > -1;
		}
		allowsMarks(e) {
			if (this.markSet == null) return !0;
			for (let t = 0; t < e.length; t++) if (!this.allowsMarkType(e[t].type)) return !1;
			return !0;
		}
		allowedMarks(e) {
			if (this.markSet == null) return e;
			let t;
			for (let n = 0; n < e.length; n++) this.allowsMarkType(e[n].type) ? t && t.push(e[n]) : t ||= e.slice(0, n);
			return t ? t.length ? t : M.none : e;
		}
		static compile(t, n) {
			let r = Object.create(null);
			t.forEach((t, i) => r[t] = new e(t, n, i));
			let i = n.spec.topNode || "doc";
			if (!r[i]) throw RangeError("Schema is missing its top node type ('" + i + "')");
			if (!r.text) throw RangeError("Every schema needs a 'text' type");
			for (let e in r.text.attrs) throw RangeError("The text node type should not have attributes");
			return r;
		}
	}, Ir = class {
		constructor(e, t, n) {
			this.hasDefault = Object.prototype.hasOwnProperty.call(n, "default"), this.default = n.default, this.validate = typeof n.validate == "string" ? lr(e, t, n.validate) : n.validate;
		}
		get isRequired() {
			return !this.hasDefault;
		}
	}, Lr = class e {
		constructor(e, t, n, r) {
			this.name = e, this.rank = t, this.schema = n, this.spec = r, this.attrs = cr(e, r.attrs), this.excluded = null;
			let i = ar(this.attrs);
			this.instance = i ? new M(this, i) : null;
		}
		create(e = null) {
			return !e && this.instance ? this.instance : new M(this, or(this.attrs, e));
		}
		static compile(t, n) {
			let r = Object.create(null), i = 0;
			return t.forEach((t, a) => r[t] = new e(t, i++, n, a)), r;
		}
		removeFromSet(e) {
			for (var t = 0; t < e.length; t++) e[t].type == this && (e = e.slice(0, t).concat(e.slice(t + 1)), t--);
			return e;
		}
		isInSet(e) {
			for (let t = 0; t < e.length; t++) if (e[t].type == this) return e[t];
		}
		checkAttrs(e) {
			sr(this.attrs, e, "mark", this.name);
		}
		excludes(e) {
			return this.excluded.indexOf(e) > -1;
		}
	}, Rr = class {
		constructor(e) {
			this.linebreakReplacement = null, this.cached = Object.create(null);
			let t = this.spec = {};
			for (let n in e) t[n] = e[n];
			t.nodes = En.from(e.nodes), t.marks = En.from(e.marks || {}), this.nodes = Fr.compile(this.spec.nodes, this), this.marks = Lr.compile(this.spec.marks, this);
			let n = Object.create(null);
			for (let e in this.nodes) {
				if (e in this.marks) throw RangeError(e + " can not be both a node and a mark");
				let t = this.nodes[e], r = t.spec.content || "", i = t.spec.marks;
				if (t.contentMatch = n[r] || (n[r] = Nr.parse(r, this.nodes)), t.inlineContent = t.contentMatch.inlineContent, t.spec.linebreakReplacement) {
					if (this.linebreakReplacement) throw RangeError("Multiple linebreak nodes defined");
					if (!t.isInline || !t.isLeaf) throw RangeError("Linebreak replacement nodes must be inline leaf nodes");
					this.linebreakReplacement = t;
				}
				t.markSet = i == "_" ? null : i ? ur(this, i.split(" ")) : i == "" || !t.inlineContent ? [] : null;
			}
			for (let e in this.marks) {
				let t = this.marks[e], n = t.spec.excludes;
				t.excluded = n == null ? [t] : n == "" ? [] : ur(this, n.split(" "));
			}
			this.nodeFromJSON = (e) => jr.fromJSON(this, e), this.markFromJSON = (e) => M.fromJSON(this, e), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = Object.create(null);
		}
		node(e, t = null, n, r) {
			if (typeof e == "string") e = this.nodeType(e);
			else if (!(e instanceof Fr)) throw RangeError("Invalid node type: " + e);
			else if (e.schema != this) throw RangeError("Node type from different schema used (" + e.name + ")");
			return e.createChecked(t, n, r);
		}
		text(e, t) {
			let n = this.nodes.text;
			return new Mr(n, n.defaultAttrs, e, M.setFrom(t));
		}
		mark(e, t) {
			return typeof e == "string" && (e = this.marks[e]), e.create(t);
		}
		nodeType(e) {
			let t = this.nodes[e];
			if (!t) throw RangeError("Unknown node type: " + e);
			return t;
		}
	}, zr = class e {
		constructor(e, t) {
			this.schema = e, this.rules = t, this.tags = [], this.styles = [];
			let n = this.matchedStyles = [];
			t.forEach((e) => {
				if (dr(e)) this.tags.push(e);
				else if (fr(e)) {
					let t = /[^=]*/.exec(e.style)[0];
					n.indexOf(t) < 0 && n.push(t), this.styles.push(e);
				}
			}), this.normalizeLists = !this.tags.some((t) => {
				if (!/^(ul|ol)\b/.test(t.tag) || !t.node) return !1;
				let n = e.nodes[t.node];
				return n.contentMatch.matchType(n);
			});
		}
		parse(e, t = {}) {
			let n = new qr(this, t, !1);
			return n.addAll(e, M.none, t.from, t.to), n.finish();
		}
		parseSlice(e, t = {}) {
			let n = new qr(this, t, !0);
			return n.addAll(e, M.none, t.from, t.to), N.maxOpen(n.finish());
		}
		matchTag(e, t, n) {
			for (let r = n ? this.tags.indexOf(n) + 1 : 0; r < this.tags.length; r++) {
				let n = this.tags[r];
				if (hr(e, n.tag) && (n.namespace === void 0 || e.namespaceURI == n.namespace) && (!n.context || t.matchesContext(n.context))) {
					if (n.getAttrs) {
						let t = n.getAttrs(e);
						if (t === !1) continue;
						n.attrs = t || void 0;
					}
					return n;
				}
			}
		}
		matchStyle(e, t, n, r) {
			for (let i = r ? this.styles.indexOf(r) + 1 : 0; i < this.styles.length; i++) {
				let r = this.styles[i], a = r.style;
				if (!(a.indexOf(e) != 0 || r.context && !n.matchesContext(r.context) || a.length > e.length && (a.charCodeAt(e.length) != 61 || a.slice(e.length + 1) != t))) {
					if (r.getAttrs) {
						let e = r.getAttrs(t);
						if (e === !1) continue;
						r.attrs = e || void 0;
					}
					return r;
				}
			}
		}
		static schemaRules(e) {
			let t = [];
			function n(e) {
				let n = e.priority == null ? 50 : e.priority, r = 0;
				for (; r < t.length; r++) {
					let e = t[r];
					if ((e.priority == null ? 50 : e.priority) < n) break;
				}
				t.splice(r, 0, e);
			}
			for (let t in e.marks) {
				let r = e.marks[t].spec.parseDOM;
				r && r.forEach((e) => {
					n(e = gr(e)), e.mark || e.ignore || e.clearMark || (e.mark = t);
				});
			}
			for (let t in e.nodes) {
				let r = e.nodes[t].spec.parseDOM;
				r && r.forEach((e) => {
					n(e = gr(e)), e.node || e.ignore || e.mark || (e.node = t);
				});
			}
			return t;
		}
		static fromSchema(t) {
			return t.cached.domParser || (t.cached.domParser = new e(t, e.schemaRules(t)));
		}
	}, Br = {
		address: !0,
		article: !0,
		aside: !0,
		blockquote: !0,
		body: !0,
		canvas: !0,
		dd: !0,
		div: !0,
		dl: !0,
		fieldset: !0,
		figcaption: !0,
		figure: !0,
		footer: !0,
		form: !0,
		h1: !0,
		h2: !0,
		h3: !0,
		h4: !0,
		h5: !0,
		h6: !0,
		header: !0,
		hgroup: !0,
		hr: !0,
		li: !0,
		noscript: !0,
		ol: !0,
		output: !0,
		p: !0,
		pre: !0,
		section: !0,
		table: !0,
		tfoot: !0,
		ul: !0
	}, Vr = {
		head: !0,
		noscript: !0,
		object: !0,
		script: !0,
		style: !0,
		title: !0
	}, Hr = {
		ol: !0,
		ul: !0
	}, Ur = 1, Wr = 2, Gr = 4, Kr = class {
		constructor(e, t, n, r, i, a) {
			this.type = e, this.attrs = t, this.marks = n, this.solid = r, this.options = a, this.content = [], this.activeMarks = M.none, this.match = i || (a & Gr ? null : e.contentMatch);
		}
		findWrapping(e) {
			if (!this.match) {
				if (!this.type) return [];
				let t = this.type.contentMatch.fillBefore(j.from(e));
				if (t) this.match = this.type.contentMatch.matchFragment(t);
				else {
					let t = this.type.contentMatch, n;
					return (n = t.findWrapping(e.type)) ? (this.match = t, n) : null;
				}
			}
			return this.match.findWrapping(e.type);
		}
		finish(e) {
			if (!(this.options & Ur)) {
				let e = this.content[this.content.length - 1], t;
				if (e && e.isText && (t = /[ \t\r\n\u000c]+$/.exec(e.text))) {
					let n = e;
					e.text.length == t[0].length ? this.content.pop() : this.content[this.content.length - 1] = n.withText(n.text.slice(0, n.text.length - t[0].length));
				}
			}
			let t = j.from(this.content);
			return !e && this.match && (t = t.append(this.match.fillBefore(j.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
		}
		inlineContext(e) {
			return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !Br.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
		}
	}, qr = class {
		constructor(e, t, n) {
			this.parser = e, this.options = t, this.isOpen = n, this.open = 0, this.localPreserveWS = !1;
			let r = t.topNode, i, a = pr(null, t.preserveWhitespace, 0) | (n ? Gr : 0);
			i = r ? new Kr(r.type, r.attrs, M.none, !0, t.topMatch || r.type.contentMatch, a) : n ? new Kr(null, null, M.none, !0, null, a) : new Kr(e.schema.topNodeType, null, M.none, !0, null, a), this.nodes = [i], this.find = t.findPositions, this.needsBlock = !1;
		}
		get top() {
			return this.nodes[this.open];
		}
		addDOM(e, t) {
			e.nodeType == 3 ? this.addTextNode(e, t) : e.nodeType == 1 && this.addElement(e, t);
		}
		addTextNode(e, t) {
			let n = e.nodeValue, r = this.top, i = r.options & Wr ? "full" : this.localPreserveWS || (r.options & Ur) > 0, { schema: a } = this.parser;
			if (i === "full" || r.inlineContext(e) || /[^ \t\r\n\u000c]/.test(n)) {
				if (!i) {
					if (n = n.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(n) && this.open == this.nodes.length - 1) {
						let t = r.content[r.content.length - 1], i = e.previousSibling;
						(!t || i && i.nodeName == "BR" || t.isText && /[ \t\r\n\u000c]$/.test(t.text)) && (n = n.slice(1));
					}
				} else if (i === "full") n = n.replace(/\r\n?/g, "\n");
				else if (a.linebreakReplacement && /[\r\n]/.test(n) && this.top.findWrapping(a.linebreakReplacement.create())) {
					let e = n.split(/\r?\n|\r/);
					for (let n = 0; n < e.length; n++) n && this.insertNode(a.linebreakReplacement.create(), t, !0), e[n] && this.insertNode(a.text(e[n]), t, !/\S/.test(e[n]));
					n = "";
				} else n = n.replace(/\r?\n|\r/g, " ");
				n && this.insertNode(a.text(n), t, !/\S/.test(n)), this.findInText(e);
			} else this.findInside(e);
		}
		addElement(e, t, n) {
			let r = this.localPreserveWS, i = this.top;
			(e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
			let a = e.nodeName.toLowerCase(), o;
			Hr.hasOwnProperty(a) && this.parser.normalizeLists && mr(e);
			let s = this.options.ruleFromNode && this.options.ruleFromNode(e) || (o = this.parser.matchTag(e, this, n));
			out: if (s ? s.ignore : Vr.hasOwnProperty(a)) this.findInside(e), this.ignoreFallback(e, t);
			else if (!s || s.skip || s.closeParent) {
				s && s.closeParent ? this.open = Math.max(0, this.open - 1) : s && s.skip.nodeType && (e = s.skip);
				let n, r = this.needsBlock;
				if (Br.hasOwnProperty(a)) i.content.length && i.content[0].isInline && this.open && (this.open--, i = this.top), n = !0, i.type || (this.needsBlock = !0);
				else if (!e.firstChild) {
					this.leafFallback(e, t);
					break out;
				}
				let o = s && s.skip ? t : this.readStyles(e, t);
				o && this.addAll(e, o), n && this.sync(i), this.needsBlock = r;
			} else {
				let n = this.readStyles(e, t);
				n && this.addElementByRule(e, s, n, s.consuming === !1 ? o : void 0);
			}
			this.localPreserveWS = r;
		}
		leafFallback(e, t) {
			e.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(e.ownerDocument.createTextNode("\n"), t);
		}
		ignoreFallback(e, t) {
			e.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), t, !0);
		}
		readStyles(e, t) {
			let n = e.style;
			if (n && n.length) for (let e = 0; e < this.parser.matchedStyles.length; e++) {
				let r = this.parser.matchedStyles[e], i = n.getPropertyValue(r);
				if (i) for (let e;;) {
					let n = this.parser.matchStyle(r, i, this, e);
					if (!n) break;
					if (n.ignore) return null;
					if (t = n.clearMark ? t.filter((e) => !n.clearMark(e)) : t.concat(this.parser.schema.marks[n.mark].create(n.attrs)), n.consuming === !1) e = n;
					else break;
				}
			}
			return t;
		}
		addElementByRule(e, t, n, r) {
			let i, a;
			if (t.node) if (a = this.parser.schema.nodes[t.node], a.isLeaf) this.insertNode(a.create(t.attrs), n, e.nodeName == "BR") || this.leafFallback(e, n);
			else {
				let e = this.enter(a, t.attrs || null, n, t.preserveWhitespace);
				e && (i = !0, n = e);
			}
			else {
				let e = this.parser.schema.marks[t.mark];
				n = n.concat(e.create(t.attrs));
			}
			let o = this.top;
			if (a && a.isLeaf) this.findInside(e);
			else if (r) this.addElement(e, n, r);
			else if (t.getContent) this.findInside(e), t.getContent(e, this.parser.schema).forEach((e) => this.insertNode(e, n, !1));
			else {
				let r = e;
				typeof t.contentElement == "string" ? r = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? r = t.contentElement(e) : t.contentElement && (r = t.contentElement), this.findAround(e, r, !0), this.addAll(r, n), this.findAround(e, r, !1);
			}
			i && this.sync(o) && this.open--;
		}
		addAll(e, t, n, r) {
			let i = n || 0;
			for (let a = n ? e.childNodes[n] : e.firstChild, o = r == null ? null : e.childNodes[r]; a != o; a = a.nextSibling, ++i) this.findAtPoint(e, i), this.addDOM(a, t);
			this.findAtPoint(e, i);
		}
		findPlace(e, t, n) {
			let r, i;
			for (let t = this.open, a = 0; t >= 0; t--) {
				let o = this.nodes[t], s = o.findWrapping(e);
				if (s && (!r || r.length > s.length + a) && (r = s, i = o, !s.length)) break;
				if (o.solid) {
					if (n) break;
					a += 2;
				}
			}
			if (!r) return null;
			this.sync(i);
			for (let e = 0; e < r.length; e++) t = this.enterInner(r[e], null, t, !1);
			return t;
		}
		insertNode(e, t, n) {
			if (e.isInline && this.needsBlock && !this.top.type) {
				let e = this.textblockFromContext();
				e && (t = this.enterInner(e, null, t));
			}
			let r = this.findPlace(e, t, n);
			if (r) {
				this.closeExtra();
				let t = this.top;
				t.match &&= t.match.matchType(e.type);
				let n = M.none;
				for (let i of r.concat(e.marks)) (t.type ? t.type.allowsMarkType(i.type) : _r(i.type, e.type)) && (n = i.addToSet(n));
				return t.content.push(e.mark(n)), !0;
			}
			return !1;
		}
		enter(e, t, n, r) {
			let i = this.findPlace(e.create(t), n, !1);
			return i &&= this.enterInner(e, t, n, !0, r), i;
		}
		enterInner(e, t, n, r = !1, i) {
			this.closeExtra();
			let a = this.top;
			a.match = a.match && a.match.matchType(e);
			let o = pr(e, i, a.options);
			a.options & Gr && a.content.length == 0 && (o |= Gr);
			let s = M.none;
			return n = n.filter((t) => !(a.type ? a.type.allowsMarkType(t.type) : _r(t.type, e)) || (s = t.addToSet(s), !1)), this.nodes.push(new Kr(e, t, s, r, null, o)), this.open++, n;
		}
		closeExtra(e = !1) {
			let t = this.nodes.length - 1;
			if (t > this.open) {
				for (; t > this.open; t--) this.nodes[t - 1].content.push(this.nodes[t].finish(e));
				this.nodes.length = this.open + 1;
			}
		}
		finish() {
			return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
		}
		sync(e) {
			for (let t = this.open; t >= 0; t--) if (this.nodes[t] == e) return this.open = t, !0;
			else this.localPreserveWS && (this.nodes[t].options |= Ur);
			return !1;
		}
		get currentPos() {
			this.closeExtra();
			let e = 0;
			for (let t = this.open; t >= 0; t--) {
				let n = this.nodes[t].content;
				for (let t = n.length - 1; t >= 0; t--) e += n[t].nodeSize;
				t && e++;
			}
			return e;
		}
		findAtPoint(e, t) {
			if (this.find) for (let n = 0; n < this.find.length; n++) this.find[n].node == e && this.find[n].offset == t && (this.find[n].pos = this.currentPos);
		}
		findInside(e) {
			if (this.find) for (let t = 0; t < this.find.length; t++) this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
		}
		findAround(e, t, n) {
			if (e != t && this.find) for (let r = 0; r < this.find.length; r++) this.find[r].pos == null && e.nodeType == 1 && e.contains(this.find[r].node) && t.compareDocumentPosition(this.find[r].node) & (n ? 2 : 4) && (this.find[r].pos = this.currentPos);
		}
		findInText(e) {
			if (this.find) for (let t = 0; t < this.find.length; t++) this.find[t].node == e && (this.find[t].pos = this.currentPos - (e.nodeValue.length - this.find[t].offset));
		}
		matchesContext(e) {
			if (e.indexOf("|") > -1) return e.split(/\s*\|\s*/).some(this.matchesContext, this);
			let t = e.split("/"), n = this.options.context, r = !this.isOpen && (!n || n.parent.type == this.nodes[0].type), i = -(n ? n.depth + 1 : 0) + +!r, a = (e, o) => {
				for (; e >= 0; e--) {
					let s = t[e];
					if (s == "") {
						if (e == t.length - 1 || e == 0) continue;
						for (; o >= i; o--) if (a(e - 1, o)) return !0;
						return !1;
					}
					{
						let e = o > 0 || o == 0 && r ? this.nodes[o].type : n && o >= i ? n.node(o - i).type : null;
						if (!e || e.name != s && !e.isInGroup(s)) return !1;
						o--;
					}
				}
				return !0;
			};
			return a(t.length - 1, this.open);
		}
		textblockFromContext() {
			let e = this.options.context;
			if (e) for (let t = e.depth; t >= 0; t--) {
				let n = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
				if (n && n.isTextblock && n.defaultAttrs) return n;
			}
			for (let e in this.parser.schema.nodes) {
				let t = this.parser.schema.nodes[e];
				if (t.isTextblock && t.defaultAttrs) return t;
			}
		}
	}, Jr = class e {
		constructor(e, t) {
			this.nodes = e, this.marks = t;
		}
		serializeFragment(e, t = {}, n) {
			n ||= yr(t).createDocumentFragment();
			let r = n, i = [];
			return e.forEach((e) => {
				if (i.length || e.marks.length) {
					let n = 0, a = 0;
					for (; n < i.length && a < e.marks.length;) {
						let t = e.marks[a];
						if (!this.marks[t.type.name]) {
							a++;
							continue;
						}
						if (!t.eq(i[n][0]) || t.type.spec.spanning === !1) break;
						n++, a++;
					}
					for (; n < i.length;) r = i.pop()[1];
					for (; a < e.marks.length;) {
						let n = e.marks[a++], o = this.serializeMark(n, e.isInline, t);
						o && (i.push([n, r]), r.appendChild(o.dom), r = o.contentDOM || o.dom);
					}
				}
				r.appendChild(this.serializeNodeInner(e, t));
			}), n;
		}
		serializeNodeInner(e, t) {
			if (e.isText) return yr(t).createTextNode(e.text);
			let { dom: n, contentDOM: r } = Sr(yr(t), this.nodes[e.type.name](e), null, e.attrs);
			if (r) {
				if (e.isLeaf) throw RangeError("Content hole not allowed in a leaf node spec");
				this.serializeFragment(e.content, t, r);
			}
			return n;
		}
		serializeNode(e, t = {}) {
			let n = this.serializeNodeInner(e, t);
			for (let r = e.marks.length - 1; r >= 0; r--) {
				let i = this.serializeMark(e.marks[r], e.isInline, t);
				i && ((i.contentDOM || i.dom).appendChild(n), n = i.dom);
			}
			return n;
		}
		serializeMark(e, t, n = {}) {
			let r = this.marks[e.type.name];
			return r && Sr(yr(n), r(e, t), null, e.attrs);
		}
		static renderSpec(e, t, n = null, r) {
			return typeof t == "string" ? { dom: e.createTextNode(t) } : Sr(e, t, n, r);
		}
		static fromSchema(t) {
			return t.cached.domSerializer || (t.cached.domSerializer = new e(this.nodesFromSchema(t), this.marksFromSchema(t)));
		}
		static nodesFromSchema(e) {
			let t = vr(e.nodes);
			return t.text ||= (e) => e.text, t;
		}
		static marksFromSchema(e) {
			return vr(e.marks);
		}
	}, Yr = /* @__PURE__ */ new WeakMap();
}));
//#endregion
//#region ../../node_modules/prosemirror-transform/dist/index.js
function Zr(e, t) {
	return e + t * Hi;
}
function Qr(e) {
	return e & Vi;
}
function $r(e) {
	return (e - (e & Vi)) / Hi;
}
function ei(e, t, n) {
	let r = [];
	for (let i = 0; i < e.childCount; i++) {
		let a = e.child(i);
		a.content.size && (a = a.copy(ei(a.content, t, a))), a.isInline && (a = t(a, n, i)), r.push(a);
	}
	return j.fromArray(r);
}
function ti(e, t, n) {
	let r = e.resolve(t), i = n - t, a = r.depth;
	for (; i > 0 && a > 0 && r.indexAfter(a) == r.node(a).childCount;) a--, i--;
	if (i > 0) {
		let e = r.node(a).maybeChild(r.indexAfter(a));
		for (; i > 0;) {
			if (!e || e.isLeaf) return !0;
			e = e.firstChild, i--;
		}
	}
	return !1;
}
function ni(e, t, n, r) {
	let i = [], a = [], o, s;
	e.doc.nodesBetween(t, n, (e, c, l) => {
		if (!e.isInline) return;
		let u = e.marks;
		if (!r.isInSet(u) && l.type.allowsMarkType(r.type)) {
			let l = Math.max(c, t), d = Math.min(c + e.nodeSize, n), f = r.addToSet(u);
			for (let e = 0; e < u.length; e++) u[e].isInSet(f) || (o && o.to == l && o.mark.eq(u[e]) ? o.to = d : i.push(o = new ea(l, d, u[e])));
			s && s.to == l ? s.to = d : a.push(s = new $i(l, d, r));
		}
	}), i.forEach((t) => e.step(t)), a.forEach((t) => e.step(t));
}
function ri(e, t, n, r) {
	let i = [], a = 0;
	e.doc.nodesBetween(t, n, (e, o) => {
		if (!e.isInline) return;
		a++;
		let s = null;
		if (r instanceof Lr) {
			let t = e.marks, n;
			for (; n = r.isInSet(t);) (s ||= []).push(n), t = n.removeFromSet(t);
		} else r ? r.isInSet(e.marks) && (s = [r]) : s = e.marks;
		if (s && s.length) {
			let r = Math.min(o + e.nodeSize, n);
			for (let e = 0; e < s.length; e++) {
				let n = s[e], c;
				for (let e = 0; e < i.length; e++) {
					let t = i[e];
					t.step == a - 1 && n.eq(i[e].style) && (c = t);
				}
				c ? (c.to = r, c.step = a) : i.push({
					style: n,
					from: Math.max(o, t),
					to: r,
					step: a
				});
			}
		}
	}), i.forEach((t) => e.step(new ea(t.from, t.to, t.style)));
}
function ii(e, t, n, r = n.contentMatch, i = !0) {
	let a = e.doc.nodeAt(t), o = [], s = t + 1;
	for (let t = 0; t < a.childCount; t++) {
		let c = a.child(t), l = s + c.nodeSize, u = r.matchType(c.type);
		if (!u) o.push(new ra(s, l, N.empty));
		else {
			r = u;
			for (let t = 0; t < c.marks.length; t++) n.allowsMarkType(c.marks[t].type) || e.step(new ea(s, l, c.marks[t]));
			if (i && c.isText && n.whitespace != "pre") {
				let e, t = /\r?\n|\r/g, r;
				for (; e = t.exec(c.text);) r ||= new N(j.from(n.schema.text(" ", n.allowedMarks(c.marks))), 0, 0), o.push(new ra(s + e.index, s + e.index + e[0].length, r));
			}
		}
		s = l;
	}
	if (!r.validEnd) {
		let t = r.fillBefore(j.empty, !0);
		e.replace(s, s, new N(t, 0, 0));
	}
	for (let t = o.length - 1; t >= 0; t--) e.step(o[t]);
}
function ai(e, t, n) {
	return (t == 0 || e.canReplace(t, e.childCount)) && (n == e.childCount || e.canReplace(0, n));
}
function oi(e) {
	let t = e.parent.content.cutByIndex(e.startIndex, e.endIndex);
	for (let n = e.depth, r = 0, i = 0;; --n) {
		let a = e.$from.node(n), o = e.$from.index(n) + r, s = e.$to.indexAfter(n) - i;
		if (n < e.depth && a.canReplace(o, s, t)) return n;
		if (n == 0 || a.type.spec.isolating || !ai(a, o, s)) break;
		o && (r = 1), s < a.childCount && (i = 1);
	}
	return null;
}
function si(e, t, n) {
	let { $from: r, $to: i, depth: a } = t, o = r.before(a + 1), s = i.after(a + 1), c = o, l = s, u = j.empty, d = 0;
	for (let e = a, t = !1; e > n; e--) t || r.index(e) > 0 ? (t = !0, u = j.from(r.node(e).copy(u)), d++) : c--;
	let f = j.empty, p = 0;
	for (let e = a, t = !1; e > n; e--) t || i.after(e + 1) < i.end(e) ? (t = !0, f = j.from(i.node(e).copy(f)), p++) : l++;
	e.step(new ia(c, l, o, s, new N(u.append(f), d, p), u.size - d, !0));
}
function ci(e, t, n = null, r = e) {
	let i = ui(e, t), a = i && di(r, t);
	return a ? i.map(li).concat({
		type: t,
		attrs: n
	}).concat(a.map(li)) : null;
}
function li(e) {
	return {
		type: e,
		attrs: null
	};
}
function ui(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.contentMatchAt(r).findWrapping(t);
	if (!a) return null;
	let o = a.length ? a[0] : t;
	return n.canReplaceWith(r, i, o) ? a : null;
}
function di(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.child(r), o = t.contentMatch.findWrapping(a.type);
	if (!o) return null;
	let s = (o.length ? o[o.length - 1] : t).contentMatch;
	for (let e = r; s && e < i; e++) s = s.matchType(n.child(e).type);
	return !s || !s.validEnd ? null : o;
}
function fi(e, t, n) {
	let r = j.empty;
	for (let e = n.length - 1; e >= 0; e--) {
		if (r.size) {
			let t = n[e].type.contentMatch.matchFragment(r);
			if (!t || !t.validEnd) throw RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
		}
		r = j.from(n[e].type.create(n[e].attrs, r));
	}
	let i = t.start, a = t.end;
	e.step(new ia(i, a, i, a, new N(r, 0, 0), n.length, !0));
}
function pi(e, t, n, r, i) {
	if (!r.isTextblock) throw RangeError("Type given to setBlockType should be a textblock");
	let a = e.steps.length;
	e.doc.nodesBetween(t, n, (t, n) => {
		let o = typeof i == "function" ? i(t) : i;
		if (t.isTextblock && !t.hasMarkup(r, o) && gi(e.doc, e.mapping.slice(a).map(n), r)) {
			let i = null;
			if (r.schema.linebreakReplacement) {
				let e = r.whitespace == "pre", t = !!r.contentMatch.matchType(r.schema.linebreakReplacement);
				e && !t ? i = !1 : !e && t && (i = !0);
			}
			i === !1 && hi(e, t, n, a), ii(e, e.mapping.slice(a).map(n, 1), r, void 0, i === null);
			let s = e.mapping.slice(a), c = s.map(n, 1), l = s.map(n + t.nodeSize, 1);
			return e.step(new ia(c, l, c + 1, l - 1, new N(j.from(r.create(o, null, t.marks)), 0, 0), 1, !0)), i === !0 && mi(e, t, n, a), !1;
		}
	});
}
function mi(e, t, n, r) {
	t.forEach((i, a) => {
		if (i.isText) {
			let o, s = /\r?\n|\r/g;
			for (; o = s.exec(i.text);) {
				let i = e.mapping.slice(r).map(n + 1 + a + o.index);
				e.replaceWith(i, i + 1, t.type.schema.linebreakReplacement.create());
			}
		}
	});
}
function hi(e, t, n, r) {
	t.forEach((i, a) => {
		if (i.type == i.type.schema.linebreakReplacement) {
			let i = e.mapping.slice(r).map(n + 1 + a);
			e.replaceWith(i, i + 1, t.type.schema.text("\n"));
		}
	});
}
function gi(e, t, n) {
	let r = e.resolve(t), i = r.index();
	return r.parent.canReplaceWith(i, i + 1, n);
}
function _i(e, t, n, r, i) {
	let a = e.doc.nodeAt(t);
	if (!a) throw RangeError("No node at given position");
	n ||= a.type;
	let o = n.create(r, null, i || a.marks);
	if (a.isLeaf) return e.replaceWith(t, t + a.nodeSize, o);
	if (!n.validContent(a.content)) throw RangeError("Invalid content for node type " + n.name);
	e.step(new ia(t, t + a.nodeSize, t + 1, t + a.nodeSize - 1, new N(j.from(o), 0, 0), 1, !0));
}
function vi(e, t, n = 1, r) {
	let i = e.resolve(t), a = i.depth - n, o = r && r[r.length - 1] || i.parent;
	if (a < 0 || i.parent.type.spec.isolating || !i.parent.canReplace(i.index(), i.parent.childCount) || !o.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount))) return !1;
	for (let e = i.depth - 1, t = n - 2; e > a; e--, t--) {
		let n = i.node(e), a = i.index(e);
		if (n.type.spec.isolating) return !1;
		let o = n.content.cutByIndex(a, n.childCount), s = r && r[t + 1];
		s && (o = o.replaceChild(0, s.type.create(s.attrs)));
		let c = r && r[t] || n;
		if (!n.canReplace(a + 1, n.childCount) || !c.type.validContent(o)) return !1;
	}
	let s = i.indexAfter(a), c = r && r[0];
	return i.node(a).canReplaceWith(s, s, c ? c.type : i.node(a + 1).type);
}
function yi(e, t, n = 1, r) {
	let i = e.doc.resolve(t), a = j.empty, o = j.empty;
	for (let e = i.depth, t = i.depth - n, s = n - 1; e > t; e--, s--) {
		a = j.from(i.node(e).copy(a));
		let t = r && r[s];
		o = j.from(t ? t.type.create(t.attrs, o) : i.node(e).copy(o));
	}
	e.step(new ra(t, t, new N(a.append(o), n, n), !0));
}
function bi(e, t) {
	let n = e.resolve(t), r = n.index();
	return Si(n.nodeBefore, n.nodeAfter) && n.parent.canReplace(r, r + 1);
}
function xi(e, t) {
	t.content.size || e.type.compatibleContent(t.type);
	let n = e.contentMatchAt(e.childCount), { linebreakReplacement: r } = e.type.schema;
	for (let i = 0; i < t.childCount; i++) {
		let a = t.child(i), o = a.type == r ? e.type.schema.nodes.text : a.type;
		if (n = n.matchType(o), !n || !e.type.allowsMarks(a.marks)) return !1;
	}
	return n.validEnd;
}
function Si(e, t) {
	return !!(e && t && !e.isLeaf && xi(e, t));
}
function Ci(e, t, n = -1) {
	let r = e.resolve(t);
	for (let e = r.depth;; e--) {
		let i, a, o = r.index(e);
		if (e == r.depth ? (i = r.nodeBefore, a = r.nodeAfter) : n > 0 ? (i = r.node(e + 1), o++, a = r.node(e).maybeChild(o)) : (i = r.node(e).maybeChild(o - 1), a = r.node(e + 1)), i && !i.isTextblock && Si(i, a) && r.node(e).canReplace(o, o + 1)) return t;
		if (e == 0) break;
		t = n < 0 ? r.before(e) : r.after(e);
	}
}
function wi(e, t, n) {
	let r = null, { linebreakReplacement: i } = e.doc.type.schema, a = e.doc.resolve(t - n), o = a.node().type;
	if (i && o.inlineContent) {
		let e = o.whitespace == "pre", t = !!o.contentMatch.matchType(i);
		e && !t ? r = !1 : !e && t && (r = !0);
	}
	let s = e.steps.length;
	if (r === !1) {
		let r = e.doc.resolve(t + n);
		hi(e, r.node(), r.before(), s);
	}
	o.inlineContent && ii(e, t + n - 1, o, a.node().contentMatchAt(a.index()), r == null);
	let c = e.mapping.slice(s), l = c.map(t - n);
	if (e.step(new ra(l, c.map(t + n, -1), N.empty, !0)), r === !0) {
		let t = e.doc.resolve(l);
		mi(e, t.node(), t.before(), e.steps.length);
	}
	return e;
}
function Ti(e, t, n) {
	let r = e.resolve(t);
	if (r.parent.canReplaceWith(r.index(), r.index(), n)) return t;
	if (r.parentOffset == 0) for (let e = r.depth - 1; e >= 0; e--) {
		let t = r.index(e);
		if (r.node(e).canReplaceWith(t, t, n)) return r.before(e + 1);
		if (t > 0) return null;
	}
	if (r.parentOffset == r.parent.content.size) for (let e = r.depth - 1; e >= 0; e--) {
		let t = r.indexAfter(e);
		if (r.node(e).canReplaceWith(t, t, n)) return r.after(e + 1);
		if (t < r.node(e).childCount) return null;
	}
	return null;
}
function Ei(e, t, n) {
	let r = e.resolve(t);
	if (!n.content.size) return t;
	let i = n.content;
	for (let e = 0; e < n.openStart; e++) i = i.firstChild.content;
	for (let e = 1; e <= (n.openStart == 0 && n.size ? 2 : 1); e++) for (let t = r.depth; t >= 0; t--) {
		let n = t == r.depth ? 0 : r.pos <= (r.start(t + 1) + r.end(t + 1)) / 2 ? -1 : 1, a = r.index(t) + +(n > 0), o = r.node(t), s = !1;
		if (e == 1) s = o.canReplace(a, a, i);
		else {
			let e = o.contentMatchAt(a).findWrapping(i.firstChild.type);
			s = e && o.canReplaceWith(a, a, e[0]);
		}
		if (s) return n == 0 ? r.pos : n < 0 ? r.before(t + 1) : r.after(t + 1);
	}
	return null;
}
function Di(e, t, n = t, r = N.empty) {
	if (t == n && !r.size) return null;
	let i = e.resolve(t), a = e.resolve(n);
	return Oi(i, a, r) ? new ra(t, n, r) : new aa(i, a, r).fit();
}
function Oi(e, t, n) {
	return !n.openStart && !n.openEnd && e.start() == t.start() && e.parent.canReplace(e.index(), t.index(), n.content);
}
function ki(e, t, n) {
	return t == 0 ? e.cutByIndex(n, e.childCount) : e.replaceChild(0, e.firstChild.copy(ki(e.firstChild.content, t - 1, n)));
}
function Ai(e, t, n) {
	return t == 0 ? e.append(n) : e.replaceChild(e.childCount - 1, e.lastChild.copy(Ai(e.lastChild.content, t - 1, n)));
}
function ji(e, t) {
	for (let n = 0; n < t; n++) e = e.firstChild.content;
	return e;
}
function Mi(e, t, n) {
	if (t <= 0) return e;
	let r = e.content;
	return t > 1 && (r = r.replaceChild(0, Mi(r.firstChild, t - 1, r.childCount == 1 ? n - 1 : 0))), t > 0 && (r = e.type.contentMatch.fillBefore(r).append(r), n <= 0 && (r = r.append(e.type.contentMatch.matchFragment(r).fillBefore(j.empty, !0)))), e.copy(r);
}
function Ni(e, t, n, r, i) {
	let a = e.node(t), o = i ? e.indexAfter(t) : e.index(t);
	if (o == a.childCount && !n.compatibleContent(a.type)) return null;
	let s = r.fillBefore(a.content, !0, o);
	return s && !Pi(n, a.content, o) ? s : null;
}
function Pi(e, t, n) {
	for (let r = n; r < t.childCount; r++) if (!e.allowsMarks(t.child(r).marks)) return !0;
	return !1;
}
function Fi(e) {
	return e.spec.defining || e.spec.definingForContent;
}
function Ii(e, t, n, r) {
	if (!r.size) return e.deleteRange(t, n);
	let i = e.doc.resolve(t), a = e.doc.resolve(n);
	if (Oi(i, a, r)) return e.step(new ra(t, n, r));
	let o = Bi(i, a);
	o[o.length - 1] == 0 && o.pop();
	let s = -(i.depth + 1);
	o.unshift(s);
	for (let e = i.depth, t = i.pos - 1; e > 0; e--, t--) {
		let n = i.node(e).type.spec;
		if (n.defining || n.definingAsContext || n.isolating) break;
		o.indexOf(e) > -1 ? s = e : i.before(e) == t && o.splice(1, 0, -e);
	}
	let c = o.indexOf(s), l = [], u = r.openStart;
	for (let e = r.content, t = 0;; t++) {
		let n = e.firstChild;
		if (l.push(n), t == r.openStart) break;
		e = n.content;
	}
	for (let e = u - 1; e >= 0; e--) {
		let t = l[e], n = Fi(t.type);
		if (n && !t.sameMarkup(i.node(Math.abs(s) - 1))) u = e;
		else if (n || !t.type.isTextblock) break;
	}
	for (let t = r.openStart; t >= 0; t--) {
		let s = (t + u + 1) % (r.openStart + 1), d = l[s];
		if (d) for (let t = 0; t < o.length; t++) {
			let l = o[(t + c) % o.length], u = !0;
			l < 0 && (u = !1, l = -l);
			let f = i.node(l - 1), p = i.index(l - 1);
			if (f.canReplaceWith(p, p, d.type, d.marks)) return e.replace(i.before(l), u ? a.after(l) : n, new N(Li(r.content, 0, r.openStart, s), s, r.openEnd));
		}
	}
	let d = e.steps.length;
	for (let s = o.length - 1; s >= 0 && (e.replace(t, n, r), !(e.steps.length > d)); s--) {
		let e = o[s];
		e < 0 || (t = i.before(e), n = a.after(e));
	}
}
function Li(e, t, n, r, i) {
	if (t < n) {
		let i = e.firstChild;
		e = e.replaceChild(0, i.copy(Li(i.content, t + 1, n, r, i)));
	}
	if (t > r) {
		let t = i.contentMatchAt(0), n = t.fillBefore(e).append(e);
		e = n.append(t.matchFragment(n).fillBefore(j.empty, !0));
	}
	return e;
}
function Ri(e, t, n, r) {
	if (!r.isInline && t == n && e.doc.resolve(t).parent.content.size) {
		let i = Ti(e.doc, t, r.type);
		i != null && (t = n = i);
	}
	e.replaceRange(t, n, new N(j.from(r), 0, 0));
}
function zi(e, t, n) {
	let r = e.doc.resolve(t), i = e.doc.resolve(n);
	if (r.parent.isTextblock && i.parent.isTextblock && r.start() != i.start() && r.parentOffset == 0 && i.parentOffset == 0) {
		let a = r.sharedDepth(n), o = !1;
		for (let e = r.depth; e > a; e--) r.node(e).type.spec.isolating && (o = !0);
		for (let e = i.depth; e > a; e--) i.node(e).type.spec.isolating && (o = !0);
		if (!o) {
			for (let e = r.depth; e > 0 && t == r.start(e); e--) t = r.before(e);
			for (let e = i.depth; e > 0 && n == i.start(e); e--) n = i.before(e);
			r = e.doc.resolve(t), i = e.doc.resolve(n);
		}
	}
	let a = Bi(r, i);
	for (let t = 0; t < a.length; t++) {
		let n = a[t], o = t == a.length - 1;
		if (o && n == 0 || r.node(n).type.contentMatch.validEnd) return e.delete(r.start(n), i.end(n));
		if (n > 0 && (o || r.node(n - 1).canReplace(r.index(n - 1), i.indexAfter(n - 1)))) return e.delete(r.before(n), i.after(n));
	}
	for (let a = 1; a <= r.depth && a <= i.depth; a++) if (t - r.start(a) == r.depth - a && n > r.end(a) && i.end(a) - n != i.depth - a && r.start(a - 1) == i.start(a - 1) && r.node(a - 1).canReplace(r.index(a - 1), i.index(a - 1))) return e.delete(r.before(a), n);
	e.delete(t, n);
}
function Bi(e, t) {
	let n = [], r = Math.min(e.depth, t.depth);
	for (let i = r; i >= 0; i--) {
		let r = e.start(i);
		if (r < e.pos - (e.depth - i) || t.end(i) > t.pos + (t.depth - i) || e.node(i).type.spec.isolating || t.node(i).type.spec.isolating) break;
		(r == t.start(i) || i == e.depth && i == t.depth && e.parent.inlineContent && t.parent.inlineContent && i && t.start(i - 1) == r - 1) && n.push(i);
	}
	return n;
}
var Vi, Hi, Ui, Wi, Gi, Ki, qi, Ji, Yi, Xi, Zi, Qi, $i, ea, ta, na, ra, ia, aa, oa, sa, ca, la, ua = S((() => {
	Xr(), Vi = 65535, Hi = 2 ** 16, Ui = 1, Wi = 2, Gi = 4, Ki = 8, qi = class {
		constructor(e, t, n) {
			this.pos = e, this.delInfo = t, this.recover = n;
		}
		get deleted() {
			return (this.delInfo & Ki) > 0;
		}
		get deletedBefore() {
			return (this.delInfo & 5) > 0;
		}
		get deletedAfter() {
			return (this.delInfo & 6) > 0;
		}
		get deletedAcross() {
			return (this.delInfo & Gi) > 0;
		}
	}, Ji = class e {
		constructor(t, n = !1) {
			if (this.ranges = t, this.inverted = n, !t.length && e.empty) return e.empty;
		}
		recover(e) {
			let t = 0, n = Qr(e);
			if (!this.inverted) for (let e = 0; e < n; e++) t += this.ranges[e * 3 + 2] - this.ranges[e * 3 + 1];
			return this.ranges[n * 3] + t + $r(e);
		}
		mapResult(e, t = 1) {
			return this._map(e, t, !1);
		}
		map(e, t = 1) {
			return this._map(e, t, !0);
		}
		_map(e, t, n) {
			let r = 0, i = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
			for (let o = 0; o < this.ranges.length; o += 3) {
				let s = this.ranges[o] - (this.inverted ? r : 0);
				if (s > e) break;
				let c = this.ranges[o + i], l = this.ranges[o + a], u = s + c;
				if (e <= u) {
					let i = c ? e == s ? -1 : e == u ? 1 : t : t, a = s + r + (i < 0 ? 0 : l);
					if (n) return a;
					let d = e == (t < 0 ? s : u) ? null : Zr(o / 3, e - s), f = e == s ? Wi : e == u ? Ui : Gi;
					return (t < 0 ? e != s : e != u) && (f |= Ki), new qi(a, f, d);
				}
				r += l - c;
			}
			return n ? e + r : new qi(e + r, 0, null);
		}
		touches(e, t) {
			let n = 0, r = Qr(t), i = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
			for (let t = 0; t < this.ranges.length; t += 3) {
				let o = this.ranges[t] - (this.inverted ? n : 0);
				if (o > e) break;
				let s = this.ranges[t + i];
				if (e <= o + s && t == r * 3) return !0;
				n += this.ranges[t + a] - s;
			}
			return !1;
		}
		forEach(e) {
			let t = this.inverted ? 2 : 1, n = this.inverted ? 1 : 2;
			for (let r = 0, i = 0; r < this.ranges.length; r += 3) {
				let a = this.ranges[r], o = a - (this.inverted ? i : 0), s = a + (this.inverted ? 0 : i), c = this.ranges[r + t], l = this.ranges[r + n];
				e(o, o + c, s, s + l), i += l - c;
			}
		}
		invert() {
			return new e(this.ranges, !this.inverted);
		}
		toString() {
			return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
		}
		static offset(t) {
			return t == 0 ? e.empty : new e(t < 0 ? [
				0,
				-t,
				0
			] : [
				0,
				0,
				t
			]);
		}
	}, Ji.empty = new Ji([]), Yi = class e {
		constructor(e, t, n = 0, r = e ? e.length : 0) {
			this.mirror = t, this.from = n, this.to = r, this._maps = e || [], this.ownData = !(e || t);
		}
		get maps() {
			return this._maps;
		}
		slice(t = 0, n = this.maps.length) {
			return new e(this._maps, this.mirror, t, n);
		}
		appendMap(e, t) {
			this.ownData ||= (this._maps = this._maps.slice(), this.mirror = this.mirror && this.mirror.slice(), !0), this.to = this._maps.push(e), t != null && this.setMirror(this._maps.length - 1, t);
		}
		appendMapping(e) {
			for (let t = 0, n = this._maps.length; t < e._maps.length; t++) {
				let r = e.getMirror(t);
				this.appendMap(e._maps[t], r != null && r < t ? n + r : void 0);
			}
		}
		getMirror(e) {
			if (this.mirror) {
				for (let t = 0; t < this.mirror.length; t++) if (this.mirror[t] == e) return this.mirror[t + (t % 2 ? -1 : 1)];
			}
		}
		setMirror(e, t) {
			this.mirror ||= [], this.mirror.push(e, t);
		}
		appendMappingInverted(e) {
			for (let t = e.maps.length - 1, n = this._maps.length + e._maps.length; t >= 0; t--) {
				let r = e.getMirror(t);
				this.appendMap(e._maps[t].invert(), r != null && r > t ? n - r - 1 : void 0);
			}
		}
		invert() {
			let t = new e();
			return t.appendMappingInverted(this), t;
		}
		map(e, t = 1) {
			if (this.mirror) return this._map(e, t, !0);
			for (let n = this.from; n < this.to; n++) e = this._maps[n].map(e, t);
			return e;
		}
		mapResult(e, t = 1) {
			return this._map(e, t, !1);
		}
		_map(e, t, n) {
			let r = 0;
			for (let n = this.from; n < this.to; n++) {
				let i = this._maps[n].mapResult(e, t);
				if (i.recover != null) {
					let t = this.getMirror(n);
					if (t != null && t > n && t < this.to) {
						n = t, e = this._maps[t].recover(i.recover);
						continue;
					}
				}
				r |= i.delInfo, e = i.pos;
			}
			return n ? e : new qi(e, r, null);
		}
	}, Xi = Object.create(null), Zi = class {
		getMap() {
			return Ji.empty;
		}
		merge(e) {
			return null;
		}
		static fromJSON(e, t) {
			if (!t || !t.stepType) throw RangeError("Invalid input for Step.fromJSON");
			let n = Xi[t.stepType];
			if (!n) throw RangeError(`No step type ${t.stepType} defined`);
			return n.fromJSON(e, t);
		}
		static jsonID(e, t) {
			if (e in Xi) throw RangeError("Duplicate use of step JSON ID " + e);
			return Xi[e] = t, t.prototype.jsonID = e, t;
		}
	}, Qi = class e {
		constructor(e, t) {
			this.doc = e, this.failed = t;
		}
		static ok(t) {
			return new e(t, null);
		}
		static fail(t) {
			return new e(null, t);
		}
		static fromReplace(t, n, r, i) {
			try {
				return e.ok(t.replace(n, r, i));
			} catch (t) {
				if (t instanceof wr) return e.fail(t.message);
				throw t;
			}
		}
	}, $i = class e extends Zi {
		constructor(e, t, n) {
			super(), this.from = e, this.to = t, this.mark = n;
		}
		apply(e) {
			let t = e.slice(this.from, this.to), n = e.resolve(this.from), r = n.node(n.sharedDepth(this.to)), i = new N(ei(t.content, (e, t) => !e.isAtom || !t.type.allowsMarkType(this.mark.type) ? e : e.mark(this.mark.addToSet(e.marks)), r), t.openStart, t.openEnd);
			return Qi.fromReplace(e, this.from, this.to, i);
		}
		invert() {
			return new ea(this.from, this.to, this.mark);
		}
		map(t) {
			let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1);
			return n.deleted && r.deleted || n.pos >= r.pos ? null : new e(n.pos, r.pos, this.mark);
		}
		merge(t) {
			return t instanceof e && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new e(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
		}
		toJSON() {
			return {
				stepType: "addMark",
				mark: this.mark.toJSON(),
				from: this.from,
				to: this.to
			};
		}
		static fromJSON(t, n) {
			if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for AddMarkStep.fromJSON");
			return new e(n.from, n.to, t.markFromJSON(n.mark));
		}
	}, Zi.jsonID("addMark", $i), ea = class e extends Zi {
		constructor(e, t, n) {
			super(), this.from = e, this.to = t, this.mark = n;
		}
		apply(e) {
			let t = e.slice(this.from, this.to), n = new N(ei(t.content, (e) => e.mark(this.mark.removeFromSet(e.marks)), e), t.openStart, t.openEnd);
			return Qi.fromReplace(e, this.from, this.to, n);
		}
		invert() {
			return new $i(this.from, this.to, this.mark);
		}
		map(t) {
			let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1);
			return n.deleted && r.deleted || n.pos >= r.pos ? null : new e(n.pos, r.pos, this.mark);
		}
		merge(t) {
			return t instanceof e && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new e(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
		}
		toJSON() {
			return {
				stepType: "removeMark",
				mark: this.mark.toJSON(),
				from: this.from,
				to: this.to
			};
		}
		static fromJSON(t, n) {
			if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for RemoveMarkStep.fromJSON");
			return new e(n.from, n.to, t.markFromJSON(n.mark));
		}
	}, Zi.jsonID("removeMark", ea), ta = class e extends Zi {
		constructor(e, t) {
			super(), this.pos = e, this.mark = t;
		}
		apply(e) {
			let t = e.nodeAt(this.pos);
			if (!t) return Qi.fail("No node at mark step's position");
			let n = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
			return Qi.fromReplace(e, this.pos, this.pos + 1, new N(j.from(n), 0, +!t.isLeaf));
		}
		invert(t) {
			let n = t.nodeAt(this.pos);
			if (n) {
				let t = this.mark.addToSet(n.marks);
				if (t.length == n.marks.length) {
					for (let r = 0; r < n.marks.length; r++) if (!n.marks[r].isInSet(t)) return new e(this.pos, n.marks[r]);
					return new e(this.pos, this.mark);
				}
			}
			return new na(this.pos, this.mark);
		}
		map(t) {
			let n = t.mapResult(this.pos, 1);
			return n.deletedAfter ? null : new e(n.pos, this.mark);
		}
		toJSON() {
			return {
				stepType: "addNodeMark",
				pos: this.pos,
				mark: this.mark.toJSON()
			};
		}
		static fromJSON(t, n) {
			if (typeof n.pos != "number") throw RangeError("Invalid input for AddNodeMarkStep.fromJSON");
			return new e(n.pos, t.markFromJSON(n.mark));
		}
	}, Zi.jsonID("addNodeMark", ta), na = class e extends Zi {
		constructor(e, t) {
			super(), this.pos = e, this.mark = t;
		}
		apply(e) {
			let t = e.nodeAt(this.pos);
			if (!t) return Qi.fail("No node at mark step's position");
			let n = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
			return Qi.fromReplace(e, this.pos, this.pos + 1, new N(j.from(n), 0, +!t.isLeaf));
		}
		invert(e) {
			let t = e.nodeAt(this.pos);
			return !t || !this.mark.isInSet(t.marks) ? this : new ta(this.pos, this.mark);
		}
		map(t) {
			let n = t.mapResult(this.pos, 1);
			return n.deletedAfter ? null : new e(n.pos, this.mark);
		}
		toJSON() {
			return {
				stepType: "removeNodeMark",
				pos: this.pos,
				mark: this.mark.toJSON()
			};
		}
		static fromJSON(t, n) {
			if (typeof n.pos != "number") throw RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
			return new e(n.pos, t.markFromJSON(n.mark));
		}
	}, Zi.jsonID("removeNodeMark", na), ra = class e extends Zi {
		constructor(e, t, n, r = !1) {
			super(), this.from = e, this.to = t, this.slice = n, this.structure = r;
		}
		apply(e) {
			return this.structure && ti(e, this.from, this.to) ? Qi.fail("Structure replace would overwrite content") : Qi.fromReplace(e, this.from, this.to, this.slice);
		}
		getMap() {
			return new Ji([
				this.from,
				this.to - this.from,
				this.slice.size
			]);
		}
		invert(t) {
			return new e(this.from, this.from + this.slice.size, t.slice(this.from, this.to));
		}
		map(t) {
			let n = t.mapResult(this.to, -1), r = this.from == this.to && e.MAP_BIAS < 0 ? n : t.mapResult(this.from, 1);
			return r.deletedAcross && n.deletedAcross ? null : new e(r.pos, Math.max(r.pos, n.pos), this.slice, this.structure);
		}
		merge(t) {
			if (!(t instanceof e) || t.structure || this.structure) return null;
			if (this.from + this.slice.size == t.from && !this.slice.openEnd && !t.slice.openStart) {
				let n = this.slice.size + t.slice.size == 0 ? N.empty : new N(this.slice.content.append(t.slice.content), this.slice.openStart, t.slice.openEnd);
				return new e(this.from, this.to + (t.to - t.from), n, this.structure);
			}
			if (t.to == this.from && !this.slice.openStart && !t.slice.openEnd) {
				let n = this.slice.size + t.slice.size == 0 ? N.empty : new N(t.slice.content.append(this.slice.content), t.slice.openStart, this.slice.openEnd);
				return new e(t.from, this.to, n, this.structure);
			}
			return null;
		}
		toJSON() {
			let e = {
				stepType: "replace",
				from: this.from,
				to: this.to
			};
			return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
		}
		static fromJSON(t, n) {
			if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for ReplaceStep.fromJSON");
			return new e(n.from, n.to, N.fromJSON(t, n.slice), !!n.structure);
		}
	}, ra.MAP_BIAS = 1, Zi.jsonID("replace", ra), ia = class e extends Zi {
		constructor(e, t, n, r, i, a, o = !1) {
			super(), this.from = e, this.to = t, this.gapFrom = n, this.gapTo = r, this.slice = i, this.insert = a, this.structure = o;
		}
		apply(e) {
			if (this.structure && (ti(e, this.from, this.gapFrom) || ti(e, this.gapTo, this.to))) return Qi.fail("Structure gap-replace would overwrite content");
			let t = e.slice(this.gapFrom, this.gapTo);
			if (t.openStart || t.openEnd) return Qi.fail("Gap is not a flat range");
			let n = this.slice.insertAt(this.insert, t.content);
			return n ? Qi.fromReplace(e, this.from, this.to, n) : Qi.fail("Content does not fit in gap");
		}
		getMap() {
			return new Ji([
				this.from,
				this.gapFrom - this.from,
				this.insert,
				this.gapTo,
				this.to - this.gapTo,
				this.slice.size - this.insert
			]);
		}
		invert(t) {
			let n = this.gapTo - this.gapFrom;
			return new e(this.from, this.from + this.slice.size + n, this.from + this.insert, this.from + this.insert + n, t.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
		}
		map(t) {
			let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1), i = this.from == this.gapFrom ? n.pos : t.map(this.gapFrom, -1), a = this.to == this.gapTo ? r.pos : t.map(this.gapTo, 1);
			return n.deletedAcross && r.deletedAcross || i < n.pos || a > r.pos ? null : new e(n.pos, r.pos, i, a, this.slice, this.insert, this.structure);
		}
		toJSON() {
			let e = {
				stepType: "replaceAround",
				from: this.from,
				to: this.to,
				gapFrom: this.gapFrom,
				gapTo: this.gapTo,
				insert: this.insert
			};
			return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
		}
		static fromJSON(t, n) {
			if (typeof n.from != "number" || typeof n.to != "number" || typeof n.gapFrom != "number" || typeof n.gapTo != "number" || typeof n.insert != "number") throw RangeError("Invalid input for ReplaceAroundStep.fromJSON");
			return new e(n.from, n.to, n.gapFrom, n.gapTo, N.fromJSON(t, n.slice), n.insert, !!n.structure);
		}
	}, Zi.jsonID("replaceAround", ia), aa = class {
		constructor(e, t, n) {
			this.$from = e, this.$to = t, this.unplaced = n, this.frontier = [], this.placed = j.empty;
			for (let t = 0; t <= e.depth; t++) {
				let n = e.node(t);
				this.frontier.push({
					type: n.type,
					match: n.contentMatchAt(e.indexAfter(t))
				});
			}
			for (let t = e.depth; t > 0; t--) this.placed = j.from(e.node(t).copy(this.placed));
		}
		get depth() {
			return this.frontier.length - 1;
		}
		fit() {
			for (; this.unplaced.size;) {
				let e = this.findFittable();
				e ? this.placeNodes(e) : this.openMore() || this.dropNode();
			}
			let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, n = this.$from, r = this.close(e < 0 ? this.$to : n.doc.resolve(e));
			if (!r) return null;
			let i = this.placed, a = n.depth, o = r.depth;
			for (; a && o && i.childCount == 1;) i = i.firstChild.content, a--, o--;
			let s = new N(i, a, o);
			return e > -1 ? new ia(n.pos, e, this.$to.pos, this.$to.end(), s, t) : s.size || n.pos != this.$to.pos ? new ra(n.pos, r.pos, s) : null;
		}
		findFittable() {
			let e = this.unplaced.openStart;
			for (let t = this.unplaced.content, n = 0, r = this.unplaced.openEnd; n < e; n++) {
				let i = t.firstChild;
				if (t.childCount > 1 && (r = 0), i.type.spec.isolating && r <= n) {
					e = n;
					break;
				}
				t = i.content;
			}
			for (let t = 1; t <= 2; t++) for (let n = t == 1 ? e : this.unplaced.openStart; n >= 0; n--) {
				let e, r = null;
				n ? (r = ji(this.unplaced.content, n - 1).firstChild, e = r.content) : e = this.unplaced.content;
				let i = e.firstChild;
				for (let e = this.depth; e >= 0; e--) {
					let { type: a, match: o } = this.frontier[e], s, c = null;
					if (t == 1 && (i ? o.matchType(i.type) || (c = o.fillBefore(j.from(i), !1)) : r && a.compatibleContent(r.type))) return {
						sliceDepth: n,
						frontierDepth: e,
						parent: r,
						inject: c
					};
					if (t == 2 && i && (s = o.findWrapping(i.type))) return {
						sliceDepth: n,
						frontierDepth: e,
						parent: r,
						wrap: s
					};
					if (r && o.matchType(r.type)) break;
				}
			}
		}
		openMore() {
			let { content: e, openStart: t, openEnd: n } = this.unplaced, r = ji(e, t);
			return !r.childCount || r.firstChild.isLeaf ? !1 : (this.unplaced = new N(e, t + 1, Math.max(n, r.size + t >= e.size - n ? t + 1 : 0)), !0);
		}
		dropNode() {
			let { content: e, openStart: t, openEnd: n } = this.unplaced, r = ji(e, t);
			if (r.childCount <= 1 && t > 0) {
				let i = e.size - t <= t + r.size;
				this.unplaced = new N(ki(e, t - 1, 1), t - 1, i ? t - 1 : n);
			} else this.unplaced = new N(ki(e, t, 1), t, n);
		}
		placeNodes({ sliceDepth: e, frontierDepth: t, parent: n, inject: r, wrap: i }) {
			for (; this.depth > t;) this.closeFrontierNode();
			if (i) for (let e = 0; e < i.length; e++) this.openFrontierNode(i[e]);
			let a = this.unplaced, o = n ? n.content : a.content, s = a.openStart - e, c = 0, l = [], { match: u, type: d } = this.frontier[t];
			if (r) {
				for (let e = 0; e < r.childCount; e++) l.push(r.child(e));
				u = u.matchFragment(r);
			}
			let f = o.size + e - (a.content.size - a.openEnd);
			for (; c < o.childCount;) {
				let e = o.child(c), t = u.matchType(e.type);
				if (!t) break;
				c++, (c > 1 || s == 0 || e.content.size) && (u = t, l.push(Mi(e.mark(d.allowedMarks(e.marks)), c == 1 ? s : 0, c == o.childCount ? f : -1)));
			}
			let p = c == o.childCount;
			p || (f = -1), this.placed = Ai(this.placed, t, j.from(l)), this.frontier[t].match = u, p && f < 0 && n && n.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
			for (let e = 0, t = o; e < f; e++) {
				let e = t.lastChild;
				this.frontier.push({
					type: e.type,
					match: e.contentMatchAt(e.childCount)
				}), t = e.content;
			}
			this.unplaced = p ? e == 0 ? N.empty : new N(ki(a.content, e - 1, 1), e - 1, f < 0 ? a.openEnd : e - 1) : new N(ki(a.content, e, c), a.openStart, a.openEnd);
		}
		mustMoveInline() {
			if (!this.$to.parent.isTextblock) return -1;
			let e = this.frontier[this.depth], t;
			if (!e.type.isTextblock || !Ni(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth) return -1;
			let { depth: n } = this.$to, r = this.$to.after(n);
			for (; n > 1 && r == this.$to.end(--n);) ++r;
			return r;
		}
		findCloseLevel(e) {
			scan: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
				let { match: n, type: r } = this.frontier[t], i = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), a = Ni(e, t, r, n, i);
				if (a) {
					for (let n = t - 1; n >= 0; n--) {
						let { match: t, type: r } = this.frontier[n], i = Ni(e, n, r, t, !0);
						if (!i || i.childCount) continue scan;
					}
					return {
						depth: t,
						fit: a,
						move: i ? e.doc.resolve(e.after(t + 1)) : e
					};
				}
			}
		}
		close(e) {
			let t = this.findCloseLevel(e);
			if (!t) return null;
			for (; this.depth > t.depth;) this.closeFrontierNode();
			t.fit.childCount && (this.placed = Ai(this.placed, t.depth, t.fit)), e = t.move;
			for (let n = t.depth + 1; n <= e.depth; n++) {
				let t = e.node(n), r = t.type.contentMatch.fillBefore(t.content, !0, e.index(n));
				this.openFrontierNode(t.type, t.attrs, r);
			}
			return e;
		}
		openFrontierNode(e, t = null, n) {
			let r = this.frontier[this.depth];
			r.match = r.match.matchType(e), this.placed = Ai(this.placed, this.depth, j.from(e.create(t, n))), this.frontier.push({
				type: e,
				match: e.contentMatch
			});
		}
		closeFrontierNode() {
			let e = this.frontier.pop().match.fillBefore(j.empty, !0);
			e.childCount && (this.placed = Ai(this.placed, this.frontier.length, e));
		}
	}, oa = class e extends Zi {
		constructor(e, t, n) {
			super(), this.pos = e, this.attr = t, this.value = n;
		}
		apply(e) {
			let t = e.nodeAt(this.pos);
			if (!t) return Qi.fail("No node at attribute step's position");
			let n = Object.create(null);
			for (let e in t.attrs) n[e] = t.attrs[e];
			n[this.attr] = this.value;
			let r = t.type.create(n, null, t.marks);
			return Qi.fromReplace(e, this.pos, this.pos + 1, new N(j.from(r), 0, +!t.isLeaf));
		}
		getMap() {
			return Ji.empty;
		}
		invert(t) {
			return new e(this.pos, this.attr, t.nodeAt(this.pos).attrs[this.attr]);
		}
		map(t) {
			let n = t.mapResult(this.pos, 1);
			return n.deletedAfter ? null : new e(n.pos, this.attr, this.value);
		}
		toJSON() {
			return {
				stepType: "attr",
				pos: this.pos,
				attr: this.attr,
				value: this.value
			};
		}
		static fromJSON(t, n) {
			if (typeof n.pos != "number" || typeof n.attr != "string") throw RangeError("Invalid input for AttrStep.fromJSON");
			return new e(n.pos, n.attr, n.value);
		}
	}, Zi.jsonID("attr", oa), sa = class e extends Zi {
		constructor(e, t) {
			super(), this.attr = e, this.value = t;
		}
		apply(e) {
			let t = Object.create(null);
			for (let n in e.attrs) t[n] = e.attrs[n];
			t[this.attr] = this.value;
			let n = e.type.create(t, e.content, e.marks);
			return Qi.ok(n);
		}
		getMap() {
			return Ji.empty;
		}
		invert(t) {
			return new e(this.attr, t.attrs[this.attr]);
		}
		map(e) {
			return this;
		}
		toJSON() {
			return {
				stepType: "docAttr",
				attr: this.attr,
				value: this.value
			};
		}
		static fromJSON(t, n) {
			if (typeof n.attr != "string") throw RangeError("Invalid input for DocAttrStep.fromJSON");
			return new e(n.attr, n.value);
		}
	}, Zi.jsonID("docAttr", sa), ca = class extends Error {}, ca = function e(t) {
		let n = Error.call(this, t);
		return n.__proto__ = e.prototype, n;
	}, ca.prototype = Object.create(Error.prototype), ca.prototype.constructor = ca, ca.prototype.name = "TransformError", la = class {
		constructor(e) {
			this.doc = e, this.steps = [], this.docs = [], this.mapping = new Yi();
		}
		get before() {
			return this.docs.length ? this.docs[0] : this.doc;
		}
		step(e) {
			let t = this.maybeStep(e);
			if (t.failed) throw new ca(t.failed);
			return this;
		}
		maybeStep(e) {
			let t = e.apply(this.doc);
			return t.failed || this.addStep(e, t.doc), t;
		}
		get docChanged() {
			return this.steps.length > 0;
		}
		changedRange() {
			let e = 1e9, t = -1e9;
			for (let n = 0; n < this.mapping.maps.length; n++) {
				let r = this.mapping.maps[n];
				n && (e = r.map(e, 1), t = r.map(t, -1)), r.forEach((n, r, i, a) => {
					e = Math.min(e, i), t = Math.max(t, a);
				});
			}
			return e == 1e9 ? null : {
				from: e,
				to: t
			};
		}
		addStep(e, t) {
			this.docs.push(this.doc), this.steps.push(e), this.mapping.appendMap(e.getMap()), this.doc = t;
		}
		replace(e, t = e, n = N.empty) {
			let r = Di(this.doc, e, t, n);
			return r && this.step(r), this;
		}
		replaceWith(e, t, n) {
			return this.replace(e, t, new N(j.from(n), 0, 0));
		}
		delete(e, t) {
			return this.replace(e, t, N.empty);
		}
		insert(e, t) {
			return this.replaceWith(e, e, t);
		}
		replaceRange(e, t, n) {
			return Ii(this, e, t, n), this;
		}
		replaceRangeWith(e, t, n) {
			return Ri(this, e, t, n), this;
		}
		deleteRange(e, t) {
			return zi(this, e, t), this;
		}
		lift(e, t) {
			return si(this, e, t), this;
		}
		join(e, t = 1) {
			return wi(this, e, t), this;
		}
		wrap(e, t) {
			return fi(this, e, t), this;
		}
		setBlockType(e, t = e, n, r = null) {
			return pi(this, e, t, n, r), this;
		}
		setNodeMarkup(e, t, n = null, r) {
			return _i(this, e, t, n, r), this;
		}
		setNodeAttribute(e, t, n) {
			return this.step(new oa(e, t, n)), this;
		}
		setDocAttribute(e, t) {
			return this.step(new sa(e, t)), this;
		}
		addNodeMark(e, t) {
			return this.step(new ta(e, t)), this;
		}
		removeNodeMark(e, t) {
			let n = this.doc.nodeAt(e);
			if (!n) throw RangeError("No node at position " + e);
			if (t instanceof M) t.isInSet(n.marks) && this.step(new na(e, t));
			else {
				let r = n.marks, i, a = [];
				for (; i = t.isInSet(r);) a.push(new na(e, i)), r = i.removeFromSet(r);
				for (let e = a.length - 1; e >= 0; e--) this.step(a[e]);
			}
			return this;
		}
		split(e, t = 1, n) {
			return yi(this, e, t, n), this;
		}
		addMark(e, t, n) {
			return ni(this, e, t, n), this;
		}
		removeMark(e, t, n) {
			return ri(this, e, t, n), this;
		}
		clearIncompatible(e, t, n) {
			return ii(this, e, t, n), this;
		}
	};
})), da = S((() => {
	ua();
}));
//#endregion
//#region ../../node_modules/prosemirror-state/dist/index.js
function fa(e) {
	!ba && !e.parent.inlineContent && (ba = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + e.parent.type.name + ")"));
}
function pa(e, t, n, r, i, a = !1) {
	if (t.inlineContent) return F.create(e, n);
	for (let o = r - (i > 0 ? 0 : 1); i > 0 ? o < t.childCount : o >= 0; o += i) {
		let r = t.child(o);
		if (!r.isAtom) {
			let t = pa(e, r, n + i, i < 0 ? r.childCount : 0, i, a);
			if (t) return t;
		} else if (!a && I.isSelectable(r)) return I.create(e, n - (i < 0 ? r.nodeSize : 0));
		n += r.nodeSize * i;
	}
	return null;
}
function ma(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof ra || i instanceof ia)) return;
	let a = e.mapping.maps[r], o;
	a.forEach((e, t, n, r) => {
		o ??= r;
	}), e.setSelection(P.near(e.doc.resolve(o), n));
}
function ha(e, t) {
	return !t || !e ? e : e.bind(t);
}
function ga(e, t, n) {
	for (let r in e) {
		let i = e[r];
		i instanceof Function ? i = i.bind(t) : r == "handleDOMEvents" && (i = ga(i, t, {})), n[r] = i;
	}
	return n;
}
function _a(e) {
	return e in Na ? e + "$" + ++Na[e] : (Na[e] = 0, e + "$");
}
var va, P, ya, ba, F, xa, I, Sa, Ca, wa, Ta, Ea, Da, Oa, ka, Aa, ja, Ma, L, Na, R, Pa = S((() => {
	Xr(), ua(), va = Object.create(null), P = class {
		constructor(e, t, n) {
			this.$anchor = e, this.$head = t, this.ranges = n || [new ya(e.min(t), e.max(t))];
		}
		get anchor() {
			return this.$anchor.pos;
		}
		get head() {
			return this.$head.pos;
		}
		get from() {
			return this.$from.pos;
		}
		get to() {
			return this.$to.pos;
		}
		get $from() {
			return this.ranges[0].$from;
		}
		get $to() {
			return this.ranges[0].$to;
		}
		get empty() {
			let e = this.ranges;
			for (let t = 0; t < e.length; t++) if (e[t].$from.pos != e[t].$to.pos) return !1;
			return !0;
		}
		content() {
			return this.$from.doc.slice(this.from, this.to, !0);
		}
		replace(e, t = N.empty) {
			let n = t.content.lastChild, r = null;
			for (let e = 0; e < t.openEnd; e++) r = n, n = n.lastChild;
			let i = e.steps.length, a = this.ranges;
			for (let o = 0; o < a.length; o++) {
				let { $from: s, $to: c } = a[o], l = e.mapping.slice(i);
				e.replaceRange(l.map(s.pos), l.map(c.pos), o ? N.empty : t), o == 0 && ma(e, i, (n ? n.isInline : r && r.isTextblock) ? -1 : 1);
			}
		}
		replaceWith(e, t) {
			let n = e.steps.length, r = this.ranges;
			for (let i = 0; i < r.length; i++) {
				let { $from: a, $to: o } = r[i], s = e.mapping.slice(n), c = s.map(a.pos), l = s.map(o.pos);
				i ? e.deleteRange(c, l) : (e.replaceRangeWith(c, l, t), ma(e, n, t.isInline ? -1 : 1));
			}
		}
		static findFrom(e, t, n = !1) {
			let r = e.parent.inlineContent ? new F(e) : pa(e.node(0), e.parent, e.pos, e.index(), t, n);
			if (r) return r;
			for (let r = e.depth - 1; r >= 0; r--) {
				let i = t < 0 ? pa(e.node(0), e.node(r), e.before(r + 1), e.index(r), t, n) : pa(e.node(0), e.node(r), e.after(r + 1), e.index(r) + 1, t, n);
				if (i) return i;
			}
			return null;
		}
		static near(e, t = 1) {
			return this.findFrom(e, t) || this.findFrom(e, -t) || new Ca(e.node(0));
		}
		static atStart(e) {
			return pa(e, e, 0, 0, 1) || new Ca(e);
		}
		static atEnd(e) {
			return pa(e, e, e.content.size, e.childCount, -1) || new Ca(e);
		}
		static fromJSON(e, t) {
			if (!t || !t.type) throw RangeError("Invalid input for Selection.fromJSON");
			let n = va[t.type];
			if (!n) throw RangeError(`No selection type ${t.type} defined`);
			return n.fromJSON(e, t);
		}
		static jsonID(e, t) {
			if (e in va) throw RangeError("Duplicate use of selection JSON ID " + e);
			return va[e] = t, t.prototype.jsonID = e, t;
		}
		getBookmark() {
			return F.between(this.$anchor, this.$head).getBookmark();
		}
	}, P.prototype.visible = !0, ya = class {
		constructor(e, t) {
			this.$from = e, this.$to = t;
		}
	}, ba = !1, F = class e extends P {
		constructor(e, t = e) {
			fa(e), fa(t), super(e, t);
		}
		get $cursor() {
			return this.$anchor.pos == this.$head.pos ? this.$head : null;
		}
		map(t, n) {
			let r = t.resolve(n.map(this.head));
			if (!r.parent.inlineContent) return P.near(r);
			let i = t.resolve(n.map(this.anchor));
			return new e(i.parent.inlineContent ? i : r, r);
		}
		replace(e, t = N.empty) {
			if (super.replace(e, t), t == N.empty) {
				let t = this.$from.marksAcross(this.$to);
				t && e.ensureMarks(t);
			}
		}
		eq(t) {
			return t instanceof e && t.anchor == this.anchor && t.head == this.head;
		}
		getBookmark() {
			return new xa(this.anchor, this.head);
		}
		toJSON() {
			return {
				type: "text",
				anchor: this.anchor,
				head: this.head
			};
		}
		static fromJSON(t, n) {
			if (typeof n.anchor != "number" || typeof n.head != "number") throw RangeError("Invalid input for TextSelection.fromJSON");
			return new e(t.resolve(n.anchor), t.resolve(n.head));
		}
		static create(e, t, n = t) {
			let r = e.resolve(t);
			return new this(r, n == t ? r : e.resolve(n));
		}
		static between(t, n, r) {
			let i = t.pos - n.pos;
			if ((!r || i) && (r = i >= 0 ? 1 : -1), !n.parent.inlineContent) {
				let e = P.findFrom(n, r, !0) || P.findFrom(n, -r, !0);
				if (e) n = e.$head;
				else return P.near(n, r);
			}
			return t.parent.inlineContent || (i == 0 ? t = n : (t = (P.findFrom(t, -r, !0) || P.findFrom(t, r, !0)).$anchor, t.pos < n.pos != i < 0 && (t = n))), new e(t, n);
		}
	}, P.jsonID("text", F), xa = class e {
		constructor(e, t) {
			this.anchor = e, this.head = t;
		}
		map(t) {
			return new e(t.map(this.anchor), t.map(this.head));
		}
		resolve(e) {
			return F.between(e.resolve(this.anchor), e.resolve(this.head));
		}
	}, I = class e extends P {
		constructor(e) {
			let t = e.nodeAfter, n = e.node(0).resolve(e.pos + t.nodeSize);
			super(e, n), this.node = t;
		}
		map(t, n) {
			let { deleted: r, pos: i } = n.mapResult(this.anchor), a = t.resolve(i);
			return r ? P.near(a) : new e(a);
		}
		content() {
			return new N(j.from(this.node), 0, 0);
		}
		eq(t) {
			return t instanceof e && t.anchor == this.anchor;
		}
		toJSON() {
			return {
				type: "node",
				anchor: this.anchor
			};
		}
		getBookmark() {
			return new Sa(this.anchor);
		}
		static fromJSON(t, n) {
			if (typeof n.anchor != "number") throw RangeError("Invalid input for NodeSelection.fromJSON");
			return new e(t.resolve(n.anchor));
		}
		static create(t, n) {
			return new e(t.resolve(n));
		}
		static isSelectable(e) {
			return !e.isText && e.type.spec.selectable !== !1;
		}
	}, I.prototype.visible = !1, P.jsonID("node", I), Sa = class e {
		constructor(e) {
			this.anchor = e;
		}
		map(t) {
			let { deleted: n, pos: r } = t.mapResult(this.anchor);
			return n ? new xa(r, r) : new e(r);
		}
		resolve(e) {
			let t = e.resolve(this.anchor), n = t.nodeAfter;
			return n && I.isSelectable(n) ? new I(t) : P.near(t);
		}
	}, Ca = class e extends P {
		constructor(e) {
			super(e.resolve(0), e.resolve(e.content.size));
		}
		replace(e, t = N.empty) {
			if (t == N.empty) {
				e.delete(0, e.doc.content.size);
				let t = P.atStart(e.doc);
				t.eq(e.selection) || e.setSelection(t);
			} else super.replace(e, t);
		}
		toJSON() {
			return { type: "all" };
		}
		static fromJSON(t) {
			return new e(t);
		}
		map(t) {
			return new e(t);
		}
		eq(t) {
			return t instanceof e;
		}
		getBookmark() {
			return wa;
		}
	}, P.jsonID("all", Ca), wa = {
		map() {
			return this;
		},
		resolve(e) {
			return new Ca(e);
		}
	}, Ta = 1, Ea = 2, Da = 4, Oa = class extends la {
		constructor(e) {
			super(e.doc), this.curSelectionFor = 0, this.updated = 0, this.meta = Object.create(null), this.time = Date.now(), this.curSelection = e.selection, this.storedMarks = e.storedMarks;
		}
		get selection() {
			return this.curSelectionFor < this.steps.length && (this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor)), this.curSelectionFor = this.steps.length), this.curSelection;
		}
		setSelection(e) {
			if (e.$from.doc != this.doc) throw RangeError("Selection passed to setSelection must point at the current document");
			return this.curSelection = e, this.curSelectionFor = this.steps.length, this.updated = (this.updated | Ta) & -3, this.storedMarks = null, this;
		}
		get selectionSet() {
			return (this.updated & Ta) > 0;
		}
		setStoredMarks(e) {
			return this.storedMarks = e, this.updated |= Ea, this;
		}
		ensureMarks(e) {
			return M.sameSet(this.storedMarks || this.selection.$from.marks(), e) || this.setStoredMarks(e), this;
		}
		addStoredMark(e) {
			return this.ensureMarks(e.addToSet(this.storedMarks || this.selection.$head.marks()));
		}
		removeStoredMark(e) {
			return this.ensureMarks(e.removeFromSet(this.storedMarks || this.selection.$head.marks()));
		}
		get storedMarksSet() {
			return (this.updated & Ea) > 0;
		}
		addStep(e, t) {
			super.addStep(e, t), this.updated &= -3, this.storedMarks = null;
		}
		setTime(e) {
			return this.time = e, this;
		}
		replaceSelection(e) {
			return this.selection.replace(this, e), this;
		}
		replaceSelectionWith(e, t = !0) {
			let n = this.selection;
			return t && (e = e.mark(this.storedMarks || (n.empty ? n.$from.marks() : n.$from.marksAcross(n.$to) || M.none))), n.replaceWith(this, e), this;
		}
		deleteSelection() {
			return this.selection.replace(this), this;
		}
		insertText(e, t, n) {
			let r = this.doc.type.schema;
			if (t == null) return e ? this.replaceSelectionWith(r.text(e), !0) : this.deleteSelection();
			{
				if (n ??= t, !e) return this.deleteRange(t, n);
				let i = this.storedMarks;
				if (!i) {
					let e = this.doc.resolve(t);
					i = n == t ? e.marks() : e.marksAcross(this.doc.resolve(n));
				}
				return this.replaceRangeWith(t, n, r.text(e, i)), !this.selection.empty && this.selection.to == t + e.length && this.setSelection(P.near(this.selection.$to)), this;
			}
		}
		setMeta(e, t) {
			return this.meta[typeof e == "string" ? e : e.key] = t, this;
		}
		getMeta(e) {
			return this.meta[typeof e == "string" ? e : e.key];
		}
		get isGeneric() {
			for (let e in this.meta) return !1;
			return !0;
		}
		scrollIntoView() {
			return this.updated |= Da, this;
		}
		get scrolledIntoView() {
			return (this.updated & Da) > 0;
		}
	}, ka = class {
		constructor(e, t, n) {
			this.name = e, this.init = ha(t.init, n), this.apply = ha(t.apply, n);
		}
	}, Aa = [
		new ka("doc", {
			init(e) {
				return e.doc || e.schema.topNodeType.createAndFill();
			},
			apply(e) {
				return e.doc;
			}
		}),
		new ka("selection", {
			init(e, t) {
				return e.selection || P.atStart(t.doc);
			},
			apply(e) {
				return e.selection;
			}
		}),
		new ka("storedMarks", {
			init(e) {
				return e.storedMarks || null;
			},
			apply(e, t, n, r) {
				return r.selection.$cursor ? e.storedMarks : null;
			}
		}),
		new ka("scrollToSelection", {
			init() {
				return 0;
			},
			apply(e, t) {
				return e.scrolledIntoView ? t + 1 : t;
			}
		})
	], ja = class {
		constructor(e, t) {
			this.schema = e, this.plugins = [], this.pluginsByKey = Object.create(null), this.fields = Aa.slice(), t && t.forEach((e) => {
				if (this.pluginsByKey[e.key]) throw RangeError("Adding different instances of a keyed plugin (" + e.key + ")");
				this.plugins.push(e), this.pluginsByKey[e.key] = e, e.spec.state && this.fields.push(new ka(e.key, e.spec.state, e));
			});
		}
	}, Ma = class e {
		constructor(e) {
			this.config = e;
		}
		get schema() {
			return this.config.schema;
		}
		get plugins() {
			return this.config.plugins;
		}
		apply(e) {
			return this.applyTransaction(e).state;
		}
		filterTransaction(e, t = -1) {
			for (let n = 0; n < this.config.plugins.length; n++) if (n != t) {
				let t = this.config.plugins[n];
				if (t.spec.filterTransaction && !t.spec.filterTransaction.call(t, e, this)) return !1;
			}
			return !0;
		}
		applyTransaction(e) {
			if (!this.filterTransaction(e)) return {
				state: this,
				transactions: []
			};
			let t = [e], n = this.applyInner(e), r = null;
			for (;;) {
				let i = !1;
				for (let a = 0; a < this.config.plugins.length; a++) {
					let o = this.config.plugins[a];
					if (o.spec.appendTransaction) {
						let s = r ? r[a].n : 0, c = r ? r[a].state : this, l = s < t.length && o.spec.appendTransaction.call(o, s ? t.slice(s) : t, c, n);
						if (l && n.filterTransaction(l, a)) {
							if (l.setMeta("appendedTransaction", e), !r) {
								r = [];
								for (let e = 0; e < this.config.plugins.length; e++) r.push(e < a ? {
									state: n,
									n: t.length
								} : {
									state: this,
									n: 0
								});
							}
							t.push(l), n = n.applyInner(l), i = !0;
						}
						r && (r[a] = {
							state: n,
							n: t.length
						});
					}
				}
				if (!i) return {
					state: n,
					transactions: t
				};
			}
		}
		applyInner(t) {
			if (!t.before.eq(this.doc)) throw RangeError("Applying a mismatched transaction");
			let n = new e(this.config), r = this.config.fields;
			for (let e = 0; e < r.length; e++) {
				let i = r[e];
				n[i.name] = i.apply(t, this[i.name], this, n);
			}
			return n;
		}
		get tr() {
			return new Oa(this);
		}
		static create(t) {
			let n = new ja(t.doc ? t.doc.type.schema : t.schema, t.plugins), r = new e(n);
			for (let e = 0; e < n.fields.length; e++) r[n.fields[e].name] = n.fields[e].init(t, r);
			return r;
		}
		reconfigure(t) {
			let n = new ja(this.schema, t.plugins), r = n.fields, i = new e(n);
			for (let e = 0; e < r.length; e++) {
				let n = r[e].name;
				i[n] = this.hasOwnProperty(n) ? this[n] : r[e].init(t, i);
			}
			return i;
		}
		toJSON(e) {
			let t = {
				doc: this.doc.toJSON(),
				selection: this.selection.toJSON()
			};
			if (this.storedMarks && (t.storedMarks = this.storedMarks.map((e) => e.toJSON())), e && typeof e == "object") for (let n in e) {
				if (n == "doc" || n == "selection") throw RangeError("The JSON fields `doc` and `selection` are reserved");
				let r = e[n], i = r.spec.state;
				i && i.toJSON && (t[n] = i.toJSON.call(r, this[r.key]));
			}
			return t;
		}
		static fromJSON(t, n, r) {
			if (!n) throw RangeError("Invalid input for EditorState.fromJSON");
			if (!t.schema) throw RangeError("Required config field 'schema' missing");
			let i = new ja(t.schema, t.plugins), a = new e(i);
			return i.fields.forEach((e) => {
				if (e.name == "doc") a.doc = jr.fromJSON(t.schema, n.doc);
				else if (e.name == "selection") a.selection = P.fromJSON(a.doc, n.selection);
				else if (e.name == "storedMarks") n.storedMarks && (a.storedMarks = n.storedMarks.map(t.schema.markFromJSON));
				else {
					if (r) for (let i in r) {
						let o = r[i], s = o.spec.state;
						if (o.key == e.name && s && s.fromJSON && Object.prototype.hasOwnProperty.call(n, i)) {
							a[e.name] = s.fromJSON.call(o, t, n[i], a);
							return;
						}
					}
					a[e.name] = e.init(t, a);
				}
			}), a;
		}
	}, L = class {
		constructor(e) {
			this.spec = e, this.props = {}, e.props && ga(e.props, this, this.props), this.key = e.key ? e.key.key : _a("plugin");
		}
		getState(e) {
			return e[this.key];
		}
	}, Na = Object.create(null), R = class {
		constructor(e = "key") {
			this.key = _a(e);
		}
		get(e) {
			return e.config.pluginsByKey[this.key];
		}
		getState(e) {
			return e[this.key];
		}
	};
}));
//#endregion
//#region ../../node_modules/prosemirror-commands/dist/index.js
function Fa(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("backward", e) : n.parentOffset > 0) ? null : n;
}
function Ia(e, t, n) {
	let r = t.nodeBefore, i = t.pos - 1;
	for (; !r.isTextblock; i--) {
		if (r.type.spec.isolating) return !1;
		let e = r.lastChild;
		if (!e) return !1;
		r = e;
	}
	let a = t.nodeAfter, o = t.pos + 1;
	for (; !a.isTextblock; o++) {
		if (a.type.spec.isolating) return !1;
		let e = a.firstChild;
		if (!e) return !1;
		a = e;
	}
	let s = Di(e.doc, i, o, N.empty);
	if (!s || s.from != i || s instanceof ra && s.slice.size >= o - i) return !1;
	if (n) {
		let t = e.tr.step(s);
		t.setSelection(F.create(t.doc, i)), n(t.scrollIntoView());
	}
	return !0;
}
function La(e, t, n = !1) {
	for (let r = e; r; r = t == "start" ? r.firstChild : r.lastChild) {
		if (r.isTextblock) return !0;
		if (n && r.childCount != 1) return !1;
	}
	return !1;
}
function Ra(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		if (e.index(t) > 0) return e.doc.resolve(e.before(t + 1));
		if (e.node(t).type.spec.isolating) break;
	}
	return null;
}
function za(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("forward", e) : n.parentOffset < n.parent.content.size) ? null : n;
}
function Ba(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		let n = e.node(t);
		if (e.index(t) + 1 < n.childCount) return e.doc.resolve(e.after(t + 1));
		if (n.type.spec.isolating) break;
	}
	return null;
}
function Va(e) {
	for (let t = 0; t < e.edgeCount; t++) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
function Ha(e) {
	return (t, n) => {
		if (t.selection instanceof I && t.selection.node.isBlock) {
			let { $from: e } = t.selection;
			return !e.parentOffset || !vi(t.doc, e.pos) ? !1 : (n && n(t.tr.split(e.pos).scrollIntoView()), !0);
		}
		if (!t.selection.$from.depth) return !1;
		let r = t.tr;
		!t.selection.empty && (t.selection instanceof F || t.selection instanceof Ca) && r.deleteSelection();
		let { $from: i } = r.selection, a = r.steps.length, o = [], s, c, l = !1, u = !1;
		for (let t = i.depth;; t--) if (i.node(t).isBlock) {
			l = i.end(t) == i.pos + (i.depth - t), u = i.start(t) == i.pos - (i.depth - t), c = Va(i.node(t - 1).contentMatchAt(i.indexAfter(t - 1)));
			let n = e && e(i.parent, l, i);
			o.unshift(n || (l && c ? { type: c } : null)), s = t;
			break;
		} else {
			if (t == 1) return !1;
			o.unshift(null);
		}
		let d = i.pos, f = vi(r.doc, d, o.length, o);
		if (f ||= (o[0] = c ? { type: c } : null, vi(r.doc, d, o.length, o)), !f) return !1;
		if (r.split(d, o.length, o), !l && u && i.node(s).type != c) {
			let e = r.mapping.slice(a), t = e.map(i.before(s)), n = r.doc.resolve(t);
			c && i.node(s - 1).canReplaceWith(n.index(), n.index() + 1, c) && r.setNodeMarkup(e.map(i.before(s)), c);
		}
		return n && n(r.scrollIntoView()), !0;
	};
}
function Ua(e, t, n) {
	let r = t.nodeBefore, i = t.nodeAfter, a = t.index();
	return !r || !i || !r.type.compatibleContent(i.type) ? !1 : !r.content.size && t.parent.canReplace(a - 1, a) ? (n && n(e.tr.delete(t.pos - r.nodeSize, t.pos).scrollIntoView()), !0) : !t.parent.canReplace(a, a + 1) || !(i.isTextblock || bi(e.doc, t.pos)) ? !1 : (n && n(e.tr.join(t.pos).scrollIntoView()), !0);
}
function Wa(e, t, n, r) {
	let i = t.nodeBefore, a = t.nodeAfter, o, s, c = i.type.spec.isolating || a.type.spec.isolating;
	if (!c && Ua(e, t, n)) return !0;
	let l = !c && t.parent.canReplace(t.index(), t.index() + 1);
	if (l && (o = (s = i.contentMatchAt(i.childCount)).findWrapping(a.type)) && s.matchType(o[0] || a.type).validEnd) {
		if (n) {
			let r = t.pos + a.nodeSize, s = j.empty;
			for (let e = o.length - 1; e >= 0; e--) s = j.from(o[e].create(null, s));
			s = j.from(i.copy(s));
			let c = e.tr.step(new ia(t.pos - 1, r, t.pos, r, new N(s, 1, 0), o.length, !0)), l = c.doc.resolve(r + 2 * o.length);
			l.nodeAfter && l.nodeAfter.type == i.type && bi(c.doc, l.pos) && c.join(l.pos), n(c.scrollIntoView());
		}
		return !0;
	}
	let u = a.type.spec.isolating || r > 0 && c ? null : P.findFrom(t, 1), d = u && u.$from.blockRange(u.$to), f = d && oi(d);
	if (f != null && f >= t.depth) return n && n(e.tr.lift(d, f).scrollIntoView()), !0;
	if (l && La(a, "start", !0) && La(i, "end")) {
		let r = i, o = [];
		for (; o.push(r), !r.isTextblock;) r = r.lastChild;
		let s = a, c = 1;
		for (; !s.isTextblock; s = s.firstChild) c++;
		if (r.canReplace(r.childCount, r.childCount, s.content)) {
			if (n) {
				let r = j.empty;
				for (let e = o.length - 1; e >= 0; e--) r = j.from(o[e].copy(r));
				n(e.tr.step(new ia(t.pos - o.length, t.pos + a.nodeSize, t.pos + c, t.pos + a.nodeSize - c, new N(r, o.length, 0), 0, !0)).scrollIntoView());
			}
			return !0;
		}
	}
	return !1;
}
function Ga(e) {
	return function(t, n) {
		let r = t.selection, i = e < 0 ? r.$from : r.$to, a = i.depth;
		for (; i.node(a).isInline;) {
			if (!a) return !1;
			a--;
		}
		return i.node(a).isTextblock ? (n && n(t.tr.setSelection(F.create(t.doc, e < 0 ? i.start(a) : i.end(a)))), !0) : !1;
	};
}
function Ka(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a), s = o && ci(o, e, t);
		return s ? (r && r(n.tr.wrap(o, s).scrollIntoView()), !0) : !1;
	};
}
function qa(e, t = null) {
	return function(n, r) {
		let i = !1;
		for (let r = 0; r < n.selection.ranges.length && !i; r++) {
			let { $from: { pos: a }, $to: { pos: o } } = n.selection.ranges[r];
			n.doc.nodesBetween(a, o, (r, a) => {
				if (i) return !1;
				if (!(!r.isTextblock || r.hasMarkup(e, t))) if (r.type == e) i = !0;
				else {
					let t = n.doc.resolve(a), r = t.index();
					i = t.parent.canReplaceWith(r, r + 1, e);
				}
			});
		}
		if (!i) return !1;
		if (r) {
			let i = n.tr;
			for (let r = 0; r < n.selection.ranges.length; r++) {
				let { $from: { pos: a }, $to: { pos: o } } = n.selection.ranges[r];
				i.setBlockType(a, o, e, t);
			}
			r(i.scrollIntoView());
		}
		return !0;
	};
}
function Ja(...e) {
	return function(t, n, r) {
		for (let i = 0; i < e.length; i++) if (e[i](t, n, r)) return !0;
		return !1;
	};
}
var Ya, Xa, Za, Qa, $a, eo, to, no, ro, io, ao, oo, so, co, lo, uo, fo, po, mo, ho, go, _o, vo, yo = S((() => {
	ua(), Xr(), Pa(), Ya = (e, t) => !e.selection.empty && (t && t(e.tr.deleteSelection().scrollIntoView()), !0), Xa = (e, t, n) => {
		let r = Fa(e, n);
		if (!r) return !1;
		let i = Ra(r);
		if (!i) {
			let n = r.blockRange(), i = n && oi(n);
			return i != null && (t && t(e.tr.lift(n, i).scrollIntoView()), !0);
		}
		let a = i.nodeBefore;
		if (Wa(e, i, t, -1)) return !0;
		if (r.parent.content.size == 0 && (La(a, "end") || I.isSelectable(a))) for (let n = r.depth;; n--) {
			let o = Di(e.doc, r.before(n), r.after(n), N.empty);
			if (o && o.slice.size < o.to - o.from) {
				if (t) {
					let n = e.tr.step(o);
					n.setSelection(La(a, "end") ? P.findFrom(n.doc.resolve(n.mapping.map(i.pos, -1)), -1) : I.create(n.doc, i.pos - a.nodeSize)), t(n.scrollIntoView());
				}
				return !0;
			}
			if (n == 1 || r.node(n - 1).childCount > 1) break;
		}
		return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos - a.nodeSize, i.pos).scrollIntoView()), !0) : !1;
	}, Za = (e, t, n) => {
		let r = Fa(e, n);
		if (!r) return !1;
		let i = Ra(r);
		return i ? Ia(e, i, t) : !1;
	}, Qa = (e, t, n) => {
		let r = za(e, n);
		if (!r) return !1;
		let i = Ba(r);
		return i ? Ia(e, i, t) : !1;
	}, $a = (e, t, n) => {
		let { $head: r, empty: i } = e.selection, a = r;
		if (!i) return !1;
		if (r.parent.isTextblock) {
			if (n ? !n.endOfTextblock("backward", e) : r.parentOffset > 0) return !1;
			a = Ra(r);
		}
		let o = a && a.nodeBefore;
		return !o || !I.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(I.create(e.doc, a.pos - o.nodeSize)).scrollIntoView()), !0);
	}, eo = (e, t, n) => {
		let r = za(e, n);
		if (!r) return !1;
		let i = Ba(r);
		if (!i) return !1;
		let a = i.nodeAfter;
		if (Wa(e, i, t, 1)) return !0;
		if (r.parent.content.size == 0 && (La(a, "start") || I.isSelectable(a))) {
			let n = Di(e.doc, r.before(), r.after(), N.empty);
			if (n && n.slice.size < n.to - n.from) {
				if (t) {
					let r = e.tr.step(n);
					r.setSelection(La(a, "start") ? P.findFrom(r.doc.resolve(r.mapping.map(i.pos)), 1) : I.create(r.doc, r.mapping.map(i.pos))), t(r.scrollIntoView());
				}
				return !0;
			}
		}
		return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos, i.pos + a.nodeSize).scrollIntoView()), !0) : !1;
	}, to = (e, t, n) => {
		let { $head: r, empty: i } = e.selection, a = r;
		if (!i) return !1;
		if (r.parent.isTextblock) {
			if (n ? !n.endOfTextblock("forward", e) : r.parentOffset < r.parent.content.size) return !1;
			a = Ba(r);
		}
		let o = a && a.nodeAfter;
		return !o || !I.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(I.create(e.doc, a.pos)).scrollIntoView()), !0);
	}, no = (e, t) => {
		let n = e.selection, r = n instanceof I, i;
		if (r) {
			if (n.node.isTextblock || !bi(e.doc, n.from)) return !1;
			i = n.from;
		} else if (i = Ci(e.doc, n.from, -1), i == null) return !1;
		if (t) {
			let n = e.tr.join(i);
			r && n.setSelection(I.create(n.doc, i - e.doc.resolve(i).nodeBefore.nodeSize)), t(n.scrollIntoView());
		}
		return !0;
	}, ro = (e, t) => {
		let n = e.selection, r;
		if (n instanceof I) {
			if (n.node.isTextblock || !bi(e.doc, n.to)) return !1;
			r = n.to;
		} else if (r = Ci(e.doc, n.to, 1), r == null) return !1;
		return t && t(e.tr.join(r).scrollIntoView()), !0;
	}, io = (e, t) => {
		let { $from: n, $to: r } = e.selection, i = n.blockRange(r), a = i && oi(i);
		return a != null && (t && t(e.tr.lift(i, a).scrollIntoView()), !0);
	}, ao = (e, t) => {
		let { $head: n, $anchor: r } = e.selection;
		return !n.parent.type.spec.code || !n.sameParent(r) ? !1 : (t && t(e.tr.insertText("\n").scrollIntoView()), !0);
	}, oo = (e, t) => {
		let { $head: n, $anchor: r } = e.selection;
		if (!n.parent.type.spec.code || !n.sameParent(r)) return !1;
		let i = n.node(-1), a = n.indexAfter(-1), o = Va(i.contentMatchAt(a));
		if (!o || !i.canReplaceWith(a, a, o)) return !1;
		if (t) {
			let r = n.after(), i = e.tr.replaceWith(r, r, o.createAndFill());
			i.setSelection(P.near(i.doc.resolve(r), 1)), t(i.scrollIntoView());
		}
		return !0;
	}, so = (e, t) => {
		let n = e.selection, { $from: r, $to: i } = n;
		if (n instanceof Ca || r.parent.inlineContent || i.parent.inlineContent) return !1;
		let a = Va(i.parent.contentMatchAt(i.indexAfter()));
		if (!a || !a.isTextblock) return !1;
		if (t) {
			let n = (!r.parentOffset && i.index() < i.parent.childCount ? r : i).pos, o = e.tr.insert(n, a.createAndFill());
			o.setSelection(F.create(o.doc, n + 1)), t(o.scrollIntoView());
		}
		return !0;
	}, co = (e, t) => {
		let { $cursor: n } = e.selection;
		if (!n || n.parent.content.size) return !1;
		if (n.depth > 1 && n.after() != n.end(-1)) {
			let r = n.before();
			if (vi(e.doc, r)) return t && t(e.tr.split(r).scrollIntoView()), !0;
		}
		let r = n.blockRange(), i = r && oi(r);
		return i != null && (t && t(e.tr.lift(r, i).scrollIntoView()), !0);
	}, lo = Ha(), uo = (e, t) => {
		let { $from: n, to: r } = e.selection, i, a = n.sharedDepth(r);
		return a != 0 && (i = n.before(a), t && t(e.tr.setSelection(I.create(e.doc, i))), !0);
	}, fo = (e, t) => (t && t(e.tr.setSelection(new Ca(e.doc))), !0), po = Ga(-1), mo = Ga(1), ho = Ja(Ya, Xa, $a), go = Ja(Ya, eo, to), _o = {
		Enter: Ja(ao, so, co, lo),
		"Mod-Enter": oo,
		Backspace: ho,
		"Mod-Backspace": ho,
		"Shift-Backspace": ho,
		Delete: go,
		"Mod-Delete": go,
		"Mod-a": fo
	}, vo = {
		"Ctrl-h": _o.Backspace,
		"Alt-Backspace": _o["Mod-Backspace"],
		"Ctrl-d": _o.Delete,
		"Ctrl-Alt-Backspace": _o["Mod-Delete"],
		"Alt-Delete": _o["Mod-Delete"],
		"Alt-d": _o["Mod-Delete"],
		"Ctrl-a": po,
		"Ctrl-e": mo
	};
	for (let e in _o) vo[e] = _o[e];
	typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform();
})), bo = S((() => {
	yo();
})), xo = S((() => {
	Pa();
})), So = S((() => {
	Xr();
}));
//#endregion
//#region ../../node_modules/prosemirror-schema-list/dist/index.js
function Co(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a);
		if (!o) return !1;
		let s = r ? n.tr : null;
		return wo(s, o, e, t) ? (r && r(s.scrollIntoView()), !0) : !1;
	};
}
function wo(e, t, n, r = null) {
	let i = !1, a = t, o = t.$from.doc;
	if (t.depth >= 2 && t.$from.node(t.depth - 1).type.compatibleContent(n) && t.startIndex == 0) {
		if (t.$from.index(t.depth - 1) == 0) return !1;
		let e = o.resolve(t.start - 2);
		a = new kr(e, e, t.depth), t.endIndex < t.parent.childCount && (t = new kr(t.$from, o.resolve(t.$to.end(t.depth)), t.depth)), i = !0;
	}
	let s = ci(a, n, r, t);
	return s ? (e && To(e, t, s, i, n), !0) : !1;
}
function To(e, t, n, r, i) {
	let a = j.empty;
	for (let e = n.length - 1; e >= 0; e--) a = j.from(n[e].type.create(n[e].attrs, a));
	e.step(new ia(t.start - (r ? 2 : 0), t.end, t.start, t.end, new N(a, 0, 0), n.length, !0));
	let o = 0;
	for (let e = 0; e < n.length; e++) n[e].type == i && (o = e + 1);
	let s = n.length - o, c = t.start + n.length - (r ? 2 : 0), l = t.parent;
	for (let n = t.startIndex, r = t.endIndex, i = !0; n < r; n++, i = !1) !i && vi(e.doc, c, s) && (e.split(c, s), c += 2 * s), c += l.child(n).nodeSize;
	return e;
}
function Eo(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && t.firstChild.type == e);
		return a ? n ? r.node(a.depth - 1).type == e ? Do(t, n, e, a) : Oo(t, n, a) : !0 : !1;
	};
}
function Do(e, t, n, r) {
	let i = e.tr, a = r.end, o = r.$to.end(r.depth);
	a < o && (i.step(new ia(a - 1, o, a, o, new N(j.from(n.create(null, r.parent.copy())), 1, 0), 1, !0)), r = new kr(i.doc.resolve(r.$from.pos), i.doc.resolve(o), r.depth));
	let s = oi(r);
	if (s == null) return !1;
	i.lift(r, s);
	let c = i.doc.resolve(i.mapping.map(a, -1) - 1);
	return bi(i.doc, c.pos) && c.nodeBefore.type == c.nodeAfter.type && i.join(c.pos), t(i.scrollIntoView()), !0;
}
function Oo(e, t, n) {
	let r = e.tr, i = n.parent;
	for (let e = n.end, t = n.endIndex - 1, a = n.startIndex; t > a; t--) e -= i.child(t).nodeSize, r.delete(e - 1, e + 1);
	let a = r.doc.resolve(n.start), o = a.nodeAfter;
	if (r.mapping.map(n.end) != n.start + a.nodeAfter.nodeSize) return !1;
	let s = n.startIndex == 0, c = n.endIndex == i.childCount, l = a.node(-1), u = a.index(-1);
	if (!l.canReplace(u + +!s, u + 1, o.content.append(c ? j.empty : j.from(i)))) return !1;
	let d = a.pos, f = d + o.nodeSize;
	return r.step(new ia(d - +!!s, f + +!!c, d + 1, f - 1, new N((s ? j.empty : j.from(i.copy(j.empty))).append(c ? j.empty : j.from(i.copy(j.empty))), +!s, +!c), +!s)), t(r.scrollIntoView()), !0;
}
function ko(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && t.firstChild.type == e);
		if (!a) return !1;
		let o = a.startIndex;
		if (o == 0) return !1;
		let s = a.parent, c = s.child(o - 1);
		if (c.type != e) return !1;
		if (n) {
			let r = c.lastChild && c.lastChild.type == s.type, i = j.from(r ? e.create() : null), o = new N(j.from(e.create(null, j.from(s.type.create(null, i)))), r ? 3 : 1, 0), l = a.start, u = a.end;
			n(t.tr.step(new ia(l - (r ? 3 : 1), u, l, u, o, 1, !0)).scrollIntoView());
		}
		return !0;
	};
}
var Ao = S((() => {
	ua(), Xr();
})), jo = S((() => {
	Ao();
}));
//#endregion
//#region ../../node_modules/prosemirror-view/dist/index.js
function Mo(e, t, n, r, i) {
	for (;;) {
		if (e == n && t == r) return !0;
		if (t == (i < 0 ? 0 : No(e))) {
			let n = e.parentNode;
			if (!n || n.nodeType != 1 || Lo(e) || Nl.test(e.nodeName) || e.contentEditable == "false") return !1;
			t = z(e) + (i < 0 ? 0 : 1), e = n;
		} else if (e.nodeType == 1) {
			let n = e.childNodes[t + (i < 0 ? -1 : 0)];
			if (n.nodeType == 1 && n.contentEditable == "false") if (n.pmViewDesc?.ignoreForSelection) t += i;
			else return !1;
			else e = n, t = i < 0 ? No(e) : 0;
		} else return !1;
	}
}
function No(e) {
	return e.nodeType == 3 ? e.nodeValue.length : e.childNodes.length;
}
function Po(e, t) {
	for (;;) {
		if (e.nodeType == 3 && t) return e;
		if (e.nodeType == 1 && t > 0) {
			if (e.contentEditable == "false") return null;
			e = e.childNodes[t - 1], t = No(e);
		} else if (e.parentNode && !Lo(e)) t = z(e), e = e.parentNode;
		else return null;
	}
}
function Fo(e, t) {
	for (;;) {
		if (e.nodeType == 3 && t < e.nodeValue.length) return e;
		if (e.nodeType == 1 && t < e.childNodes.length) {
			if (e.contentEditable == "false") return null;
			e = e.childNodes[t], t = 0;
		} else if (e.parentNode && !Lo(e)) t = z(e) + 1, e = e.parentNode;
		else return null;
	}
}
function Io(e, t, n) {
	for (let r = t == 0, i = t == No(e); r || i;) {
		if (e == n) return !0;
		let t = z(e);
		if (e = e.parentNode, !e) return !1;
		r &&= t == 0, i &&= t == No(e);
	}
}
function Lo(e) {
	let t;
	for (let n = e; n && !(t = n.pmViewDesc); n = n.parentNode);
	return t && t.node && t.node.isBlock && (t.dom == e || t.contentDOM == e);
}
function Ro(e, t) {
	let n = document.createEvent("Event");
	return n.initEvent("keydown", !0, !0), n.keyCode = e, n.key = n.code = t, n;
}
function zo(e) {
	let t = e.activeElement;
	for (; t && t.shadowRoot;) t = t.shadowRoot.activeElement;
	return t;
}
function Bo(e, t, n) {
	if (e.caretPositionFromPoint) try {
		let r = e.caretPositionFromPoint(t, n);
		if (r) return {
			node: r.offsetNode,
			offset: Math.min(No(r.offsetNode), r.offset)
		};
	} catch {}
	if (e.caretRangeFromPoint) {
		let r = e.caretRangeFromPoint(t, n);
		if (r) return {
			node: r.startContainer,
			offset: Math.min(No(r.startContainer), r.startOffset)
		};
	}
}
function Vo(e) {
	let t = e.defaultView && e.defaultView.visualViewport;
	return t ? {
		left: 0,
		right: t.width,
		top: 0,
		bottom: t.height
	} : {
		left: 0,
		right: e.documentElement.clientWidth,
		top: 0,
		bottom: e.documentElement.clientHeight
	};
}
function Ho(e, t) {
	return typeof e == "number" ? e : e[t];
}
function Uo(e) {
	let t = e.getBoundingClientRect(), n = t.width / e.offsetWidth || 1, r = t.height / e.offsetHeight || 1;
	return {
		left: t.left,
		right: t.left + e.clientWidth * n,
		top: t.top,
		bottom: t.top + e.clientHeight * r
	};
}
function Wo(e, t, n) {
	if (!is(t) && t.left == 0) return;
	let r = e.someProp("scrollThreshold") || 0, i = e.someProp("scrollMargin") || 5, a = e.dom.ownerDocument;
	for (let o = n || e.dom; o;) {
		if (o.nodeType != 1) {
			o = Ol(o);
			continue;
		}
		let e = o, n = e == a.body, s = n ? Vo(a) : Uo(e), c = 0, l = 0;
		if (t.top < s.top + Ho(r, "top") ? l = -(s.top - t.top + Ho(i, "top")) : t.bottom > s.bottom - Ho(r, "bottom") && (l = t.bottom - t.top > s.bottom - s.top ? t.top + Ho(i, "top") - s.top : t.bottom - s.bottom + Ho(i, "bottom")), t.left < s.left + Ho(r, "left") ? c = -(s.left - t.left + Ho(i, "left")) : t.right > s.right - Ho(r, "right") && (c = t.right - s.right + Ho(i, "right")), c || l) if (n) a.defaultView.scrollBy(c, l);
		else {
			let n = e.scrollLeft, r = e.scrollTop;
			l && (e.scrollTop += l), c && (e.scrollLeft += c);
			let i = e.scrollLeft - n, a = e.scrollTop - r;
			t = {
				left: t.left - i,
				top: t.top - a,
				right: t.right - i,
				bottom: t.bottom - a
			};
		}
		let u = n ? "fixed" : getComputedStyle(o).position;
		if (/^(fixed|sticky)$/.test(u)) break;
		o = u == "absolute" ? o.offsetParent : Ol(o);
	}
}
function Go(e) {
	let t = e.dom.getBoundingClientRect(), n = Math.max(0, t.top), r, i;
	for (let a = (t.left + t.right) / 2, o = n + 1; o < Math.min(innerHeight, t.bottom); o += 5) {
		let t = e.root.elementFromPoint(a, o);
		if (!t || t == e.dom || !e.dom.contains(t)) continue;
		let s = t.getBoundingClientRect();
		if (s.top >= n - 20) {
			r = t, i = s.top;
			break;
		}
	}
	return {
		refDOM: r,
		refTop: i,
		stack: Ko(e.dom)
	};
}
function Ko(e) {
	let t = [], n = e.ownerDocument;
	for (let r = e; r && (t.push({
		dom: r,
		top: r.scrollTop,
		left: r.scrollLeft
	}), e != n); r = Ol(r));
	return t;
}
function qo({ refDOM: e, refTop: t, stack: n }) {
	let r = e ? e.getBoundingClientRect().top : 0;
	Jo(n, r == 0 ? 0 : r - t);
}
function Jo(e, t) {
	for (let n = 0; n < e.length; n++) {
		let { dom: r, top: i, left: a } = e[n];
		r.scrollTop != i + t && (r.scrollTop = i + t), r.scrollLeft != a && (r.scrollLeft = a);
	}
}
function Yo(e) {
	if (e.setActive) return e.setActive();
	if ($l) return e.focus($l);
	let t = Ko(e);
	e.focus($l == null ? { get preventScroll() {
		return $l = { preventScroll: !0 }, !0;
	} } : void 0), $l || ($l = !1, Jo(t, 0));
}
function Xo(e, t) {
	let n, r = 2e8, i, a = 0, o = t.top, s = t.top, c, l;
	for (let u = e.firstChild, d = 0; u; u = u.nextSibling, d++) {
		let e;
		if (u.nodeType == 1) e = u.getClientRects();
		else if (u.nodeType == 3) e = Al(u).getClientRects();
		else continue;
		for (let f = 0; f < e.length; f++) {
			let p = e[f];
			if (p.top <= o && p.bottom >= s) {
				o = Math.max(p.bottom, o), s = Math.min(p.top, s);
				let e = p.left > t.left ? p.left - t.left : p.right < t.left ? t.left - p.right : 0;
				if (e < r) {
					n = u, r = e, i = e && n.nodeType == 3 ? {
						left: p.right < t.left ? p.right : p.left,
						top: t.top
					} : t, u.nodeType == 1 && e && (a = d + +(t.left >= (p.left + p.right) / 2));
					continue;
				}
			} else p.top > t.top && !c && p.left <= t.left && p.right >= t.left && (c = u, l = {
				left: Math.max(p.left, Math.min(p.right, t.left)),
				top: p.top
			});
			!n && (t.left >= p.right && t.top >= p.top || t.left >= p.left && t.top >= p.bottom) && (a = d + 1);
		}
	}
	return !n && c && (n = c, i = l, r = 0), n && n.nodeType == 3 ? Zo(n, i) : !n || r && n.nodeType == 1 ? {
		node: e,
		offset: a
	} : Xo(n, i);
}
function Zo(e, t) {
	let n = e.nodeValue.length, r = document.createRange(), i;
	for (let a = 0; a < n; a++) {
		r.setEnd(e, a + 1), r.setStart(e, a);
		let n = as(r, 1);
		if (n.top != n.bottom && Qo(t, n)) {
			i = {
				node: e,
				offset: a + +(t.left >= (n.left + n.right) / 2)
			};
			break;
		}
	}
	return r.detach(), i || {
		node: e,
		offset: 0
	};
}
function Qo(e, t) {
	return e.left >= t.left - 1 && e.left <= t.right + 1 && e.top >= t.top - 1 && e.top <= t.bottom + 1;
}
function $o(e, t) {
	let n = e.parentNode;
	return n && /^li$/i.test(n.nodeName) && t.left < e.getBoundingClientRect().left ? n : e;
}
function es(e, t, n) {
	let { node: r, offset: i } = Xo(t, n), a = -1;
	if (r.nodeType == 1 && !r.firstChild) {
		let e = r.getBoundingClientRect();
		a = e.left != e.right && n.left > (e.left + e.right) / 2 ? 1 : -1;
	}
	return e.docView.posFromDOM(r, i, a);
}
function ts(e, t, n, r) {
	let i = -1;
	for (let n = t, a = !1; n != e.dom;) {
		let t = e.docView.nearestDesc(n, !0), o;
		if (!t) return null;
		if (t.dom.nodeType == 1 && (t.node.isBlock && t.parent || !t.contentDOM) && ((o = t.dom.getBoundingClientRect()).width || o.height) && (t.node.isBlock && t.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(t.dom.nodeName) && (!a && o.left > r.left || o.top > r.top ? i = t.posBefore : (!a && o.right < r.left || o.bottom < r.top) && (i = t.posAfter), a = !0), !t.contentDOM && i < 0 && !t.node.isText)) return (t.node.isBlock ? r.top < (o.top + o.bottom) / 2 : r.left < (o.left + o.right) / 2) ? t.posBefore : t.posAfter;
		n = t.dom.parentNode;
	}
	return i > -1 ? i : e.docView.posFromDOM(t, n, -1);
}
function ns(e, t, n) {
	let r = e.childNodes.length;
	if (r && n.top < n.bottom) for (let i = Math.max(0, Math.min(r - 1, Math.floor(r * (t.top - n.top) / (n.bottom - n.top)) - 2)), a = i;;) {
		let n = e.childNodes[a];
		if (n.nodeType == 1) {
			let e = n.getClientRects();
			for (let r = 0; r < e.length; r++) {
				let i = e[r];
				if (Qo(t, i)) return ns(n, t, i);
			}
		}
		if ((a = (a + 1) % r) == i) break;
	}
	return e;
}
function rs(e, t) {
	let n = e.dom.ownerDocument, r, i = 0, a = Bo(n, t.left, t.top);
	a && ({node: r, offset: i} = a);
	let o = (e.root.elementFromPoint ? e.root : n).elementFromPoint(t.left, t.top), s;
	if (!o || !e.dom.contains(o.nodeType == 1 ? o : o.parentNode)) {
		let n = e.dom.getBoundingClientRect();
		if (!Qo(t, n) || (o = ns(e.dom, t, n), !o)) return null;
	}
	if (Kl) for (let e = o; r && e; e = Ol(e)) e.draggable && (r = void 0);
	if (o = $o(o, t), r) {
		if (Ul && r.nodeType == 1 && (i = Math.min(i, r.childNodes.length), i < r.childNodes.length)) {
			let e = r.childNodes[i], n;
			e.nodeName == "IMG" && (n = e.getBoundingClientRect()).right <= t.left && n.bottom > t.top && i++;
		}
		let n;
		Zl && i && r.nodeType == 1 && (n = r.childNodes[i - 1]).nodeType == 1 && n.contentEditable == "false" && n.getBoundingClientRect().top >= t.top && i--, r == e.dom && i == r.childNodes.length - 1 && r.lastChild.nodeType == 1 && t.top > r.lastChild.getBoundingClientRect().bottom ? s = e.state.doc.content.size : (i == 0 || r.nodeType != 1 || r.childNodes[i - 1].nodeName != "BR") && (s = ts(e, r, i, t));
	}
	s ??= es(e, o, t);
	let c = e.docView.nearestDesc(o, !0);
	return {
		pos: s,
		inside: c ? c.posAtStart - c.border : -1
	};
}
function is(e) {
	return e.top < e.bottom || e.left < e.right;
}
function as(e, t) {
	let n = e.getClientRects();
	if (n.length) {
		let e = n[t < 0 ? 0 : n.length - 1];
		if (is(e)) return e;
	}
	return Array.prototype.find.call(n, is) || e.getBoundingClientRect();
}
function ss(e, t, n) {
	let { node: r, offset: i, atom: a } = e.docView.domFromPos(t, n < 0 ? -1 : 1), o = Zl || Ul;
	if (r.nodeType == 3) if (o && (eu.test(r.nodeValue) || (n < 0 ? !i : i == r.nodeValue.length))) {
		let e = as(Al(r, i, i), n);
		if (Ul && i && /\s/.test(r.nodeValue[i - 1]) && i < r.nodeValue.length) {
			let t = as(Al(r, i - 1, i - 1), -1);
			if (t.top == e.top) {
				let n = as(Al(r, i, i + 1), -1);
				if (n.top != e.top) return cs(n, n.left < t.left);
			}
		}
		return e;
	} else {
		let e = i, t = i, a = n < 0 ? 1 : -1;
		return n < 0 && !i ? (t++, a = -1) : n >= 0 && i == r.nodeValue.length ? (e--, a = 1) : n < 0 ? e-- : t++, cs(as(Al(r, e, t), a), a < 0);
	}
	if (!e.state.doc.resolve(t - (a || 0)).parent.inlineContent) {
		if (a == null && i && (n < 0 || i == No(r))) {
			let e = r.childNodes[i - 1];
			if (e.nodeType == 1) return ls(e.getBoundingClientRect(), !1);
		}
		if (a == null && i < No(r)) {
			let e = r.childNodes[i];
			if (e.nodeType == 1) return ls(e.getBoundingClientRect(), !0);
		}
		return ls(r.getBoundingClientRect(), n >= 0);
	}
	if (a == null && i && (n < 0 || i == No(r))) {
		let e = r.childNodes[i - 1], t = e.nodeType == 3 ? Al(e, No(e) - +!o) : e.nodeType == 1 && (e.nodeName != "BR" || !e.nextSibling) ? e : null;
		if (t) return cs(as(t, 1), !1);
	}
	if (a == null && i < No(r)) {
		let e = r.childNodes[i];
		for (; e.pmViewDesc && e.pmViewDesc.ignoreForCoords;) e = e.nextSibling;
		let t = e ? e.nodeType == 3 ? Al(e, 0, +!o) : e.nodeType == 1 ? e : null : null;
		if (t) return cs(as(t, -1), !0);
	}
	return cs(as(r.nodeType == 3 ? Al(r) : r, -n), n >= 0);
}
function cs(e, t) {
	if (e.width == 0) return e;
	let n = t ? e.left : e.right;
	return {
		top: e.top,
		bottom: e.bottom,
		left: n,
		right: n
	};
}
function ls(e, t) {
	if (e.height == 0) return e;
	let n = t ? e.top : e.bottom;
	return {
		top: n,
		bottom: n,
		left: e.left,
		right: e.right
	};
}
function us(e, t, n) {
	let r = e.state, i = e.root.activeElement;
	r != t && e.updateState(t), i != e.dom && e.focus();
	try {
		return n();
	} finally {
		r != t && e.updateState(r), i != e.dom && i && i.focus();
	}
}
function ds(e, t, n) {
	let r = t.selection, i = n == "up" ? r.$from : r.$to;
	return us(e, t, () => {
		let { node: t } = e.docView.domFromPos(i.pos, n == "up" ? -1 : 1);
		for (;;) {
			let n = e.docView.nearestDesc(t, !0);
			if (!n) break;
			if (n.node.isBlock) {
				t = n.contentDOM || n.dom;
				break;
			}
			t = n.dom.parentNode;
		}
		let r = ss(e, i.pos, 1);
		for (let e = t.firstChild; e; e = e.nextSibling) {
			let t;
			if (e.nodeType == 1) t = e.getClientRects();
			else if (e.nodeType == 3) t = Al(e, 0, e.nodeValue.length).getClientRects();
			else continue;
			for (let e = 0; e < t.length; e++) {
				let i = t[e];
				if (i.bottom > i.top + 1 && (n == "up" ? r.top - i.top > (i.bottom - r.top) * 2 : i.bottom - r.bottom > (r.bottom - i.top) * 2)) return !1;
			}
		}
		return !0;
	});
}
function fs(e, t, n) {
	let { $head: r } = t.selection;
	if (!r.parent.isTextblock) return !1;
	let i = r.parentOffset, a = !i, o = i == r.parent.content.size, s = e.domSelection();
	return s ? !tu.test(r.parent.textContent) || !s.modify ? n == "left" || n == "backward" ? a : o : us(e, t, () => {
		let { focusNode: t, focusOffset: i, anchorNode: a, anchorOffset: o } = e.domSelectionRange(), c = s.caretBidiLevel;
		s.modify("move", n, "character");
		let l = r.depth ? e.docView.domAfterPos(r.before()) : e.dom, { focusNode: u, focusOffset: d } = e.domSelectionRange(), f = u && !l.contains(u.nodeType == 1 ? u : u.parentNode) || t == u && i == d;
		try {
			s.collapse(a, o), t && (t != a || i != o) && s.extend && s.extend(t, i);
		} catch {}
		return c != null && (s.caretBidiLevel = c), f;
	}) : r.pos == r.start() || r.pos == r.end();
}
function ps(e, t, n) {
	return nu == t && ru == n ? iu : (nu = t, ru = n, iu = n == "up" || n == "down" ? ds(e, t, n) : fs(e, t, n));
}
function ms(e, t, n, r, i) {
	ys(r, t, e);
	let a = new pu(void 0, e, t, n, r, r, r);
	return a.contentDOM && a.updateChildren(i, 0), a;
}
function hs(e, t, n) {
	let r = e.firstChild, i = !1;
	for (let a = 0; a < t.length; a++) {
		let o = t[a], s = o.dom;
		if (s.parentNode == e) {
			for (; s != r;) r = xs(r), i = !0;
			r = r.nextSibling;
		} else i = !0, e.insertBefore(s, r);
		if (o instanceof fu) {
			let t = r ? r.previousSibling : e.lastChild;
			hs(o.contentDOM, o.children, n), r = t ? t.nextSibling : e.firstChild;
		}
	}
	for (; r;) r = xs(r), i = !0;
	i && n.trackWrites == e && (n.trackWrites = null);
}
function gs(e, t, n) {
	if (e.length == 0) return vu;
	let r = n ? vu[0] : new _u(), i = [r];
	for (let a = 0; a < e.length; a++) {
		let o = e[a].type.attrs;
		if (o) {
			o.nodeName && i.push(r = new _u(o.nodeName));
			for (let e in o) {
				let a = o[e];
				a != null && (n && i.length == 1 && i.push(r = new _u(t.isInline ? "span" : "div")), e == "class" ? r.class = (r.class ? r.class + " " : "") + a : e == "style" ? r.style = (r.style ? r.style + ";" : "") + a : e != "nodeName" && (r[e] = a));
			}
		}
	}
	return i;
}
function _s(e, t, n, r) {
	if (n == vu && r == vu) return t;
	let i = t;
	for (let t = 0; t < r.length; t++) {
		let a = r[t], o = n[t];
		if (t) {
			let t;
			o && o.nodeName == a.nodeName && i != e && (t = i.parentNode) && t.nodeName.toLowerCase() == a.nodeName ? i = t : (t = document.createElement(a.nodeName), t.pmIsDeco = !0, t.appendChild(i), o = vu[0], i = t);
		}
		vs(i, o || vu[0], a);
	}
	return i;
}
function vs(e, t, n) {
	for (let r in t) r != "class" && r != "style" && r != "nodeName" && !(r in n) && e.removeAttribute(r);
	for (let r in n) r != "class" && r != "style" && r != "nodeName" && n[r] != t[r] && e.setAttribute(r, n[r]);
	if (t.class != n.class) {
		let r = t.class ? t.class.split(" ").filter(Boolean) : [], i = n.class ? n.class.split(" ").filter(Boolean) : [];
		for (let t = 0; t < r.length; t++) i.indexOf(r[t]) == -1 && e.classList.remove(r[t]);
		for (let t = 0; t < i.length; t++) r.indexOf(i[t]) == -1 && e.classList.add(i[t]);
		e.classList.length == 0 && e.removeAttribute("class");
	}
	if (t.style != n.style) {
		if (t.style) {
			let n = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, r;
			for (; r = n.exec(t.style);) e.style.removeProperty(r[1]);
		}
		n.style && (e.style.cssText += n.style);
	}
}
function ys(e, t, n) {
	return _s(e, e, vu, gs(t, n, e.nodeType != 1));
}
function bs(e, t) {
	if (e.length != t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!e[n].type.eq(t[n].type)) return !1;
	return !0;
}
function xs(e) {
	let t = e.nextSibling;
	return e.parentNode.removeChild(e), t;
}
function Ss(e, t) {
	let n = t, r = n.children.length, i = e.childCount, a = /* @__PURE__ */ new Map(), o = [];
	outer: for (; i > 0;) {
		let s;
		for (;;) if (r) {
			let e = n.children[r - 1];
			if (e instanceof fu) n = e, r = e.children.length;
			else {
				s = e, r--;
				break;
			}
		} else if (n == t) break outer;
		else r = n.parent.children.indexOf(n), n = n.parent;
		let c = s.node;
		if (c) {
			if (c != e.child(i - 1)) break;
			--i, a.set(s, i), o.push(s);
		}
	}
	return {
		index: i,
		matched: a,
		matches: o.reverse()
	};
}
function Cs(e, t) {
	return e.type.side - t.type.side;
}
function ws(e, t, n, r) {
	let i = t.locals(e), a = 0;
	if (i.length == 0) {
		for (let n = 0; n < e.childCount; n++) {
			let o = e.child(n);
			r(o, i, t.forChild(a, o), n), a += o.nodeSize;
		}
		return;
	}
	let o = 0, s = [], c = null;
	for (let l = 0;;) {
		let u, d;
		for (; o < i.length && i[o].to == a;) {
			let e = i[o++];
			e.widget && (u ? (d ||= [u]).push(e) : u = e);
		}
		if (u) if (d) {
			d.sort(Cs);
			for (let e = 0; e < d.length; e++) n(d[e], l, !!c);
		} else n(u, l, !!c);
		let f, p;
		if (c) p = -1, f = c, c = null;
		else if (l < e.childCount) p = l, f = e.child(l++);
		else break;
		for (let e = 0; e < s.length; e++) s[e].to <= a && s.splice(e--, 1);
		for (; o < i.length && i[o].from <= a && i[o].to > a;) s.push(i[o++]);
		let m = a + f.nodeSize;
		if (f.isText) {
			let e = m;
			o < i.length && i[o].from < e && (e = i[o].from);
			for (let t = 0; t < s.length; t++) s[t].to < e && (e = s[t].to);
			e < m && (c = f.cut(e - a), f = f.cut(0, e - a), m = e, p = -1);
		} else for (; o < i.length && i[o].to < m;) o++;
		let h = f.isInline && !f.isLeaf ? s.filter((e) => !e.inline) : s.slice();
		r(f, h, t.forChild(a, f), p), a = m;
	}
}
function Ts(e) {
	if (e.nodeName == "UL" || e.nodeName == "OL") {
		let t = e.style.cssText;
		e.style.cssText = t + "; list-style: square !important", window.getComputedStyle(e).listStyle, e.style.cssText = t;
	}
}
function Es(e, t, n, r) {
	for (let i = 0, a = 0; i < e.childCount && a <= r;) {
		let o = e.child(i++), s = a;
		if (a += o.nodeSize, !o.isText) continue;
		let c = o.text;
		for (; i < e.childCount;) {
			let t = e.child(i++);
			if (a += t.nodeSize, !t.isText) break;
			c += t.text;
		}
		if (a >= n) {
			if (a >= r && c.slice(r - t.length - s, r - s) == t) return r - t.length;
			let e = s < r ? c.lastIndexOf(t, r - s - 1) : -1;
			if (e >= 0 && e + t.length + s >= n) return s + e;
			if (n == r && c.length >= r + t.length - s && c.slice(r - s, r - s + t.length) == t) return r;
		}
	}
	return -1;
}
function Ds(e, t, n, r, i) {
	let a = [];
	for (let o = 0, s = 0; o < e.length; o++) {
		let c = e[o], l = s, u = s += c.size;
		l >= n || u <= t ? a.push(c) : (l < t && a.push(c.slice(0, t - l, r)), i &&= (a.push(i), void 0), u > n && a.push(c.slice(n - l, c.size, r)));
	}
	return a;
}
function Os(e, t = null) {
	let n = e.domSelectionRange(), r = e.state.doc;
	if (!n.focusNode) return null;
	let i = e.docView.nearestDesc(n.focusNode), a = i && i.size == 0, o = e.docView.posFromDOM(n.focusNode, n.focusOffset, 1);
	if (o < 0) return null;
	let s = r.resolve(o), c, l;
	if (Pl(n)) {
		for (c = o; i && !i.node;) i = i.parent;
		let e = i.node;
		if (i && e.isAtom && I.isSelectable(e) && i.parent && !(e.isInline && Io(n.focusNode, n.focusOffset, i.dom))) {
			let e = i.posBefore;
			l = new I(o == e ? s : r.resolve(e));
		}
	} else {
		if (n instanceof e.dom.ownerDocument.defaultView.Selection && n.rangeCount > 1) {
			let t = o, i = o;
			for (let r = 0; r < n.rangeCount; r++) {
				let a = n.getRangeAt(r);
				t = Math.min(t, e.docView.posFromDOM(a.startContainer, a.startOffset, 1)), i = Math.max(i, e.docView.posFromDOM(a.endContainer, a.endOffset, -1));
			}
			if (t < 0) return null;
			[c, o] = i == e.state.selection.anchor ? [i, t] : [t, i], s = r.resolve(o);
		} else c = e.docView.posFromDOM(n.anchorNode, n.anchorOffset, 1);
		if (c < 0) return null;
	}
	let u = r.resolve(c);
	if (!l) {
		let n = t == "pointer" || e.state.selection.head < s.pos && !a ? 1 : -1;
		l = Rs(e, u, s, n);
	}
	return l;
}
function ks(e) {
	return e.editable ? e.hasFocus() : Bs(e) && document.activeElement && document.activeElement.contains(e.dom);
}
function As(e, t = !1) {
	let n = e.state.selection;
	if (Is(e, n), !ks(e)) return;
	let r = e.input.mouseDown;
	if (!t && B && r) {
		let t = e.domSelectionRange(), n = e.domObserver.currentSelection;
		if (t.anchorNode && n.anchorNode && Ml(t.anchorNode, t.anchorOffset, n.anchorNode, n.anchorOffset) && r.delaySelUpdate()) {
			e.domObserver.setCurSelection();
			return;
		}
	}
	if (e.domObserver.disconnectSelection(), e.cursorWrapper) Fs(e);
	else {
		let { anchor: r, head: i } = n, a, o;
		bu && !(n instanceof F) && (n.$from.parent.inlineContent || (a = js(e, n.from)), !n.empty && !n.$from.parent.inlineContent && (o = js(e, n.to))), e.docView.setSelection(r, i, e, t), bu && (a && Ns(a), o && Ns(o)), n.visible ? e.dom.classList.remove("ProseMirror-hideselection") : (e.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && Ps(e));
	}
	e.domObserver.setCurSelection(), e.domObserver.connectSelection();
}
function js(e, t) {
	let { node: n, offset: r } = e.docView.domFromPos(t, 0), i = r < n.childNodes.length ? n.childNodes[r] : null, a = r ? n.childNodes[r - 1] : null;
	if (Kl && i && i.contentEditable == "false") return Ms(i);
	if ((!i || i.contentEditable == "false") && (!a || a.contentEditable == "false")) {
		if (i) return Ms(i);
		if (a) return Ms(a);
	}
}
function Ms(e) {
	return e.contentEditable = "true", Kl && e.draggable && (e.draggable = !1, e.wasDraggable = !0), e;
}
function Ns(e) {
	e.contentEditable = "false", e.wasDraggable &&= (e.draggable = !0, null);
}
function Ps(e) {
	let t = e.dom.ownerDocument;
	t.removeEventListener("selectionchange", e.input.hideSelectionGuard);
	let n = e.domSelectionRange(), r = n.anchorNode, i = n.anchorOffset;
	t.addEventListener("selectionchange", e.input.hideSelectionGuard = () => {
		(n.anchorNode != r || n.anchorOffset != i) && (t.removeEventListener("selectionchange", e.input.hideSelectionGuard), setTimeout(() => {
			(!ks(e) || e.state.selection.visible) && e.dom.classList.remove("ProseMirror-hideselection");
		}, 20));
	});
}
function Fs(e) {
	let t = e.domSelection();
	if (!t) return;
	let n = e.cursorWrapper.dom, r = n.nodeName == "IMG";
	r ? t.collapse(n.parentNode, z(n) + 1) : t.collapse(n, 0), !r && !e.state.selection.visible && Vl && Hl <= 11 && (n.disabled = !0, n.disabled = !1);
}
function Is(e, t) {
	if (t instanceof I) {
		let n = e.docView.descAt(t.from);
		n != e.lastSelectedViewDesc && (Ls(e), n && n.selectNode(), e.lastSelectedViewDesc = n);
	} else Ls(e);
}
function Ls(e) {
	e.lastSelectedViewDesc &&= (e.lastSelectedViewDesc.parent && e.lastSelectedViewDesc.deselectNode(), void 0);
}
function Rs(e, t, n, r) {
	return e.someProp("createSelectionBetween", (r) => r(e, t, n)) || F.between(t, n, r);
}
function zs(e) {
	return e.editable && !e.hasFocus() ? !1 : Bs(e);
}
function Bs(e) {
	let t = e.domSelectionRange();
	if (!t.anchorNode) return !1;
	try {
		return e.dom.contains(t.anchorNode.nodeType == 3 ? t.anchorNode.parentNode : t.anchorNode) && (e.editable || e.dom.contains(t.focusNode.nodeType == 3 ? t.focusNode.parentNode : t.focusNode));
	} catch {
		return !1;
	}
}
function Vs(e) {
	let t = e.docView.domFromPos(e.state.selection.anchor, 0), n = e.domSelectionRange();
	return Ml(t.node, t.offset, n.anchorNode, n.anchorOffset);
}
function Hs(e, t) {
	let { $anchor: n, $head: r } = e.selection, i = t > 0 ? n.max(r) : n.min(r), a = i.parent.inlineContent ? i.depth ? e.doc.resolve(t > 0 ? i.after() : i.before()) : null : i;
	return a && P.findFrom(a, t);
}
function Us(e, t) {
	return e.dispatch(e.state.tr.setSelection(t).scrollIntoView()), !0;
}
function Ws(e, t, n) {
	let r = e.state.selection;
	if (r instanceof F) {
		if (n.indexOf("s") > -1) {
			let { $head: n } = r, i = n.textOffset ? null : t < 0 ? n.nodeBefore : n.nodeAfter;
			if (!i || i.isText || !i.isLeaf) return !1;
			let a = e.state.doc.resolve(n.pos + i.nodeSize * (t < 0 ? -1 : 1));
			return Us(e, new F(r.$anchor, a));
		}
		if (!r.empty) return !1;
		if (e.endOfTextblock(t > 0 ? "forward" : "backward")) {
			let n = Hs(e.state, t);
			return n && n instanceof I ? Us(e, n) : !1;
		}
		if (!(Jl && n.indexOf("m") > -1)) {
			let n = r.$head, i = n.textOffset ? null : t < 0 ? n.nodeBefore : n.nodeAfter, a;
			if (!i || i.isText) return !1;
			let o = t < 0 ? n.pos - i.nodeSize : n.pos;
			return i.isAtom || (a = e.docView.descAt(o)) && !a.contentDOM ? I.isSelectable(i) ? Us(e, new I(t < 0 ? e.state.doc.resolve(n.pos - i.nodeSize) : n)) : Zl ? Us(e, new F(e.state.doc.resolve(t < 0 ? o : o + i.nodeSize))) : !1 : !1;
		}
	} else if (r instanceof I && r.node.isInline) return Us(e, new F(t > 0 ? r.$to : r.$from));
	else {
		let n = Hs(e.state, t);
		return n ? Us(e, n) : !1;
	}
}
function Gs(e) {
	return e.nodeType == 3 ? e.nodeValue.length : e.childNodes.length;
}
function Ks(e, t) {
	let n = e.pmViewDesc;
	return n && n.size == 0 && (t < 0 || e.nextSibling || e.nodeName != "BR");
}
function qs(e, t) {
	return t < 0 ? Js(e) : Ys(e);
}
function Js(e) {
	let t = e.domSelectionRange(), n = t.focusNode, r = t.focusOffset;
	if (!n) return;
	let i, a, o = !1;
	for (Ul && n.nodeType == 1 && r < Gs(n) && Ks(n.childNodes[r], -1) && (o = !0);;) if (r > 0) {
		if (n.nodeType != 1) break;
		{
			let e = n.childNodes[r - 1];
			if (Ks(e, -1)) i = n, a = --r;
			else if (e.nodeType == 3) n = e, r = n.nodeValue.length;
			else break;
		}
	} else if (Xs(n)) break;
	else {
		let t = n.previousSibling;
		for (; t && Ks(t, -1);) i = n.parentNode, a = z(t), t = t.previousSibling;
		if (t) n = t, r = Gs(n);
		else {
			if (n = n.parentNode, n == e.dom) break;
			r = 0;
		}
	}
	o ? $s(e, n, r) : i && $s(e, i, a);
}
function Ys(e) {
	let t = e.domSelectionRange(), n = t.focusNode, r = t.focusOffset;
	if (!n) return;
	let i = Gs(n), a, o;
	for (;;) if (r < i) {
		if (n.nodeType != 1) break;
		let e = n.childNodes[r];
		if (Ks(e, 1)) a = n, o = ++r;
		else break;
	} else if (Xs(n)) break;
	else {
		let t = n.nextSibling;
		for (; t && Ks(t, 1);) a = t.parentNode, o = z(t) + 1, t = t.nextSibling;
		if (t) n = t, r = 0, i = Gs(n);
		else {
			if (n = n.parentNode, n == e.dom) break;
			r = i = 0;
		}
	}
	a && $s(e, a, o);
}
function Xs(e) {
	let t = e.pmViewDesc;
	return t && t.node && t.node.isBlock;
}
function Zs(e, t) {
	for (; e && t == e.childNodes.length && !Lo(e);) t = z(e) + 1, e = e.parentNode;
	for (; e && t < e.childNodes.length;) {
		let n = e.childNodes[t];
		if (n.nodeType == 3) return n;
		if (n.nodeType == 1 && n.contentEditable == "false") break;
		e = n, t = 0;
	}
}
function Qs(e, t) {
	for (; e && !t && !Lo(e);) t = z(e), e = e.parentNode;
	for (; e && t;) {
		let n = e.childNodes[t - 1];
		if (n.nodeType == 3) return n;
		if (n.nodeType == 1 && n.contentEditable == "false") break;
		e = n, t = e.childNodes.length;
	}
}
function $s(e, t, n) {
	if (t.nodeType != 3) {
		let e, r;
		(r = Zs(t, n)) ? (t = r, n = 0) : (e = Qs(t, n)) && (t = e, n = e.nodeValue.length);
	}
	let r = e.domSelection();
	if (!r) return;
	if (Pl(r)) {
		let e = document.createRange();
		e.setEnd(t, n), e.setStart(t, n), r.removeAllRanges(), r.addRange(e);
	} else r.extend && r.extend(t, n);
	e.domObserver.setCurSelection();
	let { state: i } = e;
	setTimeout(() => {
		e.state == i && As(e);
	}, 50);
}
function ec(e, t) {
	let n = e.state.doc.resolve(t);
	if (!(B || Yl) && n.parent.inlineContent) {
		let r = e.coordsAtPos(t);
		if (t > n.start()) {
			let n = e.coordsAtPos(t - 1), i = (n.top + n.bottom) / 2;
			if (i > r.top && i < r.bottom && Math.abs(n.left - r.left) > 1) return n.left < r.left ? "ltr" : "rtl";
		}
		if (t < n.end()) {
			let n = e.coordsAtPos(t + 1), i = (n.top + n.bottom) / 2;
			if (i > r.top && i < r.bottom && Math.abs(n.left - r.left) > 1) return n.left > r.left ? "ltr" : "rtl";
		}
	}
	return getComputedStyle(e.dom).direction == "rtl" ? "rtl" : "ltr";
}
function tc(e, t, n) {
	let r = e.state.selection;
	if (r instanceof F && !r.empty || n.indexOf("s") > -1 || Jl && n.indexOf("m") > -1) return !1;
	let { $from: i, $to: a } = r;
	if (!i.parent.inlineContent || e.endOfTextblock(t < 0 ? "up" : "down")) {
		let n = Hs(e.state, t);
		if (n && n instanceof I) return Us(e, n);
	}
	if (!i.parent.inlineContent) {
		let n = t < 0 ? i : a, o = r instanceof Ca ? P.near(n, t) : P.findFrom(n, t);
		return o ? Us(e, o) : !1;
	}
	return !1;
}
function nc(e, t) {
	if (!(e.state.selection instanceof F)) return !0;
	let { $head: n, $anchor: r, empty: i } = e.state.selection;
	if (!n.sameParent(r)) return !0;
	if (!i) return !1;
	if (e.endOfTextblock(t > 0 ? "forward" : "backward")) return !0;
	let a = !n.textOffset && (t < 0 ? n.nodeBefore : n.nodeAfter);
	if (a && !a.isText) {
		let r = e.state.tr;
		return t < 0 ? r.delete(n.pos - a.nodeSize, n.pos) : r.delete(n.pos, n.pos + a.nodeSize), e.dispatch(r), !0;
	}
	return !1;
}
function rc(e, t, n) {
	e.domObserver.stop(), t.contentEditable = n, e.domObserver.start();
}
function ic(e) {
	if (!Kl || e.state.selection.$head.parentOffset > 0) return !1;
	let { focusNode: t, focusOffset: n } = e.domSelectionRange();
	if (t && t.nodeType == 1 && n == 0 && t.firstChild && t.firstChild.contentEditable == "false") {
		let n = t.firstChild;
		rc(e, n, "true"), setTimeout(() => rc(e, n, "false"), 20);
	}
	return !1;
}
function ac(e) {
	let t = "";
	return e.ctrlKey && (t += "c"), e.metaKey && (t += "m"), e.altKey && (t += "a"), e.shiftKey && (t += "s"), t;
}
function oc(e, t) {
	let n = t.keyCode, r = ac(t);
	if (n == 8 || Jl && n == 72 && r == "c") return nc(e, -1) || qs(e, -1);
	if (n == 46 && !t.shiftKey || Jl && n == 68 && r == "c") return nc(e, 1) || qs(e, 1);
	if (n == 13 || n == 27) return !0;
	if (n == 37 || Jl && n == 66 && r == "c") {
		let t = n == 37 ? ec(e, e.state.selection.from) == "ltr" ? -1 : 1 : -1;
		return Ws(e, t, r) || qs(e, t);
	}
	if (n == 39 || Jl && n == 70 && r == "c") {
		let t = n == 39 ? ec(e, e.state.selection.from) == "ltr" ? 1 : -1 : 1;
		return Ws(e, t, r) || qs(e, t);
	}
	return n == 38 || Jl && n == 80 && r == "c" ? tc(e, -1, r) || qs(e, -1) : n == 40 || Jl && n == 78 && r == "c" ? ic(e) || tc(e, 1, r) || qs(e, 1) : !(r != (Jl ? "m" : "c") || n != 66 && n != 73 && n != 89 && n != 90);
}
function sc(e, t) {
	e.someProp("transformCopied", (n) => {
		t = n(t, e);
	});
	let n = [], { content: r, openStart: i, openEnd: a } = t;
	for (; i > 1 && a > 1 && r.childCount == 1 && r.firstChild.childCount == 1;) {
		i--, a--;
		let e = r.firstChild;
		n.push(e.type.name, e.attrs == e.type.defaultAttrs ? null : e.attrs), r = e.content;
	}
	let o = e.someProp("clipboardSerializer") || Jr.fromSchema(e.state.schema), s = hc(), c = s.createElement("div");
	c.appendChild(o.serializeFragment(r, { document: s }));
	let l = c.firstChild, u, d = 0;
	for (; l && l.nodeType == 1 && (u = Su[l.nodeName.toLowerCase()]);) {
		for (let e = u.length - 1; e >= 0; e--) {
			let t = s.createElement(u[e]);
			for (; c.firstChild;) t.appendChild(c.firstChild);
			c.appendChild(t), d++;
		}
		l = c.firstChild;
	}
	return l && l.nodeType == 1 && l.setAttribute("data-pm-slice", `${i} ${a}${d ? ` -${d}` : ""} ${JSON.stringify(n)}`), {
		dom: c,
		text: e.someProp("clipboardTextSerializer", (n) => n(t, e)) || t.content.textBetween(0, t.content.size, "\n\n"),
		slice: t
	};
}
function cc(e, t, n, r, i) {
	let a = i.parent.type.spec.code, o, s;
	if (!n && !t) return null;
	let c = !!t && (r || a || !n);
	if (c) {
		if (e.someProp("transformPastedText", (n) => {
			t = n(t, a || r, e);
		}), a) return s = new N(j.from(e.state.schema.text(t.replace(/\r\n?/g, "\n"))), 0, 0), e.someProp("transformPasted", (t) => {
			s = t(s, e, !0);
		}), s;
		let n = e.someProp("clipboardTextParser", (n) => n(t, i, r, e));
		if (n) s = n;
		else {
			let n = i.marks(), { schema: r } = e.state, a = Jr.fromSchema(r);
			o = document.createElement("div"), t.split(/(?:\r\n?|\n)+/).forEach((e) => {
				let t = o.appendChild(document.createElement("p"));
				e && t.appendChild(a.serializeNode(r.text(e, n)));
			});
		}
	} else e.someProp("transformPastedHTML", (t) => {
		n = t(n, e);
	}), o = _c(n), Zl && vc(o);
	let l = o && o.querySelector("[data-pm-slice]"), u = l && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(l.getAttribute("data-pm-slice") || "");
	if (u && u[3]) for (let e = +u[3]; e > 0; e--) {
		let e = o.firstChild;
		for (; e && e.nodeType != 1;) e = e.nextSibling;
		if (!e) break;
		o = e;
	}
	if (s ||= (e.someProp("clipboardParser") || e.someProp("domParser") || zr.fromSchema(e.state.schema)).parseSlice(o, {
		preserveWhitespace: !!(c || u),
		context: i,
		ruleFromNode(e) {
			return e.nodeName == "BR" && !e.nextSibling && e.parentNode && !xu.test(e.parentNode.nodeName) ? { ignore: !0 } : null;
		}
	}), u) s = yc(mc(s, +u[1], +u[2]), u[4]);
	else if (s = N.maxOpen(lc(s.content, i), !0), s.openStart || s.openEnd) {
		let e = 0, t = 0;
		for (let t = s.content.firstChild; e < s.openStart && !t.type.spec.isolating; e++, t = t.firstChild);
		for (let e = s.content.lastChild; t < s.openEnd && !e.type.spec.isolating; t++, e = e.lastChild);
		s = mc(s, e, t);
	}
	return e.someProp("transformPasted", (t) => {
		s = t(s, e, c);
	}), s;
}
function lc(e, t) {
	if (e.childCount < 2) return e;
	for (let n = t.depth; n >= 0; n--) {
		let r = t.node(n).contentMatchAt(t.index(n)), i, a = [];
		if (e.forEach((e) => {
			if (!a) return;
			let t = r.findWrapping(e.type), n;
			if (!t) return a = null;
			if (n = a.length && i.length && dc(t, i, e, a[a.length - 1], 0)) a[a.length - 1] = n;
			else {
				a.length && (a[a.length - 1] = fc(a[a.length - 1], i.length));
				let n = uc(e, t);
				a.push(n), r = r.matchType(n.type), i = t;
			}
		}), a) return j.from(a);
	}
	return e;
}
function uc(e, t, n = 0) {
	for (let r = t.length - 1; r >= n; r--) e = t[r].create(null, j.from(e));
	return e;
}
function dc(e, t, n, r, i) {
	if (i < e.length && i < t.length && e[i] == t[i]) {
		let a = dc(e, t, n, r.lastChild, i + 1);
		if (a) return r.copy(r.content.replaceChild(r.childCount - 1, a));
		if (r.contentMatchAt(r.childCount).matchType(i == e.length - 1 ? n.type : e[i + 1])) return r.copy(r.content.append(j.from(uc(n, e, i + 1))));
	}
}
function fc(e, t) {
	if (t == 0) return e;
	let n = e.content.replaceChild(e.childCount - 1, fc(e.lastChild, t - 1)), r = e.contentMatchAt(e.childCount).fillBefore(j.empty, !0);
	return e.copy(n.append(r));
}
function pc(e, t, n, r, i, a) {
	let o = t < 0 ? e.firstChild : e.lastChild, s = o.content;
	return e.childCount > 1 && (a = 0), i < r - 1 && (s = pc(s, t, n, r, i + 1, a)), i >= n && (s = t < 0 ? o.contentMatchAt(0).fillBefore(s, a <= i).append(s) : s.append(o.contentMatchAt(o.childCount).fillBefore(j.empty, !0))), e.replaceChild(t < 0 ? 0 : e.childCount - 1, o.copy(s));
}
function mc(e, t, n) {
	return t < e.openStart && (e = new N(pc(e.content, -1, t, e.openStart, 0, e.openEnd), t, e.openEnd)), n < e.openEnd && (e = new N(pc(e.content, 1, n, e.openEnd, 0, 0), e.openStart, n)), e;
}
function hc() {
	return document.implementation.createHTMLDocument("title");
}
function gc(e) {
	let t = window.trustedTypes;
	return t ? (Cu ||= t.defaultPolicy || t.createPolicy("ProseMirrorClipboard", { createHTML: (e) => e }), Cu.createHTML(e)) : e;
}
function _c(e) {
	let t = /^(\s*<meta [^>]*>)*/.exec(e);
	t && (e = e.slice(t[0].length));
	let n = hc(), r = n.body, i = /<([a-z][^>\s]+)/i.exec(e), a;
	if ((a = i && Su[i[1].toLowerCase()]) && (e = a.map((e) => "<" + e + ">").join("") + e + a.map((e) => "</" + e + ">").reverse().join("")), r.innerHTML = gc(e), a) for (let e = 0; e < a.length; e++) r = r.querySelector(a[e]) || r;
	for (let e = 0; e < n.styleSheets.length; e++) {
		let t = n.styleSheets[e];
		for (let e = 0; e < t.rules.length; e++) {
			let n = t.rules[e];
			if (n instanceof CSSStyleRule) {
				let e = r.querySelectorAll(n.selectorText);
				for (let t = 0; t < e.length; t++) e[t].style.cssText += n.style.cssText;
			}
		}
	}
	return r;
}
function vc(e) {
	let t = e.querySelectorAll(B ? "span:not([class]):not([style])" : "span.Apple-converted-space");
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		r.childNodes.length == 1 && r.textContent == "\xA0" && r.parentNode && r.parentNode.replaceChild(e.ownerDocument.createTextNode(" "), r);
	}
}
function yc(e, t) {
	if (!e.size) return e;
	let n = e.content.firstChild.type.schema, r;
	try {
		r = JSON.parse(t);
	} catch {
		return e;
	}
	let { content: i, openStart: a, openEnd: o } = e;
	for (let e = r.length - 2; e >= 0; e -= 2) {
		let t = n.nodes[r[e]];
		if (!t || t.hasRequiredAttrs()) break;
		i = j.from(t.create(r[e + 1], i)), a++, o++;
	}
	return new N(i, a, o);
}
function bc(e) {
	for (let t in wu) {
		let n = wu[t];
		e.dom.addEventListener(t, e.input.eventHandlers[t] = (t) => {
			Tc(e, t) && !wc(e, t) && (e.editable || !(t.type in Tu)) && n(e, t);
		}, Eu[t] ? { passive: !0 } : void 0);
	}
	Kl && e.dom.addEventListener("input", () => null), Cc(e);
}
function xc(e, t) {
	e.input.lastSelectionOrigin = t, e.input.lastSelectionTime = Date.now();
}
function Sc(e) {
	e.input.mouseDown && e.input.mouseDown.done(), e.domObserver.stop();
	for (let t in e.input.eventHandlers) e.dom.removeEventListener(t, e.input.eventHandlers[t]);
	clearTimeout(e.input.composingTimeout), clearTimeout(e.input.lastIOSEnterFallbackTimeout);
}
function Cc(e) {
	e.someProp("handleDOMEvents", (t) => {
		for (let n in t) e.input.eventHandlers[n] || e.dom.addEventListener(n, e.input.eventHandlers[n] = (t) => wc(e, t));
	});
}
function wc(e, t) {
	return e.someProp("handleDOMEvents", (n) => {
		let r = n[t.type];
		return r ? r(e, t) || t.defaultPrevented : !1;
	});
}
function Tc(e, t) {
	if (!t.bubbles) return !0;
	if (t.defaultPrevented) return !1;
	for (let n = t.target; n != e.dom; n = n.parentNode) if (!n || n.nodeType == 11 || n.pmViewDesc && n.pmViewDesc.stopEvent(t)) return !1;
	return !0;
}
function Ec(e, t) {
	!wc(e, t) && wu[t.type] && (e.editable || !(t.type in Tu)) && wu[t.type](e, t);
}
function Dc(e) {
	return {
		left: e.clientX,
		top: e.clientY
	};
}
function Oc(e, t) {
	let n = t.x - e.clientX, r = t.y - e.clientY;
	return n * n + r * r < 100;
}
function kc(e, t, n, r, i) {
	if (r == -1) return !1;
	let a = e.state.doc.resolve(r);
	for (let r = a.depth + 1; r > 0; r--) if (e.someProp(t, (t) => r > a.depth ? t(e, n, a.nodeAfter, a.before(r), i, !0) : t(e, n, a.node(r), a.before(r), i, !1))) return !0;
	return !1;
}
function Ac(e, t, n) {
	if (e.focused || e.focus(), e.state.selection.eq(t)) return;
	let r = e.state.tr.setSelection(t);
	n == "pointer" && r.setMeta("pointer", !0), e.dispatch(r);
}
function jc(e, t) {
	if (t == -1) return !1;
	let n = e.state.doc.resolve(t), r = n.nodeAfter;
	return r && r.isAtom && I.isSelectable(r) ? (Ac(e, new I(n), "pointer"), !0) : !1;
}
function Mc(e, t) {
	if (t == -1) return !1;
	let n = e.state.selection, r, i;
	n instanceof I && (r = n.node);
	let a = e.state.doc.resolve(t);
	for (let e = a.depth + 1; e > 0; e--) {
		let t = e > a.depth ? a.nodeAfter : a.node(e);
		if (I.isSelectable(t)) {
			i = r && n.$from.depth > 0 && e >= n.$from.depth && a.before(n.$from.depth + 1) == n.$from.pos ? a.before(n.$from.depth) : a.before(e);
			break;
		}
	}
	return i != null && (Ac(e, I.create(e.state.doc, i), "pointer"), !0);
}
function Nc(e, t, n, r, i) {
	return kc(e, "handleClickOn", t, n, r) || e.someProp("handleClick", (n) => n(e, t, r)) || (i ? Mc(e, n) : jc(e, n));
}
function Pc(e, t, n, r) {
	return kc(e, "handleDoubleClickOn", t, n, r) || e.someProp("handleDoubleClick", (n) => n(e, t, r));
}
function Fc(e, t, n, r) {
	return kc(e, "handleTripleClickOn", t, n, r) || e.someProp("handleTripleClick", (n) => n(e, t, r)) || Ic(e, n, r);
}
function Ic(e, t, n) {
	if (n.button != 0) return !1;
	let r = Lc(e, t, !0), i = e.state.doc;
	return r ? (Ac(e, r, "pointer"), r instanceof F && i.eq(e.state.doc) && (e.input.mouseDown = new ju(e, r)), !0) : !1;
}
function Lc(e, t, n) {
	let r = e.state.doc;
	if (t == -1) return r.inlineContent ? F.create(r, 0, r.content.size) : null;
	let i = r.resolve(t);
	for (let e = i.depth + 1; e > 0; e--) {
		let t = e > i.depth ? i.nodeAfter : i.node(e), a = i.before(e);
		if (t.inlineContent) return F.create(r, a + 1, a + 1 + t.content.size);
		if (n && I.isSelectable(t)) return I.create(r, a);
	}
	return null;
}
function Rc(e) {
	return Wc(e);
}
function zc(e, t) {
	return e.composing ? !0 : Kl && Math.abs(Date.now() - e.input.compositionEndedAt) < 500 ? (e.input.compositionEndedAt = -2e8, !0) : !1;
}
function Bc(e) {
	let { focusNode: t, focusOffset: n } = e.domSelectionRange();
	if (!t || t.nodeType != 1 || n >= t.childNodes.length) return !1;
	let r = t.childNodes[n];
	return r.nodeType == 1 && r.contentEditable == "false";
}
function Vc(e, t) {
	clearTimeout(e.input.composingTimeout), t > -1 && (e.input.composingTimeout = setTimeout(() => Wc(e), t));
}
function Hc(e) {
	for (e.composing && (e.input.composing = !1, e.input.compositionEndedAt = Date.now()); e.input.compositionNodes.length > 0;) e.input.compositionNodes.pop().markParentsDirty();
}
function Uc(e) {
	let t = e.domSelectionRange();
	if (!t.focusNode) return null;
	let n = Po(t.focusNode, t.focusOffset), r = Fo(t.focusNode, t.focusOffset);
	if (n && r && n != r) {
		let t = r.pmViewDesc, i = e.domObserver.lastChangedTextNode;
		if (n == i || r == i) return i;
		if (!t || !t.isText(r.nodeValue)) return r;
		if (e.input.compositionNode == r) {
			let e = n.pmViewDesc;
			if (!(!e || !e.isText(n.nodeValue))) return r;
		}
	}
	return n || r;
}
function Wc(e, t = !1) {
	if (!(Xl && e.domObserver.flushingSoon >= 0)) {
		if (e.domObserver.forceFlush(), Hc(e), t || e.docView && e.docView.dirty) {
			let n = Os(e), r = e.state.selection;
			return n && !n.eq(r) ? e.dispatch(e.state.tr.setSelection(n)) : (e.markCursor || t) && !r.$from.node(r.$from.sharedDepth(r.to)).inlineContent ? e.dispatch(e.state.tr.deleteSelection()) : e.updateState(e.state), !0;
		}
		return !1;
	}
}
function Gc(e, t) {
	if (!e.dom.parentNode) return;
	let n = e.dom.parentNode.appendChild(document.createElement("div"));
	n.appendChild(t), n.style.cssText = "position: fixed; left: -10000px; top: 10px";
	let r = getSelection(), i = document.createRange();
	i.selectNodeContents(t), e.dom.blur(), r.removeAllRanges(), r.addRange(i), setTimeout(() => {
		n.parentNode && n.parentNode.removeChild(n), e.focus();
	}, 50);
}
function Kc(e) {
	return e.openStart == 0 && e.openEnd == 0 && e.content.childCount == 1 ? e.content.firstChild : null;
}
function qc(e, t) {
	if (!e.dom.parentNode) return;
	let n = e.input.shiftKey || e.state.selection.$from.parent.type.spec.code, r = e.dom.parentNode.appendChild(document.createElement(n ? "textarea" : "div"));
	n || (r.contentEditable = "true"), r.style.cssText = "position: fixed; left: -10000px; top: 10px", r.focus();
	let i = e.input.shiftKey && e.input.lastKeyCode != 45;
	setTimeout(() => {
		e.focus(), r.parentNode && r.parentNode.removeChild(r), n ? Jc(e, r.value, null, i, t) : Jc(e, r.textContent, r.innerHTML, i, t);
	}, 50);
}
function Jc(e, t, n, r, i) {
	let a = cc(e, t, n, r, e.state.selection.$from);
	if (e.someProp("handlePaste", (t) => t(e, i, a || N.empty))) return !0;
	if (!a) return !1;
	let o = Kc(a), s = o ? e.state.tr.replaceSelectionWith(o, r) : e.state.tr.replaceSelection(a);
	return e.dispatch(s.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function Yc(e) {
	let t = e.getData("text/plain") || e.getData("Text");
	if (t) return t;
	let n = e.getData("text/uri-list");
	return n ? n.replace(/\r?\n/g, " ") : "";
}
function Xc(e, t) {
	let n;
	return e.someProp("dragCopies", (e) => {
		n ||= e(t);
	}), n == null ? !t[Fu] : !n;
}
function Zc(e, t, n) {
	if (!t.dataTransfer) return;
	let r = e.posAtCoords(Dc(t));
	if (!r) return;
	let i = e.state.doc.resolve(r.pos), a = n && n.slice;
	a ? e.someProp("transformPasted", (t) => {
		a = t(a, e, !1);
	}) : a = cc(e, Yc(t.dataTransfer), Nu ? null : t.dataTransfer.getData("text/html"), !1, i);
	let o = !!(n && Xc(e, t));
	if (e.someProp("handleDrop", (n) => n(e, t, a || N.empty, o))) {
		t.preventDefault();
		return;
	}
	if (!a) return;
	t.preventDefault();
	let s = a ? Ei(e.state.doc, i.pos, a) : i.pos;
	s ??= i.pos;
	let c = e.state.tr;
	if (o) {
		let { node: e } = n;
		e ? e.replace(c) : c.deleteSelection();
	}
	let l = c.mapping.map(s), u = a.openStart == 0 && a.openEnd == 0 && a.content.childCount == 1, d = c.doc;
	if (u ? c.replaceRangeWith(l, l, a.content.firstChild) : c.replaceRange(l, l, a), c.doc.eq(d)) return;
	let f = c.doc.resolve(l);
	if (u && I.isSelectable(a.content.firstChild) && f.nodeAfter && f.nodeAfter.sameMarkup(a.content.firstChild)) c.setSelection(new I(f));
	else {
		let t = c.mapping.map(s);
		c.mapping.maps[c.mapping.maps.length - 1].forEach((e, n, r, i) => t = i), c.setSelection(Rs(e, f, c.doc.resolve(t)));
	}
	e.focus(), e.dispatch(c.setMeta("uiEvent", "drop"));
}
function Qc(e, t) {
	if (e == t) return !0;
	for (let n in e) if (e[n] !== t[n]) return !1;
	for (let n in t) if (!(n in e)) return !1;
	return !0;
}
function $c(e, t, n, r, i, a, o) {
	let s = e.slice();
	for (let e = 0, t = a; e < n.maps.length; e++) {
		let r = 0;
		n.maps[e].forEach((e, n, i, a) => {
			let o = a - i - (n - e);
			for (let i = 0; i < s.length; i += 3) {
				let a = s[i + 1];
				if (a < 0 || e > a + t - r) continue;
				let c = s[i] + t - r;
				n >= c ? s[i + 1] = e <= c ? -2 : -1 : e >= t && o && (s[i] += o, s[i + 1] += o);
			}
			r += o;
		}), t = n.maps[e].map(t, -1);
	}
	let c = !1;
	for (let t = 0; t < s.length; t += 3) if (s[t + 1] < 0) {
		if (s[t + 1] == -2) {
			c = !0, s[t + 1] = -1;
			continue;
		}
		let l = n.map(e[t] + a), u = l - i;
		if (u < 0 || u >= r.content.size) {
			c = !0;
			continue;
		}
		let d = n.map(e[t + 1] + a, -1) - i, { index: f, offset: p } = r.content.findIndex(u), m = r.maybeChild(f);
		if (m && p == u && p + m.nodeSize == d) {
			let r = s[t + 2].mapInner(n, m, l + 1, e[t] + a + 1, o);
			r == Hu ? (s[t + 1] = -2, c = !0) : (s[t] = u, s[t + 1] = d, s[t + 2] = r);
		} else c = !0;
	}
	if (c) {
		let c = il(tl(s, e, t, n, i, a, o), r, 0, o);
		t = c.local;
		for (let e = 0; e < s.length; e += 3) s[e + 1] < 0 && (s.splice(e, 3), e -= 3);
		for (let e = 0, t = 0; e < c.children.length; e += 3) {
			let n = c.children[e];
			for (; t < s.length && s[t] < n;) t += 3;
			s.splice(t, 0, c.children[e], c.children[e + 1], c.children[e + 2]);
		}
	}
	return new V(t.sort(al), s);
}
function el(e, t) {
	if (!t || !e.length) return e;
	let n = [];
	for (let r = 0; r < e.length; r++) {
		let i = e[r];
		n.push(new zu(i.from + t, i.to + t, i.type));
	}
	return n;
}
function tl(e, t, n, r, i, a, o) {
	function s(e, t) {
		for (let a = 0; a < e.local.length; a++) {
			let s = e.local[a].map(r, i, t);
			s ? n.push(s) : o.onRemove && o.onRemove(e.local[a].spec);
		}
		for (let n = 0; n < e.children.length; n += 3) s(e.children[n + 2], e.children[n] + t + 1);
	}
	for (let n = 0; n < e.length; n += 3) e[n + 1] == -1 && s(e[n + 2], t[n] + a + 1);
	return n;
}
function nl(e, t, n) {
	if (t.isLeaf) return null;
	let r = n + t.nodeSize, i = null;
	for (let t = 0, a; t < e.length; t++) (a = e[t]) && a.from > n && a.to < r && ((i ||= []).push(a), e[t] = null);
	return i;
}
function rl(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) e[n] != null && t.push(e[n]);
	return t;
}
function il(e, t, n, r) {
	let i = [], a = !1;
	t.forEach((t, o) => {
		let s = nl(e, t, o + n);
		if (s) {
			a = !0;
			let e = il(s, t, n + o + 1, r);
			e != Hu && i.push(o, o + t.nodeSize, e);
		}
	});
	let o = el(a ? rl(e) : e, -n).sort(al);
	for (let e = 0; e < o.length; e++) o[e].type.valid(t, o[e]) || (r.onRemove && r.onRemove(o[e].spec), o.splice(e--, 1));
	return o.length || i.length ? new V(o, i) : Hu;
}
function al(e, t) {
	return e.from - t.from || e.to - t.to;
}
function ol(e) {
	let t = e;
	for (let n = 0; n < t.length - 1; n++) {
		let r = t[n];
		if (r.from != r.to) for (let i = n + 1; i < t.length; i++) {
			let a = t[i];
			if (a.from == r.from) {
				a.to != r.to && (t == e && (t = e.slice()), t[i] = a.copy(a.from, r.to), sl(t, i + 1, a.copy(r.to, a.to)));
				continue;
			}
			a.from < r.to && (t == e && (t = e.slice()), t[n] = r.copy(r.from, a.from), sl(t, i, r.copy(a.from, r.to)));
			break;
		}
	}
	return t;
}
function sl(e, t, n) {
	for (; t < e.length && al(n, e[t]) > 0;) t++;
	e.splice(t, 0, n);
}
function cl(e) {
	let t = [];
	return e.someProp("decorations", (n) => {
		let r = n(e.state);
		r && r != Hu && t.push(r);
	}), e.cursorWrapper && t.push(V.create(e.state.doc, [e.cursorWrapper.deco])), Uu.from(t);
}
function ll(e) {
	if (!Ju.has(e) && (Ju.set(e, null), [
		"normal",
		"nowrap",
		"pre-line"
	].indexOf(getComputedStyle(e.dom).whiteSpace) !== -1)) {
		if (e.requiresGeckoHackNode = Ul, Yu) return;
		console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), Yu = !0;
	}
}
function ul(e, t) {
	let n = t.startContainer, r = t.startOffset, i = t.endContainer, a = t.endOffset, o = e.domAtPos(e.state.selection.anchor);
	return Ml(o.node, o.offset, i, a) && ([n, r, i, a] = [
		i,
		a,
		n,
		r
	]), {
		anchorNode: n,
		anchorOffset: r,
		focusNode: i,
		focusOffset: a
	};
}
function dl(e, t) {
	if (t.getComposedRanges) {
		let n = t.getComposedRanges(e.root)[0];
		if (n) return ul(e, n);
	}
	let n;
	function r(e) {
		e.preventDefault(), e.stopImmediatePropagation(), n = e.getTargetRanges()[0];
	}
	return e.dom.addEventListener("beforeinput", r, !0), document.execCommand("indent"), e.dom.removeEventListener("beforeinput", r, !0), n ? ul(e, n) : null;
}
function fl(e, t) {
	for (let n = t.parentNode; n && n != e.dom; n = n.parentNode) {
		let t = e.docView.nearestDesc(n, !0);
		if (t && t.node.isBlock) return n;
	}
	return null;
}
function pl(e, t) {
	let { focusNode: n, focusOffset: r } = e.domSelectionRange();
	for (let i of t) if (i.parentNode?.nodeName == "TR") {
		let t = i.nextSibling;
		for (; t && t.nodeName != "TD" && t.nodeName != "TH";) t = t.nextSibling;
		if (t) {
			let a = t;
			for (;;) {
				let e = a.firstChild;
				if (!e || e.nodeType != 1 || e.contentEditable == "false" || /^(BR|IMG)$/.test(e.nodeName)) break;
				a = e;
			}
			a.insertBefore(i, a.firstChild), n == i && e.domSelection().collapse(i, r);
		} else i.parentNode.removeChild(i);
	}
}
function ml(e, t, n, r) {
	let { node: i, fromOffset: a, toOffset: o, from: s, to: c } = e.docView.parseRange(t, n), l = e.domSelectionRange(), u, d = l.anchorNode;
	if (d && e.dom.contains(d.nodeType == 1 ? d : d.parentNode) && (u = [{
		node: d,
		offset: l.anchorOffset
	}], Pl(l) || u.push({
		node: l.focusNode,
		offset: l.focusOffset
	})), B && e.input.lastKeyCode === 8) for (let e = o; e > a; e--) {
		let t = i.childNodes[e - 1], n = t.pmViewDesc;
		if (t.nodeName == "BR" && !n) {
			o = e;
			break;
		}
		if (!n || n.size) break;
	}
	let f = e.state.doc, p = e.someProp("domParser") || zr.fromSchema(e.state.schema), m = f.resolve(s), h = null, g = p.parse(i, {
		topNode: m.parent,
		topMatch: m.parent.contentMatchAt(m.index()),
		topOpen: !0,
		from: a,
		to: o,
		preserveWhitespace: m.parent.type.whitespace != "pre" || "full",
		findPositions: u,
		ruleFromNode: Xu(r),
		context: m
	});
	if (u && u[0].pos != null) {
		let e = u[0].pos, t = u[1] && u[1].pos;
		t ??= e, h = {
			anchor: e + s,
			head: t + s
		};
	}
	return {
		doc: g,
		sel: h,
		from: s,
		to: c
	};
}
function hl(e, t, n, r, i) {
	let a = e.input.compositionPendingChanges || (e.composing ? e.input.compositionID : 0);
	if (e.input.compositionPendingChanges = 0, t < 0) {
		let t = e.input.lastSelectionTime > Date.now() - 50 ? e.input.lastSelectionOrigin : null, n = Os(e, t);
		if (n && !e.state.selection.eq(n)) {
			if (B && Xl && e.input.lastKeyCode === 13 && Date.now() - 100 < e.input.lastKeyCodeTime && e.someProp("handleKeyDown", (t) => t(e, Ro(13, "Enter")))) return;
			let r = e.state.tr.setSelection(n);
			t == "pointer" ? r.setMeta("pointer", !0) : t == "key" && r.scrollIntoView(), a && r.setMeta("composition", a), e.dispatch(r);
		}
		return;
	}
	let o = e.state.doc.resolve(t), s = o.sharedDepth(n);
	t = o.before(s + 1), n = e.state.doc.resolve(n).after(s + 1);
	let c = e.state.selection, l = ml(e, t, n, i), u = e.state.doc, d = u.slice(l.from, l.to), f, p;
	e.input.lastKeyCode === 8 && Date.now() - 100 < e.input.lastKeyCodeTime ? (f = e.state.selection.to, p = "end") : (f = e.state.selection.from, p = "start"), e.input.lastKeyCode = null;
	let m = bl(d.content, l.doc.content, l.from, f, p);
	if (m && e.input.domChangeCount++, (ql && e.input.lastIOSEnter > Date.now() - 225 || Xl) && i.some((e) => e.nodeType == 1 && !Zu.test(e.nodeName)) && (!m || m.endA >= m.endB) && e.someProp("handleKeyDown", (t) => t(e, Ro(13, "Enter")))) {
		e.input.lastIOSEnter = 0;
		return;
	}
	if (!m) if (r && c instanceof F && !c.empty && c.$head.sameParent(c.$anchor) && !e.composing && !(l.sel && l.sel.anchor != l.sel.head)) m = {
		start: c.from,
		endA: c.to,
		endB: c.to
	};
	else {
		if (l.sel) {
			let t = gl(e, e.state.doc, l.sel);
			if (t && !t.eq(e.state.selection)) {
				let n = e.state.tr.setSelection(t);
				a && n.setMeta("composition", a), e.dispatch(n);
			}
		}
		return;
	}
	e.state.selection.from < e.state.selection.to && m.start == m.endB && e.state.selection instanceof F && (m.start > e.state.selection.from && m.start <= e.state.selection.from + 2 && e.state.selection.from >= l.from ? m.start = e.state.selection.from : m.endA < e.state.selection.to && m.endA >= e.state.selection.to - 2 && e.state.selection.to <= l.to && (m.endB += e.state.selection.to - m.endA, m.endA = e.state.selection.to)), Vl && Hl <= 11 && m.endB == m.start + 1 && m.endA == m.start && m.start > l.from && l.doc.textBetween(m.start - l.from - 1, m.start - l.from + 1) == " \xA0" && (m.start--, m.endA--, m.endB--);
	let h = l.doc.resolveNoCache(m.start - l.from), g = l.doc.resolveNoCache(m.endB - l.from), _ = u.resolve(m.start), v = h.sameParent(g) && h.parent.inlineContent && _.end() >= m.endA;
	if ((ql && e.input.lastIOSEnter > Date.now() - 225 && (!v || i.some((e) => e.nodeName == "DIV" || e.nodeName == "P")) || !v && h.pos < l.doc.content.size && (!h.sameParent(g) || !h.parent.inlineContent) && h.pos < g.pos && !/\S/.test(l.doc.textBetween(h.pos, g.pos, "", ""))) && e.someProp("handleKeyDown", (t) => t(e, Ro(13, "Enter")))) {
		e.input.lastIOSEnter = 0;
		return;
	}
	if (e.state.selection.anchor > m.start && vl(u, m.start, m.endA, h, g) && e.someProp("handleKeyDown", (t) => t(e, Ro(8, "Backspace")))) {
		Xl && B && e.domObserver.suppressSelectionUpdates();
		return;
	}
	B && m.endB == m.start && (e.input.lastChromeDelete = Date.now()), Xl && !v && h.start() != g.start() && g.parentOffset == 0 && h.depth == g.depth && l.sel && l.sel.anchor == l.sel.head && l.sel.head == m.endA && (m.endB -= 2, g = l.doc.resolveNoCache(m.endB - l.from), setTimeout(() => {
		e.someProp("handleKeyDown", function(t) {
			return t(e, Ro(13, "Enter"));
		});
	}, 20));
	let y = m.start, b = m.endA, x = (t) => {
		let n = t || e.state.tr.replace(y, b, l.doc.slice(m.start - l.from, m.endB - l.from));
		if (l.sel) {
			let t = gl(e, n.doc, l.sel);
			t && !(B && e.composing && t.empty && (m.start != m.endB || e.input.lastChromeDelete < Date.now() - 100) && (t.head == y || t.head == n.mapping.map(b) - 1) || Vl && t.empty && t.head == y) && n.setSelection(t);
		}
		return a && n.setMeta("composition", a), n.scrollIntoView();
	}, ee;
	if (v) if (h.pos == g.pos) {
		Vl && Hl <= 11 && h.parentOffset == 0 && (e.domObserver.suppressSelectionUpdates(), setTimeout(() => As(e), 20));
		let t = x(e.state.tr.delete(y, b)), n = u.resolve(m.start).marksAcross(u.resolve(m.endA));
		n && t.ensureMarks(n), e.dispatch(t);
	} else if (m.endA == m.endB && (ee = _l(h.parent.content.cut(h.parentOffset, g.parentOffset), _.parent.content.cut(_.parentOffset, m.endA - _.start())))) {
		let t = x(e.state.tr);
		ee.type == "add" ? t.addMark(y, b, ee.mark) : t.removeMark(y, b, ee.mark), e.dispatch(t);
	} else if (h.parent.child(h.index()).isText && h.index() == g.index() - +!g.textOffset) {
		let t = h.parent.textBetween(h.parentOffset, g.parentOffset), n = () => x(e.state.tr.insertText(t, y, b));
		e.someProp("handleTextInput", (r) => r(e, y, b, t, n)) || e.dispatch(n());
	} else e.dispatch(x());
	else e.dispatch(x());
}
function gl(e, t, n) {
	return Math.max(n.anchor, n.head) > t.content.size ? null : Rs(e, t.resolve(n.anchor), t.resolve(n.head));
}
function _l(e, t) {
	let n = e.firstChild.marks, r = t.firstChild.marks, i = n, a = r, o, s, c;
	for (let e = 0; e < r.length; e++) i = r[e].removeFromSet(i);
	for (let e = 0; e < n.length; e++) a = n[e].removeFromSet(a);
	if (i.length == 1 && a.length == 0) s = i[0], o = "add", c = (e) => e.mark(s.addToSet(e.marks));
	else if (i.length == 0 && a.length == 1) s = a[0], o = "remove", c = (e) => e.mark(s.removeFromSet(e.marks));
	else return null;
	let l = [];
	for (let e = 0; e < t.childCount; e++) l.push(c(t.child(e)));
	if (j.from(l).eq(e)) return {
		mark: s,
		type: o
	};
}
function vl(e, t, n, r, i) {
	if (n - t <= i.pos - r.pos || yl(r, !0, !1) < i.pos) return !1;
	let a = e.resolve(t);
	if (!r.parent.isTextblock) {
		let e = a.nodeAfter;
		return e != null && n == t + e.nodeSize;
	}
	if (a.parentOffset < a.parent.content.size || !a.parent.isTextblock) return !1;
	let o = e.resolve(yl(a, !0, !0));
	return !o.parent.isTextblock || o.pos > n || yl(o, !0, !1) < n ? !1 : r.parent.content.cut(r.parentOffset).eq(o.parent.content);
}
function yl(e, t, n) {
	let r = e.depth, i = t ? e.end() : e.pos;
	for (; r > 0 && (t || e.indexAfter(r) == e.node(r).childCount);) r--, i++, t = !1;
	if (n) {
		let t = e.node(r).maybeChild(e.indexAfter(r));
		for (; t && !t.isLeaf;) t = t.firstChild, i++;
	}
	return i;
}
function bl(e, t, n, r, i) {
	let a = e.findDiffStart(t, n), o = n + e.size, s = n + t.size;
	if (a == null) return null;
	let { a: c, b: l } = e.findDiffEnd(t, o, s);
	if (i == "end") {
		let e = Math.max(0, a - Math.min(c, l));
		r -= c + e - a;
	}
	if (c < a && o < s) {
		let e = r <= a && r >= c ? a - r : 0;
		a -= e, l = a + (l - c), c = a;
	} else if (l < a) {
		let e = r <= a && r >= l ? a - r : 0;
		a -= e, c = a + (c - l), l = a;
	}
	return {
		start: a,
		endA: c,
		endB: l
	};
}
function xl(e) {
	let t = Object.create(null);
	return t.class = "ProseMirror", t.contenteditable = String(e.editable), e.someProp("attributes", (n) => {
		if (typeof n == "function" && (n = n(e.state)), n) for (let e in n) e == "class" ? t.class += " " + n[e] : e == "style" ? t.style = (t.style ? t.style + ";" : "") + n[e] : !t[e] && e != "contenteditable" && e != "nodeName" && (t[e] = String(n[e]));
	}), t.translate ||= "no", [zu.node(0, e.state.doc.content.size, t)];
}
function Sl(e) {
	if (e.markCursor) {
		let t = document.createElement("img");
		t.className = "ProseMirror-separator", t.setAttribute("mark-placeholder", "true"), t.setAttribute("alt", ""), e.cursorWrapper = {
			dom: t,
			deco: zu.widget(e.state.selection.from, t, {
				raw: !0,
				marks: e.markCursor
			})
		};
	} else e.cursorWrapper = null;
}
function Cl(e) {
	return !e.someProp("editable", (t) => t(e.state) === !1);
}
function wl(e, t) {
	let n = Math.min(e.$anchor.sharedDepth(e.head), t.$anchor.sharedDepth(t.head));
	return e.$anchor.start(n) != t.$anchor.start(n);
}
function Tl(e) {
	let t = Object.create(null);
	function n(e) {
		for (let n in e) Object.prototype.hasOwnProperty.call(t, n) || (t[n] = e[n]);
	}
	return e.someProp("nodeViews", n), e.someProp("markViews", n), t;
}
function El(e, t) {
	let n = 0, r = 0;
	for (let r in e) {
		if (e[r] != t[r]) return !0;
		n++;
	}
	for (let e in t) r++;
	return n != r;
}
function Dl(e) {
	if (e.spec.state || e.spec.filterTransaction || e.spec.appendTransaction) throw RangeError("Plugins passed directly to the view must not have a state component");
}
var z, Ol, kl, Al, jl, Ml, Nl, Pl, Fl, Il, Ll, Rl, zl, Bl, Vl, Hl, Ul, Wl, B, Gl, Kl, ql, Jl, Yl, Xl, Zl, Ql, $l, eu, tu, nu, ru, iu, au, ou, su, cu, lu, uu, du, fu, pu, mu, hu, gu, _u, vu, yu, bu, xu, Su, Cu, wu, Tu, Eu, Du, Ou, ku, Au, ju, Mu, Nu, Pu, Fu, Iu, Lu, Ru, zu, Bu, Vu, V, Hu, Uu, Wu, Gu, Ku, qu, Ju, Yu, Xu, Zu, Qu, $u = S((() => {
	Pa(), Xr(), ua(), z = function(e) {
		for (var t = 0;; t++) if (e = e.previousSibling, !e) return t;
	}, Ol = function(e) {
		let t = e.assignedSlot || e.parentNode;
		return t && t.nodeType == 11 ? t.host : t;
	}, kl = null, Al = function(e, t, n) {
		let r = kl ||= document.createRange();
		return r.setEnd(e, n ?? e.nodeValue.length), r.setStart(e, t || 0), r;
	}, jl = function() {
		kl = null;
	}, Ml = function(e, t, n, r) {
		return n && (Mo(e, t, n, r, -1) || Mo(e, t, n, r, 1));
	}, Nl = /^(img|br|input|textarea|hr)$/i, Pl = function(e) {
		return e.focusNode && Ml(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset);
	}, Fl = typeof navigator < "u" ? navigator : null, Il = typeof document < "u" ? document : null, Ll = Fl && Fl.userAgent || "", Rl = /Edge\/(\d+)/.exec(Ll), zl = /MSIE \d/.exec(Ll), Bl = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Ll), Vl = !!(zl || Bl || Rl), Hl = zl ? document.documentMode : Bl ? +Bl[1] : Rl ? +Rl[1] : 0, Ul = !Vl && /gecko\/(\d+)/i.test(Ll), Ul && +(/Firefox\/(\d+)/.exec(Ll) || [0, 0])[1], Wl = !Vl && /Chrome\/(\d+)/.exec(Ll), B = !!Wl, Gl = Wl ? +Wl[1] : 0, Kl = !Vl && !!Fl && /Apple Computer/.test(Fl.vendor), ql = Kl && (/Mobile\/\w+/.test(Ll) || !!Fl && Fl.maxTouchPoints > 2), Jl = ql || (Fl ? /Mac/.test(Fl.platform) : !1), Yl = Fl ? /Win/.test(Fl.platform) : !1, Xl = /Android \d/.test(Ll), Zl = !!Il && "webkitFontSmoothing" in Il.documentElement.style, Ql = Zl ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0, $l = null, eu = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/, tu = /[\u0590-\u08ac]/, nu = null, ru = null, iu = !1, au = 0, ou = 1, su = 2, cu = 3, lu = class {
		constructor(e, t, n, r) {
			this.parent = e, this.children = t, this.dom = n, this.contentDOM = r, this.dirty = au, n.pmViewDesc = this;
		}
		matchesWidget(e) {
			return !1;
		}
		matchesMark(e) {
			return !1;
		}
		matchesNode(e, t, n) {
			return !1;
		}
		matchesHack(e) {
			return !1;
		}
		parseRule(e) {
			return null;
		}
		stopEvent(e) {
			return !1;
		}
		get size() {
			let e = 0;
			for (let t = 0; t < this.children.length; t++) e += this.children[t].size;
			return e;
		}
		get border() {
			return 0;
		}
		destroy() {
			this.parent = void 0, this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
			for (let e = 0; e < this.children.length; e++) this.children[e].destroy();
		}
		posBeforeChild(e) {
			for (let t = 0, n = this.posAtStart;; t++) {
				let r = this.children[t];
				if (r == e) return n;
				n += r.size;
			}
		}
		get posBefore() {
			return this.parent.posBeforeChild(this);
		}
		get posAtStart() {
			return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
		}
		get posAfter() {
			return this.posBefore + this.size;
		}
		get posAtEnd() {
			return this.posAtStart + this.size - 2 * this.border;
		}
		localPosFromDOM(e, t, n) {
			if (this.contentDOM && this.contentDOM.contains(e.nodeType == 1 ? e : e.parentNode)) if (n < 0) {
				let n, r;
				if (e == this.contentDOM) n = e.childNodes[t - 1];
				else {
					for (; e.parentNode != this.contentDOM;) e = e.parentNode;
					n = e.previousSibling;
				}
				for (; n && !((r = n.pmViewDesc) && r.parent == this);) n = n.previousSibling;
				return n ? this.posBeforeChild(r) + r.size : this.posAtStart;
			} else {
				let n, r;
				if (e == this.contentDOM) n = e.childNodes[t];
				else {
					for (; e.parentNode != this.contentDOM;) e = e.parentNode;
					n = e.nextSibling;
				}
				for (; n && !((r = n.pmViewDesc) && r.parent == this);) n = n.nextSibling;
				return n ? this.posBeforeChild(r) : this.posAtEnd;
			}
			let r;
			if (e == this.dom && this.contentDOM) r = t > z(this.contentDOM);
			else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) r = e.compareDocumentPosition(this.contentDOM) & 2;
			else if (this.dom.firstChild) {
				if (t == 0) for (let t = e;; t = t.parentNode) {
					if (t == this.dom) {
						r = !1;
						break;
					}
					if (t.previousSibling) break;
				}
				if (r == null && t == e.childNodes.length) for (let t = e;; t = t.parentNode) {
					if (t == this.dom) {
						r = !0;
						break;
					}
					if (t.nextSibling) break;
				}
			}
			return r ?? n > 0 ? this.posAtEnd : this.posAtStart;
		}
		nearestDesc(e, t = !1) {
			for (let n = !0, r = e; r; r = r.parentNode) {
				let i = this.getDesc(r), a;
				if (i && (!t || i.node)) if (n && (a = i.nodeDOM) && !(a.nodeType == 1 ? a.contains(e.nodeType == 1 ? e : e.parentNode) : a == e)) n = !1;
				else return i;
			}
		}
		getDesc(e) {
			let t = e.pmViewDesc;
			for (let e = t; e; e = e.parent) if (e == this) return t;
		}
		posFromDOM(e, t, n) {
			for (let r = e; r; r = r.parentNode) {
				let i = this.getDesc(r);
				if (i) return i.localPosFromDOM(e, t, n);
			}
			return -1;
		}
		descAt(e) {
			for (let t = 0, n = 0; t < this.children.length; t++) {
				let r = this.children[t], i = n + r.size;
				if (n == e && i != n) {
					for (; !r.border && r.children.length;) for (let e = 0; e < r.children.length; e++) {
						let t = r.children[e];
						if (t.size) {
							r = t;
							break;
						}
					}
					return r;
				}
				if (e < i) return r.descAt(e - n - r.border);
				n = i;
			}
		}
		domFromPos(e, t) {
			if (!this.contentDOM) return {
				node: this.dom,
				offset: 0,
				atom: e + 1
			};
			let n = 0, r = 0;
			for (let t = 0; n < this.children.length; n++) {
				let i = this.children[n], a = t + i.size;
				if (a > e || i instanceof hu) {
					r = e - t;
					break;
				}
				t = a;
			}
			if (r) return this.children[n].domFromPos(r - this.children[n].border, t);
			for (let e; n && !(e = this.children[n - 1]).size && e instanceof uu && e.side >= 0; n--);
			if (t <= 0) {
				let e, r = !0;
				for (; e = n ? this.children[n - 1] : null, !(!e || e.dom.parentNode == this.contentDOM); n--, r = !1);
				return e && t && r && !e.border && !e.domAtom ? e.domFromPos(e.size, t) : {
					node: this.contentDOM,
					offset: e ? z(e.dom) + 1 : 0
				};
			}
			{
				let e, r = !0;
				for (; e = n < this.children.length ? this.children[n] : null, !(!e || e.dom.parentNode == this.contentDOM); n++, r = !1);
				return e && r && !e.border && !e.domAtom ? e.domFromPos(0, t) : {
					node: this.contentDOM,
					offset: e ? z(e.dom) : this.contentDOM.childNodes.length
				};
			}
		}
		parseRange(e, t, n = 0) {
			if (this.children.length == 0) return {
				node: this.contentDOM,
				from: e,
				to: t,
				fromOffset: 0,
				toOffset: this.contentDOM.childNodes.length
			};
			let r = -1, i = -1;
			for (let a = n, o = 0;; o++) {
				let n = this.children[o], s = a + n.size;
				if (r == -1 && e <= s) {
					let i = a + n.border;
					if (e >= i && t <= s - n.border && n.node && n.contentDOM && this.contentDOM.contains(n.contentDOM)) return n.parseRange(e, t, i);
					e = a;
					for (let t = o; t > 0; t--) {
						let n = this.children[t - 1];
						if (n.size && n.dom.parentNode == this.contentDOM && !n.emptyChildAt(1)) {
							r = z(n.dom) + 1;
							break;
						}
						e -= n.size;
					}
					r == -1 && (r = 0);
				}
				if (r > -1 && (s > t || o == this.children.length - 1)) {
					t = s;
					for (let e = o + 1; e < this.children.length; e++) {
						let n = this.children[e];
						if (n.size && n.dom.parentNode == this.contentDOM && !n.emptyChildAt(-1)) {
							i = z(n.dom);
							break;
						}
						t += n.size;
					}
					i == -1 && (i = this.contentDOM.childNodes.length);
					break;
				}
				a = s;
			}
			return {
				node: this.contentDOM,
				from: e,
				to: t,
				fromOffset: r,
				toOffset: i
			};
		}
		emptyChildAt(e) {
			if (this.border || !this.contentDOM || !this.children.length) return !1;
			let t = this.children[e < 0 ? 0 : this.children.length - 1];
			return t.size == 0 || t.emptyChildAt(e);
		}
		domAfterPos(e) {
			let { node: t, offset: n } = this.domFromPos(e, 0);
			if (t.nodeType != 1 || n == t.childNodes.length) throw RangeError("No node after pos " + e);
			return t.childNodes[n];
		}
		setSelection(e, t, n, r = !1) {
			let i = Math.min(e, t), a = Math.max(e, t);
			for (let o = 0, s = 0; o < this.children.length; o++) {
				let c = this.children[o], l = s + c.size;
				if (i > s && a < l) return c.setSelection(e - s - c.border, t - s - c.border, n, r);
				s = l;
			}
			let o = this.domFromPos(e, e ? -1 : 1), s = t == e ? o : this.domFromPos(t, t ? -1 : 1), c = n.root.getSelection(), l = n.domSelectionRange(), u = !1;
			if ((Ul || Kl) && e == t) {
				let { node: e, offset: t } = o;
				if (e.nodeType == 3) {
					if (u = !!(t && e.nodeValue[t - 1] == "\n"), u && t == e.nodeValue.length) for (let t = e, n; t; t = t.parentNode) {
						if (n = t.nextSibling) {
							n.nodeName == "BR" && (o = s = {
								node: n.parentNode,
								offset: z(n) + 1
							});
							break;
						}
						let e = t.pmViewDesc;
						if (e && e.node && e.node.isBlock) break;
					}
				} else {
					let n = e.childNodes[t - 1];
					u = n && (n.nodeName == "BR" || n.contentEditable == "false");
				}
			}
			if (Ul && l.focusNode && l.focusNode != s.node && l.focusNode.nodeType == 1) {
				let e = l.focusNode.childNodes[l.focusOffset];
				e && e.contentEditable == "false" && (r = !0);
			}
			if (!(r || u && Kl) && Ml(o.node, o.offset, l.anchorNode, l.anchorOffset) && Ml(s.node, s.offset, l.focusNode, l.focusOffset)) return;
			let d = !1;
			if ((c.extend || e == t) && !(u && Ul)) {
				c.collapse(o.node, o.offset);
				try {
					e != t && c.extend(s.node, s.offset), d = !0;
				} catch {}
			}
			if (!d) {
				if (e > t) {
					let e = o;
					o = s, s = e;
				}
				let n = document.createRange();
				n.setEnd(s.node, s.offset), n.setStart(o.node, o.offset), c.removeAllRanges(), c.addRange(n);
			}
		}
		ignoreMutation(e) {
			return !this.contentDOM && e.type != "selection";
		}
		get contentLost() {
			return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
		}
		markDirty(e, t) {
			for (let n = 0, r = 0; r < this.children.length; r++) {
				let i = this.children[r], a = n + i.size;
				if (n == a ? e <= a && t >= n : e < a && t > n) {
					let r = n + i.border, o = a - i.border;
					if (e >= r && t <= o) {
						this.dirty = e == n || t == a ? su : ou, e == r && t == o && (i.contentLost || i.dom.parentNode != this.contentDOM) ? i.dirty = cu : i.markDirty(e - r, t - r);
						return;
					}
					i.dirty = i.dom == i.contentDOM && i.dom.parentNode == this.contentDOM && !i.children.length ? su : cu;
				}
				n = a;
			}
			this.dirty = su;
		}
		markParentsDirty() {
			let e = 1;
			for (let t = this.parent; t; t = t.parent, e++) {
				let n = e == 1 ? su : ou;
				t.dirty < n && (t.dirty = n);
			}
		}
		get domAtom() {
			return !1;
		}
		get ignoreForCoords() {
			return !1;
		}
		get ignoreForSelection() {
			return !1;
		}
		isText(e) {
			return !1;
		}
	}, uu = class extends lu {
		constructor(e, t, n, r) {
			let i, a = t.type.toDOM;
			if (typeof a == "function" && (a = a(n, () => {
				if (!i) return r;
				if (i.parent) return i.parent.posBeforeChild(i);
			})), !t.type.spec.raw) {
				if (a.nodeType != 1) {
					let e = document.createElement("span");
					e.appendChild(a), a = e;
				}
				a.contentEditable = "false", a.classList.add("ProseMirror-widget");
			}
			super(e, [], a, null), this.widget = t, this.widget = t, i = this;
		}
		matchesWidget(e) {
			return this.dirty == au && e.type.eq(this.widget.type);
		}
		parseRule() {
			return { ignore: !0 };
		}
		stopEvent(e) {
			let t = this.widget.spec.stopEvent;
			return t ? t(e) : !1;
		}
		ignoreMutation(e) {
			return e.type != "selection" || this.widget.spec.ignoreSelection;
		}
		destroy() {
			this.widget.type.destroy(this.dom), super.destroy();
		}
		get domAtom() {
			return !0;
		}
		get ignoreForSelection() {
			return !!this.widget.type.spec.relaxedSide;
		}
		get side() {
			return this.widget.type.side;
		}
	}, du = class extends lu {
		constructor(e, t, n, r) {
			super(e, [], t, null), this.textDOM = n, this.text = r;
		}
		get size() {
			return this.text.length;
		}
		localPosFromDOM(e, t) {
			return e == this.textDOM ? this.posAtStart + t : this.posAtStart + (t ? this.size : 0);
		}
		domFromPos(e) {
			return {
				node: this.textDOM,
				offset: e
			};
		}
		ignoreMutation(e) {
			return e.type === "characterData" && e.target.nodeValue == e.oldValue;
		}
	}, fu = class e extends lu {
		constructor(e, t, n, r, i) {
			super(e, [], n, r), this.mark = t, this.spec = i;
		}
		static create(t, n, r, i) {
			let a = i.nodeViews[n.type.name], o = a && a(n, i, r);
			return (!o || !o.dom) && (o = Jr.renderSpec(document, n.type.spec.toDOM(n, r), null, n.attrs)), new e(t, n, o.dom, o.contentDOM || o.dom, o);
		}
		parseRule() {
			return this.dirty & cu || this.mark.type.spec.reparseInView ? null : {
				mark: this.mark.type.name,
				attrs: this.mark.attrs,
				contentElement: this.contentDOM
			};
		}
		matchesMark(e) {
			return this.dirty != cu && this.mark.eq(e);
		}
		markDirty(e, t) {
			if (super.markDirty(e, t), this.dirty != au) {
				let e = this.parent;
				for (; !e.node;) e = e.parent;
				e.dirty < this.dirty && (e.dirty = this.dirty), this.dirty = au;
			}
		}
		slice(t, n, r) {
			let i = e.create(this.parent, this.mark, !0, r), a = this.children, o = this.size;
			n < o && (a = Ds(a, n, o, r)), t > 0 && (a = Ds(a, 0, t, r));
			for (let e = 0; e < a.length; e++) a[e].parent = i;
			return i.children = a, i;
		}
		ignoreMutation(e) {
			return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
		}
		destroy() {
			this.spec.destroy && this.spec.destroy(), super.destroy();
		}
	}, pu = class e extends lu {
		constructor(e, t, n, r, i, a, o) {
			super(e, [], i, a), this.node = t, this.outerDeco = n, this.innerDeco = r, this.nodeDOM = o;
		}
		static create(t, n, r, i, a, o) {
			let s = a.nodeViews[n.type.name], c, l = s && s(n, a, () => {
				if (!c) return o;
				if (c.parent) return c.parent.posBeforeChild(c);
			}, r, i), u = l && l.dom, d = l && l.contentDOM;
			if (n.isText) {
				if (!u) u = document.createTextNode(n.text);
				else if (u.nodeType != 3) throw RangeError("Text must be rendered as a DOM text node");
			} else if (!u) {
				let e = Jr.renderSpec(document, n.type.spec.toDOM(n), null, n.attrs);
				({dom: u, contentDOM: d} = e);
			}
			!d && !n.isText && u.nodeName != "BR" && (u.hasAttribute("contenteditable") || (u.contentEditable = "false"), n.type.spec.draggable && (u.draggable = !0));
			let f = u;
			return u = ys(u, r, n), l ? c = new gu(t, n, r, i, u, d || null, f, l) : n.isText ? new mu(t, n, r, i, u, f) : new e(t, n, r, i, u, d || null, f);
		}
		parseRule(e) {
			if (this.node.type.spec.reparseInView) return null;
			let t = {
				node: this.node.type.name,
				attrs: this.node.attrs
			};
			if (this.node.type.whitespace == "pre" && (t.preserveWhitespace = "full"), !this.contentDOM) t.getContent = () => this.node.content;
			else if (!this.contentLost) t.contentElement = this.contentDOM;
			else {
				for (let e = this.children.length - 1; e >= 0; e--) {
					let n = this.children[e];
					if (this.dom.contains(n.dom.parentNode)) {
						t.contentElement = n.dom.parentNode;
						break;
					}
				}
				if (!t.contentElement) {
					let n = e && e.find((t) => t.nodeType == 1 && e.indexOf(t.parentNode) < 0 && this.dom.contains(t));
					n ? t.contentElement = n : t.getContent = () => j.empty;
				}
			}
			return t;
		}
		matchesNode(e, t, n) {
			return this.dirty == au && e.eq(this.node) && bs(t, this.outerDeco) && n.eq(this.innerDeco);
		}
		get size() {
			return this.node.nodeSize;
		}
		get border() {
			return +!this.node.isLeaf;
		}
		updateChildren(e, t) {
			let n = this.node.inlineContent, r = t, i = e.composing ? this.localCompositionInfo(e, t) : null, a = i && i.pos > -1 ? i : null, o = i && i.pos < 0, s = new yu(this, a && a.node, e);
			ws(this.node, this.innerDeco, (t, i, a) => {
				t.spec.marks ? s.syncToMarks(t.spec.marks, n, e, i) : t.type.side >= 0 && !a && s.syncToMarks(i == this.node.childCount ? M.none : this.node.child(i).marks, n, e, i), s.placeWidget(t, e, r);
			}, (t, a, c, l) => {
				s.syncToMarks(t.marks, n, e, l);
				let u;
				s.findNodeMatch(t, a, c, l) || o && e.state.selection.from > r && e.state.selection.to < r + t.nodeSize && (u = s.findIndexWithChild(i.node)) > -1 && s.updateNodeAt(t, a, c, u, e) || s.updateNextNode(t, a, c, e, l, r) || s.addNode(t, a, c, e, r), r += t.nodeSize;
			}), s.syncToMarks([], n, e, 0), this.node.isTextblock && s.addTextblockHacks(), s.destroyRest(), (s.changed || this.dirty == su) && (a && this.protectLocalComposition(e, a), hs(this.contentDOM, this.children, e), ql && Ts(this.dom));
		}
		localCompositionInfo(e, t) {
			let { from: n, to: r } = e.state.selection;
			if (!(e.state.selection instanceof F) || n < t || r > t + this.node.content.size) return null;
			let i = e.input.compositionNode;
			if (!i || !this.dom.contains(i.parentNode)) return null;
			if (this.node.inlineContent) {
				let e = i.nodeValue, a = Es(this.node.content, e, n - t, r - t);
				return a < 0 ? null : {
					node: i,
					pos: a,
					text: e
				};
			}
			return {
				node: i,
				pos: -1,
				text: ""
			};
		}
		protectLocalComposition(e, { node: t, pos: n, text: r }) {
			if (this.getDesc(t)) return;
			let i = t;
			for (; i.parentNode != this.contentDOM; i = i.parentNode) {
				for (; i.previousSibling;) i.parentNode.removeChild(i.previousSibling);
				for (; i.nextSibling;) i.parentNode.removeChild(i.nextSibling);
				i.pmViewDesc && (i.pmViewDesc = void 0);
			}
			let a = new du(this, i, t, r);
			e.input.compositionNodes.push(a), this.children = Ds(this.children, n, n + r.length, e, a);
		}
		update(e, t, n, r) {
			return this.dirty == cu || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, t, n, r), !0);
		}
		updateInner(e, t, n, r) {
			this.updateOuterDeco(t), this.node = e, this.innerDeco = n, this.contentDOM && this.updateChildren(r, this.posAtStart), this.dirty = au;
		}
		updateOuterDeco(e) {
			if (bs(e, this.outerDeco)) return;
			let t = this.nodeDOM.nodeType != 1, n = this.dom;
			this.dom = _s(this.dom, this.nodeDOM, gs(this.outerDeco, this.node, t), gs(e, this.node, t)), this.dom != n && (n.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = e;
		}
		selectNode() {
			this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.add("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && (this.nodeDOM.draggable = !0));
		}
		deselectNode() {
			this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.remove("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && this.nodeDOM.removeAttribute("draggable"));
		}
		get domAtom() {
			return this.node.isAtom;
		}
	}, mu = class e extends pu {
		constructor(e, t, n, r, i, a) {
			super(e, t, n, r, i, null, a);
		}
		parseRule() {
			let e = this.nodeDOM.parentNode;
			for (; e && e != this.dom && !e.pmIsDeco;) e = e.parentNode;
			return { skip: e || !0 };
		}
		update(e, t, n, r) {
			return this.dirty == cu || this.dirty != au && !this.inParent() || !e.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(t), (this.dirty != au || e.text != this.node.text) && e.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = e.text, r.trackWrites == this.nodeDOM && (r.trackWrites = null)), this.node = e, this.dirty = au, !0);
		}
		inParent() {
			let e = this.parent.contentDOM;
			for (let t = this.nodeDOM; t; t = t.parentNode) if (t == e) return !0;
			return !1;
		}
		domFromPos(e) {
			return {
				node: this.nodeDOM,
				offset: e
			};
		}
		localPosFromDOM(e, t, n) {
			return e == this.nodeDOM ? this.posAtStart + Math.min(t, this.node.text.length) : super.localPosFromDOM(e, t, n);
		}
		ignoreMutation(e) {
			return e.type != "characterData" && e.type != "selection";
		}
		slice(t, n, r) {
			let i = this.node.cut(t, n), a = document.createTextNode(i.text);
			return new e(this.parent, i, this.outerDeco, this.innerDeco, a, a);
		}
		markDirty(e, t) {
			super.markDirty(e, t), this.dom != this.nodeDOM && (e == 0 || t == this.nodeDOM.nodeValue.length) && (this.dirty = cu);
		}
		get domAtom() {
			return !1;
		}
		isText(e) {
			return this.node.text == e;
		}
	}, hu = class extends lu {
		parseRule() {
			return { ignore: !0 };
		}
		matchesHack(e) {
			return this.dirty == au && this.dom.nodeName == e;
		}
		get domAtom() {
			return !0;
		}
		get ignoreForCoords() {
			return this.dom.nodeName == "IMG";
		}
	}, gu = class extends pu {
		constructor(e, t, n, r, i, a, o, s) {
			super(e, t, n, r, i, a, o), this.spec = s;
		}
		update(e, t, n, r) {
			if (this.dirty == cu) return !1;
			if (this.spec.update && (this.node.type == e.type || this.spec.multiType)) {
				let i = this.spec.update(e, t, n);
				return i && this.updateInner(e, t, n, r), i;
			}
			return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, t, n, r);
		}
		selectNode() {
			this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
		}
		deselectNode() {
			this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
		}
		setSelection(e, t, n, r) {
			this.spec.setSelection ? this.spec.setSelection(e, t, n.root) : super.setSelection(e, t, n, r);
		}
		destroy() {
			this.spec.destroy && this.spec.destroy(), super.destroy();
		}
		stopEvent(e) {
			return this.spec.stopEvent ? this.spec.stopEvent(e) : !1;
		}
		ignoreMutation(e) {
			return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
		}
	}, _u = function(e) {
		e && (this.nodeName = e);
	}, _u.prototype = Object.create(null), vu = [new _u()], yu = class {
		constructor(e, t, n) {
			this.lock = t, this.view = n, this.index = 0, this.stack = [], this.changed = !1, this.top = e, this.preMatch = Ss(e.node.content, e);
		}
		destroyBetween(e, t) {
			if (e != t) {
				for (let n = e; n < t; n++) this.top.children[n].destroy();
				this.top.children.splice(e, t - e), this.changed = !0;
			}
		}
		destroyRest() {
			this.destroyBetween(this.index, this.top.children.length);
		}
		syncToMarks(e, t, n, r) {
			let i = 0, a = this.stack.length >> 1, o = Math.min(a, e.length);
			for (; i < o && (i == a - 1 ? this.top : this.stack[i + 1 << 1]).matchesMark(e[i]) && e[i].type.spec.spanning !== !1;) i++;
			for (; i < a;) this.destroyRest(), this.top.dirty = au, this.index = this.stack.pop(), this.top = this.stack.pop(), a--;
			for (; a < e.length;) {
				this.stack.push(this.top, this.index + 1);
				let i = -1, o = this.top.children.length;
				r < this.preMatch.index && (o = Math.min(this.index + 3, o));
				for (let t = this.index; t < o; t++) {
					let n = this.top.children[t];
					if (n.matchesMark(e[a]) && !this.isLocked(n.dom)) {
						i = t;
						break;
					}
				}
				if (i < 0 && this.index < this.top.children.length) {
					let t = this.top.children[this.index];
					t instanceof fu && t.dirty != cu && t.mark.type == e[a].type && t.spec.update && !this.isLocked(t.dom) && t.spec.update(e[a]) && (t.mark = e[a], i = this.index, this.changed = !0);
				}
				if (i > -1) i > this.index && (this.changed = !0, this.destroyBetween(this.index, i)), this.top = this.top.children[this.index];
				else {
					let r = fu.create(this.top, e[a], t, n);
					this.top.children.splice(this.index, 0, r), this.top = r, this.changed = !0;
				}
				this.index = 0, a++;
			}
		}
		findNodeMatch(e, t, n, r) {
			let i = -1, a;
			if (r >= this.preMatch.index && (a = this.preMatch.matches[r - this.preMatch.index]).parent == this.top && a.matchesNode(e, t, n)) i = this.top.children.indexOf(a, this.index);
			else for (let r = this.index, a = Math.min(this.top.children.length, r + 5); r < a; r++) {
				let a = this.top.children[r];
				if (a.matchesNode(e, t, n) && !this.preMatch.matched.has(a)) {
					i = r;
					break;
				}
			}
			return i < 0 ? !1 : (this.destroyBetween(this.index, i), this.index++, !0);
		}
		updateNodeAt(e, t, n, r, i) {
			let a = this.top.children[r];
			return a.dirty == cu && a.dom == a.contentDOM && (a.dirty = su), a.update(e, t, n, i) ? (this.destroyBetween(this.index, r), this.index++, !0) : !1;
		}
		findIndexWithChild(e) {
			for (;;) {
				let t = e.parentNode;
				if (!t) return -1;
				if (t == this.top.contentDOM) {
					let t = e.pmViewDesc;
					if (t) {
						for (let e = this.index; e < this.top.children.length; e++) if (this.top.children[e] == t) return e;
					}
					return -1;
				}
				e = t;
			}
		}
		updateNextNode(e, t, n, r, i, a) {
			for (let o = this.index; o < this.top.children.length; o++) {
				let s = this.top.children[o];
				if (s instanceof pu) {
					let c = this.preMatch.matched.get(s);
					if (c != null && c != i) return !1;
					let l = s.dom, u, d = this.isLocked(l) && !(e.isText && s.node && s.node.isText && s.nodeDOM.nodeValue == e.text && s.dirty != cu && bs(t, s.outerDeco));
					if (!d && s.update(e, t, n, r)) return this.destroyBetween(this.index, o), s.dom != l && (this.changed = !0), this.index++, !0;
					if (!d && (u = this.recreateWrapper(s, e, t, n, r, a))) return this.destroyBetween(this.index, o), this.top.children[this.index] = u, u.contentDOM && (u.dirty = su, u.updateChildren(r, a + 1), u.dirty = au), this.changed = !0, this.index++, !0;
					break;
				}
			}
			return !1;
		}
		recreateWrapper(e, t, n, r, i, a) {
			if (e.dirty || t.isAtom || !e.children.length || !e.node.content.eq(t.content) || !bs(n, e.outerDeco) || !r.eq(e.innerDeco)) return null;
			let o = pu.create(this.top, t, n, r, i, a);
			if (o.contentDOM) {
				o.children = e.children, e.children = [];
				for (let e of o.children) e.parent = o;
			}
			return e.destroy(), o;
		}
		addNode(e, t, n, r, i) {
			let a = pu.create(this.top, e, t, n, r, i);
			a.contentDOM && a.updateChildren(r, i + 1), this.top.children.splice(this.index++, 0, a), this.changed = !0;
		}
		placeWidget(e, t, n) {
			let r = this.index < this.top.children.length ? this.top.children[this.index] : null;
			if (r && r.matchesWidget(e) && (e == r.widget || !r.widget.type.toDOM.parentNode)) this.index++;
			else {
				let r = new uu(this.top, e, t, n);
				this.top.children.splice(this.index++, 0, r), this.changed = !0;
			}
		}
		addTextblockHacks() {
			let e = this.top.children[this.index - 1], t = this.top;
			for (; e instanceof fu;) t = e, e = t.children[t.children.length - 1];
			(!e || !(e instanceof mu) || /\n$/.test(e.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(e.node.text)) && ((Kl || B) && e && e.dom.contentEditable == "false" && this.addHackNode("IMG", t), this.addHackNode("BR", this.top));
		}
		addHackNode(e, t) {
			if (t == this.top && this.index < t.children.length && t.children[this.index].matchesHack(e)) this.index++;
			else {
				let n = document.createElement(e);
				e == "IMG" && (n.className = "ProseMirror-separator", n.alt = ""), e == "BR" && (n.className = "ProseMirror-trailingBreak");
				let r = new hu(this.top, [], n, null);
				t == this.top ? t.children.splice(this.index++, 0, r) : t.children.push(r), this.changed = !0;
			}
		}
		isLocked(e) {
			return this.lock && (e == this.lock || e.nodeType == 1 && e.contains(this.lock.parentNode));
		}
	}, bu = Kl || B && Gl < 63, xu = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i, Su = {
		thead: ["table"],
		tbody: ["table"],
		tfoot: ["table"],
		caption: ["table"],
		colgroup: ["table"],
		col: ["table", "colgroup"],
		tr: ["table", "tbody"],
		td: [
			"table",
			"tbody",
			"tr"
		],
		th: [
			"table",
			"tbody",
			"tr"
		]
	}, Cu = null, wu = {}, Tu = {}, Eu = {
		touchstart: !0,
		touchmove: !0
	}, Du = class {
		constructor() {
			this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = {
				time: 0,
				x: 0,
				y: 0,
				type: "",
				button: 0
			}, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = Object.create(null), this.hideSelectionGuard = null;
		}
	}, Tu.keydown = (e, t) => {
		let n = t;
		if (e.input.shiftKey = n.keyCode == 16 || n.shiftKey, !zc(e) && (e.input.lastKeyCode = n.keyCode, e.input.lastKeyCodeTime = Date.now(), !(Xl && B && n.keyCode == 13))) if (n.keyCode != 229 && e.domObserver.forceFlush(), ql && n.keyCode == 13 && !n.ctrlKey && !n.altKey && !n.metaKey) {
			let t = Date.now();
			e.input.lastIOSEnter = t, e.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
				e.input.lastIOSEnter == t && (e.someProp("handleKeyDown", (t) => t(e, Ro(13, "Enter"))), e.input.lastIOSEnter = 0);
			}, 200);
		} else e.someProp("handleKeyDown", (t) => t(e, n)) || oc(e, n) ? n.preventDefault() : xc(e, "key");
	}, Tu.keyup = (e, t) => {
		t.keyCode == 16 && (e.input.shiftKey = !1);
	}, Tu.keypress = (e, t) => {
		let n = t;
		if (zc(e) || !n.charCode || n.ctrlKey && !n.altKey || Jl && n.metaKey) return;
		if (e.someProp("handleKeyPress", (t) => t(e, n))) {
			n.preventDefault();
			return;
		}
		let r = e.state.selection;
		if (!(r instanceof F) || !r.$from.sameParent(r.$to)) {
			let t = String.fromCharCode(n.charCode), i = () => e.state.tr.insertText(t).scrollIntoView();
			!/[\r\n]/.test(t) && !e.someProp("handleTextInput", (n) => n(e, r.$from.pos, r.$to.pos, t, i)) && e.dispatch(i()), n.preventDefault();
		}
	}, Ou = Jl ? "metaKey" : "ctrlKey", wu.mousedown = (e, t) => {
		let n = t;
		e.input.shiftKey = n.shiftKey;
		let r = Rc(e), i = Date.now(), a = "singleClick";
		i - e.input.lastClick.time < 500 && Oc(n, e.input.lastClick) && !n[Ou] && e.input.lastClick.button == n.button && (e.input.lastClick.type == "singleClick" ? a = "doubleClick" : e.input.lastClick.type == "doubleClick" && (a = "tripleClick")), e.input.lastClick = {
			time: i,
			x: n.clientX,
			y: n.clientY,
			type: a,
			button: n.button
		}, e.input.mouseDown && e.input.mouseDown.done();
		let o = e.posAtCoords(Dc(n));
		o && (a == "singleClick" ? e.input.mouseDown = new Au(e, o, n, !!r) : (a == "doubleClick" ? Pc : Fc)(e, o.pos, o.inside, n) ? n.preventDefault() : xc(e, "pointer"));
	}, ku = class {
		constructor(e) {
			this.view = e, this.mightDrag = null, e.root.addEventListener("mouseup", this.up = this.up.bind(this)), e.root.addEventListener("mousemove", this.move = this.move.bind(this));
		}
		up(e) {
			this.done();
		}
		move(e) {
			e.buttons == 0 && this.done();
		}
		done() {
			this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.view.input.mouseDown == this && (this.view.input.mouseDown = null);
		}
		delaySelUpdate() {
			return !1;
		}
	}, Au = class extends ku {
		constructor(e, t, n, r) {
			super(e), this.pos = t, this.event = n, this.flushed = r, this.delayedSelectionSync = !1, this.startDoc = e.state.doc, this.selectNode = !!n[Ou], this.allowDefault = n.shiftKey;
			let i, a;
			if (t.inside > -1) i = e.state.doc.nodeAt(t.inside), a = t.inside;
			else {
				let n = e.state.doc.resolve(t.pos);
				i = n.parent, a = n.depth ? n.before() : 0;
			}
			let o = r ? null : n.target, s = o ? e.docView.nearestDesc(o, !0) : null;
			this.target = s && s.nodeDOM.nodeType == 1 ? s.nodeDOM : null;
			let { selection: c } = e.state;
			n.button == 0 && (i.type.spec.draggable && i.type.spec.selectable !== !1 || c instanceof I && c.from <= a && c.to > a) && (this.mightDrag = {
				node: i,
				pos: a,
				addAttr: !!(this.target && !this.target.draggable),
				setUneditable: !!(this.target && Ul && !this.target.hasAttribute("contentEditable"))
			}), this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable) && (this.view.domObserver.stop(), this.mightDrag.addAttr && (this.target.draggable = !0), this.mightDrag.setUneditable && setTimeout(() => {
				this.view.input.mouseDown == this && this.target.setAttribute("contentEditable", "false");
			}, 20), this.view.domObserver.start()), xc(e, "pointer");
		}
		done() {
			super.done(), this.mightDrag && this.target && (this.view.domObserver.stop(), this.mightDrag.addAttr && this.target.removeAttribute("draggable"), this.mightDrag.setUneditable && this.target.removeAttribute("contentEditable"), this.view.domObserver.start()), this.delayedSelectionSync && setTimeout(() => {
				this.view.isDestroyed || As(this.view);
			});
		}
		up(e) {
			if (this.done(), !this.view.dom.contains(e.target)) return;
			let t = this.pos;
			this.view.state.doc != this.startDoc && (t = this.view.posAtCoords(Dc(e))), this.updateAllowDefault(e), this.allowDefault || !t ? xc(this.view, "pointer") : Nc(this.view, t.pos, t.inside, e, this.selectNode) ? e.preventDefault() : e.button == 0 && (this.flushed || Kl && this.mightDrag && !this.mightDrag.node.isAtom || B && !this.view.state.selection.visible && Math.min(Math.abs(t.pos - this.view.state.selection.from), Math.abs(t.pos - this.view.state.selection.to)) <= 2) ? (Ac(this.view, P.near(this.view.state.doc.resolve(t.pos)), "pointer"), e.preventDefault()) : xc(this.view, "pointer");
		}
		move(e) {
			this.updateAllowDefault(e), xc(this.view, "pointer"), super.move(e);
		}
		updateAllowDefault(e) {
			!this.allowDefault && (Math.abs(this.event.x - e.clientX) > 4 || Math.abs(this.event.y - e.clientY) > 4) && (this.allowDefault = !0);
		}
		delaySelUpdate() {
			return this.allowDefault ? (this.delayedSelectionSync = !0, !0) : !1;
		}
	}, ju = class extends ku {
		constructor(e, t) {
			super(e), this.startSelection = t, this.startDoc = e.state.doc;
		}
		move(e) {
			if (e.buttons == 0 || this.view.isDestroyed || !this.view.state.doc.eq(this.startDoc)) {
				this.done();
				return;
			}
			e.preventDefault(), xc(this.view, "pointer");
			let t = this.view.posAtCoords(Dc(e)), n = t && Lc(this.view, t.inside, !1);
			if (!n) return;
			let { doc: r } = this.view.state, i = this.startSelection, [a, o] = n.from < i.from ? [i.to, n.from] : [i.from, n.to];
			Ac(this.view, F.create(r, a, o), "pointer");
		}
	}, wu.touchstart = (e) => {
		e.input.lastTouch = Date.now(), Rc(e), xc(e, "pointer");
	}, wu.touchmove = (e) => {
		e.input.lastTouch = Date.now(), xc(e, "pointer");
	}, wu.contextmenu = (e) => Rc(e), Mu = Xl ? 5e3 : -1, Tu.compositionstart = Tu.compositionupdate = (e) => {
		if (!e.composing) {
			e.domObserver.flush();
			let { state: t } = e, n = t.selection.$to;
			if (t.selection instanceof F && (t.storedMarks || !n.textOffset && n.parentOffset && n.nodeBefore.marks.some((e) => e.type.spec.inclusive === !1) || B && Yl && Bc(e))) e.markCursor = e.state.storedMarks || n.marks(), Wc(e, !0), e.markCursor = null;
			else if (Wc(e, !t.selection.empty), Ul && t.selection.empty && n.parentOffset && !n.textOffset && n.nodeBefore.marks.length) {
				let t = e.domSelectionRange();
				for (let n = t.focusNode, r = t.focusOffset; n && n.nodeType == 1 && r != 0;) {
					let t = r < 0 ? n.lastChild : n.childNodes[r - 1];
					if (!t) break;
					if (t.nodeType == 3) {
						let n = e.domSelection();
						n && n.collapse(t, t.nodeValue.length);
						break;
					}
					n = t, r = -1;
				}
			}
			e.input.composing = !0;
		}
		Vc(e, Mu);
	}, Tu.compositionend = (e, t) => {
		e.composing && (e.input.composing = !1, e.input.compositionEndedAt = Date.now(), e.input.compositionPendingChanges = e.domObserver.pendingRecords().length ? e.input.compositionID : 0, e.input.compositionNode = null, e.input.badSafariComposition ? e.domObserver.forceFlush() : e.input.compositionPendingChanges && Promise.resolve().then(() => e.domObserver.flush()), e.input.compositionID++, Vc(e, 20));
	}, Nu = Vl && Hl < 15 || ql && Ql < 604, wu.copy = Tu.cut = (e, t) => {
		let n = t, r = e.state.selection, i = n.type == "cut";
		if (r.empty) return;
		let a = Nu ? null : n.clipboardData, { dom: o, text: s } = sc(e, r.content());
		a ? (n.preventDefault(), a.clearData(), a.setData("text/html", o.innerHTML), a.setData("text/plain", s)) : Gc(e, o), i && e.dispatch(e.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
	}, Tu.paste = (e, t) => {
		let n = t;
		if (e.composing && !Xl) return;
		let r = Nu ? null : n.clipboardData, i = e.input.shiftKey && e.input.lastKeyCode != 45;
		r && Jc(e, Yc(r), r.getData("text/html"), i, n) ? n.preventDefault() : qc(e, n);
	}, Pu = class {
		constructor(e, t, n) {
			this.slice = e, this.move = t, this.node = n;
		}
	}, Fu = Jl ? "altKey" : "ctrlKey", wu.dragstart = (e, t) => {
		let n = t, r = e.input.mouseDown;
		if (r && r.done(), !n.dataTransfer) return;
		let i = e.state.selection, a = i.empty ? null : e.posAtCoords(Dc(n)), o;
		if (!(a && a.pos >= i.from && a.pos <= (i instanceof I ? i.to - 1 : i.to))) {
			if (r && r.mightDrag) o = I.create(e.state.doc, r.mightDrag.pos);
			else if (n.target && n.target.nodeType == 1) {
				let t = e.docView.nearestDesc(n.target, !0);
				t && t.node.type.spec.draggable && t != e.docView && (o = I.create(e.state.doc, t.posBefore));
			}
		}
		let { dom: s, text: c, slice: l } = sc(e, (o || e.state.selection).content());
		(!n.dataTransfer.files.length || !B || Gl > 120) && n.dataTransfer.clearData(), n.dataTransfer.setData(Nu ? "Text" : "text/html", s.innerHTML), n.dataTransfer.effectAllowed = "copyMove", Nu || n.dataTransfer.setData("text/plain", c), e.dragging = new Pu(l, Xc(e, n), o);
	}, wu.dragend = (e) => {
		let t = e.dragging;
		window.setTimeout(() => {
			e.dragging == t && (e.dragging = null);
		}, 50);
	}, Tu.dragover = Tu.dragenter = (e, t) => t.preventDefault(), Tu.drop = (e, t) => {
		try {
			Zc(e, t, e.dragging);
		} finally {
			e.dragging = null;
		}
	}, wu.focus = (e) => {
		e.input.lastFocus = Date.now(), e.focused || (e.domObserver.stop(), e.dom.classList.add("ProseMirror-focused"), e.domObserver.start(), e.focused = !0, setTimeout(() => {
			e.docView && e.hasFocus() && !e.domObserver.currentSelection.eq(e.domSelectionRange()) && As(e);
		}, 20));
	}, wu.blur = (e, t) => {
		let n = t;
		e.focused &&= (e.domObserver.stop(), e.dom.classList.remove("ProseMirror-focused"), e.domObserver.start(), n.relatedTarget && e.dom.contains(n.relatedTarget) && e.domObserver.currentSelection.clear(), !1);
	}, wu.beforeinput = (e, t) => {
		if (Xl && t.inputType == "deleteContentBackward") {
			e.domObserver.flushSoon();
			let { domChangeCount: t } = e.input;
			setTimeout(() => {
				if (e.input.domChangeCount != t || (e.dom.blur(), e.focus(), e.someProp("handleKeyDown", (t) => t(e, Ro(8, "Backspace"))))) return;
				let { $cursor: n } = e.state.selection;
				n && n.pos > 0 && e.dispatch(e.state.tr.delete(n.pos - 1, n.pos).scrollIntoView());
			}, 50);
		}
	};
	for (let e in Tu) wu[e] = Tu[e];
	Iu = class e {
		constructor(e, t) {
			this.toDOM = e, this.spec = t || Vu, this.side = this.spec.side || 0;
		}
		map(e, t, n, r) {
			let { pos: i, deleted: a } = e.mapResult(t.from + r, this.side < 0 ? -1 : 1);
			return a ? null : new zu(i - n, i - n, this);
		}
		valid() {
			return !0;
		}
		eq(t) {
			return this == t || t instanceof e && (this.spec.key && this.spec.key == t.spec.key || this.toDOM == t.toDOM && Qc(this.spec, t.spec));
		}
		destroy(e) {
			this.spec.destroy && this.spec.destroy(e);
		}
	}, Lu = class e {
		constructor(e, t) {
			this.attrs = e, this.spec = t || Vu;
		}
		map(e, t, n, r) {
			let i = e.map(t.from + r, this.spec.inclusiveStart ? -1 : 1) - n, a = e.map(t.to + r, this.spec.inclusiveEnd ? 1 : -1) - n;
			return i >= a ? null : new zu(i, a, this);
		}
		valid(e, t) {
			return t.from < t.to;
		}
		eq(t) {
			return this == t || t instanceof e && Qc(this.attrs, t.attrs) && Qc(this.spec, t.spec);
		}
		static is(t) {
			return t.type instanceof e;
		}
		destroy() {}
	}, Ru = class e {
		constructor(e, t) {
			this.attrs = e, this.spec = t || Vu;
		}
		map(e, t, n, r) {
			let i = e.mapResult(t.from + r, 1);
			if (i.deleted) return null;
			let a = e.mapResult(t.to + r, -1);
			return a.deleted || a.pos <= i.pos ? null : new zu(i.pos - n, a.pos - n, this);
		}
		valid(e, t) {
			let { index: n, offset: r } = e.content.findIndex(t.from), i;
			return r == t.from && !(i = e.child(n)).isText && r + i.nodeSize == t.to;
		}
		eq(t) {
			return this == t || t instanceof e && Qc(this.attrs, t.attrs) && Qc(this.spec, t.spec);
		}
		destroy() {}
	}, zu = class e {
		constructor(e, t, n) {
			this.from = e, this.to = t, this.type = n;
		}
		copy(t, n) {
			return new e(t, n, this.type);
		}
		eq(e, t = 0) {
			return this.type.eq(e.type) && this.from + t == e.from && this.to + t == e.to;
		}
		map(e, t, n) {
			return this.type.map(e, this, t, n);
		}
		static widget(t, n, r) {
			return new e(t, t, new Iu(n, r));
		}
		static inline(t, n, r, i) {
			return new e(t, n, new Lu(r, i));
		}
		static node(t, n, r, i) {
			return new e(t, n, new Ru(r, i));
		}
		get spec() {
			return this.type.spec;
		}
		get inline() {
			return this.type instanceof Lu;
		}
		get widget() {
			return this.type instanceof Iu;
		}
	}, Bu = [], Vu = {}, V = class e {
		constructor(e, t) {
			this.local = e.length ? e : Bu, this.children = t.length ? t : Bu;
		}
		static create(e, t) {
			return t.length ? il(t, e, 0, Vu) : Hu;
		}
		find(e, t, n) {
			let r = [];
			return this.findInner(e ?? 0, t ?? 1e9, r, 0, n), r;
		}
		findInner(e, t, n, r, i) {
			for (let a = 0; a < this.local.length; a++) {
				let o = this.local[a];
				o.from <= t && o.to >= e && (!i || i(o.spec)) && n.push(o.copy(o.from + r, o.to + r));
			}
			for (let a = 0; a < this.children.length; a += 3) if (this.children[a] < t && this.children[a + 1] > e) {
				let o = this.children[a] + 1;
				this.children[a + 2].findInner(e - o, t - o, n, r + o, i);
			}
		}
		map(e, t, n) {
			return this == Hu || e.maps.length == 0 ? this : this.mapInner(e, t, 0, 0, n || Vu);
		}
		mapInner(t, n, r, i, a) {
			let o;
			for (let e = 0; e < this.local.length; e++) {
				let s = this.local[e].map(t, r, i);
				s && s.type.valid(n, s) ? (o ||= []).push(s) : a.onRemove && a.onRemove(this.local[e].spec);
			}
			return this.children.length ? $c(this.children, o || [], t, n, r, i, a) : o ? new e(o.sort(al), Bu) : Hu;
		}
		add(t, n) {
			return n.length ? this == Hu ? e.create(t, n) : this.addInner(t, n, 0) : this;
		}
		addInner(t, n, r) {
			let i, a = 0;
			t.forEach((e, t) => {
				let o = t + r, s;
				if (s = nl(n, e, o)) {
					for (i ||= this.children.slice(); a < i.length && i[a] < t;) a += 3;
					i[a] == t ? i[a + 2] = i[a + 2].addInner(e, s, o + 1) : i.splice(a, 0, t, t + e.nodeSize, il(s, e, o + 1, Vu)), a += 3;
				}
			});
			let o = el(a ? rl(n) : n, -r);
			for (let e = 0; e < o.length; e++) o[e].type.valid(t, o[e]) || o.splice(e--, 1);
			return new e(o.length ? this.local.concat(o).sort(al) : this.local, i || this.children);
		}
		remove(e) {
			return e.length == 0 || this == Hu ? this : this.removeInner(e, 0);
		}
		removeInner(t, n) {
			let r = this.children, i = this.local;
			for (let e = 0; e < r.length; e += 3) {
				let i, a = r[e] + n, o = r[e + 1] + n;
				for (let e = 0, n; e < t.length; e++) (n = t[e]) && n.from > a && n.to < o && (t[e] = null, (i ||= []).push(n));
				if (!i) continue;
				r == this.children && (r = this.children.slice());
				let s = r[e + 2].removeInner(i, a + 1);
				s == Hu ? (r.splice(e, 3), e -= 3) : r[e + 2] = s;
			}
			if (i.length) {
				for (let e = 0, r; e < t.length; e++) if (r = t[e]) for (let e = 0; e < i.length; e++) i[e].eq(r, n) && (i == this.local && (i = this.local.slice()), i.splice(e--, 1));
			}
			return r == this.children && i == this.local ? this : i.length || r.length ? new e(i, r) : Hu;
		}
		forChild(t, n) {
			if (this == Hu) return this;
			if (n.isLeaf) return e.empty;
			let r, i;
			for (let e = 0; e < this.children.length; e += 3) if (this.children[e] >= t) {
				this.children[e] == t && (r = this.children[e + 2]);
				break;
			}
			let a = t + 1, o = a + n.content.size;
			for (let e = 0; e < this.local.length; e++) {
				let t = this.local[e];
				if (t.from < o && t.to > a && t.type instanceof Lu) {
					let e = Math.max(a, t.from) - a, n = Math.min(o, t.to) - a;
					e < n && (i ||= []).push(t.copy(e, n));
				}
			}
			if (i) {
				let t = new e(i.sort(al), Bu);
				return r ? new Uu([t, r]) : t;
			}
			return r || Hu;
		}
		eq(t) {
			if (this == t) return !0;
			if (!(t instanceof e) || this.local.length != t.local.length || this.children.length != t.children.length) return !1;
			for (let e = 0; e < this.local.length; e++) if (!this.local[e].eq(t.local[e])) return !1;
			for (let e = 0; e < this.children.length; e += 3) if (this.children[e] != t.children[e] || this.children[e + 1] != t.children[e + 1] || !this.children[e + 2].eq(t.children[e + 2])) return !1;
			return !0;
		}
		locals(e) {
			return ol(this.localsInner(e));
		}
		localsInner(e) {
			if (this == Hu) return Bu;
			if (e.inlineContent || !this.local.some(Lu.is)) return this.local;
			let t = [];
			for (let e = 0; e < this.local.length; e++) this.local[e].type instanceof Lu || t.push(this.local[e]);
			return t;
		}
		forEachSet(e) {
			e(this);
		}
	}, V.empty = new V([], []), V.removeOverlap = ol, Hu = V.empty, Uu = class e {
		constructor(e) {
			this.members = e;
		}
		map(t, n) {
			let r = this.members.map((e) => e.map(t, n, Vu));
			return e.from(r);
		}
		forChild(t, n) {
			if (n.isLeaf) return V.empty;
			let r = [];
			for (let i = 0; i < this.members.length; i++) {
				let a = this.members[i].forChild(t, n);
				a != Hu && (a instanceof e ? r = r.concat(a.members) : r.push(a));
			}
			return e.from(r);
		}
		eq(t) {
			if (!(t instanceof e) || t.members.length != this.members.length) return !1;
			for (let e = 0; e < this.members.length; e++) if (!this.members[e].eq(t.members[e])) return !1;
			return !0;
		}
		locals(e) {
			let t, n = !0;
			for (let r = 0; r < this.members.length; r++) {
				let i = this.members[r].localsInner(e);
				if (i.length) if (!t) t = i;
				else {
					n &&= (t = t.slice(), !1);
					for (let e = 0; e < i.length; e++) t.push(i[e]);
				}
			}
			return t ? ol(n ? t : t.sort(al)) : Bu;
		}
		static from(t) {
			switch (t.length) {
				case 0: return Hu;
				case 1: return t[0];
				default: return new e(t.every((e) => e instanceof V) ? t : t.reduce((e, t) => e.concat(t instanceof V ? t : t.members), []));
			}
		}
		forEachSet(e) {
			for (let t = 0; t < this.members.length; t++) this.members[t].forEachSet(e);
		}
	}, Wu = {
		childList: !0,
		characterData: !0,
		characterDataOldValue: !0,
		attributes: !0,
		attributeOldValue: !0,
		subtree: !0
	}, Gu = Vl && Hl <= 11, Ku = class {
		constructor() {
			this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
		}
		set(e) {
			this.anchorNode = e.anchorNode, this.anchorOffset = e.anchorOffset, this.focusNode = e.focusNode, this.focusOffset = e.focusOffset;
		}
		clear() {
			this.anchorNode = this.focusNode = null;
		}
		eq(e) {
			return e.anchorNode == this.anchorNode && e.anchorOffset == this.anchorOffset && e.focusNode == this.focusNode && e.focusOffset == this.focusOffset;
		}
	}, qu = class {
		constructor(e, t) {
			this.view = e, this.handleDOMChange = t, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new Ku(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((t) => {
				for (let e = 0; e < t.length; e++) this.queue.push(t[e]);
				Vl && Hl <= 11 && t.some((e) => e.type == "childList" && e.removedNodes.length || e.type == "characterData" && e.oldValue.length > e.target.nodeValue.length) ? this.flushSoon() : Kl && e.composing && t.some((e) => e.type == "childList" && e.target.nodeName == "TR") ? (e.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
			}), Gu && (this.onCharData = (e) => {
				this.queue.push({
					target: e.target,
					type: "characterData",
					oldValue: e.prevValue
				}), this.flushSoon();
			}), this.onSelectionChange = this.onSelectionChange.bind(this);
		}
		flushSoon() {
			this.flushingSoon < 0 && (this.flushingSoon = window.setTimeout(() => {
				this.flushingSoon = -1, this.flush();
			}, 20));
		}
		forceFlush() {
			this.flushingSoon > -1 && (window.clearTimeout(this.flushingSoon), this.flushingSoon = -1, this.flush());
		}
		start() {
			this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, Wu)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
		}
		stop() {
			if (this.observer) {
				let e = this.observer.takeRecords();
				if (e.length) {
					for (let t = 0; t < e.length; t++) this.queue.push(e[t]);
					window.setTimeout(() => this.flush(), 20);
				}
				this.observer.disconnect();
			}
			this.onCharData && this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData), this.disconnectSelection();
		}
		connectSelection() {
			this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
		}
		disconnectSelection() {
			this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
		}
		suppressSelectionUpdates() {
			this.suppressingSelectionUpdates = !0, setTimeout(() => this.suppressingSelectionUpdates = !1, 50);
		}
		onSelectionChange() {
			if (zs(this.view)) {
				if (this.suppressingSelectionUpdates) return As(this.view);
				if (Vl && Hl <= 11 && !this.view.state.selection.empty) {
					let e = this.view.domSelectionRange();
					if (e.focusNode && Ml(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset)) return this.flushSoon();
				}
				this.flush();
			}
		}
		setCurSelection() {
			this.currentSelection.set(this.view.domSelectionRange());
		}
		ignoreSelectionChange(e) {
			if (!e.focusNode) return !0;
			let t = /* @__PURE__ */ new Set(), n;
			for (let n = e.focusNode; n; n = Ol(n)) t.add(n);
			for (let r = e.anchorNode; r; r = Ol(r)) if (t.has(r)) {
				n = r;
				break;
			}
			let r = n && this.view.docView.nearestDesc(n);
			if (r && r.ignoreMutation({
				type: "selection",
				target: n.nodeType == 3 ? n.parentNode : n
			})) return this.setCurSelection(), !0;
		}
		pendingRecords() {
			if (this.observer) for (let e of this.observer.takeRecords()) this.queue.push(e);
			return this.queue;
		}
		flush() {
			let { view: e } = this;
			if (!e.docView || this.flushingSoon > -1) return;
			let t = this.pendingRecords();
			t.length && (this.queue = []);
			let n = e.domSelectionRange(), r = !this.suppressingSelectionUpdates && !this.currentSelection.eq(n) && zs(e) && !this.ignoreSelectionChange(n), i = -1, a = -1, o = !1, s = [];
			if (e.editable) for (let e = 0; e < t.length; e++) {
				let n = this.registerMutation(t[e], s);
				n && (i = i < 0 ? n.from : Math.min(n.from, i), a = a < 0 ? n.to : Math.max(n.to, a), n.typeOver && (o = !0));
			}
			if (s.some((e) => e.nodeName == "BR") && (e.input.lastKeyCode == 8 || e.input.lastKeyCode == 46 || B && (e.composing || e.input.compositionEndedAt > Date.now() - 50) && t.some((e) => e.type == "childList" && e.removedNodes.length))) {
				for (let e of s) if (e.nodeName == "BR" && e.parentNode) {
					let t = e.nextSibling;
					for (; t && t.nodeType == 1;) {
						if (t.contentEditable == "false") {
							e.parentNode.removeChild(e);
							break;
						}
						t = t.firstChild;
					}
				}
			} else if (Ul && s.length) {
				let t = s.filter((e) => e.nodeName == "BR");
				if (t.length == 2) {
					let [e, n] = t;
					e.parentNode && e.parentNode.parentNode == n.parentNode ? n.remove() : e.remove();
				} else {
					let { focusNode: n } = this.currentSelection;
					for (let r of t) {
						let t = r.parentNode;
						t && t.nodeName == "LI" && (!n || fl(e, n) != t) && r.remove();
					}
				}
			}
			let c = null;
			i < 0 && r && e.input.lastFocus > Date.now() - 200 && Math.max(e.input.lastTouch, e.input.lastClick.time) < Date.now() - 300 && Pl(n) && (c = Os(e)) && c.eq(P.near(e.state.doc.resolve(0), 1)) ? (e.input.lastFocus = 0, As(e), this.currentSelection.set(n), e.scrollToSelection()) : (i > -1 || r) && (i > -1 && (e.docView.markDirty(i, a), ll(e)), e.input.badSafariComposition && (e.input.badSafariComposition = !1, pl(e, s)), this.handleDOMChange(i, a, o, s), e.docView && e.docView.dirty ? e.updateState(e.state) : this.currentSelection.eq(n) || As(e), this.currentSelection.set(n));
		}
		registerMutation(e, t) {
			if (t.indexOf(e.target) > -1) return null;
			let n = this.view.docView.nearestDesc(e.target);
			if (e.type == "attributes" && (n == this.view.docView || e.attributeName == "contenteditable" || e.attributeName == "style" && !e.oldValue && !e.target.getAttribute("style")) || !n || n.ignoreMutation(e)) return null;
			if (e.type == "childList") {
				for (let n = 0; n < e.addedNodes.length; n++) {
					let r = e.addedNodes[n];
					t.push(r), r.nodeType == 3 && (this.lastChangedTextNode = r);
				}
				if (n.contentDOM && n.contentDOM != n.dom && !n.contentDOM.contains(e.target)) return {
					from: n.posBefore,
					to: n.posAfter
				};
				let r = e.previousSibling, i = e.nextSibling;
				if (Vl && Hl <= 11 && e.addedNodes.length) for (let t = 0; t < e.addedNodes.length; t++) {
					let { previousSibling: n, nextSibling: a } = e.addedNodes[t];
					(!n || Array.prototype.indexOf.call(e.addedNodes, n) < 0) && (r = n), (!a || Array.prototype.indexOf.call(e.addedNodes, a) < 0) && (i = a);
				}
				let a = r && r.parentNode == e.target ? z(r) + 1 : 0, o = n.localPosFromDOM(e.target, a, -1), s = i && i.parentNode == e.target ? z(i) : e.target.childNodes.length;
				return {
					from: o,
					to: n.localPosFromDOM(e.target, s, 1)
				};
			}
			return e.type == "attributes" ? {
				from: n.posAtStart - n.border,
				to: n.posAtEnd + n.border
			} : (this.lastChangedTextNode = e.target, {
				from: n.posAtStart,
				to: n.posAtEnd,
				typeOver: e.target.nodeValue == e.oldValue
			});
		}
	}, Ju = /* @__PURE__ */ new WeakMap(), Yu = !1, Xu = (e) => (t) => {
		let n = t.pmViewDesc;
		if (n) return n.parseRule(e);
		if (t.nodeName == "BR" && t.parentNode) {
			if (Kl && /^(ul|ol)$/i.test(t.parentNode.nodeName)) {
				let e = document.createElement("div");
				return e.appendChild(document.createElement("li")), { skip: e };
			}
			if (t.parentNode.lastChild == t || Kl && /^(tr|table)$/i.test(t.parentNode.nodeName)) return { ignore: !0 };
		} else if (t.nodeName == "IMG" && t.getAttribute("mark-placeholder")) return { ignore: !0 };
		return null;
	}, Zu = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i, Qu = class {
		constructor(e, t) {
			this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new Du(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = t, this.state = t.state, this.directPlugins = t.plugins || [], this.directPlugins.forEach(Dl), this.dispatch = this.dispatch.bind(this), this.dom = e && e.mount || document.createElement("div"), e && (e.appendChild ? e.appendChild(this.dom) : typeof e == "function" ? e(this.dom) : e.mount && (this.mounted = !0)), this.editable = Cl(this), Sl(this), this.nodeViews = Tl(this), this.docView = ms(this.state.doc, xl(this), cl(this), this.dom, this), this.domObserver = new qu(this, (e, t, n, r) => hl(this, e, t, n, r)), this.domObserver.start(), bc(this), this.updatePluginViews();
		}
		get composing() {
			return this.input.composing;
		}
		get props() {
			if (this._props.state != this.state) {
				let e = this._props;
				this._props = {};
				for (let t in e) this._props[t] = e[t];
				this._props.state = this.state;
			}
			return this._props;
		}
		update(e) {
			e.handleDOMEvents != this._props.handleDOMEvents && Cc(this);
			let t = this._props;
			this._props = e, e.plugins && (e.plugins.forEach(Dl), this.directPlugins = e.plugins), this.updateStateInner(e.state, t);
		}
		setProps(e) {
			let t = {};
			for (let e in this._props) t[e] = this._props[e];
			t.state = this.state;
			for (let n in e) t[n] = e[n];
			this.update(t);
		}
		updateState(e) {
			this.updateStateInner(e, this._props);
		}
		updateStateInner(e, t) {
			let n = this.state, r = !1, i = !1;
			e.storedMarks && this.composing && (Hc(this), i = !0), this.state = e;
			let a = n.plugins != e.plugins || this._props.plugins != t.plugins;
			if (a || this._props.plugins != t.plugins || this._props.nodeViews != t.nodeViews) {
				let e = Tl(this);
				El(e, this.nodeViews) && (this.nodeViews = e, r = !0);
			}
			(a || t.handleDOMEvents != this._props.handleDOMEvents) && Cc(this), this.editable = Cl(this), Sl(this);
			let o = cl(this), s = xl(this), c = n.plugins != e.plugins && !n.doc.eq(e.doc) ? "reset" : e.scrollToSelection > n.scrollToSelection ? "to selection" : "preserve", l = r || !this.docView.matchesNode(e.doc, s, o);
			(l || !e.selection.eq(n.selection)) && (i = !0);
			let u = c == "preserve" && i && this.dom.style.overflowAnchor == null && Go(this);
			if (i) {
				this.domObserver.stop();
				let t = l && (Vl || B) && !this.composing && !n.selection.empty && !e.selection.empty && wl(n.selection, e.selection);
				if (l) {
					let n = B ? this.trackWrites = this.domSelectionRange().focusNode : null;
					this.composing && (this.input.compositionNode = Uc(this)), (r || !this.docView.update(e.doc, s, o, this)) && (this.docView.updateOuterDeco(s), this.docView.destroy(), this.docView = ms(e.doc, s, o, this.dom, this)), n && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (t = !0);
				}
				let i = this.input.mouseDown;
				t || !(i && this.domObserver.currentSelection.eq(this.domSelectionRange()) && Vs(this) && i.delaySelUpdate()) ? As(this, t) : (Is(this, e.selection), this.domObserver.setCurSelection()), this.domObserver.start();
			}
			this.updatePluginViews(n), this.dragging?.node && !n.doc.eq(e.doc) && this.updateDraggedNode(this.dragging, n), c == "reset" ? this.dom.scrollTop = 0 : c == "to selection" ? this.scrollToSelection() : u && qo(u);
		}
		scrollToSelection() {
			let e = this.domSelectionRange().focusNode;
			if (!(!e || !this.dom.contains(e.nodeType == 1 ? e : e.parentNode)) && !this.someProp("handleScrollToSelection", (e) => e(this))) if (this.state.selection instanceof I) {
				let t = this.docView.domAfterPos(this.state.selection.from);
				t.nodeType == 1 && Wo(this, t.getBoundingClientRect(), e);
			} else Wo(this, this.coordsAtPos(this.state.selection.head, 1), e);
		}
		destroyPluginViews() {
			let e;
			for (; e = this.pluginViews.pop();) e.destroy && e.destroy();
		}
		updatePluginViews(e) {
			if (!e || e.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
				this.prevDirectPlugins = this.directPlugins, this.destroyPluginViews();
				for (let e = 0; e < this.directPlugins.length; e++) {
					let t = this.directPlugins[e];
					t.spec.view && this.pluginViews.push(t.spec.view(this));
				}
				for (let e = 0; e < this.state.plugins.length; e++) {
					let t = this.state.plugins[e];
					t.spec.view && this.pluginViews.push(t.spec.view(this));
				}
			} else for (let t = 0; t < this.pluginViews.length; t++) {
				let n = this.pluginViews[t];
				n.update && n.update(this, e);
			}
		}
		updateDraggedNode(e, t) {
			let n = e.node, r = -1;
			if (n.from < this.state.doc.content.size && this.state.doc.nodeAt(n.from) == n.node) r = n.from;
			else {
				let e = n.from + (this.state.doc.content.size - t.doc.content.size);
				(e > 0 && e < this.state.doc.content.size && this.state.doc.nodeAt(e)) == n.node && (r = e);
			}
			this.dragging = new Pu(e.slice, e.move, r < 0 ? void 0 : I.create(this.state.doc, r));
		}
		someProp(e, t) {
			let n = this._props && this._props[e], r;
			if (n != null && (r = t ? t(n) : n)) return r;
			for (let n = 0; n < this.directPlugins.length; n++) {
				let i = this.directPlugins[n].props[e];
				if (i != null && (r = t ? t(i) : i)) return r;
			}
			let i = this.state.plugins;
			if (i) for (let n = 0; n < i.length; n++) {
				let a = i[n].props[e];
				if (a != null && (r = t ? t(a) : a)) return r;
			}
		}
		hasFocus() {
			if (Vl) {
				let e = this.root.activeElement;
				if (e == this.dom) return !0;
				if (!e || !this.dom.contains(e)) return !1;
				for (; e && this.dom != e && this.dom.contains(e);) {
					if (e.contentEditable == "false") return !1;
					e = e.parentElement;
				}
				return !0;
			}
			return this.root.activeElement == this.dom;
		}
		focus() {
			this.domObserver.stop(), this.editable && Yo(this.dom), As(this), this.domObserver.start();
		}
		get root() {
			let e = this._root;
			if (e == null) {
				for (let e = this.dom.parentNode; e; e = e.parentNode) if (e.nodeType == 9 || e.nodeType == 11 && e.host) return e.getSelection || (Object.getPrototypeOf(e).getSelection = () => e.ownerDocument.getSelection()), this._root = e;
			}
			return e || document;
		}
		updateRoot() {
			this._root = null;
		}
		posAtCoords(e) {
			return rs(this, e);
		}
		coordsAtPos(e, t = 1) {
			return ss(this, e, t);
		}
		domAtPos(e, t = 0) {
			return this.docView.domFromPos(e, t);
		}
		nodeDOM(e) {
			let t = this.docView.descAt(e);
			return t ? t.nodeDOM : null;
		}
		posAtDOM(e, t, n = -1) {
			let r = this.docView.posFromDOM(e, t, n);
			if (r == null) throw RangeError("DOM position not inside the editor");
			return r;
		}
		endOfTextblock(e, t) {
			return ps(this, t || this.state, e);
		}
		pasteHTML(e, t) {
			return Jc(this, "", e, !1, t || new ClipboardEvent("paste"));
		}
		pasteText(e, t) {
			return Jc(this, e, null, !0, t || new ClipboardEvent("paste"));
		}
		serializeForClipboard(e) {
			return sc(this, e);
		}
		destroy() {
			this.docView && (Sc(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], cl(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, jl());
		}
		get isDestroyed() {
			return this.docView == null;
		}
		dispatchEvent(e) {
			return Ec(this, e);
		}
		domSelectionRange() {
			let e = this.domSelection();
			return e ? Kl && this.root.nodeType === 11 && zo(this.dom.ownerDocument) == this.dom && dl(this, e) || e : {
				focusNode: null,
				focusOffset: 0,
				anchorNode: null,
				anchorOffset: 0
			};
		}
		domSelection() {
			return this.root.getSelection();
		}
	}, Qu.prototype.dispatch = function(e) {
		let t = this._props.dispatchTransaction;
		t ? t.call(this, e) : this.updateState(this.state.apply(e));
	};
})), ed = S((() => {
	$u();
}));
//#endregion
//#region ../../node_modules/w3c-keyname/index.js
function td(e) {
	var t = !(id && e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey || ad && e.shiftKey && e.key && e.key.length == 1 || e.key == "Unidentified") && e.key || (e.shiftKey ? rd : nd)[e.keyCode] || e.key || "Unidentified";
	return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
var nd, rd, id, ad, H, od = S((() => {
	for (nd = {
		8: "Backspace",
		9: "Tab",
		10: "Enter",
		12: "NumLock",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		44: "PrintScreen",
		45: "Insert",
		46: "Delete",
		59: ";",
		61: "=",
		91: "Meta",
		92: "Meta",
		106: "*",
		107: "+",
		108: ",",
		109: "-",
		110: ".",
		111: "/",
		144: "NumLock",
		145: "ScrollLock",
		160: "Shift",
		161: "Shift",
		162: "Control",
		163: "Control",
		164: "Alt",
		165: "Alt",
		173: "-",
		186: ";",
		187: "=",
		188: ",",
		189: "-",
		190: ".",
		191: "/",
		192: "`",
		219: "[",
		220: "\\",
		221: "]",
		222: "'"
	}, rd = {
		48: ")",
		49: "!",
		50: "@",
		51: "#",
		52: "$",
		53: "%",
		54: "^",
		55: "&",
		56: "*",
		57: "(",
		59: ":",
		61: "+",
		173: "_",
		186: ":",
		187: "+",
		188: "<",
		189: "_",
		190: ">",
		191: "?",
		192: "~",
		219: "{",
		220: "|",
		221: "}",
		222: "\""
	}, id = typeof navigator < "u" && /Mac/.test(navigator.platform), ad = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent), H = 0; H < 10; H++) nd[48 + H] = nd[96 + H] = String(H);
	for (H = 1; H <= 24; H++) nd[H + 111] = "F" + H;
	for (H = 65; H <= 90; H++) nd[H] = String.fromCharCode(H + 32), rd[H] = String.fromCharCode(H);
	for (var e in nd) rd.hasOwnProperty(e) || (rd[e] = nd[e]);
}));
//#endregion
//#region ../../node_modules/prosemirror-keymap/dist/index.js
function sd(e) {
	let t = e.split(/-(?!$)/), n = t[t.length - 1];
	n == "Space" && (n = " ");
	let r, i, a, o;
	for (let e = 0; e < t.length - 1; e++) {
		let n = t[e];
		if (/^(cmd|meta|m)$/i.test(n)) o = !0;
		else if (/^a(lt)?$/i.test(n)) r = !0;
		else if (/^(c|ctrl|control)$/i.test(n)) i = !0;
		else if (/^s(hift)?$/i.test(n)) a = !0;
		else if (/^mod$/i.test(n)) fd ? o = !0 : i = !0;
		else throw Error("Unrecognized modifier name: " + n);
	}
	return r && (n = "Alt-" + n), i && (n = "Ctrl-" + n), o && (n = "Meta-" + n), a && (n = "Shift-" + n), n;
}
function cd(e) {
	let t = Object.create(null);
	for (let n in e) t[sd(n)] = e[n];
	return t;
}
function ld(e, t, n = !0) {
	return t.altKey && (e = "Alt-" + e), t.ctrlKey && (e = "Ctrl-" + e), t.metaKey && (e = "Meta-" + e), n && t.shiftKey && (e = "Shift-" + e), e;
}
function ud(e) {
	return new L({ props: { handleKeyDown: dd(e) } });
}
function dd(e) {
	let t = cd(e);
	return function(e, n) {
		let r = td(n), i, a = t[ld(r, n)];
		if (a && a(e.state, e.dispatch, e)) return !0;
		if (r.length == 1 && r != " ") {
			if (n.shiftKey) {
				let i = t[ld(r, n, !1)];
				if (i && i(e.state, e.dispatch, e)) return !0;
			}
			if ((n.altKey || n.metaKey || n.ctrlKey) && !(pd && n.ctrlKey && n.altKey) && (i = nd[n.keyCode]) && i != r) {
				let r = t[ld(i, n)];
				if (r && r(e.state, e.dispatch, e)) return !0;
			}
		}
		return !1;
	};
}
var fd, pd, md = S((() => {
	od(), Pa(), fd = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), pd = typeof navigator < "u" && /Win/.test(navigator.platform);
})), hd = S((() => {
	md();
}));
//#endregion
//#region ../../node_modules/@tiptap/core/dist/index.js
function gd(e) {
	let { state: t, transaction: n } = e, { selection: r } = n, { doc: i } = n, { storedMarks: a } = n;
	return {
		...t,
		apply: t.apply.bind(t),
		applyTransaction: t.applyTransaction.bind(t),
		plugins: t.plugins,
		schema: t.schema,
		reconfigure: t.reconfigure.bind(t),
		toJSON: t.toJSON.bind(t),
		get storedMarks() {
			return a;
		},
		get selection() {
			return r;
		},
		get doc() {
			return i;
		},
		get tr() {
			return r = n.selection, i = n.doc, a = n.storedMarks, n;
		}
	};
}
function U(e, t) {
	if (typeof e == "string") {
		if (!t.nodes[e]) throw Error(`There is no node type named '${e}'. Maybe you forgot to add the extension?`);
		return t.nodes[e];
	}
	return e;
}
function _d(e) {
	return Object.prototype.toString.call(e) === "[object RegExp]";
}
function vd(e, t, n = { strict: !0 }) {
	let r = Object.keys(t);
	return !r.length || r.every((r) => n.strict ? t[r] === e[r] : _d(t[r]) ? t[r].test(e[r]) : t[r] === e[r]);
}
function yd(e, t, n = {}) {
	return e.find((e) => e.type === t && vd(Object.fromEntries(Object.keys(n).map((t) => [t, e.attrs[t]])), n));
}
function bd(e, t, n = {}) {
	return !!yd(e, t, n);
}
function xd(e, t, n) {
	if (!e || !t) return;
	let r = e.parent.childAfter(e.parentOffset);
	if ((!r.node || !r.node.marks.some((e) => e.type === t)) && (r = e.parent.childBefore(e.parentOffset)), !r.node || !r.node.marks.some((e) => e.type === t)) return;
	if (!n) {
		let e = r.node.marks.find((e) => e.type === t);
		e && (n = e.attrs);
	}
	if (!yd([...r.node.marks], t, n)) return;
	let i = r.index, a = e.start() + r.offset, o = i + 1, s = a + r.node.nodeSize;
	for (; i > 0 && bd([...e.parent.child(i - 1).marks], t, n);) --i, a -= e.parent.child(i).nodeSize;
	for (; o < e.parent.childCount && bd([...e.parent.child(o).marks], t, n);) s += e.parent.child(o).nodeSize, o += 1;
	return {
		from: a,
		to: s
	};
}
function Sd(e, t) {
	if (typeof e == "string") {
		if (!t.marks[e]) throw Error(`There is no mark type named '${e}'. Maybe you forgot to add the extension?`);
		return t.marks[e];
	}
	return e;
}
function Cd(e) {
	return e instanceof F;
}
function wd(e = 0, t = 0, n = 0) {
	return Math.min(Math.max(e, t), n);
}
function Td(e, t = null) {
	if (!t) return null;
	let n = P.atStart(e), r = P.atEnd(e);
	if (t === "start" || t === !0) return n;
	if (t === "end") return r;
	let i = n.from, a = r.to;
	return t === "all" ? F.create(e, wd(0, i, a), wd(e.content.size, i, a)) : F.create(e, wd(t, i, a), wd(t, i, a));
}
function Ed() {
	return ["Android"].includes(navigator.platform) || /android/i.test(navigator.userAgent);
}
function Dd() {
	return [
		"iPad Simulator",
		"iPhone Simulator",
		"iPod Simulator",
		"iPad",
		"iPhone",
		"iPod"
	].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function Od() {
	return typeof navigator < "u" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
function kd(e) {
	if (typeof window > "u") throw Error("[tiptap error]: there is no window object available, so this function cannot be used");
	let t = `<body>${e}</body>`, n = new window.DOMParser().parseFromString(t, "text/html").body;
	return Yp(n);
}
function Ad(e) {
	return typeof e?.nodesBetween == "function";
}
function jd(e, t, n) {
	if (Ad(e)) return e;
	let r = typeof e == "object" && !!e;
	n = {
		slice: !0,
		parseOptions: {},
		...n
	};
	let i = typeof e == "string";
	if (r) try {
		if (Array.isArray(e) && e.length > 0) return j.fromArray(e.map((e) => t.nodeFromJSON(e)));
		let r = t.nodeFromJSON(e);
		return n.errorOnInvalidContent && r.check(), r;
	} catch (r) {
		if (n.errorOnInvalidContent) throw Error("[tiptap error]: Invalid JSON content", { cause: r });
		return console.warn("[tiptap warn]: Invalid content.", "Passed value:", e, "Error:", r), jd("", t, n);
	}
	if (i) {
		if (n.errorOnInvalidContent) {
			let r = !1, i = "", a = new Rr({
				topNode: t.spec.topNode,
				marks: t.spec.marks,
				nodes: t.spec.nodes.append({ __tiptap__private__unknown__catch__all__node: {
					content: "inline*",
					group: "block",
					parseDOM: [{
						tag: "*",
						getAttrs: (e) => (r = !0, i = typeof e == "string" ? e : e.outerHTML, null)
					}]
				} })
			});
			if (n.slice ? zr.fromSchema(a).parseSlice(kd(e), n.parseOptions) : zr.fromSchema(a).parse(kd(e), n.parseOptions), n.errorOnInvalidContent && r) throw Error("[tiptap error]: Invalid HTML content", { cause: /* @__PURE__ */ Error(`Invalid element found: ${i}`) });
		}
		let r = zr.fromSchema(t);
		return n.slice ? r.parseSlice(kd(e), n.parseOptions).content : r.parse(kd(e), n.parseOptions);
	}
	return jd("", t, n);
}
function Md(e) {
	return !("type" in e);
}
function Nd(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof ra || i instanceof ia)) return;
	let a = e.mapping.maps[r], o = 0;
	a.forEach((e, t, n, r) => {
		o === 0 && (o = r);
	}), e.setSelection(P.near(e.doc.resolve(o), n));
}
function Pd(e) {
	for (let t = 0; t < e.edgeCount; t += 1) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
function Fd() {
	return typeof navigator < "u" && /Mac/.test(navigator.platform);
}
function Id(e) {
	let t = e.split(/-(?!$)/), n = t[t.length - 1];
	n === "Space" && (n = " ");
	let r, i, a, o;
	for (let e = 0; e < t.length - 1; e += 1) {
		let n = t[e];
		if (/^(cmd|meta|m)$/i.test(n)) o = !0;
		else if (/^a(lt)?$/i.test(n)) r = !0;
		else if (/^(c|ctrl|control)$/i.test(n)) i = !0;
		else if (/^s(hift)?$/i.test(n)) a = !0;
		else if (/^mod$/i.test(n)) Dd() || Fd() ? o = !0 : i = !0;
		else throw Error(`Unrecognized modifier name: ${n}`);
	}
	return r && (n = `Alt-${n}`), i && (n = `Ctrl-${n}`), o && (n = `Meta-${n}`), a && (n = `Shift-${n}`), n;
}
function Ld(e, t, n = {}) {
	let { from: r, to: i, empty: a } = e.selection, o = t ? U(t, e.schema) : null, s = [];
	e.doc.nodesBetween(r, i, (e, t) => {
		if (e.isText) return;
		let n = Math.max(r, t), a = Math.min(i, t + e.nodeSize);
		s.push({
			node: e,
			from: n,
			to: a
		});
	});
	let c = i - r, l = s.filter((e) => !o || o.name === e.node.type.name).filter((e) => vd(e.node.attrs, n, { strict: !1 }));
	return a ? !!l.length : l.reduce((e, t) => e + t.to - t.from, 0) >= c;
}
function Rd(e, t) {
	return t.nodes[e] ? "node" : t.marks[e] ? "mark" : null;
}
function zd(e, t) {
	let n = typeof t == "string" ? [t] : t;
	return Object.keys(e).reduce((t, r) => (n.includes(r) || (t[r] = e[r]), t), {});
}
function Bd(e, t, n = {}, r = {}) {
	return jd(e, t, {
		slice: !1,
		parseOptions: n,
		errorOnInvalidContent: r.errorOnInvalidContent
	});
}
function Vd(e, t) {
	let n = Sd(t, e.schema), { from: r, to: i, empty: a } = e.selection, o = [];
	a ? (e.storedMarks && o.push(...e.storedMarks), o.push(...e.selection.$head.marks())) : e.doc.nodesBetween(r, i, (e) => {
		o.push(...e.marks);
	});
	let s = o.find((e) => e.type.name === n.name);
	return s ? { ...s.attrs } : {};
}
function Hd(e, t) {
	let n = new la(e);
	return t.forEach((e) => {
		e.steps.forEach((e) => {
			n.step(e);
		});
	}), n;
}
function Ud(e, t, n) {
	let r = [];
	return e.nodesBetween(t.from, t.to, (e, t) => {
		n(e) && r.push({
			node: e,
			pos: t
		});
	}), r;
}
function Wd(e, t) {
	for (let n = e.depth; n > 0; --n) {
		let r = e.node(n);
		if (t(r)) return {
			pos: n > 0 ? e.before(n) : 0,
			start: e.start(n),
			depth: n,
			node: r
		};
	}
}
function Gd(e) {
	return (t) => Wd(t.$from, e);
}
function W(e, t, n) {
	return e.config[t] === void 0 && e.parent ? W(e.parent, t, n) : typeof e.config[t] == "function" ? e.config[t].bind({
		...n,
		parent: e.parent ? W(e.parent, t, n) : null
	}) : e.config[t];
}
function Kd(e) {
	return e.map((e) => {
		let t = W(e, "addExtensions", {
			name: e.name,
			options: e.options,
			storage: e.storage
		});
		return t ? [e, ...Kd(t())] : e;
	}).flat(10);
}
function qd(e, t) {
	let n = Jr.fromSchema(t).serializeFragment(e), r = document.implementation.createHTMLDocument().createElement("div");
	return r.appendChild(n), r.innerHTML;
}
function Jd(e) {
	return typeof e == "function";
}
function G(e, t = void 0, ...n) {
	return Jd(e) ? t ? e.bind(t)(...n) : e(...n) : e;
}
function Yd(e = {}) {
	return Object.keys(e).length === 0 && e.constructor === Object;
}
function Xd(e) {
	return {
		baseExtensions: e.filter((e) => e.type === "extension"),
		nodeExtensions: e.filter((e) => e.type === "node"),
		markExtensions: e.filter((e) => e.type === "mark")
	};
}
function Zd(e) {
	let t = [], { nodeExtensions: n, markExtensions: r } = Xd(e), i = [...n, ...r], a = {
		default: null,
		validate: void 0,
		rendered: !0,
		renderHTML: null,
		parseHTML: null,
		keepOnSplit: !0,
		isRequired: !1
	}, o = n.filter((e) => e.name !== "text").map((e) => e.name), s = r.map((e) => e.name), c = [...o, ...s];
	return e.forEach((e) => {
		let n = W(e, "addGlobalAttributes", {
			name: e.name,
			options: e.options,
			storage: e.storage,
			extensions: i
		});
		n && n().forEach((e) => {
			let n;
			n = Array.isArray(e.types) ? e.types : e.types === "*" ? c : e.types === "nodes" ? o : e.types === "marks" ? s : [], n.forEach((n) => {
				Object.entries(e.attributes).forEach(([e, r]) => {
					t.push({
						type: n,
						name: e,
						attribute: {
							...a,
							...r
						}
					});
				});
			});
		});
	}), i.forEach((e) => {
		let n = W(e, "addAttributes", {
			name: e.name,
			options: e.options,
			storage: e.storage
		});
		if (!n) return;
		let r = n();
		Object.entries(r).forEach(([n, r]) => {
			let i = {
				...a,
				...r
			};
			typeof i?.default == "function" && (i.default = i.default()), i?.isRequired && i?.default === void 0 && delete i.default, t.push({
				type: e.name,
				name: n,
				attribute: i
			});
		});
	}), t;
}
function Qd(e) {
	let t = [], n = "", r = !1, i = !1, a = 0, o = e.length;
	for (let s = 0; s < o; s += 1) {
		let o = e[s];
		if (o === "'" && !i) {
			r = !r, n += o;
			continue;
		}
		if (o === "\"" && !r) {
			i = !i, n += o;
			continue;
		}
		if (!r && !i) {
			if (o === "(") {
				a += 1, n += o;
				continue;
			}
			if (o === ")" && a > 0) {
				--a, n += o;
				continue;
			}
			if (o === ";" && a === 0) {
				t.push(n), n = "";
				continue;
			}
		}
		n += o;
	}
	return n && t.push(n), t;
}
function $d(e) {
	let t = [], n = Qd(e || ""), r = n.length;
	for (let e = 0; e < r; e += 1) {
		let r = n[e], i = r.indexOf(":");
		if (i === -1) continue;
		let a = r.slice(0, i).trim(), o = r.slice(i + 1).trim();
		a && o && t.push([a, o]);
	}
	return t;
}
function K(...e) {
	return e.filter((e) => !!e).reduce((e, t) => {
		let n = { ...e };
		return Object.entries(t).forEach(([e, t]) => {
			if (!n[e]) {
				n[e] = t;
				return;
			}
			if (e === "class") {
				let r = t ? String(t).split(" ") : [], i = n[e] ? n[e].split(" ") : [], a = r.filter((e) => !i.includes(e));
				n[e] = [...i, ...a].join(" ");
			} else if (e === "style") {
				let r = new Map([...$d(n[e]), ...$d(t)]);
				n[e] = Array.from(r.entries()).map(([e, t]) => `${e}: ${t}`).join("; ");
			} else n[e] = t;
		}), n;
	}, {});
}
function ef(e, t) {
	return t.filter((t) => t.type === e.type.name).filter((e) => e.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(e.attrs) || {} : { [t.name]: e.attrs[t.name] }).reduce((e, t) => K(e, t), {});
}
function tf(e) {
	return typeof e == "string" ? e.match(/^[+-]?(?:\d*\.)?\d+$/) ? Number(e) : e === "true" || e !== "false" && e : e;
}
function nf(e, t) {
	return "style" in e ? e : {
		...e,
		getAttrs: (n) => {
			let r = e.getAttrs ? e.getAttrs(n) : e.attrs;
			if (r === !1) return !1;
			let i = t.reduce((e, t) => {
				let r = t.attribute.parseHTML ? t.attribute.parseHTML(n) : tf(n.getAttribute(t.name));
				return r == null ? e : {
					...e,
					[t.name]: r
				};
			}, {});
			return {
				...r,
				...i
			};
		}
	};
}
function rf(e) {
	return Object.fromEntries(Object.entries(e).filter(([e, t]) => e === "attrs" && Yd(t) ? !1 : t != null));
}
function af(e) {
	let t = {};
	return !e?.attribute?.isRequired && "default" in (e?.attribute || {}) && (t.default = e.attribute.default), e?.attribute?.validate !== void 0 && (t.validate = e.attribute.validate), [e.name, t];
}
function of(e, t) {
	let n = Zd(e), { nodeExtensions: r, markExtensions: i } = Xd(e), a = r.find((e) => W(e, "topNode"))?.name, o = Object.fromEntries(r.map((r) => {
		let i = n.filter((e) => e.type === r.name), a = {
			name: r.name,
			options: r.options,
			storage: r.storage,
			editor: t
		}, o = rf({
			...e.reduce((e, t) => {
				let n = W(t, "extendNodeSchema", a);
				return {
					...e,
					...n ? n(r) : {}
				};
			}, {}),
			content: G(W(r, "content", a)),
			marks: G(W(r, "marks", a)),
			group: G(W(r, "group", a)),
			inline: G(W(r, "inline", a)),
			atom: G(W(r, "atom", a)),
			selectable: G(W(r, "selectable", a)),
			draggable: G(W(r, "draggable", a)),
			code: G(W(r, "code", a)),
			whitespace: G(W(r, "whitespace", a)),
			linebreakReplacement: G(W(r, "linebreakReplacement", a)),
			defining: G(W(r, "defining", a)),
			isolating: G(W(r, "isolating", a)),
			attrs: Object.fromEntries(i.map(af))
		}), s = G(W(r, "parseHTML", a));
		s && (o.parseDOM = s.map((e) => nf(e, i)));
		let c = W(r, "renderHTML", a);
		c && (o.toDOM = (e) => c({
			node: e,
			HTMLAttributes: ef(e, i)
		}));
		let l = W(r, "renderText", a);
		return l && (o.toText = l), [r.name, o];
	})), s = Object.fromEntries(i.map((r) => {
		let i = n.filter((e) => e.type === r.name), a = {
			name: r.name,
			options: r.options,
			storage: r.storage,
			editor: t
		}, o = rf({
			...e.reduce((e, t) => {
				let n = W(t, "extendMarkSchema", a);
				return {
					...e,
					...n ? n(r) : {}
				};
			}, {}),
			inclusive: G(W(r, "inclusive", a)),
			excludes: G(W(r, "excludes", a)),
			group: G(W(r, "group", a)),
			spanning: G(W(r, "spanning", a)),
			code: G(W(r, "code", a)),
			attrs: Object.fromEntries(i.map(af))
		}), s = G(W(r, "parseHTML", a));
		s && (o.parseDOM = s.map((e) => nf(e, i)));
		let c = W(r, "renderHTML", a);
		return c && (o.toDOM = (e) => c({
			mark: e,
			HTMLAttributes: ef(e, i)
		})), [r.name, o];
	}));
	return new Rr({
		topNode: a,
		nodes: o,
		marks: s
	});
}
function sf(e) {
	let t = e.filter((t, n) => e.indexOf(t) !== n);
	return Array.from(new Set(t));
}
function cf(e) {
	return e.sort((e, t) => {
		let n = W(e, "priority") || 100, r = W(t, "priority") || 100;
		return n > r ? -1 : +(n < r);
	});
}
function lf(e) {
	let t = cf(Kd(e)), n = sf(t.map((e) => e.name));
	return n.length && console.warn(`[tiptap warn]: Duplicate extension names found: [${n.map((e) => `'${e}'`).join(", ")}]. This can lead to issues.`), t;
}
function uf(e, t, n) {
	let { from: r, to: i } = t, { blockSeparator: a = "\n\n", textSerializers: o = {} } = n || {}, s = "";
	return e.nodesBetween(r, i, (e, n, c, l) => {
		e.isBlock && n > r && (s += a);
		let u = o?.[e.type.name];
		if (u) return c && (s += u({
			node: e,
			pos: n,
			parent: c,
			index: l,
			range: t
		})), !1;
		e.isText && (s += (e?.text)?.slice(Math.max(r, n) - n, i - n));
	}), s;
}
function df(e, t) {
	return uf(e, {
		from: 0,
		to: e.content.size
	}, t);
}
function ff(e) {
	return Object.fromEntries(Object.entries(e.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
function pf(e, t) {
	let n = U(t, e.schema), { from: r, to: i } = e.selection, a = [];
	e.doc.nodesBetween(r, i, (e) => {
		a.push(e);
	});
	let o = a.reverse().find((e) => e.type.name === n.name);
	return o ? { ...o.attrs } : {};
}
function mf(e, t) {
	let n = Rd(typeof t == "string" ? t : t.name, e.schema);
	return n === "node" ? pf(e, t) : n === "mark" ? Vd(e, t) : {};
}
function hf(e, t = JSON.stringify) {
	let n = {};
	return e.filter((e) => {
		let r = t(e);
		return Object.prototype.hasOwnProperty.call(n, r) ? !1 : n[r] = !0;
	});
}
function gf(e) {
	let t = hf(e);
	return t.length === 1 ? t : t.filter((e, n) => !t.filter((e, t) => t !== n).some((t) => e.oldRange.from >= t.oldRange.from && e.oldRange.to <= t.oldRange.to && e.newRange.from >= t.newRange.from && e.newRange.to <= t.newRange.to));
}
function _f(e) {
	let { mapping: t, steps: n } = e, r = [];
	return t.maps.forEach((e, i) => {
		let a = [];
		if (e.ranges.length) e.forEach((e, t) => {
			a.push({
				from: e,
				to: t
			});
		});
		else {
			let { from: e, to: t } = n[i];
			if (e === void 0 || t === void 0) return;
			a.push({
				from: e,
				to: t
			});
		}
		a.forEach(({ from: e, to: n }) => {
			let a = t.slice(i).map(e, -1), o = t.slice(i).map(n), s = t.invert().map(a, -1), c = t.invert().map(o);
			r.push({
				oldRange: {
					from: s,
					to: c
				},
				newRange: {
					from: a,
					to: o
				}
			});
		});
	}), gf(r);
}
function vf(e, t, n) {
	let r = [];
	return e === t ? n.resolve(e).marks().forEach((t) => {
		let i = xd(n.resolve(e), t.type);
		i && r.push({
			mark: t,
			...i
		});
	}) : n.nodesBetween(e, t, (e, t) => {
		!e || e?.nodeSize === void 0 || r.push(...e.marks.map((n) => ({
			from: t,
			to: t + e.nodeSize,
			mark: n
		})));
	}), r;
}
function yf(e, t) {
	return t.nodes[e] || t.marks[e] || null;
}
function bf(e, t, n) {
	return Object.fromEntries(Object.entries(n).filter(([n]) => {
		let r = e.find((e) => e.type === t && e.name === n);
		return r ? r.attribute.keepOnSplit : !1;
	}));
}
function xf(e, t, n = {}) {
	let { empty: r, ranges: i } = e.selection, a = t ? Sd(t, e.schema) : null;
	if (r) return !!(e.storedMarks || e.selection.$from.marks()).filter((e) => !a || a.name === e.type.name).find((e) => vd(e.attrs, n, { strict: !1 }));
	let o = 0, s = [];
	if (i.forEach(({ $from: t, $to: n }) => {
		let r = t.pos, i = n.pos;
		e.doc.nodesBetween(r, i, (e, t) => {
			if (a && e.inlineContent && !e.type.allowsMarkType(a)) return !1;
			if (!e.isText && !e.marks.length) return;
			let n = Math.max(r, t), c = Math.min(i, t + e.nodeSize), l = c - n;
			o += l, s.push(...e.marks.map((e) => ({
				mark: e,
				from: n,
				to: c
			})));
		});
	}), o === 0) return !1;
	let c = s.filter((e) => !a || a.name === e.mark.type.name).filter((e) => vd(e.mark.attrs, n, { strict: !1 })).reduce((e, t) => e + t.to - t.from, 0), l = s.filter((e) => !a || e.mark.type !== a && e.mark.type.excludes(a)).reduce((e, t) => e + t.to - t.from, 0);
	return (c > 0 ? c + l : c) >= o;
}
function Sf(e, t, n = {}) {
	if (!t) return Ld(e, null, n) || xf(e, null, n);
	let r = Rd(t, e.schema);
	return r === "node" ? Ld(e, t, n) : r === "mark" && xf(e, t, n);
}
function Cf(e, t) {
	return Array.isArray(t) ? t.some((t) => (typeof t == "string" ? t : t.name) === e.name) : t;
}
function wf(e, t) {
	let { nodeExtensions: n } = Xd(t), r = n.find((t) => t.name === e);
	if (!r) return !1;
	let i = G(W(r, "group", {
		name: r.name,
		options: r.options,
		storage: r.storage
	}));
	return typeof i == "string" && i.split(" ").includes("list");
}
function Tf(e, { checkChildren: t = !0, ignoreWhitespace: n = !1 } = {}) {
	if (n) {
		if (e.type.name === "hardBreak") return !0;
		if (e.isText) return !/\S/.test(e.text ?? "");
	}
	if (e.isText) return !e.text;
	if (e.isAtom || e.isLeaf) return !1;
	if (e.content.childCount === 0) return !0;
	if (t) {
		let r = !0;
		return e.content.forEach((e) => {
			r !== !1 && (Tf(e, {
				ignoreWhitespace: n,
				checkChildren: t
			}) || (r = !1));
		}), r;
	}
	return !1;
}
function Ef(e) {
	return e instanceof I;
}
function Df(e, t) {
	let n = t.mapping.mapResult(e.position);
	return {
		position: new Tm(n.pos),
		mapResult: n
	};
}
function Of(e) {
	return new Tm(e);
}
function kf(e, t, n) {
	let { selection: r } = t, i = null;
	if (Cd(r) && (i = r.$cursor), i) {
		let t = e.storedMarks ?? i.marks();
		return i.parent.type.allowsMarkType(n) && (!!n.isInSet(t) || !t.some((e) => e.type.excludes(n)));
	}
	let { ranges: a } = r;
	return a.some(({ $from: t, $to: r }) => {
		let i = t.depth === 0 && e.doc.inlineContent && e.doc.type.allowsMarkType(n);
		return e.doc.nodesBetween(t.pos, r.pos, (e, t, r) => {
			if (i) return !1;
			if (e.isInline) {
				let t = !r || r.type.allowsMarkType(n), a = !!n.isInSet(e.marks) || !e.marks.some((e) => e.type.excludes(n));
				i = t && a;
			}
			return !i;
		}), i;
	});
}
function Af(e, t) {
	let n = e.storedMarks || e.selection.$to.parentOffset && e.selection.$from.marks();
	if (n) {
		let r = n.filter((e) => t?.includes(e.type.name));
		e.tr.ensureMarks(r);
	}
}
function jf(e) {
	return !e || e === "1" ? null : e;
}
function Mf(e, t) {
	return jf(e) === jf(t);
}
function Nf(e) {
	let t = e.doc, n = t.firstChild;
	if (!n) return null;
	let r = t.resolve(1), i = t.resolve(n.nodeSize - 1);
	return F.between(r, i);
}
function Pf(e, t) {
	Xm.set(e, (Xm.get(e) ?? 0) + 1);
	try {
		return t();
	} finally {
		let t = (Xm.get(e) ?? 1) - 1;
		t > 0 ? Xm.set(e, t) : Xm.delete(e);
	}
}
function Ff(e) {
	return Xm.has(e);
}
function If(e) {
	return e.kind === "widget";
}
function Lf(e, t) {
	let n = [], r = /* @__PURE__ */ new Set();
	for (let i of e) i.kind === "widget" && If(i) && r.add(i.key), n.push(i.toPMDecoration(t));
	return {
		decorations: n,
		widgetKeys: r
	};
}
function Rf(e, t, n) {
	let { decorations: r, widgetKeys: i } = Lf(t, n);
	return {
		set: V.create(e, r),
		widgetKeys: i
	};
}
function zf({ position: e, from: t, to: n, docSize: r }) {
	return e < t ? !1 : e < n || e === n && n === r;
}
function Bf({ decorations: e, from: t, to: n, docSize: r, extensionName: i, warnedExtensions: a }) {
	return e.filter((e) => zf({
		position: e.anchor,
		from: t,
		to: n,
		docSize: r
	}) ? !0 : (e.anchor === n || a.has(i) || (a.add(i), console.warn(`[tiptap warn]: Extension "${i}" returned a decoration outside the requested range [${t}, ${n}). It was ignored.`)), !1));
}
function Vf(e) {
	let t = e.spec?.key;
	return typeof t == "string" ? t : void 0;
}
function Hf(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let r of e.find()) {
		let e = Vf(r);
		if (!e) continue;
		let i = r.spec.extensionName ?? "unknown", a = t.get(e) ?? /* @__PURE__ */ new Set();
		a.add(i), t.set(e, a), n.set(e, (n.get(e) ?? 0) + 1);
	}
	return Array.from(t, ([e, t]) => ({
		key: e,
		extensions: t
	})).filter(({ key: e }) => (n.get(e) ?? 0) > 1);
}
function Uf(e) {
	return e.jsonID === "attr";
}
function Wf(e) {
	let t = !1;
	if (e.getMap().forEach(() => {
		t = !0;
	}), t || Uf(e)) return !0;
	let n = e;
	return typeof n.from == "number" && typeof n.to == "number";
}
function Gf(e, t) {
	let n = null, r = 0, i = 0;
	for (let a = 0; a < e.childCount && !(i > t.to); a += 1) {
		let o = i + e.child(a).nodeSize;
		o >= t.from && (n === null && (n = i), r = o), i = o;
	}
	return n === null ? null : {
		from: n,
		to: r
	};
}
function Kf(e, t) {
	if (e.steps.some((e) => !Wf(e))) return { type: "full" };
	let n = _f(e).map(({ newRange: e }) => e);
	e.steps.forEach((t, r) => {
		if (!Uf(t)) return;
		let i = e.mapping.slice(r);
		n.push({
			from: i.map(t.pos, -1),
			to: i.map(t.pos + 1)
		});
	});
	let r = [];
	for (let e of n) {
		let n = Gf(t, e);
		n && r.push(n);
	}
	r.sort((e, t) => e.from - t.from);
	let i = [];
	for (let e of r) {
		let t = i[i.length - 1];
		t && e.from <= t.to ? t.to = Math.max(t.to, e.to) : i.push({ ...e });
	}
	return {
		type: "ranges",
		ranges: i
	};
}
function qf(e, t, n, r) {
	return e.map(t, n, { onRemove: (e) => {
		let t = e?.key;
		typeof t == "string" && r.delete(t);
	} });
}
function Jf(e, t, n) {
	let r = t.decorationSetsByExtension[e] ?? V.empty, i = new Set(t.widgetKeysByExtension[e] ?? []);
	return {
		set: qf(r, n.mapping, n.doc, i),
		widgetKeys: i
	};
}
function Yf(e, t) {
	let n = Object.values(t).flatMap((e) => e.find());
	return V.create(e, n);
}
function Xf(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Object.values(e)) for (let e of n) t.add(e);
	return t;
}
function Zf(e, t) {
	switch (t.update ?? "document") {
		case "document":
			if (t.createInRange) throw Error(`[tiptap error]: Extension "${e}" provides createInRange() but does not use the "changedRanges" decoration update strategy.`);
			return;
		case "changedRanges":
			if (!t.createInRange) throw Error(`[tiptap error]: Extension "${e}" uses the "changedRanges" decoration update strategy but does not provide createInRange().`);
			return;
		case "manual":
			if (t.createInRange) throw Error(`[tiptap error]: Extension "${e}" uses the "manual" decoration update strategy, which is not compatible with createInRange(). createInRange() requires the "changedRanges" strategy.`);
			if (t.shouldUpdate) throw Error(`[tiptap error]: Extension "${e}" cannot combine the "manual" decoration update strategy with shouldUpdate().`);
			return;
		default: throw Error(`[tiptap error]: Extension "${e}" uses an unknown decoration update strategy. Expected "document", "changedRanges", or "manual".`);
	}
}
function Qf(e, t, n) {
	return n ? !0 : e.update === "manual" ? !1 : e.shouldUpdate ? e.shouldUpdate(t) : t.tr.docChanged;
}
function $f(e, t) {
	let { selection: n } = e, { $from: r } = n;
	if (n instanceof I) {
		let e = r.index();
		return r.parent.canReplaceWith(e, e + 1, t);
	}
	let i = r.depth;
	for (; i >= 0;) {
		let e = r.index(i);
		if (r.node(i).contentMatchAt(e).matchType(t)) return !0;
		--i;
	}
	return !1;
}
function ep(e, t, n) {
	let r = document.querySelector(`style[data-tiptap-style${n ? `-${n}` : ""}]`);
	if (r !== null) return r;
	let i = document.createElement("style");
	return t && i.setAttribute("nonce", t), i.setAttribute(`data-tiptap-style${n ? `-${n}` : ""}`, ""), i.innerHTML = e, document.getElementsByTagName("head")[0].appendChild(i), i;
}
function tp(e) {
	return typeof e == "number";
}
function np(e) {
	return Object.prototype.toString.call(e).slice(8, -1);
}
function rp(e) {
	return np(e) === "Object" && e.constructor === Object && Object.getPrototypeOf(e) === Object.prototype;
}
function ip(e) {
	if (!e?.trim()) return {};
	let t = {}, n = [], r = e.replace(/["']([^"']*)["']/g, (e) => (n.push(e), `__QUOTED_${n.length - 1}__`)), i = r.match(/(?:^|\s)\.([\w-]+)/g);
	i && (t.class = i.map((e) => e.trim().slice(1)).join(" "));
	let a = r.match(/(?:^|\s)#([\w-]+)/);
	a && (t.id = a[1]), Array.from(r.matchAll(/([a-zA-Z][\w-]*)\s*=\s*(__QUOTED_\d+__)/g)).forEach(([, e, r]) => {
		let i = parseInt(r.match(/__QUOTED_(\d+)__/)?.[1] || "0", 10), a = n[i];
		a && (t[e] = a.slice(1, -1));
	});
	let o = r.replace(/(?:^|\s)\.([\w-]+)/g, "").replace(/(?:^|\s)#([\w-]+)/g, "").replace(/([a-zA-Z][\w-]*)\s*=\s*__QUOTED_\d+__/g, "").trim();
	return o && o.split(/\s+/).filter(Boolean).forEach((e) => {
		e.match(/^[a-zA-Z][\w-]*$/) && (t[e] = !0);
	}), t;
}
function ap(e) {
	if (!e || Object.keys(e).length === 0) return "";
	let t = [];
	return e.class && String(e.class).split(/\s+/).filter(Boolean).forEach((e) => t.push(`.${e}`)), e.id && t.push(`#${e.id}`), Object.entries(e).forEach(([e, n]) => {
		e !== "class" && e !== "id" && (n === !0 ? t.push(e) : n !== !1 && n != null && t.push(`${e}="${String(n)}"`));
	}), t.join(" ");
}
function op(e) {
	let { nodeName: t, name: n, parseAttributes: r = ip, serializeAttributes: i = ap, defaultAttributes: a = {}, requiredAttributes: o = [], allowedAttributes: s } = e, c = n || t, l = (e) => {
		if (!s) return e;
		let t = {};
		return s.forEach((n) => {
			n in e && (t[n] = e[n]);
		}), t;
	};
	return {
		parseMarkdown: (e, n) => {
			let r = {
				...a,
				...e.attributes
			};
			return n.createNode(t, r, []);
		},
		markdownTokenizer: {
			name: t,
			level: "block",
			start(e) {
				let t = RegExp(`^:::${c}(?:\\s|$)`, "m"), n = e.match(t)?.index;
				return n === void 0 ? -1 : n;
			},
			tokenize(e, n, i) {
				let a = RegExp(`^:::${c}(?:\\s+\\{([^}]*)\\})?\\s*:::(?:\\n|$)`), s = e.match(a);
				if (!s) return;
				let l = s[1] || "", u = r(l);
				if (!o.find((e) => !(e in u))) return {
					type: t,
					raw: s[0],
					attributes: u
				};
			}
		},
		renderMarkdown: (e) => {
			let t = l(e.attrs || {}), n = i(t), r = n ? ` {${n}}` : "";
			return `:::${c}${r} :::`;
		}
	};
}
function sp(e) {
	let { nodeName: t, name: n, getContent: r, parseAttributes: i = ip, serializeAttributes: a = ap, defaultAttributes: o = {}, content: s = "block", allowedAttributes: c } = e, l = n || t, u = (e) => {
		if (!c) return e;
		let t = {};
		return c.forEach((n) => {
			n in e && (t[n] = e[n]);
		}), t;
	};
	return {
		parseMarkdown: (e, n) => {
			let i;
			if (r) {
				let t = r(e);
				i = typeof t == "string" ? [{
					type: "text",
					text: t
				}] : t;
			} else i = s === "block" ? n.parseChildren(e.tokens || []) : n.parseInline(e.tokens || []);
			let a = {
				...o,
				...e.attributes
			};
			return n.createNode(t, a, i);
		},
		markdownTokenizer: {
			name: t,
			level: "block",
			start(e) {
				let t = RegExp(`^:::${l}`, "m"), n = e.match(t)?.index;
				return n === void 0 ? -1 : n;
			},
			tokenize(e, n, r) {
				let a = RegExp(`^:::${l}(?:\\s+\\{([^}]*)\\})?\\s*\\n`), o = e.match(a);
				if (!o) return;
				let [c, u = ""] = o, d = i(u), f = 1, p = c.length, m = "", h = /^:::([\w-]*)(\s.*)?/gm, g = e.slice(p);
				for (h.lastIndex = 0;;) {
					let n = h.exec(g);
					if (n === null) break;
					let i = n.index, a = n[1];
					if (!n[2]?.endsWith(":::")) {
						if (a) f += 1;
						else if (--f, f === 0) {
							let a = g.slice(0, i);
							m = a.trim();
							let o = e.slice(0, p + i + n[0].length), c = [];
							if (m) if (s === "block") for (c = r.blockTokens(a), c.forEach((e) => {
								e.text && (!e.tokens || e.tokens.length === 0) && (e.tokens = r.inlineTokens(e.text));
							}); c.length > 0;) {
								let e = c[c.length - 1];
								if (e.type === "paragraph" && (!e.text || e.text.trim() === "")) c.pop();
								else break;
							}
							else c = r.inlineTokens(m);
							return {
								type: t,
								raw: o,
								attributes: d,
								content: m,
								tokens: c
							};
						}
					}
				}
			}
		},
		renderMarkdown: (e, t) => {
			let n = u(e.attrs || {}), r = a(n), i = r ? ` {${r}}` : "", o = t.renderChildren(e.content || [], "\n\n");
			return `:::${l}${i}

${o}

:::`;
		}
	};
}
function cp(e) {
	if (!e.trim()) return {};
	let t = {}, n = /(\w+)=(?:"([^"]*)"|'([^']*)')/g, r = n.exec(e);
	for (; r !== null;) {
		let [, i, a, o] = r;
		t[i] = a || o, r = n.exec(e);
	}
	return t;
}
function lp(e) {
	return Object.entries(e).filter(([, e]) => e != null).map(([e, t]) => `${e}="${t}"`).join(" ");
}
function up(e) {
	let { nodeName: t, name: n, getContent: r, parseAttributes: i = cp, serializeAttributes: a = lp, defaultAttributes: o = {}, selfClosing: s = !1, allowedAttributes: c } = e, l = n || t, u = (e) => {
		if (!c) return e;
		let t = {};
		return c.forEach((n) => {
			let r = typeof n == "string" ? n : n.name, i = typeof n == "string" ? void 0 : n.skipIfDefault;
			if (r in e) {
				let n = e[r];
				if (i !== void 0 && n === i) return;
				t[r] = n;
			}
		}), t;
	}, d = l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return {
		parseMarkdown: (e, n) => {
			let i = {
				...o,
				...e.attributes
			};
			if (s) return n.createNode(t, i);
			let a = r ? r(e) : e.content || "";
			return a ? n.createNode(t, i, [n.createTextNode(a)]) : n.createNode(t, i, []);
		},
		markdownTokenizer: {
			name: t,
			level: "inline",
			start(e) {
				let t = RegExp(s ? `\\[${d}\\s*[^\\]]*\\]` : `\\[${d}\\s*[^\\]]*\\][\\s\\S]*?\\[\\/${d}\\]`), n = e.match(t)?.index;
				return n === void 0 ? -1 : n;
			},
			tokenize(e, n, r) {
				let a = RegExp(s ? `^\\[${d}\\s*([^\\]]*)\\]` : `^\\[${d}\\s*([^\\]]*)\\]([\\s\\S]*?)\\[\\/${d}\\]`), o = e.match(a);
				if (!o) return;
				let c = "", l = "";
				if (s) {
					let [, e] = o;
					l = e;
				} else {
					let [, e, t] = o;
					l = e, c = t || "";
				}
				let u = i(l.trim());
				return {
					type: t,
					raw: o[0],
					content: c.trim(),
					attributes: u
				};
			}
		},
		renderMarkdown: (e) => {
			let t = "";
			r ? t = r(e) : e.content && e.content.length > 0 && (t = e.content.filter((e) => e.type === "text").map((e) => e.text).join(""));
			let n = u(e.attrs || {}), i = a(n), o = i ? ` ${i}` : "";
			return s ? `[${l}${o}]` : `[${l}${o}]${t}[/${l}]`;
		}
	};
}
function dp(e, t, n) {
	let r = e.split("\n"), i = [], a = "", o = 0, s = t.baseIndentSize || 2;
	for (; o < r.length;) {
		let e = r[o], c = e.match(t.itemPattern);
		if (!c) {
			if (i.length > 0) break;
			if (e.trim() === "") {
				o += 1, a = `${a}${e}
`;
				continue;
			}
			return;
		}
		let l = t.extractItemData(c), { indentLevel: u, mainContent: d } = l;
		a = `${a}${e}
`;
		let f = [d];
		for (o += 1; o < r.length;) {
			let e = r[o];
			if (e.trim() === "") {
				let t = r.slice(o + 1).findIndex((e) => e.trim() !== "");
				if (t === -1) break;
				if ((r[o + 1 + t].match(/^(\s*)/)?.[1]?.length || 0) > u) {
					f.push(e), a = `${a}${e}
`, o += 1;
					continue;
				}
				break;
			}
			if ((e.match(/^(\s*)/)?.[1]?.length || 0) > u) f.push(e), a = `${a}${e}
`, o += 1;
			else break;
		}
		let p, m = f.slice(1);
		if (m.length > 0) {
			let e = m.map((e) => e.slice(u + s)).join("\n");
			e.trim() && (p = t.customNestedParser ? t.customNestedParser(e) : n.blockTokens(e));
		}
		let h = t.createToken(l, p);
		i.push(h);
	}
	if (i.length !== 0) return {
		items: i,
		raw: a
	};
}
function fp(e, t, n, r) {
	if (!e || !Array.isArray(e.content)) return "";
	let i = typeof n == "function" ? n(r) : n, [a, ...o] = e.content, s = `${i}${t.renderChildren([a])}`;
	return o && o.length > 0 && o.forEach((e, n) => {
		let r = t.renderChild?.call(t, e, n + 1) ?? t.renderChildren([e]);
		if (r != null) {
			let n = r.split("\n").map((e) => e ? t.indent(e) : t.indent("")).join("\n");
			s += e.type === "paragraph" ? `

${n}` : `
${n}`;
		}
	}), s;
}
function pp(e, t) {
	let n = { ...e };
	return rp(e) && rp(t) && Object.keys(t).forEach((r) => {
		rp(t[r]) && rp(e[r]) ? n[r] = pp(e[r], t[r]) : n[r] = t[r];
	}), n;
}
function mp(e, t, n = {}) {
	let { state: r } = t, { doc: i, tr: a } = r, o = e;
	i.descendants((t, r) => {
		let i = a.mapping.map(r), s = a.mapping.map(r) + t.nodeSize, c = null;
		if (t.marks.forEach((e) => {
			if (e !== o) return !1;
			c = e;
		}), !c) return;
		let l = !1;
		if (Object.keys(n).forEach((e) => {
			n[e] !== c.attrs[e] && (l = !0);
		}), l) {
			let t = e.type.create({
				...e.attrs,
				...n
			});
			a.removeMark(i, s, e.type), a.addMark(i, s, t);
		}
	}), a.docChanged && t.view.dispatch(a);
}
function hp(e) {
	let { editor: t, from: n, to: r, text: i, rules: a, plugin: o } = e, { view: s } = t;
	if (s.composing) return !1;
	let c = s.state.doc.resolve(n);
	if (c.parent.type.spec.code || (c.nodeBefore || c.nodeAfter)?.marks.find((e) => e.type.spec.code)) return !1;
	let l = !1, u = Sm(c) + i;
	return a.forEach((e) => {
		if (l) return;
		let a = rh(u, e.find);
		if (!a) return;
		let d = a[0].length - i.length;
		if (d > 0) {
			let e = c.parentOffset - d;
			if (e < 0 || c.parent.textBetween(e, c.parentOffset) !== a[0].slice(0, d)) return;
		}
		let f = s.state.tr, p = gd({
			state: s.state,
			transaction: f
		}), m = {
			from: n - (a[0].length - i.length),
			to: r
		}, { commands: h, chain: g, can: _ } = new Dp({
			editor: t,
			state: p
		});
		e.handler({
			state: p,
			range: m,
			match: a,
			commands: h,
			chain: g,
			can: _
		}) === null || !f.steps.length || (e.undoable && f.setMeta(o, {
			transform: f,
			from: n,
			to: r,
			text: i
		}), s.dispatch(f), l = !0);
	}), l;
}
function gp(e) {
	let { editor: t, rules: n } = e, r = new L({
		state: {
			init() {
				return null;
			},
			apply(e, i, a) {
				let o = e.getMeta(r);
				if (o) return o;
				let s = e.getMeta("applyInputRules");
				return s && setTimeout(() => {
					let { text: e } = s;
					e = typeof e == "string" ? e : qd(j.from(e), a.schema);
					let { from: i } = s, o = i + e.length;
					hp({
						editor: t,
						from: i,
						to: o,
						text: e,
						rules: n,
						plugin: r
					});
				}), e.selectionSet || e.docChanged ? null : i;
			}
		},
		props: {
			handleTextInput(e, i, a, o) {
				return hp({
					editor: t,
					from: i,
					to: a,
					text: o,
					rules: n,
					plugin: r
				});
			},
			handleDOMEvents: { compositionend: (e) => (setTimeout(() => {
				let { $cursor: i } = e.state.selection;
				i && hp({
					editor: t,
					from: i.pos,
					to: i.pos,
					text: "",
					rules: n,
					plugin: r
				});
			}), !1) },
			handleKeyDown(e, i) {
				if (i.key !== "Enter") return !1;
				let { $cursor: a } = e.state.selection;
				return a ? hp({
					editor: t,
					from: a.pos,
					to: a.pos,
					text: "\n",
					rules: n,
					plugin: r
				}) : !1;
			}
		},
		isInputRules: !0
	});
	return r;
}
function _p(e) {
	let { editor: t, state: n, from: r, to: i, rule: a, pasteEvent: o, dropEvent: s } = e, { commands: c, chain: l, can: u } = new Dp({
		editor: t,
		state: n
	}), d = [];
	return n.doc.nodesBetween(r, i, (e, t) => {
		if (e.type?.spec?.code || !(e.isText || e.isTextblock || e.isInline)) return;
		let f = e.content?.size ?? e.nodeSize ?? 0, p = Math.max(r, t), m = Math.min(i, t + f);
		p >= m || sh(e.isText ? e.text || "" : e.textBetween(p - t, m - t, void 0, "￼"), a.find, o).forEach((e) => {
			if (e.index === void 0) return;
			let t = p + e.index + 1, r = t + e[0].length, i = {
				from: n.tr.mapping.map(t),
				to: n.tr.mapping.map(r)
			}, f = a.handler({
				state: n,
				range: i,
				match: e,
				commands: c,
				chain: l,
				can: u,
				pasteEvent: o,
				dropEvent: s
			});
			d.push(f);
		});
	}), d.every((e) => e !== null);
}
function vp(e) {
	let { editor: t, rules: n } = e, r = null, i = !1, a = !1, o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, s;
	try {
		s = typeof DragEvent < "u" ? new DragEvent("drop") : null;
	} catch {
		s = null;
	}
	let c = ({ state: e, from: n, to: r, rule: i, pasteEvt: a }) => {
		let c = e.tr, l = gd({
			state: e,
			transaction: c
		});
		if (!(!_p({
			editor: t,
			state: l,
			from: Math.max(n - 1, 0),
			to: r.b - 1,
			rule: i,
			pasteEvent: a,
			dropEvent: s
		}) || !c.steps.length)) {
			try {
				s = typeof DragEvent < "u" ? new DragEvent("drop") : null;
			} catch {
				s = null;
			}
			return o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, c;
		}
	};
	return n.map((e) => new L({
		view(e) {
			let n = (n) => {
				r = e.dom.parentElement?.contains(n.target) ? e.dom.parentElement : null, r && (ch = t);
			}, i = () => {
				ch &&= null;
			};
			return window.addEventListener("dragstart", n), window.addEventListener("dragend", i), { destroy() {
				window.removeEventListener("dragstart", n), window.removeEventListener("dragend", i);
			} };
		},
		props: { handleDOMEvents: {
			drop: (e, t) => {
				if (a = r === e.dom.parentElement, s = t, !a) {
					let e = ch;
					e?.isEditable && setTimeout(() => {
						let t = e.state.selection;
						t && e.commands.deleteRange({
							from: t.from,
							to: t.to
						});
					}, 10);
				}
				return !1;
			},
			paste: (e, t) => {
				let n = t.clipboardData?.getData("text/html");
				return o = t, i = !!n?.includes("data-pm-slice"), !1;
			}
		} },
		appendTransaction: (t, n, r) => {
			let s = t[0], l = s.getMeta("uiEvent") === "paste" && !i, u = s.getMeta("uiEvent") === "drop" && !a, d = s.getMeta("applyPasteRules"), f = !!d;
			if (!l && !u && !f) return;
			if (f) {
				let { text: t } = d;
				t = typeof t == "string" ? t : qd(j.from(t), r.schema);
				let { from: n } = d, i = n + t.length, a = lh(t);
				return c({
					rule: e,
					state: r,
					from: n,
					to: { b: i },
					pasteEvt: a
				});
			}
			let p = n.doc.content.findDiffStart(r.doc.content), m = n.doc.content.findDiffEnd(r.doc.content);
			if (!(!tp(p) || !m || p === m.b)) return c({
				rule: e,
				state: r,
				from: p,
				to: m,
				pasteEvt: o
			});
		}
	}));
}
function yp(e) {
	if (Ch) return;
	Ch = !0;
	let t;
	try {
		t = ra.fromJSON(e, {
			from: 0,
			to: 0
		}).slice.content;
	} catch {
		return;
	}
	t instanceof j || console.warn("[tiptap warn]: prosemirror-model is loaded more than once. Wrapping and splitting nodes will fail. Deduplicate it in your lock file, or alias it to a single copy in your bundler.");
}
function bp(e) {
	return new nh({
		find: e.find,
		handler: ({ state: t, range: n, match: r }) => {
			let i = G(e.getAttributes, void 0, r);
			if (i === !1 || i === null) return null;
			let { tr: a } = t, o = r[r.length - 1], s = r[0];
			if (o) {
				let r = s.search(/\S/), c = n.from + s.indexOf(o), l = c + o.length;
				if (vf(n.from, n.to, t.doc).filter((t) => t.mark.type.excluded.find((n) => n === e.type && n !== t.mark.type)).filter((e) => e.to > c).length) return null;
				l < n.to && a.delete(l, n.to), c > n.from && a.delete(n.from + r, c);
				let u = n.from + r + o.length;
				a.addMark(n.from + r, u, e.type.create(i || {})), a.removeStoredMark(e.type);
			}
		},
		undoable: e.undoable
	});
}
function xp(e) {
	return new nh({
		find: e.find,
		handler: ({ state: t, range: n, match: r }) => {
			let i = G(e.getAttributes, void 0, r) || {}, { tr: a } = t, o = n.from, s = n.to, c = e.type.create(i);
			if (r[1]) {
				let e = o + r[0].lastIndexOf(r[1]);
				e > s ? e = s : s = e + r[1].length;
				let t = r[0][r[0].length - 1];
				a.insertText(t, o + r[0].length - 1), a.replaceWith(e, s, c);
			} else if (r[0]) {
				let t = e.type.isInline ? o : o - 1;
				a.insert(t, e.type.create(i)).delete(a.mapping.map(o), a.mapping.map(s));
			}
			a.scrollIntoView();
		},
		undoable: e.undoable
	});
}
function Sp(e) {
	return new nh({
		find: e.find,
		handler: ({ state: t, range: n, match: r }) => {
			let i = t.doc.resolve(n.from), a = G(e.getAttributes, void 0, r) || {};
			if (!i.node(-1).canReplaceWith(i.index(-1), i.indexAfter(-1), e.type)) return null;
			t.tr.delete(n.from, n.to).setBlockType(n.from, n.from, e.type, a);
		},
		undoable: e.undoable
	});
}
function Cp(e) {
	return new nh({
		find: e.find,
		handler: ({ state: t, range: n, match: r, chain: i }) => {
			let a = G(e.getAttributes, void 0, r) || {}, o = t.tr.delete(n.from, n.to), s = o.doc.resolve(n.from).blockRange(), c = s && ci(s, e.type, a);
			if (!c) return null;
			if (o.wrap(s, c), e.keepMarks && e.editor) {
				let { selection: n, storedMarks: r } = t, { splittableMarks: i } = e.editor.extensionManager, a = r || n.$to.parentOffset && n.$from.marks();
				if (a) {
					let e = a.filter((e) => i.includes(e.type.name));
					o.ensureMarks(e);
				}
			}
			if (e.keepAttributes) {
				let t = e.type.name === "bulletList" || e.type.name === "orderedList" ? "listItem" : "taskList";
				i().updateAttributes(t, a).run();
			}
			let l = o.doc.resolve(n.from - 1).nodeBefore;
			l && l.type === e.type && bi(o.doc, n.from - 1) && (!e.joinPredicate || e.joinPredicate(r, l)) && o.join(n.from - 1);
		},
		undoable: e.undoable
	});
}
function wp(e) {
	return new oh({
		find: e.find,
		handler: ({ state: t, range: n, match: r, pasteEvent: i }) => {
			let a = G(e.getAttributes, void 0, r, i);
			if (a === !1 || a === null) return null;
			let { tr: o } = t, s = r[r.length - 1], c = r[0], l = n.to;
			if (s) {
				let i = c.search(/\S/), u = n.from + c.indexOf(s), d = u + s.length;
				if (vf(n.from, n.to, t.doc).filter((t) => t.mark.type.excluded.find((n) => n === e.type && n !== t.mark.type)).filter((e) => e.to > u).length) return null;
				d < n.to && o.delete(d, n.to), u > n.from && o.delete(n.from + i, u), l = n.from + i + s.length, o.addMark(n.from + i, l, e.type.create(a || {})), r.index !== void 0 && r.input !== void 0 && r.index + r[0].length >= r.input.length || o.removeStoredMark(e.type);
			}
		}
	});
}
var Tp, Ep, Dp, Op, kp, Ap, jp, Mp, Np, Pp, Fp, Ip, Lp, Rp, zp, Bp, Vp, Hp, Up, Wp, Gp, Kp, qp, Jp, Yp, Xp, Zp, Qp, $p, em, tm, nm, rm, im, am, om, sm, cm, lm, um, dm, fm, pm, mm, hm, gm, _m, vm, ym, bm, xm, Sm, Cm, wm, Tm, Em, Dm, Om, km, Am, jm, Mm, Nm, Pm, Fm, Im, Lm, Rm, zm, Bm, Vm, Hm, Um, Wm, Gm, Km, qm, Jm, Ym, Xm, Zm, Qm, $m, eh, th, nh, rh, ih, ah, oh, sh, ch, lh, uh, dh, q, fh, ph, mh, hh, gh, _h, vh, yh, bh, xh, Sh, Ch, wh, Th, Eh, Dh, J = S((() => {
	da(), bo(), xo(), So(), jo(), ed(), hd(), Tp = Object.defineProperty, Ep = (e, t) => {
		for (var n in t) Tp(e, n, {
			get: t[n],
			enumerable: !0
		});
	}, Dp = class {
		constructor(e) {
			this.editor = e.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = e.state;
		}
		get hasCustomState() {
			return !!this.customState;
		}
		get state() {
			return this.customState || this.editor.state;
		}
		get commands() {
			let { rawCommands: e, editor: t, state: n } = this, { view: r } = t, { tr: i } = n, a = this.buildProps(i);
			return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, (...e) => {
				let n = t(...e)(a);
				return !i.getMeta("preventDispatch") && !this.hasCustomState && r.dispatch(i), n;
			}]));
		}
		get chain() {
			return () => this.createChain();
		}
		get can() {
			return () => this.createCan();
		}
		createChain(e, t = !0) {
			let { rawCommands: n, editor: r, state: i } = this, { view: a } = r, o = [], s = !!e, c = e || i.tr, l = () => (!s && t && !c.getMeta("preventDispatch") && !this.hasCustomState && a.dispatch(c), o.every((e) => e === !0)), u = {
				...Object.fromEntries(Object.entries(n).map(([e, n]) => [e, (...e) => {
					let r = this.buildProps(c, t), i = n(...e)(r);
					return o.push(i), u;
				}])),
				run: l
			};
			return u;
		}
		createCan(e) {
			let { rawCommands: t, state: n } = this, r = e || n.tr, i = this.buildProps(r, !1);
			return {
				...Object.fromEntries(Object.entries(t).map(([e, t]) => [e, (...e) => t(...e)({
					...i,
					dispatch: void 0
				})])),
				chain: () => this.createChain(r, !1)
			};
		}
		buildProps(e, t = !0) {
			let { rawCommands: n, editor: r, state: i } = this, { view: a } = r, o = {
				tr: e,
				editor: r,
				view: a,
				state: gd({
					state: i,
					transaction: e
				}),
				dispatch: t ? () => void 0 : void 0,
				chain: () => this.createChain(e, t),
				can: () => this.createCan(e),
				get commands() {
					return Object.fromEntries(Object.entries(n).map(([e, t]) => [e, (...e) => t(...e)(o)]));
				}
			};
			return o;
		}
	}, Op = {}, Ep(Op, {
		blur: () => kp,
		clearContent: () => Ap,
		clearNodes: () => jp,
		command: () => Mp,
		createParagraphNear: () => Np,
		cut: () => Pp,
		deleteCurrentNode: () => Fp,
		deleteNode: () => Ip,
		deleteRange: () => Lp,
		deleteSelection: () => Vp,
		enter: () => Hp,
		exitCode: () => Up,
		extendMarkRange: () => Wp,
		first: () => Gp,
		focus: () => Kp,
		forEach: () => qp,
		insertContent: () => Jp,
		insertContentAt: () => Xp,
		insertDefaultBlock: () => Zp,
		joinBackward: () => em,
		joinDown: () => $p,
		joinForward: () => tm,
		joinItemBackward: () => nm,
		joinItemForward: () => rm,
		joinTextblockBackward: () => im,
		joinTextblockForward: () => am,
		joinUp: () => Qp,
		keyboardShortcut: () => om,
		lift: () => sm,
		liftEmptyBlock: () => cm,
		liftListItem: () => lm,
		newlineInCode: () => um,
		resetAttributes: () => dm,
		scrollIntoView: () => fm,
		selectAll: () => pm,
		selectNodeBackward: () => mm,
		selectNodeForward: () => hm,
		selectParentNode: () => gm,
		selectTextblockEnd: () => _m,
		selectTextblockStart: () => vm,
		setContent: () => ym,
		setMark: () => Em,
		setMeta: () => Dm,
		setNode: () => Om,
		setNodeSelection: () => km,
		setTextDirection: () => Am,
		setTextSelection: () => jm,
		sinkListItem: () => Mm,
		splitBlock: () => Nm,
		splitListItem: () => Pm,
		toggleList: () => Lm,
		toggleMark: () => Rm,
		toggleNode: () => zm,
		toggleWrap: () => Bm,
		undoInputRule: () => Vm,
		unsetAllMarks: () => Hm,
		unsetMark: () => Um,
		unsetTextDirection: () => Wm,
		updateAttributes: () => Gm,
		updateDecorations: () => qm,
		wrapIn: () => Jm,
		wrapInList: () => Ym
	}), kp = () => ({ editor: e, view: t }) => (requestAnimationFrame(() => {
		var n;
		e.isDestroyed || (t.dom.blur(), (n = window == null ? void 0 : window.getSelection()) == null || n.removeAllRanges());
	}), !0), Ap = (e = !0) => ({ commands: t }) => t.setContent("", { emitUpdate: e }), jp = () => ({ state: e, tr: t, dispatch: n }) => {
		let { selection: r } = t, { ranges: i } = r;
		return n && i.forEach(({ $from: n, $to: r }) => {
			e.doc.nodesBetween(n.pos, r.pos, (e, n) => {
				if (e.type.isText) return;
				let { doc: r, mapping: i } = t, a = r.resolve(i.map(n)), o = r.resolve(i.map(n + e.nodeSize)), s = a.blockRange(o);
				if (!s) return;
				let c = oi(s);
				if (e.type.isTextblock) {
					let { defaultType: e } = a.parent.contentMatchAt(a.index());
					t.setNodeMarkup(s.start, e);
				}
				(c || c === 0) && t.lift(s, c);
			});
		}), !0;
	}, Mp = (e) => (t) => e(t), Np = () => ({ state: e, dispatch: t }) => so(e, t), Pp = (e, t) => ({ editor: n, tr: r }) => {
		let { state: i } = n, a = i.doc.slice(e.from, e.to);
		r.deleteRange(e.from, e.to);
		let o = r.mapping.map(t);
		return r.insert(o, a.content), r.setSelection(new F(r.doc.resolve(Math.max(o - 1, 0)))), !0;
	}, Fp = () => ({ tr: e, dispatch: t }) => {
		let { selection: n } = e, r = n.$anchor.node();
		if (r.content.size > 0) return !1;
		let i = e.selection.$anchor;
		for (let n = i.depth; n > 0; --n) if (i.node(n).type === r.type) {
			if (t) {
				let t = i.before(n), r = i.after(n);
				e.delete(t, r).scrollIntoView();
			}
			return !0;
		}
		return !1;
	}, Ip = (e) => ({ tr: t, state: n, dispatch: r }) => {
		let i = U(e, n.schema), a = t.selection.$anchor;
		for (let e = a.depth; e > 0; --e) if (a.node(e).type === i) {
			if (r) {
				let n = a.before(e), r = a.after(e);
				t.delete(n, r).scrollIntoView();
			}
			return !0;
		}
		return !1;
	}, Lp = (e) => ({ tr: t, dispatch: n }) => {
		let { from: r, to: i } = e;
		return n && t.delete(r, i), !0;
	}, Rp = (e) => e.content ? /^text(\*|\+)/.test(e.content) : !1, zp = (e, t, n) => {
		if (!e.parent.isInline || n === "left" && e.pos > e.start() || n === "right" && e.pos < e.end()) return e.pos;
		let r = t.nodes[e.parent.type.name].spec;
		return Rp(r) ? n === "left" ? e.start() - 1 : e.end() + 1 : e.pos;
	}, Bp = (e, t, n) => ({
		from: zp(e, n, "left"),
		to: zp(t, n, "right")
	}), Vp = () => ({ state: e, dispatch: t }) => {
		if (e.selection.empty) return !1;
		if (t) {
			let n = e.tr, { ranges: r } = e.selection, i = n.steps.length;
			r.forEach((t) => {
				let r = n.mapping.slice(i), { from: a, to: o } = Bp(n.doc.resolve(r.map(t.$from.pos)), n.doc.resolve(r.map(t.$to.pos)), e.schema);
				n.deleteRange(a, o);
			}), n.selection.empty || n.setSelection(F.near(n.doc.resolve(n.selection.from))), n.scrollIntoView(), t(n);
		}
		return !0;
	}, Hp = () => ({ commands: e }) => e.keyboardShortcut("Enter"), Up = () => ({ state: e, dispatch: t }) => oo(e, t), Wp = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
		let a = Sd(e, r.schema), { doc: o, selection: s } = n, { $from: c, from: l, to: u } = s;
		if (i) {
			let e = xd(c, a, t);
			if (e && e.from <= l && e.to >= u) {
				let t = F.create(o, e.from, e.to);
				n.setSelection(t);
			}
		}
		return !0;
	}, Gp = (e) => (t) => {
		let n = typeof e == "function" ? e(t) : e;
		for (let e = 0; e < n.length; e += 1) if (n[e](t)) return !0;
		return !1;
	}, Kp = (e = null, t = {}) => ({ editor: n, view: r, tr: i, dispatch: a }) => {
		t = {
			scrollIntoView: !0,
			...t
		};
		let o = () => {
			(Dd() || Ed()) && r.dom.focus(), Od() && !Dd() && !Ed() && r.dom.focus({ preventScroll: !0 }), requestAnimationFrame(() => {
				n.isDestroyed || (r.focus(), t?.scrollIntoView && n.commands.scrollIntoView());
			});
		};
		try {
			if (r.hasFocus() && e === null || e === !1) return !0;
		} catch {
			return !1;
		}
		if (a && e === null && !Cd(n.state.selection)) return o(), !0;
		let s = Td(i.doc, e) || n.state.selection, c = n.state.selection.eq(s);
		return a && (c || i.setSelection(s), c && i.storedMarks && i.setStoredMarks(i.storedMarks), o()), !0;
	}, qp = (e, t) => (n) => e.every((e, r) => t(e, {
		...n,
		index: r
	})), Jp = (e, t) => ({ tr: n, commands: r }) => r.insertContentAt({
		from: n.selection.from,
		to: n.selection.to
	}, e, t), Yp = (e) => {
		let t = e.childNodes;
		for (let n = t.length - 1; n >= 0; --n) {
			let r = t[n];
			r.nodeType === 3 && r.nodeValue && /^(\n\s\s|\n)$/.test(r.nodeValue) ? e.removeChild(r) : r.nodeType === 1 && Yp(r);
		}
		return e;
	}, Xp = (e, t, n) => ({ tr: r, dispatch: i, editor: a }) => {
		if (i) {
			n = {
				parseOptions: a.options.parseOptions,
				updateSelection: !0,
				applyInputRules: !1,
				applyPasteRules: !1,
				...n
			};
			let i, o = (e) => {
				a.emit("contentError", {
					editor: a,
					error: e,
					disableCollaboration: () => {
						"collaboration" in a.storage && typeof a.storage.collaboration == "object" && a.storage.collaboration && (a.storage.collaboration.isDisabled = !0);
					}
				});
			}, s = {
				preserveWhitespace: "full",
				...n.parseOptions
			};
			if (!n.errorOnInvalidContent && !a.options.enableContentCheck && a.options.emitContentError) try {
				jd(t, a.schema, {
					parseOptions: s,
					errorOnInvalidContent: !0
				});
			} catch (e) {
				o(e);
			}
			try {
				i = jd(t, a.schema, {
					parseOptions: s,
					errorOnInvalidContent: n.errorOnInvalidContent ?? a.options.enableContentCheck
				});
			} catch (e) {
				return o(e), !1;
			}
			let { from: c, to: l } = typeof e == "number" ? {
				from: e,
				to: e
			} : {
				from: e.from,
				to: e.to
			}, u = !0, d = !0, f = Md(i) ? i.content : [i];
			if (f.forEach((e) => {
				e.check(), u = u ? e.isText && e.marks.length === 0 : !1, d = d ? e.isBlock : !1;
			}), c === l && d) {
				let { parent: e } = r.doc.resolve(c);
				e.isTextblock && !e.type.spec.code && !e.childCount && (--c, l += 1);
			}
			let p;
			if (u) p = Array.isArray(t) ? t.map((e) => e.text || "").join("") : Ad(t) ? f.map((e) => e.text ?? "").join("") : typeof t == "object" && t && t.text ? t.text : t, r.insertText(p, c, l);
			else {
				p = j.from(f);
				let e = r.doc.resolve(c), t = e.node(), n = e.parentOffset === 0, i = t.isText || t.isTextblock, a = t.content.size > 0;
				n && i && a && d && (c = Math.max(0, c - 1)), r.replaceWith(c, l, f);
			}
			n.updateSelection && Nd(r, r.steps.length - 1, -1), n.applyInputRules && r.setMeta("applyInputRules", {
				from: c,
				text: p
			}), n.applyPasteRules && r.setMeta("applyPasteRules", {
				from: c,
				text: p
			});
		}
		return !0;
	}, Zp = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
		let { pos: i, attrs: a, content: o, updateSelection: s = !0 } = e, c;
		c = typeof i == "number" ? t.doc.resolve(i) : i || t.selection.$from;
		let l = Pd(c.parent.contentMatchAt(c.index()));
		if (!l) return !1;
		let u = Object.keys(l.spec.attrs || {}), d = a ? Object.fromEntries(Object.entries(a).filter(([e]) => u.includes(e))) : {}, f;
		if (o) {
			let e = jd(o, r.schema);
			f = l.createAndFill(d, e);
		} else f = l.createAndFill(d);
		return f ? (n && (t.insert(c.pos, f), s && Nd(t, t.steps.length - 1, -1)), !0) : !1;
	}, Qp = () => ({ state: e, dispatch: t }) => no(e, t), $p = () => ({ state: e, dispatch: t }) => ro(e, t), em = () => ({ state: e, dispatch: t }) => Xa(e, t), tm = () => ({ state: e, dispatch: t }) => eo(e, t), nm = () => ({ state: e, dispatch: t, tr: n }) => {
		try {
			let r = Ci(e.doc, e.selection.$from.pos, -1);
			return r != null && (n.join(r, 2), t && t(n), !0);
		} catch {
			return !1;
		}
	}, rm = () => ({ state: e, dispatch: t, tr: n }) => {
		try {
			let r = Ci(e.doc, e.selection.$from.pos, 1);
			return r != null && (n.join(r, 2), t && t(n), !0);
		} catch {
			return !1;
		}
	}, im = () => ({ state: e, dispatch: t }) => Za(e, t), am = () => ({ state: e, dispatch: t }) => Qa(e, t), om = (e) => ({ editor: t, view: n, tr: r, dispatch: i }) => {
		let a = Id(e).split(/-(?!$)/), o = a.find((e) => ![
			"Alt",
			"Ctrl",
			"Meta",
			"Shift"
		].includes(e)), s = new KeyboardEvent("keydown", {
			key: o === "Space" ? " " : o,
			altKey: a.includes("Alt"),
			ctrlKey: a.includes("Ctrl"),
			metaKey: a.includes("Meta"),
			shiftKey: a.includes("Shift"),
			bubbles: !0,
			cancelable: !0
		});
		return t.captureTransaction(() => {
			n.someProp("handleKeyDown", (e) => e(n, s));
		})?.steps.forEach((e) => {
			let t = e.map(r.mapping);
			t && i && r.maybeStep(t);
		}), !0;
	}, sm = (e, t = {}) => ({ state: n, dispatch: r }) => Ld(n, U(e, n.schema), t) ? io(n, r) : !1, cm = () => ({ state: e, dispatch: t }) => co(e, t), lm = (e) => ({ state: t, dispatch: n }) => Eo(U(e, t.schema))(t, n), um = () => ({ state: e, dispatch: t }) => ao(e, t), dm = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
		let a = null, o = null, s = Rd(typeof e == "string" ? e : e.name, r.schema);
		if (!s) return !1;
		s === "node" && (a = U(e, r.schema)), s === "mark" && (o = Sd(e, r.schema));
		let c = !1;
		return n.selection.ranges.forEach((e) => {
			r.doc.nodesBetween(e.$from.pos, e.$to.pos, (e, r) => {
				a && a === e.type && (c = !0, i && n.setNodeMarkup(r, void 0, zd(e.attrs, t))), o && e.marks.length && e.marks.forEach((a) => {
					o === a.type && (c = !0, i && n.addMark(r, r + e.nodeSize, o.create(zd(a.attrs, t))));
				});
			});
		}), c;
	}, fm = () => ({ tr: e, dispatch: t }) => (t && e.scrollIntoView(), !0), pm = () => ({ tr: e, dispatch: t }) => {
		if (t) {
			let t = new Ca(e.doc);
			e.setSelection(t);
		}
		return !0;
	}, mm = () => ({ state: e, dispatch: t }) => $a(e, t), hm = () => ({ state: e, dispatch: t }) => to(e, t), gm = () => ({ state: e, dispatch: t }) => uo(e, t), _m = () => ({ state: e, dispatch: t }) => mo(e, t), vm = () => ({ state: e, dispatch: t }) => po(e, t), ym = (e, { errorOnInvalidContent: t, emitUpdate: n = !0, parseOptions: r = {} } = {}) => ({ editor: i, tr: a, dispatch: o, commands: s }) => {
		let { doc: c } = a;
		if (r.preserveWhitespace !== "full") {
			let s = Bd(e, i.schema, r, { errorOnInvalidContent: t ?? i.options.enableContentCheck });
			if (o) {
				let e = Md(s) ? s.content : [s];
				a.replaceWith(0, c.content.size, e).setMeta("preventUpdate", !n);
			}
			return !0;
		}
		return o && a.setMeta("preventUpdate", !n), s.insertContentAt({
			from: 0,
			to: c.content.size
		}, e, {
			parseOptions: r,
			errorOnInvalidContent: t ?? i.options.enableContentCheck
		});
	}, bm = (e, t, n, r = 20) => {
		let i = e.doc.resolve(n), a = r, o = null;
		for (; a > 0 && o === null;) {
			let e = i.node(a);
			e?.type.name === t ? o = e : --a;
		}
		return [o, a];
	}, xm = (e) => {
		let t = e.depth - 1;
		if (t < 0) return null;
		let n = e.index(t);
		return n === 0 ? null : e.node(t).child(n - 1);
	}, Sm = (e, t = 500) => {
		let n = "", r = e.parentOffset;
		return e.parent.nodesBetween(Math.max(0, r - t), r, (e, t, i, a) => {
			var o;
			let s = (o = e.type.spec).toText?.call(o, {
				node: e,
				pos: t,
				parent: i,
				index: a
			}) || e.textContent || "%leaf%";
			n += e.isAtom && !e.isText ? s : s.slice(0, Math.max(0, r - t));
		}), n;
	}, Cm = (e, t) => {
		let { $from: n, $to: r, $anchor: i } = e.selection;
		if (t) {
			let n = Gd((e) => e.type.name === t)(e.selection);
			if (!n) return !1;
			let r = e.doc.resolve(n.pos + 1);
			return i.pos + 1 === r.end();
		}
		return !(r.parentOffset < r.parent.nodeSize - 2 || n.pos !== r.pos);
	}, wm = (e) => {
		let { $from: t, $to: n } = e.selection;
		return !(t.parentOffset > 0 || t.pos !== n.pos);
	}, Tm = class e {
		constructor(e) {
			this.position = e;
		}
		static fromJSON(t) {
			return new e(t.position);
		}
		toJSON() {
			return { position: this.position };
		}
	}, Em = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
		let { selection: a } = n, { empty: o, ranges: s } = a, c = Sd(e, r.schema);
		if (i) if (o) {
			let e = Vd(r, c);
			n.addStoredMark(c.create({
				...e,
				...t
			}));
		} else s.forEach((e) => {
			let i = e.$from.pos, a = e.$to.pos;
			r.doc.nodesBetween(i, a, (e, r) => {
				let o = Math.max(r, i), s = Math.min(r + e.nodeSize, a);
				e.marks.find((e) => e.type === c) ? e.marks.forEach((e) => {
					c === e.type && n.addMark(o, s, c.create({
						...e.attrs,
						...t
					}));
				}) : n.addMark(o, s, c.create(t));
			});
		});
		return kf(r, n, c);
	}, Dm = (e, t) => ({ tr: n }) => (n.setMeta(e, t), !0), Om = (e, t = {}) => ({ state: n, dispatch: r, chain: i }) => {
		let a = U(e, n.schema), o;
		return n.selection.$anchor.sameParent(n.selection.$head) && (o = n.selection.$anchor.parent.attrs), a.isTextblock ? i().command(({ commands: e }) => qa(a, {
			...o,
			...t
		})(n) ? !0 : e.clearNodes()).command(({ state: e }) => qa(a, {
			...o,
			...t
		})(e, r)).run() : (console.warn("[tiptap warn]: Currently \"setNode()\" only supports text block nodes."), !1);
	}, km = (e) => ({ tr: t, dispatch: n }) => {
		if (n) {
			let { doc: n } = t, r = wd(e, 0, n.content.size), i = I.create(n, r);
			t.setSelection(i);
		}
		return !0;
	}, Am = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
		let { selection: a } = r, o, s;
		return typeof t == "number" ? (o = t, s = t) : t && "from" in t && "to" in t ? (o = t.from, s = t.to) : (o = a.from, s = a.to), i && n.doc.nodesBetween(o, s, (t, r) => {
			t.isText || n.setNodeMarkup(r, void 0, {
				...t.attrs,
				dir: e
			});
		}), !0;
	}, jm = (e) => ({ tr: t, dispatch: n }) => {
		if (n) {
			let { doc: n } = t, { from: r, to: i } = typeof e == "number" ? {
				from: e,
				to: e
			} : e, a = F.atStart(n).from, o = F.atEnd(n).to, s = wd(r, a, o), c = wd(i, a, o), l = F.create(n, s, c);
			t.setSelection(l);
		}
		return !0;
	}, Mm = (e) => ({ state: t, dispatch: n }) => ko(U(e, t.schema))(t, n), Nm = ({ keepMarks: e = !0 } = {}) => ({ tr: t, state: n, dispatch: r, editor: i }) => {
		let { selection: a, doc: o } = t, { $from: s, $to: c } = a, l = i.extensionManager.attributes, u = bf(l, s.node().type.name, s.node().attrs);
		if (a instanceof I && a.node.isBlock) return !s.parentOffset || !vi(o, s.pos) ? !1 : (r && (e && Af(n, i.extensionManager.splittableMarks), t.split(s.pos).scrollIntoView()), !0);
		if (!s.parent.isBlock) return !1;
		let d = c.parentOffset === c.parent.content.size, f = s.depth === 0 ? void 0 : Pd(s.node(-1).contentMatchAt(s.indexAfter(-1))), p = d && f ? [{
			type: f,
			attrs: u
		}] : void 0, m = vi(t.doc, t.mapping.map(s.pos), 1, p);
		if (!p && !m && vi(t.doc, t.mapping.map(s.pos), 1, f ? [{ type: f }] : void 0) && (m = !0, p = f ? [{
			type: f,
			attrs: u
		}] : void 0), r) {
			if (m && (a instanceof F && t.deleteSelection(), t.split(t.mapping.map(s.pos), 1, p), f && !d && !s.parentOffset && s.parent.type !== f)) {
				let e = t.mapping.map(s.before()), n = t.doc.resolve(e);
				s.node(-1).canReplaceWith(n.index(), n.index() + 1, f) && t.setNodeMarkup(t.mapping.map(s.before()), f);
			}
			e && Af(n, i.extensionManager.splittableMarks), t.scrollIntoView();
		}
		return m;
	}, Pm = (e, t = {}) => ({ tr: n, state: r, dispatch: i, editor: a }) => {
		let o = U(e, r.schema), { $from: s, $to: c } = r.selection, l = r.selection.node;
		if (l && l.isBlock || s.depth < 2 || !s.sameParent(c)) return !1;
		let u = s.node(-1);
		if (u.type !== o) return !1;
		let d = a.extensionManager.attributes;
		if (s.parent.content.size === 0 && s.node(-1).childCount === s.indexAfter(-1)) {
			if (s.depth === 2 || s.node(-3).type !== o || s.index(-2) !== s.node(-2).childCount - 1) return !1;
			if (i) {
				let e = j.empty, r = s.index(-1) ? 1 : s.index(-2) ? 2 : 3;
				for (let t = s.depth - r; t >= s.depth - 3; --t) e = j.from(s.node(t).copy(e));
				let i = s.indexAfter(-1) < s.node(-2).childCount ? 1 : s.indexAfter(-2) < s.node(-3).childCount ? 2 : 3, a = {
					...bf(d, s.node().type.name, s.node().attrs),
					...t
				}, c = o.contentMatch.defaultType?.createAndFill(a) || void 0;
				e = e.append(j.from(o.createAndFill(null, c) || void 0));
				let l = s.before(s.depth - (r - 1));
				n.replace(l, s.after(-i), new N(e, 4 - r, 0));
				let u = -1;
				n.doc.nodesBetween(l, n.doc.content.size, (e, t) => {
					if (u > -1) return !1;
					e.isTextblock && e.content.size === 0 && (u = t + 1);
				}), u > -1 && n.setSelection(F.near(n.doc.resolve(u))), n.scrollIntoView();
			}
			return !0;
		}
		let f = c.pos === s.end() ? u.contentMatchAt(0).defaultType : null, p = {
			...bf(d, u.type.name, u.attrs),
			...t
		}, m = {
			...bf(d, s.node().type.name, s.node().attrs),
			...t
		};
		n.delete(s.pos, c.pos);
		let h = f ? [{
			type: o,
			attrs: p
		}, {
			type: f,
			attrs: m
		}] : [{
			type: o,
			attrs: p
		}];
		if (!vi(n.doc, s.pos, 2)) return !1;
		if (i) {
			let { selection: e, storedMarks: t } = r, { splittableMarks: o } = a.extensionManager, c = t || e.$to.parentOffset && e.$from.marks();
			if (n.split(s.pos, 2, h).scrollIntoView(), !c || !i) return !0;
			let l = c.filter((e) => o.includes(e.type.name));
			n.ensureMarks(l);
		}
		return !0;
	}, Fm = (e, t) => {
		let n = Gd((e) => e.type === t)(e.selection);
		if (!n) return !0;
		let r = e.doc.resolve(Math.max(0, n.pos - 1)).before(n.depth);
		if (r === void 0) return !0;
		let i = e.doc.nodeAt(r);
		return !(n.node.type === i?.type && bi(e.doc, n.pos)) || !Mf(n.node.attrs.type, i?.attrs.type) || e.join(n.pos), !0;
	}, Im = (e, t) => {
		let n = Gd((e) => e.type === t)(e.selection);
		if (!n) return !0;
		let r = e.doc.resolve(n.start).after(n.depth);
		if (r === void 0) return !0;
		let i = e.doc.nodeAt(r);
		return !(n.node.type === i?.type && bi(e.doc, r)) || !Mf(n.node.attrs.type, i?.attrs.type) || e.join(r), !0;
	}, Lm = (e, t, n, r = {}) => ({ editor: i, tr: a, state: o, dispatch: s, chain: c, commands: l, can: u }) => {
		let { extensions: d, splittableMarks: f } = i.extensionManager, p = U(e, o.schema), m = U(t, o.schema), { selection: h, storedMarks: g } = o, { $from: _, $to: v } = h, y = _.blockRange(v), b = g || h.$to.parentOffset && h.$from.marks();
		if (!y) return !1;
		let x = Gd((e) => wf(e.type.name, d))(h), ee = h.from === 0 && h.to === o.doc.content.size, te = o.doc.content.content, S = te.length === 1 ? te[0] : null, ne = ee && S && wf(S.type.name, d) ? {
			node: S,
			pos: 0,
			depth: 0
		} : null, re = x ?? ne, C = !!x && y.depth >= 1 && y.depth - x.depth <= 1, ie = !!ne;
		if ((C || ie) && re) {
			if (re.node.type === p) return ee && ie ? c().command(({ tr: e, dispatch: t }) => {
				let n = Nf(e);
				return n ? (e.setSelection(n), t && t(e), !0) : !1;
			}).liftListItem(m).run() : l.liftListItem(m);
			if (wf(re.node.type.name, d) && p.validContent(re.node.content)) return c().command(() => (a.setNodeMarkup(re.pos, p), !0)).command(() => Fm(a, p)).command(() => Im(a, p)).run();
		}
		return !n || !b || !s ? c().command(() => u().wrapInList(p, r) ? !0 : l.clearNodes()).wrapInList(p, r).command(() => Fm(a, p)).command(() => Im(a, p)).run() : c().command(() => {
			let e = u().wrapInList(p, r), t = b.filter((e) => f.includes(e.type.name));
			return a.ensureMarks(t), e ? !0 : l.clearNodes();
		}).wrapInList(p, r).command(() => Fm(a, p)).command(() => Im(a, p)).run();
	}, Rm = (e, t = {}, n = {}) => ({ state: r, commands: i }) => {
		let { extendEmptyMarkRange: a = !1 } = n, o = Sd(e, r.schema);
		return xf(r, o, t) ? i.unsetMark(o, { extendEmptyMarkRange: a }) : i.setMark(o, t);
	}, zm = (e, t, n = {}) => ({ state: r, commands: i }) => {
		let a = U(e, r.schema), o = U(t, r.schema), s = Ld(r, a, n), c;
		return r.selection.$anchor.sameParent(r.selection.$head) && (c = r.selection.$anchor.parent.attrs), s ? i.setNode(o, c) : i.setNode(a, {
			...c,
			...n
		});
	}, Bm = (e, t = {}) => ({ state: n, commands: r }) => {
		let i = U(e, n.schema);
		return Ld(n, i, t) ? r.lift(i) : r.wrapIn(i, t);
	}, Vm = () => ({ state: e, dispatch: t }) => {
		let n = e.plugins;
		for (let r = 0; r < n.length; r += 1) {
			let i = n[r], a;
			if (i.spec.isInputRules && (a = i.getState(e))) {
				if (t) {
					let t = e.tr, n = a.transform;
					for (let e = n.steps.length - 1; e >= 0; --e) t.step(n.steps[e].invert(n.docs[e]));
					if (a.text) {
						let n = t.doc.resolve(a.from).marks();
						t.replaceWith(a.from, a.to, e.schema.text(a.text, n));
					} else t.delete(a.from, a.to);
				}
				return !0;
			}
		}
		return !1;
	}, Hm = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
		let { ignoreClearable: i = !1 } = e, { selection: a } = t, { empty: o, ranges: s } = a;
		if (o) return !0;
		let { nonClearableMarks: c } = r.extensionManager;
		if (n) {
			let e = Object.values(r.schema.marks).filter((e) => i || !c.includes(e.name));
			s.forEach((n) => {
				for (let r of e) t.removeMark(n.$from.pos, n.$to.pos, r);
			});
		}
		return !0;
	}, Um = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
		let { extendEmptyMarkRange: a = !1 } = t, { selection: o } = n, s = Sd(e, r.schema), { $from: c, empty: l, ranges: u } = o;
		if (!i) return !0;
		if (l && a) {
			let { from: e, to: t } = o, r = xd(c, s, c.marks().find((e) => e.type === s)?.attrs);
			r && (e = r.from, t = r.to), n.removeMark(e, t, s);
		} else u.forEach((e) => {
			n.removeMark(e.$from.pos, e.$to.pos, s);
		});
		return n.removeStoredMark(s), !0;
	}, Wm = (e) => ({ tr: t, state: n, dispatch: r }) => {
		let { selection: i } = n, a, o;
		return typeof e == "number" ? (a = e, o = e) : e && "from" in e && "to" in e ? (a = e.from, o = e.to) : (a = i.from, o = i.to), r && t.doc.nodesBetween(a, o, (e, n) => {
			if (e.isText) return;
			let r = { ...e.attrs };
			delete r.dir, t.setNodeMarkup(n, void 0, r);
		}), !0;
	}, Gm = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
		let a = null, o = null, s = Rd(typeof e == "string" ? e : e.name, r.schema);
		if (!s) return !1;
		s === "node" && (a = U(e, r.schema)), s === "mark" && (o = Sd(e, r.schema));
		let c = !1;
		return n.selection.ranges.forEach((e) => {
			let s = e.$from.pos, l = e.$to.pos, u, d, f, p;
			n.selection.empty ? r.doc.nodesBetween(s, l, (e, t) => {
				a && a === e.type && (c = !0, f = Math.max(t, s), p = Math.min(t + e.nodeSize, l), u = t, d = e);
			}) : r.doc.nodesBetween(s, l, (e, r) => {
				r < s && a && a === e.type && (c = !0, f = Math.max(r, s), p = Math.min(r + e.nodeSize, l), u = r, d = e), r >= s && r <= l && (a && a === e.type && (c = !0, i && n.setNodeMarkup(r, void 0, {
					...e.attrs,
					...t
				})), o && e.marks.length && e.marks.forEach((a) => {
					if (o === a.type && (c = !0, i)) {
						let i = Math.max(r, s), c = Math.min(r + e.nodeSize, l);
						n.addMark(i, c, o.create({
							...a.attrs,
							...t
						}));
					}
				}));
			}), d && (u !== void 0 && i && n.setNodeMarkup(u, void 0, {
				...d.attrs,
				...t
			}), o && d.marks.length && d.marks.forEach((e) => {
				o === e.type && i && n.addMark(f, p, o.create({
					...e.attrs,
					...t
				}));
			}));
		}), c;
	}, Km = new R("__tiptap_decorations__"), qm = (e) => ({ tr: t, dispatch: n }) => (n && t.setMeta(Km, {
		type: "force",
		name: e
	}), !0), Jm = (e, t = {}) => ({ state: n, dispatch: r }) => Ka(U(e, n.schema), t)(n, r), Ym = (e, t = {}) => ({ state: n, dispatch: r }) => Co(U(e, n.schema), t)(n, r), Xm = /* @__PURE__ */ new WeakMap(), Zm = class {
		constructor() {
			this.callbacks = {};
		}
		on(e, t) {
			return this.callbacks[e] || (this.callbacks[e] = []), this.callbacks[e].push(t), this;
		}
		emit(e, ...t) {
			let n = this.callbacks[e];
			return n && n.forEach((e) => e.apply(this, t)), this;
		}
		off(e, t) {
			let n = this.callbacks[e];
			return n && (t ? this.callbacks[e] = n.filter((e) => e !== t) : delete this.callbacks[e]), this;
		}
		once(e, t) {
			let n = (...r) => {
				this.off(e, n), t.apply(this, r);
			};
			return this.on(e, n);
		}
		removeAllListeners() {
			this.callbacks = {};
		}
	}, Qm = typeof process < "u" && !1, $m = /* @__PURE__ */ new Set(), eh = class {
		constructor(e) {
			this.warnedWidgetKeys = /* @__PURE__ */ new Set(), this.warnedOutOfRangeExtensions = /* @__PURE__ */ new Set(), this.handleBeforeTransaction = ({ nextState: e }) => {
				let t = Km.getState(e);
				t && this.warnDuplicateWidgetKeys(t);
			}, this.editor = e.editor, this.entries = this.resolveEntries(e.entries), this.entries.forEach(({ name: e, spec: t }) => Zf(e, t)), this.plugin = this.entries.length > 0 ? this.createPlugin() : null, this.editor.on("beforeTransaction", this.handleBeforeTransaction);
		}
		destroy() {
			this.editor.off("beforeTransaction", this.handleBeforeTransaction);
		}
		liveWidgetKeys() {
			return Km.getState(this.editor.state)?.widgetKeys ?? $m;
		}
		get mountedView() {
			return this.editor.isDestroyed ? null : this.editor.view;
		}
		resolveEntries(e) {
			let t = [];
			for (let { name: n, addDecorations: r } of e) {
				let e = r();
				e && t.push({
					name: n,
					spec: e
				});
			}
			return t;
		}
		createPlugin() {
			let { editor: e, entries: t } = this;
			return new L({
				key: Km,
				state: {
					init: (e, n) => {
						let r = {}, i = {};
						for (let { name: e, spec: a } of t) {
							let { set: t, widgetKeys: o } = this.buildFullSet(e, a, n);
							r[e] = t, i[e] = o;
						}
						let a = {
							decorationSetsByExtension: r,
							widgetKeysByExtension: i,
							mergedDecorationSet: this.buildMergedSet(n.doc, r),
							widgetKeys: Xf(i)
						};
						return this.warnDuplicateWidgetKeys(a), a;
					},
					apply: (n, r, i, a) => {
						let o = n.getMeta(Km), s = o?.type === "force" && !o.name, c = o?.type === "force" ? o.name : void 0, l = {}, u = {}, d = /* @__PURE__ */ new Set();
						return Pf(e, () => {
							for (let { name: o, spec: f } of t) {
								let t = s || c === o;
								if (!Qf(f, {
									editor: e,
									tr: n,
									oldState: i,
									newState: a
								}, t)) {
									let e = Jf(o, r, n);
									l[o] = e.set, u[o] = e.widgetKeys;
								} else if (f.update === "changedRanges" && n.docChanged && !t) {
									let e = this.applyChangedRangesRecompute(o, f, r, n, a);
									l[o] = e.set, u[o] = e.widgetKeys, d.add(o);
								} else {
									let { set: e, widgetKeys: t } = this.buildFullSet(o, f, a);
									l[o] = e, u[o] = t, d.add(o);
								}
							}
						}), d.size === 0 && !n.docChanged ? r : {
							decorationSetsByExtension: l,
							widgetKeysByExtension: u,
							mergedDecorationSet: this.mergeAfterApply({
								entries: t,
								previous: r,
								tr: n,
								decorationSetsByExtension: l,
								recomputedNames: d
							}),
							widgetKeys: Xf(u)
						};
					}
				},
				props: { decorations(e) {
					return Km.getState(e)?.mergedDecorationSet ?? V.empty;
				} }
			});
		}
		applyChangedRangesRecompute(e, t, n, r, i) {
			let a = Kf(r, i.doc);
			return a.type === "full" ? this.buildFullSet(e, t, i) : this.rebuildRanges(e, t, n, r, i, a.ranges);
		}
		rebuildRanges(e, t, n, r, i, a) {
			let o = n.decorationSetsByExtension[e] ?? V.empty, s = new Set(n.widgetKeysByExtension[e] ?? []), c = qf(o, r.mapping, r.doc, s), l = i.doc.content.size;
			for (let { from: n, to: r } of a) {
				let a = c.find(n, r).filter((e) => zf({
					position: e.from,
					from: n,
					to: r,
					docSize: l
				}));
				for (let e of a) {
					let t = Vf(e);
					t && s.delete(t);
				}
				c = c.remove(a);
				let { decorations: o, widgetKeys: u } = Lf(Bf({
					decorations: this.runCreate(e, "createInRange", () => t.createInRange({
						editor: this.editor,
						state: i,
						view: this.mountedView,
						from: n,
						to: r
					})),
					from: n,
					to: r,
					docSize: l,
					extensionName: e,
					warnedExtensions: this.warnedOutOfRangeExtensions
				}), e);
				c = c.add(i.doc, o);
				for (let e of u) s.add(e);
			}
			return {
				set: c,
				widgetKeys: s
			};
		}
		buildFullSet(e, t, n) {
			let r = this.runCreate(e, "create", () => t.create({
				editor: this.editor,
				state: n,
				view: this.mountedView
			}));
			return Rf(n.doc, r, e);
		}
		runCreate(e, t, n) {
			try {
				return n();
			} catch (n) {
				return console.error(`[tiptap error]: Extension "${e}" threw in \`addDecorations().${t}()\`. Its decorations were dropped for this update.`, n), [];
			}
		}
		warnDuplicateWidgetKeys(e) {
			if (!Qm) return;
			if (e.widgetKeys.size === 0) {
				this.warnedWidgetKeys.clear();
				return;
			}
			let t = Hf(e.mergedDecorationSet), n = new Set(t.map(({ key: e }) => e));
			for (let { key: e, extensions: n } of t) {
				if (this.warnedWidgetKeys.has(e)) continue;
				let t = Array.from(n).map((e) => `"${e}"`).join(", ");
				console.warn(`[tiptap warn]: Duplicate widget decoration key "${e}" in extension${n.size === 1 ? "" : "s"} ${t}. Widget decoration keys must be globally unique, otherwise ProseMirror misplaces the widget DOM. Use a stable, unique key (e.g. \`comment-\${id}\`).`);
			}
			this.warnedWidgetKeys = n;
		}
		buildMergedSet(e, t) {
			let n = Object.keys(t);
			return n.length === 1 ? t[n[0]] : Yf(e, t);
		}
		mergeAfterApply({ entries: e, previous: t, tr: n, decorationSetsByExtension: r, recomputedNames: i }) {
			return e.length === 1 ? r[e[0].name] : i.size === 0 ? t.mergedDecorationSet.map(n.mapping, n.doc) : Yf(n.doc, r);
		}
	}, th = {}, Ep(th, {
		createAtomBlockMarkdownSpec: () => op,
		createBlockMarkdownSpec: () => sp,
		createInlineMarkdownSpec: () => up,
		parseAttributes: () => ip,
		parseIndentedBlocks: () => dp,
		renderNestedMarkdownContent: () => fp,
		serializeAttributes: () => ap
	}), nh = class {
		constructor(e) {
			this.find = e.find, this.handler = e.handler, this.undoable = e.undoable ?? !0;
		}
	}, rh = (e, t) => {
		if (_d(t)) return t.exec(e);
		let n = t(e);
		if (!n) return null;
		let r = [n.text];
		return r.index = n.index, r.input = e, r.data = n.data, n.replaceWith && (n.text.includes(n.replaceWith) || console.warn("[tiptap warn]: \"inputRuleMatch.replaceWith\" must be part of \"inputRuleMatch.text\"."), r.push(n.replaceWith)), r;
	}, ih = class {
		constructor(e = {}) {
			this.type = "extendable", this.parent = null, this.child = null, this.name = "", this.config = { name: this.name }, this.config = {
				...this.config,
				...e
			}, this.name = this.config.name;
		}
		get options() {
			return { ...G(W(this, "addOptions", { name: this.name })) };
		}
		get storage() {
			return { ...G(W(this, "addStorage", {
				name: this.name,
				options: this.options
			})) };
		}
		configure(e = {}) {
			let t = this.extend({
				...this.config,
				addOptions: () => pp(this.options, e)
			});
			return t.name = this.name, t.parent = this.parent, this.child = null, t;
		}
		extend(e = {}) {
			let t = new this.constructor({
				...this.config,
				...e
			});
			return t.parent = this, this.child = t, t.name = "name" in e ? e.name : t.parent.name, t;
		}
	}, ah = class e extends ih {
		constructor() {
			super(...arguments), this.type = "mark";
		}
		static create(t = {}) {
			let n = typeof t == "function" ? t() : t;
			return new e(n);
		}
		static handleExit({ editor: e, mark: t }) {
			let { tr: n } = e.state, r = e.state.selection.$from;
			if (r.pos === r.end()) {
				let i = r.marks();
				if (!i.find((e) => e?.type.name === t.name)) return !1;
				let a = i.find((e) => e?.type.name === t.name);
				return a && n.removeStoredMark(a), n.insertText(" ", r.pos), e.view.dispatch(n), !0;
			}
			return !1;
		}
		configure(e) {
			return super.configure(e);
		}
		extend(e) {
			let t = typeof e == "function" ? e() : e;
			return super.extend(t);
		}
	}, oh = class {
		constructor(e) {
			this.find = e.find, this.handler = e.handler;
		}
	}, sh = (e, t, n) => {
		if (_d(t)) return [...e.matchAll(t)];
		let r = t(e, n);
		return r ? r.map((t) => {
			let n = [t.text];
			return n.index = t.index, n.input = e, n.data = t.data, t.replaceWith && (t.text.includes(t.replaceWith) || console.warn("[tiptap warn]: \"pasteRuleMatch.replaceWith\" must be part of \"pasteRuleMatch.text\"."), n.push(t.replaceWith)), n;
		}) : [];
	}, ch = null, lh = (e) => {
		var t;
		let n = new ClipboardEvent("paste", { clipboardData: new DataTransfer() });
		return (t = n.clipboardData) == null || t.setData("text/html", e), n;
	}, uh = class {
		constructor(e, t) {
			this.splittableMarks = [], this.nonClearableMarks = [], this.decorationManager = null, this.editor = t, this.baseExtensions = e, this.extensions = lf(e), this.schema = of(this.extensions, t), this.setupExtensions();
		}
		get commands() {
			return this.extensions.reduce((e, t) => {
				let n = W(t, "addCommands", {
					name: t.name,
					options: t.options,
					storage: this.editor.extensionStorage[t.name],
					editor: this.editor,
					type: yf(t.name, this.schema)
				});
				return n ? {
					...e,
					...n()
				} : e;
			}, {});
		}
		get plugins() {
			let { editor: e } = this, t = cf([...this.extensions].reverse()).flatMap((t) => {
				let n = {
					name: t.name,
					options: t.options,
					storage: this.editor.extensionStorage[t.name],
					editor: e,
					type: yf(t.name, this.schema)
				}, r = [], i = W(t, "addKeyboardShortcuts", n), a = {};
				if (t.type === "mark" && W(t, "exitable", n) && (a.ArrowRight = () => ah.handleExit({
					editor: e,
					mark: t
				})), i) {
					let t = Object.fromEntries(Object.entries(i()).map(([t, n]) => [t, () => n({ editor: e })]));
					a = {
						...a,
						...t
					};
				}
				let o = ud(a);
				r.push(o);
				let s = W(t, "addInputRules", n);
				if (Cf(t, e.options.enableInputRules) && s) {
					let t = s();
					if (t && t.length) {
						let n = gp({
							editor: e,
							rules: t
						}), i = Array.isArray(n) ? n : [n];
						r.push(...i);
					}
				}
				let c = W(t, "addPasteRules", n);
				if (Cf(t, e.options.enablePasteRules) && c) {
					let t = c();
					if (t && t.length) {
						let n = vp({
							editor: e,
							rules: t
						});
						r.push(...n);
					}
				}
				let l = W(t, "addProseMirrorPlugins", n);
				if (l) {
					let e = l();
					r.push(...e);
				}
				return r;
			}), n = this.createDecorationPlugin();
			return n && t.push(n), t;
		}
		createDecorationPlugin() {
			var e;
			let { editor: t } = this;
			(e = this.decorationManager) == null || e.destroy();
			let n = [];
			return this.extensions.forEach((e) => {
				let r = W(e, "addDecorations", {
					name: e.name,
					options: e.options,
					storage: this.editor.extensionStorage[e.name],
					editor: t,
					type: yf(e.name, this.schema)
				});
				r && n.push({
					name: e.name,
					addDecorations: r
				});
			}), this.decorationManager = new eh({
				editor: t,
				entries: n
			}), this.decorationManager.plugin;
		}
		get attributes() {
			return Zd(this.extensions);
		}
		get nodeViews() {
			let { editor: e } = this, { nodeExtensions: t } = Xd(this.extensions);
			return Object.fromEntries(t.filter((e) => !!W(e, "addNodeView")).map((t) => {
				let n = this.attributes.filter((e) => e.type === t.name), r = W(t, "addNodeView", {
					name: t.name,
					options: t.options,
					storage: this.editor.extensionStorage[t.name],
					editor: e,
					type: U(t.name, this.schema)
				});
				if (!r) return [];
				let i = r();
				return i ? [t.name, (r, a, o, s, c) => {
					let l = ef(r, n);
					return i({
						node: r,
						view: a,
						getPos: o,
						decorations: s,
						innerDecorations: c,
						editor: e,
						extension: t,
						HTMLAttributes: l
					});
				}] : [];
			}));
		}
		dispatchTransaction(e) {
			let { editor: t } = this;
			return cf([...this.extensions].reverse()).reduceRight((e, n) => {
				let r = {
					name: n.name,
					options: n.options,
					storage: this.editor.extensionStorage[n.name],
					editor: t,
					type: yf(n.name, this.schema)
				}, i = W(n, "dispatchTransaction", r);
				return i ? (t) => {
					i.call(r, {
						transaction: t,
						next: e
					});
				} : e;
			}, e);
		}
		transformPastedHTML(e) {
			let { editor: t } = this;
			return cf([...this.extensions]).reduce((e, n) => {
				let r = {
					name: n.name,
					options: n.options,
					storage: this.editor.extensionStorage[n.name],
					editor: t,
					type: yf(n.name, this.schema)
				}, i = W(n, "transformPastedHTML", r);
				return i ? (t, n) => {
					let a = e(t, n);
					return i.call(r, a);
				} : e;
			}, e || ((e) => e));
		}
		get markViews() {
			let { editor: e } = this, { markExtensions: t } = Xd(this.extensions);
			return Object.fromEntries(t.filter((e) => !!W(e, "addMarkView")).map((t) => {
				let n = this.attributes.filter((e) => e.type === t.name), r = W(t, "addMarkView", {
					name: t.name,
					options: t.options,
					storage: this.editor.extensionStorage[t.name],
					editor: e,
					type: Sd(t.name, this.schema)
				});
				return r ? [t.name, (i, a, o) => {
					let s = ef(i, n);
					return r()({
						mark: i,
						view: a,
						inline: o,
						editor: e,
						extension: t,
						HTMLAttributes: s,
						updateAttributes: (t) => {
							mp(i, e, t);
						}
					});
				}] : [];
			}));
		}
		destroy() {
			var e;
			(e = this.decorationManager) == null || e.destroy(), this.extensions.forEach((e) => {
				let t = e;
				for (; t.parent;) {
					let e = t.parent;
					e.child === t && (e.child = null), t = e;
				}
			}), this.extensions = [], this.baseExtensions = [], this.decorationManager = null, this.schema = null, this.editor = null;
		}
		setupExtensions() {
			let e = this.extensions;
			this.editor.extensionStorage = Object.fromEntries(e.map((e) => [e.name, e.storage])), e.forEach((e) => {
				let t = {
					name: e.name,
					options: e.options,
					storage: this.editor.extensionStorage[e.name],
					editor: this.editor,
					type: yf(e.name, this.schema)
				};
				e.type === "mark" && ((G(W(e, "keepOnSplit", t)) ?? !0) && this.splittableMarks.push(e.name), (G(W(e, "clearable", t)) ?? !0) || this.nonClearableMarks.push(e.name));
				let n = W(e, "onBeforeCreate", t), r = W(e, "onCreate", t), i = W(e, "onUpdate", t), a = W(e, "onSelectionUpdate", t), o = W(e, "onTransaction", t), s = W(e, "onFocus", t), c = W(e, "onBlur", t), l = W(e, "onDestroy", t);
				n && this.editor.on("beforeCreate", n), r && this.editor.on("create", r), i && this.editor.on("update", i), a && this.editor.on("selectionUpdate", a), o && this.editor.on("transaction", o), s && this.editor.on("focus", s), c && this.editor.on("blur", c), l && this.editor.on("destroy", l);
			});
		}
	}, uh.resolve = lf, uh.sort = cf, uh.flatten = Kd, dh = {}, Ep(dh, {
		ClipboardTextSerializer: () => fh,
		Commands: () => ph,
		Delete: () => mh,
		Drop: () => hh,
		Editable: () => gh,
		FocusEvents: () => vh,
		Keymap: () => yh,
		Paste: () => bh,
		Tabindex: () => xh,
		TextDirection: () => Sh,
		focusEventsPluginKey: () => _h
	}), q = class e extends ih {
		constructor() {
			super(...arguments), this.type = "extension";
		}
		static create(t = {}) {
			let n = typeof t == "function" ? t() : t;
			return new e(n);
		}
		configure(e) {
			return super.configure(e);
		}
		extend(e) {
			let t = typeof e == "function" ? e() : e;
			return super.extend(t);
		}
	}, fh = q.create({
		name: "clipboardTextSerializer",
		addOptions() {
			return { blockSeparator: void 0 };
		},
		addProseMirrorPlugins() {
			return [new L({
				key: new R("clipboardTextSerializer"),
				props: { clipboardTextSerializer: () => {
					let { editor: e } = this, { state: t, schema: n } = e, { doc: r, selection: i } = t, a = ff(n), { blockSeparator: o } = this.options, s = {
						...o === void 0 ? {} : { blockSeparator: o },
						textSerializers: a
					};
					return [...i.ranges].sort((e, t) => e.$from.pos - t.$from.pos).map(({ $from: e, $to: t }) => uf(r, {
						from: e.pos,
						to: t.pos
					}, s)).join(o ?? "\n\n");
				} }
			})];
		}
	}), ph = q.create({
		name: "commands",
		addCommands() {
			return { ...Op };
		}
	}), mh = q.create({
		name: "delete",
		onUpdate({ transaction: e, appendedTransactions: t }) {
			let n = () => {
				var n;
				if (((n = this.editor.options.coreExtensionOptions?.delete)?.filterTransaction)?.call(n, e) ?? e.getMeta("y-sync$")) return;
				let r = Hd(e.before, [e, ...t]);
				_f(r).forEach((t) => {
					r.mapping.mapResult(t.oldRange.from).deletedAfter && r.mapping.mapResult(t.oldRange.to).deletedBefore && r.before.nodesBetween(t.oldRange.from, t.oldRange.to, (n, i) => {
						let a = i + n.nodeSize - 2, o = t.oldRange.from <= i && a <= t.oldRange.to;
						this.editor.emit("delete", {
							type: "node",
							node: n,
							from: i,
							to: a,
							newFrom: r.mapping.map(i),
							newTo: r.mapping.map(a),
							deletedRange: t.oldRange,
							newRange: t.newRange,
							partial: !o,
							editor: this.editor,
							transaction: e,
							combinedTransform: r
						});
					});
				});
				let i = r.mapping;
				r.steps.forEach((t, n) => {
					if (t instanceof ea) {
						let a = i.slice(n).map(t.from, -1), o = i.slice(n).map(t.to), s = i.invert().map(a, -1), c = i.invert().map(o), l = a > 0 && r.doc.nodeAt(a - 1)?.marks.some((e) => e.eq(t.mark)), u = r.doc.nodeAt(o)?.marks.some((e) => e.eq(t.mark));
						this.editor.emit("delete", {
							type: "mark",
							mark: t.mark,
							from: t.from,
							to: t.to,
							deletedRange: {
								from: s,
								to: c
							},
							newRange: {
								from: a,
								to: o
							},
							partial: !!(u || l),
							editor: this.editor,
							transaction: e,
							combinedTransform: r
						});
					}
				});
			};
			this.editor.options.coreExtensionOptions?.delete?.async ?? !0 ? setTimeout(n, 0) : n();
		}
	}), hh = q.create({
		name: "drop",
		addProseMirrorPlugins() {
			return [new L({
				key: new R("tiptapDrop"),
				props: { handleDrop: (e, t, n, r) => {
					this.editor.emit("drop", {
						editor: this.editor,
						event: t,
						slice: n,
						moved: r
					});
				} }
			})];
		}
	}), gh = q.create({
		name: "editable",
		addProseMirrorPlugins() {
			return [new L({
				key: new R("editable"),
				props: { editable: () => this.editor.options.editable }
			})];
		}
	}), _h = new R("focusEvents"), vh = q.create({
		name: "focusEvents",
		addProseMirrorPlugins() {
			let { editor: e } = this;
			return [new L({
				key: _h,
				props: { handleDOMEvents: {
					focus: (t, n) => {
						e.isFocused = !0;
						let r = e.state.tr.setMeta("focus", { event: n }).setMeta("addToHistory", !1);
						return t.dispatch(r), !1;
					},
					blur: (t, n) => {
						e.isFocused = !1;
						let r = e.state.tr.setMeta("blur", { event: n }).setMeta("addToHistory", !1);
						return t.dispatch(r), !1;
					}
				} }
			})];
		}
	}), yh = q.create({
		name: "keymap",
		addKeyboardShortcuts() {
			let e = () => this.editor.commands.first(({ commands: e }) => [
				() => e.undoInputRule(),
				() => e.command(({ tr: t }) => {
					let { selection: n, doc: r } = t, { empty: i, $anchor: a } = n, { pos: o, parent: s } = a, c = a.parent.isTextblock && o > 0 ? t.doc.resolve(o - 1) : a, l = c.parent.type.spec.isolating, u = a.pos - a.parentOffset, d = l && c.parent.childCount === 1 ? u === a.pos : P.atStart(r).from === o;
					return !i || !s.type.isTextblock || s.textContent.length || !d || d && a.parent.type.name === "paragraph" ? !1 : e.clearNodes();
				}),
				() => e.deleteSelection(),
				() => e.joinBackward(),
				() => e.selectNodeBackward()
			]), t = () => this.editor.commands.first(({ commands: e }) => [
				() => e.deleteSelection(),
				() => e.deleteCurrentNode(),
				() => e.joinForward(),
				() => e.selectNodeForward()
			]), n = {
				Enter: () => this.editor.commands.first(({ commands: e }) => [
					() => e.newlineInCode(),
					() => e.createParagraphNear(),
					() => e.liftEmptyBlock(),
					() => e.splitBlock()
				]),
				"Mod-Enter": () => this.editor.commands.exitCode(),
				Backspace: e,
				"Mod-Backspace": e,
				"Shift-Backspace": e,
				Delete: t,
				"Mod-Delete": t,
				"Mod-a": () => this.editor.commands.selectAll()
			}, r = { ...n }, i = {
				...n,
				"Ctrl-h": e,
				"Alt-Backspace": e,
				"Ctrl-d": t,
				"Ctrl-Alt-Backspace": t,
				"Alt-Delete": t,
				"Alt-d": t,
				"Ctrl-a": () => this.editor.commands.selectTextblockStart(),
				"Ctrl-e": () => this.editor.commands.selectTextblockEnd()
			};
			return Dd() || Fd() ? i : r;
		},
		addProseMirrorPlugins() {
			return [new L({
				key: new R("clearDocument"),
				appendTransaction: (e, t, n) => {
					if (e.some((e) => e.getMeta("composition"))) return;
					let r = e.some((e) => e.docChanged) && !t.doc.eq(n.doc), i = e.some((e) => e.getMeta("preventClearDocument"));
					if (!r || i) return;
					let { empty: a, from: o, to: s } = t.selection, c = P.atStart(t.doc).from, l = P.atEnd(t.doc).to;
					if (a || o !== c || s !== l || !Tf(n.doc)) return;
					let u = n.tr, d = gd({
						state: n,
						transaction: u
					}), { commands: f } = new Dp({
						editor: this.editor,
						state: d
					});
					if (f.clearNodes(), u.steps.length) return u;
				}
			})];
		}
	}), bh = q.create({
		name: "paste",
		addProseMirrorPlugins() {
			return [new L({
				key: new R("tiptapPaste"),
				props: { handlePaste: (e, t, n) => {
					this.editor.emit("paste", {
						editor: this.editor,
						event: t,
						slice: n
					});
				} }
			})];
		}
	}), xh = q.create({
		name: "tabindex",
		addOptions() {
			return { value: void 0 };
		},
		addProseMirrorPlugins() {
			return [new L({
				key: new R("tabindex"),
				props: { attributes: () => !this.editor.isEditable && this.options.value === void 0 ? {} : { tabindex: this.options.value ?? "0" } }
			})];
		}
	}), Sh = q.create({
		name: "textDirection",
		addOptions() {
			return { direction: void 0 };
		},
		addGlobalAttributes() {
			if (!this.options.direction) return [];
			let { nodeExtensions: e } = Xd(this.extensions);
			return [{
				types: e.filter((e) => e.name !== "text").map((e) => e.name),
				attributes: { dir: {
					default: this.options.direction,
					parseHTML: (e) => {
						let t = e.getAttribute("dir");
						return t && (t === "ltr" || t === "rtl" || t === "auto") ? t : this.options.direction;
					},
					renderHTML: (e) => e.dir ? { dir: e.dir } : {}
				} }
			}];
		},
		addProseMirrorPlugins() {
			return [new L({
				key: new R("textDirection"),
				props: { attributes: () => {
					let e = this.options.direction;
					return e ? { dir: e } : {};
				} }
			})];
		}
	}), Ch = !1, wh = class e {
		constructor(e, t, n = !1, r = null) {
			this.currentNode = null, this.actualDepth = null, this.isBlock = n, this.resolvedPos = e, this.editor = t, this.currentNode = r;
		}
		get name() {
			return this.node.type.name;
		}
		get node() {
			return this.currentNode || this.resolvedPos.node();
		}
		get element() {
			return this.editor.view.domAtPos(this.pos).node;
		}
		get depth() {
			return this.actualDepth ?? this.resolvedPos.depth;
		}
		get pos() {
			return this.resolvedPos.pos;
		}
		get content() {
			return this.node.content;
		}
		set content(e) {
			let t = this.from, n = this.to;
			if (this.isBlock) {
				if (this.content.size === 0) {
					console.error(`You can\u2019t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`);
					return;
				}
				t = this.from + 1, n = this.to - 1;
			}
			this.editor.commands.insertContentAt({
				from: t,
				to: n
			}, e);
		}
		get attributes() {
			return this.node.attrs;
		}
		get textContent() {
			return this.node.textContent;
		}
		get size() {
			return this.node.nodeSize;
		}
		get from() {
			return this.isBlock ? this.pos : this.resolvedPos.start(this.resolvedPos.depth);
		}
		get range() {
			return {
				from: this.from,
				to: this.to
			};
		}
		get to() {
			return this.isBlock ? this.pos + this.size : this.resolvedPos.end(this.resolvedPos.depth) + +!this.node.isText;
		}
		get parent() {
			if (this.depth === 0) return null;
			let t = this.resolvedPos.start(this.resolvedPos.depth - 1), n = this.resolvedPos.doc.resolve(t);
			return new e(n, this.editor);
		}
		get before() {
			let t = this.resolvedPos.doc.resolve(this.from - (this.isBlock ? 1 : 2));
			return t.depth !== this.depth && (t = this.resolvedPos.doc.resolve(this.from - 3)), new e(t, this.editor);
		}
		get after() {
			let t = this.resolvedPos.doc.resolve(this.to + (this.isBlock ? 2 : 1));
			return t.depth !== this.depth && (t = this.resolvedPos.doc.resolve(this.to + 3)), new e(t, this.editor);
		}
		get children() {
			let t = [];
			return this.node.content.forEach((n, r) => {
				let i = n.isBlock && !n.isTextblock, a = n.isAtom && !n.isText, o = n.isInline, s = this.pos + r + +!a;
				if (s < 0 || s > this.resolvedPos.doc.nodeSize - 2) return;
				let c = this.resolvedPos.doc.resolve(s);
				if (!i && !o && c.depth <= this.depth) return;
				let l = new e(c, this.editor, i, i || o ? n : null);
				i && (l.actualDepth = this.depth + 1), t.push(l);
			}), t;
		}
		get firstChild() {
			return this.children[0] || null;
		}
		get lastChild() {
			let e = this.children;
			return e[e.length - 1] || null;
		}
		closest(e, t = {}) {
			let n = null, r = this.parent;
			for (; r && !n;) {
				if (r.node.type.name === e) if (Object.keys(t).length > 0) {
					let e = r.node.attrs, n = Object.keys(t);
					for (let r = 0; r < n.length; r += 1) {
						let i = n[r];
						if (e[i] !== t[i]) break;
					}
				} else n = r;
				r = r.parent;
			}
			return n;
		}
		querySelector(e, t = {}) {
			return this.querySelectorAll(e, t, !0)[0] || null;
		}
		querySelectorAll(e, t = {}, n = !1) {
			let r = [];
			if (!this.children || this.children.length === 0) return r;
			let i = Object.keys(t);
			return this.children.forEach((a) => {
				n && r.length > 0 || (a.node.type.name === e && i.every((e) => t[e] === a.node.attrs[e]) && r.push(a), !(n && r.length > 0) && (r = r.concat(a.querySelectorAll(e, t, n))));
			}), r;
		}
		setAttribute(e) {
			let { tr: t } = this.editor.state;
			t.setNodeMarkup(this.from, void 0, {
				...this.node.attrs,
				...e
			}), this.editor.view.dispatch(t);
		}
	}, Th = ".ProseMirror {\n  position: relative;\n}\n\n.ProseMirror {\n  word-wrap: break-word;\n  white-space: pre-wrap;\n  white-space: break-spaces;\n  -webkit-font-variant-ligatures: none;\n  font-variant-ligatures: none;\n  font-feature-settings: \"liga\" 0; /* the above doesn't seem to work in Edge */\n}\n\n.ProseMirror [contenteditable=\"false\"] {\n  white-space: normal;\n}\n\n.ProseMirror [contenteditable=\"false\"] [contenteditable=\"true\"] {\n  white-space: pre-wrap;\n}\n\n.ProseMirror pre {\n  white-space: pre-wrap;\n}\n\nimg.ProseMirror-separator {\n  display: inline !important;\n  border: none !important;\n  margin: 0 !important;\n  width: 0 !important;\n  height: 0 !important;\n}\n\n.ProseMirror-gapcursor {\n  display: none;\n  pointer-events: none;\n  position: absolute;\n  margin: 0;\n}\n\n.ProseMirror-gapcursor:after {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: -2px;\n  width: 20px;\n  border-top: 1px solid black;\n  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;\n}\n\n@keyframes ProseMirror-cursor-blink {\n  to {\n    visibility: hidden;\n  }\n}\n\n.ProseMirror-hideselection *::selection {\n  background: transparent;\n}\n\n.ProseMirror-hideselection *::-moz-selection {\n  background: transparent;\n}\n\n.ProseMirror-hideselection * {\n  caret-color: transparent;\n}\n\n.ProseMirror-focused .ProseMirror-gapcursor {\n  display: block;\n}", Eh = class extends Zm {
		constructor(e = {}) {
			super(), this.css = null, this.className = "tiptap", this.editorView = null, this.isFocused = !1, this.destroyed = !1, this.isInitialized = !1, this.extensionStorage = {}, this.instanceId = Math.random().toString(36).slice(2, 9), this.hasWarnedStaleDecorationRead = !1, this.options = {
				element: typeof document < "u" ? document.createElement("div") : null,
				content: "",
				injectCSS: !0,
				injectNonce: void 0,
				extensions: [],
				autofocus: !1,
				editable: !0,
				textDirection: void 0,
				editorProps: {},
				parseOptions: {},
				coreExtensionOptions: {},
				enableInputRules: !0,
				enablePasteRules: !0,
				enableCoreExtensions: !0,
				enableContentCheck: !1,
				emitContentError: !1,
				onBeforeCreate: () => null,
				onCreate: () => null,
				onMount: () => null,
				onUnmount: () => null,
				onUpdate: () => null,
				onSelectionUpdate: () => null,
				onTransaction: () => null,
				onFocus: () => null,
				onBlur: () => null,
				onDestroy: () => null,
				onContentError: ({ error: e }) => {
					throw e;
				},
				onPaste: () => null,
				onDrop: () => null,
				onDelete: () => null,
				enableExtensionDispatchTransaction: !0
			}, this.isCapturingTransaction = !1, this.capturedTransaction = null, this.utils = {
				getUpdatedPosition: Df,
				createMappablePosition: Of
			}, this.setOptions(e), this.createExtensionManager(), this.createCommandManager(), this.createSchema(), this.on("beforeCreate", this.options.onBeforeCreate), this.emit("beforeCreate", { editor: this }), this.on("mount", this.options.onMount), this.on("unmount", this.options.onUnmount), this.on("contentError", this.options.onContentError), this.on("create", this.options.onCreate), this.on("update", this.options.onUpdate), this.on("selectionUpdate", this.options.onSelectionUpdate), this.on("transaction", this.options.onTransaction), this.on("focus", this.options.onFocus), this.on("blur", this.options.onBlur), this.on("destroy", this.options.onDestroy), this.on("drop", ({ event: e, slice: t, moved: n }) => this.options.onDrop(e, t, n)), this.on("paste", ({ event: e, slice: t }) => this.options.onPaste(e, t)), this.on("delete", this.options.onDelete);
			let t = this.createDoc();
			if (!this.editorState) {
				let e = Td(t, this.options.autofocus);
				this.editorState = Ma.create({
					doc: t,
					schema: this.schema,
					selection: e || void 0
				});
			}
			yp(this.schema), this.options.element && this.mount(this.options.element);
		}
		mount(e) {
			if (typeof document > "u") throw Error("[tiptap error]: The editor cannot be mounted because there is no 'document' defined in this environment.");
			this.createView(e), this.emit("mount", { editor: this }), this.css && !document.head.contains(this.css) && document.head.appendChild(this.css), window.setTimeout(() => {
				this.isDestroyed || (this.options.autofocus !== !1 && this.options.autofocus !== null && this.commands.focus(this.options.autofocus), this.emit("create", { editor: this }), this.isInitialized = !0);
			}, 0);
		}
		unmount() {
			if (this.editorView) {
				this.editorState = this.editorView.state;
				let e = this.editorView.dom;
				e?.editor && delete e.editor, this.editorView.destroy();
			}
			if (this.editorView = null, this.isInitialized = !1, this.css && !document.querySelectorAll(`.${this.className}`).length) try {
				typeof this.css.remove == "function" ? this.css.remove() : this.css.parentNode && this.css.parentNode.removeChild(this.css);
			} catch (e) {
				console.warn("Failed to remove CSS element:", e);
			}
			this.css = null, this.emit("unmount", { editor: this });
		}
		get storage() {
			return this.extensionStorage;
		}
		get commands() {
			return this.commandManager.commands;
		}
		chain() {
			return this.commandManager.chain();
		}
		can() {
			return this.commandManager.can();
		}
		injectCSS() {
			this.options.injectCSS && typeof document < "u" && (this.css = ep(Th, this.options.injectNonce));
		}
		setOptions(e = {}) {
			this.options = {
				...this.options,
				...e
			}, !(!this.editorView || !this.state || this.isDestroyed) && (this.options.editorProps && this.view.setProps(this.options.editorProps), this.view.updateState(this.state));
		}
		setEditable(e, t = !0) {
			this.setOptions({ editable: e }), t && this.emit("update", {
				editor: this,
				transaction: this.state.tr,
				appendedTransactions: []
			});
		}
		get isEditable() {
			return this.options.editable && this.view && this.view.editable;
		}
		get view() {
			return this.editorView ? this.editorView : new Proxy({
				state: this.editorState,
				updateState: (e) => {
					this.editorState = e;
				},
				dispatch: (e) => {
					this.dispatchTransaction(e);
				},
				composing: !1,
				dragging: null,
				editable: !0,
				isDestroyed: !1
			}, { get: (e, t) => {
				if (this.editorView) return this.editorView[t];
				if (t === "state") return this.editorState;
				if (t in e) return Reflect.get(e, t);
				throw Error(`[tiptap error]: The editor view is not available. Cannot access view['${t}']. The editor may not be mounted yet.`);
			} });
		}
		get state() {
			return Qm && !this.hasWarnedStaleDecorationRead && Ff(this) && (this.hasWarnedStaleDecorationRead = !0, console.warn("[tiptap warn]: `editor.state` was read while decoration `create()` was running. It returns the pre-transaction document. Use the `state` argument passed to `create()` instead. Helpers like `editor.isActive()` read `editor.state` too, so pass `state` to their standalone versions instead of calling them on the editor.")), this.editorView && (this.editorState = this.view.state), this.editorState;
		}
		registerPlugin(e, t) {
			let n = Jd(t) ? t(e, [...this.state.plugins]) : [...this.state.plugins, e], r = this.state.reconfigure({ plugins: n });
			return this.view.updateState(r), r;
		}
		unregisterPlugin(e) {
			if (this.isDestroyed) return;
			let t = this.state.plugins, n = t;
			if ([].concat(e).forEach((e) => {
				let t = typeof e == "string" ? `${e}$` : e.key;
				n = n.filter((e) => !e.key.startsWith(t));
			}), t.length === n.length) return;
			let r = this.state.reconfigure({ plugins: n });
			return this.view.updateState(r), r;
		}
		createExtensionManager() {
			let e = [...this.options.enableCoreExtensions ? [
				gh,
				fh.configure({ blockSeparator: this.options.coreExtensionOptions?.clipboardTextSerializer?.blockSeparator }),
				ph,
				vh,
				yh,
				xh.configure({ value: this.options.coreExtensionOptions?.tabindex?.value }),
				hh,
				bh,
				mh,
				Sh.configure({ direction: this.options.textDirection })
			].filter((e) => typeof this.options.enableCoreExtensions != "object" || this.options.enableCoreExtensions[e.name] !== !1) : [], ...this.options.extensions].filter((e) => [
				"extension",
				"node",
				"mark"
			].includes(e?.type));
			this.extensionManager = new uh(e, this);
		}
		createCommandManager() {
			this.commandManager = new Dp({ editor: this });
		}
		createSchema() {
			this.schema = this.extensionManager.schema;
		}
		createDoc() {
			let e;
			try {
				e = Bd(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: this.options.enableContentCheck });
			} catch (e) {
				if (!(e instanceof Error) || !["[tiptap error]: Invalid JSON content", "[tiptap error]: Invalid HTML content"].includes(e.message)) throw e;
				let t = Bd(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: !1 });
				return this.editorState = Ma.create({
					doc: t,
					schema: this.schema,
					selection: Td(t, this.options.autofocus) || void 0
				}), this.emit("contentError", {
					editor: this,
					error: e,
					disableCollaboration: () => {
						"collaboration" in this.storage && typeof this.storage.collaboration == "object" && this.storage.collaboration && (this.storage.collaboration.isDisabled = !0), this.options.extensions = this.options.extensions.filter((e) => e.name !== "collaboration"), this.createExtensionManager();
					}
				}), this.editorState.doc;
			}
			return e;
		}
		createView(e) {
			let { editorProps: t, enableExtensionDispatchTransaction: n } = this.options, r = t.dispatchTransaction || this.dispatchTransaction.bind(this), i = n ? this.extensionManager.dispatchTransaction(r) : r, a = t.transformPastedHTML, o = this.extensionManager.transformPastedHTML(a);
			this.editorView = new Qu(e, {
				...t,
				attributes: {
					role: "textbox",
					...t?.attributes
				},
				dispatchTransaction: i,
				transformPastedHTML: o,
				state: this.editorState,
				markViews: this.extensionManager.markViews,
				nodeViews: this.extensionManager.nodeViews
			});
			let s = this.state.reconfigure({ plugins: this.extensionManager.plugins });
			this.view.updateState(s), this.prependClass(), this.injectCSS();
			let c = this.view.dom;
			c.editor = this;
		}
		createNodeViews() {
			this.view.isDestroyed || this.view.setProps({
				markViews: this.extensionManager.markViews,
				nodeViews: this.extensionManager.nodeViews
			});
		}
		prependClass() {
			this.view.dom.className = `${this.className} ${this.view.dom.className}`;
		}
		captureTransaction(e) {
			this.isCapturingTransaction = !0, e(), this.isCapturingTransaction = !1;
			let t = this.capturedTransaction;
			return this.capturedTransaction = null, t;
		}
		dispatchTransaction(e) {
			if (this.view.isDestroyed) return;
			if (this.isCapturingTransaction) {
				if (!this.capturedTransaction) {
					this.capturedTransaction = e;
					return;
				}
				e.steps.forEach((e) => this.capturedTransaction?.step(e));
				return;
			}
			let { state: t, transactions: n } = this.state.applyTransaction(e), r = !this.state.selection.eq(t.selection), i = n.includes(e), a = this.state;
			if (this.emit("beforeTransaction", {
				editor: this,
				transaction: e,
				nextState: t
			}), !i) return;
			this.view.updateState(t), this.emit("transaction", {
				editor: this,
				transaction: e,
				appendedTransactions: n.slice(1)
			}), r && this.emit("selectionUpdate", {
				editor: this,
				transaction: e
			});
			let o = n.findLast((e) => e.getMeta("focus") || e.getMeta("blur")), s = o?.getMeta("focus"), c = o?.getMeta("blur");
			s && this.emit("focus", {
				editor: this,
				event: s.event,
				transaction: o
			}), c && this.emit("blur", {
				editor: this,
				event: c.event,
				transaction: o
			}), !(e.getMeta("preventUpdate") || !n.some((e) => e.docChanged) || a.doc.eq(t.doc)) && this.emit("update", {
				editor: this,
				transaction: e,
				appendedTransactions: n.slice(1)
			});
		}
		getAttributes(e) {
			return mf(this.state, e);
		}
		isActive(e, t) {
			let n = typeof e == "string" ? e : null, r = typeof e == "string" ? t : e;
			return Sf(this.state, n, r);
		}
		getJSON() {
			return this.state.doc.toJSON();
		}
		getHTML() {
			return qd(this.state.doc.content, this.schema);
		}
		getText(e) {
			let { blockSeparator: t = "\n\n", textSerializers: n = {} } = e || {};
			return df(this.state.doc, {
				blockSeparator: t,
				textSerializers: {
					...ff(this.schema),
					...n
				}
			});
		}
		get isEmpty() {
			return Tf(this.state.doc);
		}
		destroy() {
			this.destroyed || (this.destroyed = !0, this.emit("destroy"), this.unmount(), this.removeAllListeners(), this.extensionManager.destroy(), this.extensionManager = null, this.schema = null, this.commandManager = null, this.extensionStorage = {});
		}
		get isDestroyed() {
			return this.editorView?.isDestroyed ?? !0;
		}
		$node(e, t) {
			return this.$doc?.querySelector(e, t) || null;
		}
		$nodes(e, t) {
			return this.$doc?.querySelectorAll(e, t) || null;
		}
		$pos(e) {
			let t = this.state.doc.resolve(e), n = e > 0 && t.nodeAfter && !t.nodeAfter.isText && t.nodeAfter.isAtom ? t.nodeAfter : null;
			return new wh(t, this, !1, n);
		}
		get $doc() {
			return this.$pos(0);
		}
	}, Dh = class e extends ih {
		constructor() {
			super(...arguments), this.type = "node";
		}
		static create(t = {}) {
			let n = typeof t == "function" ? t() : t;
			return new e(n);
		}
		configure(e) {
			return super.configure(e);
		}
		extend(e) {
			let t = typeof e == "function" ? e() : e;
			return super.extend(t);
		}
	};
}));
//#endregion
//#region ../../node_modules/prosemirror-dropcursor/dist/index.js
function Oh(e = {}) {
	return new L({ view(t) {
		return new kh(t, e);
	} });
}
var kh, Ah = S((() => {
	Pa(), ua(), kh = class {
		constructor(e, t) {
			this.editorView = e, this.cursorPos = null, this.element = null, this.timeout = -1, this.lastDragEvent = null, this.width = t.width ?? 1, this.color = t.color === !1 ? void 0 : t.color || "black", this.class = t.class, this.handlers = [
				"dragover",
				"dragend",
				"drop",
				"dragleave"
			].map((t) => {
				let n = (e) => {
					this[t](e);
				};
				return e.dom.addEventListener(t, n), {
					name: t,
					handler: n
				};
			});
		}
		destroy() {
			this.handlers.forEach(({ name: e, handler: t }) => this.editorView.dom.removeEventListener(e, t));
		}
		update(e, t) {
			if (this.cursorPos != null && t.doc != e.state.doc) if (this.lastDragEvent) {
				let e = this.computeTarget(this.lastDragEvent);
				e == this.cursorPos ? this.updateOverlay() : this.setCursor(e);
			} else this.updateOverlay();
		}
		setCursor(e) {
			e != this.cursorPos && (this.cursorPos = e, e == null ? (this.element.parentNode.removeChild(this.element), this.element = null) : this.updateOverlay());
		}
		updateOverlay() {
			let e = this.editorView.state.doc.resolve(this.cursorPos), t = !e.parent.inlineContent, n, r = this.editorView.dom, i = r.getBoundingClientRect(), a = i.width / r.offsetWidth, o = i.height / r.offsetHeight;
			if (t) {
				let t = e.nodeBefore, r = e.nodeAfter;
				if (t || r) {
					let e = this.editorView.nodeDOM(this.cursorPos - (t ? t.nodeSize : 0));
					if (e) {
						let i = e.getBoundingClientRect(), a = t ? i.bottom : i.top;
						t && r && (a = (a + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2);
						let s = this.width / 2 * o;
						n = {
							left: i.left,
							right: i.right,
							top: a - s,
							bottom: a + s
						};
					}
				}
			}
			if (!n) {
				let e = this.editorView.coordsAtPos(this.cursorPos), t = this.width / 2 * a;
				n = {
					left: e.left - t,
					right: e.left + t,
					top: e.top,
					bottom: e.bottom
				};
			}
			let s = this.editorView.dom.offsetParent;
			this.element || (this.element = s.appendChild(document.createElement("div")), this.class && (this.element.className = this.class), this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none;", this.color && (this.element.style.backgroundColor = this.color)), this.element.classList.toggle("prosemirror-dropcursor-block", t), this.element.classList.toggle("prosemirror-dropcursor-inline", !t);
			let c, l;
			if (!s || s == document.body && getComputedStyle(s).position == "static") c = -pageXOffset, l = -pageYOffset;
			else {
				let e = s.getBoundingClientRect(), t = e.width / s.offsetWidth, n = e.height / s.offsetHeight;
				c = e.left - s.scrollLeft * t, l = e.top - s.scrollTop * n;
			}
			this.element.style.left = (n.left - c) / a + "px", this.element.style.top = (n.top - l) / o + "px", this.element.style.width = (n.right - n.left) / a + "px", this.element.style.height = (n.bottom - n.top) / o + "px";
		}
		scheduleRemoval(e) {
			clearTimeout(this.timeout), this.timeout = setTimeout(() => this.setCursor(null), e);
		}
		computeTarget(e) {
			let t = this.editorView.posAtCoords({
				left: e.clientX,
				top: e.clientY
			}), n = t && t.inside >= 0 && this.editorView.state.doc.nodeAt(t.inside), r = n && n.type.spec.disableDropCursor, i = typeof r == "function" ? r(this.editorView, t, e) : r;
			if (!t || i) return null;
			let a = t.pos;
			if (this.editorView.dragging && this.editorView.dragging.slice) {
				let e = Ei(this.editorView.state.doc, a, this.editorView.dragging.slice);
				e != null && (a = e);
			}
			return a;
		}
		dragover(e) {
			if (!this.editorView.editable) return;
			this.lastDragEvent = e;
			let t = this.computeTarget(e);
			t != null && (this.setCursor(t), this.scheduleRemoval(5e3));
		}
		dragend() {
			this.scheduleRemoval(20);
		}
		drop() {
			this.scheduleRemoval(20);
		}
		dragleave(e) {
			this.editorView.dom.contains(e.relatedTarget) || this.setCursor(null);
		}
	};
})), jh = S((() => {
	Ah();
}));
//#endregion
//#region ../../node_modules/prosemirror-gapcursor/dist/index.js
function Mh(e) {
	return e.isAtom || e.spec.isolating || e.spec.createGapCursor;
}
function Nh(e) {
	for (let t = e.depth; t >= 0; t--) {
		let n = e.index(t), r = e.node(t);
		if (n == 0) {
			if (r.type.spec.isolating) return !0;
			continue;
		}
		for (let e = r.child(n - 1);; e = e.lastChild) {
			if (e.childCount == 0 && !e.inlineContent || Mh(e.type)) return !0;
			if (e.inlineContent) return !1;
		}
	}
	return !0;
}
function Ph(e) {
	for (let t = e.depth; t >= 0; t--) {
		let n = e.indexAfter(t), r = e.node(t);
		if (n == r.childCount) {
			if (r.type.spec.isolating) return !0;
			continue;
		}
		for (let e = r.child(n);; e = e.firstChild) {
			if (e.childCount == 0 && !e.inlineContent || Mh(e.type)) return !0;
			if (e.inlineContent) return !1;
		}
	}
	return !0;
}
function Fh() {
	return new L({ props: {
		decorations: zh,
		createSelectionBetween(e, t, n) {
			return t.pos == n.pos && Bh.valid(n) ? new Bh(n) : null;
		},
		handleClick: Lh,
		handleKeyDown: Hh,
		handleDOMEvents: { beforeinput: Rh }
	} });
}
function Ih(e, t) {
	let n = e == "vert" ? t > 0 ? "down" : "up" : t > 0 ? "right" : "left";
	return function(e, r, i) {
		let a = e.selection, o = t > 0 ? a.$to : a.$from, s = a.empty;
		if (a instanceof F) {
			if (!i.endOfTextblock(n) || o.depth == 0) return !1;
			s = !1, o = e.doc.resolve(t > 0 ? o.after() : o.before());
		}
		let c = Bh.findGapCursorFrom(o, t, s);
		return c ? (r && r(e.tr.setSelection(new Bh(c))), !0) : !1;
	};
}
function Lh(e, t, n) {
	if (!e || !e.editable) return !1;
	let r = e.state.doc.resolve(t);
	if (!Bh.valid(r)) return !1;
	let i = e.posAtCoords({
		left: n.clientX,
		top: n.clientY
	});
	return i && i.inside > -1 && I.isSelectable(e.state.doc.nodeAt(i.inside)) ? !1 : (e.dispatch(e.state.tr.setSelection(new Bh(r))), !0);
}
function Rh(e, t) {
	if (t.inputType != "insertCompositionText" || !(e.state.selection instanceof Bh)) return !1;
	let { $from: n } = e.state.selection, r = n.parent.contentMatchAt(n.index()).findWrapping(e.state.schema.nodes.text);
	if (!r) return !1;
	let i = j.empty;
	for (let e = r.length - 1; e >= 0; e--) i = j.from(r[e].createAndFill(null, i));
	let a = e.state.tr.replace(n.pos, n.pos, new N(i, 0, 0));
	return a.setSelection(F.near(a.doc.resolve(n.pos + 1))), e.dispatch(a), !1;
}
function zh(e) {
	if (!(e.selection instanceof Bh)) return null;
	let t = document.createElement("div");
	return t.className = "ProseMirror-gapcursor", V.create(e.doc, [zu.widget(e.selection.head, t, { key: "gapcursor" })]);
}
var Bh, Vh, Hh, Uh = S((() => {
	md(), Pa(), Xr(), $u(), Bh = class e extends P {
		constructor(e) {
			super(e, e);
		}
		map(t, n) {
			let r = t.resolve(n.map(this.head));
			return e.valid(r) ? new e(r) : P.near(r);
		}
		content() {
			return N.empty;
		}
		eq(t) {
			return t instanceof e && t.head == this.head;
		}
		toJSON() {
			return {
				type: "gapcursor",
				pos: this.head
			};
		}
		static fromJSON(t, n) {
			if (typeof n.pos != "number") throw RangeError("Invalid input for GapCursor.fromJSON");
			return new e(t.resolve(n.pos));
		}
		getBookmark() {
			return new Vh(this.anchor);
		}
		static valid(e) {
			let t = e.parent;
			if (t.inlineContent || !Nh(e) || !Ph(e)) return !1;
			let n = t.type.spec.allowGapCursor;
			if (n != null) return n;
			let r = t.contentMatchAt(e.index()).defaultType;
			return r && r.isTextblock;
		}
		static findGapCursorFrom(t, n, r = !1) {
			search: for (;;) {
				if (!r && e.valid(t)) return t;
				let i = t.pos, a = null;
				for (let r = t.depth;; r--) {
					let o = t.node(r);
					if (n > 0 ? t.indexAfter(r) < o.childCount : t.index(r) > 0) {
						a = o.child(n > 0 ? t.indexAfter(r) : t.index(r) - 1);
						break;
					}
					if (r == 0) return null;
					i += n;
					let s = t.doc.resolve(i);
					if (e.valid(s)) return s;
				}
				for (;;) {
					let o = n > 0 ? a.firstChild : a.lastChild;
					if (!o) {
						if (a.isAtom && !a.isText && !I.isSelectable(a)) {
							t = t.doc.resolve(i + a.nodeSize * n), r = !1;
							continue search;
						}
						break;
					}
					a = o, i += n;
					let s = t.doc.resolve(i);
					if (e.valid(s)) return s;
				}
				return null;
			}
		}
	}, Bh.prototype.visible = !1, Bh.findFrom = Bh.findGapCursorFrom, P.jsonID("gapcursor", Bh), Vh = class e {
		constructor(e) {
			this.pos = e;
		}
		map(t) {
			return new e(t.map(this.pos));
		}
		resolve(e) {
			let t = e.resolve(this.pos);
			return Bh.valid(t) ? new Bh(t) : P.near(t);
		}
	}, Hh = dd({
		ArrowLeft: Ih("horiz", -1),
		ArrowRight: Ih("horiz", 1),
		ArrowUp: Ih("vert", -1),
		ArrowDown: Ih("vert", 1)
	});
})), Wh = S((() => {
	Uh();
})), Gh, Y, Kh, qh, Jh = S((() => {
	Gh = 200, Y = function() {}, Y.prototype.append = function(e) {
		return e.length ? (e = Y.from(e), !this.length && e || e.length < Gh && this.leafAppend(e) || this.length < Gh && e.leafPrepend(this) || this.appendInner(e)) : this;
	}, Y.prototype.prepend = function(e) {
		return e.length ? Y.from(e).append(this) : this;
	}, Y.prototype.appendInner = function(e) {
		return new qh(this, e);
	}, Y.prototype.slice = function(e, t) {
		return e === void 0 && (e = 0), t === void 0 && (t = this.length), e >= t ? Y.empty : this.sliceInner(Math.max(0, e), Math.min(this.length, t));
	}, Y.prototype.get = function(e) {
		if (!(e < 0 || e >= this.length)) return this.getInner(e);
	}, Y.prototype.forEach = function(e, t, n) {
		t === void 0 && (t = 0), n === void 0 && (n = this.length), t <= n ? this.forEachInner(e, t, n, 0) : this.forEachInvertedInner(e, t, n, 0);
	}, Y.prototype.map = function(e, t, n) {
		t === void 0 && (t = 0), n === void 0 && (n = this.length);
		var r = [];
		return this.forEach(function(t, n) {
			return r.push(e(t, n));
		}, t, n), r;
	}, Y.from = function(e) {
		return e instanceof Y ? e : e && e.length ? new Kh(e) : Y.empty;
	}, Kh = /* @__PURE__ */ function(e) {
		function t(t) {
			e.call(this), this.values = t;
		}
		e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t;
		var n = {
			length: { configurable: !0 },
			depth: { configurable: !0 }
		};
		return t.prototype.flatten = function() {
			return this.values;
		}, t.prototype.sliceInner = function(e, n) {
			return e == 0 && n == this.length ? this : new t(this.values.slice(e, n));
		}, t.prototype.getInner = function(e) {
			return this.values[e];
		}, t.prototype.forEachInner = function(e, t, n, r) {
			for (var i = t; i < n; i++) if (e(this.values[i], r + i) === !1) return !1;
		}, t.prototype.forEachInvertedInner = function(e, t, n, r) {
			for (var i = t - 1; i >= n; i--) if (e(this.values[i], r + i) === !1) return !1;
		}, t.prototype.leafAppend = function(e) {
			if (this.length + e.length <= Gh) return new t(this.values.concat(e.flatten()));
		}, t.prototype.leafPrepend = function(e) {
			if (this.length + e.length <= Gh) return new t(e.flatten().concat(this.values));
		}, n.length.get = function() {
			return this.values.length;
		}, n.depth.get = function() {
			return 0;
		}, Object.defineProperties(t.prototype, n), t;
	}(Y), Y.empty = new Kh([]), qh = /* @__PURE__ */ function(e) {
		function t(t, n) {
			e.call(this), this.left = t, this.right = n, this.length = t.length + n.length, this.depth = Math.max(t.depth, n.depth) + 1;
		}
		return e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t, t.prototype.flatten = function() {
			return this.left.flatten().concat(this.right.flatten());
		}, t.prototype.getInner = function(e) {
			return e < this.left.length ? this.left.get(e) : this.right.get(e - this.left.length);
		}, t.prototype.forEachInner = function(e, t, n, r) {
			var i = this.left.length;
			if (t < i && this.left.forEachInner(e, t, Math.min(n, i), r) === !1 || n > i && this.right.forEachInner(e, Math.max(t - i, 0), Math.min(this.length, n) - i, r + i) === !1) return !1;
		}, t.prototype.forEachInvertedInner = function(e, t, n, r) {
			var i = this.left.length;
			if (t > i && this.right.forEachInvertedInner(e, t - i, Math.max(n, i) - i, r + i) === !1 || n < i && this.left.forEachInvertedInner(e, Math.min(t, i), n, r) === !1) return !1;
		}, t.prototype.sliceInner = function(e, t) {
			if (e == 0 && t == this.length) return this;
			var n = this.left.length;
			return t <= n ? this.left.slice(e, t) : e >= n ? this.right.slice(e - n, t - n) : this.left.slice(e, n).append(this.right.slice(0, t - n));
		}, t.prototype.leafAppend = function(e) {
			var n = this.right.leafAppend(e);
			if (n) return new t(this.left, n);
		}, t.prototype.leafPrepend = function(e) {
			var n = this.left.leafPrepend(e);
			if (n) return new t(n, this.right);
		}, t.prototype.appendInner = function(e) {
			return this.left.depth >= Math.max(this.right.depth, e.depth) + 1 ? new t(this.left, new t(this.right, e)) : new t(this, e);
		}, t;
	}(Y);
}));
//#endregion
//#region ../../node_modules/prosemirror-history/dist/index.js
function Yh(e, t) {
	let n;
	return e.forEach((e, r) => {
		if (e.selection && t-- == 0) return n = r, !1;
	}), e.slice(n);
}
function Xh(e, t, n, r) {
	let i = n.getMeta(dg), a;
	if (i) return i.historyState;
	n.getMeta(fg) && (e = new sg(e.done, e.undone, null, 0, -1));
	let o = n.getMeta("appendedTransaction");
	if (n.steps.length == 0) return e;
	if (o && o.getMeta(dg)) return o.getMeta(dg).redo ? new sg(e.done.addTransform(n, void 0, r, tg(t)), e.undone, Qh(n.mapping.maps), e.prevTime, e.prevComposition) : new sg(e.done, e.undone.addTransform(n, void 0, r, tg(t)), null, e.prevTime, e.prevComposition);
	if (n.getMeta("addToHistory") !== !1 && !(o && o.getMeta("addToHistory") === !1)) {
		let i = n.getMeta("composition"), a = e.prevTime == 0 || !o && e.prevComposition != i && (e.prevTime < (n.time || 0) - r.newGroupDelay || !Zh(n, e.prevRanges)), s = o ? $h(e.prevRanges, n.mapping) : Qh(n.mapping.maps);
		return new sg(e.done.addTransform(n, a ? t.selection.getBookmark() : void 0, r, tg(t)), ag.empty, s, n.time, i ?? e.prevComposition);
	}
	return (a = n.getMeta("rebased")) ? new sg(e.done.rebased(n, a), e.undone.rebased(n, a), $h(e.prevRanges, n.mapping), e.prevTime, e.prevComposition) : new sg(e.done.addMaps(n.mapping.maps), e.undone.addMaps(n.mapping.maps), $h(e.prevRanges, n.mapping), e.prevTime, e.prevComposition);
}
function Zh(e, t) {
	if (!t) return !1;
	if (!e.docChanged) return !0;
	let n = !1;
	return e.mapping.maps[0].forEach((e, r) => {
		for (let i = 0; i < t.length; i += 2) e <= t[i + 1] && r >= t[i] && (n = !0);
	}), n;
}
function Qh(e) {
	let t = [];
	for (let n = e.length - 1; n >= 0 && t.length == 0; n--) e[n].forEach((e, n, r, i) => t.push(r, i));
	return t;
}
function $h(e, t) {
	if (!e) return null;
	let n = [];
	for (let r = 0; r < e.length; r += 2) {
		let i = t.map(e[r], 1), a = t.map(e[r + 1], -1);
		i <= a && n.push(i, a);
	}
	return n;
}
function eg(e, t, n) {
	let r = tg(t), i = dg.get(t).spec.config, a = (n ? e.undone : e.done).popEvent(t, r);
	if (!a) return null;
	let o = a.selection.resolve(a.transform.doc), s = (n ? e.done : e.undone).addTransform(a.transform, t.selection.getBookmark(), i, r), c = new sg(n ? s : a.remaining, n ? a.remaining : s, null, 0, -1);
	return a.transform.setSelection(o).setMeta(dg, {
		redo: n,
		historyState: c
	});
}
function tg(e) {
	let t = e.plugins;
	if (ug != t) {
		lg = !1, ug = t;
		for (let e = 0; e < t.length; e++) if (t[e].spec.historyPreserveItems) {
			lg = !0;
			break;
		}
	}
	return lg;
}
function ng(e = {}) {
	return e = {
		depth: e.depth || 100,
		newGroupDelay: e.newGroupDelay || 500
	}, new L({
		key: dg,
		state: {
			init() {
				return new sg(ag.empty, ag.empty, null, 0, -1);
			},
			apply(t, n, r) {
				return Xh(n, r, t, e);
			}
		},
		config: e,
		props: { handleDOMEvents: { beforeinput(e, t) {
			let n = t.inputType, r = n == "historyUndo" ? pg : n == "historyRedo" ? mg : null;
			return !r || !e.editable ? !1 : (t.preventDefault(), r(e.state, e.dispatch));
		} } }
	});
}
function rg(e, t) {
	return (n, r) => {
		let i = dg.getState(n);
		if (!i || (e ? i.undone : i.done).eventCount == 0) return !1;
		if (r) {
			let a = eg(i, n, e);
			a && r(t ? a.scrollIntoView() : a);
		}
		return !0;
	};
}
var ig, ag, og, sg, cg, lg, ug, dg, fg, pg, mg, hg = S((() => {
	Jh(), ua(), Pa(), ig = 500, ag = class e {
		constructor(e, t) {
			this.items = e, this.eventCount = t;
		}
		popEvent(t, n) {
			if (this.eventCount == 0) return null;
			let r = this.items.length;
			for (;; r--) if (this.items.get(r - 1).selection) {
				--r;
				break;
			}
			let i, a;
			n && (i = this.remapping(r, this.items.length), a = i.maps.length);
			let o = t.tr, s, c, l = [], u = [];
			return this.items.forEach((t, n) => {
				if (!t.step) {
					i || (i = this.remapping(r, n + 1), a = i.maps.length), a--, u.push(t);
					return;
				}
				if (i) {
					u.push(new og(t.map));
					let e = t.step.map(i.slice(a)), n;
					e && o.maybeStep(e).doc && (n = o.mapping.maps[o.mapping.maps.length - 1], l.push(new og(n, void 0, void 0, l.length + u.length))), a--, n && i.appendMap(n, a);
				} else o.maybeStep(t.step);
				if (t.selection) return s = i ? t.selection.map(i.slice(a)) : t.selection, c = new e(this.items.slice(0, r).append(u.reverse().concat(l)), this.eventCount - 1), !1;
			}, this.items.length, 0), {
				remaining: c,
				transform: o,
				selection: s
			};
		}
		addTransform(t, n, r, i) {
			let a = [], o = this.eventCount, s = this.items, c = !i && s.length ? s.get(s.length - 1) : null;
			for (let e = 0; e < t.steps.length; e++) {
				let r = t.steps[e].invert(t.docs[e]), l = new og(t.mapping.maps[e], r, n), u;
				(u = c && c.merge(l)) && (l = u, e ? a.pop() : s = s.slice(0, s.length - 1)), a.push(l), n &&= (o++, void 0), i || (c = l);
			}
			let l = o - r.depth;
			return l > cg && (s = Yh(s, l), o -= l), new e(s.append(a), o);
		}
		remapping(e, t) {
			let n = new Yi();
			return this.items.forEach((t, r) => {
				let i = t.mirrorOffset != null && r - t.mirrorOffset >= e ? n.maps.length - t.mirrorOffset : void 0;
				n.appendMap(t.map, i);
			}, e, t), n;
		}
		addMaps(t) {
			return this.eventCount == 0 ? this : new e(this.items.append(t.map((e) => new og(e))), this.eventCount);
		}
		rebased(t, n) {
			if (!this.eventCount) return this;
			let r = [], i = Math.max(0, this.items.length - n), a = t.mapping, o = t.steps.length, s = this.eventCount;
			this.items.forEach((e) => {
				e.selection && s--;
			}, i);
			let c = n;
			this.items.forEach((e) => {
				let n = a.getMirror(--c);
				if (n == null) return;
				o = Math.min(o, n);
				let i = a.maps[n];
				if (e.step) {
					let o = t.steps[n].invert(t.docs[n]), l = e.selection && e.selection.map(a.slice(c + 1, n));
					l && s++, r.push(new og(i, o, l));
				} else r.push(new og(i));
			}, i);
			let l = [];
			for (let e = n; e < o; e++) l.push(new og(a.maps[e]));
			let u = this.items.slice(0, i).append(l).append(r), d = new e(u, s);
			return d.emptyItemCount() > ig && (d = d.compress(this.items.length - r.length)), d;
		}
		emptyItemCount() {
			let e = 0;
			return this.items.forEach((t) => {
				t.step || e++;
			}), e;
		}
		compress(t = this.items.length) {
			let n = this.remapping(0, t), r = n.maps.length, i = [], a = 0;
			return this.items.forEach((e, o) => {
				if (o >= t) i.push(e), e.selection && a++;
				else if (e.step) {
					let t = e.step.map(n.slice(r)), o = t && t.getMap();
					if (r--, o && n.appendMap(o, r), t) {
						let s = e.selection && e.selection.map(n.slice(r));
						s && a++;
						let c = new og(o.invert(), t, s), l, u = i.length - 1;
						(l = i.length && i[u].merge(c)) ? i[u] = l : i.push(c);
					}
				} else e.map && r--;
			}, this.items.length, 0), new e(Y.from(i.reverse()), a);
		}
	}, ag.empty = new ag(Y.empty, 0), og = class e {
		constructor(e, t, n, r) {
			this.map = e, this.step = t, this.selection = n, this.mirrorOffset = r;
		}
		merge(t) {
			if (this.step && t.step && !t.selection) {
				let n = t.step.merge(this.step);
				if (n) return new e(n.getMap().invert(), n, this.selection);
			}
		}
	}, sg = class {
		constructor(e, t, n, r, i) {
			this.done = e, this.undone = t, this.prevRanges = n, this.prevTime = r, this.prevComposition = i;
		}
	}, cg = 20, lg = !1, ug = null, dg = new R("history"), fg = new R("closeHistory"), pg = rg(!1, !0), mg = rg(!0, !0);
})), gg = S((() => {
	hg();
}));
//#endregion
//#region ../../node_modules/@tiptap/extensions/dist/index.js
function _g(e) {
	let { editor: t, placeholder: n, dataAttribute: r, pos: i, node: a, isEmptyDoc: o, hasAnchor: s, classes: { emptyNode: c, emptyEditor: l } } = e, u = [c];
	return o && u.push(l), zu.node(i, i + a.nodeSize, {
		class: u.join(" "),
		[r]: typeof n == "function" ? n({
			editor: t,
			node: a,
			pos: i,
			hasAnchor: s
		}) : n
	});
}
function vg(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function yg({ editor: e, options: t, dataAttribute: n, doc: r, selection: i, from: a, to: o }) {
	let { anchor: s } = i, c = [], l = e.isEmpty;
	return r.nodesBetween(a, o, (r, i) => {
		let a = s >= i && s <= i + r.nodeSize, o = !r.isLeaf && Tf(r);
		return r.type.isTextblock && (a || !t.showOnlyCurrent) && o && c.push(_g({
			editor: e,
			isEmptyDoc: l,
			dataAttribute: n,
			hasAnchor: a,
			placeholder: t.placeholder,
			classes: {
				emptyEditor: t.emptyEditorClass,
				emptyNode: vg(t.emptyNodeClass, {
					editor: e,
					node: r,
					pos: i,
					hasAnchor: a
				})
			},
			node: r,
			pos: i
		})), t.includeChildren;
	}), c;
}
function bg({ editor: e, options: t, dataAttribute: n, doc: r, selection: i }) {
	if (!(e.isEditable || !t.showOnlyWhenEditable)) return null;
	let { anchor: a } = i, o = [], s = e.isEmpty;
	if (t.showOnlyCurrent && !t.includeChildren) {
		let i = r.resolve(a), c = i.depth > 0 ? i.node(1) : i.nodeAfter, l = i.depth > 0 ? i.before(1) : a;
		if (c && c.type.isTextblock && Tf(c)) {
			let r = a >= l && a <= l + c.nodeSize;
			o.push(_g({
				editor: e,
				isEmptyDoc: s,
				dataAttribute: n,
				hasAnchor: r,
				placeholder: t.placeholder,
				classes: {
					emptyEditor: t.emptyEditorClass,
					emptyNode: vg(t.emptyNodeClass, {
						editor: e,
						node: c,
						pos: l,
						hasAnchor: r
					})
				},
				node: c,
				pos: l
			}));
		}
	} else o.push(...yg({
		editor: e,
		options: t,
		dataAttribute: n,
		doc: r,
		selection: i,
		from: 0,
		to: r.content.size
	}));
	return V.create(r, o);
}
function xg(e, t) {
	let n = e.resolve(t);
	if (n.depth === 0) {
		let e = n.nodeAfter ?? n.nodeBefore;
		if (!e) return {
			from: t,
			to: t
		};
		let r = n.nodeAfter ? t : t - e.nodeSize;
		return {
			from: r,
			to: r + e.nodeSize
		};
	}
	let r = n.before(1);
	return {
		from: r,
		to: r + n.node(1).nodeSize
	};
}
function Sg(e, t) {
	return {
		from: Math.max(0, t.from - 1),
		to: Math.min(e.content.size, t.to - 1)
	};
}
function Cg(e, t, n) {
	let r = [];
	return e.forEach((e, i) => {
		let a = i, o = a + e.nodeSize, s = a + 1, c = o + 1;
		s < n && c > t && r.push({
			from: a,
			to: o
		});
	}), r;
}
function wg(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e.from - t.from), n = [{ ...t[0] }];
	for (let e = 1; e < t.length; e += 1) {
		let r = n[n.length - 1], i = t[e];
		i.from <= r.to ? r.to = Math.max(r.to, i.to) : n.push({ ...i });
	}
	return n;
}
function Tg(e, t) {
	let n = Cg(e, t.from, t.to);
	return n.push(Sg(e, xg(e, t.from))), t.to > t.from ? n.push(Sg(e, xg(e, Math.min(t.to, e.content.size + 1) - 1))) : t.from < e.content.size + 1 && n.push(Sg(e, xg(e, Math.min(t.from + 1, e.content.size)))), n;
}
function Eg(e, t, n) {
	let r = [];
	if (e.docChanged) {
		let t = _f(e);
		for (let e of t) r.push(...Tg(n.doc, e.newRange));
	}
	return e.selectionSet && (r.push(Sg(n.doc, xg(n.doc, e.mapping.map(t.selection.anchor)))), r.push(Sg(n.doc, xg(n.doc, n.selection.anchor)))), wg(r);
}
function Dg(e, t, n) {
	let r = Math.max(0, Math.min(e, n.content.size));
	return {
		from: r,
		to: Math.max(r, Math.min(t, n.content.size))
	};
}
function Og({ decorations: e, ranges: t, editor: n, options: r, dataAttribute: i, doc: a, selection: o }) {
	let s = e;
	for (let e of t) {
		let { from: t, to: c } = Dg(e.from, e.to, a), l = s.find(t, c).filter((e) => e.from >= t && e.to <= c);
		l.length && (s = s.remove(l));
		let u = yg({
			editor: n,
			options: r,
			dataAttribute: i,
			doc: a,
			selection: o,
			from: t,
			to: c
		});
		u.length && (s = s.add(a, u));
	}
	return s;
}
function kg({ editor: e, options: t, dataAttribute: n }) {
	return {
		init(r, i) {
			return bg({
				editor: e,
				options: t,
				dataAttribute: n,
				doc: i.doc,
				selection: i.selection
			}) ?? V.empty;
		},
		apply(r, i, a, o) {
			return !r.docChanged && !r.selectionSet ? i : Og({
				decorations: i.map(r.mapping, r.doc),
				ranges: Eg(r, a, o),
				editor: e,
				options: t,
				dataAttribute: n,
				doc: o.doc,
				selection: o.selection
			});
		}
	};
}
function Ag(e) {
	return e.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").replace(/^[0-9-]+/, "").replace(/^-+/, "").toLowerCase();
}
function jg({ editor: e, options: t }) {
	let n = t.dataAttribute ? `data-${Ag(t.dataAttribute)}` : `data-${zg}`, r = t.showOnlyCurrent && !t.includeChildren;
	return new L({
		key: Bg,
		...r ? {} : { state: kg({
			editor: e,
			options: t,
			dataAttribute: n
		}) },
		props: { decorations: r ? ({ doc: r, selection: i }) => bg({
			editor: e,
			options: t,
			dataAttribute: n,
			doc: r,
			selection: i
		}) : (n) => t.showOnlyWhenEditable && !e.isEditable ? V.empty : Bg.getState(n) ?? V.empty }
	});
}
function Mg(e, t) {
	return !e.selection.empty && !Ef(e.selection) && t.isEditable;
}
function Ng(e, t) {
	return Mg(e, t) && !t.isFocused && !t.view.dragging;
}
function Pg() {
	var e;
	(e = window.getSelection()) == null || e.removeAllRanges();
}
function Fg(e) {
	e.focus();
}
function Ig({ types: e, node: t }) {
	return t && Array.isArray(e) && e.includes(t.type) || t?.type === e;
}
var Lg, Rg, zg, Bg, Vg, Hg, Ug, Wg = S((() => {
	J(), xo(), jh(), ed(), Wh(), gg(), q.create({
		name: "characterCount",
		addOptions() {
			return {
				limit: null,
				autoTrim: !0,
				mode: "textSize",
				textCounter: (e) => e.length,
				wordCounter: (e) => e.split(" ").filter((e) => e !== "").length
			};
		},
		addStorage() {
			return {
				characters: () => 0,
				words: () => 0
			};
		},
		onBeforeCreate() {
			this.storage.characters = (e) => {
				let t = e?.node || this.editor.state.doc;
				if ((e?.mode || this.options.mode) === "textSize") {
					let e = t.textBetween(0, t.content.size, void 0, " ");
					return this.options.textCounter(e);
				}
				return t.nodeSize;
			}, this.storage.words = (e) => {
				let t = e?.node || this.editor.state.doc, n = t.textBetween(0, t.content.size, " ", " ");
				return this.options.wordCounter(n);
			};
		},
		addProseMirrorPlugins() {
			let e = !1;
			return [new L({
				key: new R("characterCount"),
				appendTransaction: (t, n, r) => {
					if (e) return;
					let i = this.options.limit, a = this.options.autoTrim;
					if (i == null || i === 0 || a === !1) {
						e = !0;
						return;
					}
					let o = this.storage.characters({ node: r.doc });
					if (o > i) {
						let t = o - i;
						console.warn(`[CharacterCount] Initial content exceeded limit of ${i} characters. Content was automatically trimmed.`);
						let n = r.tr.deleteRange(0, t);
						return e = !0, n;
					}
					e = !0;
				},
				filterTransaction: (e, t) => {
					let n = this.options.limit;
					if (!e.docChanged || n === 0 || n == null) return !0;
					let r = this.storage.characters({ node: t.doc }), i = this.storage.characters({ node: e.doc });
					if (i <= n || r > n && i > n && i <= r) return !0;
					if (r > n && i > n && i > r || !e.getMeta("paste")) return !1;
					let a = e.selection.$head.pos, o = a - (i - n), s = a;
					return e.deleteRange(o, s), !(this.storage.characters({ node: e.doc }) > n);
				}
			})];
		}
	}), Lg = q.create({
		name: "dropCursor",
		addOptions() {
			return {
				color: "currentColor",
				width: 1,
				class: void 0
			};
		},
		addProseMirrorPlugins() {
			return [Oh(this.options)];
		}
	}), q.create({
		name: "focus",
		addOptions() {
			return {
				className: "has-focus",
				mode: "all"
			};
		},
		addProseMirrorPlugins() {
			return [new L({
				key: new R("focus"),
				props: { decorations: ({ doc: e, selection: t }) => {
					let { isEditable: n, isFocused: r } = this.editor, { anchor: i } = t, a = [];
					if (!n || !r) return V.create(e, []);
					let o = 0;
					this.options.mode === "deepest" && e.descendants((e, t) => {
						if (!e.isText) {
							if (!(i >= t && i <= t + e.nodeSize - 1)) return !1;
							o += 1;
						}
					});
					let s = 0;
					return e.descendants((e, t) => {
						if (e.isText || !(i >= t && i <= t + e.nodeSize - 1)) return !1;
						if (s += 1, this.options.mode === "deepest" && o - s > 0 || this.options.mode === "shallowest" && s > 1) return this.options.mode === "deepest";
						a.push(zu.node(t, t + e.nodeSize, { class: this.options.className }));
					}), V.create(e, a);
				} }
			})];
		}
	}), Rg = q.create({
		name: "gapCursor",
		addProseMirrorPlugins() {
			return [Fh()];
		},
		extendNodeSchema(e) {
			return { allowGapCursor: G(W(e, "allowGapCursor", {
				name: e.name,
				options: e.options,
				storage: e.storage
			})) ?? null };
		}
	}), zg = "placeholder", Bg = new R("tiptap__placeholder"), Vg = q.create({
		name: "placeholder",
		addOptions() {
			return {
				emptyEditorClass: "is-editor-empty",
				emptyNodeClass: "is-empty",
				dataAttribute: zg,
				placeholder: "Write something …",
				showOnlyWhenEditable: !0,
				showOnlyCurrent: !0,
				includeChildren: !1
			};
		},
		addProseMirrorPlugins() {
			return [jg({
				editor: this.editor,
				options: this.options
			})];
		}
	}), q.create({
		name: "selection",
		addOptions() {
			return { className: "selection" };
		},
		addProseMirrorPlugins() {
			let { editor: e, options: t } = this;
			return [new L({
				key: new R("selection"),
				props: {
					decorations(n) {
						return Ng(n, e) ? V.create(n.doc, [zu.inline(n.selection.from, n.selection.to, { class: t.className })]) : null;
					},
					handleDOMEvents: {
						blur(t) {
							return Mg(t.state, e) && Pg(), !1;
						},
						focus(t) {
							return Mg(t.state, e) && requestAnimationFrame(() => {
								!e.isDestroyed && t.hasFocus() && Fg(t);
							}), !1;
						}
					}
				}
			})];
		}
	}), Hg = q.create({
		name: "trailingNode",
		addOptions() {
			return {
				node: void 0,
				notAfter: []
			};
		},
		addProseMirrorPlugins() {
			let e = new R(this.name), t = this.options.node || this.editor.schema.topNodeType.contentMatch.defaultType?.name || "paragraph", n = Object.entries(this.editor.schema.nodes).map(([, e]) => e).filter((e) => (this.options.notAfter || []).concat(t).includes(e.name));
			return [new L({
				key: e,
				appendTransaction: (n, r, i) => {
					let { doc: a, tr: o, schema: s } = i, c = e.getState(i), l = a.content.size, u = s.nodes[t];
					if (!n.some((e) => e.getMeta("skipTrailingNode")) && c) return o.insert(l, u.create());
				},
				state: {
					init: (e, t) => {
						let r = t.tr.doc.lastChild;
						return !Ig({
							node: r,
							types: n
						});
					},
					apply: (e, t) => {
						if (!e.docChanged || e.getMeta("__uniqueIDTransaction")) return t;
						let r = e.doc.lastChild;
						return !Ig({
							node: r,
							types: n
						});
					}
				}
			})];
		}
	}), Ug = q.create({
		name: "undoRedo",
		addOptions() {
			return {
				depth: 100,
				newGroupDelay: 500
			};
		},
		addCommands() {
			return {
				undo: () => ({ state: e, dispatch: t }) => pg(e, t),
				redo: () => ({ state: e, dispatch: t }) => mg(e, t)
			};
		},
		addProseMirrorPlugins() {
			return [ng(this.options)];
		},
		addKeyboardShortcuts() {
			return {
				"Mod-z": () => this.editor.commands.undo(),
				"Shift-Mod-z": () => this.editor.commands.redo(),
				"Mod-y": () => this.editor.commands.redo(),
				"Mod-я": () => this.editor.commands.undo(),
				"Shift-Mod-я": () => this.editor.commands.redo()
			};
		}
	});
})), Gg = /* @__PURE__ */ ne(((t, n) => {
	n.exports = { ...e };
})), Kg = /* @__PURE__ */ ne(((e) => {
	var t = Gg();
	function n(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var r = typeof Object.is == "function" ? Object.is : n, i = t.useState, a = t.useEffect, o = t.useLayoutEffect, s = t.useDebugValue;
	function c(e, t) {
		var n = t(), r = i({ inst: {
			value: n,
			getSnapshot: t
		} }), c = r[0].inst, u = r[1];
		return o(function() {
			c.value = n, c.getSnapshot = t, l(c) && u({ inst: c });
		}, [
			e,
			n,
			t
		]), a(function() {
			return l(c) && u({ inst: c }), e(function() {
				l(c) && u({ inst: c });
			});
		}, [e]), s(n), n;
	}
	function l(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !r(e, n);
		} catch {
			return !0;
		}
	}
	function u(e, t) {
		return t();
	}
	var d = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? u : c;
	e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? d : t.useSyncExternalStore;
})), qg = /* @__PURE__ */ ne(((e, t) => {
	t.exports = Kg();
}));
//#endregion
//#region ../../node_modules/fast-equals/dist/es/index.mjs
function Jg(e, t) {
	return function(n, r, i) {
		return e(n, r, i) && t(n, r, i);
	};
}
function Yg(e) {
	return function(t, n, r) {
		if (!t || !n || typeof t != "object" || typeof n != "object") return e(t, n, r);
		let { cache: i } = r, a = i.get(t), o = i.get(n);
		if (a && o) return a === n && o === t;
		i.set(t, n), i.set(n, t);
		let s = e(t, n, r);
		return i.delete(t), i.delete(n), s;
	};
}
function Xg(e) {
	return e?.[Symbol.toStringTag];
}
function Zg(e) {
	return y_(e).concat(b_(e));
}
function Qg(e, t) {
	return e === t || !e && !t && e !== e && t !== t;
}
function $g(e, t) {
	return e.byteLength === t.byteLength && d_(new Uint8Array(e), new Uint8Array(t));
}
function e_(e, t, n) {
	let r = e.length;
	if (t.length !== r) return !1;
	for (; r-- > 0;) if (!n.equals(e[r], t[r], r, r, e, t, n)) return !1;
	return !0;
}
function t_(e, t) {
	return e.byteLength === t.byteLength && d_(new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
}
function n_(e, t) {
	return Qg(e.getTime(), t.getTime());
}
function r_(e, t) {
	return e.name === t.name && e.message === t.message && e.cause === t.cause && e.stack === t.stack;
}
function i_(e, t) {
	return e === t;
}
function a_(e, t, n) {
	let r = e.size;
	if (r !== t.size) return !1;
	if (!r) return !0;
	let i = Array(r), a = e.entries(), o, s, c = 0;
	for (; (o = a.next()) && !o.done;) {
		let r = t.entries(), a = !1, l = 0;
		for (; (s = r.next()) && !s.done;) {
			if (i[l]) {
				l++;
				continue;
			}
			let r = o.value, u = s.value;
			if (n.equals(r[0], u[0], c, l, e, t, n) && n.equals(r[1], u[1], r[0], u[0], e, t, n)) {
				a = i[l] = !0;
				break;
			}
			l++;
		}
		if (!a) return !1;
		c++;
	}
	return !0;
}
function o_(e, t, n) {
	let r = D_(e), i = r.length;
	if (D_(t).length !== i) return !1;
	for (; i-- > 0;) if (!p_(e, t, n, r[i])) return !1;
	return !0;
}
function s_(e, t, n) {
	let r = Zg(e), i = r.length;
	if (Zg(t).length !== i) return !1;
	let a, o, s;
	for (; i-- > 0;) if (a = r[i], !p_(e, t, n, a) || (o = E_(e, a), s = E_(t, a), (o || s) && (!o || !s || o.configurable !== s.configurable || o.enumerable !== s.enumerable || o.writable !== s.writable))) return !1;
	return !0;
}
function c_(e, t) {
	return Qg(e.valueOf(), t.valueOf());
}
function l_(e, t) {
	return e.source === t.source && e.flags === t.flags;
}
function u_(e, t, n) {
	let r = e.size;
	if (r !== t.size) return !1;
	if (!r) return !0;
	let i = Array(r), a = e.values(), o, s;
	for (; (o = a.next()) && !o.done;) {
		let r = t.values(), a = !1, c = 0;
		for (; (s = r.next()) && !s.done;) {
			if (!i[c] && n.equals(o.value, s.value, o.value, s.value, e, t, n)) {
				a = i[c] = !0;
				break;
			}
			c++;
		}
		if (!a) return !1;
	}
	return !0;
}
function d_(e, t) {
	let n = e.byteLength;
	if (t.byteLength !== n || e.byteOffset !== t.byteOffset) return !1;
	for (; n-- > 0;) if (e[n] !== t[n]) return !1;
	return !0;
}
function f_(e, t) {
	return e.hostname === t.hostname && e.pathname === t.pathname && e.protocol === t.protocol && e.port === t.port && e.hash === t.hash && e.username === t.username && e.password === t.password;
}
function p_(e, t, n, r) {
	return (r === T_ || r === w_ || r === C_) && (e.$$typeof || t.$$typeof) ? !0 : S_(t, r) && n.equals(e[r], t[r], r, r, e, t, n);
}
function m_({ areArrayBuffersEqual: e, areArraysEqual: t, areDataViewsEqual: n, areDatesEqual: r, areErrorsEqual: i, areFunctionsEqual: a, areMapsEqual: o, areNumbersEqual: s, areObjectsEqual: c, arePrimitiveWrappersEqual: l, areRegExpsEqual: u, areSetsEqual: d, areTypedArraysEqual: f, areUrlsEqual: p, unknownTagComparators: m }) {
	return function(h, g, _) {
		if (h === g) return !0;
		if (h == null || g == null) return !1;
		let v = typeof h;
		if (v !== typeof g) return !1;
		if (v !== "object") return v === "number" ? s(h, g, _) : v === "function" && a(h, g, _);
		let y = h.constructor;
		if (y !== g.constructor) return !1;
		if (y === Object) return c(h, g, _);
		if (Array.isArray(h)) return t(h, g, _);
		if (y === Date) return r(h, g, _);
		if (y === RegExp) return u(h, g, _);
		if (y === Map) return o(h, g, _);
		if (y === Set) return d(h, g, _);
		let b = U_.call(h);
		if (b === N_) return r(h, g, _);
		if (b === R_) return u(h, g, _);
		if (b === F_) return o(h, g, _);
		if (b === z_) return d(h, g, _);
		if (b === L_) return typeof h.then != "function" && typeof g.then != "function" && c(h, g, _);
		if (b === H_) return p(h, g, _);
		if (b === P_) return i(h, g, _);
		if (b === A_) return c(h, g, _);
		if (V_[b]) return f(h, g, _);
		if (b === k_) return e(h, g, _);
		if (b === M_) return n(h, g, _);
		if (b === j_ || b === I_ || b === B_) return l(h, g, _);
		if (m) {
			let e = m[b];
			if (!e) {
				let t = Xg(h);
				t && (e = m[t]);
			}
			if (e) return e(h, g, _);
		}
		return !1;
	};
}
function h_({ circular: e, createCustomConfig: t, strict: n }) {
	let r = {
		areArrayBuffersEqual: $g,
		areArraysEqual: n ? s_ : e_,
		areDataViewsEqual: t_,
		areDatesEqual: n_,
		areErrorsEqual: r_,
		areFunctionsEqual: i_,
		areMapsEqual: n ? Jg(a_, s_) : a_,
		areNumbersEqual: O_,
		areObjectsEqual: n ? s_ : o_,
		arePrimitiveWrappersEqual: c_,
		areRegExpsEqual: l_,
		areSetsEqual: n ? Jg(u_, s_) : u_,
		areTypedArraysEqual: n ? Jg(d_, s_) : d_,
		areUrlsEqual: f_,
		unknownTagComparators: void 0
	};
	if (t && (r = Object.assign({}, r, t(r))), e) {
		let e = Yg(r.areArraysEqual), t = Yg(r.areMapsEqual), n = Yg(r.areObjectsEqual), i = Yg(r.areSetsEqual);
		r = Object.assign({}, r, {
			areArraysEqual: e,
			areMapsEqual: t,
			areObjectsEqual: n,
			areSetsEqual: i
		});
	}
	return r;
}
function g_(e) {
	return function(t, n, r, i, a, o, s) {
		return e(t, n, s);
	};
}
function __({ circular: e, comparator: t, createState: n, equals: r, strict: i }) {
	if (n) return function(a, o) {
		let { cache: s = e ? /* @__PURE__ */ new WeakMap() : void 0, meta: c } = n();
		return t(a, o, {
			cache: s,
			equals: r,
			meta: c,
			strict: i
		});
	};
	if (e) return function(e, n) {
		return t(e, n, {
			cache: /* @__PURE__ */ new WeakMap(),
			equals: r,
			meta: void 0,
			strict: i
		});
	};
	let a = {
		cache: void 0,
		equals: r,
		meta: void 0,
		strict: i
	};
	return function(e, n) {
		return t(e, n, a);
	};
}
function v_(e = {}) {
	let { circular: t = !1, createInternalComparator: n, createState: r, strict: i = !1 } = e, a = m_(h_(e));
	return __({
		circular: t,
		comparator: a,
		createState: r,
		equals: n ? n(a) : g_(a),
		strict: i
	});
}
var y_, b_, x_, S_, C_, w_, T_, E_, D_, O_, k_, A_, j_, M_, N_, P_, F_, I_, L_, R_, z_, B_, V_, H_, U_, W_, G_ = S((() => {
	({getOwnPropertyNames: y_, getOwnPropertySymbols: b_} = Object), {hasOwnProperty: x_} = Object.prototype, S_ = Object.hasOwn || ((e, t) => x_.call(e, t)), C_ = "__v", w_ = "__o", T_ = "_owner", {getOwnPropertyDescriptor: E_, keys: D_} = Object, O_ = Qg, k_ = "[object ArrayBuffer]", A_ = "[object Arguments]", j_ = "[object Boolean]", M_ = "[object DataView]", N_ = "[object Date]", P_ = "[object Error]", F_ = "[object Map]", I_ = "[object Number]", L_ = "[object Object]", R_ = "[object RegExp]", z_ = "[object Set]", B_ = "[object String]", V_ = {
		"[object Int8Array]": !0,
		"[object Uint8Array]": !0,
		"[object Uint8ClampedArray]": !0,
		"[object Int16Array]": !0,
		"[object Uint16Array]": !0,
		"[object Int32Array]": !0,
		"[object Uint32Array]": !0,
		"[object Float16Array]": !0,
		"[object Float32Array]": !0,
		"[object Float64Array]": !0,
		"[object BigInt64Array]": !0,
		"[object BigUint64Array]": !0
	}, H_ = "[object URL]", U_ = Object.prototype.toString, W_ = v_(), v_({ strict: !0 }), v_({ circular: !0 }), v_({
		circular: !0,
		strict: !0
	}), v_({ createInternalComparator: () => Qg }), v_({
		strict: !0,
		createInternalComparator: () => Qg
	}), v_({
		circular: !0,
		createInternalComparator: () => Qg
	}), v_({
		circular: !0,
		createInternalComparator: () => Qg,
		strict: !0
	});
})), K_ = /* @__PURE__ */ ne(((e) => {
	var t = Gg(), n = qg();
	function r(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var i = typeof Object.is == "function" ? Object.is : r, a = n.useSyncExternalStore, o = t.useRef, s = t.useEffect, c = t.useMemo, l = t.useDebugValue;
	e.useSyncExternalStoreWithSelector = function(e, t, n, r, u) {
		var d = o(null);
		if (d.current === null) {
			var f = {
				hasValue: !1,
				value: null
			};
			d.current = f;
		} else f = d.current;
		d = c(function() {
			function e(e) {
				if (!a) {
					if (a = !0, o = e, e = r(e), u !== void 0 && f.hasValue) {
						var t = f.value;
						if (u(t, e)) return s = t;
					}
					return s = e;
				}
				if (t = s, i(o, e)) return t;
				var n = r(e);
				return u !== void 0 && u(t, n) ? (o = e, t) : (o = e, s = n);
			}
			var a = !1, o, s, c = n === void 0 ? null : n;
			return [function() {
				return e(t());
			}, c === null ? void 0 : function() {
				return e(c());
			}];
		}, [
			t,
			n,
			r,
			u
		]);
		var p = a(e, d[0], d[1]);
		return s(function() {
			f.hasValue = !0, f.value = p;
		}, [p]), l(p), p;
	};
})), q_ = /* @__PURE__ */ ne(((e, t) => {
	t.exports = K_();
}));
//#endregion
//#region ../../node_modules/@tiptap/react/dist/index.js
function J_() {
	let e = /* @__PURE__ */ new Set(), t = {}, n = !1, r = () => {
		n || !e.size || (n = !0, queueMicrotask(() => {
			n = !1, e.forEach((e) => e());
		}));
	};
	return {
		subscribe(t) {
			return e.add(t), () => {
				e.delete(t);
			};
		},
		getSnapshot() {
			return t;
		},
		getServerSnapshot() {
			return t;
		},
		setRenderer(e, n) {
			t = {
				...t,
				[e]: y.createPortal(n.reactElement, n.element, e)
			}, r();
		},
		removeRenderer(e) {
			let n = { ...t };
			delete n[e], t = n, r();
		}
	};
}
function Y_(e) {
	let [t] = m(() => new cv(e.editor)), n = (0, tv.useSyncExternalStoreWithSelector)(t.subscribe, t.getSnapshot, t.getServerSnapshot, e.selector, e.equalityFn ?? W_);
	return sv(() => t.watch(e.editor), [e.editor, t]), c(n), n;
}
function X_(e = {}, t = []) {
	let n = p(e);
	n.current = e;
	let [r] = m(() => new fv(n)), i = (0, ev.useSyncExternalStore)(r.subscribe, r.getEditor, r.getServerSnapshot);
	return c(i), l(r.onRender(t)), Y_({
		editor: i,
		selector: ({ transactionNumber: t }) => e.shouldRerenderOnTransaction === !1 || e.shouldRerenderOnTransaction === void 0 ? null : e.immediatelyRender && t === 0 ? 0 : t + 1
	}), i;
}
function Z_({ children: e, ...t }) {
	let n = "editor" in t ? t.editor : t.instance;
	if (!n) throw Error("Tiptap: An editor instance is required. Pass a non-null `editor` prop.");
	let r = f(() => ({ editor: n }), [n]), i = f(() => ({ editor: n }), [n]);
	return /* @__PURE__ */ _(pv.Provider, {
		value: i,
		children: /* @__PURE__ */ _(gv.Provider, {
			value: r,
			children: e
		})
	});
}
function Q_({ ...e }) {
	let { editor: t } = _v();
	return /* @__PURE__ */ _(ov, {
		editor: t,
		...e
	});
}
var $_, ev, tv, nv, rv, iv, av, ov, sv, cv, lv, uv, dv, fv, pv, mv, hv, gv, _v, vv = S((() => {
	$_ = qg(), J(), ev = qg(), G_(), tv = q_(), J(), nv = (...e) => (t) => {
		e.forEach((e) => {
			typeof e == "function" ? e(t) : e && (e.current = t);
		});
	}, rv = ({ contentComponent: e }) => {
		let t = (0, $_.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getServerSnapshot);
		return /* @__PURE__ */ _(g, { children: Object.values(t) });
	}, iv = class extends t.Component {
		constructor(e) {
			super(e), this.editorContentRef = t.createRef();
		}
		componentDidMount() {
			this.init();
		}
		componentDidUpdate() {
			this.init();
		}
		init() {
			let e = this.props.editor;
			if (e && !e.isDestroyed && e.view.dom?.parentNode) {
				if (e.contentComponent) return;
				let t = this.editorContentRef.current;
				t.append(...e.view.dom.parentNode.childNodes), e.setOptions({ element: t }), e.contentComponent = J_(), e.createNodeViews(), e.isEditorContentInitialized = !0, this.forceUpdate();
			}
		}
		componentWillUnmount() {
			let e = this.props.editor;
			if (e) {
				e.isEditorContentInitialized = !1, e.isDestroyed || e.view.setProps({ nodeViews: {} }), e.contentComponent = null;
				try {
					if (!e.view.dom?.parentNode) return;
					let t = document.createElement("div");
					t.append(...e.view.dom.parentNode.childNodes), e.setOptions({ element: t });
				} catch {}
			}
		}
		render() {
			let { editor: e, innerRef: t, ...n } = this.props;
			return /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _("div", {
				ref: nv(t, this.editorContentRef),
				...n
			}), e?.contentComponent && /* @__PURE__ */ _(rv, { contentComponent: e.contentComponent })] });
		}
	}, av = i((e, n) => {
		let r = t.useMemo(() => Math.floor(Math.random() * 4294967295).toString(), [e.editor]);
		return t.createElement(iv, {
			key: r,
			innerRef: n,
			...e
		});
	}), ov = t.memo(av), sv = typeof window < "u" ? d : l, cv = class {
		constructor(e) {
			this.transactionNumber = 0, this.lastTransactionNumber = 0, this.subscribers = /* @__PURE__ */ new Set(), this.editor = e, this.lastSnapshot = {
				editor: e,
				transactionNumber: 0
			}, this.getSnapshot = this.getSnapshot.bind(this), this.getServerSnapshot = this.getServerSnapshot.bind(this), this.watch = this.watch.bind(this), this.subscribe = this.subscribe.bind(this);
		}
		getSnapshot() {
			return this.transactionNumber === this.lastTransactionNumber ? this.lastSnapshot : (this.lastTransactionNumber = this.transactionNumber, this.lastSnapshot = {
				editor: this.editor,
				transactionNumber: this.transactionNumber
			}, this.lastSnapshot);
		}
		getServerSnapshot() {
			return {
				editor: null,
				transactionNumber: 0
			};
		}
		subscribe(e) {
			return this.subscribers.add(e), () => {
				this.subscribers.delete(e);
			};
		}
		watch(e) {
			if (this.editor = e, this.editor) {
				let e, t = (t) => {
					(t?.transaction === void 0 || t.transaction !== e) && (e = t?.transaction, this.transactionNumber += 1, this.subscribers.forEach((e) => e()));
				}, n = this.editor;
				return n.on("transaction", t), n.on("update", t), () => {
					n.off("transaction", t), n.off("update", t);
				};
			}
		}
	}, lv = !1, uv = typeof window > "u", dv = uv || !!(typeof window < "u" && window.next), fv = class e {
		constructor(e) {
			this.editor = null, this.subscriptions = /* @__PURE__ */ new Set(), this.isComponentMounted = !1, this.previousDeps = null, this.instanceId = "", this.options = e, this.subscriptions = /* @__PURE__ */ new Set(), this.setEditor(this.getInitialEditor()), this.scheduleDestroy(), this.getEditor = this.getEditor.bind(this), this.getServerSnapshot = this.getServerSnapshot.bind(this), this.subscribe = this.subscribe.bind(this), this.refreshEditorInstance = this.refreshEditorInstance.bind(this), this.scheduleDestroy = this.scheduleDestroy.bind(this), this.onRender = this.onRender.bind(this), this.createEditor = this.createEditor.bind(this);
		}
		setEditor(e) {
			this.editor = e, this.instanceId = Math.random().toString(36).slice(2, 9), this.subscriptions.forEach((e) => e());
		}
		getInitialEditor() {
			let e = this.options.current.immediatelyRender, t = e ?? !0;
			return uv ? (t && lv && console.warn("SSR detected. `immediatelyRender` has been set to false to avoid hydration mismatches"), t = !1) : dv && e === void 0 && (t = !1, lv && console.warn("Next.js detected. `immediatelyRender` defaults to false to avoid hydration mismatches. Pass `immediatelyRender: true` explicitly if you are rendering the editor only on the client.")), t ? this.createEditor() : null;
		}
		createEditor() {
			let e = {
				...this.options.current,
				onBeforeCreate: (...e) => {
					var t;
					return (t = this.options.current).onBeforeCreate?.call(t, ...e);
				},
				onBlur: (...e) => {
					var t;
					return (t = this.options.current).onBlur?.call(t, ...e);
				},
				onCreate: (...e) => {
					var t;
					return (t = this.options.current).onCreate?.call(t, ...e);
				},
				onDestroy: (...e) => {
					var t;
					return (t = this.options.current).onDestroy?.call(t, ...e);
				},
				onFocus: (...e) => {
					var t;
					return (t = this.options.current).onFocus?.call(t, ...e);
				},
				onSelectionUpdate: (...e) => {
					var t;
					return (t = this.options.current).onSelectionUpdate?.call(t, ...e);
				},
				onTransaction: (...e) => {
					var t;
					return (t = this.options.current).onTransaction?.call(t, ...e);
				},
				onUpdate: (...e) => {
					var t;
					return (t = this.options.current).onUpdate?.call(t, ...e);
				},
				onContentError: (...e) => {
					var t;
					return (t = this.options.current).onContentError?.call(t, ...e);
				},
				onDrop: (...e) => {
					var t;
					return (t = this.options.current).onDrop?.call(t, ...e);
				},
				onPaste: (...e) => {
					var t;
					return (t = this.options.current).onPaste?.call(t, ...e);
				},
				onDelete: (...e) => {
					var t;
					return (t = this.options.current).onDelete?.call(t, ...e);
				},
				onMount: (...e) => {
					var t;
					return (t = this.options.current).onMount?.call(t, ...e);
				},
				onUnmount: (...e) => {
					var t;
					return (t = this.options.current).onUnmount?.call(t, ...e);
				}
			};
			return new Eh(e);
		}
		getEditor() {
			return this.editor;
		}
		getServerSnapshot() {
			return null;
		}
		subscribe(e) {
			return this.subscriptions.add(e), () => {
				this.subscriptions.delete(e);
			};
		}
		static compareOptions(e, t) {
			return Object.keys(e).every((n) => [
				"onCreate",
				"onBeforeCreate",
				"onDestroy",
				"onUpdate",
				"onTransaction",
				"onFocus",
				"onBlur",
				"onSelectionUpdate",
				"onContentError",
				"onDrop",
				"onPaste"
			].includes(n) ? !0 : n === "extensions" && e.extensions && t.extensions ? e.extensions.length === t.extensions.length && e.extensions.every((e, n) => e === t.extensions?.[n]) : e[n] === t[n]);
		}
		onRender(t) {
			return () => (this.isComponentMounted = !0, clearTimeout(this.scheduledDestructionTimeout), this.editor && !this.editor.isDestroyed && t.length === 0 ? e.compareOptions(this.options.current, this.editor.options) || this.editor.setOptions({
				...this.options.current,
				editable: this.editor.isEditable
			}) : this.refreshEditorInstance(t), () => {
				this.isComponentMounted = !1, this.scheduleDestroy();
			});
		}
		refreshEditorInstance(e) {
			if (this.editor && !this.editor.isDestroyed) {
				if (this.previousDeps === null) {
					this.previousDeps = e;
					return;
				}
				if (this.previousDeps.length === e.length && this.previousDeps.every((t, n) => t === e[n])) return;
			}
			this.editor && !this.editor.isDestroyed && this.editor.destroy(), this.setEditor(this.createEditor()), this.previousDeps = e;
		}
		scheduleDestroy() {
			let e = this.instanceId, t = this.editor;
			this.scheduledDestructionTimeout = setTimeout(() => {
				if (this.isComponentMounted && this.instanceId === e) {
					t && t.setOptions(this.options.current);
					return;
				}
				t && !t.isDestroyed && (t.destroy(), this.instanceId === e && this.setEditor(null));
			}, 1);
		}
	}, pv = r({ editor: null }), pv.Consumer, mv = r({
		onDragStart: () => {},
		nodeViewContentChildren: void 0,
		nodeViewContentRef: () => {}
	}), hv = () => s(mv), t.forwardRef((e, t) => {
		let { onDragStart: n } = hv(), r = e.as || "div";
		return /* @__PURE__ */ _(r, {
			...e,
			ref: t,
			"data-node-view-wrapper": "",
			onDragStart: n,
			style: {
				whiteSpace: "normal",
				...e.style
			}
		});
	}), t.createContext({ markViewContentRef: () => {} }), gv = r({ get editor() {
		throw Error("useTiptap must be used within a <Tiptap> provider");
	} }), gv.displayName = "TiptapContext", _v = () => s(gv), Z_.displayName = "Tiptap", Q_.displayName = "Tiptap.Content", Object.assign(Z_, { Content: Q_ });
})), yv, bv = S((() => {
	yv = (e, t) => {
		if (e === "slot") return 0;
		if (e instanceof Function) return e(t);
		let { children: n, ...r } = t ?? {};
		if (e === "svg") throw Error("SVG elements are not supported in the JSX syntax, use the array syntax instead");
		return [
			e,
			r,
			n
		];
	};
})), xv = S((() => {
	bv();
})), Sv, Cv, wv, Tv = S((() => {
	J(), So(), xo(), xv(), Sv = (e, t) => {
		let { state: n } = e, { selection: r } = n;
		if (!r.empty) return !1;
		let { $from: i } = r;
		if (i.parentOffset !== 0) return !1;
		let a = i.depth - 1;
		if (a < 0) return !1;
		let o = i.node(a), s = i.index(a);
		if (s === 0) return !1;
		if (o.type === t) return e.commands.lift(t.name);
		let c = o.child(s - 1);
		if (c.type !== t || !c.lastChild?.isTextblock) return !1;
		let l = i.before() - 1 - 1;
		return e.commands.command(({ tr: e, dispatch: t }) => {
			if (!t) return !0;
			let n = i.parent.content, r = new N(n, 0, 0);
			return e.replace(l, i.after(), r), e.setSelection(F.create(e.doc, l + n.size)), e.scrollIntoView(), t(e), !0;
		});
	}, Cv = /^\s*>\s$/, wv = Dh.create({
		name: "blockquote",
		addOptions() {
			return { HTMLAttributes: {} };
		},
		content: "block+",
		group: "block",
		defining: !0,
		parseHTML() {
			return [{ tag: "blockquote" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			return /* @__PURE__ */ yv("blockquote", {
				...K(this.options.HTMLAttributes, e),
				children: /* @__PURE__ */ yv("slot", {})
			});
		},
		parseMarkdown: (e, t) => {
			let n = t.parseBlockChildren ?? t.parseChildren;
			return t.createNode("blockquote", void 0, n(e.tokens || []));
		},
		renderMarkdown: (e, t) => {
			if (!e.content) return "";
			let n = [];
			return e.content.forEach((e, r) => {
				let i = (t.renderChild?.call(t, e, r) ?? t.renderChildren([e])).split("\n").map((e) => e.trim() === "" ? ">" : `> ${e}`);
				n.push(i.join("\n"));
			}), n.join("\n>\n");
		},
		addCommands() {
			return {
				setBlockquote: () => ({ commands: e }) => e.wrapIn(this.name),
				toggleBlockquote: () => ({ commands: e }) => e.toggleWrap(this.name),
				unsetBlockquote: () => ({ commands: e }) => e.lift(this.name)
			};
		},
		addKeyboardShortcuts() {
			return {
				"Mod-Shift-b": () => this.editor.commands.toggleBlockquote(),
				Backspace: () => Sv(this.editor, this.type)
			};
		},
		addInputRules() {
			return [Cp({
				find: Cv,
				type: this.type
			})];
		}
	});
})), Ev, Dv, Ov, kv, Av, jv = S((() => {
	J(), xv(), Ev = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/, Dv = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g, Ov = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/, kv = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g, Av = ah.create({
		name: "bold",
		addOptions() {
			return { HTMLAttributes: {} };
		},
		parseHTML() {
			return [
				{ tag: "strong" },
				{
					tag: "b",
					getAttrs: (e) => e.style.fontWeight !== "normal" && null
				},
				{
					style: "font-weight=400",
					clearMark: (e) => e.type.name === this.name
				},
				{
					style: "font-weight",
					getAttrs: (e) => /^(bold(er)?|[5-9]\d{2,})$/.test(e) && null
				}
			];
		},
		renderHTML({ HTMLAttributes: e }) {
			return /* @__PURE__ */ yv("strong", {
				...K(this.options.HTMLAttributes, e),
				children: /* @__PURE__ */ yv("slot", {})
			});
		},
		markdownTokenName: "strong",
		parseMarkdown: (e, t) => t.applyMark("bold", t.parseInline(e.tokens || [])),
		markdownOptions: { htmlReopen: {
			open: "<strong>",
			close: "</strong>"
		} },
		renderMarkdown: (e, t) => `**${t.renderChildren(e)}**`,
		addCommands() {
			return {
				setBold: () => ({ commands: e }) => e.setMark(this.name),
				toggleBold: () => ({ commands: e }) => e.toggleMark(this.name),
				unsetBold: () => ({ commands: e }) => e.unsetMark(this.name)
			};
		},
		addKeyboardShortcuts() {
			return {
				"Mod-b": () => this.editor.commands.toggleBold(),
				"Mod-B": () => this.editor.commands.toggleBold()
			};
		},
		addInputRules() {
			return [bp({
				find: Ev,
				type: this.type
			}), bp({
				find: Ov,
				type: this.type
			})];
		},
		addPasteRules() {
			return [wp({
				find: Dv,
				type: this.type
			}), wp({
				find: kv,
				type: this.type
			})];
		}
	});
})), Mv, Nv, Pv, Fv = S((() => {
	J(), Mv = (e) => {
		let t = /`([^`]+)`(?!`)$/.exec(e);
		return !t || t.index > 0 && e[t.index - 1] === "`" ? null : {
			index: t.index,
			text: t[0],
			replaceWith: t[1]
		};
	}, Nv = (e) => {
		let t = /`([^`]+)`(?!`)/g, n = [], r;
		for (; (r = t.exec(e)) !== null;) r.index > 0 && e[r.index - 1] === "`" || n.push({
			index: r.index,
			text: r[0],
			replaceWith: r[1]
		});
		return n;
	}, Pv = ah.create({
		name: "code",
		addOptions() {
			return { HTMLAttributes: {} };
		},
		excludes: "_",
		code: !0,
		exitable: !0,
		parseHTML() {
			return [{ tag: "code" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"code",
				K(this.options.HTMLAttributes, e),
				0
			];
		},
		markdownTokenName: "codespan",
		parseMarkdown: (e, t) => t.applyMark("code", [{
			type: "text",
			text: e.text || ""
		}]),
		renderMarkdown: (e, t) => e.content ? `\`${t.renderChildren(e.content)}\`` : "",
		addCommands() {
			return {
				setCode: () => ({ commands: e }) => e.setMark(this.name),
				toggleCode: () => ({ commands: e }) => e.toggleMark(this.name),
				unsetCode: () => ({ commands: e }) => e.unsetMark(this.name)
			};
		},
		addKeyboardShortcuts() {
			return { "Mod-e": () => this.editor.commands.toggleCode() };
		},
		addInputRules() {
			return [bp({
				find: Mv,
				type: this.type
			})];
		},
		addPasteRules() {
			return [wp({
				find: Nv,
				type: this.type
			})];
		}
	});
})), Iv, Lv, Rv, zv, Bv = S((() => {
	J(), xo(), Iv = 4, Lv = /^```([a-z]+)?[\s\n]$/, Rv = /^~~~([a-z]+)?[\s\n]$/, zv = Dh.create({
		name: "codeBlock",
		addOptions() {
			return {
				languageClassPrefix: "language-",
				exitOnTripleEnter: !0,
				exitOnArrowDown: !0,
				exitOnArrowUp: !0,
				defaultLanguage: null,
				enableTabIndentation: !1,
				tabSize: Iv,
				HTMLAttributes: {}
			};
		},
		content: "text*",
		marks: "",
		group: "block",
		code: !0,
		defining: !0,
		addAttributes() {
			return { language: {
				default: this.options.defaultLanguage,
				parseHTML: (e) => {
					let { languageClassPrefix: t } = this.options;
					return t && [...e.firstElementChild?.classList || []].filter((e) => e.startsWith(t)).map((e) => e.replace(t, ""))[0] || null;
				},
				rendered: !1
			} };
		},
		parseHTML() {
			return [{
				tag: "pre",
				preserveWhitespace: "full"
			}];
		},
		renderHTML({ node: e, HTMLAttributes: t }) {
			return [
				"pre",
				K(this.options.HTMLAttributes, t),
				[
					"code",
					{ class: e.attrs.language ? this.options.languageClassPrefix + e.attrs.language : null },
					0
				]
			];
		},
		markdownTokenName: "code",
		parseMarkdown: (e, t) => e.raw?.startsWith("```") === !1 && e.raw?.startsWith("~~~") === !1 && e.codeBlockStyle !== "indented" ? [] : t.createNode("codeBlock", { language: e.lang || null }, e.text ? [t.createTextNode(e.text)] : []),
		renderMarkdown: (e, t) => {
			let n = "", r = e.attrs?.language || "";
			return n = e.content ? [
				`\`\`\`${r}`,
				t.renderChildren(e.content),
				"```"
			].join("\n") : `\`\`\`${r}

\`\`\``, n;
		},
		addCommands() {
			return {
				setCodeBlock: (e) => ({ commands: t }) => t.setNode(this.name, e),
				toggleCodeBlock: (e) => ({ commands: t }) => t.toggleNode(this.name, "paragraph", e)
			};
		},
		addKeyboardShortcuts() {
			return {
				"Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
				Backspace: () => {
					let { empty: e, $anchor: t } = this.editor.state.selection, n = t.pos === 1;
					return !e || t.parent.type.name !== this.name ? !1 : n || !t.parent.textContent.length ? this.editor.commands.clearNodes() : !1;
				},
				Tab: ({ editor: e }) => {
					if (!this.options.enableTabIndentation) return !1;
					let t = this.options.tabSize ?? Iv, { state: n } = e, { selection: r } = n, { $from: i, empty: a } = r;
					if (i.parent.type !== this.type) return !1;
					let o = " ".repeat(t);
					return a ? e.commands.insertContent(o) : e.commands.command(({ tr: e }) => {
						let { from: t, to: i } = r, a = n.doc.textBetween(t, i, "\n", "\n").split("\n").map((e) => o + e).join("\n");
						return e.replaceWith(t, i, n.schema.text(a)), !0;
					});
				},
				"Shift-Tab": ({ editor: e }) => {
					if (!this.options.enableTabIndentation) return !1;
					let t = this.options.tabSize ?? Iv, { state: n } = e, { selection: r } = n, { $from: i, empty: a } = r;
					return i.parent.type === this.type ? a ? e.commands.command(({ tr: e }) => {
						let { pos: r } = i, a = i.start(), o = i.end(), s = n.doc.textBetween(a, o, "\n", "\n").split("\n"), c = 0, l = 0, u = r - a;
						for (let e = 0; e < s.length; e += 1) {
							if (l + s[e].length >= u) {
								c = e;
								break;
							}
							l += s[e].length + 1;
						}
						let d = s[c].match(/^ */)?.[0] || "", f = Math.min(d.length, t);
						if (f === 0) return !0;
						let p = a;
						for (let e = 0; e < c; e += 1) p += s[e].length + 1;
						return e.delete(p, p + f), r - p <= f && e.setSelection(F.create(e.doc, p)), !0;
					}) : e.commands.command(({ tr: e }) => {
						let { from: i, to: a } = r, o = n.doc.textBetween(i, a, "\n", "\n").split("\n").map((e) => {
							let n = e.match(/^ */)?.[0] || "", r = Math.min(n.length, t);
							return e.slice(r);
						}).join("\n");
						return e.replaceWith(i, a, n.schema.text(o)), !0;
					}) : !1;
				},
				Enter: ({ editor: e }) => {
					if (!this.options.exitOnTripleEnter) return !1;
					let { state: t } = e, { selection: n } = t, { $from: r, empty: i } = n;
					if (!i || r.parent.type !== this.type) return !1;
					let a = r.parentOffset === r.parent.nodeSize - 2, o = r.parent.textContent.endsWith("\n\n");
					return !a || !o ? !1 : e.chain().command(({ tr: e }) => (e.delete(r.pos - 2, r.pos), !0)).exitCode().run();
				},
				ArrowUp: ({ editor: e }) => {
					if (!this.options.exitOnArrowUp) return !1;
					let { state: t } = e, { selection: n } = t, { $from: r, empty: i } = n;
					if (!i || r.parent.type !== this.type || r.parentOffset !== 0) return !1;
					let a = r.before();
					return a > 0 ? !1 : e.commands.insertDefaultBlock({ pos: a });
				},
				ArrowDown: ({ editor: e }) => {
					if (!this.options.exitOnArrowDown) return !1;
					let { state: t } = e, { selection: n, doc: r } = t, { $from: i, empty: a } = n;
					if (!a || i.parent.type !== this.type || i.parentOffset !== i.parent.nodeSize - 2) return !1;
					let o = i.after();
					return o === void 0 ? !1 : r.nodeAt(o) ? e.commands.command(({ tr: e }) => (e.setSelection(P.near(r.resolve(o))), !0)) : e.commands.exitCode();
				}
			};
		},
		addInputRules() {
			return [Sp({
				find: Lv,
				type: this.type,
				getAttributes: (e) => ({ language: e[1] })
			}), Sp({
				find: Rv,
				type: this.type,
				getAttributes: (e) => ({ language: e[1] })
			})];
		},
		addProseMirrorPlugins() {
			return [new L({
				key: new R("codeBlockVSCodeHandler"),
				props: { handlePaste: (e, t) => {
					if (!t.clipboardData || this.editor.isActive(this.type.name)) return !1;
					let n = t.clipboardData.getData("text/plain"), r = t.clipboardData.getData("vscode-editor-data"), i = (r ? JSON.parse(r) : void 0)?.mode;
					if (!n || !i) return !1;
					let { tr: a, schema: o } = e.state, s = o.text(n.replace(/\r\n?/g, "\n"));
					return a.replaceSelectionWith(this.type.create({ language: i }, s)), a.selection.$from.parent.type !== this.type && a.setSelection(F.near(a.doc.resolve(Math.max(0, a.selection.from - 2)))), a.setMeta("paste", !0), e.dispatch(a), !0;
				} }
			})];
		}
	});
})), Vv, Hv = S((() => {
	J(), Vv = Dh.create({
		name: "doc",
		topNode: !0,
		content: "block+",
		renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n\n") : ""
	});
})), Uv, Wv = S((() => {
	J(), Uv = Dh.create({
		name: "hardBreak",
		markdownTokenName: "br",
		addOptions() {
			return {
				keepMarks: !0,
				HTMLAttributes: {}
			};
		},
		inline: !0,
		group: "inline",
		selectable: !1,
		linebreakReplacement: !0,
		parseHTML() {
			return [{ tag: "br" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			return ["br", K(this.options.HTMLAttributes, e)];
		},
		renderText() {
			return "\n";
		},
		renderMarkdown: () => "  \n",
		parseMarkdown: () => ({ type: "hardBreak" }),
		addCommands() {
			return { setHardBreak: () => ({ commands: e, chain: t, state: n, editor: r }) => e.first([() => e.exitCode(), () => e.command(() => {
				let { selection: e, storedMarks: i } = n;
				if (e.$from.parent.type.spec.isolating) return !1;
				let { keepMarks: a } = this.options, { splittableMarks: o } = r.extensionManager, s = i || e.$to.parentOffset && e.$from.marks();
				return t().insertContent({ type: this.name }).command(({ tr: e, dispatch: t }) => {
					if (t && s && a) {
						let t = s.filter((e) => o.includes(e.type.name));
						e.ensureMarks(t);
					}
					return !0;
				}).scrollIntoView().run();
			})]) };
		},
		addKeyboardShortcuts() {
			return {
				"Mod-Enter": () => this.editor.commands.setHardBreak(),
				"Shift-Enter": () => this.editor.commands.setHardBreak()
			};
		}
	});
})), Gv, Kv = S((() => {
	J(), Gv = Dh.create({
		name: "heading",
		addOptions() {
			return {
				levels: [
					1,
					2,
					3,
					4,
					5,
					6
				],
				HTMLAttributes: {}
			};
		},
		content: "inline*",
		group: "block",
		defining: !0,
		addAttributes() {
			return { level: {
				default: 1,
				rendered: !1
			} };
		},
		parseHTML() {
			return this.options.levels.map((e) => ({
				tag: `h${e}`,
				attrs: { level: e }
			}));
		},
		renderHTML({ node: e, HTMLAttributes: t }) {
			return [
				`h${this.options.levels.includes(e.attrs.level) ? e.attrs.level : this.options.levels[0]}`,
				K(this.options.HTMLAttributes, t),
				0
			];
		},
		parseMarkdown: (e, t) => t.createNode("heading", { level: e.depth || 1 }, t.parseInline(e.tokens || [])),
		renderMarkdown: (e, t) => {
			let n = e.attrs?.level ? parseInt(e.attrs.level, 10) : 1, r = "#".repeat(n);
			return e.content ? `${r} ${t.renderChildren(e.content)}` : "";
		},
		addCommands() {
			return {
				setHeading: (e) => ({ commands: t }) => this.options.levels.includes(e.level) ? t.setNode(this.name, e) : !1,
				toggleHeading: (e) => ({ commands: t }) => this.options.levels.includes(e.level) ? t.toggleNode(this.name, "paragraph", e) : !1
			};
		},
		addKeyboardShortcuts() {
			return this.options.levels.reduce((e, t) => ({
				...e,
				[`Mod-Alt-${t}`]: () => this.editor.commands.toggleHeading({ level: t })
			}), {});
		},
		addInputRules() {
			return this.options.levels.map((e) => Sp({
				find: RegExp(`^(#{${Math.min(...this.options.levels)},${e}})\\s$`),
				type: this.type,
				getAttributes: { level: e }
			}));
		}
	});
})), qv, Jv = S((() => {
	J(), xo(), qv = Dh.create({
		name: "horizontalRule",
		addOptions() {
			return {
				HTMLAttributes: {},
				nextNodeType: "paragraph"
			};
		},
		group: "block",
		parseHTML() {
			return [{ tag: "hr" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			return ["hr", K(this.options.HTMLAttributes, e)];
		},
		markdownTokenName: "hr",
		parseMarkdown: (e, t) => t.createNode("horizontalRule"),
		renderMarkdown: () => "---",
		addCommands() {
			return { setHorizontalRule: () => ({ chain: e, state: t }) => {
				if (!$f(t, t.schema.nodes[this.name])) return !1;
				let { selection: n } = t, { $to: r } = n, i = e();
				return Ef(n) ? i.insertContentAt(r.pos, { type: this.name }) : i.insertContent({ type: this.name }), i.command(({ state: e, tr: t, dispatch: n }) => {
					if (n) {
						let { $to: n } = t.selection, r = n.end();
						if (n.nodeAfter) n.nodeAfter.isTextblock ? t.setSelection(F.create(t.doc, n.pos + 1)) : n.nodeAfter.isBlock ? t.setSelection(I.create(t.doc, n.pos)) : t.setSelection(F.create(t.doc, n.pos));
						else {
							let i = (e.schema.nodes[this.options.nextNodeType] || n.parent.type.contentMatch.defaultType)?.create();
							i && (t.insert(r, i), t.setSelection(F.create(t.doc, r + 1)));
						}
						t.scrollIntoView();
					}
					return !0;
				}).run();
			} };
		},
		addInputRules() {
			return [xp({
				find: /^(?:---|—-|___\s|\*\*\*\s)$/,
				type: this.type
			})];
		}
	});
})), Yv, Xv, Zv, Qv, $v, ey = S((() => {
	J(), Yv = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/, Xv = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g, Zv = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/, Qv = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g, $v = ah.create({
		name: "italic",
		addOptions() {
			return { HTMLAttributes: {} };
		},
		parseHTML() {
			return [
				{ tag: "em" },
				{
					tag: "i",
					getAttrs: (e) => e.style.fontStyle !== "normal" && null
				},
				{
					style: "font-style=normal",
					clearMark: (e) => e.type.name === this.name
				},
				{ style: "font-style=italic" }
			];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"em",
				K(this.options.HTMLAttributes, e),
				0
			];
		},
		addCommands() {
			return {
				setItalic: () => ({ commands: e }) => e.setMark(this.name),
				toggleItalic: () => ({ commands: e }) => e.toggleMark(this.name),
				unsetItalic: () => ({ commands: e }) => e.unsetMark(this.name)
			};
		},
		markdownTokenName: "em",
		parseMarkdown: (e, t) => t.applyMark("italic", t.parseInline(e.tokens || [])),
		markdownOptions: { htmlReopen: {
			open: "<em>",
			close: "</em>"
		} },
		renderMarkdown: (e, t) => `*${t.renderChildren(e)}*`,
		addKeyboardShortcuts() {
			return {
				"Mod-i": () => this.editor.commands.toggleItalic(),
				"Mod-I": () => this.editor.commands.toggleItalic()
			};
		},
		addInputRules() {
			return [bp({
				find: Yv,
				type: this.type
			}), bp({
				find: Zv,
				type: this.type
			})];
		},
		addPasteRules() {
			return [wp({
				find: Xv,
				type: this.type
			}), wp({
				find: Qv,
				type: this.type
			})];
		}
	});
}));
//#endregion
//#region ../../node_modules/linkifyjs/dist/linkify.mjs
function ty(e, t) {
	return e in t || (t[e] = []), t[e];
}
function ny(e, t, n) {
	t[wy] && (t[Dy] = !0, t[Oy] = !0), t[Ty] && (t[Dy] = !0, t[Ey] = !0), t[Dy] && (t[Oy] = !0), t[Ey] && (t[Oy] = !0), t[Oy] && (t[ky] = !0), t[Ay] && (t[ky] = !0);
	for (let r in t) {
		let t = ty(r, n);
		t.indexOf(e) < 0 && t.push(e);
	}
}
function ry(e, t) {
	let n = {};
	for (let r in t) t[r].indexOf(e) >= 0 && (n[r] = !0);
	return n;
}
function iy(e = null) {
	this.j = {}, this.jr = [], this.jd = null, this.t = e;
}
function ay(e = []) {
	let t = {};
	iy.groups = t;
	let n = new iy();
	qb ??= ly(Sy), Jb ??= ly(Cy), Q(n, "'", ub), Q(n, "{", qy), Q(n, "}", Jy), Q(n, "[", Yy), Q(n, "]", Xy), Q(n, "(", Zy), Q(n, ")", Qy), Q(n, "<", $y), Q(n, ">", eb), Q(n, "（", tb), Q(n, "）", nb), Q(n, "「", rb), Q(n, "」", ib), Q(n, "『", ab), Q(n, "』", ob), Q(n, "＜", sb), Q(n, "＞", cb), Q(n, "&", lb), Q(n, "*", db), Q(n, "@", fb), Q(n, "`", mb), Q(n, "^", hb), Q(n, ":", gb), Q(n, ",", _b), Q(n, "$", vb), Q(n, ".", yb), Q(n, "=", bb), Q(n, "!", xb), Q(n, "-", Sb), Q(n, "%", Cb), Q(n, "|", wb), Q(n, "+", Tb), Q(n, "#", Eb), Q(n, "?", Db), Q(n, "\"", Ob), Q(n, "/", jb), Q(n, ";", Ab), Q(n, "~", Mb), Q(n, "_", Nb), Q(n, "\\", pb), Q(n, "・", kb);
	let r = Z(n, Bb, Wy, { [wy]: !0 });
	Z(r, Bb, r);
	let i = Z(r, Lb, Ly, { [Dy]: !0 }), a = Z(r, Rb, Ry, { [Oy]: !0 }), o = Z(n, Lb, Fy, { [Ty]: !0 });
	Z(o, Bb, i), Z(o, Lb, o), Z(i, Bb, i), Z(i, Lb, i);
	let s = Z(n, Rb, Iy, { [Ey]: !0 });
	Z(s, Lb), Z(s, Bb, a), Z(s, Rb, s), Z(a, Bb, a), Z(a, Lb), Z(a, Rb, a);
	let c = Q(n, Ub, Ky, { [Ny]: !0 }), l = Q(n, Hb, Gy, { [Ny]: !0 }), u = Z(n, Vb, Gy, { [Ny]: !0 });
	Q(n, Kb, u), Q(l, Ub, c), Q(l, Kb, u), Z(l, Vb, u), Q(u, Hb), Q(u, Ub), Z(u, Vb, u), Q(u, Kb, u);
	let d = Z(n, zb, Pb, { [Ay]: !0 });
	Q(d, "#"), Z(d, zb, d), Q(d, Wb, d);
	let f = Q(d, Gb);
	Q(f, "#"), Z(f, zb, d);
	let p = [[Lb, o], [Bb, i]], m = [
		[Lb, null],
		[Rb, s],
		[Bb, a]
	];
	for (let e = 0; e < qb.length; e++) cy(n, qb[e], By, Fy, p);
	for (let e = 0; e < Jb.length; e++) cy(n, Jb[e], Vy, Iy, m);
	ny(By, {
		tld: !0,
		ascii: !0
	}, t), ny(Vy, {
		utld: !0,
		alpha: !0
	}, t), cy(n, "file", Hy, Fy, p), cy(n, "mailto", Hy, Fy, p), cy(n, "http", Uy, Fy, p), cy(n, "https", Uy, Fy, p), cy(n, "ftp", Uy, Fy, p), cy(n, "ftps", Uy, Fy, p), ny(Hy, {
		scheme: !0,
		ascii: !0
	}, t), ny(Uy, {
		slashscheme: !0,
		ascii: !0
	}, t), e = e.sort((e, t) => e[0] > t[0] ? 1 : -1);
	for (let t = 0; t < e.length; t++) {
		let r = e[t][0], i = e[t][1] ? { [jy]: !0 } : { [My]: !0 };
		r.indexOf("-") >= 0 ? i[ky] = !0 : Lb.test(r) ? Bb.test(r) ? i[Dy] = !0 : i[Ty] = !0 : i[wy] = !0, Py(n, r, r, i);
	}
	return Py(n, "localhost", zy, { ascii: !0 }), n.jd = new iy(Fb), {
		start: n,
		tokens: Object.assign({ groups: t }, Ib)
	};
}
function oy(e, t) {
	let n = sy(t.replace(/[A-Z]/g, (e) => e.toLowerCase())), r = n.length, i = [], a = 0, o = 0;
	for (; o < r;) {
		let s = e, c = null, l = 0, u = null, d = -1, f = -1;
		for (; o < r && (c = s.go(n[o]));) s = c, s.accepts() ? (d = 0, f = 0, u = s) : d >= 0 && (d += n[o].length, f++), l += n[o].length, a += n[o].length, o++;
		a -= d, o -= f, l -= d, i.push({
			t: u.t,
			v: t.slice(a - l, a),
			s: a - l,
			e: a
		});
	}
	return i;
}
function sy(e) {
	let t = [], n = e.length, r = 0;
	for (; r < n;) {
		let i = e.charCodeAt(r), a, o = i < 55296 || i > 56319 || r + 1 === n || (a = e.charCodeAt(r + 1)) < 56320 || a > 57343 ? e[r] : e.slice(r, r + 2);
		t.push(o), r += o.length;
	}
	return t;
}
function cy(e, t, n, r, i) {
	let a, o = t.length;
	for (let n = 0; n < o - 1; n++) {
		let o = t[n];
		e.j[o] ? a = e.j[o] : (a = new iy(r), a.jr = i.slice(), e.j[o] = a), e = a;
	}
	return a = new iy(n), a.jr = i.slice(), e.j[t[o - 1]] = a, a;
}
function ly(e) {
	let t = [], n = [], r = 0;
	for (; r < e.length;) {
		let i = 0;
		for (; "0123456789".indexOf(e[r + i]) >= 0;) i++;
		if (i > 0) {
			t.push(n.join(""));
			for (let t = parseInt(e.substring(r, r + i), 10); t > 0; t--) n.pop();
			r += i;
		} else n.push(e[r]), r++;
	}
	return t;
}
function uy(e, t = null) {
	let n = Object.assign({}, Yb);
	e && (n = Object.assign(n, e instanceof uy ? e.o : e));
	let r = n.ignoreTags, i = [];
	for (let e = 0; e < r.length; e++) i.push(r[e].toUpperCase());
	this.o = n, t && (this.defaultRender = t), this.ignoreTags = i;
}
function dy(e) {
	return e;
}
function fy(e, t) {
	this.t = "token", this.v = e, this.tk = t;
}
function py(e, t) {
	class n extends fy {
		constructor(t, n) {
			super(t, n), this.t = e;
		}
	}
	for (let e in t) n.prototype[e] = t[e];
	return n.t = e, n;
}
function my({ groups: e }) {
	let t = e.domain.concat([
		lb,
		db,
		fb,
		pb,
		mb,
		hb,
		vb,
		bb,
		Sb,
		Wy,
		Cb,
		wb,
		Tb,
		Eb,
		jb,
		Fb,
		Mb,
		Nb
	]), n = [
		ub,
		gb,
		_b,
		yb,
		xb,
		Cb,
		Db,
		Ob,
		Ab,
		$y,
		eb,
		qy,
		Jy,
		Xy,
		Yy,
		Zy,
		Qy,
		tb,
		nb,
		rb,
		ib,
		ab,
		ob,
		sb,
		cb
	], r = [
		lb,
		ub,
		db,
		pb,
		mb,
		hb,
		vb,
		bb,
		Sb,
		qy,
		Jy,
		Cb,
		wb,
		Tb,
		Eb,
		Db,
		jb,
		Fb,
		Mb,
		Nb
	], i = ex(), a = Q(i, Mb);
	X(a, r, a), X(a, e.domain, a);
	let o = ex(), s = ex(), c = ex();
	X(i, e.domain, o), X(i, e.scheme, s), X(i, e.slashscheme, c), X(o, r, a), X(o, e.domain, o);
	let l = Q(o, fb);
	Q(a, fb, l), Q(s, fb, l), Q(c, fb, l);
	let u = Q(a, yb);
	X(u, r, a), X(u, e.domain, a);
	let d = ex();
	X(l, e.domain, d), X(d, e.domain, d);
	let f = Q(d, yb);
	X(f, e.domain, d);
	let p = ex(Xb);
	X(f, e.tld, p), X(f, e.utld, p), Q(l, zy, p);
	let m = Q(d, Sb);
	Q(m, Sb, m), X(m, e.domain, d), X(p, e.domain, d), Q(p, yb, f), Q(p, Sb, m);
	let h = Q(o, Sb), g = Q(o, yb);
	Q(h, Sb, h), X(h, e.domain, o), X(g, r, a), X(g, e.domain, o);
	let _ = ex($b);
	X(g, e.tld, _), X(g, e.utld, _), X(_, e.domain, o), X(_, r, a), Q(_, yb, g), Q(_, Sb, h), Q(_, fb, l);
	let v = Q(_, gb), y = ex($b);
	X(v, e.numeric, y);
	let b = ex($b), x = ex();
	X(b, t, b), X(b, n, x), X(x, t, b), X(x, n, x), Q(_, jb, b), Q(y, jb, b);
	let ee = Q(s, gb), te = Q(c, gb), S = Q(te, jb), ne = Q(S, jb);
	X(s, e.domain, o), Q(s, yb, g), Q(s, Sb, h), X(c, e.domain, o), Q(c, yb, g), Q(c, Sb, h), X(ee, e.domain, b), Q(ee, jb, b), Q(ee, Db, b), X(ne, e.domain, b), X(ne, t, b), Q(ne, jb, b);
	let re = [
		[qy, Jy],
		[Yy, Xy],
		[Zy, Qy],
		[$y, eb],
		[tb, nb],
		[rb, ib],
		[ab, ob],
		[sb, cb]
	];
	for (let e = 0; e < re.length; e++) {
		let [r, i] = re[e], a = Q(b, r);
		Q(x, r, a);
		let o = ex($b);
		X(a, t, o);
		let s = ex();
		X(a, n, s), Q(a, i, b), X(o, t, o), X(o, n, s), X(s, t, o), X(s, n, s), Q(o, i, b), Q(s, i, b);
	}
	return Q(i, zy, _), Q(i, Ky, Qb), {
		start: i,
		tokens: Ib
	};
}
function hy(e, t, n) {
	let r = n.length, i = 0, a = [], o = [];
	for (; i < r;) {
		let s = e, c = null, l = null, u = 0, d = null, f = -1;
		for (; i < r && !(c = s.go(n[i].t));) o.push(n[i++]);
		for (; i < r && (l = c || s.go(n[i].t));) c = null, s = l, s.accepts() ? (f = 0, d = s) : f >= 0 && f++, i++, u++;
		if (f < 0) i -= u, i < r && (o.push(n[i]), i++);
		else {
			o.length > 0 && (a.push(gy(Zb, t, o)), o = []), i -= f, u -= f;
			let e = d.t, r = n.slice(i - u, i);
			a.push(gy(e, t, r));
		}
	}
	return o.length > 0 && a.push(gy(Zb, t, o)), a;
}
function gy(e, t, n) {
	let r = n[0].s, i = n[n.length - 1].e;
	return new e(t.slice(r, i), n);
}
function _y() {
	return iy.groups = {}, $.scanner = null, $.parser = null, $.tokenQueue = [], $.pluginQueue = [], $.customSchemes = [], $.initialized = !1, $;
}
function vy(e, t = !1) {
	if ($.initialized && tx(`linkifyjs: already initialized - will not register custom scheme "${e}" ${nx}`), !/^[0-9a-z]+(-[0-9a-z]+)*$/.test(e)) throw Error("linkifyjs: incorrect scheme format.\n1. Must only contain digits, lowercase ASCII letters or \"-\"\n2. Cannot start or end with \"-\"\n3. \"-\" cannot repeat");
	$.customSchemes.push([e, t]);
}
function yy() {
	$.scanner = ay($.customSchemes);
	for (let e = 0; e < $.tokenQueue.length; e++) $.tokenQueue[e][1]({ scanner: $.scanner });
	$.parser = my($.scanner.tokens);
	for (let e = 0; e < $.pluginQueue.length; e++) $.pluginQueue[e][1]({
		scanner: $.scanner,
		parser: $.parser
	});
	return $.initialized = !0, $;
}
function by(e) {
	return $.initialized || yy(), hy($.parser.start, e, oy($.scanner.start, e));
}
function xy(e, t = null, n = null) {
	if (t && typeof t == "object") {
		if (n) throw Error(`linkifyjs: Invalid link type ${t}; must be a string`);
		n = t, t = null;
	}
	let r = new uy(n), i = by(e), a = [];
	for (let e = 0; e < i.length; e++) {
		let n = i[e];
		n.isLink && (!t || n.t === t) && r.check(n) && a.push(n.toFormattedObject(r));
	}
	return a;
}
var Sy, Cy, wy, Ty, Ey, Dy, Oy, ky, Ay, jy, My, Ny, X, Z, Py, Q, Fy, Iy, Ly, Ry, zy, By, Vy, Hy, Uy, Wy, Gy, Ky, qy, Jy, Yy, Xy, Zy, Qy, $y, eb, tb, nb, rb, ib, ab, ob, sb, cb, lb, ub, db, fb, pb, mb, hb, gb, _b, vb, yb, bb, xb, Sb, Cb, wb, Tb, Eb, Db, Ob, kb, Ab, jb, Mb, Nb, Pb, Fb, Ib, Lb, Rb, zb, Bb, Vb, Hb, Ub, Wb, Gb, Kb, qb, Jb, Yb, Xb, Zb, Qb, $b, ex, tx, nx, $, rx = S((() => {
	Sy = "aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4w0s2x0a2z0ure5ba0by2idu3namex4d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dad1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2odyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3nd0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rck0msd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0axi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp3ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2oodside6rk0s2ld3w2s1tc1f3xbox3erox4ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2", Cy = "ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2", wy = "numeric", Ty = "ascii", Ey = "alpha", Dy = "asciinumeric", Oy = "alphanumeric", ky = "domain", Ay = "emoji", jy = "scheme", My = "slashscheme", Ny = "whitespace", iy.groups = {}, iy.prototype = {
		accepts() {
			return !!this.t;
		},
		go(e) {
			let t = this, n = t.j[e];
			if (n) return n;
			for (let n = 0; n < t.jr.length; n++) {
				let r = t.jr[n][0], i = t.jr[n][1];
				if (i && r.test(e)) return i;
			}
			return t.jd;
		},
		has(e, t = !1) {
			return t ? e in this.j : !!this.go(e);
		},
		ta(e, t, n, r) {
			for (let i = 0; i < e.length; i++) this.tt(e[i], t, n, r);
		},
		tr(e, t, n, r) {
			r ||= iy.groups;
			let i;
			return t && t.j ? i = t : (i = new iy(t), n && r && ny(t, n, r)), this.jr.push([e, i]), i;
		},
		ts(e, t, n, r) {
			let i = this, a = e.length;
			if (!a) return i;
			for (let t = 0; t < a - 1; t++) i = i.tt(e[t]);
			return i.tt(e[a - 1], t, n, r);
		},
		tt(e, t, n, r) {
			r ||= iy.groups;
			let i = this;
			if (t && t.j) return i.j[e] = t, t;
			let a = t, o, s = i.go(e);
			return s ? (o = new iy(), Object.assign(o.j, s.j), o.jr.push.apply(o.jr, s.jr), o.jd = s.jd, o.t = s.t) : o = new iy(), a && (r && (o.t && typeof o.t == "string" ? ny(a, Object.assign(ry(o.t, r), n), r) : n && ny(a, n, r)), o.t = a), i.j[e] = o, o;
		}
	}, X = (e, t, n, r, i) => e.ta(t, n, r, i), Z = (e, t, n, r, i) => e.tr(t, n, r, i), Py = (e, t, n, r, i) => e.ts(t, n, r, i), Q = (e, t, n, r, i) => e.tt(t, n, r, i), Fy = "WORD", Iy = "UWORD", Ly = "ASCIINUMERICAL", Ry = "ALPHANUMERICAL", zy = "LOCALHOST", By = "TLD", Vy = "UTLD", Hy = "SCHEME", Uy = "SLASH_SCHEME", Wy = "NUM", Gy = "WS", Ky = "NL", qy = "OPENBRACE", Jy = "CLOSEBRACE", Yy = "OPENBRACKET", Xy = "CLOSEBRACKET", Zy = "OPENPAREN", Qy = "CLOSEPAREN", $y = "OPENANGLEBRACKET", eb = "CLOSEANGLEBRACKET", tb = "FULLWIDTHLEFTPAREN", nb = "FULLWIDTHRIGHTPAREN", rb = "LEFTCORNERBRACKET", ib = "RIGHTCORNERBRACKET", ab = "LEFTWHITECORNERBRACKET", ob = "RIGHTWHITECORNERBRACKET", sb = "FULLWIDTHLESSTHAN", cb = "FULLWIDTHGREATERTHAN", lb = "AMPERSAND", ub = "APOSTROPHE", db = "ASTERISK", fb = "AT", pb = "BACKSLASH", mb = "BACKTICK", hb = "CARET", gb = "COLON", _b = "COMMA", vb = "DOLLAR", yb = "DOT", bb = "EQUALS", xb = "EXCLAMATION", Sb = "HYPHEN", Cb = "PERCENT", wb = "PIPE", Tb = "PLUS", Eb = "POUND", Db = "QUERY", Ob = "QUOTE", kb = "FULLWIDTHMIDDLEDOT", Ab = "SEMI", jb = "SLASH", Mb = "TILDE", Nb = "UNDERSCORE", Pb = "EMOJI", Fb = "SYM", Ib = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		ALPHANUMERICAL: Ry,
		AMPERSAND: lb,
		APOSTROPHE: ub,
		ASCIINUMERICAL: Ly,
		ASTERISK: db,
		AT: fb,
		BACKSLASH: pb,
		BACKTICK: mb,
		CARET: hb,
		CLOSEANGLEBRACKET: eb,
		CLOSEBRACE: Jy,
		CLOSEBRACKET: Xy,
		CLOSEPAREN: Qy,
		COLON: gb,
		COMMA: _b,
		DOLLAR: vb,
		DOT: yb,
		EMOJI: Pb,
		EQUALS: bb,
		EXCLAMATION: xb,
		FULLWIDTHGREATERTHAN: cb,
		FULLWIDTHLEFTPAREN: tb,
		FULLWIDTHLESSTHAN: sb,
		FULLWIDTHMIDDLEDOT: kb,
		FULLWIDTHRIGHTPAREN: nb,
		HYPHEN: Sb,
		LEFTCORNERBRACKET: rb,
		LEFTWHITECORNERBRACKET: ab,
		LOCALHOST: zy,
		NL: Ky,
		NUM: Wy,
		OPENANGLEBRACKET: $y,
		OPENBRACE: qy,
		OPENBRACKET: Yy,
		OPENPAREN: Zy,
		PERCENT: Cb,
		PIPE: wb,
		PLUS: Tb,
		POUND: Eb,
		QUERY: Db,
		QUOTE: Ob,
		RIGHTCORNERBRACKET: ib,
		RIGHTWHITECORNERBRACKET: ob,
		SCHEME: Hy,
		SEMI: Ab,
		SLASH: jb,
		SLASH_SCHEME: Uy,
		SYM: Fb,
		TILDE: Mb,
		TLD: By,
		UNDERSCORE: Nb,
		UTLD: Vy,
		UWORD: Iy,
		WORD: Fy,
		WS: Gy
	}), Lb = /[a-z]/, Rb = /\p{L}/u, zb = /\p{Emoji}/u, Bb = /\d/, Vb = /\s/, Hb = "\r", Ub = "\n", Wb = "️", Gb = "‍", Kb = "￼", qb = null, Jb = null, Yb = {
		defaultProtocol: "http",
		events: null,
		format: dy,
		formatHref: dy,
		nl2br: !1,
		tagName: "a",
		target: null,
		rel: null,
		validate: !0,
		truncate: Infinity,
		className: null,
		attributes: null,
		ignoreTags: [],
		render: null
	}, uy.prototype = {
		o: Yb,
		ignoreTags: [],
		defaultRender(e) {
			return e;
		},
		check(e) {
			return this.get("validate", e.toString(), e);
		},
		get(e, t, n) {
			let r = t != null, i = this.o[e];
			return i && (typeof i == "object" ? (i = n.t in i ? i[n.t] : Yb[e], typeof i == "function" && r && (i = i(t, n))) : typeof i == "function" && r && (i = i(t, n.t, n)), i);
		},
		getObj(e, t, n) {
			let r = this.o[e];
			return typeof r == "function" && t != null && (r = r(t, n.t, n)), r;
		},
		render(e) {
			let t = e.render(this);
			return (this.get("render", null, e) || this.defaultRender)(t, e.t, e);
		}
	}, fy.prototype = {
		isLink: !1,
		toString() {
			return this.v;
		},
		toHref(e) {
			return this.toString();
		},
		toFormattedString(e) {
			let t = this.toString(), n = e.get("truncate", t, this), r = e.get("format", t, this);
			return n && r.length > n ? r.substring(0, n) + "…" : r;
		},
		toFormattedHref(e) {
			return e.get("formatHref", this.toHref(e.get("defaultProtocol")), this);
		},
		startIndex() {
			return this.tk[0].s;
		},
		endIndex() {
			return this.tk[this.tk.length - 1].e;
		},
		toObject(e = Yb.defaultProtocol) {
			return {
				type: this.t,
				value: this.toString(),
				isLink: this.isLink,
				href: this.toHref(e),
				start: this.startIndex(),
				end: this.endIndex()
			};
		},
		toFormattedObject(e) {
			return {
				type: this.t,
				value: this.toFormattedString(e),
				isLink: this.isLink,
				href: this.toFormattedHref(e),
				start: this.startIndex(),
				end: this.endIndex()
			};
		},
		validate(e) {
			return e.get("validate", this.toString(), this);
		},
		render(e) {
			let t = this, n = this.toHref(e.get("defaultProtocol")), r = e.get("formatHref", n, this), i = e.get("tagName", n, t), a = this.toFormattedString(e), o = {}, s = e.get("className", n, t), c = e.get("target", n, t), l = e.get("rel", n, t), u = e.getObj("attributes", n, t), d = e.getObj("events", n, t);
			return o.href = r, s && (o.class = s), c && (o.target = c), l && (o.rel = l), u && Object.assign(o, u), {
				tagName: i,
				attributes: o,
				content: a,
				eventListeners: d
			};
		}
	}, Xb = py("email", {
		isLink: !0,
		toHref() {
			return "mailto:" + this.toString();
		}
	}), Zb = py("text"), Qb = py("nl"), $b = py("url", {
		isLink: !0,
		toHref(e = Yb.defaultProtocol) {
			return this.hasProtocol() ? this.v : `${e}://${this.v}`;
		},
		hasProtocol() {
			let e = this.tk;
			return e.length >= 2 && e[0].t !== zy && e[1].t === gb;
		}
	}), ex = (e) => new iy(e), tx = typeof console < "u" && console && console.warn || (() => {}), nx = "until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.", $ = {
		scanner: null,
		parser: null,
		tokenQueue: [],
		pluginQueue: [],
		customSchemes: [],
		initialized: !1
	}, by.scan = oy;
}));
//#endregion
//#region ../../node_modules/@tiptap/extension-link/dist/index.js
function ix(e) {
	return e.length === 1 ? e[0].isLink : e.length === 3 && e[1].isLink ? ["()", "[]"].includes(e[0].value + e[2].value) : !1;
}
function ax(e) {
	return new L({
		key: new R("autolink"),
		appendTransaction: (t, n, r) => {
			let i = t.some((e) => e.docChanged) && !n.doc.eq(r.doc), a = t.some((e) => e.getMeta("preventAutolink"));
			if (!i || a) return;
			let { tr: o } = r;
			if (_f(Hd(n.doc, [...t])).forEach(({ newRange: t }) => {
				let n = Ud(r.doc, t, (e) => e.isTextblock), i, a;
				if (n.length > 1) i = n[0], a = r.doc.textBetween(i.pos, i.pos + i.node.nodeSize, void 0, " ");
				else if (n.length) {
					let e = r.doc.textBetween(t.from, t.to, " ", " ");
					if (!yx.test(e)) return;
					i = n[0], a = r.doc.textBetween(i.pos, t.to, void 0, " ");
				}
				if (i && a) {
					let t = a.split(vx).filter(Boolean);
					if (t.length <= 0) return !1;
					let n = t[t.length - 1], s = i.pos + a.lastIndexOf(n);
					if (!n) return !1;
					let c = by(n).map((t) => t.toObject(e.defaultProtocol));
					if (!ix(c)) return !1;
					c.filter((e) => e.isLink).map((e) => ({
						...e,
						from: s + e.start + 1,
						to: s + e.end + 1
					})).filter((e) => !r.schema.marks.code || !r.doc.rangeHasMark(e.from, e.to, r.schema.marks.code)).filter((t) => e.validate(t.value)).filter((t) => e.shouldAutoLink(t.value)).forEach((t) => {
						vf(t.from, t.to, r.doc).some((t) => t.mark.type === e.type) || o.addMark(t.from, t.to, e.type.create({ href: t.href }));
					});
				}
			}), o.steps.length) return o;
		}
	});
}
function ox(e) {
	return new L({
		key: new R("handleClickLink"),
		props: { handleClick: (t, n, r) => {
			if (r.button !== 0 || !t.editable) return !1;
			let i = null;
			if (r.target instanceof HTMLAnchorElement) i = r.target;
			else {
				let t = r.target;
				if (!t) return !1;
				let n = e.editor.view.dom;
				i = t.closest("a"), i && !n.contains(i) && (i = null);
			}
			if (!i) return !1;
			let a = !1;
			if (e.enableClickSelection && (a = e.editor.commands.extendMarkRange(e.type.name)), e.openOnClick) {
				let n = mf(t.state, e.type.name), r = i.href ?? n.href, o = i.target ?? n.target;
				r && (window.open(r, o), a = !0);
			}
			return a;
		} }
	});
}
function sx(e, t) {
	let n = 0;
	for (let r = t - 1; r >= 0 && e[r] === "\\"; --r) n += 1;
	return n % 2 == 1;
}
function cx(e, t) {
	let n = 0, r = 0;
	for (; r < t;) {
		if (e[r] !== "`") {
			r += 1;
			continue;
		}
		if (n === 0 && sx(e, r)) {
			r += 1;
			continue;
		}
		let i = 0;
		for (; r < t && e[r] === "`";) i += 1, r += 1;
		n === 0 ? n = i : i === n && (n = 0);
	}
	return n > 0;
}
function lx(e, t, n) {
	let [, r, i] = t;
	return (t.index ? e[t.index - 1] : void 0) === "!" || sx(e, t.index ?? 0) || cx(e, t.index ?? 0) ? !1 : !!r.trim() && n(i);
}
function ux(e) {
	let [t, n, r, , i, a, o] = e, s = i ?? a ?? o;
	return {
		index: e.index ?? 0,
		text: t,
		replaceWith: n,
		data: {
			href: r,
			title: s || null,
			markdown: !0
		}
	};
}
function dx(e, t) {
	return e.index < t.index + t.text.length && t.index < e.index + e.text.length;
}
function fx(e) {
	return {
		href: e.data?.href,
		title: e.data?.title ?? null
	};
}
function px(e) {
	let t = bp({
		find: (t) => {
			let n = xx.exec(t);
			return !n || !lx(t, n, e.isAllowedHref) ? null : ux(n);
		},
		type: e.type,
		getAttributes: fx
	});
	return new nh({
		find: t.find,
		handler: (e) => {
			let n = t.handler(e);
			return n !== null && e.state.tr.steps.length && e.state.tr.setMeta("preventAutolink", !0), n;
		}
	});
}
function mx(e) {
	let t = wp({
		find: (t) => {
			let n = [];
			for (let r of t.matchAll(Sx)) lx(t, r, e.isAllowedHref) && n.push(ux(r));
			let r = (e.findPlainUrls?.call(e, t) ?? []).filter((e) => !n.some((t) => dx(t, e)));
			return [...n, ...r];
		},
		type: e.type,
		getAttributes: fx
	});
	return new oh({
		find: t.find,
		handler: (e) => {
			let n = t.handler(e);
			return n !== null && e.state.tr.steps.length && e.match.data?.markdown && e.state.tr.setMeta("preventAutolink", !0), n;
		}
	});
}
function hx(e) {
	return new L({
		key: new R("handlePasteLink"),
		props: { handlePaste: (t, n, r) => {
			let { shouldAutoLink: i } = e, { state: a } = t, { selection: o } = a, { empty: s } = o;
			if (s) return !1;
			let c = "";
			r.content.forEach((e) => {
				c += e.textContent;
			});
			let l = xy(c, { defaultProtocol: e.defaultProtocol }).find((e) => e.isLink && e.value === c);
			return !c || !l || i !== void 0 && !i(l.value) ? !1 : e.editor.commands.setMark(e.type, { href: l.href });
		} }
	});
}
function gx(e, t) {
	let n = [
		"http",
		"https",
		"ftp",
		"ftps",
		"mailto",
		"tel",
		"callto",
		"sms",
		"cid",
		"xmpp"
	];
	return t && t.forEach((e) => {
		let t = typeof e == "string" ? e : e.scheme;
		t && n.push(t);
	}), !e || e.replace(bx, "").match(RegExp(`^(?:(?:${n.map((e) => e.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")}):|[^a-z]|[a-z0-9+.\\-]+(?:[^a-z+.\\-:]|$))`, "i"));
}
var _x, vx, yx, bx, xx, Sx, Cx, wx = S((() => {
	J(), rx(), xo(), _x = "[\0- \xA0 ᠎ -\u2029 　]", vx = new RegExp(_x), yx = RegExp(`${_x}$`), bx = new RegExp(_x, "g"), xx = /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+(?:(["'])(.*?)\3|“(.*?)”|‘(.*?)’))?\)$/, Sx = /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+(?:(["'])(.*?)\3|“(.*?)”|‘(.*?)’))?\)/g, Cx = ah.create({
		name: "link",
		priority: 1e3,
		keepOnSplit: !1,
		exitable: !0,
		onCreate() {
			this.options.validate && !this.options.shouldAutoLink && (this.options.shouldAutoLink = this.options.validate, console.warn("The `validate` option is deprecated. Rename to the `shouldAutoLink` option instead.")), this.options.protocols.forEach((e) => {
				if (typeof e == "string") {
					vy(e);
					return;
				}
				vy(e.scheme, e.optionalSlashes);
			});
		},
		onDestroy() {
			_y();
		},
		inclusive() {
			return this.options.autolink;
		},
		addOptions() {
			return {
				openOnClick: !0,
				enableClickSelection: !1,
				linkOnPaste: !0,
				markdownLinks: !1,
				autolink: !0,
				protocols: [],
				defaultProtocol: "http",
				HTMLAttributes: {
					target: "_blank",
					rel: "noopener noreferrer nofollow",
					class: null
				},
				isAllowedUri: (e, t) => !!gx(e, t.protocols),
				validate: (e) => !!e,
				shouldAutoLink: (e) => {
					let t = /^[a-z][a-z0-9+.-]*:\/\//i.test(e), n = /^[a-z][a-z0-9+.-]*:/i.test(e);
					if (t || n && !e.includes("@")) return !0;
					let r = (e.includes("@") ? e.split("@").pop() : e).split(/[/?#:]/)[0];
					return !(/^\d{1,3}(\.\d{1,3}){3}$/.test(r) || !/\./.test(r));
				}
			};
		},
		addAttributes() {
			return {
				href: {
					default: null,
					parseHTML(e) {
						return e.getAttribute("href");
					}
				},
				target: { default: this.options.HTMLAttributes.target ?? null },
				rel: { default: this.options.HTMLAttributes.rel ?? null },
				class: { default: this.options.HTMLAttributes.class ?? null },
				title: { default: null }
			};
		},
		parseHTML() {
			return [{
				tag: "a[href]",
				getAttrs: (e) => {
					let t = e.getAttribute("href");
					return !t || !this.options.isAllowedUri(t, {
						defaultValidate: (e) => !!gx(e, this.options.protocols),
						protocols: this.options.protocols,
						defaultProtocol: this.options.defaultProtocol
					}) ? !1 : null;
				}
			}];
		},
		renderHTML({ HTMLAttributes: e }) {
			return this.options.isAllowedUri(e.href, {
				defaultValidate: (e) => !!gx(e, this.options.protocols),
				protocols: this.options.protocols,
				defaultProtocol: this.options.defaultProtocol
			}) ? [
				"a",
				K(this.options.HTMLAttributes, e),
				0
			] : [
				"a",
				K(this.options.HTMLAttributes, {
					...e,
					href: ""
				}),
				0
			];
		},
		markdownTokenName: "link",
		parseMarkdown: (e, t) => t.applyMark("link", t.parseInline(e.tokens || []), {
			href: e.href,
			title: e.title || null
		}),
		renderMarkdown: (e, t) => {
			let n = e.attrs?.href ?? "", r = e.attrs?.title ?? "", i = t.renderChildren(e);
			return r ? `[${i}](${n} "${r}")` : `[${i}](${n})`;
		},
		addCommands() {
			return {
				setLink: (e) => ({ chain: t }) => {
					let { href: n } = e;
					return this.options.isAllowedUri(n, {
						defaultValidate: (e) => !!gx(e, this.options.protocols),
						protocols: this.options.protocols,
						defaultProtocol: this.options.defaultProtocol
					}) ? t().setMark(this.name, e).setMeta("preventAutolink", !0).run() : !1;
				},
				toggleLink: (e) => ({ chain: t }) => {
					let { href: n } = e || {};
					return n && !this.options.isAllowedUri(n, {
						defaultValidate: (e) => !!gx(e, this.options.protocols),
						protocols: this.options.protocols,
						defaultProtocol: this.options.defaultProtocol
					}) ? !1 : t().toggleMark(this.name, e, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run();
				},
				unsetLink: () => ({ chain: e }) => e().unsetMark(this.name, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run()
			};
		},
		addInputRules() {
			return this.options.markdownLinks ? [px({
				type: this.type,
				isAllowedHref: (e) => this.options.isAllowedUri(e, {
					defaultValidate: (e) => !!gx(e, this.options.protocols),
					protocols: this.options.protocols,
					defaultProtocol: this.options.defaultProtocol
				})
			})] : [];
		},
		addPasteRules() {
			let e = (e) => {
				let t = [];
				if (e) {
					let { protocols: n, defaultProtocol: r } = this.options;
					xy(e).filter((e) => e.isLink && this.options.isAllowedUri(e.value, {
						defaultValidate: (e) => !!gx(e, n),
						protocols: n,
						defaultProtocol: r
					})).forEach((e) => {
						this.options.shouldAutoLink(e.value) && t.push({
							text: e.value,
							data: { href: e.href },
							index: e.start
						});
					});
				}
				return t;
			};
			return this.options.markdownLinks ? [mx({
				type: this.type,
				isAllowedHref: (e) => this.options.isAllowedUri(e, {
					defaultValidate: (e) => !!gx(e, this.options.protocols),
					protocols: this.options.protocols,
					defaultProtocol: this.options.defaultProtocol
				}),
				findPlainUrls: e
			})] : [wp({
				find: e,
				type: this.type,
				getAttributes: (e) => ({ href: e.data?.href })
			})];
		},
		addProseMirrorPlugins() {
			let e = [], { protocols: t, defaultProtocol: n } = this.options;
			return this.options.autolink && e.push(ax({
				type: this.type,
				defaultProtocol: this.options.defaultProtocol,
				validate: (e) => this.options.isAllowedUri(e, {
					defaultValidate: (e) => !!gx(e, t),
					protocols: t,
					defaultProtocol: n
				}),
				shouldAutoLink: this.options.shouldAutoLink
			})), e.push(ox({
				type: this.type,
				editor: this.editor,
				openOnClick: this.options.openOnClick === "whenNotEditable" || this.options.openOnClick,
				enableClickSelection: this.options.enableClickSelection
			})), this.options.linkOnPaste && e.push(hx({
				editor: this.editor,
				defaultProtocol: this.options.defaultProtocol,
				type: this.type,
				shouldAutoLink: this.options.shouldAutoLink
			})), e;
		}
	});
}));
//#endregion
//#region ../../node_modules/@tiptap/extension-list/dist/index.js
function Tx(e) {
	let t = e, n = "";
	for (let [e, r] of aS) for (; t >= e;) n += r, t -= e;
	return n;
}
function Ex(e) {
	return Tx(e).toUpperCase();
}
function Dx(e) {
	let t = e.toLowerCase(), n = 0, r = 0;
	for (; n < t.length;) {
		let e = !1;
		for (let [i, a] of aS) if (t.startsWith(a, n)) {
			r += i, n += a.length, e = !0;
			break;
		}
		if (!e) return 0;
	}
	return r;
}
function Ox(e) {
	if (!/^[ivxlcdmIVXLCDM]+$/.test(e)) return !1;
	let t = Dx(e);
	return t <= 0 ? !1 : (e === e.toLowerCase() ? Tx(t) : Ex(t)) === e;
}
function kx(e) {
	let t = e.toLowerCase();
	if (t.length === 1) return t.charCodeAt(0) - 97 + 1;
	if (t.length === 2) {
		let e = t.charCodeAt(0) - 97, n = t.charCodeAt(1) - 97;
		return (e + 1) * 26 + n + 1;
	}
	return 0;
}
function Ax(e) {
	if (e <= 26) return oS[e - 1];
	let t = Math.floor((e - 1) / 26) - 1, n = (e - 1) % 26;
	return t < 0 ? oS[n] : oS[t] + oS[n];
}
function jx(e) {
	if (!(!e || /^\d+$/.test(e))) {
		if (Ox(e)) return e === e.toLowerCase() ? "i" : "I";
		if (/^[a-z]{1,2}$/.test(e)) return "a";
		if (/^[A-Z]{1,2}$/.test(e)) return "A";
	}
}
function Mx(e) {
	if (/^\d+$/.test(e)) return parseInt(e, 10);
	let t = jx(e);
	if (t === "i" || t === "I") return Dx(e);
	if (t === "a" || t === "A") {
		let t = kx(e);
		return t > 0 ? t : 1;
	}
	let n = parseInt(e, 10);
	return Number.isNaN(n) ? 1 : n;
}
function Nx(e, t) {
	if (e === "numeric") return String(t);
	switch (e) {
		case "a": return Ax(t);
		case "A": return Ax(t).toUpperCase();
		case "i": return Tx(t);
		case "I": return Ex(t);
		default: return String(t);
	}
}
function Px(e) {
	if (e.length === 0) return !1;
	let t = jx(e[0]) ?? "numeric", n = Mx(e[0]);
	if (n < 1) return !1;
	for (let r = 0; r < e.length; r++) {
		let i = Nx(t, n + r);
		if (e[r] !== i) return !1;
	}
	return !0;
}
function Fx(e) {
	return {
		type: jx(e),
		start: Mx(e)
	};
}
function Ix(e) {
	let { type: t, start: n } = Fx(e), r = {};
	return t && (r.type = t), n !== 1 && (r.start = n), r;
}
function Lx(e, t, n = ". ") {
	let r = t + 1;
	if (!e || e === "1") return `${r}${n}`;
	switch (e) {
		case "a": return `${Ax(r)}${n}`;
		case "A": return `${Ax(r).toUpperCase()}${n}`;
		case "i": return `${Tx(r)}${n}`;
		case "I": return `${Ex(r)}${n}`;
		default: return `${r}${n}`;
	}
}
function Rx(e) {
	let t = e.tokens?.[0];
	return !!(e.text && e.tokens?.length === 1 && t?.type === "list" && t.ordered && t.raw === e.text);
}
function zx(e, t) {
	return t.tokenizeInline ? t.parseInline(t.tokenizeInline(e)) : t.parseInline([{
		type: "text",
		raw: e,
		text: e
	}]);
}
function Bx(e) {
	return SS.test(e.trimStart());
}
function Vx(e) {
	let t = e.trimStart();
	return wS.bulletItem.test(t) || Bx(t) || wS.heading.test(t) || wS.thematicBreak.test(t) && !t.startsWith("-") || /^>\s?/.test(t) || wS.codeFence.test(t) || wS.blockMath.test(t);
}
function Hx(e) {
	return Object.values(wS).some((t) => t.test(e));
}
function Ux(e) {
	let t = [], n = [], r = !1;
	return e.forEach((e) => {
		if (r) {
			n.push(e);
			return;
		}
		if (e.trim() === "") {
			r = !0, n.push(e);
			return;
		}
		if (t.length > 0 && Vx(e)) {
			r = !0, n.push(e);
			return;
		}
		t.push(e);
	}), {
		paragraphLines: t,
		blockLines: n
	};
}
function Wx(e) {
	let t = [], n = 0, r = 0;
	for (; n < e.length;) {
		let i = e[n], a = i.match(SS);
		if (!a) break;
		let [, o, s, c, l] = a, u = o.length, d = parseInt(s, 10), f = isNaN(d) ? jx(s) : void 0, p = isNaN(d) ? Mx(s) : d, m = [l], h = n + 1, g = [i], _ = !1;
		for (; h < e.length;) {
			let t = e[h];
			if (t.match(SS)) break;
			if (t.trim() === "") g.push(t), m.push(""), _ = !0, h += 1;
			else if (t.match(CS)) {
				let e = t.length - t.trimStart().length, n = u + s.length + 1;
				g.push(t), m.push(t.slice(Math.min(e, n))), h += 1;
			} else {
				if (_ || Hx(t)) break;
				g.push(t), m.push(t), h += 1;
			}
		}
		t.push({
			indent: u,
			number: p,
			type: f,
			content: m.join("\n").trim(),
			contentLines: m,
			raw: g.join("\n")
		}), r = h, n = h;
	}
	return [t, r];
}
function Gx(e) {
	let t = e.split("\n").filter((e) => e.trim().length > 0);
	if (t.length === 0) return null;
	let n = [];
	for (let e of t) {
		let t = e.trim().match(TS);
		if (!t) return null;
		n.push({
			marker: t[1],
			content: t[3]
		});
	}
	return Px(n.map((e) => e.marker)) ? {
		type: "orderedList",
		attrs: Ix(n[0].marker),
		content: n.map((e) => ({
			type: "listItem",
			content: [{
				type: "paragraph",
				content: [{
					type: "text",
					text: e.content
				}]
			}]
		}))
	} : null;
}
function Kx(e, t, n) {
	let r = [], i = 0;
	for (; i < e.length;) {
		let a = e[i];
		if (a.indent === t) {
			let { paragraphLines: o, blockLines: s } = Ux(a.contentLines), c = o.join("\n").trim(), l = [];
			c && l.push({
				type: "paragraph",
				raw: c,
				tokens: n.inlineTokens(c)
			});
			let u = s.join("\n").trim();
			if (u) {
				let e = n.blockTokens(u);
				l.push(...e);
			}
			let d = i + 1, f = [];
			for (; d < e.length && e[d].indent > t;) f.push(e[d]), d += 1;
			if (f.length > 0) {
				let e = Kx(f, Math.min(...f.map((e) => e.indent)), n);
				l.push({
					type: "list",
					ordered: !0,
					start: f[0].number,
					typeMarker: f[0].type,
					items: e,
					raw: f.map((e) => e.raw).join("\n")
				});
			}
			r.push({
				type: "list_item",
				raw: a.raw,
				tokens: l
			}), i = d;
		} else i += 1;
	}
	return r;
}
function qx(e, t) {
	return e.map((e) => {
		if (e.type !== "list_item") return t.parseChildren([e])[0];
		let n = [];
		return e.tokens && e.tokens.length > 0 && e.tokens.forEach((e) => {
			if (e.type === "paragraph" || e.type === "list" || e.type === "blockquote" || e.type === "code") n.push(...t.parseChildren([e]));
			else if (e.type === "text" && e.tokens) {
				let r = t.parseChildren([e]);
				n.push({
					type: "paragraph",
					content: r
				});
			} else {
				let r = t.parseChildren([e]);
				r.length > 0 && n.push(...r);
			}
		}), {
			type: "listItem",
			content: n
		};
	});
}
function Jx(e) {
	let t = e.match(/list-style-type\s*:\s*([^;]+)/i);
	if (!t) return null;
	switch (t[1].trim().toLowerCase()) {
		case "upper-roman": return "I";
		case "lower-roman": return "i";
		case "upper-alpha":
		case "upper-latin": return "A";
		case "lower-alpha":
		case "lower-latin": return "a";
		default: return null;
	}
}
var Yx, Xx, Zx, Qx, $x, eS, tS, nS, rS, iS, aS, oS, sS, cS, lS, uS, dS, fS, pS, mS, hS, gS, _S, vS, yS, bS, xS, SS, CS, wS, TS, ES, DS, OS, kS, AS, jS, MS, NS, PS, FS = S((() => {
	J(), So(), xo(), Yx = Object.defineProperty, Xx = (e, t) => {
		for (var n in t) Yx(e, n, {
			get: t[n],
			enumerable: !0
		});
	}, Zx = "listItem", Qx = "textStyle", $x = /^\s*([-+*])\s$/, eS = Dh.create({
		name: "bulletList",
		addOptions() {
			return {
				itemTypeName: "listItem",
				HTMLAttributes: {},
				keepMarks: !1,
				keepAttributes: !1
			};
		},
		group: "block list",
		content() {
			return `${this.options.itemTypeName}+`;
		},
		parseHTML() {
			return [{ tag: "ul" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"ul",
				K(this.options.HTMLAttributes, e),
				0
			];
		},
		markdownTokenName: "list",
		parseMarkdown: (e, t) => e.type !== "list" || e.ordered ? [] : {
			type: "bulletList",
			content: e.items ? t.parseChildren(e.items) : []
		},
		renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n") : "",
		markdownOptions: { indentsContent: !0 },
		addCommands() {
			return { toggleBulletList: () => ({ commands: e, chain: t }) => this.options.keepAttributes ? t().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(Zx, this.editor.getAttributes(Qx)).run() : e.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks) };
		},
		addKeyboardShortcuts() {
			return { "Mod-Shift-8": () => this.editor.commands.toggleBulletList() };
		},
		addInputRules() {
			let e = Cp({
				find: $x,
				type: this.type
			});
			return (this.options.keepMarks || this.options.keepAttributes) && (e = Cp({
				find: $x,
				type: this.type,
				keepMarks: this.options.keepMarks,
				keepAttributes: this.options.keepAttributes,
				getAttributes: () => this.editor.getAttributes(Qx),
				editor: this.editor
			})), [e];
		}
	}), tS = (e, t, n) => {
		let { selection: r } = e;
		if (!r.empty) return null;
		let { $from: i } = r;
		if (!i.parent.isTextblock || i.parentOffset !== i.parent.content.size) return null;
		let a = -1;
		for (let e = i.depth; e > 0; --e) if (i.node(e).type.name === t) {
			a = e;
			break;
		}
		if (a < 0) return null;
		let o = i.node(a), s = i.index(a);
		if (s + 1 >= o.childCount) return null;
		let c = o.child(s + 1);
		if (!n.includes(c.type.name)) return null;
		let l = e.schema.nodes[t], u = !1;
		if (c.forEach((e) => {
			e.type === l && e.childCount > 1 && (u = !0);
		}), !u) return null;
		let d = e.doc.resolve(i.after()).nodeAfter;
		if (!d || !n.includes(d.type.name)) return null;
		let f = [];
		return d.forEach((e) => {
			f.push(e);
		}), f.length === 0 ? null : {
			listItemDepth: a,
			nestedList: d,
			nestedListPos: i.after(),
			insertPos: i.after(a),
			items: f
		};
	}, nS = (e, t, n, r) => {
		let i = tS(e, n, r);
		if (!i) return !1;
		let { selection: a } = e, { nestedList: o, nestedListPos: s, insertPos: c, items: l } = i, u = e.tr;
		u.delete(s, s + o.nodeSize);
		let d = u.mapping.map(c);
		return u.insert(d, j.from(l)), u.setSelection(a.map(u.doc, u.mapping)), t && t(u), !0;
	}, rS = (e, t, n) => nS(e.state, e.view.dispatch, t, n), iS = (e, t) => q.create({
		name: `${e}BranchingDeleteKeymap`,
		priority: 101,
		addKeyboardShortcuts() {
			let n = () => rS(this.editor, e, t);
			return {
				Delete: n,
				"Mod-Delete": n
			};
		}
	}), aS = [
		[1e3, "m"],
		[900, "cm"],
		[500, "d"],
		[400, "cd"],
		[100, "c"],
		[90, "xc"],
		[50, "l"],
		[40, "xl"],
		[10, "x"],
		[9, "ix"],
		[5, "v"],
		[4, "iv"],
		[1, "i"]
	], oS = "abcdefghijklmnopqrstuvwxyz", sS = String.raw`\d+|[ivxlcdmIVXLCDM]+|${"[a-zA-Z]{1,2}"}`, cS = Dh.create({
		name: "listItem",
		addOptions() {
			return {
				HTMLAttributes: {},
				bulletListTypeName: "bulletList",
				orderedListTypeName: "orderedList"
			};
		},
		content: "paragraph block*",
		defining: !0,
		parseHTML() {
			return [{ tag: "li" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"li",
				K(this.options.HTMLAttributes, e),
				0
			];
		},
		markdownTokenName: "list_item",
		parseMarkdown: (e, t) => {
			if (e.type !== "list_item") return [];
			let n = t.parseBlockChildren ?? t.parseChildren, r = [];
			if (e.tokens && e.tokens.length > 0) {
				if (Rx(e)) return {
					type: "listItem",
					content: [{
						type: "paragraph",
						content: zx(e.text || "", t)
					}]
				};
				if (e.tokens.some((e) => e.type === "paragraph")) r = n(e.tokens);
				else {
					let i = e.tokens[0];
					if (i && i.type === "text" && i.tokens && i.tokens.length > 0) {
						if (r = [{
							type: "paragraph",
							content: t.parseInline(i.tokens)
						}], e.tokens.length > 1) {
							let t = n(e.tokens.slice(1));
							r.push(...t);
						}
					} else r = n(e.tokens);
				}
			}
			return r.length === 0 && (r = [{
				type: "paragraph",
				content: []
			}]), {
				type: "listItem",
				content: r
			};
		},
		renderMarkdown: (e, t, n) => fp(e, t, (e) => {
			if (e.parentType === "bulletList") return "- ";
			if (e.parentType === "orderedList") {
				let t = e.meta?.parentAttrs?.start || 1;
				return Lx(e.meta?.parentAttrs?.type, t - 1 + (e.index || 0), ". ");
			}
			return "- ";
		}, n),
		addExtensions() {
			return [iS(this.name, [this.options.bulletListTypeName, this.options.orderedListTypeName])];
		},
		addKeyboardShortcuts() {
			return {
				Enter: () => this.editor.commands.splitListItem(this.name),
				Tab: () => this.editor.commands.sinkListItem(this.name),
				"Shift-Tab": () => this.editor.commands.liftListItem(this.name)
			};
		}
	}), lS = {}, Xx(lS, {
		findListItemPos: () => uS,
		getNextListDepth: () => dS,
		handleBackspace: () => pS,
		handleDelete: () => gS,
		handleTab: () => _S,
		hasListBefore: () => fS,
		hasListItemAfter: () => vS,
		hasListItemBefore: () => yS,
		listItemHasSubList: () => bS,
		nextListIsDeeper: () => mS,
		nextListIsHigher: () => hS
	}), uS = (e, t) => {
		let { $from: n } = t.selection, r = U(e, t.schema), i = null, a = n.depth, o = n.pos, s = null;
		for (; a > 0 && s === null;) i = n.node(a), i.type === r ? s = a : (--a, --o);
		return s === null ? null : {
			$pos: t.doc.resolve(o),
			depth: s
		};
	}, dS = (e, t) => {
		let n = uS(e, t);
		if (!n) return !1;
		let [, r] = bm(t, e, n.$pos.pos + 4);
		return r;
	}, fS = (e, t, n) => {
		let { $anchor: r } = e.selection, i = Math.max(0, r.pos - 2), a = e.doc.resolve(i).node();
		return !(!a || !n.includes(a.type.name));
	}, pS = (e, t, n) => {
		if (e.commands.undoInputRule()) return !0;
		if (e.state.selection.from !== e.state.selection.to) return !1;
		if (!Ld(e.state, t) && fS(e.state, t, n)) {
			let { $anchor: n } = e.state.selection, r = e.state.doc.resolve(n.before() - 1), i = [];
			r.node().descendants((e, n) => {
				e.type.name === t && i.push({
					node: e,
					pos: n
				});
			});
			let a = i.at(-1);
			if (!a) return !1;
			let o = e.state.doc.resolve(r.start() + a.pos + 1);
			return e.chain().cut({
				from: n.start() - 1,
				to: n.end() + 1
			}, o.end()).joinForward().run();
		}
		if (!Ld(e.state, t) || !wm(e.state)) return !1;
		let { $from: r } = e.state.selection, i = r.depth - 1;
		return r.node(i).type !== e.schema.nodes[t] || r.index(i) !== 0 ? !1 : e.chain().liftListItem(t).run();
	}, mS = (e, t) => {
		let n = dS(e, t), r = uS(e, t);
		return !r || !n ? !1 : n > r.depth;
	}, hS = (e, t) => {
		let n = dS(e, t), r = uS(e, t);
		return !r || !n ? !1 : n < r.depth;
	}, gS = (e, t) => {
		if (!Ld(e.state, t) || !Cm(e.state, t)) return !1;
		let { selection: n } = e.state, { $from: r, $to: i } = n;
		return !n.empty && r.sameParent(i) ? !1 : mS(t, e.state) ? e.chain().focus(e.state.selection.from + 4).lift(t).joinBackward().run() : hS(t, e.state) ? e.chain().joinForward().joinBackward().run() : e.commands.joinItemForward();
	}, _S = (e, t, n) => {
		let { state: r } = e, { selection: i } = r;
		if (!i.empty) return !1;
		let { $from: a } = i;
		if (a.parentOffset !== 0 || !a.parent.isTextblock || Ld(r, t)) return !1;
		let o = xm(a);
		if (!o || !n.includes(o.type.name)) return !1;
		let s = o.lastChild;
		if (!s || s.type.name !== t) return !1;
		let c = a.parent;
		if (!s.canReplace(s.childCount, s.childCount, j.from(c))) return !1;
		let l = a.before(), u = a.after(), d = l - 2;
		return e.commands.command(({ tr: e, dispatch: t }) => (t && (e.delete(l, u).insert(d, j.from(c)), e.setSelection(F.create(e.doc, d + 1)), e.scrollIntoView()), !0));
	}, vS = (e, t) => {
		let { $anchor: n } = t.selection, r = t.doc.resolve(n.pos - n.parentOffset - 2);
		return r.index() !== r.parent.childCount - 1 && r.nodeAfter?.type.name === e;
	}, yS = (e, t) => {
		let { $anchor: n } = t.selection, r = t.doc.resolve(n.pos - 2);
		return r.index() !== 0 && r.nodeBefore?.type.name === e;
	}, bS = (e, t, n) => {
		if (!n) return !1;
		let r = U(e, t.schema), i = !1;
		return n.descendants((e) => {
			e.type === r && (i = !0);
		}), i;
	}, xS = q.create({
		name: "listKeymap",
		addOptions() {
			return { listTypes: [{
				itemName: "listItem",
				wrapperNames: ["bulletList", "orderedList"]
			}, {
				itemName: "taskItem",
				wrapperNames: ["taskList"]
			}] };
		},
		addKeyboardShortcuts() {
			return {
				Delete: ({ editor: e }) => {
					let t = !1;
					return this.options.listTypes.forEach(({ itemName: n }) => {
						e.state.schema.nodes[n] !== void 0 && gS(e, n) && (t = !0);
					}), t;
				},
				"Mod-Delete": ({ editor: e }) => {
					let t = !1;
					return this.options.listTypes.forEach(({ itemName: n }) => {
						e.state.schema.nodes[n] !== void 0 && gS(e, n) && (t = !0);
					}), t;
				},
				Backspace: ({ editor: e }) => {
					let t = !1;
					return this.options.listTypes.forEach(({ itemName: n, wrapperNames: r }) => {
						e.state.schema.nodes[n] !== void 0 && pS(e, n, r) && (t = !0);
					}), t;
				},
				"Mod-Backspace": ({ editor: e }) => {
					let t = !1;
					return this.options.listTypes.forEach(({ itemName: n, wrapperNames: r }) => {
						e.state.schema.nodes[n] !== void 0 && pS(e, n, r) && (t = !0);
					}), t;
				},
				Tab: ({ editor: e }) => {
					for (let { itemName: t, wrapperNames: n } of this.options.listTypes) if (e.state.schema.nodes[t] !== void 0 && _S(e, t, n)) return !0;
					return !1;
				}
			};
		}
	}), SS = RegExp(`^(\\s*)(${sS})([.)])\\s+(.*)$`), CS = /^\s/, wS = {
		heading: /^#{1,6}(?:\s|$)/,
		bulletItem: /^[-+*]\s+/,
		codeFence: /^(?:```|~~~)/,
		blockMath: /^\$\$/,
		thematicBreak: /^(?:(?:-[ \t]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})$/
	}, TS = RegExp(`^(${sS})([.)])\\s+(.+)$`), ES = "listItem", DS = "textStyle", OS = /^(\d+)\.\s$/, kS = Dh.create({
		name: "orderedList",
		addOptions() {
			return {
				itemTypeName: "listItem",
				HTMLAttributes: {},
				keepMarks: !1,
				keepAttributes: !1
			};
		},
		group: "block list",
		content() {
			return `${this.options.itemTypeName}+`;
		},
		addAttributes() {
			return {
				start: {
					default: 1,
					parseHTML: (e) => e.hasAttribute("start") ? parseInt(e.getAttribute("start") || "", 10) : 1
				},
				type: {
					default: null,
					parseHTML: (e) => {
						let t = e.getAttribute("type");
						if (t) return t;
						let n = e.getAttribute("style");
						if (n) {
							let e = Jx(n);
							if (e) return e;
						}
						let r = e.querySelector("li");
						if (r) {
							let e = r.getAttribute("style");
							if (e) {
								let t = Jx(e);
								if (t) return t;
							}
						}
						return null;
					}
				}
			};
		},
		parseHTML() {
			return [{ tag: "ol" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			let { start: t, type: n, ...r } = e, i = K(this.options.HTMLAttributes, r);
			return t !== 1 && (i.start = t), n && n !== "1" && (i.type = n), [
				"ol",
				i,
				0
			];
		},
		markdownTokenName: "list",
		parseMarkdown: (e, t) => {
			if (e.type !== "list" || !e.ordered) return [];
			let n = e.start || 1, r = e.typeMarker, i = e.items ? qx(e.items, t) : [], a = {};
			return n !== 1 && (a.start = n), r && (a.type = r), Object.keys(a).length > 0 ? {
				type: "orderedList",
				attrs: a,
				content: i
			} : {
				type: "orderedList",
				content: i
			};
		},
		renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n") : "",
		markdownTokenizer: {
			name: "orderedList",
			level: "block",
			start: () => -1,
			tokenize: (e, t, n) => {
				let r = e.split("\n"), [i, a] = Wx(r);
				if (i.length === 0) return;
				let o = Kx(i, i[0].indent, n);
				if (o.length !== 0) return {
					type: "list",
					ordered: !0,
					start: i[0]?.number || 1,
					typeMarker: i[0]?.type,
					items: o,
					raw: r.slice(0, a).join("\n")
				};
			}
		},
		markdownOptions: { indentsContent: !0 },
		addCommands() {
			return { toggleOrderedList: () => ({ commands: e, chain: t }) => this.options.keepAttributes ? t().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ES, this.editor.getAttributes(DS)).run() : e.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks) };
		},
		addKeyboardShortcuts() {
			return { "Mod-Shift-7": () => this.editor.commands.toggleOrderedList() };
		},
		addProseMirrorPlugins() {
			return [new L({ props: { handlePaste: (e, t) => {
				if ((t.clipboardData?.getData("text/html"))?.trim()) return !1;
				let n = t.clipboardData?.getData("text/plain");
				if (!n) return !1;
				let r = Gx(n);
				if (!r) return !1;
				try {
					let t = e.state.schema.nodeFromJSON(r), n = e.state.tr.replaceSelectionWith(t);
					return e.dispatch(n), !0;
				} catch {
					return !1;
				}
			} } })];
		},
		addInputRules() {
			let e = (e, t) => (!t.attrs.type || t.attrs.type === "1") && t.childCount + t.attrs.start === +e[1], t = Cp({
				find: OS,
				type: this.type,
				getAttributes: (e) => ({ start: +e[1] }),
				joinPredicate: e
			});
			return (this.options.keepMarks || this.options.keepAttributes) && (t = Cp({
				find: OS,
				type: this.type,
				keepMarks: this.options.keepMarks,
				keepAttributes: this.options.keepAttributes,
				getAttributes: (e) => ({
					start: +e[1],
					...this.editor.getAttributes(DS)
				}),
				joinPredicate: e,
				editor: this.editor
			})), [t];
		}
	}), AS = /^\s*(\[([( |x])?\])\s$/, jS = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0", MS = (e, t, n) => (n?.checkboxLabel)?.call(n, e, t) || `Task item checkbox for ${e.textContent || "empty task item"}`, NS = Dh.create({
		name: "taskItem",
		addOptions() {
			return {
				nested: !1,
				HTMLAttributes: {},
				taskListTypeName: "taskList",
				a11y: void 0
			};
		},
		content() {
			return this.options.nested ? "paragraph block*" : "paragraph+";
		},
		defining: !0,
		addAttributes() {
			return { checked: {
				default: !1,
				keepOnSplit: !1,
				parseHTML: (e) => {
					let t = e.getAttribute("data-checked");
					return t === "" || t === "true";
				},
				renderHTML: (e) => ({ "data-checked": e.checked })
			} };
		},
		parseHTML() {
			return [{
				tag: `li[data-type="${this.name}"]`,
				priority: 51,
				contentElement: (e) => e.querySelector("div") ?? e
			}];
		},
		renderHTML({ node: e, HTMLAttributes: t }) {
			return [
				"li",
				K(this.options.HTMLAttributes, t, { "data-type": this.name }),
				[
					"label",
					["input", {
						type: "checkbox",
						checked: e.attrs.checked ? "checked" : null
					}],
					["span"]
				],
				["div", 0]
			];
		},
		parseMarkdown: (e, t) => {
			let n = [];
			if (e.tokens && e.tokens.length > 0 ? n.push(t.createNode("paragraph", {}, t.parseInline(e.tokens))) : e.text ? n.push(t.createNode("paragraph", {}, [t.createNode("text", { text: e.text })])) : n.push(t.createNode("paragraph", {}, [])), e.nestedTokens && e.nestedTokens.length > 0) {
				let r = t.parseChildren(e.nestedTokens);
				n.push(...r);
			}
			return t.createNode("taskItem", { checked: e.checked || !1 }, n);
		},
		renderMarkdown: (e, t) => fp(e, t, `- [${e.attrs?.checked ? "x" : " "}] `),
		addExtensions() {
			return this.options.nested ? [iS(this.name, [this.options.taskListTypeName])] : [];
		},
		addKeyboardShortcuts() {
			let e = {
				Enter: () => this.editor.commands.splitListItem(this.name),
				"Shift-Tab": () => this.editor.commands.liftListItem(this.name)
			};
			return this.options.nested ? {
				...e,
				Tab: () => this.editor.commands.sinkListItem(this.name)
			} : e;
		},
		addNodeView() {
			return ({ node: e, HTMLAttributes: t, getPos: n, editor: r }) => {
				let i = document.createElement("li"), a = document.createElement("label"), o = document.createElement("span"), s = document.createElement("input"), c = document.createElement("div");
				o.style.cssText = jS;
				let l = (e) => {
					let t = MS(e, e.attrs.checked, this.options.a11y);
					s.setAttribute("aria-label", t), o.textContent = t;
				};
				l(e), a.contentEditable = "false", s.type = "checkbox", s.addEventListener("mousedown", (e) => e.preventDefault()), s.addEventListener("change", (t) => {
					if (!r.isEditable && !this.options.onReadOnlyChecked) {
						s.checked = !s.checked;
						return;
					}
					let { checked: i } = t.target;
					r.isEditable && typeof n == "function" && r.chain().focus(void 0, { scrollIntoView: !1 }).command(({ tr: e }) => {
						let t = n();
						if (typeof t != "number") return !1;
						let r = e.doc.nodeAt(t);
						return e.setNodeMarkup(t, void 0, {
							...r?.attrs,
							checked: i
						}), !0;
					}).run(), !r.isEditable && this.options.onReadOnlyChecked && (this.options.onReadOnlyChecked(e, i) || (s.checked = !s.checked));
				}), Object.entries(this.options.HTMLAttributes).forEach(([e, t]) => {
					i.setAttribute(e, t);
				}), i.dataset.checked = e.attrs.checked, s.checked = e.attrs.checked, a.append(s, o), i.append(a, c), Object.entries(t).forEach(([e, t]) => {
					i.setAttribute(e, t);
				});
				let u = new Set(Object.keys(t));
				return {
					dom: i,
					contentDOM: c,
					update: (e) => {
						if (e.type !== this.type) return !1;
						i.dataset.checked = e.attrs.checked, s.checked = e.attrs.checked, l(e);
						let t = r.extensionManager.attributes, n = ef(e, t), a = new Set(Object.keys(n)), o = this.options.HTMLAttributes;
						return u.forEach((e) => {
							a.has(e) || (e in o ? i.setAttribute(e, o[e]) : i.removeAttribute(e));
						}), Object.entries(n).forEach(([e, t]) => {
							t == null ? e in o ? i.setAttribute(e, o[e]) : i.removeAttribute(e) : i.setAttribute(e, t);
						}), u = a, !0;
					}
				};
			};
		},
		addInputRules() {
			return [Cp({
				find: AS,
				type: this.type,
				getAttributes: (e) => ({ checked: e[e.length - 1] === "x" })
			})];
		}
	}), PS = Dh.create({
		name: "taskList",
		addOptions() {
			return {
				itemTypeName: "taskItem",
				HTMLAttributes: {}
			};
		},
		group: "block list",
		content() {
			return `${this.options.itemTypeName}+`;
		},
		parseHTML() {
			return [{
				tag: `ul[data-type="${this.name}"]`,
				priority: 51
			}];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"ul",
				K(this.options.HTMLAttributes, e, { "data-type": this.name }),
				0
			];
		},
		parseMarkdown: (e, t) => t.createNode("taskList", {}, t.parseChildren(e.items || [])),
		renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n") : "",
		markdownTokenizer: {
			name: "taskList",
			level: "block",
			start(e) {
				let t = e.match(/^\s*[-+*]\s+\[([ xX])\]\s+/)?.index;
				return t === void 0 ? -1 : t;
			},
			tokenize(e, t, n) {
				let r = (e) => {
					let t = dp(e, {
						itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
						extractItemData: (e) => ({
							indentLevel: e[1].length,
							mainContent: e[4],
							checked: e[3].toLowerCase() === "x"
						}),
						createToken: (e, t) => ({
							type: "taskItem",
							raw: "",
							mainContent: e.mainContent,
							indentLevel: e.indentLevel,
							checked: e.checked,
							text: e.mainContent,
							tokens: n.inlineTokens(e.mainContent),
							nestedTokens: t
						}),
						customNestedParser: r
					}, n);
					if (t) {
						let r = {
							type: "taskList",
							raw: t.raw,
							items: t.items
						}, i = e.slice(t.raw.length);
						return i.trim() ? [r, ...n.blockTokens(i)] : [r];
					}
					return n.blockTokens(e);
				}, i = dp(e, {
					itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
					extractItemData: (e) => ({
						indentLevel: e[1].length,
						mainContent: e[4],
						checked: e[3].toLowerCase() === "x"
					}),
					createToken: (e, t) => ({
						type: "taskItem",
						raw: "",
						mainContent: e.mainContent,
						indentLevel: e.indentLevel,
						checked: e.checked,
						text: e.mainContent,
						tokens: n.inlineTokens(e.mainContent),
						nestedTokens: t
					}),
					customNestedParser: r
				}, n);
				if (i) return {
					type: "taskList",
					raw: i.raw,
					items: i.items
				};
			}
		},
		markdownOptions: { indentsContent: !0 },
		addCommands() {
			return { toggleTaskList: () => ({ commands: e }) => e.toggleList(this.name, this.options.itemTypeName) };
		},
		addKeyboardShortcuts() {
			return { "Mod-Shift-9": () => this.editor.commands.toggleTaskList() };
		}
	}), q.create({
		name: "listKit",
		addExtensions() {
			let e = [];
			return this.options.bulletList !== !1 && e.push(eS.configure(this.options.bulletList)), this.options.listItem !== !1 && e.push(cS.configure(this.options.listItem)), this.options.listKeymap !== !1 && e.push(xS.configure(this.options.listKeymap)), this.options.orderedList !== !1 && e.push(kS.configure(this.options.orderedList)), this.options.taskItem !== !1 && e.push(NS.configure(this.options.taskItem)), this.options.taskList !== !1 && e.push(PS.configure(this.options.taskList)), e;
		}
	});
})), IS, LS, RS, zS = S((() => {
	J(), IS = "&nbsp;", LS = "\xA0", RS = Dh.create({
		name: "paragraph",
		priority: 1e3,
		addOptions() {
			return { HTMLAttributes: {} };
		},
		group: "block",
		content: "inline*",
		parseHTML() {
			return [{ tag: "p" }];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"p",
				K(this.options.HTMLAttributes, e),
				0
			];
		},
		parseMarkdown: (e, t) => {
			let n = e.tokens || [];
			if (n.length === 1 && n[0].type === "image") return t.parseChildren([n[0]]);
			let r = t.parseInline(n);
			return n.length === 1 && n[0].type === "text" && (n[0].raw === IS || n[0].text === IS || n[0].raw === LS || n[0].text === LS) && r.length === 1 && r[0].type === "text" && (r[0].text === IS || r[0].text === LS) ? t.createNode("paragraph", void 0, []) : t.createNode("paragraph", void 0, r);
		},
		renderMarkdown: (e, t, n) => {
			if (!e) return "";
			let r = Array.isArray(e.content) ? e.content : [];
			if (r.length === 0) {
				let e = Array.isArray(n?.previousNode?.content) ? n.previousNode.content : [];
				return n?.previousNode?.type === "paragraph" && e.length === 0 ? IS : "";
			}
			return t.renderChildren(r);
		},
		addCommands() {
			return { setParagraph: () => ({ commands: e }) => e.setNode(this.name) };
		},
		addKeyboardShortcuts() {
			return { "Mod-Alt-0": () => this.editor.commands.setParagraph() };
		}
	});
})), BS, VS, HS, US = S((() => {
	J(), BS = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/, VS = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g, HS = ah.create({
		name: "strike",
		addOptions() {
			return { HTMLAttributes: {} };
		},
		parseHTML() {
			return [
				{ tag: "s" },
				{ tag: "del" },
				{ tag: "strike" },
				{
					style: "text-decoration",
					consuming: !1,
					getAttrs: (e) => e.includes("line-through") ? {} : !1
				}
			];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"s",
				K(this.options.HTMLAttributes, e),
				0
			];
		},
		markdownTokenName: "del",
		parseMarkdown: (e, t) => t.applyMark("strike", t.parseInline(e.tokens || [])),
		renderMarkdown: (e, t) => `~~${t.renderChildren(e)}~~`,
		addCommands() {
			return {
				setStrike: () => ({ commands: e }) => e.setMark(this.name),
				toggleStrike: () => ({ commands: e }) => e.toggleMark(this.name),
				unsetStrike: () => ({ commands: e }) => e.unsetMark(this.name)
			};
		},
		addKeyboardShortcuts() {
			return { "Mod-Shift-s": () => this.editor.commands.toggleStrike() };
		},
		addInputRules() {
			return [bp({
				find: BS,
				type: this.type
			})];
		},
		addPasteRules() {
			return [wp({
				find: VS,
				type: this.type
			})];
		}
	});
})), WS, GS = S((() => {
	J(), WS = Dh.create({
		name: "text",
		group: "inline",
		parseMarkdown: (e) => ({
			type: "text",
			text: e.text || ""
		}),
		renderMarkdown: (e) => e.text || ""
	});
})), KS, qS = S((() => {
	J(), KS = ah.create({
		name: "underline",
		addOptions() {
			return { HTMLAttributes: {} };
		},
		parseHTML() {
			return [{ tag: "u" }, {
				style: "text-decoration",
				consuming: !1,
				getAttrs: (e) => e.includes("underline") ? {} : !1
			}];
		},
		renderHTML({ HTMLAttributes: e }) {
			return [
				"u",
				K(this.options.HTMLAttributes, e),
				0
			];
		},
		parseMarkdown(e, t) {
			return t.applyMark(this.name || "underline", t.parseInline(e.tokens || []));
		},
		renderMarkdown(e, t) {
			return `++${t.renderChildren(e)}++`;
		},
		markdownTokenizer: {
			name: "underline",
			level: "inline",
			start(e) {
				return e.indexOf("++");
			},
			tokenize(e, t, n) {
				let r = /^(\+\+)([\s\S]+?)(\+\+)/.exec(e);
				if (!r) return;
				let i = r[2].trim();
				return {
					type: "underline",
					raw: r[0],
					text: i,
					tokens: n.inlineTokens(i)
				};
			}
		},
		addCommands() {
			return {
				setUnderline: () => ({ commands: e }) => e.setMark(this.name),
				toggleUnderline: () => ({ commands: e }) => e.toggleMark(this.name),
				unsetUnderline: () => ({ commands: e }) => e.unsetMark(this.name)
			};
		},
		addKeyboardShortcuts() {
			return {
				"Mod-u": () => this.editor.commands.toggleUnderline(),
				"Mod-U": () => this.editor.commands.toggleUnderline()
			};
		}
	});
})), JS, YS = S((() => {
	J(), Tv(), jv(), Fv(), Bv(), Hv(), Wv(), Kv(), Jv(), ey(), wx(), FS(), zS(), US(), GS(), qS(), Wg(), JS = q.create({
		name: "starterKit",
		addExtensions() {
			let e = [];
			return this.options.bold !== !1 && e.push(Av.configure(this.options.bold)), this.options.blockquote !== !1 && e.push(wv.configure(this.options.blockquote)), this.options.bulletList !== !1 && e.push(eS.configure(this.options.bulletList)), this.options.code !== !1 && e.push(Pv.configure(this.options.code)), this.options.codeBlock !== !1 && e.push(zv.configure(this.options.codeBlock)), this.options.document !== !1 && e.push(Vv.configure(this.options.document)), this.options.dropcursor !== !1 && e.push(Lg.configure(this.options.dropcursor)), this.options.gapcursor !== !1 && e.push(Rg.configure(this.options.gapcursor)), this.options.hardBreak !== !1 && e.push(Uv.configure(this.options.hardBreak)), this.options.heading !== !1 && e.push(Gv.configure(this.options.heading)), this.options.undoRedo !== !1 && e.push(Ug.configure(this.options.undoRedo)), this.options.horizontalRule !== !1 && e.push(qv.configure(this.options.horizontalRule)), this.options.italic !== !1 && e.push($v.configure(this.options.italic)), this.options.listItem !== !1 && e.push(cS.configure(this.options.listItem)), this.options.listKeymap !== !1 && e.push(xS.configure(this.options?.listKeymap)), this.options.link !== !1 && e.push(Cx.configure(this.options?.link)), this.options.orderedList !== !1 && e.push(kS.configure(this.options.orderedList)), this.options.paragraph !== !1 && e.push(RS.configure(this.options.paragraph)), this.options.strike !== !1 && e.push(HS.configure(this.options.strike)), this.options.text !== !1 && e.push(WS.configure(this.options.text)), this.options.underline !== !1 && e.push(KS.configure(this.options?.underline)), this.options.trailingNode !== !1 && e.push(Hg.configure(this.options?.trailingNode)), e;
		}
	});
}));
//#endregion
//#region resources/js/inline/rich-text-toolbar.tsx
function XS({ editor: e, items: t }) {
	let { t: n } = (0, w.useT)("lattice");
	return /* @__PURE__ */ _(g, { children: t.map((t, r) => {
		if (t === "separator") return /* @__PURE__ */ _("span", {
			className: "mx-1 h-4 w-px bg-lt-border",
			"aria-hidden": "true"
		}, `separator-${r}`);
		if ("component" in t) {
			let n = t.component;
			return /* @__PURE__ */ _(n, { editor: e }, t.key);
		}
		return /* @__PURE__ */ _(w.ToolbarIconButton, {
			active: t.isActive(e),
			disabled: t.isDisabled?.(e) ?? !1,
			icon: t.icon,
			label: n(`form.editor.${t.key}`, t.label),
			onClick: () => t.run(e),
			testId: `editor-${t.key}`
		}, t.key);
	}) });
}
var ZS = S((() => {
	T();
}));
//#endregion
//#region resources/js/inline/typing-extension.ts
function QS(e) {
	return e.childCount === 0 || e.childCount === 1 && e.firstChild?.type.name === "paragraph" && e.firstChild.content.size === 0;
}
function $S(e) {
	return QS(e) ? null : e.toJSON();
}
function eC(e) {
	return w.SLASH_MENU_PLUGIN_KEY.getState(e.state)?.active === !0;
}
function tC(e) {
	return q.create({
		name: "latticeBlockTyping",
		priority: 1001,
		addKeyboardShortcuts() {
			return {
				ArrowDown: ({ editor: t }) => {
					let { $from: n, empty: r } = t.state.selection;
					return eC(t) || !r || n.index(0) !== t.state.doc.childCount - 1 || !t.view.endOfTextblock("down") ? !1 : e.current?.arrow("down") ?? !1;
				},
				ArrowUp: ({ editor: t }) => {
					let { $from: n, empty: r } = t.state.selection;
					return eC(t) || !r || n.index(0) !== 0 || !t.view.endOfTextblock("up") ? !1 : e.current?.arrow("up") ?? !1;
				},
				Backspace: ({ editor: t }) => {
					let { $from: n, empty: r } = t.state.selection;
					return !r || n.depth !== 1 || n.index(0) !== 0 || n.parentOffset !== 0 ? !1 : e.current?.mergeBackward($S(t.state.doc)) ?? !1;
				},
				Enter: ({ editor: t }) => {
					let { $from: n, empty: r } = t.state.selection;
					if (eC(t) || !r || n.depth !== 1 || n.parent.type.name !== "paragraph") return !1;
					let i = t.state.doc;
					return e.current?.split($S(i.cut(0, n.pos)), $S(i.cut(n.pos))) ?? !1;
				}
			};
		}
	});
}
var nC = S((() => {
	J(), T();
}));
//#endregion
//#region resources/js/inline/typing.ts
function rC(e) {
	if (!e) return !0;
	let t = e.content ?? [];
	if (t.length === 0) return !0;
	let [n] = t;
	return t.length === 1 && n?.type === "paragraph" && (n.content === void 0 || n.content.length === 0);
}
function iC(e) {
	return e === "" ? null : {
		content: [{
			content: [{
				text: e,
				type: "text"
			}],
			type: "paragraph"
		}],
		type: "doc"
	};
}
function aC(e) {
	return rC(e) ? [] : e.content ?? [];
}
var oC = S((() => {}));
//#endregion
//#region resources/js/inline/use-typing.ts
function sC(e, t) {
	let { store: n, inline: r, focusBlock: i } = O();
	return f(() => {
		let a = (t) => {
			let i = E(n.getState().document, e);
			if (!i) return null;
			let a = null;
			return n.setState((e) => {
				let n = ct(e, Mt, {
					index: i.index + 1,
					parentId: i.parentId,
					slot: i.slot
				}, t);
				return a = n.id, n.state;
			}), a && r.requestFocus(a, "start"), a;
		}, o = (t) => {
			let r = Ke(n.getState().document), i = r.indexOf(e);
			return r[t === "up" ? i - 1 : i + 1] ?? null;
		}, s = (e, t) => {
			n.setState((t) => rt(t, e)), r.focusInline(e, t) || i(e);
		};
		return {
			arrow: (e) => {
				let t = o(e);
				return t !== null && (s(t, e === "up" ? "end" : "start"), !0);
			},
			insertType: (t, a) => {
				let o = E(n.getState().document, e);
				if (!o) return;
				let s = null;
				n.setState((n) => {
					let r = a ? lt(n, e, t) : ct(n, t, {
						index: o.index + 1,
						parentId: o.parentId,
						slot: o.slot
					});
					return s = r.id, r.state;
				}), s && (r.requestFocus(s, "start"), queueMicrotask(() => {
					s && !r.hasInline(s) && i(s);
				}));
			},
			mergeBackward: (t) => {
				let i = o("up");
				if (i === null) return !1;
				let a = n.getState().document, c = E(a, i), l = E(a, e);
				return c === null || l === null || l.parentId !== c.parentId || l.slot !== c.slot ? !1 : r.appendTo(i, aC(t)) ? (n.setState((t) => rt(ut(t, e), i)), !0) : aC(t).length > 0 ? !1 : (n.setState((t) => rt(ut(t, e), i)), s(i, "end"), !0);
			},
			splitRich: (r, i) => (n.setState((n) => _t(n, e, t, r)), a({ content: i }) !== null),
			splitText: (r, i) => (n.setState((n) => gt(n, e, t, r)), a({ content: iC(i) }) !== null)
		};
	}, [
		e,
		t,
		i,
		r,
		n
	]);
}
var cC = S((() => {
	D(), Ye(), A(), oC();
}));
//#endregion
//#region resources/js/inline/editable-rich-text.tsx
function lC(e) {
	return rC(e) ? "" : JSON.stringify(e);
}
function uC({ node: e, binding: t }) {
	let { t: n } = (0, w.useT)("blocks"), { store: r, inline: i, types: a } = O(), { block: o, field: s } = t, c = sC(o.id, s.name), u = (0, w.useExtensionRegistry)(w.RICH_EDITOR_EXTENSION), d = t.value ?? null, m = s.placeholder ?? e.props.placeholder ?? n("blocks.placeholders.paragraph", "Write something or type / for blocks"), h = s.node.props.extensions ?? [], g = k((e) => e.document), y = f(() => {
		let e = E(g, o.id);
		return e ? $e(g, a, e.parentId, e.slot) : [];
	}, [
		o.id,
		g,
		a
	]), b = f(() => (0, w.resolveRichEditorExtensions)(h, {
		...w.builtinRichEditorExtensions,
		...u
	}), [u, h]), x = f(() => (0, w.assembleToolbar)(b), [b]), ee = p(null), te = p(null), S = p([]), ne = p(lC(d));
	ee.current = {
		arrow: c.arrow,
		mergeBackward: c.mergeBackward,
		split: c.splitRich
	}, S.current = y.map((e) => ({
		group: e.category,
		icon: e.icon ?? "square",
		key: e.type,
		keywords: e.keywords,
		label: e.label,
		run: (t) => c.insertType(e.type, t.isEmpty)
	}));
	let re = f(() => [
		JS.configure({
			...(0, w.assembleStarterKitOptions)(b),
			undoRedo: !1
		}),
		Vg.configure({ placeholder: m }),
		tC(ee),
		(0, w.createSlashMenuExtension)({
			commands: () => S.current,
			handle: te
		}),
		...(0, w.assembleTiptapExtensions)(b)
	], [m, b]), C = X_({
		content: rC(d) ? "" : d,
		editorProps: { attributes: {
			class: (0, w.cn)("lattice-prose outline-none", e.props.class ?? ""),
			"data-test": `inline-${o.id}-${s.name}`
		} },
		extensions: re,
		immediatelyRender: !1,
		onFocus: ({ editor: e }) => o.setInlineToolbar(/* @__PURE__ */ _(XS, {
			editor: e,
			items: x
		})),
		onUpdate: ({ editor: e }) => {
			let t = e.isEmpty ? null : e.getJSON();
			ne.current = lC(t), r.setState((e) => _t(e, o.id, s.name, t));
		},
		shouldRerenderOnTransaction: !0
	});
	return l(() => {
		!C || lC(d) === ne.current || (ne.current = lC(d), C.commands.setContent(rC(d) ? "" : d, { emitUpdate: !1 }));
	}, [C, d]), l(() => {
		if (C) return i.register(o.id, s.name, {
			append: (e) => {
				if (e.length === 0) return C.commands.focus("end"), !0;
				let t = C.state.doc.content.size;
				return C.chain().focus().insertContentAt(t, e).setTextSelection(t + 1).joinBackward().run(), !0;
			},
			focus: (e) => C.commands.focus(e)
		});
	}, [
		o,
		C,
		s.name,
		i
	]), l(() => () => o.setInlineToolbar(null), [o]), C ? /* @__PURE__ */ v("div", {
		className: "lt-blocks-ui lt-blocks-rich",
		"data-test": `inline-rich-${o.id}-${s.name}`,
		children: [/* @__PURE__ */ _(ov, { editor: C }), /* @__PURE__ */ _(w.BlockMenuController, {
			editor: C,
			handleRef: te,
			plusButton: !1,
			translate: (e, t) => t
		})]
	}) : null;
}
var dC = S((() => {
	Wg(), vv(), YS(), T(), et(), D(), Ye(), A(), ZS(), nC(), oC(), cC();
}));
//#endregion
//#region resources/js/inline/inline-text.tsx
function fC(e) {
	let t = window.getSelection();
	if (!t || t.rangeCount === 0) return e.textContent?.length ?? 0;
	let n = t.getRangeAt(0).cloneRange();
	return n.selectNodeContents(e), n.setEnd(t.getRangeAt(0).startContainer, t.getRangeAt(0).startOffset), n.toString().length;
}
function pC(e, t) {
	let n = window.getSelection();
	if (!n) return;
	let r = document.createRange();
	r.selectNodeContents(e), r.collapse(t === "start"), n.removeAllRanges(), n.addRange(r);
}
function mC(e, t) {
	let n = window.getSelection();
	if (!n || n.rangeCount === 0 || e.textContent === "") return !0;
	let r = n.getRangeAt(0).getBoundingClientRect(), i = e.getBoundingClientRect(), a = Number.parseFloat(getComputedStyle(e).lineHeight) || 20;
	return t === "up" ? r.top - i.top < a : i.bottom - r.bottom < a;
}
function hC({ value: e, placeholder: t, multiline: n = !1, className: r, testId: i, label: a, onChange: o, onEnter: s, onBackspaceEmpty: c, onArrow: u, handle: f }) {
	let m = p(null);
	return d(() => {
		let t = m.current;
		t && (t.textContent ?? "") !== e && (t.textContent = e);
	}, [e]), l(() => {
		if (f) return f({ focus: (e) => {
			let t = m.current;
			t && (t.focus(), pC(t, e));
		} }), () => f(null);
	}, [f]), /* @__PURE__ */ _("span", {
		ref: m,
		contentEditable: "plaintext-only",
		suppressContentEditableWarning: !0,
		role: "textbox",
		"aria-label": a,
		"aria-multiline": n,
		"data-test": i,
		"data-placeholder": t ?? void 0,
		className: (0, w.cn)("lt-blocks-inline lt-blocks-ui block min-w-4 cursor-text outline-none", n && "whitespace-pre-wrap", r),
		spellCheck: !0,
		onInput: (e) => o(e.currentTarget.textContent ?? ""),
		onKeyDown: (e) => {
			let t = e.currentTarget, r = t.textContent ?? "";
			if (e.key === "Enter") {
				if (e.shiftKey && n) return;
				e.preventDefault();
				let i = fC(t);
				s?.(r.slice(0, i), r.slice(i));
				return;
			}
			if (e.key === "Backspace" && r === "" && c?.()) {
				e.preventDefault();
				return;
			}
			if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey && !e.shiftKey) {
				let r = e.key === "ArrowUp" ? "up" : "down";
				(!n || mC(t, r)) && u?.(r) && e.preventDefault();
			}
		}
	});
}
var gC = S((() => {
	T();
}));
//#endregion
//#region resources/js/inline/editable-text-node.tsx
function _C({ node: e, binding: t }) {
	let { t: n } = (0, w.useT)("blocks"), { store: r, inline: i } = O(), { block: a, field: s } = t, c = sC(a.id, s.name), l = typeof t.value == "string" ? t.value : "", u = s.node.props.label ?? s.name, d = p(null), f = o((e) => {
		d.current?.(), d.current = e ? i.register(a.id, s.name, e) : null;
	}, [
		a.id,
		s.name,
		i
	]), m = /* @__PURE__ */ _(hC, {
		value: l,
		placeholder: s.placeholder,
		multiline: s.multiline,
		testId: `inline-${a.id}-${s.name}`,
		label: n("blocks.editor.edit-field", "Edit {{label}}", { label: u }),
		onChange: (e) => r.setState((t) => gt(t, a.id, s.name, e)),
		onEnter: c.splitText,
		onBackspaceEmpty: () => c.mergeBackward(null),
		onArrow: c.arrow,
		handle: f
	});
	switch (e.type) {
		case "heading": {
			let t = e.props;
			return /* @__PURE__ */ _(w.Heading, {
				level: t.level,
				className: t.class ?? void 0,
				children: m
			});
		}
		case "text": {
			let t = e.props;
			return /* @__PURE__ */ _(w.Text, {
				align: t.align ?? void 0,
				className: t.class ?? void 0,
				color: t.color,
				size: t.size,
				children: m
			});
		}
		default: {
			let t = e.props;
			return /* @__PURE__ */ _(w.Button, {
				className: t.class ?? void 0,
				emphasis: t.emphasis ?? "solid",
				variant: t.variant ?? null,
				type: "button",
				children: m
			});
		}
	}
}
var vC = S((() => {
	T(), D(), A(), gC(), cC();
}));
//#endregion
//#region resources/js/components/editor/block-context.tsx
function yC({ id: e, type: t, setInlineToolbar: n, children: r }) {
	let i = f(() => ({
		id: e,
		setInlineToolbar: n,
		type: t
	}), [
		e,
		n,
		t
	]);
	return /* @__PURE__ */ _(xC.Provider, {
		value: i,
		children: r
	});
}
function bC() {
	return s(xC);
}
var xC, SC = S((() => {
	xC = r(null);
}));
//#endregion
//#region resources/js/inline/use-block-binding.ts
function CC(e) {
	let t = bC(), n = e.props.binding, r = typeof n == "string" ? n : null, i = Lt(t?.type ?? ""), a = f(() => i && r !== null ? xe(i.schema, r) : null, [r, i]), o = k((e) => t && r !== null ? E(e.document, t.id)?.node.data[r] : void 0);
	return !t || !a ? null : {
		block: t,
		field: a,
		value: o
	};
}
var wC = S((() => {
	Ae(), Ye(), SC(), A();
}));
//#endregion
//#region resources/js/inline/inline-override.tsx
function TC(e) {
	let t = ({ node: e }) => {
		let t = CC(e);
		if (!t) return /* @__PURE__ */ _(QC, { node: e });
		let { kind: n } = t.field;
		return n === "text" && Ee(e.type) !== null ? /* @__PURE__ */ _(_C, {
			node: e,
			binding: t
		}) : n === "rich" && e.type === "blocks.rich-text" ? /* @__PURE__ */ _(uC, {
			node: e,
			binding: t
		}) : n === "media" ? /* @__PURE__ */ _(wn, {
			node: e,
			binding: t
		}) : /* @__PURE__ */ _(Sn, {
			binding: t,
			children: /* @__PURE__ */ _(QC, { node: e })
		});
	};
	return t.displayName = `InlineOverride(${e})`, t;
}
var EC = S((() => {
	Ae(), nw(), Cn(), Tn(), dC(), vC(), wC();
}));
//#endregion
//#region resources/js/lib/style-classes.ts
function DC(e) {
	return [
		e.marginTop ? MC[e.marginTop] : null,
		e.marginBottom ? NC[e.marginBottom] : null,
		e.paddingTop ? AC[e.paddingTop] : null,
		e.paddingBottom ? jC[e.paddingBottom] : null,
		e.background && e.background !== "none" ? `${PC[e.background]} ${IC}` : null,
		e.hideOnMobile ? "max-md:hidden" : null,
		e.hideOnDesktop ? "md:hidden" : null,
		e.align ? FC[e.align] : null
	].filter(Boolean).join(" ");
}
function OC(e) {
	return kC[e.width ?? "full"];
}
var kC, AC, jC, MC, NC, PC, FC, IC, LC = S((() => {
	kC = {
		content: "mx-auto w-full max-w-3xl",
		full: "w-full",
		wide: "mx-auto w-full max-w-6xl"
	}, AC = {
		lg: "pt-12",
		md: "pt-8",
		none: "pt-0",
		sm: "pt-4",
		xl: "pt-20",
		xs: "pt-2"
	}, jC = {
		lg: "pb-12",
		md: "pb-8",
		none: "pb-0",
		sm: "pb-4",
		xl: "pb-20",
		xs: "pb-2"
	}, MC = {
		lg: "mt-12",
		md: "mt-8",
		none: "mt-0",
		sm: "mt-4",
		xl: "mt-20",
		xs: "mt-2"
	}, NC = {
		lg: "mb-12",
		md: "mb-8",
		none: "mb-0",
		sm: "mb-4",
		xl: "mb-20",
		xs: "mb-2"
	}, PC = {
		inverted: "bg-lt-fg text-lt-bg [&_h1,&_h2,&_h3,&_h4]:text-lt-bg",
		muted: "bg-lt-muted text-lt-fg",
		none: "",
		primary: "bg-lt-primary text-lt-primary-fg [&_h1,&_h2,&_h3,&_h4]:text-lt-primary-fg"
	}, FC = {
		center: "text-center [&_.lt-blocks-prose]:mx-auto",
		start: "text-start"
	}, IC = "px-6";
}));
//#endregion
//#region resources/js/components/view/frame.tsx
function RC({ style: e, children: t, className: n }) {
	return /* @__PURE__ */ _("div", {
		className: (0, w.cn)("lt-blocks-frame", DC(e), n),
		id: e.anchor ?? void 0,
		children: /* @__PURE__ */ _("div", {
			className: OC(e),
			children: t
		})
	});
}
var zC = S((() => {
	T(), LC();
}));
//#endregion
//#region resources/js/dnd/keyboard-move.ts
function BC(e, t, n, r) {
	let i = E(e, n);
	if (!i) return null;
	let a = i.parentId === null ? e.blocks : E(e, i.parentId)?.node.slots[i.slot ?? ""] ?? [], o = r === "up" ? -1 : 1, s = i.index + o;
	if (s >= 0 && s < a.length) return {
		index: r === "up" ? s : s + 1,
		parentId: i.parentId,
		slot: i.slot
	};
	if (i.parentId === null) return null;
	let c = E(e, i.parentId);
	if (!c) return null;
	let l = {
		index: r === "up" ? c.index : c.index + 1,
		parentId: c.parentId,
		slot: c.slot
	};
	return Qe({
		blockType: i.node.type,
		document: e,
		movingId: n,
		parentId: l.parentId,
		slot: l.slot,
		types: t
	}) ? l : null;
}
var VC = S((() => {
	et(), Ye();
}));
//#endregion
//#region resources/js/components/editor/block-toolbar.tsx
function HC({ id: e, label: t, icon: n, handleRef: r, inlineToolbar: i = null }) {
	let { t: a } = (0, w.useT)("blocks"), { store: o, types: s, focusBlock: c } = O(), l = k((e) => e.document), u = BC(l, s, e, "up"), d = BC(l, s, e, "down"), f = (n) => {
		let r = n === "up" ? u : d;
		r && (o.setState((t) => dt(t, e, r)), (0, w.announce)(a("blocks.editor.block-moved", "{{label}} moved", { label: t })), queueMicrotask(() => c(e)));
	};
	return /* @__PURE__ */ v("div", {
		className: "lt-blocks-ui absolute -top-9 left-0 z-10 flex h-8 items-center gap-0.5 rounded-lt border border-lt-border bg-lt-popover px-1 text-lt-popover-fg shadow-lt-md",
		"data-test": `block-toolbar-${e}`,
		role: "toolbar",
		"aria-label": t,
		onClick: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ _("button", {
				ref: r,
				type: "button",
				"aria-label": a("blocks.editor.drag", "Drag {{label}}", { label: t }),
				"data-test": `block-drag-${e}`,
				className: "inline-flex size-7 cursor-grab items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-accent hover:text-lt-accent-fg",
				children: /* @__PURE__ */ _(w.Icon, {
					name: "grip-vertical",
					className: "size-lt-icon-md"
				})
			}),
			/* @__PURE__ */ _(w.IconButton, {
				icon: "arrow-up",
				label: a("blocks.editor.move-up", "Move up"),
				disabled: !u,
				onClick: () => f("up"),
				"data-test": `block-move-up-${e}`
			}),
			/* @__PURE__ */ _(w.IconButton, {
				icon: "arrow-down",
				label: a("blocks.editor.move-down", "Move down"),
				disabled: !d,
				onClick: () => f("down"),
				"data-test": `block-move-down-${e}`
			}),
			/* @__PURE__ */ _("span", {
				className: "mx-1 h-4 w-px bg-lt-border",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ v("span", {
				className: "flex items-center gap-1.5 px-1.5 text-xs font-medium",
				children: [n && /* @__PURE__ */ _(w.Icon, {
					name: n,
					className: "size-lt-icon-sm"
				}), t]
			}),
			i && /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _("span", {
				className: "mx-1 h-4 w-px bg-lt-border",
				"aria-hidden": "true"
			}), /* @__PURE__ */ _("span", {
				className: "flex items-center gap-0.5",
				"data-test": `inline-toolbar-${e}`,
				children: i
			})] }),
			/* @__PURE__ */ _("span", {
				className: "mx-1 h-4 w-px bg-lt-border",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ _(w.IconButton, {
				icon: "copy",
				label: a("blocks.editor.duplicate", "Duplicate"),
				onClick: () => o.setState((t) => ft(t, e)),
				"data-test": `block-duplicate-${e}`
			}),
			/* @__PURE__ */ _(w.IconButton, {
				icon: "trash-2",
				label: a("blocks.editor.remove", "Remove"),
				onClick: () => o.setState((t) => ut(t, e)),
				"data-test": `block-remove-${e}`
			})
		]
	});
}
var UC = S((() => {
	T(), VC(), D(), A();
})), WC, GC, KC = S((() => {
	T(), hn(), D(), Ye(), zC(), SC(), UC(), A(), WC = {
		bottom: "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-lt-primary",
		left: "",
		right: "",
		top: "before:absolute before:inset-x-0 before:-top-1.5 before:h-0.5 before:rounded-full before:bg-lt-primary"
	}, GC = ({ node: e, children: t }) => {
		let { blockId: n, blockType: r, style: i } = e.props, { t: a } = (0, w.useT)("blocks"), { store: o, types: s, registerBlock: c } = O(), u = k((e) => e.selectedId === n), d = k((e) => e.errors[n] !== void 0), h = k((e) => e.document), g = Lt(r), y = g?.label ?? r, b = p(null), x = p(null), [ee, te] = m(!1), [S, ne] = m(!1), [re, C] = m(null), [ie, ae] = m(!1), [T, oe] = m(null), se = f(() => E(h, n), [h, n]), ce = se !== null, le = se?.node.style ?? i;
		return l(() => {
			let e = b.current;
			return c(n, e), () => c(n, null);
		}, [n, c]), l(() => {
			let e = b.current;
			if (!e || !ce) return;
			let t = x.current;
			return (0, w.combine)((0, w.cancelDragStartFromInteractive)(e, (e) => e.closest(".lt-blocks-ui") !== null && e !== t), (0, w.draggable)({
				element: e,
				...t ? { dragHandle: t } : {},
				getInitialData: () => an(n, r),
				onDragStart: () => te(!0),
				onDrop: () => te(!1),
				onGenerateDragPreview: ({ location: t, nativeSetDragImage: n }) => {
					(0, w.setCustomNativeDragPreview)({
						getOffset: (0, w.preserveOffsetOnSource)({
							element: e,
							input: t.current.input
						}),
						nativeSetDragImage: n,
						render: ({ container: t }) => {
							let n = e.cloneNode(!0);
							return n.style.width = `${e.offsetWidth}px`, n.style.opacity = "0.85", t.appendChild(n), () => n.remove();
						}
					});
				}
			}), (0, w.dropTargetForElements)({
				canDrop: ({ source: e }) => {
					let t = sn(e.data);
					return t !== null && (t.kind !== "block" || t.id !== n);
				},
				element: e,
				getData: ({ element: e, input: t }) => cn(n, {
					element: e,
					input: t
				}),
				getIsSticky: () => !0,
				onDrag: ({ self: e, source: t }) => {
					let n = o.getState(), r = sn(t.data), i = dn(n.document, [e], r), a = r !== null && i !== null && fn(n.document, n.types, r, i);
					C(a ? ln(e.data) : null), ae(!a);
				},
				onDragLeave: () => {
					C(null), ae(!1);
				},
				onDrop: () => {
					C(null), ae(!1);
				}
			}));
		}, [
			r,
			ce,
			n,
			o,
			s
		]), /* @__PURE__ */ v("div", {
			ref: b,
			role: "group",
			"aria-label": a("blocks.editor.select-block", "Select {{label}}", { label: y }),
			tabIndex: 0,
			"data-test": `block-${n}`,
			"data-block-id": n,
			"data-block-type": r,
			"data-selected": u || void 0,
			"data-drop-edge": re ?? void 0,
			"data-drop-blocked": ie || void 0,
			className: (0, w.cn)("relative rounded-lt outline-none transition-shadow", u && "ring-2 ring-lt-primary ring-offset-2 ring-offset-lt-surface", !u && S && "ring-1 ring-lt-border-2", d && !u && "ring-1 ring-lt-danger", ee && "opacity-40", ie && "cursor-not-allowed ring-1 ring-lt-danger", re && WC[re]),
			onClick: (e) => {
				e.stopPropagation(), o.setState((e) => rt(e, n));
			},
			onFocus: (e) => {
				e.target.closest("[data-block-id]") === e.currentTarget && o.setState((e) => rt(e, n));
			},
			onMouseEnter: () => ne(!0),
			onMouseLeave: () => ne(!1),
			children: [
				u && /* @__PURE__ */ _(HC, {
					id: n,
					label: y,
					icon: g?.icon ?? null,
					handleRef: x,
					inlineToolbar: T
				}),
				!u && S && /* @__PURE__ */ _("span", {
					className: "pointer-events-none absolute -top-2.5 left-2 z-10 rounded-lt-xs bg-lt-fg px-1.5 text-[10px] font-medium text-lt-bg",
					children: y
				}),
				/* @__PURE__ */ _(RC, {
					style: le,
					children: /* @__PURE__ */ _(yC, {
						id: n,
						type: r,
						setInlineToolbar: oe,
						children: t
					})
				})
			]
		});
	};
}));
//#endregion
//#region resources/js/components/editor/insert-menu.tsx
function qC({ target: e, label: t, compact: n = !1 }) {
	let { t: r } = (0, w.useT)("blocks"), { store: i, types: a, requestRender: o, focusBlock: s } = O(), c = k((e) => e.document), [d, f] = m(!1), h = u(), g = p(null), y = $e(c, a, e.parentId, e.slot), b = `insert-${e.parentId ?? "root"}-${e.slot ?? "root"}`;
	l(() => {
		if (!d) return;
		let e = (e) => {
			g.current && !g.current.contains(e.target) && f(!1);
		};
		return window.addEventListener("mousedown", e), () => window.removeEventListener("mousedown", e);
	}, [d]);
	let x = (t) => {
		f(!1);
		let n = null;
		if (i.setState((r) => {
			let i = ct(r, t, e);
			return n = i.id, i.state;
		}), n) {
			o(n);
			let e = a.find((e) => e.type === t)?.label ?? t;
			(0, w.announce)(r("blocks.editor.block-added", "{{label}} added", { label: e })), queueMicrotask(() => s(n));
		}
	};
	return y.length === 0 ? null : /* @__PURE__ */ v("div", {
		ref: g,
		className: (0, w.cn)("lt-blocks-ui relative flex justify-center", n ? "py-1" : "py-3"),
		children: [/* @__PURE__ */ v("button", {
			type: "button",
			"aria-expanded": d,
			"aria-controls": h,
			"aria-label": t,
			"data-test": b,
			className: (0, w.cn)("inline-flex items-center gap-1 rounded-lt-full border border-dashed border-lt-border px-3 text-sm text-lt-muted-fg transition-colors hover:border-lt-primary hover:text-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none", n ? "h-7" : "h-8"),
			onClick: () => f((e) => !e),
			children: [/* @__PURE__ */ _(w.Icon, {
				name: "plus",
				className: "size-lt-icon-sm"
			}), !n && /* @__PURE__ */ _("span", { children: t })]
		}), d && /* @__PURE__ */ _("ul", {
			id: h,
			role: "menu",
			"data-test": `${b}-menu`,
			className: "absolute top-full z-20 mt-1 grid w-64 grid-cols-2 gap-1 rounded-lt border border-lt-border bg-lt-popover p-1 shadow-lt-md",
			children: y.map((e) => /* @__PURE__ */ _("li", {
				role: "none",
				children: /* @__PURE__ */ v("button", {
					type: "button",
					role: "menuitem",
					"data-test": `${b}-${e.type}`,
					className: "flex w-full flex-col items-center gap-1 rounded-lt-sm px-2 py-2 text-xs text-lt-popover-fg hover:bg-lt-accent hover:text-lt-accent-fg",
					onClick: () => x(e.type),
					children: [e.icon && /* @__PURE__ */ _(w.Icon, {
						name: e.icon,
						className: "size-lt-icon-md"
					}), /* @__PURE__ */ _("span", { children: e.label })]
				})
			}, e.type))
		})]
	});
}
var JC = S((() => {
	T(), et(), D(), A();
})), YC, XC = S((() => {
	T(), hn(), Ye(), yn(), A(), JC(), YC = ({ node: e }) => {
		let { blockId: t, name: n, label: r } = e.props, { t: i } = (0, w.useT)("blocks"), { store: a } = O(), o = k((e) => e.document), s = f(() => E(o, t)?.node.slots[n] ?? [], [
			t,
			o,
			n
		]), c = f(() => s.map((e) => e.id), [s]), u = p(null), [d, h] = m(null);
		return l(() => {
			let e = u.current;
			if (e) return (0, w.dropTargetForElements)({
				canDrop: ({ source: e }) => sn(e.data) !== null,
				element: e,
				getData: () => un(t, n),
				onDragEnter: ({ source: e, self: t }) => {
					let n = a.getState(), r = sn(e.data), i = dn(n.document, [t], r);
					h(r && i && fn(n.document, n.types, r, i) ? "allowed" : "blocked");
				},
				onDragLeave: () => h(null),
				onDrop: () => h(null)
			});
		}, [
			t,
			n,
			a
		]), /* @__PURE__ */ v("div", {
			ref: u,
			"data-test": `slot-${t}-${n}`,
			"data-drop-state": d ?? void 0,
			className: (0, w.cn)("relative flex min-h-16 min-w-0 flex-col gap-3 rounded-lt border border-dashed p-1.5 transition-colors", d === null && (c.length === 0 ? "border-lt-border" : "border-transparent"), d === "allowed" && "border-lt-primary bg-lt-primary/5", d === "blocked" && "border-lt-danger bg-lt-danger/5"),
			children: [
				/* @__PURE__ */ _("span", {
					className: "pointer-events-none absolute -top-2 left-2 rounded-lt-xs bg-lt-surface px-1 text-[10px] font-medium uppercase tracking-wide text-lt-muted-fg",
					children: r
				}),
				/* @__PURE__ */ _(gn, { ids: c }),
				/* @__PURE__ */ _(qC, {
					compact: !0,
					target: {
						index: c.length,
						parentId: t,
						slot: n
					},
					label: i("blocks.editor.add-to-slot", "Add block to {{slot}}", { slot: r })
				})
			]
		});
	};
}));
//#endregion
//#region resources/js/components/editor/editor-registry.tsx
function ZC({ registry: e, children: t }) {
	return /* @__PURE__ */ _(tw.Provider, {
		value: e,
		children: t
	});
}
function QC({ node: e }) {
	let t = s(tw);
	return t ? /* @__PURE__ */ _(w.RegistryProvider, {
		registry: t,
		children: /* @__PURE__ */ _(w.RenderNode, { node: e })
	}) : /* @__PURE__ */ _(w.RenderNode, { node: e });
}
function $C() {
	let e = (0, w.useComponentRegistry)(), t = (0, w.useExtensionRegistry)(w.RICH_EDITOR_EXTENSION);
	return f(() => {
		let n = { [w.RICH_EDITOR_EXTENSION]: t }, r = Object.fromEntries(ew.map((e) => [e, (0, w.eagerComponent)(TC(e))]));
		return {
			base: {
				components: e,
				extensions: n
			},
			registry: {
				components: {
					...e,
					...r,
					"blocks.frame": (0, w.eagerComponent)(GC),
					"blocks.slot": (0, w.eagerComponent)(YC)
				},
				extensions: n
			}
		};
	}, [e, t]);
}
var ew, tw, nw = S((() => {
	T(), EC(), KC(), XC(), ew = [
		"heading",
		"text",
		"button",
		"image",
		"raw-block",
		"blocks.rich-text"
	], tw = r(null);
}));
//#endregion
//#region resources/js/components/editor/canvas.tsx
function rw() {
	let { t: e } = (0, w.useT)("blocks"), { store: t, types: n, requestRender: r, focusBlock: i } = O(), a = k((e) => e.document.blocks), o = k((e) => e.canvasWidth), s = f(() => a.map((e) => e.id), [a]), { registry: c, base: u } = $C(), d = p(null), h = p(null), [g, y] = m(!1);
	return l(() => {
		let a = d.current, o = h.current;
		if (!(!a || !o)) return (0, w.combine)((0, w.autoScrollForElements)({ element: a }), (0, w.dropTargetForElements)({
			canDrop: ({ source: e }) => sn(e.data) !== null,
			element: o,
			getData: () => un(null, null),
			onDragEnter: () => y(!0),
			onDragLeave: () => y(!1),
			onDrop: () => y(!1)
		}), (0, w.monitorForElements)({
			canMonitor: ({ source: e }) => sn(e.data) !== null,
			onDrop: ({ source: a, location: o }) => {
				let s = sn(a.data), c = t.getState(), l = dn(c.document, o.current.dropTargets, s);
				if (!s || !l) return;
				let u = n.find((e) => e.type === s.blockType)?.label ?? s.blockType;
				if (!fn(c.document, c.types, s, l)) {
					(0, w.announce)(e("blocks.editor.drop-not-allowed", "{{label}} is not allowed here", { label: u }));
					return;
				}
				if (s.kind === "block") {
					t.setState((e) => dt(e, s.id, l)), (0, w.announce)(e("blocks.editor.block-moved", "{{label}} moved", { label: u })), queueMicrotask(() => i(s.id));
					return;
				}
				let d = null;
				t.setState((e) => {
					let t = ct(e, s.blockType, l);
					return d = t.id, t.state;
				}), d && (r(d), (0, w.announce)(e("blocks.editor.block-added", "{{label}} added", { label: u })));
			}
		}));
	}, [
		i,
		r,
		t,
		e,
		n
	]), /* @__PURE__ */ v("div", {
		ref: d,
		className: "lt-blocks-canvas relative min-w-0 flex-1 overflow-y-auto bg-lt-bg",
		"data-test": "blocks-canvas",
		"data-canvas-width": o,
		children: [/* @__PURE__ */ _("div", {
			className: (0, w.cn)("mx-auto flex min-h-full w-full flex-col px-6 py-8 transition-[max-width]", iw[o]),
			children: /* @__PURE__ */ v("div", {
				ref: h,
				"data-test": "blocks-canvas-root",
				"data-drop-active": g || void 0,
				className: (0, w.cn)("flex min-h-[60vh] flex-1 flex-col gap-4 rounded-lt border bg-lt-surface px-10 py-10 shadow-lt-sm transition-colors", g ? "border-lt-primary" : "border-lt-border"),
				onClick: (e) => {
					e.target === e.currentTarget && t.setState((e) => rt(e, null));
				},
				children: [
					/* @__PURE__ */ _(ZC, {
						registry: u,
						children: /* @__PURE__ */ _(w.RegistryProvider, {
							registry: c,
							children: /* @__PURE__ */ _(gn, { ids: s })
						})
					}),
					s.length === 0 && /* @__PURE__ */ _("p", {
						className: "py-10 text-center text-sm text-lt-muted-fg",
						"data-test": "blocks-empty",
						children: e("blocks.editor.empty", "This page has no blocks yet. Pick one from the library.")
					}),
					/* @__PURE__ */ _(qC, {
						target: {
							index: s.length,
							parentId: null,
							slot: null
						},
						label: e("blocks.editor.add-block", "Add block")
					})
				]
			})
		}), /* @__PURE__ */ _(bn, {})]
	});
}
var iw, aw = S((() => {
	T(), hn(), D(), yn(), xn(), A(), nw(), JC(), iw = {
		desktop: "max-w-5xl",
		mobile: "max-w-sm",
		tablet: "max-w-3xl"
	};
}));
//#endregion
//#region resources/js/components/editor/conflict-dialog.tsx
function ow({ open: e, overwriting: t, onReload: n, onOverwrite: r }) {
	let { t: i } = (0, w.useT)("blocks");
	return /* @__PURE__ */ _(w.Dialog, {
		open: e,
		children: /* @__PURE__ */ v(w.DialogContent, {
			width: "md",
			"data-test": "blocks-conflict-dialog",
			onEscapeKeyDown: (e) => e.preventDefault(),
			onInteractOutside: (e) => e.preventDefault(),
			children: [/* @__PURE__ */ v("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ _(w.DialogTitle, { children: i("blocks.editor.conflict-dialog.title", "This page was changed elsewhere") }), /* @__PURE__ */ _(w.DialogDescription, { children: i("blocks.editor.conflict-dialog.description", "Someone else saved a newer draft. Reload to see their version, or overwrite it with yours.") })]
			}), /* @__PURE__ */ v("div", {
				className: "mt-6 flex justify-end gap-2",
				children: [/* @__PURE__ */ _(w.Button, {
					type: "button",
					emphasis: "outline",
					"data-test": "blocks-conflict-reload",
					disabled: t,
					onClick: n,
					children: i("blocks.editor.conflict-dialog.reload", "Reload")
				}), /* @__PURE__ */ v(w.Button, {
					type: "button",
					variant: "danger",
					"data-test": "blocks-conflict-overwrite",
					disabled: t,
					onClick: r,
					children: [t && /* @__PURE__ */ _(w.Spinner, {}), i("blocks.editor.conflict-dialog.overwrite", "Overwrite")]
				})]
			})]
		})
	});
}
var sw = S((() => {
	T();
}));
//#endregion
//#region resources/js/components/editor/editor-topbar.tsx
function cw(e, t) {
	window.dispatchEvent(new CustomEvent(w.LATTICE_EVENT.toast, { detail: {
		message: e,
		variant: t
	} }));
}
function lw({ title: e, previewUrl: t }) {
	let { t: n } = (0, w.useT)("blocks"), { store: r, endpoint: i, saveNow: a } = O(), o = k((e) => e.history.past.length > 0), s = k((e) => e.history.future.length > 0), c = k((e) => e.saveState), l = k((e) => e.publishing), u = k((e) => e.publishedAt), d = k((e) => e.canvasWidth), [f, p] = m(!1), h = async () => {
		if (!i) return;
		r.setState((e) => kt(e, !0));
		let { document: e, revision: t } = r.getState();
		try {
			let a = await le(i, e, t);
			r.setState((e) => {
				switch (a.status) {
					case "saved": return At(e, a.revision);
					case "conflict": return kt(Et(e, a.revision), !1);
					case "invalid": return kt(jt(e, a.errors), !1);
					case "failed": return kt(Ot(e), !1);
				}
			}), a.status === "saved" ? cw(n("blocks.editor.publish-succeeded", "The page is published."), "success") : a.status === "invalid" && cw(n("blocks.editor.publish-failed", "Publishing failed. Fix the highlighted blocks and try again."), "danger");
		} catch {
			r.setState((e) => kt(Ot(e), !1));
		}
	}, g = async () => {
		p(!0), r.setState(Dt);
		try {
			await a();
		} finally {
			p(!1);
		}
	}, y = {
		desktop: n("blocks.editor.width-desktop", "Desktop"),
		mobile: n("blocks.editor.width-mobile", "Mobile"),
		tablet: n("blocks.editor.width-tablet", "Tablet")
	};
	return /* @__PURE__ */ v("header", {
		className: "flex h-12 shrink-0 items-center gap-2 border-b border-lt-border bg-lt-surface px-3",
		"data-test": "blocks-topbar",
		children: [
			/* @__PURE__ */ _(w.IconButton, {
				icon: "undo-2",
				size: "md",
				label: n("blocks.editor.undo", "Undo"),
				disabled: !o,
				onClick: () => r.setState(xt),
				"data-test": "blocks-undo"
			}),
			/* @__PURE__ */ _(w.IconButton, {
				icon: "redo-2",
				size: "md",
				label: n("blocks.editor.redo", "Redo"),
				disabled: !s,
				onClick: () => r.setState(St),
				"data-test": "blocks-redo"
			}),
			/* @__PURE__ */ v("div", {
				className: "mx-2 flex min-w-0 flex-1 items-center justify-center gap-2 text-sm",
				children: [e && /* @__PURE__ */ _("span", {
					className: "truncate font-semibold text-lt-fg",
					children: e
				}), /* @__PURE__ */ _(uw, {
					state: c,
					publishedAt: u
				})]
			}),
			/* @__PURE__ */ _(w.SegmentedControl, {
				"aria-label": n("blocks.editor.canvas-width", "Canvas width"),
				"data-test": "blocks-canvas-width",
				className: "hidden md:inline-flex",
				options: dw.map((e) => ({
					label: y[e],
					value: e
				})),
				value: d,
				onValueChange: (e) => r.setState((t) => it(t, e))
			}),
			t && /* @__PURE__ */ _(w.Button, {
				emphasis: "outline",
				variant: "secondary",
				size: "sm",
				asChild: !0,
				children: /* @__PURE__ */ v("a", {
					href: t,
					target: "_blank",
					rel: "noreferrer",
					"data-test": "blocks-preview",
					children: [/* @__PURE__ */ _(w.Icon, { name: "external-link" }), n("blocks.editor.preview", "Preview")]
				})
			}),
			/* @__PURE__ */ _(w.Button, {
				size: "sm",
				disabled: l || c === "conflict" || !i,
				onClick: () => void h(),
				"data-test": "blocks-publish",
				children: l ? n("blocks.editor.publishing", "Publishing…") : n("blocks.editor.publish", "Publish")
			}),
			/* @__PURE__ */ _(ow, {
				open: c === "conflict",
				overwriting: f,
				onReload: () => window.location.reload(),
				onOverwrite: () => void g()
			})
		]
	});
}
function uw({ state: e, publishedAt: t }) {
	let { t: n } = (0, w.useT)("blocks"), r = {
		conflict: n("blocks.editor.conflict", "Changed elsewhere"),
		dirty: n("blocks.editor.unsaved", "Unsaved changes"),
		error: n("blocks.editor.save-failed", "Could not save"),
		idle: "",
		saved: t === null ? n("blocks.editor.saved", "Draft saved") : n("blocks.editor.published", "Published"),
		saving: n("blocks.editor.saving", "Saving…")
	};
	return /* @__PURE__ */ _("span", {
		className: (0, w.cn)("text-xs", e === "conflict" || e === "error" ? "text-lt-danger" : "text-lt-muted-fg"),
		"data-test": "blocks-save-state",
		"data-save-state": e,
		role: "status",
		children: r[e]
	});
}
var dw, fw = S((() => {
	T(), pe(), D(), sw(), A(), dw = [
		"desktop",
		"tablet",
		"mobile"
	];
}));
//#endregion
//#region resources/js/components/editor/focus-registry.ts
function pw() {
	let e = p(/* @__PURE__ */ new Map()), t = p(null);
	return f(() => {
		let n = (t) => Array.from(e.current.get(t)?.values() ?? []), r = (e, t) => {
			let r = n(e), i = t === "start" ? r[0] : r[r.length - 1];
			return i ? (i.focus(t), !0) : !1;
		};
		return {
			appendTo: (e, t) => {
				let r = n(e);
				return r[r.length - 1]?.append?.(t) ?? !1;
			},
			focusInline: r,
			hasInline: (e) => n(e).length > 0,
			register: (n, i, a) => {
				let o = e.current.get(n) ?? /* @__PURE__ */ new Map();
				if (o.set(i, a), e.current.set(n, o), t.current?.blockId === n) {
					let e = t.current.edge;
					t.current = null, queueMicrotask(() => r(n, e));
				}
				return () => {
					let t = e.current.get(n);
					t?.delete(i), t?.size === 0 && e.current.delete(n);
				};
			},
			requestFocus: (e, n) => {
				r(e, n) || (t.current = {
					blockId: e,
					edge: n
				});
			}
		};
	}, []);
}
var mw = S((() => {}));
//#endregion
//#region resources/js/components/editor/keyboard.ts
function hw(e) {
	let t = e.target;
	return t !== null && ([
		"INPUT",
		"SELECT",
		"TEXTAREA"
	].includes(t.tagName) || t.closest("[data-blocks-inspector]") !== null || t.isContentEditable && t.closest(".lt-blocks-canvas") === null);
}
function gw(e) {
	let t = e.target;
	return t !== null && (t.isContentEditable || [
		"INPUT",
		"SELECT",
		"TEXTAREA"
	].includes(t.tagName) || t.closest("[data-blocks-inspector]") !== null);
}
function _w(e, t, n) {
	let r = e.metaKey || e.ctrlKey, i = e.key.toLowerCase();
	if (r && i === "z" && !hw(e)) {
		e.preventDefault(), t.setState(e.shiftKey ? St : xt);
		return;
	}
	if (r && i === "y" && !hw(e)) {
		e.preventDefault(), t.setState(St);
		return;
	}
	if (e.key === "Escape") {
		t.setState((e) => rt(e, null));
		return;
	}
	if (gw(e)) return;
	let a = t.getState(), o = a.selectedId;
	if (o !== null) {
		if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault(), t.setState((e) => ut(e, o));
			return;
		}
		if (r && e.shiftKey && i === "d") {
			e.preventDefault(), t.setState((e) => ft(e, o));
			return;
		}
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			e.preventDefault();
			let r = e.key === "ArrowUp" ? "up" : "down";
			if (e.altKey) {
				let e = BC(a.document, a.types, o, r);
				e && (t.setState((t) => dt(t, o, e)), queueMicrotask(() => n(o)));
				return;
			}
			let i = Ke(a.document), s = i.indexOf(o), c = i[r === "up" ? s - 1 : s + 1];
			c !== void 0 && (t.setState((e) => rt(e, c)), n(c));
		}
	}
}
var vw = S((() => {
	VC(), D(), Ye();
}));
//#endregion
//#region resources/js/components/editor/library-panel.tsx
function yw() {
	let { t: e } = (0, w.useT)("blocks"), { types: t } = O(), n = k((e) => e.patterns), [r, i] = m("blocks"), [a, o] = m(""), s = f(() => {
		let e = a.trim().toLowerCase(), n = t.filter((t) => e === "" || t.label.toLowerCase().includes(e) || t.type.toLowerCase().includes(e) || t.keywords.some((t) => t.toLowerCase().includes(e))), r = /* @__PURE__ */ new Map();
		for (let e of n) r.set(e.category, [...r.get(e.category) ?? [], e]);
		return [...r.entries()].sort(([e], [t]) => (Sw.indexOf(e) + 1 || 99) - (Sw.indexOf(t) + 1 || 99));
	}, [a, t]), c = n.length > 0, l = c ? r : "blocks";
	return /* @__PURE__ */ v("aside", {
		className: "flex w-64 shrink-0 flex-col border-r border-lt-border bg-lt-surface",
		"data-test": "blocks-library",
		"aria-label": e("blocks.editor.library", "Blocks"),
		children: [/* @__PURE__ */ _("div", {
			className: "border-b border-lt-border px-3 py-2 text-sm font-semibold",
			children: c ? /* @__PURE__ */ _(w.SegmentedControl, {
				"aria-label": e("blocks.editor.library", "Blocks"),
				"data-test": "blocks-library-tabs",
				className: "w-full",
				options: [{
					label: e("blocks.editor.library", "Blocks"),
					value: "blocks"
				}, {
					label: e("blocks.editor.patterns", "Patterns"),
					value: "patterns"
				}],
				value: l,
				onValueChange: (e) => i(e)
			}) : e("blocks.editor.library", "Blocks")
		}), l === "blocks" ? /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _("div", {
			className: "px-3 py-2",
			children: /* @__PURE__ */ _(w.Input, {
				type: "search",
				value: a,
				placeholder: e("blocks.editor.search", "Search blocks"),
				"aria-label": e("blocks.editor.search", "Search blocks"),
				"data-test": "blocks-library-search",
				onChange: (e) => o(e.target.value)
			})
		}), /* @__PURE__ */ v("div", {
			className: "flex-1 overflow-y-auto px-3 pb-3",
			children: [s.length === 0 && /* @__PURE__ */ _("p", {
				className: "py-4 text-sm text-lt-muted-fg",
				children: e("blocks.editor.no-results", "No blocks match.")
			}), s.map(([t, n]) => /* @__PURE__ */ v("section", {
				className: "mb-3",
				children: [/* @__PURE__ */ _("h3", {
					className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-lt-muted-fg",
					children: e(`blocks.editor.categories.${t}`, t)
				}), /* @__PURE__ */ _("ul", {
					className: "grid grid-cols-3 gap-1.5",
					children: n.map((e) => /* @__PURE__ */ _("li", { children: /* @__PURE__ */ _(bw, { type: e }) }, e.type))
				})]
			}, t))]
		})] }) : /* @__PURE__ */ _("ul", {
			className: "flex flex-1 flex-col gap-2 overflow-y-auto p-3",
			"data-test": "blocks-patterns",
			children: n.map((e) => /* @__PURE__ */ _("li", { children: /* @__PURE__ */ _(xw, { pattern: e }) }, e.key))
		})]
	});
}
function bw({ type: e }) {
	let { t } = (0, w.useT)("blocks"), { store: n, requestRender: r, focusBlock: i } = O(), a = p(null), [o, s] = m(!1);
	return l(() => {
		let t = a.current;
		if (t) return (0, w.draggable)({
			element: t,
			getInitialData: () => on(e.type),
			onDragStart: () => s(!0),
			onDrop: () => s(!1)
		});
	}, [e.type]), /* @__PURE__ */ v("button", {
		ref: a,
		type: "button",
		title: e.description ?? e.label,
		"data-test": `library-${e.type}`,
		className: `flex h-16 w-full cursor-grab flex-col items-center justify-center gap-1 rounded-lt border border-lt-border bg-lt-surface px-1 text-[11px] text-lt-fg transition-colors hover:border-lt-primary hover:text-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none ${o ? "opacity-50" : ""}`,
		onClick: () => {
			let a = null;
			n.setState((t) => {
				let n = ct(t, e.type, at(t, [e.type]));
				return a = n.id, n.state;
			}), a && (r(a), (0, w.announce)(t("blocks.editor.block-added", "{{label}} added", { label: e.label })), queueMicrotask(() => i(a)));
		},
		children: [e.icon && /* @__PURE__ */ _(w.Icon, {
			name: e.icon,
			className: "size-lt-icon-md"
		}), /* @__PURE__ */ _("span", {
			className: "truncate",
			children: e.label
		})]
	});
}
function xw({ pattern: e }) {
	let { t } = (0, w.useT)("blocks"), { store: n, requestRender: r, focusBlock: i } = O(), a = f(() => e.blocks.map((e) => e.type), [e.blocks]);
	return /* @__PURE__ */ v("button", {
		type: "button",
		"data-test": `pattern-${e.key}`,
		className: "flex w-full items-start gap-3 rounded-lt border border-lt-border bg-lt-surface px-3 py-2 text-start text-sm text-lt-fg transition-colors hover:border-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none",
		onClick: () => {
			let o = [];
			if (n.setState((t) => {
				let n = ot(t, e.key, at(t, a));
				return o = n.ids, n.state;
			}), o.length === 0) return;
			o.forEach(r), (0, w.announce)(t("blocks.editor.pattern-added", "{{label}} added", { label: e.label }));
			let s = o[0];
			queueMicrotask(() => i(s));
		},
		children: [e.icon && /* @__PURE__ */ _(w.Icon, {
			name: e.icon,
			className: "mt-0.5 size-lt-icon-md shrink-0 text-lt-muted-fg"
		}), /* @__PURE__ */ v("span", {
			className: "flex min-w-0 flex-col gap-0.5",
			children: [/* @__PURE__ */ _("span", {
				className: "font-medium",
				children: e.label
			}), e.description && /* @__PURE__ */ _("span", {
				className: "text-xs text-lt-muted-fg",
				children: e.description
			})]
		})]
	});
}
var Sw, Cw = S((() => {
	T(), hn(), D(), A(), Sw = [
		"text",
		"media",
		"layout",
		"embed"
	];
}));
//#endregion
//#region resources/js/components/editor/use-render-queue.ts
function ww(e, t, n = 300) {
	let r = p(/* @__PURE__ */ new Map()), i = p(/* @__PURE__ */ new Map()), a = o(async (n) => {
		if (!t) return;
		let r = E(e.getState().document, n);
		if (!r) return;
		let a = (i.current.get(n) ?? 0) + 1;
		i.current.set(n, a);
		let o = await se(t, r.node).catch(() => null);
		!o || i.current.get(n) !== a || e.setState((e) => E(e.document, n) ? yt(e, n, o.node, o.errors) : e);
	}, [t, e]), s = o((e) => {
		let t = r.current.get(e);
		t && clearTimeout(t), r.current.set(e, setTimeout(() => {
			r.current.delete(e), a(e);
		}, n));
	}, [n, a]);
	return l(() => {
		let t = /* @__PURE__ */ new Set(), n = e.subscribe(() => {
			for (let n of e.getState().staleIds) t.has(n) || (t.add(n), s(n));
			Array.from(t).filter((t) => !e.getState().staleIds.includes(t)).forEach((e) => t.delete(e));
		});
		return () => {
			n(), r.current.forEach((e) => clearTimeout(e)), r.current.clear();
		};
	}, [s, e]), s;
}
var Tw = S((() => {
	pe(), D(), Ye();
})), Ew = /* @__PURE__ */ re({ default: () => Dw });
function Dw({ node: e }) {
	let { document: t, rendered: n, types: r, patterns: i, revision: a, endpoint: o, ref: s, previewUrl: c, title: l } = e.props, [u] = m(() => tt({
		document: st(t, r),
		patterns: i,
		rendered: n,
		revision: a,
		types: r
	})), d = f(() => o && s ? {
		ref: s,
		url: o
	} : null, [s, o]), { registerBlock: p, focusBlock: h } = Rt(), g = pw(), y = ww(u, d), { saveNow: b } = Nt(u, d), x = f(() => ({
		endpoint: d,
		focusBlock: h,
		inline: g,
		registerBlock: p,
		requestRender: y,
		saveNow: b,
		store: u,
		types: r
	}), [
		d,
		h,
		g,
		p,
		y,
		b,
		u,
		r
	]);
	return /* @__PURE__ */ _(It, {
		value: x,
		children: /* @__PURE__ */ v("div", {
			className: "fixed inset-0 z-30 flex flex-col bg-lt-bg text-lt-fg",
			"data-test": "blocks-editor",
			onKeyDown: (e) => _w(e, u, h),
			children: [/* @__PURE__ */ _(lw, {
				title: l,
				previewUrl: c
			}), /* @__PURE__ */ v("div", {
				className: "flex min-h-0 flex-1",
				children: [
					/* @__PURE__ */ _(yw, {}),
					/* @__PURE__ */ _(rw, {}),
					/* @__PURE__ */ _(nn, {})
				]
			})]
		})
	});
}
var Ow = S((() => {
	Ft(), D(), rn(), aw(), A(), fw(), mw(), vw(), Cw(), Tw();
}));
//#endregion
//#region resources/js/components/editor/block-editor-adapter.tsx
T();
var kw = a(() => Promise.resolve().then(() => (Ow(), Ew))), Aw = ({ node: e }) => /* @__PURE__ */ _(n, {
	fallback: /* @__PURE__ */ _("div", {
		className: "flex h-64 items-center justify-center",
		"data-test": "blocks-editor-loading",
		children: /* @__PURE__ */ _(w.Spinner, {})
	}),
	children: /* @__PURE__ */ _(kw, { node: e })
});
//#endregion
//#region resources/js/components/view/block-frame-adapter.tsx
zC();
var jw = ({ node: e, children: t }) => /* @__PURE__ */ _(RC, {
	style: e.props.style,
	className: e.props.class ?? void 0,
	children: t
}), Mw = ({ children: e }) => /* @__PURE__ */ _("div", {
	className: "lt-blocks flex w-full flex-col",
	"data-test": "blocks-view",
	children: e
});
//#endregion
//#region resources/js/components/view/rich-text-adapter.tsx
T();
var Nw = ({ node: e }) => /* @__PURE__ */ _("div", {
	className: (0, w.cn)(e.props.class ?? void 0),
	"data-test": (0, w.nodeIdentity)(e),
	dangerouslySetInnerHTML: { __html: e.props.html }
}), Pw = ({ children: e }) => /* @__PURE__ */ _("div", {
	className: "flex min-w-0 flex-col gap-4",
	children: e
});
//#endregion
//#region resources/js/components/view/unknown-block.tsx
T();
function Fw({ blockType: e }) {
	let { t } = (0, w.useT)("blocks");
	return /* @__PURE__ */ _("div", {
		className: "rounded-lt border border-dashed border-lt-border bg-lt-muted px-4 py-3 text-sm text-lt-muted-fg",
		"data-test": "blocks-unknown",
		role: "note",
		children: t("blocks.editor.unknown-block", "Unknown block: {{type}}", { type: e })
	});
}
//#endregion
//#region resources/js/components/view/unknown-block-adapter.tsx
var Iw = ({ node: e }) => /* @__PURE__ */ _(Fw, { blockType: e.props.blockType });
//#endregion
//#region resources/js/plugin.ts
T();
var Lw = {
	name: "lattice/blocks",
	components: {
		"blocks.editor": (0, w.eagerComponent)(Aw),
		"blocks.frame": (0, w.eagerComponent)(jw),
		"blocks.rich-text": (0, w.eagerComponent)(Nw),
		"blocks.slot": (0, w.eagerComponent)(Pw),
		"blocks.unknown": (0, w.eagerComponent)(Iw),
		"blocks.view": (0, w.eagerComponent)(Mw)
	},
	i18n: { namespace: "blocks" }
};
//#endregion
export { Lw as default };
