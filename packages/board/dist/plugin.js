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
	return typeof e.cardUrl == "string" ? e.cardUrl : null;
}
function S(e) {
	return Array.isArray(e.actions) ? e.actions : [];
}
function C(e) {
	let t = e.id;
	return typeof t == "string" || typeof t == "number" ? String(t) : "";
}
function w() {
	return {
		hasMore: !1,
		loading: !1,
		offset: 0,
		total: 0
	};
}
function T(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let r of e) t.set(r.key, w()), n.set(r.key, []);
	return {
		cards: /* @__PURE__ */ new Map(),
		generation: 0,
		meta: t,
		moving: !1,
		order: n
	};
}
function E(e, t) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
	for (let e of t.columns) {
		let t = [];
		for (let r of e.cards) {
			let e = C(r);
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
function D(e, t) {
	let n = new Map(e.cards), r = e.order.get(t.key) ?? [], i = new Set(r), a = [];
	for (let e of t.cards) {
		let t = C(e);
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
function O(e, t) {
	let n = new Map(e.cards), r = [];
	for (let e of t.cards) {
		let t = C(e);
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
function k(e, t, n) {
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
function A(e, t) {
	return (e.order.get(t) ?? []).map((t) => e.cards.get(t)).filter((e) => e !== void 0);
}
function j(e, t) {
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
var M = m((() => {}));
//#endregion
//#region resources/js/use-board-state.ts
async function N(e, t, n) {
	let r = e.props.endpoint;
	return !r || (0, v.runAction)(() => (0, v.apiFetch)(r, {
		body: JSON.stringify(t),
		headers: { "Content-Type": "application/json" },
		method: e.props.method ?? "post",
		ref: e.props.ref ?? "",
		throwOnError: !1
	}), n);
}
function P(e) {
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
function F({ columns: e, componentRef: r, endpoint: c, identity: l, moveAction: u, perColumn: d, result: f }) {
	let [p] = o(() => {
		let t = T(e);
		return P(f ? E(t, f) : t);
	}), m = s(p.subscribe, p.getState), h = a(/* @__PURE__ */ new Set()), g = a({
		columns: e,
		result: f
	}), _ = (0, v.useEffectDispatcher)();
	n(() => {
		(g.current.columns !== e || g.current.result !== f) && (g.current = {
			columns: e,
			result: f
		}, h.current.clear(), p.setState((t) => {
			let n = T(e);
			return f ? E({
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
			p.setState((t) => r ? D(t, r) : k(t, e, !1));
		}).catch(() => {
			p.setState((t) => k(t, e, !1));
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
		!t || !t.hasMore || t.loading || (h.current.add(e), p.setState((t) => k(t, e, !0)), b(e, t.offset));
	}, [
		y,
		b,
		p
	]), S = t(() => {
		if (!y || !c) return;
		h.current.clear();
		let e = p.getState().generation;
		(0, v.apiJson)(c, { ref: r ?? "" }).then((t) => {
			p.getState().generation === e && p.setState((e) => E(e, t));
		}).catch(() => {});
	}, [
		y,
		r,
		c,
		p
	]), C = t((e) => {
		if (!y || !c) return;
		let t = p.getState().generation, n = new URLSearchParams({
			column: e,
			limit: String(d),
			offset: "0"
		});
		(0, v.apiJson)(`${c}?${n.toString()}`, { ref: r ?? "" }).then((n) => {
			if (p.getState().generation !== t) return;
			let r = n.columns.find((t) => t.key === e);
			r && p.setState((e) => O(e, r));
		}).catch(() => {});
	}, [
		y,
		r,
		c,
		d,
		p
	]), w = t(async (e) => {
		if (!u || p.getState().moving) return !1;
		let t = p.getState(), n = j(t, e);
		if (!n) return !1;
		let r = t.generation;
		p.setState(() => ({
			...n,
			moving: !0
		}));
		let i = await N(u, e, _);
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
	let M = i(() => e.map((e) => e.key), [e]), F = i(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of M) {
			let n = m.meta.get(t);
			e.set(t, {
				cards: A(m, t),
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
		columnsView: F,
		loadMore: x,
		move: w,
		moving: m.moving,
		resetColumn: C
	};
}
var ee = m((() => {
	b(), M();
}));
//#endregion
//#region resources/js/board-dnd.ts
function te(e) {
	return {
		cardId: e.id,
		columnKey: e.columnKey,
		type: B
	};
}
function I(e) {
	return e.type !== "lattice-board-card" || typeof e.cardId != "string" || typeof e.columnKey != "string" ? null : {
		columnKey: e.columnKey,
		id: e.cardId
	};
}
function ne(e, t) {
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
function re(e, t, n, r, i) {
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
function ie() {
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
//#region resources/js/components/board/board-card-actions.tsx
function G({ actions: e, "data-test": t }) {
	let { t: n } = (0, v.useT)("board"), r = n("board.card-actions", "Card actions");
	return /* @__PURE__ */ c("div", {
		className: "lt-board-card-actions",
		"data-test": t,
		children: /* @__PURE__ */ l(v.DropdownMenu, { children: [/* @__PURE__ */ c(v.DropdownMenuTrigger, {
			asChild: !0,
			children: /* @__PURE__ */ c(v.Button, {
				"aria-label": r,
				className: "size-lt-control-sm text-lt-muted-fg shadow-none hover:text-lt-fg",
				size: "icon",
				type: "button",
				emphasis: "ghost",
				children: /* @__PURE__ */ c(v.Icon, {
					"aria-hidden": "true",
					className: "size-lt-icon-md",
					name: "more-horizontal"
				})
			})
		}), /* @__PURE__ */ c(v.DropdownMenuContent, {
			align: "end",
			"aria-label": r,
			className: "min-w-44 gap-0.5 p-1.5",
			sideOffset: 4,
			children: /* @__PURE__ */ c(v.ActionMenuProvider, { children: /* @__PURE__ */ c(v.Renderer, { nodes: e }) })
		})] })
	});
}
var K = m((() => {
	b();
}));
//#endregion
//#region resources/js/components/board/board-card.tsx
function q(e) {
	return e instanceof Element && e.closest(Y) !== null;
}
function J(e) {
	switch (e) {
		case "top": return "border-t-lt-primary";
		case "bottom": return "border-b-lt-primary";
		default: return null;
	}
}
var Y, X, ae = m((() => {
	b(), H(), W(), M(), K(), Y = "a, button, input, textarea, select, label, [contenteditable], [role=menuitem], [role=checkbox]", X = e(function({ canMove: e, card: r, cardAction: i, cardId: s, columnKey: u, "data-test": d, moving: f, onFocus: p, onMoveFocus: m, schema: h, tabIndex: g }, _) {
		let y = a(null), [b, C] = o(!1), [w, T] = o(null), { visit: E } = (0, v.useNavigation)(), D = (0, v.useCallAction)(), O = x(r), k = S(r), A = t((e) => {
			y.current = e, typeof _ == "function" ? _(e) : _ && (_.current = e);
		}, [_]), j = t((e = {}) => {
			if (O) {
				e.newTab ? window.open(O, "_blank") : E(O);
				return;
			}
			i && D(i, {
				cardId: s,
				columnKey: u
			});
		}, [
			i,
			s,
			u,
			D,
			O,
			E
		]), M = t((e) => {
			q(e.target) || j({ newTab: e.metaKey || e.ctrlKey });
		}, [j]), N = t((e) => {
			!O || e.button !== 1 || q(e.target) || window.open(O, "_blank");
		}, [O]), P = t((e) => {
			let t = U[e.key];
			if (t) {
				e.preventDefault(), m(t);
				return;
			}
			(e.key === "Enter" || e.key === " ") && e.target === y.current && (O || i) && (e.preventDefault(), j());
		}, [
			j,
			i,
			m,
			O
		]);
		return n(() => {
			let t = y.current;
			if (!t || !e) return;
			let n = (e) => {
				let n = t.ownerDocument.activeElement;
				(q(e.target) || t.contains(n) && q(n)) && e.preventDefault();
			};
			return t.addEventListener("dragstart", n, !0), (0, v.combine)(() => t.removeEventListener("dragstart", n, !0), (0, v.draggable)({
				canDrag: () => !f,
				element: t,
				getInitialData: () => te({
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
					let t = I(e.data);
					return t !== null && t.id !== s;
				},
				element: t,
				getData: ({ element: e, input: t }) => ne({
					cardId: s,
					columnKey: u
				}, {
					element: e,
					input: t
				}),
				onDrag: ({ self: e }) => T((0, v.extractClosestEdge)(e.data)),
				onDragEnter: ({ self: e }) => T((0, v.extractClosestEdge)(e.data)),
				onDragLeave: () => T(null),
				onDrop: () => T(null)
			}));
		}, [
			e,
			s,
			u,
			f
		]), /* @__PURE__ */ l("li", {
			className: (0, v.cn)("lt-board-card relative rounded-lt border border-lt-border bg-lt-surface p-3 text-sm text-lt-surface-fg shadow-lt-sm", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary", e && "cursor-grab", (O || i) && "cursor-pointer", b && "opacity-50", J(w)),
			"data-drop-instruction": w ?? void 0,
			"data-test": d,
			onAuxClick: N,
			onClick: M,
			onFocus: p,
			onKeyDown: P,
			ref: A,
			role: "listitem",
			tabIndex: g,
			children: [k.length > 0 ? /* @__PURE__ */ c(G, {
				actions: k,
				"data-test": d ? `${d}-actions` : void 0
			}) : null, /* @__PURE__ */ c(v.Renderer, { nodes: (0, v.materializeSchema)(h, r) })]
		});
	});
}));
//#endregion
//#region resources/js/components/board/quick-add.tsx
function oe({ columnKey: e, createAction: n, onCreated: r }) {
	let { t: i } = (0, v.useT)("board"), s = (0, v.useCallAction)(), [u, d] = o(!1), [f, p] = o(""), [m, h] = o(!1), g = a(null), _ = t(() => {
		d(!1), p("");
	}, []), y = t(async () => {
		if (!n || m) return;
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
	return n ? u ? /* @__PURE__ */ c("input", {
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
	}) : null;
}
var se = m((() => {
	b();
}));
//#endregion
//#region resources/js/components/board/board-column.tsx
function ce({ canMove: e, cardAction: t, cardSchema: i, column: s, createAction: u, focusedCardId: d, moving: f, onFocusCard: p, onLoadMore: m, onMoveFocus: h, onResetColumn: g, registerCardRef: _, view: y }) {
	let { t: b } = (0, v.useT)("board"), x = r(), S = (0, v.toneProps)((0, v.coerceColor)(s.color ?? void 0) ?? (0, v.namedColor)("gray")), w = a(null), [T, E] = o(!1);
	return n(() => {
		let t = w.current;
		if (!(!t || !e)) return (0, v.combine)((0, v.dropTargetForElements)({
			canDrop: ({ source: e }) => I(e.data) !== null,
			element: t,
			getData: () => L(s.key),
			onDragEnter: () => E(!0),
			onDragLeave: () => E(!1),
			onDrop: () => E(!1)
		}), (0, v.autoScrollForElements)({ element: t }));
	}, [e, s.key]), /* @__PURE__ */ l("section", {
		className: "lt-board-column",
		"data-test": `board-column-${s.key}`,
		children: [
			/* @__PURE__ */ l("header", {
				className: "flex items-center gap-2 pb-2",
				children: [
					s.icon ? /* @__PURE__ */ c(v.IconRenderer, {
						className: (0, v.cn)("size-lt-icon-md shrink-0", S.className),
						icon: s.icon
					}) : null,
					/* @__PURE__ */ c("h3", {
						className: "min-w-0 flex-1 truncate text-sm font-semibold text-lt-fg",
						id: x,
						children: s.label
					}),
					/* @__PURE__ */ c(v.Badge, {
						"aria-label": b("board.card-count", "{{count}} cards", { count: y.total }),
						className: S.className,
						style: S.style,
						children: y.total
					})
				]
			}),
			/* @__PURE__ */ l("ul", {
				"aria-labelledby": x,
				className: (0, v.cn)("lt-board-column-list", T && "lt-board-column-list-drop-target"),
				ref: w,
				role: "list",
				children: [
					y.cards.map((n) => {
						let r = C(n);
						return /* @__PURE__ */ c(X, {
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
							schema: i,
							tabIndex: d === r ? 0 : -1
						}, r);
					}),
					y.cards.length === 0 && !y.loading ? /* @__PURE__ */ c("li", {
						className: "px-1 py-2 text-sm text-lt-muted-fg",
						children: b("board.empty-column", "No cards")
					}) : null,
					u ? /* @__PURE__ */ c("li", { children: /* @__PURE__ */ c(oe, {
						columnKey: s.key,
						createAction: u,
						onCreated: g
					}) }) : null
				]
			}),
			y.hasMore ? /* @__PURE__ */ c("button", {
				className: "mt-2 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg",
				disabled: y.loading,
				onClick: m,
				type: "button",
				children: b("board.load-more", "Load more")
			}) : null
		]
	});
}
var Z = m((() => {
	b(), H(), M(), ae(), se();
}));
//#endregion
//#region resources/js/components/board/board.tsx
function Q(e, t) {
	for (let n of e) {
		let e = t.get(n)?.cards[0];
		if (e) return C(e);
	}
	return null;
}
function le({ cardAction: e, columns: r, componentRef: s, createAction: l, "data-test": u, endpoint: d, identity: f, moveAction: p, perColumn: m, result: h, schema: g }) {
	let { canMove: _, columnKeys: y, columnsView: b, loadMore: x, move: S, moving: w, resetColumn: T } = F({
		columns: r,
		componentRef: s,
		endpoint: d,
		identity: f,
		moveAction: p,
		perColumn: m,
		result: h
	}), { t: E } = (0, v.useT)("board"), { focusCard: D, registerCard: O } = ie(), [k, A] = o(() => Q(y, b)), j = i(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of y) e.set(t, (b.get(t)?.cards ?? []).map((e) => C(e)));
		return e;
	}, [y, b]), M = a(j);
	M.current = j, n(() => {
		if (_) return (0, v.monitorForElements)({
			canMonitor: ({ source: e }) => I(e.data) !== null,
			onDrop: ({ location: e, source: t }) => {
				let n = I(t.data), r = R(e.current.dropTargets);
				if (!n || !r) return;
				let i = z(n, r, M.current);
				i && S(i).then((e) => {
					(0, v.announce)(e ? E("board.moved", "Card moved") : E("board.move-failed", "Could not move card"));
				});
			}
		});
	}, [
		_,
		S,
		E
	]), n(() => {
		k !== null && [...j.values()].some((e) => e.includes(k)) || A(Q(y, b));
	}, [
		j,
		y,
		b,
		k
	]);
	let N = t((e, t, n) => {
		let r = re(y, j, e, t, n);
		r && (A(r.cardId), D(r.cardId));
	}, [
		j,
		y,
		D
	]);
	return /* @__PURE__ */ c("div", {
		className: "lt-board",
		"data-test": u,
		children: r.map((t) => /* @__PURE__ */ c(ce, {
			canMove: _,
			cardAction: e,
			cardSchema: g,
			column: t,
			createAction: l,
			focusedCardId: k,
			moving: w,
			onFocusCard: A,
			onLoadMore: () => x(t.key),
			onMoveFocus: (e, n) => N(t.key, e, n),
			onResetColumn: () => T(t.key),
			registerCardRef: O,
			view: b.get(t.key) ?? {
				cards: [],
				hasMore: !1,
				loading: !1,
				total: 0
			}
		}, t.key))
	});
}
var ue = m((() => {
	b(), ee(), H(), M(), W(), Z();
})), de = /* @__PURE__ */ h({
	BoardAdapter: () => $,
	default: () => $
}), $, fe = m((() => {
	b(), ue(), $ = ({ node: e }) => {
		let { cardAction: t, columns: n, createAction: r, endpoint: i, moveAction: a, perColumn: o, ref: s, result: l } = e.props;
		return /* @__PURE__ */ c(le, {
			cardAction: t,
			columns: n,
			componentRef: s,
			createAction: r,
			"data-test": (0, v.nodeIdentity)(e),
			endpoint: i,
			identity: (0, v.nodeIdentity)(e),
			moveAction: a,
			perColumn: o,
			result: l,
			schema: e.schema ?? []
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
b();
var pe = {
	name: "lattice/board",
	components: { board: (0, v.lazyComponent)(() => Promise.resolve().then(() => (fe(), de))) },
	i18n: { namespace: "board" }
};
//#endregion
export { pe as default };
