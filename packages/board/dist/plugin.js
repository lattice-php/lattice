import { forwardRef as e, useCallback as t, useEffect as n, useId as r, useMemo as i, useRef as a, useState as o, useSyncExternalStore as s } from "react";
import { jsx as c, jsxs as l } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var u = Object.defineProperty, d = Object.getOwnPropertyDescriptor, f = Object.getOwnPropertyNames, p = Object.prototype.hasOwnProperty, m = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, h = (e, t) => {
	let n = {};
	for (var r in e) u(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || u(n, Symbol.toStringTag, { value: "Module" }), n;
}, g = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = f(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !p.call(e, s) && s !== n && u(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = d(t, s)) || r.enumerable
	});
	return e;
}, _ = (e, t, n) => (g(e, t, "default"), n && g(n, t, "default")), v = /* @__PURE__ */ h({});
import * as y from "@lattice-php/lattice/runtime";
_(v, y);
var b = m((() => {}));
//#endregion
//#region resources/js/board-endpoint.ts
function x() {
	return {
		q: "",
		tf: {}
	};
}
function S(e) {
	let t = {};
	return e.q !== "" && (t.q = e.q), Object.keys(e.tf).length > 0 && (t.tf = e.tf), t;
}
function C(e, t, n = {}) {
	let r = new URL(e, window.location.origin);
	for (let [e, t] of Object.entries(n)) r.searchParams.set(e, t);
	return t.q !== "" && r.searchParams.set("q", t.q), (0, v.appendTableFilters)(r, t.tf), `${r.pathname}${r.search}`;
}
var w = m((() => {
	b();
}));
//#endregion
//#region resources/js/board-store.ts
function T(e) {
	return typeof e.cardUrl == "string" ? e.cardUrl : null;
}
function E(e) {
	return Array.isArray(e.actions) ? e.actions : [];
}
function D(e) {
	let t = e.id;
	return typeof t == "string" || typeof t == "number" ? String(t) : "";
}
function O() {
	return {
		hasMore: !1,
		loading: !1,
		offset: 0,
		total: 0
	};
}
function k(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let r of e) t.set(r.key, O()), n.set(r.key, []);
	return {
		cards: /* @__PURE__ */ new Map(),
		generation: 0,
		meta: t,
		moving: !1,
		order: n
	};
}
function A(e, t) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
	for (let e of t.columns) {
		let t = [];
		for (let r of e.cards) {
			let e = D(r);
			e !== "" && (n.set(e, r), t.push(e));
		}
		r.set(e.key, t), i.set(e.key, {
			hasMore: e.hasMore,
			loading: !1,
			offset: t.length,
			total: e.total
		});
	}
	return {
		cards: n,
		generation: e.generation + 1,
		meta: i,
		moving: !1,
		order: r
	};
}
function j(e, t) {
	let n = new Map(e.cards), r = e.order.get(t.key) ?? [], i = new Set(r), a = [];
	for (let e of t.cards) {
		let t = D(e);
		t !== "" && (n.set(t, e), i.has(t) || (i.add(t), a.push(t)));
	}
	let o = [...r, ...a], s = new Map(e.order);
	s.set(t.key, o);
	let c = new Map(e.meta);
	return c.set(t.key, {
		hasMore: t.hasMore,
		loading: !1,
		offset: o.length,
		total: t.total
	}), {
		...e,
		cards: n,
		meta: c,
		order: s
	};
}
function M(e, t) {
	let n = new Map(e.cards), r = [];
	for (let e of t.cards) {
		let t = D(e);
		t !== "" && (n.set(t, e), r.push(t));
	}
	let i = new Map(e.order);
	i.set(t.key, r);
	let a = new Map(e.meta);
	return a.set(t.key, {
		hasMore: t.hasMore,
		loading: !1,
		offset: r.length,
		total: t.total
	}), {
		...e,
		cards: n,
		meta: a,
		order: i
	};
}
function N(e, t, n) {
	let r = e.meta.get(t);
	if (!r || r.loading === n) return e;
	let i = new Map(e.meta);
	return i.set(t, {
		...r,
		loading: n
	}), {
		...e,
		meta: i
	};
}
function P(e, t) {
	return (e.order.get(t) ?? []).map((t) => e.cards.get(t)).filter((e) => e !== void 0);
}
function F(e, t) {
	for (let [n, r] of e.order) {
		let e = r.indexOf(t);
		if (e !== -1) return {
			columnKey: n,
			index: e
		};
	}
	return null;
}
function I(e, t) {
	let n = F(e, t);
	if (n === null) return e;
	let { columnKey: r } = n, i = e.order.get(r) ?? [], a = new Map(e.order);
	a.set(r, i.filter((e) => e !== t));
	let o = new Map(e.cards);
	o.delete(t);
	let s = new Map(e.meta), c = s.get(r);
	return c && s.set(r, {
		...c,
		offset: Math.max(0, c.offset - 1),
		total: Math.max(0, c.total - 1)
	}), {
		...e,
		cards: o,
		meta: s,
		order: a
	};
}
function ee(e, t) {
	if (!e.order.has(t.columnKey) || e.cards.has(t.cardId)) return e;
	let n = new Map(e.cards);
	n.set(t.cardId, t.card);
	let r = [...e.order.get(t.columnKey) ?? []], i = Math.max(0, Math.min(t.index, r.length));
	r.splice(i, 0, t.cardId);
	let a = new Map(e.order);
	a.set(t.columnKey, r);
	let o = new Map(e.meta), s = o.get(t.columnKey);
	return s && o.set(t.columnKey, {
		...s,
		offset: s.offset + 1,
		total: s.total + 1
	}), {
		...e,
		cards: n,
		meta: o,
		order: a
	};
}
function L(e, t) {
	if (!e.cards.has(t.cardId) || !e.order.has(t.columnKey)) return null;
	let n = F(e, t.cardId);
	if (n === null) return null;
	let r = n.columnKey, i = r === t.columnKey, a = e.order.get(r) ?? [], o = n.index, s = a.filter((e) => e !== t.cardId), c = i ? s : [...e.order.get(t.columnKey) ?? []], l = Math.max(0, Math.min(t.position, c.length));
	if (i && o === l) return null;
	c.splice(l, 0, t.cardId);
	let u = new Map(e.order);
	u.set(r, s), u.set(t.columnKey, c);
	let d = new Map(e.meta);
	if (!i) {
		let e = d.get(r), n = d.get(t.columnKey);
		e && d.set(r, {
			...e,
			offset: Math.max(0, e.offset - 1),
			total: Math.max(0, e.total - 1)
		}), n && d.set(t.columnKey, {
			...n,
			offset: n.offset + 1,
			total: n.total + 1
		});
	}
	return {
		...e,
		meta: d,
		order: u
	};
}
var R = m((() => {}));
//#endregion
//#region resources/js/use-board-state.ts
function te(e) {
	let t = e, n = /* @__PURE__ */ new Set();
	return {
		getState: () => t,
		setState: (e) => {
			t = e(t), n.forEach((e) => e());
		},
		subscribe: (e) => (n.add(e), () => {
			n.delete(e);
		})
	};
}
function z({ columns: e, componentRef: r, endpoint: c, identity: l, moveAction: u, perColumn: d, query: f, queryKey: p, result: m, syncQuery: h }) {
	let [g] = o(() => {
		let t = k(e);
		return te(m ? A(t, m) : t);
	}), _ = s(g.subscribe, g.getState), y = a(/* @__PURE__ */ new Set()), b = a({
		columns: e,
		result: m
	}), w = (0, v.useEffectDispatcher)(), [T, E] = o(f), D = a(T);
	D.current = T;
	let [O, R] = o(m?.indicators ?? []);
	n(() => {
		(b.current.columns !== e || b.current.result !== m) && (b.current = {
			columns: e,
			result: m
		}, y.current.clear(), E(f), R(m?.indicators ?? []), g.setState((t) => {
			let n = k(e);
			return m ? A({
				...n,
				generation: t.generation
			}, m) : {
				...n,
				generation: t.generation + 1
			};
		}));
	}, [
		e,
		f,
		m,
		g
	]), n(() => {
		if (!(!h || l === void 0)) return (0, v.claimUrlSyncScope)({
			key: p,
			ownedKeys: v.BOARD_OWNED_QUERY_KEYS
		}, l);
	}, [
		l,
		p,
		h
	]), n(() => {
		h && (0, v.writeQueryToUrl)(S(T), {
			key: p,
			ownedKeys: v.BOARD_OWNED_QUERY_KEYS
		});
	}, [
		T,
		p,
		h
	]);
	let z = c !== null && c !== "", B = t((e, t) => {
		if (!c) return Promise.resolve(null);
		let n = C(c, D.current, {
			column: e,
			limit: String(d),
			offset: String(t)
		});
		return (0, v.apiJson)(n, { ref: r ?? "" }).then((t) => t.columns.find((t) => t.key === e) ?? null);
	}, [
		r,
		c,
		d
	]), V = t((e, t) => {
		let n = g.getState().generation;
		B(e, t).then((t) => {
			g.getState().generation === n && g.setState((n) => t ? j(n, t) : N(n, e, !1));
		}).catch(() => {
			g.setState((t) => N(t, e, !1));
		}).finally(() => {
			y.current.delete(e);
		});
	}, [B, g]), H = t((e) => {
		if (!z || y.current.has(e)) return;
		let t = g.getState().meta.get(e);
		!t || !t.hasMore || t.loading || (y.current.add(e), g.setState((t) => N(t, e, !0)), V(e, t.offset));
	}, [
		z,
		V,
		g
	]), U = t((e) => {
		if (!z || !c) return;
		y.current.clear();
		let t = 0;
		g.setState((e) => (t = e.generation + 1, {
			...e,
			generation: t
		})), (0, v.apiJson)(C(c, e), { ref: r ?? "" }).then((e) => {
			g.getState().generation === t && (g.setState((t) => A(t, e)), R(e.indicators ?? []));
		}).catch(() => {});
	}, [
		z,
		r,
		c,
		g
	]), W = t(() => {
		U(D.current);
	}, [U]), G = t((e) => {
		let t = {
			...D.current,
			q: e
		};
		D.current = t, E(t), U(t);
	}, [U]), K = t((e, t) => {
		let n = { ...D.current.tf };
		(0, v.isActiveFilterValue)(t) ? n[e] = t : delete n[e];
		let r = {
			...D.current,
			tf: n
		};
		D.current = r, E(r), U(r);
	}, [U]), q = t(() => {
		let e = x();
		D.current = e, E(e), U(e);
	}, [U]), J = t((e, t, n) => (0, v.fetchFilterOptions)(c, r ?? "", e, t, n), [r, c]), Y = t((e) => {
		if (!z || !c) return;
		let t = g.getState().generation;
		B(e, 0).then((e) => {
			g.getState().generation !== t || !e || g.setState((t) => M(t, e));
		}).catch(() => {});
	}, [
		z,
		c,
		B,
		g
	]), ne = t(async (e) => {
		if (!u || g.getState().moving) return !1;
		let t = g.getState(), n = F(t, e.cardId), r = L(t, e);
		if (!r) return !1;
		let i = t.generation;
		g.setState(() => ({
			...r,
			moving: !0
		}));
		let { ok: a } = await (0, v.callAction)(u, { ...e }, w);
		return !a && n !== null && g.getState().generation === i ? g.setState((t) => ({
			...L(t, {
				cardId: e.cardId,
				columnKey: n.columnKey,
				position: n.index
			}) ?? t,
			moving: !1
		})) : g.setState((e) => ({
			...e,
			moving: !1
		})), a;
	}, [
		w,
		u,
		g
	]), re = t((e) => {
		let t = g.getState(), n = F(t, e), r = t.cards.get(e);
		if (!n || !r) return null;
		let i = {
			card: r,
			cardId: e,
			columnKey: n.columnKey,
			generation: t.generation,
			index: n.index
		};
		return g.setState((t) => I(t, e)), i;
	}, [g]), X = t((e) => {
		!e || g.getState().generation !== e.generation || g.setState((t) => ee(t, e));
	}, [g]);
	(0, v.useWindowEvent)(v.LATTICE_EVENT.reloadComponent, (e) => {
		let t = e.detail;
		l !== void 0 && t?.component === l && W();
	});
	let Z = i(() => e.map((e) => e.key), [e]), ie = i(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of Z) {
			let n = _.meta.get(t);
			e.set(t, {
				cards: P(_, t),
				hasMore: n?.hasMore ?? !1,
				loading: n?.loading ?? !1,
				total: n?.total ?? 0
			});
		}
		return e;
	}, [Z, _]);
	return {
		canMove: !!u,
		columnKeys: Z,
		columnsView: ie,
		indicators: O,
		loadMore: H,
		move: ne,
		moving: _.moving,
		removeCard: re,
		resetColumn: Y,
		resetFilters: q,
		restoreCard: X,
		search: T.q,
		searchFilterOptions: J,
		setSearch: G,
		setTableFilter: K,
		tableFilters: T.tf
	};
}
var B = m((() => {
	b(), w(), R();
}));
//#endregion
//#region resources/js/board-dnd.ts
function V(e) {
	return {
		cardId: e.id,
		columnKey: e.columnKey,
		type: q
	};
}
function H(e) {
	return e.type !== "lattice-board-card" || typeof e.cardId != "string" || typeof e.columnKey != "string" ? null : {
		columnKey: e.columnKey,
		id: e.cardId
	};
}
function U(e, t) {
	return (0, v.attachClosestEdge)({
		cardId: e.cardId,
		columnKey: e.columnKey,
		type: q
	}, {
		...t,
		allowedEdges: ["top", "bottom"]
	});
}
function W(e) {
	return {
		columnKey: e,
		type: J
	};
}
function G(e) {
	for (let t of e) {
		let e = t.data;
		if (e.type === "lattice-board-card" && typeof e.cardId == "string" && typeof e.columnKey == "string") return {
			cardId: e.cardId,
			columnKey: e.columnKey,
			edge: (0, v.extractClosestEdge)(e),
			type: "card"
		};
		if (e.type === "lattice-board-column" && typeof e.columnKey == "string") return {
			columnKey: e.columnKey,
			type: "column"
		};
	}
	return null;
}
function K(e, t, n) {
	if (t.type === "column") {
		let r = n.get(t.columnKey);
		if (!r) return null;
		let i = t.columnKey === e.columnKey ? r.length - 1 : r.length;
		return {
			cardId: e.id,
			columnKey: t.columnKey,
			position: Math.max(0, i)
		};
	}
	if (t.cardId === e.id) return null;
	let r = t.edge ?? "bottom";
	if (t.columnKey === e.columnKey) {
		let i = n.get(e.columnKey);
		if (!i) return null;
		let a = i.indexOf(e.id), o = i.indexOf(t.cardId);
		if (a === -1 || o === -1) return null;
		let s = (0, v.getReorderDestinationIndex)({
			axis: "vertical",
			closestEdgeOfTarget: r,
			indexOfTarget: o,
			startIndex: a
		});
		return {
			cardId: e.id,
			columnKey: t.columnKey,
			position: s
		};
	}
	let i = n.get(t.columnKey);
	if (!i) return null;
	let a = i.indexOf(t.cardId);
	if (a === -1) return null;
	let o = r === "bottom" ? a + 1 : a;
	return {
		cardId: e.id,
		columnKey: t.columnKey,
		position: o
	};
}
var q, J, Y = m((() => {
	b(), q = "lattice-board-card", J = "lattice-board-column";
}));
//#endregion
//#region resources/js/board-keyboard.ts
function ne(e, t, n, r, i) {
	let a = t.get(n) ?? [], o = a.indexOf(r);
	if (i === "next" || i === "prev") {
		if (o === -1) return null;
		let e = a[i === "next" ? o + 1 : o - 1];
		return e ? {
			cardId: e,
			columnKey: n
		} : null;
	}
	let s = e.indexOf(n);
	if (s === -1) return null;
	let c = i === "right" ? 1 : -1;
	for (let n = s + c; n >= 0 && n < e.length; n += c) {
		let r = e[n], i = t.get(r) ?? [];
		if (i.length !== 0) return {
			cardId: i[o === -1 ? 0 : Math.min(o, i.length - 1)],
			columnKey: r
		};
	}
	return null;
}
function re() {
	let e = a(/* @__PURE__ */ new Map()), n = t((t, n) => {
		n ? e.current.set(t, n) : e.current.delete(t);
	}, []);
	return {
		focusCard: t((t) => {
			e.current.get(t)?.focus();
		}, []),
		registerCard: n
	};
}
var X, Z = m((() => {
	X = {
		ArrowDown: "next",
		ArrowLeft: "left",
		ArrowRight: "right",
		ArrowUp: "prev"
	};
}));
//#endregion
//#region resources/js/components/board/board-card-actions.tsx
function ie({ actions: e, cardId: n, columnKey: r, "data-test": i, removeCard: o, restoreCard: s }) {
	let { t: l } = (0, v.useT)("board"), u = l("board.card-actions", "Card actions"), d = a(null), f = t((e) => {
		let t = () => ({
			cardId: n,
			columnKey: r
		});
		return e.props?.removesRecord === !0 ? {
			extraData: t,
			onBefore: () => {
				d.current = o(n);
			},
			onError: () => {
				s(d.current), d.current = null;
			}
		} : { extraData: t };
	}, [
		n,
		r,
		o,
		s
	]);
	return /* @__PURE__ */ c(v.ActionsDropdown, {
		className: "lt-board-card-actions",
		"data-test": i,
		label: u,
		sideOffset: 4,
		children: /* @__PURE__ */ c(v.ActionNodeOptionsProvider, {
			resolve: f,
			children: /* @__PURE__ */ c(v.Renderer, { nodes: e })
		})
	});
}
var ae = m((() => {
	b();
}));
//#endregion
//#region resources/js/components/board/board-card.tsx
function Q(e) {
	return e instanceof Element && e.closest(se) !== null;
}
function oe(e) {
	switch (e) {
		case "top": return "border-t-lt-primary";
		case "bottom": return "border-b-lt-primary";
		default: return null;
	}
}
var se, ce, le = m((() => {
	b(), Y(), Z(), R(), ae(), se = "a, button, input, textarea, select, label, [contenteditable], [role=menuitem], [role=checkbox]", ce = e(function({ canMove: e, card: r, cardAction: i, cardId: s, columnKey: u, "data-test": d, moving: f, onFocus: p, onMoveFocus: m, removeCard: h, restoreCard: g, schema: _, tabIndex: y }, b) {
		let x = a(null), [S, C] = o(!1), [w, D] = o(null), { visit: O } = (0, v.useNavigation)(), k = (0, v.useCallAction)(), A = T(r), j = E(r), M = t((e) => {
			x.current = e, typeof b == "function" ? b(e) : b && (b.current = e);
		}, [b]), N = t((e = {}) => {
			if (A) {
				e.newTab ? window.open(A, "_blank") : O(A);
				return;
			}
			i && k(i, {
				cardId: s,
				columnKey: u
			});
		}, [
			i,
			s,
			u,
			k,
			A,
			O
		]), P = t((e) => {
			Q(e.target) || N({ newTab: e.metaKey || e.ctrlKey });
		}, [N]), F = t((e) => {
			!A || e.button !== 1 || Q(e.target) || window.open(A, "_blank");
		}, [A]), I = t((e) => {
			let t = X[e.key];
			if (t) {
				e.preventDefault(), m(t);
				return;
			}
			(e.key === "Enter" || e.key === " ") && e.target === x.current && (A || i) && (e.preventDefault(), N());
		}, [
			N,
			i,
			m,
			A
		]);
		return n(() => {
			let t = x.current;
			if (!(!t || !e)) return (0, v.combine)((0, v.cancelDragStartFromInteractive)(t, Q), (0, v.draggable)({
				canDrag: () => !f,
				element: t,
				getInitialData: () => V({
					columnKey: u,
					id: s
				}),
				onDragStart: () => C(!0),
				onDrop: () => C(!1),
				onGenerateDragPreview: ({ nativeSetDragImage: e }) => {
					(0, v.setCustomNativeDragPreview)({
						getOffset: (0, v.pointerOutsideOfPreview)({
							x: "16px",
							y: "8px"
						}),
						nativeSetDragImage: e,
						render: ({ container: e }) => {
							let n = t.cloneNode(!0);
							return n.style.width = `${t.offsetWidth}px`, n.style.opacity = "0.9", e.appendChild(n), () => n.remove();
						}
					});
				}
			}), (0, v.dropTargetForElements)({
				canDrop: ({ source: e }) => {
					let t = H(e.data);
					return t !== null && t.id !== s;
				},
				element: t,
				getData: ({ element: e, input: t }) => U({
					cardId: s,
					columnKey: u
				}, {
					element: e,
					input: t
				}),
				onDrag: ({ self: e }) => D((0, v.extractClosestEdge)(e.data)),
				onDragEnter: ({ self: e }) => D((0, v.extractClosestEdge)(e.data)),
				onDragLeave: () => D(null),
				onDrop: () => D(null)
			}));
		}, [
			e,
			s,
			u,
			f
		]), /* @__PURE__ */ l("li", {
			className: (0, v.cn)("lt-board-card relative rounded-lt border border-lt-border bg-lt-surface p-3 text-sm text-lt-surface-fg shadow-lt-sm", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary", e && "cursor-grab", (A || i) && "cursor-pointer", S && "opacity-50", oe(w)),
			"data-drop-instruction": w ?? void 0,
			"data-test": d,
			onAuxClick: F,
			onClick: P,
			onFocus: p,
			onKeyDown: I,
			ref: M,
			role: "listitem",
			tabIndex: y,
			children: [j.length > 0 ? /* @__PURE__ */ c(ie, {
				actions: j,
				cardId: s,
				columnKey: u,
				"data-test": d ? `${d}-actions` : void 0,
				removeCard: h,
				restoreCard: g
			}) : null, /* @__PURE__ */ c(v.Renderer, { nodes: (0, v.materializeSchema)(_, r) })]
		});
	});
}));
//#endregion
//#region resources/js/components/board/quick-add.tsx
function ue({ columnKey: e, createAction: n, onCreated: r }) {
	let { t: i } = (0, v.useT)("board"), s = (0, v.useCallAction)(), [u, d] = o(!1), [f, p] = o(""), [m, h] = o(!1), g = a(null), _ = t(() => {
		d(!1), p("");
	}, []), y = t(async () => {
		if (m) return;
		let t = f.trim();
		if (t === "") return;
		h(!0);
		let i = await s(n, {
			column: e,
			title: t
		});
		h(!1), i.ok && (p(""), r(), requestAnimationFrame(() => g.current?.focus()));
	}, [
		e,
		n,
		r,
		s,
		m,
		f
	]), b = t((e) => {
		e.key === "Enter" ? (e.preventDefault(), y()) : e.key === "Escape" && _();
	}, [_, y]), x = t(() => {
		m || _();
	}, [_, m]);
	return u ? /* @__PURE__ */ c("input", {
		autoFocus: !0,
		className: "mt-2 w-full rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1.5 text-sm text-lt-fg outline-none focus-visible:ring-2 focus-visible:ring-lt-primary",
		"data-test": `board-quick-add-${e}-input`,
		disabled: m,
		onBlur: x,
		onChange: (e) => p(e.target.value),
		onKeyDown: b,
		placeholder: i("board.add-card-placeholder", "Enter a title..."),
		ref: g,
		value: f
	}) : /* @__PURE__ */ l("button", {
		className: "mt-2 flex items-center gap-1.5 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg",
		"data-test": `board-quick-add-${e}`,
		onClick: () => d(!0),
		type: "button",
		children: [/* @__PURE__ */ c(v.Icon, {
			"aria-hidden": "true",
			className: "size-lt-icon-sm",
			name: "plus"
		}), i("board.add-card", "Add card")]
	});
}
var de = m((() => {
	b();
}));
//#endregion
//#region resources/js/components/board/board-column.tsx
function fe({ canMove: e, cardAction: t, cardSchema: i, column: s, createAction: u, focusedCardId: d, moving: f, onFocusCard: p, onLoadMore: m, onMoveFocus: h, onResetColumn: g, registerCardRef: _, removeCard: y, restoreCard: b, view: x }) {
	let { t: S } = (0, v.useT)("board"), C = r(), w = (0, v.toneProps)((0, v.coerceColor)(s.color ?? void 0) ?? (0, v.namedColor)("gray")), T = a(null), [E, O] = o(!1);
	return n(() => {
		let t = T.current;
		if (!(!t || !e)) return (0, v.combine)((0, v.dropTargetForElements)({
			canDrop: ({ source: e }) => H(e.data) !== null,
			element: t,
			getData: () => W(s.key),
			onDragEnter: () => O(!0),
			onDragLeave: () => O(!1),
			onDrop: () => O(!1)
		}), (0, v.autoScrollForElements)({ element: t }));
	}, [e, s.key]), /* @__PURE__ */ l("section", {
		className: "lt-board-column",
		"data-test": `board-column-${s.key}`,
		children: [
			/* @__PURE__ */ l("header", {
				className: "flex items-center gap-2 pb-2",
				children: [
					s.icon ? /* @__PURE__ */ c(v.IconRenderer, {
						className: (0, v.cn)("size-lt-icon-md shrink-0", w.className),
						icon: s.icon
					}) : null,
					/* @__PURE__ */ c("h3", {
						className: "min-w-0 flex-1 truncate text-sm font-semibold text-lt-fg",
						id: C,
						children: s.label
					}),
					/* @__PURE__ */ c(v.Badge, {
						"aria-label": S("board.card-count", "Cards: {{count}}", { count: x.total }),
						className: w.className,
						style: w.style,
						children: x.total
					})
				]
			}),
			/* @__PURE__ */ l("ul", {
				"aria-labelledby": C,
				className: (0, v.cn)("lt-board-column-list", E && "lt-board-column-list-drop-target"),
				ref: T,
				role: "list",
				children: [
					x.cards.map((n) => {
						let r = D(n);
						return /* @__PURE__ */ c(ce, {
							canMove: e,
							card: n,
							cardAction: t,
							cardId: r,
							columnKey: s.key,
							"data-test": `board-card-${r}`,
							moving: f,
							onFocus: () => p(r),
							onMoveFocus: (e) => h(r, e),
							ref: (e) => _(r, e),
							removeCard: y,
							restoreCard: b,
							schema: i,
							tabIndex: d === r ? 0 : -1
						}, r);
					}),
					x.cards.length === 0 && !x.loading ? /* @__PURE__ */ c("li", {
						className: "px-1 py-2 text-sm text-lt-muted-fg",
						children: S("board.empty-column", "No cards")
					}) : null,
					u ? /* @__PURE__ */ c("li", { children: /* @__PURE__ */ c(ue, {
						columnKey: s.key,
						createAction: u,
						onCreated: g
					}) }) : null
				]
			}),
			x.hasMore ? /* @__PURE__ */ c("button", {
				className: "mt-2 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg",
				disabled: x.loading,
				onClick: m,
				type: "button",
				children: S("board.load-more", "Load more")
			}) : null
		]
	});
}
var pe = m((() => {
	b(), Y(), R(), le(), de();
}));
//#endregion
//#region resources/js/components/board/board-toolbar.tsx
function me({ filters: e, indicators: t, onReset: n, onSearch: r, onSearchFilterOptions: i, onTableFilter: a, search: o, searchable: s, tableFilters: u }) {
	return !s && e.length === 0 ? null : /* @__PURE__ */ l("div", {
		className: "lt-board-toolbar",
		"data-test": "board-toolbar",
		children: [/* @__PURE__ */ l("div", {
			className: "flex items-center gap-2",
			children: [s && /* @__PURE__ */ c(v.TableSearch, {
				value: o,
				onSearch: r
			}), /* @__PURE__ */ c("div", {
				className: "ms-auto flex items-center gap-1",
				children: e.length > 0 && /* @__PURE__ */ c(v.FilterMenu, {
					filters: e,
					values: u,
					processing: !1,
					onChange: a,
					onSearch: i
				})
			})]
		}), /* @__PURE__ */ c(v.FilterBar, {
			clauses: [],
			columnsByKey: /* @__PURE__ */ new Map(),
			indicators: t,
			processing: !1,
			onRemoveClause: () => {},
			onChange: a,
			onReset: n
		})]
	});
}
var he = m((() => {
	b();
}));
//#endregion
//#region resources/js/components/board/board.tsx
function ge(e, t) {
	for (let n of e) {
		let e = t.get(n)?.cards[0];
		if (e) return D(e);
	}
	return null;
}
function _e({ cardAction: e, columns: r, componentRef: s, createAction: u, "data-test": d, endpoint: f, filters: p, identity: m, moveAction: h, perColumn: g, query: _, queryKey: y, result: b, schema: x, searchable: S, syncQuery: C }) {
	let { canMove: w, columnKeys: T, columnsView: E, indicators: O, loadMore: k, move: A, moving: j, removeCard: M, resetColumn: N, resetFilters: P, restoreCard: F, search: I, searchFilterOptions: ee, setSearch: L, setTableFilter: R, tableFilters: te } = z({
		columns: r,
		componentRef: s,
		endpoint: f,
		identity: m,
		moveAction: h,
		perColumn: g,
		query: _,
		queryKey: y,
		result: b,
		syncQuery: C
	}), { t: B } = (0, v.useT)("board"), { focusCard: V, registerCard: U } = re(), [W, q] = o(() => ge(T, E)), J = i(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of T) e.set(t, (E.get(t)?.cards ?? []).map((e) => D(e)));
		return e;
	}, [T, E]), Y = a(J);
	Y.current = J, n(() => {
		if (w) return (0, v.monitorForElements)({
			canMonitor: ({ source: e }) => H(e.data) !== null,
			onDrop: ({ location: e, source: t }) => {
				let n = H(t.data), r = G(e.current.dropTargets);
				if (!n || !r) return;
				let i = K(n, r, Y.current);
				i && A(i).then((e) => {
					(0, v.announce)(e ? B("board.moved", "Card moved") : B("board.move-failed", "Could not move card"));
				});
			}
		});
	}, [
		w,
		A,
		B
	]), n(() => {
		W !== null && [...J.values()].some((e) => e.includes(W)) || q(ge(T, E));
	}, [
		J,
		T,
		E,
		W
	]);
	let X = t((e, t, n) => {
		let r = ne(T, J, e, t, n);
		r && (q(r.cardId), V(r.cardId));
	}, [
		J,
		T,
		V
	]);
	return /* @__PURE__ */ l("div", {
		className: "lt-board-container",
		children: [/* @__PURE__ */ c(me, {
			filters: p,
			indicators: O,
			onReset: P,
			onSearch: L,
			onSearchFilterOptions: ee,
			onTableFilter: R,
			search: I,
			searchable: S,
			tableFilters: te
		}), /* @__PURE__ */ c("div", {
			className: "lt-board",
			"data-test": d,
			children: r.map((t) => /* @__PURE__ */ c(fe, {
				canMove: w,
				cardAction: e,
				cardSchema: x,
				column: t,
				createAction: u,
				focusedCardId: W,
				moving: j,
				onFocusCard: q,
				onLoadMore: () => k(t.key),
				onMoveFocus: (e, n) => X(t.key, e, n),
				onResetColumn: () => N(t.key),
				registerCardRef: U,
				removeCard: M,
				restoreCard: F,
				view: E.get(t.key) ?? {
					cards: [],
					hasMore: !1,
					loading: !1,
					total: 0
				}
			}, t.key))
		})]
	});
}
var ve = m((() => {
	b(), B(), Y(), R(), Z(), pe(), he();
})), ye = /* @__PURE__ */ h({
	BoardAdapter: () => $,
	default: () => $
}), $, be = m((() => {
	b(), ve(), $ = ({ node: e }) => {
		let { cardAction: t, columns: n, createAction: r, endpoint: i, filters: a, moveAction: o, perColumn: s, query: l, queryKey: u, ref: d, result: f, searchable: p, syncQuery: m } = e.props;
		return /* @__PURE__ */ c(_e, {
			cardAction: t,
			columns: n,
			componentRef: d,
			createAction: r,
			"data-test": (0, v.nodeIdentity)(e),
			endpoint: i,
			filters: a,
			identity: (0, v.nodeIdentity)(e),
			moveAction: o,
			perColumn: s,
			query: l,
			queryKey: u,
			result: f,
			schema: e.schema ?? [],
			searchable: p,
			syncQuery: m
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
b();
var xe = {
	name: "lattice/board",
	components: { board: (0, v.lazyComponent)(() => Promise.resolve().then(() => (be(), ye))) },
	i18n: { namespace: "board" }
};
//#endregion
export { xe as default };
