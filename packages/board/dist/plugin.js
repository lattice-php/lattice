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
var O = m((() => {}));
//#endregion
//#region resources/js/use-board-state.ts
function k(e) {
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
function A({ columns: e, componentRef: r, endpoint: c, identity: l, perColumn: u, result: d }) {
	let [f] = o(() => {
		let t = C(e);
		return k(d ? w(t, d) : t);
	}), p = s(f.subscribe, f.getState), m = a(/* @__PURE__ */ new Set()), h = a({
		columns: e,
		result: d
	});
	n(() => {
		(h.current.columns !== e || h.current.result !== d) && (h.current = {
			columns: e,
			result: d
		}, m.current.clear(), f.setState((t) => {
			let n = C(e);
			return d ? w({
				...n,
				generation: t.generation
			}, d) : {
				...n,
				generation: t.generation + 1
			};
		}));
	}, [
		e,
		d,
		f
	]);
	let g = c !== null && c !== "", _ = t((e, t) => {
		if (!c) return;
		let n = f.getState().generation, i = new URLSearchParams({
			column: e,
			limit: String(u),
			offset: String(t)
		});
		(0, v.apiJson)(`${c}?${i.toString()}`, { ref: r ?? "" }).then((t) => {
			if (f.getState().generation !== n) return;
			let r = t.columns.find((t) => t.key === e);
			f.setState((t) => r ? T(t, r) : E(t, e, !1));
		}).catch(() => {
			f.setState((t) => E(t, e, !1));
		}).finally(() => {
			m.current.delete(e);
		});
	}, [
		r,
		c,
		u,
		f
	]), y = t((e) => {
		if (!g || m.current.has(e)) return;
		let t = f.getState().meta.get(e);
		!t || !t.hasMore || t.loading || (m.current.add(e), f.setState((t) => E(t, e, !0)), _(e, t.offset));
	}, [
		g,
		_,
		f
	]), b = t(() => {
		if (!g || !c) return;
		m.current.clear();
		let e = f.getState().generation;
		(0, v.apiJson)(c, { ref: r ?? "" }).then((t) => {
			f.getState().generation === e && f.setState((e) => w(e, t));
		}).catch(() => {});
	}, [
		g,
		r,
		c,
		f
	]);
	(0, v.useWindowEvent)(v.LATTICE_EVENT.reloadComponent, (e) => {
		let t = e.detail;
		l !== void 0 && t?.component === l && b();
	});
	let x = i(() => e.map((e) => e.key), [e]);
	return {
		columnKeys: x,
		columnsView: i(() => {
			let e = /* @__PURE__ */ new Map();
			for (let t of x) {
				let n = p.meta.get(t);
				e.set(t, {
					cards: D(p, t),
					hasMore: n?.hasMore ?? !1,
					loading: n?.loading ?? !1,
					total: n?.total ?? 0
				});
			}
			return e;
		}, [x, p]),
		loadMore: y
	};
}
var j = m((() => {
	b(), O();
}));
//#endregion
//#region resources/js/board-keyboard.ts
function M(e, t, n, r, i) {
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
function N() {
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
var P, F = m((() => {
	P = {
		ArrowDown: "next",
		ArrowLeft: "left",
		ArrowRight: "right",
		ArrowUp: "prev"
	};
})), I, L = m((() => {
	b(), F(), I = e(function({ card: e, "data-test": n, onFocus: r, onMoveFocus: i, schema: a, tabIndex: o }, s) {
		let l = t((e) => {
			let t = P[e.key];
			t && (e.preventDefault(), i(t));
		}, [i]);
		return /* @__PURE__ */ c("li", {
			className: (0, v.cn)("lt-board-card rounded-lt border border-lt-border bg-lt-surface p-3 text-sm text-lt-surface-fg shadow-lt-sm", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary"),
			"data-test": n,
			onFocus: r,
			onKeyDown: l,
			ref: s,
			role: "listitem",
			tabIndex: o,
			children: /* @__PURE__ */ c(v.Renderer, { nodes: (0, v.materializeSchema)(a, e) })
		});
	});
}));
//#endregion
//#region resources/js/components/board/board-column.tsx
function R({ cardSchema: e, column: t, focusedCardId: n, onFocusCard: i, onLoadMore: a, onMoveFocus: o, registerCardRef: s, view: u }) {
	let { t: d } = (0, v.useT)("board"), f = r(), p = (0, v.toneProps)((0, v.coerceColor)(t.color ?? void 0) ?? (0, v.namedColor)("gray"));
	return /* @__PURE__ */ l("section", {
		className: "lt-board-column",
		"data-test": `board-column-${t.key}`,
		children: [
			/* @__PURE__ */ l("header", {
				className: "flex items-center gap-2 pb-2",
				children: [
					t.icon ? /* @__PURE__ */ c(v.IconRenderer, {
						className: (0, v.cn)("size-lt-icon-md shrink-0", p.className),
						icon: t.icon
					}) : null,
					/* @__PURE__ */ c("h3", {
						className: "min-w-0 flex-1 truncate text-sm font-semibold text-lt-fg",
						id: f,
						children: t.label
					}),
					/* @__PURE__ */ c(v.Badge, {
						"aria-label": d("board.card-count", "{{count}} cards", { count: u.total }),
						className: p.className,
						style: p.style,
						children: u.total
					})
				]
			}),
			/* @__PURE__ */ c("ul", {
				"aria-labelledby": f,
				className: "lt-board-column-list",
				role: "list",
				children: u.cards.map((t) => {
					let r = x(t);
					return /* @__PURE__ */ c(I, {
						card: t,
						"data-test": `board-card-${r}`,
						onFocus: () => i(r),
						onMoveFocus: (e) => o(r, e),
						ref: (e) => s(r, e),
						schema: e,
						tabIndex: n === r ? 0 : -1
					}, r);
				})
			}),
			u.cards.length === 0 && !u.loading ? /* @__PURE__ */ c("p", {
				className: "px-1 py-2 text-sm text-lt-muted-fg",
				children: d("board.empty-column", "No cards")
			}) : null,
			u.hasMore ? /* @__PURE__ */ c("button", {
				className: "mt-2 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg",
				disabled: u.loading,
				onClick: a,
				type: "button",
				children: d("board.load-more", "Load more")
			}) : null
		]
	});
}
var z = m((() => {
	b(), O(), L();
}));
//#endregion
//#region resources/js/components/board/board.tsx
function B(e, t) {
	for (let n of e) {
		let e = t.get(n)?.cards[0];
		if (e) return x(e);
	}
	return null;
}
function V({ columns: e, componentRef: r, "data-test": a, endpoint: s, identity: l, perColumn: u, result: d, schema: f }) {
	let { columnKeys: p, columnsView: m, loadMore: h } = A({
		columns: e,
		componentRef: r,
		endpoint: s,
		identity: l,
		perColumn: u,
		result: d
	}), { focusCard: g, registerCard: _ } = N(), [v, y] = o(() => B(p, m)), b = i(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of p) e.set(t, (m.get(t)?.cards ?? []).map((e) => x(e)));
		return e;
	}, [p, m]);
	n(() => {
		v !== null && [...b.values()].some((e) => e.includes(v)) || y(B(p, m));
	}, [
		b,
		p,
		m,
		v
	]);
	let S = t((e, t, n) => {
		let r = M(p, b, e, t, n);
		r && (y(r.cardId), g(r.cardId));
	}, [
		b,
		p,
		g
	]);
	return /* @__PURE__ */ c("div", {
		className: "lt-board",
		"data-test": a,
		children: e.map((e) => /* @__PURE__ */ c(R, {
			cardSchema: f,
			column: e,
			focusedCardId: v,
			onFocusCard: y,
			onLoadMore: () => h(e.key),
			onMoveFocus: (t, n) => S(e.key, t, n),
			registerCardRef: _,
			view: m.get(e.key) ?? {
				cards: [],
				hasMore: !1,
				loading: !1,
				total: 0
			}
		}, e.key))
	});
}
var H = m((() => {
	j(), O(), F(), z();
})), U = /* @__PURE__ */ h({
	BoardAdapter: () => W,
	default: () => W
}), W, G = m((() => {
	b(), H(), W = ({ node: e }) => {
		let { columns: t, endpoint: n, perColumn: r, ref: i, result: a } = e.props;
		return /* @__PURE__ */ c(V, {
			columns: t,
			componentRef: i,
			"data-test": (0, v.nodeIdentity)(e),
			endpoint: n,
			identity: (0, v.nodeIdentity)(e),
			perColumn: r,
			result: a,
			schema: e.schema ?? []
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
b();
var K = {
	name: "lattice/board",
	components: { board: (0, v.lazyComponent)(() => Promise.resolve().then(() => (G(), U))) },
	i18n: { namespace: "board" }
};
//#endregion
export { K as default };
