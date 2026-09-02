import { Suspense as e, createContext as t, lazy as n, useCallback as r, useContext as i, useEffect as a, useId as o, useMemo as s, useRef as c, useState as l, useSyncExternalStore as u } from "react";
import { Fragment as d, jsx as f, jsxs as p } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var m = Object.defineProperty, h = Object.getOwnPropertyDescriptor, g = Object.getOwnPropertyNames, _ = Object.prototype.hasOwnProperty, v = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, y = (e, t) => {
	let n = {};
	for (var r in e) m(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || m(n, Symbol.toStringTag, { value: "Module" }), n;
}, b = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = g(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !_.call(e, s) && s !== n && m(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = h(t, s)) || r.enumerable
	});
	return e;
}, x = (e, t, n) => (b(e, t, "default"), n && b(n, t, "default")), S = /* @__PURE__ */ y({});
import * as ee from "@lattice-php/lattice/runtime";
x(S, ee);
var C = v((() => {}));
//#endregion
//#region resources/js/endpoint.ts
async function w(e, t, n, r = !1) {
	return (0, S.apiFetch)(e.url, {
		body: JSON.stringify(n),
		headers: { "Content-Type": "application/json" },
		keepalive: r,
		method: t,
		ref: e.ref,
		throwOnError: !1
	});
}
async function T(e, t) {
	let n = await w(e, "POST", {
		_op: "render",
		block: t
	});
	if (!n.ok) return null;
	let r = await n.json();
	return {
		errors: k(r.errors),
		node: r.node
	};
}
async function E(e, t, n, r = !1) {
	return O(await w(e, "PATCH", {
		document: t,
		revision: n
	}, r));
}
async function D(e, t, n) {
	return O(await w(e, "POST", {
		_op: "publish",
		document: t,
		revision: n
	}));
}
async function O(e) {
	if (e.status === 409) return {
		revision: (await e.json()).revision,
		status: "conflict"
	};
	if (e.status === 422) return {
		errors: A((await e.json()).errors),
		status: "invalid"
	};
	if (!e.ok) return {
		httpStatus: e.status,
		status: "failed"
	};
	let t = await e.json();
	return {
		errors: A(t.errors),
		revision: t.revision,
		status: "saved"
	};
}
function k(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function A(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
var j = v((() => {
	C();
}));
//#endregion
//#region resources/js/document/history.ts
function te(e) {
	return {
		future: [],
		lastAt: 0,
		lastKey: null,
		past: [],
		present: e
	};
}
function ne(e, t, n = {}) {
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
function re(e) {
	let t = e.past[e.past.length - 1];
	return t === void 0 ? e : {
		future: [e.present, ...e.future],
		lastAt: 0,
		lastKey: null,
		past: e.past.slice(0, -1),
		present: t
	};
}
function ie(e) {
	let [t, ...n] = e.future;
	return t === void 0 ? e : {
		future: n,
		lastAt: 0,
		lastKey: null,
		past: [...e.past, e.present],
		present: t
	};
}
var ae = v((() => {}));
//#endregion
//#region resources/js/document/tree.ts
function oe() {
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
function se() {
	return `b_${(typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "") : Math.random().toString(36).slice(2).padEnd(12, "0")).slice(0, 8)}`;
}
function ce(e, t = se()) {
	return {
		data: { ...e.defaults },
		id: t,
		slots: {},
		style: oe(),
		type: e.type
	};
}
function M(e) {
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
function N(e, t) {
	return M(e).find((e) => e.node.id === t) ?? null;
}
function le(e, t, n) {
	if (t === null) return e.blocks;
	let r = N(e, t);
	return r && n !== null ? r.node.slots[n] ?? [] : [];
}
function ue(e, t, n) {
	let r = N(e, t);
	return r ? M({
		blocks: [r.node],
		version: e.version
	}).some((e) => e.node.id === n && e.node.id !== t) : !1;
}
function de(e, t, n) {
	let r = !1, i = e.map((e) => {
		if (e.id === t) {
			let t = n(e);
			return r ||= t !== e, t;
		}
		let i = !1, a = {};
		for (let [r, o] of Object.entries(e.slots)) {
			let e = de(o, t, n);
			a[r] = e, i ||= e !== o;
		}
		return i ? (r = !0, {
			...e,
			slots: a
		}) : e;
	});
	return r ? i : e;
}
function P(e, t, n) {
	let r = de(e.blocks, t, n);
	return r === e.blocks ? e : {
		...e,
		blocks: r
	};
}
function fe(e, t, n) {
	if (t.parentId === null) return {
		...e,
		blocks: n(e.blocks)
	};
	let r = t.slot;
	return r === null ? e : P(e, t.parentId, (e) => ({
		...e,
		slots: {
			...e.slots,
			[r]: n(e.slots[r] ?? [])
		}
	}));
}
function F(e, t, n) {
	return fe(e, n, (e) => {
		let r = Math.max(0, Math.min(n.index, e.length));
		return [
			...e.slice(0, r),
			t,
			...e.slice(r)
		];
	});
}
function pe(e, t) {
	let n = N(e, t);
	return n ? fe(e, n, (e) => e.filter((e) => e.id !== t)) : e;
}
function me(e, t, n) {
	let r = N(e, t);
	if (!r || n.parentId !== null && (n.parentId === t || ue(e, t, n.parentId))) return e;
	let i = r.parentId === n.parentId && r.slot === n.slot && n.index > r.index ? n.index - 1 : n.index;
	return F(pe(e, t), r.node, {
		...n,
		index: i
	});
}
function he(e) {
	let t = {};
	for (let [n, r] of Object.entries(e.slots)) t[n] = r.map(he);
	return {
		...e,
		id: se(),
		slots: t,
		style: {
			...e.style,
			anchor: null
		}
	};
}
function ge(e, t) {
	let n = N(e, t);
	if (!n) return {
		document: e,
		id: null
	};
	let r = he(n.node);
	return {
		document: F(e, r, {
			index: n.index + 1,
			parentId: n.parentId,
			slot: n.slot
		}),
		id: r.id
	};
}
function _e(e, t, n) {
	return n.length === 0 ? e : P(e, t, (e) => {
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
function ve(e) {
	return M(e).map((e) => e.node.id);
}
function ye(e, t) {
	let n = M(e), r = [], i = n.find((e) => e.node.id === t) ?? null;
	for (; i;) {
		r.unshift(i);
		let e = i.parentId;
		i = e === null ? null : n.find((t) => t.node.id === e) ?? null;
	}
	return r;
}
function be(e, t) {
	let n = new Map(M(e).map((e) => [e.node.id, e.node.data]));
	return M(t).filter((e) => {
		let t = n.get(e.node.id);
		return t === void 0 || JSON.stringify(t) !== JSON.stringify(e.node.data);
	}).map((e) => e.node.id);
}
var I = v((() => {}));
//#endregion
//#region resources/js/document/rules.ts
function xe(e, t) {
	return e.find((e) => e.type === t) ?? null;
}
function Se(e, t, n) {
	return xe(e, t)?.slots.find((e) => e.name === n) ?? null;
}
function L({ document: e, types: t, blockType: n, parentId: r, slot: i, movingId: a = null }) {
	if (r === null) return !0;
	let o = N(e, r);
	if (!o || i === null) return !1;
	let s = Se(t, o.node.type, i);
	return !s || s.allows !== null && !s.allows.includes(n) ? !1 : s.max === null || le(e, r, i).filter((e) => e.id !== a).length < s.max;
}
function Ce(e, t, n, r) {
	return t.filter((i) => L({
		blockType: i.type,
		document: e,
		parentId: n,
		slot: r,
		types: t
	}));
}
var R = v((() => {
	I();
}));
//#endregion
//#region resources/js/document/store.ts
function we(e) {
	let t = {
		document: e.document,
		errors: {},
		history: te(e.document),
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
function z(e, t, n = null, r = []) {
	return t === e.document ? e : {
		...e,
		document: t,
		history: ne(e.history, t, { coalesceKey: n }),
		saveState: e.saveState === "conflict" ? "conflict" : "dirty",
		staleIds: r.length === 0 ? e.staleIds : [...e.staleIds, ...r]
	};
}
function B(e, t) {
	return e.selectedId === t ? e : {
		...e,
		selectedId: t
	};
}
function V(e, t, n) {
	let r = xe(e.types, t);
	if (!r || !L({
		blockType: t,
		document: e.document,
		parentId: n.parentId,
		slot: n.slot,
		types: e.types
	})) return {
		id: null,
		state: e
	};
	let i = ce(r), a = F(e.document, i, n);
	return {
		id: i.id,
		state: {
			...z(e, a, null, [i.id]),
			selectedId: i.id
		}
	};
}
function Te(e, t) {
	let n = z(e, pe(e.document, t));
	return n.selectedId === t ? {
		...n,
		selectedId: null
	} : n;
}
function H(e, t, n) {
	let r = N(e.document, t);
	return r && L({
		blockType: r.node.type,
		document: e.document,
		movingId: t,
		parentId: n.parentId,
		slot: n.slot,
		types: e.types
	}) ? z(e, me(e.document, t, n)) : e;
}
function Ee(e, t) {
	let n = ge(e.document, t);
	if (n.id === null) return e;
	let r = N(n.document, n.id), i = { ...e.rendered }, a = e.rendered[t];
	r && a && (i[n.id] = Oe(a, n.id));
	let o = r ? De(r.node).filter((e) => e !== n.id) : [];
	return {
		...z(e, n.document, null, o),
		rendered: i,
		selectedId: n.id
	};
}
function De(e) {
	return [e.id, ...Object.values(e.slots).flat().flatMap(De)];
}
function Oe(e, t) {
	return {
		...e,
		props: {
			...e.props,
			blockId: t
		}
	};
}
function ke(e, t, n, r) {
	return z(e, P(e.document, t, (e) => ({
		...e,
		data: {
			...e.data,
			[n]: r
		}
	})), `data:${t}:${n}`);
}
function Ae(e, t, n) {
	return z(e, P(e.document, t, (e) => ({
		...e,
		style: {
			...e.style,
			...n
		}
	})), `style:${t}:${Object.keys(n).join(",")}`);
}
function je(e, t, n, r) {
	let i = Me(n), a = _e(e.document, t, i), o = { ...e.errors };
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
	return a === e.document ? s : z(s, a, `slots:${t}`);
}
function Me(e) {
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
function Ne(e) {
	return Pe(e, re(e.history));
}
function U(e) {
	return Pe(e, ie(e.history));
}
function Pe(e, t) {
	if (t === e.history) return e;
	let n = be(e.document, t.present), r = e.selectedId !== null && N(t.present, e.selectedId) !== null;
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
function Fe(e) {
	return {
		...e,
		saveState: "saving"
	};
}
function Ie(e, t, n, r) {
	return {
		...e,
		errors: n,
		revision: t,
		saveState: e.document === r ? "saved" : "dirty"
	};
}
function Le(e, t) {
	return {
		...e,
		revision: t,
		saveState: "conflict"
	};
}
function W(e) {
	return {
		...e,
		saveState: "error"
	};
}
function G(e, t) {
	return {
		...e,
		publishing: t
	};
}
function Re(e, t) {
	return {
		...e,
		publishedAt: Date.now(),
		publishing: !1,
		revision: t,
		saveState: "saved"
	};
}
function ze(e, t) {
	return {
		...e,
		errors: t
	};
}
var K = v((() => {
	ae(), R(), I();
}));
//#endregion
//#region resources/js/autosave.ts
function Be(e, t, n = Ve) {
	let r = c(null), i = c(!1);
	a(() => {
		if (!t) return;
		let a = async (n = !1) => {
			let r = e.getState();
			if (r.saveState !== "dirty" || i.current) return;
			i.current = !0, e.setState(Fe);
			let a = r.document;
			try {
				let i = await E(t, a, r.revision, n);
				e.setState((e) => {
					switch (i.status) {
						case "saved": return Ie(e, i.revision, i.errors, a);
						case "conflict": return Le(e, i.revision);
						case "invalid": return W({
							...e,
							errors: i.errors
						});
						case "failed": return W(e);
					}
				});
			} catch {
				e.setState(W);
			} finally {
				i.current = !1;
			}
		}, o = () => {
			r.current !== null && clearTimeout(r.current), r.current = setTimeout(() => {
				r.current = null, a();
			}, n);
		}, s = e.subscribe(() => {
			let { saveState: t } = e.getState();
			t === "dirty" && o();
		}), c = () => {
			document.visibilityState === "hidden" && a(!0);
		};
		return document.addEventListener("visibilitychange", c), window.addEventListener("pagehide", c), () => {
			s(), document.removeEventListener("visibilitychange", c), window.removeEventListener("pagehide", c), r.current !== null && clearTimeout(r.current);
		};
	}, [
		n,
		t,
		e
	]);
}
var Ve, He = v((() => {
	j(), K(), Ve = 5e3;
}));
//#endregion
//#region resources/js/components/editor/editor-context.tsx
function Ue({ value: e, children: t }) {
	return /* @__PURE__ */ f(Y.Provider, {
		value: e,
		children: t
	});
}
function q() {
	let e = i(Y);
	if (!e) throw Error("Block editor components must render inside <EditorProvider>.");
	return e;
}
function J(e) {
	let { store: t } = q(), n = c(e);
	n.current = e;
	let i = r(() => n.current(t.getState()), [t]);
	return u(t.subscribe, i, i);
}
function We(e) {
	let { types: t } = q();
	return s(() => t.find((t) => t.type === e) ?? null, [e, t]);
}
function Ge() {
	let e = c(/* @__PURE__ */ new Map()), t = r((t, n) => {
		n ? e.current.set(t, n) : e.current.delete(t);
	}, []);
	return {
		focusBlock: r((t) => {
			e.current.get(t)?.focus({ preventScroll: !1 });
		}, []),
		registerBlock: t
	};
}
var Y, X = v((() => {
	Y = t(null);
}));
//#endregion
//#region resources/js/components/inspector/field-row.tsx
function Ke({ label: e, children: t, htmlFor: n }) {
	return /* @__PURE__ */ p("div", {
		className: "grid grid-cols-[6.5rem_1fr] items-center gap-2 text-xs text-lt-fg-2",
		children: [/* @__PURE__ */ f("label", {
			htmlFor: n,
			className: "text-lt-muted-fg",
			children: e
		}), /* @__PURE__ */ f("div", {
			className: "min-w-0",
			children: t
		})]
	});
}
function Z({ title: e, children: t }) {
	return /* @__PURE__ */ p("section", {
		className: "grid gap-2.5 border-b border-lt-border px-3 py-3",
		children: [/* @__PURE__ */ f("h3", {
			className: "text-xs font-semibold text-lt-fg",
			children: e
		}), t]
	});
}
var qe = v((() => {}));
//#endregion
//#region resources/js/components/inspector/advanced-panel.tsx
function Je({ id: e, style: t, supports: n }) {
	let { t: r } = (0, S.useT)("blocks"), { store: i } = q(), a = o();
	return /* @__PURE__ */ p("div", {
		"data-test": "blocks-advanced-panel",
		children: [n.anchor && /* @__PURE__ */ p(Z, {
			title: r("blocks.editor.inspector.anchor", "HTML anchor"),
			children: [/* @__PURE__ */ f(Ke, {
				label: "#",
				htmlFor: a,
				children: /* @__PURE__ */ f(S.Input, {
					id: a,
					density: "compact",
					value: t.anchor ?? "",
					"data-test": "blocks-style-anchor",
					onChange: (t) => i.setState((n) => Ae(n, e, { anchor: t.target.value.trim() === "" ? null : t.target.value.trim() }))
				})
			}), /* @__PURE__ */ f("p", {
				className: "text-xs text-lt-muted-fg",
				children: r("blocks.editor.inspector.anchor-help", "Lets you link directly to this block.")
			})]
		}), /* @__PURE__ */ f(Z, {
			title: "ID",
			children: /* @__PURE__ */ f("code", {
				className: "text-xs text-lt-muted-fg",
				children: e
			})
		})]
	});
}
var Ye = v((() => {
	C(), K(), X(), qe();
}));
//#endregion
//#region resources/js/components/inspector/content-panel.tsx
function Xe({ id: e, type: t, data: n }) {
	let { t: i } = (0, S.useT)("blocks"), { store: a, requestRender: o } = q(), c = J((t) => t.errors[e]), l = s(() => ({
		...t.defaults,
		...n
	}), [n, t.defaults]), u = s(() => {
		let e = {};
		for (let [t, n] of Object.entries(c ?? {})) e[t] = n[0];
		return e;
	}, [c]), d = s(() => ({
		action: "#",
		clearErrors: () => {},
		componentId: `blocks-content-${e}`,
		componentRef: "",
		errors: u,
		fieldIdPrefix: `blocks-content-${e}`,
		fieldLabels: {},
		precognitive: !1,
		processing: !1,
		touch: () => {},
		validate: () => {},
		validateFields: () => {},
		validating: !1
	}), [u, e]), p = r((t, n) => {
		a.setState((r) => ke(r, e, t, n)), o(e);
	}, [
		e,
		o,
		a
	]);
	return t.schema.length === 0 ? /* @__PURE__ */ f("p", {
		className: "px-3 py-3 text-sm text-lt-muted-fg",
		children: i("blocks.editor.inspector.no-content-fields", "This block has no content fields.")
	}) : /* @__PURE__ */ f("div", {
		className: "grid gap-4 px-3 py-3",
		"data-test": "blocks-content-panel",
		children: /* @__PURE__ */ f(S.FormProvider, {
			value: d,
			children: /* @__PURE__ */ f(S.PrefillProvider, {
				value: { markUserEdit: () => {} },
				children: /* @__PURE__ */ f(S.ResolvedNodesProvider, {
					nodes: {},
					children: /* @__PURE__ */ f(S.FormValuesProvider, {
						initial: l,
						children: /* @__PURE__ */ f(Ze, {
							onChange: p,
							children: /* @__PURE__ */ f(S.Renderer, { nodes: t.schema })
						})
					})
				})
			})
		})
	});
}
function Ze({ children: e, onChange: t }) {
	let n = (0, S.useFormValues)(), i = (0, S.useSetFormValue)(), a = c(n);
	a.current = n;
	let o = r((e, n) => {
		let r = typeof n == "function" ? n((0, S.getPath)(a.current, e)) : n;
		a.current = (0, S.setPath)(a.current, e, r), i(e, r), t(e.split(".")[0], (0, S.getPath)(a.current, e.split(".")[0]));
	}, [t, i]), l = s(() => ({
		blur: () => {},
		change: o,
		commit: o
	}), [o]);
	return /* @__PURE__ */ f(S.FieldCommitOverrideProvider, {
		value: l,
		children: e
	});
}
var Qe = v((() => {
	C(), K(), X();
}));
//#endregion
//#region resources/js/components/inspector/structure-panel.tsx
function $e() {
	let { t: e } = (0, S.useT)("blocks"), { store: t, types: n, focusBlock: r } = q(), i = J((e) => e.document), a = J((e) => e.selectedId), o = s(() => M(i), [i]);
	return o.length === 0 ? /* @__PURE__ */ f("p", {
		className: "px-3 py-3 text-sm text-lt-muted-fg",
		children: e("blocks.editor.empty", "This page has no blocks yet. Pick one from the library.")
	}) : /* @__PURE__ */ f("ul", {
		className: "py-2",
		"data-test": "blocks-structure",
		"aria-label": e("blocks.editor.inspector.structure", "Structure"),
		children: o.map((e) => {
			let i = n.find((t) => t.type === e.node.type), o = e.node.id === a;
			return /* @__PURE__ */ f("li", { children: /* @__PURE__ */ p("button", {
				type: "button",
				"aria-current": o || void 0,
				"data-test": `structure-${e.node.id}`,
				className: (0, S.cn)("flex w-full items-center gap-2 px-3 py-1 text-left text-xs hover:bg-lt-accent hover:text-lt-accent-fg", o && "bg-lt-accent font-medium text-lt-accent-fg"),
				style: { paddingLeft: `${.75 + e.depth * .9}rem` },
				onClick: () => {
					t.setState((t) => B(t, e.node.id)), r(e.node.id);
				},
				children: [
					i?.icon && /* @__PURE__ */ f(S.Icon, {
						name: i.icon,
						className: "size-lt-icon-sm text-lt-muted-fg"
					}),
					/* @__PURE__ */ f("span", {
						className: "truncate",
						children: i?.label ?? e.node.type
					}),
					e.slot && /* @__PURE__ */ f("span", {
						className: "ml-auto truncate text-[10px] text-lt-muted-fg",
						children: e.slot
					})
				]
			}) }, e.node.id);
		})
	});
}
var et = v((() => {
	C(), K(), I(), X();
}));
//#endregion
//#region resources/js/components/inspector/style-panel.tsx
function tt({ id: e, style: t, supports: n }) {
	let { t: r } = (0, S.useT)("blocks"), { store: i } = q(), a = o(), s = (t) => i.setState((n) => Ae(n, e, t));
	if (!n.width && !n.spacing && !n.background && !n.align && !n.visibility) return /* @__PURE__ */ f("p", {
		className: "px-3 py-3 text-sm text-lt-muted-fg",
		children: r("blocks.editor.inspector.no-style-options", "This block has no style options.")
	});
	let c = (e, n) => /* @__PURE__ */ f(Ke, {
		label: n,
		htmlFor: `${a}-${e}`,
		children: /* @__PURE__ */ p(S.NativeSelect, {
			id: `${a}-${e}`,
			density: "compact",
			value: t[e] ?? "",
			"data-test": `blocks-style-${e}`,
			onChange: (t) => s({ [e]: t.target.value === "" ? null : t.target.value }),
			children: [/* @__PURE__ */ f("option", {
				value: "",
				children: r("blocks.editor.inspector.spacing-default", "Default")
			}), nt.map((e) => /* @__PURE__ */ f("option", {
				value: e,
				children: e
			}, e))]
		})
	});
	return /* @__PURE__ */ p("div", {
		"data-test": "blocks-style-panel",
		children: [
			n.width && /* @__PURE__ */ f(Z, {
				title: r("blocks.editor.inspector.width", "Width"),
				children: /* @__PURE__ */ f(S.SegmentedControl, {
					"aria-label": r("blocks.editor.inspector.width", "Width"),
					"data-test": "blocks-style-width",
					value: t.width ?? "full",
					onValueChange: (e) => s({ width: e }),
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
			n.spacing && /* @__PURE__ */ p(Z, {
				title: r("blocks.editor.inspector.padding-top", "Padding top").replace(/ top$/i, ""),
				children: [
					c("paddingTop", r("blocks.editor.inspector.padding-top", "Padding top")),
					c("paddingBottom", r("blocks.editor.inspector.padding-bottom", "Padding bottom")),
					c("marginTop", r("blocks.editor.inspector.margin-top", "Margin top")),
					c("marginBottom", r("blocks.editor.inspector.margin-bottom", "Margin bottom"))
				]
			}),
			n.background && /* @__PURE__ */ f(Z, {
				title: r("blocks.editor.inspector.background", "Background"),
				children: /* @__PURE__ */ f(S.SegmentedControl, {
					"aria-label": r("blocks.editor.inspector.background", "Background"),
					"data-test": "blocks-style-background",
					value: t.background ?? "none",
					onValueChange: (e) => s({ background: e }),
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
			n.align && /* @__PURE__ */ f(Z, {
				title: r("blocks.editor.inspector.align", "Alignment"),
				children: /* @__PURE__ */ f(S.SegmentedControl, {
					"aria-label": r("blocks.editor.inspector.align", "Alignment"),
					"data-test": "blocks-style-align",
					value: t.align ?? "start",
					onValueChange: (e) => s({ align: e }),
					options: [{
						label: r("blocks.editor.inspector.align-start", "Start"),
						value: "start"
					}, {
						label: r("blocks.editor.inspector.align-center", "Center"),
						value: "center"
					}]
				})
			}),
			n.visibility && /* @__PURE__ */ p(Z, {
				title: r("blocks.editor.inspector.visibility", "Visibility"),
				children: [/* @__PURE__ */ p("label", {
					className: "flex items-center gap-2 text-xs",
					children: [/* @__PURE__ */ f(S.Checkbox, {
						checked: t.hideOnMobile,
						"data-test": "blocks-style-hide-mobile",
						onCheckedChange: (e) => s({ hideOnMobile: e === !0 })
					}), r("blocks.editor.inspector.hide-on-mobile", "Hide on mobile")]
				}), /* @__PURE__ */ p("label", {
					className: "flex items-center gap-2 text-xs",
					children: [/* @__PURE__ */ f(S.Checkbox, {
						checked: t.hideOnDesktop,
						"data-test": "blocks-style-hide-desktop",
						onCheckedChange: (e) => s({ hideOnDesktop: e === !0 })
					}), r("blocks.editor.inspector.hide-on-desktop", "Hide on desktop")]
				})]
			})
		]
	});
}
var nt, rt = v((() => {
	C(), K(), X(), qe(), nt = [
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
function it() {
	let { t: e } = (0, S.useT)("blocks"), t = J((e) => e.selectedId), n = J((e) => e.document), r = J((e) => e.travelCount), i = s(() => t ? N(n, t) : null, [n, t]), a = We(i?.node.type ?? ""), [o, c] = l("style"), u = (a?.schema.length ?? 0) > 0, m = i ? o === "content" && !u ? "style" : o : "structure", h = [
		{
			key: "style",
			label: e("blocks.editor.inspector.style", "Style")
		},
		{
			hidden: !u,
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
	return /* @__PURE__ */ p("aside", {
		className: "flex w-80 shrink-0 flex-col border-l border-lt-border bg-lt-surface",
		"data-test": "blocks-inspector",
		"data-blocks-inspector": !0,
		"aria-label": e("blocks.editor.inspector.title", "Block"),
		children: [/* @__PURE__ */ p("div", {
			className: "flex h-10 items-center gap-2 border-b border-lt-border px-3 text-sm font-semibold",
			children: [
				a?.icon && /* @__PURE__ */ f(S.Icon, {
					name: a.icon,
					className: "size-lt-icon-md text-lt-muted-fg"
				}),
				/* @__PURE__ */ f("span", {
					"data-test": "blocks-inspector-title",
					children: a?.label ?? e("blocks.editor.inspector.title", "Block")
				}),
				i && /* @__PURE__ */ f("span", {
					className: "ml-auto font-mono text-[10px] font-normal text-lt-muted-fg",
					children: i.node.type
				})
			]
		}), i ? /* @__PURE__ */ p(d, { children: [/* @__PURE__ */ f("div", {
			role: "tablist",
			className: "flex border-b border-lt-border px-2",
			children: h.filter((e) => !e.hidden).map((e) => /* @__PURE__ */ f("button", {
				type: "button",
				role: "tab",
				"aria-selected": m === e.key,
				"data-test": `blocks-inspector-tab-${e.key}`,
				className: (0, S.cn)("-mb-px border-b-2 px-2.5 py-2 text-xs font-medium", m === e.key ? "border-lt-fg text-lt-fg" : "border-transparent text-lt-muted-fg hover:text-lt-fg"),
				onClick: () => c(e.key),
				children: e.label
			}, e.key))
		}), /* @__PURE__ */ p("div", {
			className: "min-h-0 flex-1 overflow-y-auto",
			role: "tabpanel",
			children: [
				m === "style" && a && /* @__PURE__ */ f(tt, {
					id: i.node.id,
					style: i.node.style,
					supports: a.supports
				}),
				m === "content" && a && /* @__PURE__ */ f(Xe, {
					id: i.node.id,
					type: a,
					data: i.node.data
				}, `${i.node.id}:${r}`),
				m === "advanced" && a && /* @__PURE__ */ f(Je, {
					id: i.node.id,
					style: i.node.style,
					supports: a.supports
				}),
				m === "structure" && /* @__PURE__ */ f($e, {})
			]
		})] }) : /* @__PURE__ */ p("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ f("p", {
				className: "border-b border-lt-border px-3 py-3 text-sm text-lt-muted-fg",
				"data-test": "blocks-inspector-empty",
				children: e("blocks.editor.inspector.none", "Select a block to edit its settings.")
			}), /* @__PURE__ */ f("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: /* @__PURE__ */ f($e, {})
			})]
		})]
	});
}
var at = v((() => {
	C(), I(), X(), Ye(), Qe(), et(), rt();
}));
//#endregion
//#region resources/js/dnd/block-dnd.ts
function ot(e, t) {
	return {
		blockType: t,
		id: e,
		type: pt
	};
}
function st(e) {
	return {
		blockType: e,
		type: mt
	};
}
function Q(e) {
	return e.type === "lattice-blocks/block" && typeof e.id == "string" && typeof e.blockType == "string" ? {
		blockType: e.blockType,
		id: e.id,
		kind: "block"
	} : e.type === "lattice-blocks/library" && typeof e.blockType == "string" ? {
		blockType: e.blockType,
		kind: "library"
	} : null;
}
function ct(e, t) {
	let n = (0, S.attachClosestEdge)({
		blockId: e,
		kind: "block"
	}, {
		allowedEdges: ["top", "bottom"],
		element: t.element,
		input: t.input
	});
	return {
		...n,
		edge: (0, S.extractClosestEdge)(n)
	};
}
function lt(e) {
	return e.edge === "top" || e.edge === "bottom" ? e.edge : null;
}
function ut(e, t) {
	return {
		kind: "slot",
		parentId: e,
		slot: t
	};
}
function dt(e, t, n) {
	let r = t[0];
	if (!r) return null;
	if (r.data.kind === "block" && typeof r.data.blockId == "string") {
		let t = N(e, r.data.blockId);
		if (!t) return null;
		let i = lt(r.data), a = {
			parentId: t.parentId,
			slot: t.slot
		}, o = n?.kind === "block" ? N(e, n.id) : null;
		if (o != null && o.parentId === a.parentId && o.slot === a.slot && o) {
			let e = (0, S.getReorderDestinationIndex)({
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
			index: t === null ? e.blocks.length : N(e, t)?.node.slots[n ?? ""]?.length ?? 0,
			parentId: t,
			slot: n
		};
	}
	return null;
}
function ft(e, t, n, r) {
	return L({
		blockType: n.blockType,
		document: e,
		movingId: n.kind === "block" ? n.id : null,
		parentId: r.parentId,
		slot: r.slot,
		types: t
	});
}
var pt, mt, $ = v((() => {
	C(), R(), I(), pt = "lattice-blocks/block", mt = "lattice-blocks/library";
}));
//#endregion
//#region resources/js/components/editor/block-list.tsx
function ht({ ids: e }) {
	return /* @__PURE__ */ f(d, { children: e.map((e) => /* @__PURE__ */ f(gt, { id: e }, e)) });
}
function gt({ id: e }) {
	let t = J((t) => t.rendered[e]);
	return t ? /* @__PURE__ */ f(S.RenderNode, { node: t }) : /* @__PURE__ */ f(_t, { id: e });
}
function _t({ id: e }) {
	let { t } = (0, S.useT)("blocks"), { requestRender: n } = q();
	return a(() => {
		n(e);
	}, [e, n]), /* @__PURE__ */ p("div", {
		className: "flex h-16 items-center justify-center gap-2 rounded-lt border border-dashed border-lt-border text-sm text-lt-muted-fg",
		"data-test": `block-${e}`,
		"data-block-pending": !0,
		children: [/* @__PURE__ */ f(S.Spinner, {}), t("blocks.editor.rendering", "Rendering…")]
	});
}
var vt = v((() => {
	C(), X();
}));
//#endregion
//#region resources/js/components/editor/breadcrumbs.tsx
function yt() {
	let { store: e, types: t, focusBlock: n } = q(), r = J((e) => e.document), i = J((e) => e.selectedId), a = s(() => i ? ye(r, i) : [], [r, i]);
	return a.length === 0 ? null : /* @__PURE__ */ f("nav", {
		"aria-label": "Block path",
		"data-test": "blocks-breadcrumbs",
		className: "sticky bottom-0 flex items-center gap-1 border-t border-lt-border bg-lt-surface px-4 py-1.5 text-xs text-lt-muted-fg",
		children: a.map((r, i) => {
			let o = t.find((e) => e.type === r.node.type)?.label ?? r.node.type, s = i === a.length - 1;
			return /* @__PURE__ */ p("span", {
				className: "flex items-center gap-1",
				children: [i > 0 && /* @__PURE__ */ f(S.Icon, {
					name: "chevron-right",
					className: "size-lt-icon-sm",
					"aria-hidden": "true"
				}), /* @__PURE__ */ f("button", {
					type: "button",
					className: s ? "font-medium text-lt-fg" : "hover:text-lt-fg",
					"aria-current": s ? "location" : void 0,
					onClick: () => {
						e.setState((e) => B(e, r.node.id)), n(r.node.id);
					},
					children: o
				})]
			}, r.node.id);
		})
	});
}
var bt = v((() => {
	C(), K(), I(), X();
}));
//#endregion
//#region resources/js/lib/style-classes.ts
function xt(e) {
	return [
		e.marginTop ? Et[e.marginTop] : null,
		e.marginBottom ? Dt[e.marginBottom] : null,
		e.paddingTop ? wt[e.paddingTop] : null,
		e.paddingBottom ? Tt[e.paddingBottom] : null,
		e.background && e.background !== "none" ? `${Ot[e.background]} ${At}` : null,
		e.hideOnMobile ? "max-md:hidden" : null,
		e.hideOnDesktop ? "md:hidden" : null,
		e.align ? kt[e.align] : null
	].filter(Boolean).join(" ");
}
function St(e) {
	return Ct[e.width ?? "full"];
}
var Ct, wt, Tt, Et, Dt, Ot, kt, At, jt = v((() => {
	Ct = {
		content: "mx-auto w-full max-w-3xl",
		full: "w-full",
		wide: "mx-auto w-full max-w-6xl"
	}, wt = {
		lg: "pt-12",
		md: "pt-8",
		none: "pt-0",
		sm: "pt-4",
		xl: "pt-20",
		xs: "pt-2"
	}, Tt = {
		lg: "pb-12",
		md: "pb-8",
		none: "pb-0",
		sm: "pb-4",
		xl: "pb-20",
		xs: "pb-2"
	}, Et = {
		lg: "mt-12",
		md: "mt-8",
		none: "mt-0",
		sm: "mt-4",
		xl: "mt-20",
		xs: "mt-2"
	}, Dt = {
		lg: "mb-12",
		md: "mb-8",
		none: "mb-0",
		sm: "mb-4",
		xl: "mb-20",
		xs: "mb-2"
	}, Ot = {
		inverted: "bg-lt-fg text-lt-bg [&_h1,&_h2,&_h3,&_h4]:text-lt-bg",
		muted: "bg-lt-muted text-lt-fg",
		none: "",
		primary: "bg-lt-primary text-lt-primary-fg [&_h1,&_h2,&_h3,&_h4]:text-lt-primary-fg"
	}, kt = {
		center: "text-center [&_.lt-blocks-prose]:mx-auto",
		start: "text-start"
	}, At = "px-6";
}));
//#endregion
//#region resources/js/components/view/frame.tsx
function Mt({ style: e, children: t, className: n }) {
	return /* @__PURE__ */ f("div", {
		className: (0, S.cn)("lt-blocks-frame", xt(e), n),
		id: e.anchor ?? void 0,
		children: /* @__PURE__ */ f("div", {
			className: St(e),
			children: t
		})
	});
}
var Nt = v((() => {
	C(), jt();
}));
//#endregion
//#region resources/js/dnd/keyboard-move.ts
function Pt(e, t, n, r) {
	let i = N(e, n);
	if (!i) return null;
	let a = i.parentId === null ? e.blocks : N(e, i.parentId)?.node.slots[i.slot ?? ""] ?? [], o = r === "up" ? -1 : 1, s = i.index + o;
	if (s >= 0 && s < a.length) return {
		index: r === "up" ? s : s + 1,
		parentId: i.parentId,
		slot: i.slot
	};
	if (i.parentId === null) return null;
	let c = N(e, i.parentId);
	if (!c) return null;
	let l = {
		index: r === "up" ? c.index : c.index + 1,
		parentId: c.parentId,
		slot: c.slot
	};
	return L({
		blockType: i.node.type,
		document: e,
		movingId: n,
		parentId: l.parentId,
		slot: l.slot,
		types: t
	}) ? l : null;
}
var Ft = v((() => {
	R(), I();
}));
//#endregion
//#region resources/js/components/editor/block-toolbar.tsx
function It({ id: e, label: t, icon: n, handleRef: r }) {
	let { t: i } = (0, S.useT)("blocks"), { store: a, types: o, focusBlock: s } = q(), c = J((e) => e.document), l = Pt(c, o, e, "up"), u = Pt(c, o, e, "down"), d = (n) => {
		let r = n === "up" ? l : u;
		r && (a.setState((t) => H(t, e, r)), (0, S.announce)(i("blocks.editor.block-moved", "{{label}} moved", { label: t })), queueMicrotask(() => s(e)));
	};
	return /* @__PURE__ */ p("div", {
		className: "lt-blocks-ui absolute -top-9 left-0 z-10 flex h-8 items-center gap-0.5 rounded-lt border border-lt-border bg-lt-popover px-1 text-lt-popover-fg shadow-lt-md",
		"data-test": `block-toolbar-${e}`,
		role: "toolbar",
		"aria-label": t,
		onClick: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ f("button", {
				ref: r,
				type: "button",
				"aria-label": i("blocks.editor.drag", "Drag {{label}}", { label: t }),
				"data-test": `block-drag-${e}`,
				className: "inline-flex size-7 cursor-grab items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-accent hover:text-lt-accent-fg",
				children: /* @__PURE__ */ f(S.Icon, {
					name: "grip-vertical",
					className: "size-lt-icon-md"
				})
			}),
			/* @__PURE__ */ f(S.IconButton, {
				icon: "arrow-up",
				label: i("blocks.editor.move-up", "Move up"),
				disabled: !l,
				onClick: () => d("up"),
				"data-test": `block-move-up-${e}`
			}),
			/* @__PURE__ */ f(S.IconButton, {
				icon: "arrow-down",
				label: i("blocks.editor.move-down", "Move down"),
				disabled: !u,
				onClick: () => d("down"),
				"data-test": `block-move-down-${e}`
			}),
			/* @__PURE__ */ f("span", {
				className: "mx-1 h-4 w-px bg-lt-border",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ p("span", {
				className: "flex items-center gap-1.5 px-1.5 text-xs font-medium",
				children: [n && /* @__PURE__ */ f(S.Icon, {
					name: n,
					className: "size-lt-icon-sm"
				}), t]
			}),
			/* @__PURE__ */ f("span", {
				className: "mx-1 h-4 w-px bg-lt-border",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ f(S.IconButton, {
				icon: "copy",
				label: i("blocks.editor.duplicate", "Duplicate"),
				onClick: () => a.setState((t) => Ee(t, e)),
				"data-test": `block-duplicate-${e}`
			}),
			/* @__PURE__ */ f(S.IconButton, {
				icon: "trash-2",
				label: i("blocks.editor.remove", "Remove"),
				onClick: () => a.setState((t) => Te(t, e)),
				"data-test": `block-remove-${e}`
			})
		]
	});
}
var Lt = v((() => {
	C(), Ft(), K(), X();
})), Rt, zt, Bt = v((() => {
	C(), $(), K(), I(), Nt(), Lt(), X(), Rt = {
		bottom: "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-lt-primary",
		left: "",
		right: "",
		top: "before:absolute before:inset-x-0 before:-top-1.5 before:h-0.5 before:rounded-full before:bg-lt-primary"
	}, zt = ({ node: e, children: t }) => {
		let { blockId: n, blockType: r, style: i } = e.props, { t: o } = (0, S.useT)("blocks"), { store: u, types: d, registerBlock: m } = q(), h = J((e) => e.selectedId === n), g = J((e) => e.errors[n] !== void 0), _ = J((e) => e.document), v = We(r), y = v?.label ?? r, b = c(null), x = c(null), [ee, C] = l(!1), [w, T] = l(!1), [E, D] = l(null), [O, k] = l(!1), A = s(() => N(_, n), [_, n]), j = A !== null, te = A?.node.style ?? i;
		return a(() => {
			let e = b.current;
			return m(n, e), () => m(n, null);
		}, [n, m]), a(() => {
			let e = b.current;
			if (!e || !j) return;
			let t = x.current;
			return (0, S.combine)((0, S.cancelDragStartFromInteractive)(e, (e) => e.closest(".lt-blocks-ui") !== null && e !== t), (0, S.draggable)({
				element: e,
				...t ? { dragHandle: t } : {},
				getInitialData: () => ot(n, r),
				onDragStart: () => C(!0),
				onDrop: () => C(!1),
				onGenerateDragPreview: ({ location: t, nativeSetDragImage: n }) => {
					(0, S.setCustomNativeDragPreview)({
						getOffset: (0, S.preserveOffsetOnSource)({
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
			}), (0, S.dropTargetForElements)({
				canDrop: ({ source: e }) => {
					let t = Q(e.data);
					return t !== null && (t.kind !== "block" || t.id !== n);
				},
				element: e,
				getData: ({ element: e, input: t }) => ct(n, {
					element: e,
					input: t
				}),
				getIsSticky: () => !0,
				onDrag: ({ self: e, source: t }) => {
					let n = u.getState(), r = Q(t.data), i = dt(n.document, [e], r), a = r !== null && i !== null && ft(n.document, n.types, r, i);
					D(a ? lt(e.data) : null), k(!a);
				},
				onDragLeave: () => {
					D(null), k(!1);
				},
				onDrop: () => {
					D(null), k(!1);
				}
			}));
		}, [
			r,
			j,
			n,
			u,
			d
		]), /* @__PURE__ */ p("div", {
			ref: b,
			role: "group",
			"aria-label": o("blocks.editor.select-block", "Select {{label}}", { label: y }),
			tabIndex: 0,
			"data-test": `block-${n}`,
			"data-block-id": n,
			"data-block-type": r,
			"data-selected": h || void 0,
			"data-drop-edge": E ?? void 0,
			"data-drop-blocked": O || void 0,
			className: (0, S.cn)("relative rounded-lt outline-none transition-shadow", h && "ring-2 ring-lt-primary ring-offset-2 ring-offset-lt-surface", !h && w && "ring-1 ring-lt-border-2", g && !h && "ring-1 ring-lt-danger", ee && "opacity-40", O && "cursor-not-allowed ring-1 ring-lt-danger", E && Rt[E]),
			onClick: (e) => {
				e.stopPropagation(), u.setState((e) => B(e, n));
			},
			onFocus: (e) => {
				e.target === e.currentTarget && u.setState((e) => B(e, n));
			},
			onMouseEnter: () => T(!0),
			onMouseLeave: () => T(!1),
			children: [
				h && /* @__PURE__ */ f(It, {
					id: n,
					label: y,
					icon: v?.icon ?? null,
					handleRef: x
				}),
				!h && w && /* @__PURE__ */ f("span", {
					className: "pointer-events-none absolute -top-2.5 left-2 z-10 rounded-lt-xs bg-lt-fg px-1.5 text-[10px] font-medium text-lt-bg",
					children: y
				}),
				/* @__PURE__ */ f(Mt, {
					style: te,
					children: t
				})
			]
		});
	};
}));
//#endregion
//#region resources/js/components/editor/insert-menu.tsx
function Vt({ target: e, label: t, compact: n = !1 }) {
	let { t: r } = (0, S.useT)("blocks"), { store: i, types: s, requestRender: u, focusBlock: d } = q(), m = J((e) => e.document), [h, g] = l(!1), _ = o(), v = c(null), y = Ce(m, s, e.parentId, e.slot), b = `insert-${e.parentId ?? "root"}-${e.slot ?? "root"}`;
	a(() => {
		if (!h) return;
		let e = (e) => {
			v.current && !v.current.contains(e.target) && g(!1);
		};
		return window.addEventListener("mousedown", e), () => window.removeEventListener("mousedown", e);
	}, [h]);
	let x = (t) => {
		g(!1);
		let n = null;
		if (i.setState((r) => {
			let i = V(r, t, e);
			return n = i.id, i.state;
		}), n) {
			u(n);
			let e = s.find((e) => e.type === t)?.label ?? t;
			(0, S.announce)(r("blocks.editor.block-added", "{{label}} added", { label: e })), queueMicrotask(() => d(n));
		}
	};
	return y.length === 0 ? null : /* @__PURE__ */ p("div", {
		ref: v,
		className: (0, S.cn)("lt-blocks-ui relative flex justify-center", n ? "py-1" : "py-3"),
		children: [/* @__PURE__ */ p("button", {
			type: "button",
			"aria-expanded": h,
			"aria-controls": _,
			"aria-label": t,
			"data-test": b,
			className: (0, S.cn)("inline-flex items-center gap-1 rounded-lt-full border border-dashed border-lt-border px-3 text-sm text-lt-muted-fg transition-colors hover:border-lt-primary hover:text-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none", n ? "h-7" : "h-8"),
			onClick: () => g((e) => !e),
			children: [/* @__PURE__ */ f(S.Icon, {
				name: "plus",
				className: "size-lt-icon-sm"
			}), !n && /* @__PURE__ */ f("span", { children: t })]
		}), h && /* @__PURE__ */ f("ul", {
			id: _,
			role: "menu",
			"data-test": `${b}-menu`,
			className: "absolute top-full z-20 mt-1 grid w-64 grid-cols-2 gap-1 rounded-lt border border-lt-border bg-lt-popover p-1 shadow-lt-md",
			children: y.map((e) => /* @__PURE__ */ f("li", {
				role: "none",
				children: /* @__PURE__ */ p("button", {
					type: "button",
					role: "menuitem",
					"data-test": `${b}-${e.type}`,
					className: "flex w-full flex-col items-center gap-1 rounded-lt-sm px-2 py-2 text-xs text-lt-popover-fg hover:bg-lt-accent hover:text-lt-accent-fg",
					onClick: () => x(e.type),
					children: [e.icon && /* @__PURE__ */ f(S.Icon, {
						name: e.icon,
						className: "size-lt-icon-md"
					}), /* @__PURE__ */ f("span", { children: e.label })]
				})
			}, e.type))
		})]
	});
}
var Ht = v((() => {
	C(), R(), K(), X();
})), Ut, Wt = v((() => {
	C(), $(), I(), vt(), X(), Ht(), Ut = ({ node: e }) => {
		let { blockId: t, name: n, label: r } = e.props, { t: i } = (0, S.useT)("blocks"), { store: o } = q(), u = J((e) => e.document), d = s(() => N(u, t)?.node.slots[n] ?? [], [
			t,
			u,
			n
		]), m = s(() => d.map((e) => e.id), [d]), h = c(null), [g, _] = l(null);
		return a(() => {
			let e = h.current;
			if (e) return (0, S.dropTargetForElements)({
				canDrop: ({ source: e }) => Q(e.data) !== null,
				element: e,
				getData: () => ut(t, n),
				onDragEnter: ({ source: e, self: t }) => {
					let n = o.getState(), r = Q(e.data), i = dt(n.document, [t], r);
					_(r && i && ft(n.document, n.types, r, i) ? "allowed" : "blocked");
				},
				onDragLeave: () => _(null),
				onDrop: () => _(null)
			});
		}, [
			t,
			n,
			o
		]), /* @__PURE__ */ p("div", {
			ref: h,
			"data-test": `slot-${t}-${n}`,
			"data-drop-state": g ?? void 0,
			className: (0, S.cn)("relative flex min-h-16 min-w-0 flex-col gap-3 rounded-lt border border-dashed p-1.5 transition-colors", g === null && (m.length === 0 ? "border-lt-border" : "border-transparent"), g === "allowed" && "border-lt-primary bg-lt-primary/5", g === "blocked" && "border-lt-danger bg-lt-danger/5"),
			children: [
				/* @__PURE__ */ f("span", {
					className: "pointer-events-none absolute -top-2 left-2 rounded-lt-xs bg-lt-surface px-1 text-[10px] font-medium uppercase tracking-wide text-lt-muted-fg",
					children: r
				}),
				/* @__PURE__ */ f(ht, { ids: m }),
				/* @__PURE__ */ f(Vt, {
					compact: !0,
					target: {
						index: m.length,
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
//#region resources/js/components/editor/editor-registry.ts
function Gt() {
	let e = (0, S.useComponentRegistry)();
	return s(() => ({
		components: {
			...e,
			"blocks.frame": (0, S.eagerComponent)(zt),
			"blocks.slot": (0, S.eagerComponent)(Ut)
		},
		extensions: {}
	}), [e]);
}
var Kt = v((() => {
	C(), Bt(), Wt();
}));
//#endregion
//#region resources/js/components/editor/canvas.tsx
function qt() {
	let { t: e } = (0, S.useT)("blocks"), { store: t, types: n, requestRender: r, focusBlock: i } = q(), o = J((e) => e.document.blocks), u = s(() => o.map((e) => e.id), [o]), d = Gt(), m = c(null), h = c(null), [g, _] = l(!1);
	return a(() => {
		let a = m.current, o = h.current;
		if (!(!a || !o)) return (0, S.combine)((0, S.autoScrollForElements)({ element: a }), (0, S.dropTargetForElements)({
			canDrop: ({ source: e }) => Q(e.data) !== null,
			element: o,
			getData: () => ut(null, null),
			onDragEnter: () => _(!0),
			onDragLeave: () => _(!1),
			onDrop: () => _(!1)
		}), (0, S.monitorForElements)({
			canMonitor: ({ source: e }) => Q(e.data) !== null,
			onDrop: ({ source: a, location: o }) => {
				let s = Q(a.data), c = t.getState(), l = dt(c.document, o.current.dropTargets, s);
				if (!s || !l) return;
				let u = n.find((e) => e.type === s.blockType)?.label ?? s.blockType;
				if (!ft(c.document, c.types, s, l)) {
					(0, S.announce)(e("blocks.editor.drop-not-allowed", "{{label}} is not allowed here", { label: u }));
					return;
				}
				if (s.kind === "block") {
					t.setState((e) => H(e, s.id, l)), (0, S.announce)(e("blocks.editor.block-moved", "{{label}} moved", { label: u })), queueMicrotask(() => i(s.id));
					return;
				}
				let d = null;
				t.setState((e) => {
					let t = V(e, s.blockType, l);
					return d = t.id, t.state;
				}), d && (r(d), (0, S.announce)(e("blocks.editor.block-added", "{{label}} added", { label: u })));
			}
		}));
	}, [
		i,
		r,
		t,
		e,
		n
	]), /* @__PURE__ */ p("div", {
		ref: m,
		className: "lt-blocks-canvas relative min-w-0 flex-1 overflow-y-auto bg-lt-bg",
		"data-test": "blocks-canvas",
		children: [/* @__PURE__ */ f("div", {
			className: "mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 py-8",
			children: /* @__PURE__ */ p("div", {
				ref: h,
				"data-test": "blocks-canvas-root",
				"data-drop-active": g || void 0,
				className: (0, S.cn)("flex min-h-[60vh] flex-1 flex-col gap-4 rounded-lt border bg-lt-surface px-10 py-10 shadow-lt-sm transition-colors", g ? "border-lt-primary" : "border-lt-border"),
				onClick: (e) => {
					e.target === e.currentTarget && t.setState((e) => B(e, null));
				},
				children: [
					/* @__PURE__ */ f(S.RegistryProvider, {
						registry: d,
						children: /* @__PURE__ */ f(ht, { ids: u })
					}),
					u.length === 0 && /* @__PURE__ */ f("p", {
						className: "py-10 text-center text-sm text-lt-muted-fg",
						"data-test": "blocks-empty",
						children: e("blocks.editor.empty", "This page has no blocks yet. Pick one from the library.")
					}),
					/* @__PURE__ */ f(Vt, {
						target: {
							index: u.length,
							parentId: null,
							slot: null
						},
						label: e("blocks.editor.add-block", "Add block")
					})
				]
			})
		}), /* @__PURE__ */ f(yt, {})]
	});
}
var Jt = v((() => {
	C(), $(), K(), vt(), bt(), X(), Kt(), Ht();
}));
//#endregion
//#region resources/js/components/editor/editor-topbar.tsx
function Yt({ title: e, previewUrl: t }) {
	let { t: n } = (0, S.useT)("blocks"), { store: r, endpoint: i } = q(), a = J((e) => e.history.past.length > 0), o = J((e) => e.history.future.length > 0), s = J((e) => e.saveState), c = J((e) => e.publishing), l = J((e) => e.publishedAt), u = async () => {
		if (!i) return;
		r.setState((e) => G(e, !0));
		let { document: e, revision: t } = r.getState();
		try {
			let n = await D(i, e, t);
			r.setState((e) => {
				switch (n.status) {
					case "saved": return Re(e, n.revision);
					case "conflict": return G(Le(e, n.revision), !1);
					case "invalid": return G(ze(e, n.errors), !1);
					case "failed": return G(W(e), !1);
				}
			});
		} catch {
			r.setState((e) => G(W(e), !1));
		}
	};
	return /* @__PURE__ */ p("header", {
		className: "flex h-12 shrink-0 items-center gap-2 border-b border-lt-border bg-lt-surface px-3",
		"data-test": "blocks-topbar",
		children: [
			/* @__PURE__ */ f(S.IconButton, {
				icon: "undo-2",
				size: "md",
				label: n("blocks.editor.undo", "Undo"),
				disabled: !a,
				onClick: () => r.setState(Ne),
				"data-test": "blocks-undo"
			}),
			/* @__PURE__ */ f(S.IconButton, {
				icon: "redo-2",
				size: "md",
				label: n("blocks.editor.redo", "Redo"),
				disabled: !o,
				onClick: () => r.setState(U),
				"data-test": "blocks-redo"
			}),
			/* @__PURE__ */ p("div", {
				className: "mx-2 flex min-w-0 flex-1 items-center justify-center gap-2 text-sm",
				children: [e && /* @__PURE__ */ f("span", {
					className: "truncate font-semibold text-lt-fg",
					children: e
				}), /* @__PURE__ */ f(Xt, {
					state: s,
					publishedAt: l
				})]
			}),
			t && /* @__PURE__ */ f(S.Button, {
				emphasis: "outline",
				variant: "secondary",
				size: "sm",
				asChild: !0,
				children: /* @__PURE__ */ p("a", {
					href: t,
					target: "_blank",
					rel: "noreferrer",
					"data-test": "blocks-preview",
					children: [/* @__PURE__ */ f(S.Icon, { name: "external-link" }), n("blocks.editor.preview", "Preview")]
				})
			}),
			/* @__PURE__ */ f(S.Button, {
				size: "sm",
				disabled: c || s === "conflict" || !i,
				onClick: () => void u(),
				"data-test": "blocks-publish",
				children: c ? n("blocks.editor.publishing", "Publishing…") : n("blocks.editor.publish", "Publish")
			})
		]
	});
}
function Xt({ state: e, publishedAt: t }) {
	let { t: n } = (0, S.useT)("blocks"), r = {
		conflict: n("blocks.editor.conflict", "Changed elsewhere"),
		dirty: n("blocks.editor.unsaved", "Unsaved changes"),
		error: n("blocks.editor.save-failed", "Could not save"),
		idle: "",
		saved: t === null ? n("blocks.editor.saved", "Draft saved") : n("blocks.editor.published", "Published"),
		saving: n("blocks.editor.saving", "Saving…")
	};
	return /* @__PURE__ */ p("span", {
		className: (0, S.cn)("text-xs", e === "conflict" || e === "error" ? "text-lt-danger" : "text-lt-muted-fg"),
		"data-test": "blocks-save-state",
		"data-save-state": e,
		role: "status",
		children: [r[e], e === "conflict" && /* @__PURE__ */ f("button", {
			type: "button",
			className: "ml-2 underline",
			onClick: () => window.location.reload(),
			children: n("blocks.editor.reload", "Reload")
		})]
	});
}
var Zt = v((() => {
	C(), j(), K(), X();
}));
//#endregion
//#region resources/js/components/editor/keyboard.ts
function Qt(e) {
	let t = e.target;
	return t !== null && (t.isContentEditable || [
		"INPUT",
		"SELECT",
		"TEXTAREA"
	].includes(t.tagName) || t.closest("[data-blocks-inspector]") !== null);
}
function $t(e, t, n) {
	let r = e.metaKey || e.ctrlKey, i = e.key.toLowerCase();
	if (r && i === "z" && !Qt(e)) {
		e.preventDefault(), t.setState(e.shiftKey ? U : Ne);
		return;
	}
	if (r && i === "y" && !Qt(e)) {
		e.preventDefault(), t.setState(U);
		return;
	}
	if (e.key === "Escape") {
		t.setState((e) => B(e, null));
		return;
	}
	if (Qt(e)) return;
	let a = t.getState(), o = a.selectedId;
	if (o !== null) {
		if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault(), t.setState((e) => Te(e, o));
			return;
		}
		if (r && e.shiftKey && i === "d") {
			e.preventDefault(), t.setState((e) => Ee(e, o));
			return;
		}
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			e.preventDefault();
			let r = e.key === "ArrowUp" ? "up" : "down";
			if (e.altKey) {
				let e = Pt(a.document, a.types, o, r);
				e && (t.setState((t) => H(t, o, e)), queueMicrotask(() => n(o)));
				return;
			}
			let i = ve(a.document), s = i.indexOf(o), c = i[r === "up" ? s - 1 : s + 1];
			c !== void 0 && (t.setState((e) => B(e, c)), n(c));
		}
	}
}
var en = v((() => {
	Ft(), K(), I();
}));
//#endregion
//#region resources/js/components/editor/library-panel.tsx
function tn() {
	let { t: e } = (0, S.useT)("blocks"), { types: t } = q(), [n, r] = l(""), i = s(() => {
		let e = n.trim().toLowerCase(), r = t.filter((t) => e === "" || t.label.toLowerCase().includes(e) || t.type.toLowerCase().includes(e) || t.keywords.some((t) => t.toLowerCase().includes(e))), i = /* @__PURE__ */ new Map();
		for (let e of r) i.set(e.category, [...i.get(e.category) ?? [], e]);
		return [...i.entries()].sort(([e], [t]) => (rn.indexOf(e) + 1 || 99) - (rn.indexOf(t) + 1 || 99));
	}, [n, t]);
	return /* @__PURE__ */ p("aside", {
		className: "flex w-64 shrink-0 flex-col border-r border-lt-border bg-lt-surface",
		"data-test": "blocks-library",
		"aria-label": e("blocks.editor.library", "Blocks"),
		children: [
			/* @__PURE__ */ f("div", {
				className: "border-b border-lt-border px-3 py-2 text-sm font-semibold",
				children: e("blocks.editor.library", "Blocks")
			}),
			/* @__PURE__ */ f("div", {
				className: "px-3 py-2",
				children: /* @__PURE__ */ f(S.Input, {
					type: "search",
					value: n,
					placeholder: e("blocks.editor.search", "Search blocks"),
					"aria-label": e("blocks.editor.search", "Search blocks"),
					"data-test": "blocks-library-search",
					onChange: (e) => r(e.target.value)
				})
			}),
			/* @__PURE__ */ p("div", {
				className: "flex-1 overflow-y-auto px-3 pb-3",
				children: [i.length === 0 && /* @__PURE__ */ f("p", {
					className: "py-4 text-sm text-lt-muted-fg",
					children: e("blocks.editor.no-results", "No blocks match.")
				}), i.map(([t, n]) => /* @__PURE__ */ p("section", {
					className: "mb-3",
					children: [/* @__PURE__ */ f("h3", {
						className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-lt-muted-fg",
						children: e(`blocks.editor.categories.${t}`, t)
					}), /* @__PURE__ */ f("ul", {
						className: "grid grid-cols-3 gap-1.5",
						children: n.map((e) => /* @__PURE__ */ f("li", { children: /* @__PURE__ */ f(nn, { type: e }) }, e.type))
					})]
				}, t))]
			})
		]
	});
}
function nn({ type: e }) {
	let { t } = (0, S.useT)("blocks"), { store: n, requestRender: r, focusBlock: i } = q(), o = J((e) => e.selectedId), s = c(null), [u, d] = l(!1);
	return a(() => {
		let t = s.current;
		if (t) return (0, S.draggable)({
			element: t,
			getInitialData: () => st(e.type),
			onDragStart: () => d(!0),
			onDrop: () => d(!1)
		});
	}, [e.type]), /* @__PURE__ */ p("button", {
		ref: s,
		type: "button",
		title: e.description ?? e.label,
		"data-test": `library-${e.type}`,
		className: `flex h-16 w-full cursor-grab flex-col items-center justify-center gap-1 rounded-lt border border-lt-border bg-lt-surface px-1 text-[11px] text-lt-fg transition-colors hover:border-lt-primary hover:text-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none ${u ? "opacity-50" : ""}`,
		onClick: () => {
			let a = n.getState(), s = o ? N(a.document, o) : null, c = s ? {
				index: s.index + 1,
				parentId: s.parentId,
				slot: s.slot
			} : null, l = c && L({
				blockType: e.type,
				document: a.document,
				parentId: c.parentId,
				slot: c.slot,
				types: a.types
			}) ? c : {
				index: a.document.blocks.length,
				parentId: null,
				slot: null
			}, u = null;
			n.setState((t) => {
				let n = V(t, e.type, l);
				return u = n.id, n.state;
			}), u && (r(u), (0, S.announce)(t("blocks.editor.block-added", "{{label}} added", { label: e.label })), queueMicrotask(() => i(u)));
		},
		children: [e.icon && /* @__PURE__ */ f(S.Icon, {
			name: e.icon,
			className: "size-lt-icon-md"
		}), /* @__PURE__ */ f("span", {
			className: "truncate",
			children: e.label
		})]
	});
}
var rn, an = v((() => {
	C(), $(), R(), K(), I(), X(), rn = [
		"text",
		"media",
		"layout",
		"embed"
	];
}));
//#endregion
//#region resources/js/components/editor/use-render-queue.ts
function on(e, t, n = 300) {
	let i = c(/* @__PURE__ */ new Map()), o = c(/* @__PURE__ */ new Map()), s = r(async (n) => {
		if (!t) return;
		let r = N(e.getState().document, n);
		if (!r) return;
		let i = (o.current.get(n) ?? 0) + 1;
		o.current.set(n, i);
		let a = await T(t, r.node).catch(() => null);
		!a || o.current.get(n) !== i || e.setState((e) => N(e.document, n) ? je(e, n, a.node, a.errors) : e);
	}, [t, e]), l = r((e) => {
		let t = i.current.get(e);
		t && clearTimeout(t), i.current.set(e, setTimeout(() => {
			i.current.delete(e), s(e);
		}, n));
	}, [n, s]);
	return a(() => {
		let t = /* @__PURE__ */ new Set(), n = e.subscribe(() => {
			for (let n of e.getState().staleIds) t.has(n) || (t.add(n), l(n));
			Array.from(t).filter((t) => !e.getState().staleIds.includes(t)).forEach((e) => t.delete(e));
		});
		return () => {
			n(), i.current.forEach((e) => clearTimeout(e)), i.current.clear();
		};
	}, [l, e]), l;
}
var sn = v((() => {
	j(), K(), I();
})), cn = /* @__PURE__ */ y({ default: () => ln });
function ln({ node: e }) {
	let { document: t, rendered: n, types: r, revision: i, endpoint: a, ref: o, previewUrl: c, title: u } = e.props, [d] = l(() => we({
		document: t,
		rendered: n,
		revision: i,
		types: r
	})), m = s(() => a && o ? {
		ref: o,
		url: a
	} : null, [o, a]), { registerBlock: h, focusBlock: g } = Ge(), _ = on(d, m);
	Be(d, m);
	let v = s(() => ({
		endpoint: m,
		focusBlock: g,
		registerBlock: h,
		requestRender: _,
		store: d,
		types: r
	}), [
		m,
		g,
		h,
		_,
		d,
		r
	]);
	return /* @__PURE__ */ f(Ue, {
		value: v,
		children: /* @__PURE__ */ p("div", {
			className: "fixed inset-0 z-30 flex flex-col bg-lt-bg text-lt-fg",
			"data-test": "blocks-editor",
			onKeyDown: (e) => $t(e, d, g),
			children: [/* @__PURE__ */ f(Yt, {
				title: u,
				previewUrl: c
			}), /* @__PURE__ */ p("div", {
				className: "flex min-h-0 flex-1",
				children: [
					/* @__PURE__ */ f(tn, {}),
					/* @__PURE__ */ f(qt, {}),
					/* @__PURE__ */ f(it, {})
				]
			})]
		})
	});
}
var un = v((() => {
	He(), K(), at(), Jt(), X(), Zt(), en(), an(), sn();
}));
//#endregion
//#region resources/js/components/editor/block-editor-adapter.tsx
C();
var dn = n(() => Promise.resolve().then(() => (un(), cn))), fn = ({ node: t }) => /* @__PURE__ */ f(e, {
	fallback: /* @__PURE__ */ f("div", {
		className: "flex h-64 items-center justify-center",
		"data-test": "blocks-editor-loading",
		children: /* @__PURE__ */ f(S.Spinner, {})
	}),
	children: /* @__PURE__ */ f(dn, { node: t })
});
//#endregion
//#region resources/js/components/view/block-frame-adapter.tsx
Nt();
var pn = ({ node: e, children: t }) => /* @__PURE__ */ f(Mt, {
	style: e.props.style,
	className: e.props.class ?? void 0,
	children: t
}), mn = ({ children: e }) => /* @__PURE__ */ f("div", {
	className: "lt-blocks flex w-full flex-col",
	"data-test": "blocks-view",
	children: e
}), hn = ({ children: e }) => /* @__PURE__ */ f("div", {
	className: "flex min-w-0 flex-col gap-4",
	children: e
});
//#endregion
//#region resources/js/components/view/unknown-block.tsx
C();
function gn({ blockType: e }) {
	let { t } = (0, S.useT)("blocks");
	return /* @__PURE__ */ f("div", {
		className: "rounded-lt border border-dashed border-lt-border bg-lt-muted px-4 py-3 text-sm text-lt-muted-fg",
		"data-test": "blocks-unknown",
		role: "note",
		children: t("blocks.editor.unknown-block", "Unknown block: {{type}}", { type: e })
	});
}
//#endregion
//#region resources/js/components/view/unknown-block-adapter.tsx
var _n = ({ node: e }) => /* @__PURE__ */ f(gn, { blockType: e.props.blockType });
//#endregion
//#region resources/js/plugin.ts
C();
var vn = {
	name: "lattice/blocks",
	components: {
		"blocks.editor": (0, S.eagerComponent)(fn),
		"blocks.frame": (0, S.eagerComponent)(pn),
		"blocks.slot": (0, S.eagerComponent)(hn),
		"blocks.unknown": (0, S.eagerComponent)(_n),
		"blocks.view": (0, S.eagerComponent)(mn)
	},
	i18n: { namespace: "blocks" }
};
//#endregion
export { vn as default };
