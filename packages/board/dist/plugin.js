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
//#region resources/js/board-store.ts
function x(e) {
	let t = e.id;
	return typeof t == "string" || typeof t == "number" ? String(t) : "";
}
function S() {
	return {
		hasMore: !1,
		loading: !1,
		offset: 0,
		total: 0
	};
}
function C(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let r of e) t.set(r.key, S()), n.set(r.key, []);
	return {
		cards: /* @__PURE__ */ new Map(),
		generation: 0,
		meta: t,
		moving: !1,
		order: n
	};
}
function w(e, t) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
	for (let e of t.columns) {
		let t = [];
		for (let r of e.cards) {
			let e = x(r);
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
function T(e, t) {
	let n = new Map(e.cards), r = e.order.get(t.key) ?? [], i = new Set(r), a = [];
	for (let e of t.cards) {
		let t = x(e);
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
function E(e, t, n) {
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
function D(e, t) {
	return (e.order.get(t) ?? []).map((t) => e.cards.get(t)).filter((e) => e !== void 0);
}
function O(e, t) {
	if (!e.cards.has(t.cardId) || !e.order.has(t.columnKey)) return null;
	let n = null;
	for (let [r, i] of e.order) if (i.includes(t.cardId)) {
		n = r;
		break;
	}
	if (n === null) return null;
	let r = n === t.columnKey, i = e.order.get(n) ?? [], a = i.indexOf(t.cardId), o = i.filter((e) => e !== t.cardId), s = r ? o : [...e.order.get(t.columnKey) ?? []], c = Math.max(0, Math.min(t.position, s.length));
	if (r && a === c) return null;
	s.splice(c, 0, t.cardId);
	let l = new Map(e.order);
	l.set(n, o), l.set(t.columnKey, s);
	let u = new Map(e.meta);
	if (!r) {
		let e = u.get(n), r = u.get(t.columnKey);
		e && u.set(n, {
			...e,
			total: Math.max(0, e.total - 1)
		}), r && u.set(t.columnKey, {
			...r,
			total: r.total + 1
		});
	}
	return {
		...e,
		meta: u,
		order: l
	};
}
var k = m((() => {}));
//#endregion
//#region resources/js/use-board-state.ts
async function A(e, t, n) {
	let r = e.props.endpoint;
	return !r || (0, v.runAction)(() => (0, v.apiFetch)(r, {
		body: JSON.stringify(t),
		headers: { "Content-Type": "application/json" },
		method: e.props.method ?? "post",
		ref: e.props.ref ?? "",
		throwOnError: !1
	}), n);
}
function j(e) {
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
function M({ columns: e, componentRef: r, endpoint: c, identity: l, moveAction: u, perColumn: d, result: f }) {
	let [p] = o(() => {
		let t = C(e);
		return j(f ? w(t, f) : t);
	}), m = s(p.subscribe, p.getState), h = a(/* @__PURE__ */ new Set()), g = a({
		columns: e,
		result: f
	}), _ = (0, v.useEffectDispatcher)();
	n(() => {
		(g.current.columns !== e || g.current.result !== f) && (g.current = {
			columns: e,
			result: f
		}, h.current.clear(), p.setState((t) => {
			let n = C(e);
			return f ? w({
				...n,
				generation: t.generation
			}, f) : {
				...n,
				generation: t.generation + 1
			};
		}));
	}, [
		e,
		f,
		p
	]);
	let y = c !== null && c !== "", b = t((e, t) => {
		if (!c) return;
		let n = p.getState().generation, i = new URLSearchParams({
			column: e,
			limit: String(d),
			offset: String(t)
		});
		(0, v.apiJson)(`${c}?${i.toString()}`, { ref: r ?? "" }).then((t) => {
			if (p.getState().generation !== n) return;
			let r = t.columns.find((t) => t.key === e);
			p.setState((t) => r ? T(t, r) : E(t, e, !1));
		}).catch(() => {
			p.setState((t) => E(t, e, !1));
		}).finally(() => {
			h.current.delete(e);
		});
	}, [
		r,
		c,
		d,
		p
	]), x = t((e) => {
		if (!y || h.current.has(e)) return;
		let t = p.getState().meta.get(e);
		!t || !t.hasMore || t.loading || (h.current.add(e), p.setState((t) => E(t, e, !0)), b(e, t.offset));
	}, [
		y,
		b,
		p
	]), S = t(() => {
		if (!y || !c) return;
		h.current.clear();
		let e = p.getState().generation;
		(0, v.apiJson)(c, { ref: r ?? "" }).then((t) => {
			p.getState().generation === e && p.setState((e) => w(e, t));
		}).catch(() => {});
	}, [
		y,
		r,
		c,
		p
	]), k = t(async (e) => {
		if (!u || p.getState().moving) return !1;
		let t = p.getState(), n = O(t, e);
		if (!n) return !1;
		let r = t.generation;
		p.setState(() => ({
			...n,
			moving: !0
		}));
		let i = await A(u, e, _);
		return !i && p.getState().generation === r ? p.setState(() => ({
			...t,
			moving: !1
		})) : p.setState((e) => ({
			...e,
			moving: !1
		})), i;
	}, [
		_,
		u,
		p
	]);
	(0, v.useWindowEvent)(v.LATTICE_EVENT.reloadComponent, (e) => {
		let t = e.detail;
		l !== void 0 && t?.component === l && S();
	});
	let M = i(() => e.map((e) => e.key), [e]), N = i(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of M) {
			let n = m.meta.get(t);
			e.set(t, {
				cards: D(m, t),
				hasMore: n?.hasMore ?? !1,
				loading: n?.loading ?? !1,
				total: n?.total ?? 0
			});
		}
		return e;
	}, [M, m]);
	return {
		canMove: !!u,
		columnKeys: M,
		columnsView: N,
		loadMore: x,
		move: k,
		moving: m.moving
	};
}
var N = m((() => {
	b(), k();
}));
//#endregion
//#region resources/js/board-dnd.ts
function P(e) {
	return {
		cardId: e.id,
		columnKey: e.columnKey,
		type: B
	};
}
function F(e) {
	return e.type !== "lattice-board-card" || typeof e.cardId != "string" || typeof e.columnKey != "string" ? null : {
		columnKey: e.columnKey,
		id: e.cardId
	};
}
function I(e, t) {
	return (0, v.attachClosestEdge)({
		cardId: e.cardId,
		columnKey: e.columnKey,
		type: B
	}, {
		...t,
		allowedEdges: ["top", "bottom"]
	});
}
function L(e) {
	return {
		columnKey: e,
		type: V
	};
}
function R(e) {
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
function z(e, t, n) {
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
var B, V, H = m((() => {
	b(), B = "lattice-board-card", V = "lattice-board-column";
}));
//#endregion
//#region resources/js/board-keyboard.ts
function ee(e, t, n, r, i) {
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
function te() {
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
var U, W = m((() => {
	U = {
		ArrowDown: "next",
		ArrowLeft: "left",
		ArrowRight: "right",
		ArrowUp: "prev"
	};
}));
//#endregion
//#region resources/js/components/board/board-card.tsx
function G(e) {
	return e instanceof Element && e.closest(q) !== null;
}
function K(e) {
	switch (e) {
		case "top": return "border-t-lt-primary";
		case "bottom": return "border-b-lt-primary";
		default: return null;
	}
}
var q, J, Y = m((() => {
	b(), H(), W(), q = "input, textarea, select, label, [contenteditable]", J = e(function({ canMove: e, card: r, cardId: i, columnKey: s, "data-test": l, moving: u, onFocus: d, onMoveFocus: f, schema: p, tabIndex: m }, h) {
		let g = a(null), [_, y] = o(!1), [b, x] = o(null), S = t((e) => {
			g.current = e, typeof h == "function" ? h(e) : h && (h.current = e);
		}, [h]), C = t((e) => {
			let t = U[e.key];
			t && (e.preventDefault(), f(t));
		}, [f]);
		return n(() => {
			let t = g.current;
			if (!t || !e) return;
			let n = (e) => {
				let n = t.ownerDocument.activeElement;
				(G(e.target) || t.contains(n) && G(n)) && e.preventDefault();
			};
			return t.addEventListener("dragstart", n, !0), (0, v.combine)(() => t.removeEventListener("dragstart", n, !0), (0, v.draggable)({
				canDrag: () => !u,
				element: t,
				getInitialData: () => P({
					columnKey: s,
					id: i
				}),
				onDragStart: () => y(!0),
				onDrop: () => y(!1),
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
					let t = F(e.data);
					return t !== null && t.id !== i;
				},
				element: t,
				getData: ({ element: e, input: t }) => I({
					cardId: i,
					columnKey: s
				}, {
					element: e,
					input: t
				}),
				onDrag: ({ self: e }) => x((0, v.extractClosestEdge)(e.data)),
				onDragEnter: ({ self: e }) => x((0, v.extractClosestEdge)(e.data)),
				onDragLeave: () => x(null),
				onDrop: () => x(null)
			}));
		}, [
			e,
			i,
			s,
			u
		]), /* @__PURE__ */ c("li", {
			className: (0, v.cn)("lt-board-card rounded-lt border border-lt-border bg-lt-surface p-3 text-sm text-lt-surface-fg shadow-lt-sm", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary", e && "cursor-grab", _ && "opacity-50", K(b)),
			"data-drop-instruction": b ?? void 0,
			"data-test": l,
			onFocus: d,
			onKeyDown: C,
			ref: S,
			role: "listitem",
			tabIndex: m,
			children: /* @__PURE__ */ c(v.Renderer, { nodes: (0, v.materializeSchema)(p, r) })
		});
	});
}));
//#endregion
//#region resources/js/components/board/board-column.tsx
function X({ canMove: e, cardSchema: t, column: i, focusedCardId: s, moving: u, onFocusCard: d, onLoadMore: f, onMoveFocus: p, registerCardRef: m, view: h }) {
	let { t: g } = (0, v.useT)("board"), _ = r(), y = (0, v.toneProps)((0, v.coerceColor)(i.color ?? void 0) ?? (0, v.namedColor)("gray")), b = a(null), [S, C] = o(!1);
	return n(() => {
		let t = b.current;
		if (!(!t || !e)) return (0, v.combine)((0, v.dropTargetForElements)({
			canDrop: ({ source: e }) => F(e.data) !== null,
			element: t,
			getData: () => L(i.key),
			onDragEnter: () => C(!0),
			onDragLeave: () => C(!1),
			onDrop: () => C(!1)
		}), (0, v.autoScrollForElements)({ element: t }));
	}, [e, i.key]), /* @__PURE__ */ l("section", {
		className: "lt-board-column",
		"data-test": `board-column-${i.key}`,
		children: [
			/* @__PURE__ */ l("header", {
				className: "flex items-center gap-2 pb-2",
				children: [
					i.icon ? /* @__PURE__ */ c(v.IconRenderer, {
						className: (0, v.cn)("size-lt-icon-md shrink-0", y.className),
						icon: i.icon
					}) : null,
					/* @__PURE__ */ c("h3", {
						className: "min-w-0 flex-1 truncate text-sm font-semibold text-lt-fg",
						id: _,
						children: i.label
					}),
					/* @__PURE__ */ c(v.Badge, {
						"aria-label": g("board.card-count", "{{count}} cards", { count: h.total }),
						className: y.className,
						style: y.style,
						children: h.total
					})
				]
			}),
			/* @__PURE__ */ l("ul", {
				"aria-labelledby": _,
				className: (0, v.cn)("lt-board-column-list", S && "lt-board-column-list-drop-target"),
				ref: b,
				role: "list",
				children: [h.cards.map((n) => {
					let r = x(n);
					return /* @__PURE__ */ c(J, {
						canMove: e,
						card: n,
						cardId: r,
						columnKey: i.key,
						"data-test": `board-card-${r}`,
						moving: u,
						onFocus: () => d(r),
						onMoveFocus: (e) => p(r, e),
						ref: (e) => m(r, e),
						schema: t,
						tabIndex: s === r ? 0 : -1
					}, r);
				}), h.cards.length === 0 && !h.loading ? /* @__PURE__ */ c("li", {
					className: "px-1 py-2 text-sm text-lt-muted-fg",
					children: g("board.empty-column", "No cards")
				}) : null]
			}),
			h.hasMore ? /* @__PURE__ */ c("button", {
				className: "mt-2 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg",
				disabled: h.loading,
				onClick: f,
				type: "button",
				children: g("board.load-more", "Load more")
			}) : null
		]
	});
}
var Z = m((() => {
	b(), H(), k(), Y();
}));
//#endregion
//#region resources/js/components/board/board.tsx
function Q(e, t) {
	for (let n of e) {
		let e = t.get(n)?.cards[0];
		if (e) return x(e);
	}
	return null;
}
function ne({ columns: e, componentRef: r, "data-test": s, endpoint: l, identity: u, moveAction: d, perColumn: f, result: p, schema: m }) {
	let { canMove: h, columnKeys: g, columnsView: _, loadMore: y, move: b, moving: S } = M({
		columns: e,
		componentRef: r,
		endpoint: l,
		identity: u,
		moveAction: d,
		perColumn: f,
		result: p
	}), { t: C } = (0, v.useT)("board"), { focusCard: w, registerCard: T } = te(), [E, D] = o(() => Q(g, _)), O = i(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of g) e.set(t, (_.get(t)?.cards ?? []).map((e) => x(e)));
		return e;
	}, [g, _]), k = a(O);
	k.current = O, n(() => {
		if (h) return (0, v.monitorForElements)({
			canMonitor: ({ source: e }) => F(e.data) !== null,
			onDrop: ({ location: e, source: t }) => {
				let n = F(t.data), r = R(e.current.dropTargets);
				if (!n || !r) return;
				let i = z(n, r, k.current);
				i && b(i).then((e) => {
					(0, v.announce)(e ? C("board.moved", "Card moved") : C("board.move-failed", "Could not move card"));
				});
			}
		});
	}, [
		h,
		b,
		C
	]), n(() => {
		E !== null && [...O.values()].some((e) => e.includes(E)) || D(Q(g, _));
	}, [
		O,
		g,
		_,
		E
	]);
	let A = t((e, t, n) => {
		let r = ee(g, O, e, t, n);
		r && (D(r.cardId), w(r.cardId));
	}, [
		O,
		g,
		w
	]);
	return /* @__PURE__ */ c("div", {
		className: "lt-board",
		"data-test": s,
		children: e.map((e) => /* @__PURE__ */ c(X, {
			canMove: h,
			cardSchema: m,
			column: e,
			focusedCardId: E,
			moving: S,
			onFocusCard: D,
			onLoadMore: () => y(e.key),
			onMoveFocus: (t, n) => A(e.key, t, n),
			registerCardRef: T,
			view: _.get(e.key) ?? {
				cards: [],
				hasMore: !1,
				loading: !1,
				total: 0
			}
		}, e.key))
	});
}
var re = m((() => {
	b(), N(), H(), k(), W(), Z();
})), ie = /* @__PURE__ */ h({
	BoardAdapter: () => $,
	default: () => $
}), $, ae = m((() => {
	b(), re(), $ = ({ node: e }) => {
		let { columns: t, endpoint: n, moveAction: r, perColumn: i, ref: a, result: o } = e.props;
		return /* @__PURE__ */ c(ne, {
			columns: t,
			componentRef: a,
			"data-test": (0, v.nodeIdentity)(e),
			endpoint: n,
			identity: (0, v.nodeIdentity)(e),
			moveAction: r,
			perColumn: i,
			result: o,
			schema: e.schema ?? []
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
b();
var oe = {
	name: "lattice/board",
	components: { board: (0, v.lazyComponent)(() => Promise.resolve().then(() => (ae(), ie))) },
	i18n: { namespace: "board" }
};
//#endregion
export { oe as default };
