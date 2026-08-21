import { createContext as e, useCallback as t, useContext as n, useEffect as r, useId as i, useRef as a, useState as o } from "react";
import { jsx as s, jsxs as c } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var l = Object.defineProperty, u = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyNames, f = Object.prototype.hasOwnProperty, p = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, m = (e, t) => {
	let n = {};
	for (var r in e) l(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || l(n, Symbol.toStringTag, { value: "Module" }), n;
}, h = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = d(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !f.call(e, s) && s !== n && l(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = u(t, s)) || r.enumerable
	});
	return e;
}, g = (e, t, n) => (h(e, t, "default"), n && h(n, t, "default")), _ = /* @__PURE__ */ m({});
import * as v from "@lattice-php/lattice/runtime";
g(_, v);
var y = p((() => {}));
//#endregion
//#region resources/js/context.tsx
function b({ value: e, children: t }) {
	return /* @__PURE__ */ s(S.Provider, {
		value: e,
		children: t
	});
}
function x() {
	let e = n(S);
	if (e === null) throw Error("useSearchContext must be used within a SearchBox.");
	return e;
}
var S, C = p((() => {
	S = e(null);
})), w = p((() => {}));
//#endregion
//#region resources/js/use-search.ts
function T(e, t) {
	let n = new URLSearchParams(t).toString();
	return n === "" ? e : `${e}${e.includes("?") ? "&" : "?"}${n}`;
}
function E(e) {
	return `${e.category.name}:${e.item.id}`;
}
function D(e) {
	return e instanceof Error && e.name === "AbortError";
}
function O({ endpoint: e, perPage: n = 20 }) {
	let { visit: i } = (0, _.useNavigation)(), [s, c] = o(""), [l, u] = o([]), [d, f] = o(null), [p, m] = o([]), [h, g] = o([]), [v, y] = o(null), [b, x] = o("idle"), [S, C] = o(null), [w, O] = o(null), k = a(null), A = a(null), j = a(0), M = a(null), N = t(async (t, r, i, a) => {
		k.current?.abort();
		let o = new AbortController(), s = j.current += 1;
		k.current = o, x("loading"), C(null);
		try {
			let c = {
				query: t,
				page: String(i),
				per_page: String(n),
				counts: "1"
			};
			r !== null && (c.category = r);
			let l = await (0, _.apiJson)(T(e, c), { signal: o.signal });
			if (s !== j.current) return;
			u(l.categories), f(l.state.category), y(l.pagination), m((e) => a ? [...e, ...l.data] : l.data), a || O(l.data[0] ? E(l.data[0]) : null), x("success");
		} catch (e) {
			if (D(e)) return;
			C(e instanceof Error ? e.message : String(e)), x("error");
		}
	}, [e, n]), P = t((e) => {
		if (c(e), O(null), m([]), y(null), k.current?.abort(), j.current += 1, M.current !== null && clearTimeout(M.current), e.trim() === "") {
			x("idle"), C(null);
			return;
		}
		x("loading"), M.current = setTimeout(() => {
			N(e, d, 1, !1);
		}, 250);
	}, [d, N]), F = t((e) => {
		f(e), O(null), N(s, e, 1, !1);
	}, [s, N]), I = t(() => {
		v?.nextPage !== null && v !== null && b !== "loading" && N(s, d, v.nextPage, !0);
	}, [
		d,
		v,
		s,
		N,
		b
	]), L = t(async () => {
		A.current?.abort();
		let t = new AbortController();
		A.current = t;
		try {
			let r = await (0, _.apiJson)(T(e, {
				recent: "1",
				per_page: String(n)
			}), { signal: t.signal });
			g(r.data);
		} catch (e) {
			D(e) || g([]);
		}
	}, [e, n]), R = t(async (t) => {
		try {
			let n = await (0, _.apiJson)(e, {
				method: "POST",
				body: JSON.stringify({
					category: t.category.name,
					id: t.item.id
				})
			});
			i(n.data.item.link);
		} catch (e) {
			C(e instanceof Error ? e.message : String(e)), x("error");
		}
	}, [e, i]);
	return r(() => () => {
		k.current?.abort(), A.current?.abort(), M.current !== null && clearTimeout(M.current);
	}, []), {
		query: s,
		setQuery: P,
		categories: l,
		activeCategory: d,
		setCategory: F,
		results: p,
		recent: h,
		pagination: v,
		status: b,
		error: S,
		focusedKey: w,
		setFocusedKey: O,
		loadMore: I,
		openResult: (e) => void R(e),
		refreshRecent: () => void L()
	};
}
var k = p((() => {
	y(), w();
}));
//#endregion
//#region resources/js/components/categories/categories.tsx
function A({ "data-test": e } = {}) {
	let { categories: t, activeCategory: n, setCategory: r } = x();
	return /* @__PURE__ */ s("div", {
		"data-test": e,
		className: "flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-x-visible",
		children: t.map((e) => /* @__PURE__ */ c("button", {
			"aria-pressed": e.name === n,
			className: (0, _.cn)("flex min-h-11 shrink-0 items-center justify-between gap-2 rounded-lt-sm px-3 text-start text-sm md:w-full", e.name === n ? "bg-lt-muted text-lt-fg" : "text-lt-muted-fg hover:bg-lt-muted/60"),
			onClick: () => r(e.name),
			type: "button",
			children: [/* @__PURE__ */ c("span", {
				className: "flex min-w-0 items-center gap-2",
				children: [e.icon ? /* @__PURE__ */ s(_.Icon, {
					name: e.icon,
					"aria-hidden": "true",
					className: "size-lt-icon-sm"
				}) : null, /* @__PURE__ */ s("span", {
					className: "truncate",
					children: e.label
				})]
			}), e.count === null ? null : /* @__PURE__ */ s("span", {
				className: "text-xs tabular-nums text-lt-muted-fg",
				children: e.count
			})]
		}, e.name))
	});
}
var j = p((() => {
	y(), C();
}));
//#endregion
//#region resources/js/use-result-keyboard.ts
function M(e, t) {
	return `${e}-result-${encodeURIComponent(E(t))}`;
}
function N(e) {
	let { focusedKey: n, setFocusedKey: r, openResult: i } = x();
	return t((t) => {
		if (e.length === 0) return;
		let a = e.findIndex((e) => E(e) === n);
		if (t.key === "ArrowDown") {
			t.preventDefault();
			let n = e[Math.min(e.length - 1, a + 1)];
			r(n ? E(n) : null);
		} else if (t.key === "ArrowUp") {
			t.preventDefault();
			let n = e[a < 0 ? e.length - 1 : Math.max(0, a - 1)];
			r(n ? E(n) : null);
		} else if (t.key === "Enter") {
			let n = e[Math.max(0, a)];
			n && (t.preventDefault(), i(n));
		}
	}, [
		n,
		i,
		e,
		r
	]);
}
var P = p((() => {
	C(), k();
}));
//#endregion
//#region resources/js/components/input/input.tsx
function F({ "data-test": e } = {}) {
	let { placeholder: t, query: n, setQuery: r, results: i, recent: a, focusedKey: o, instanceId: l } = x(), u = i.length > 0 ? i : n.trim() === "" ? a : [], d = N(u), f = u.find((e) => E(e) === o);
	return /* @__PURE__ */ c("div", {
		"data-test": e,
		className: "flex min-h-12 items-center gap-2 border-b border-lt-border px-4",
		children: [/* @__PURE__ */ s(_.Icon, {
			name: "search",
			"aria-hidden": "true",
			className: "size-lt-icon-md text-lt-muted-fg"
		}), /* @__PURE__ */ s("input", {
			"aria-activedescendant": f ? M(l, f) : void 0,
			"aria-controls": u.length > 0 ? `${l}-${i.length > 0 ? "results" : "recent"}` : void 0,
			"aria-label": t,
			autoFocus: !0,
			className: "min-h-11 w-full bg-transparent text-sm text-lt-fg outline-none placeholder:text-lt-muted-fg",
			onChange: (e) => r(e.target.value),
			onKeyDown: d,
			placeholder: t,
			type: "search",
			value: n
		})]
	});
}
var I = p((() => {
	y(), C(), P(), k();
}));
//#endregion
//#region resources/js/components/preview/preview.tsx
function L({ "data-test": e } = {}) {
	let { results: t, recent: n, focusedKey: r, openResult: i } = x(), { t: a } = (0, _.useT)("search"), o = [...t, ...n].find((e) => E(e) === r);
	if (!o) return /* @__PURE__ */ s("div", {
		"data-test": e,
		className: "p-4 text-sm text-lt-muted-fg",
		children: a("search.preview-empty", "Select a result to preview.")
	});
	let l = [o.item.subtitle, o.item.additionalInfo].filter((e) => e !== null && e !== "").join(" · ");
	return /* @__PURE__ */ c("div", {
		"data-test": e,
		className: "flex flex-col gap-4 p-4",
		children: [/* @__PURE__ */ c("div", {
			className: "grid gap-1",
			children: [
				/* @__PURE__ */ s("span", {
					className: "text-base font-semibold text-lt-fg",
					children: o.item.title
				}),
				l === "" ? null : /* @__PURE__ */ s("span", {
					className: "text-sm text-lt-muted-fg",
					children: l
				}),
				o.item.badge ? /* @__PURE__ */ s("span", {
					className: "w-fit rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg",
					children: o.item.badge
				}) : null
			]
		}), /* @__PURE__ */ s(_.Button, {
			emphasis: "outline",
			onClick: () => i(o),
			variant: "secondary",
			children: a("search.open", "Open")
		})]
	});
}
var R = p((() => {
	y(), C(), k();
}));
//#endregion
//#region resources/js/primitives/result-row.tsx
function ee(e) {
	return [e.item.subtitle, e.item.additionalInfo].filter((e) => e !== null && e !== "").join(" · ");
}
function z({ result: e, focused: t, onOpen: n, onFocus: r, id: i, tabIndex: a = -1 }) {
	let o = ee(e);
	return /* @__PURE__ */ c("button", {
		"aria-selected": t,
		className: (0, _.cn)("flex min-h-11 w-full items-center gap-3 rounded-lt-sm px-3 py-2 text-start", t ? "bg-lt-muted" : "hover:bg-lt-muted/60"),
		"data-test": `search-result-${e.category.name}-${e.item.id}`,
		id: i,
		onClick: n,
		onFocus: r,
		onMouseEnter: r,
		role: "option",
		tabIndex: a,
		type: "button",
		children: [/* @__PURE__ */ c("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ c("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ s("span", {
					className: "truncate text-sm font-medium text-lt-fg",
					children: e.item.title
				}), e.item.badge ? /* @__PURE__ */ s("span", {
					className: "rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg",
					children: e.item.badge
				}) : null]
			}), o === "" ? null : /* @__PURE__ */ s("span", {
				className: "block truncate text-xs text-lt-muted-fg",
				children: o
			})]
		}), t ? /* @__PURE__ */ s(_.Icon, {
			name: "arrow-down",
			"aria-hidden": "true",
			className: "size-lt-icon-sm -rotate-90 text-lt-muted-fg"
		}) : null]
	});
}
var B = p((() => {
	y();
}));
//#endregion
//#region resources/js/components/recent/recent.tsx
function V({ "data-test": e } = {}) {
	let { query: t, results: n, recent: r, focusedKey: i, setFocusedKey: a, openResult: o, instanceId: l } = x(), { t: u } = (0, _.useT)("search"), d = N(r);
	return t.trim() !== "" || n.length > 0 || r.length === 0 ? null : /* @__PURE__ */ c("div", {
		"data-test": e,
		"aria-label": u("search.recent", "Recent"),
		className: "flex max-h-full flex-col gap-1 overflow-y-auto p-1",
		id: `${l}-recent`,
		onKeyDown: d,
		role: "listbox",
		children: [/* @__PURE__ */ s("span", {
			className: "px-3 py-1 text-xs font-medium uppercase tracking-wide text-lt-muted-fg",
			children: u("search.recent", "Recent")
		}), r.map((e) => {
			let t = E(e);
			return /* @__PURE__ */ s(z, {
				focused: t === i,
				id: M(l, e),
				onFocus: () => a(t),
				onOpen: () => o(e),
				result: e,
				tabIndex: 0
			}, t);
		})]
	});
}
var H = p((() => {
	y(), C(), P(), k(), B();
}));
//#endregion
//#region resources/js/components/results/results.tsx
function U({ "data-test": e } = {}) {
	let { query: t, results: n, recent: i, focusedKey: o, setFocusedKey: l, openResult: u, loadMore: d, status: f, pagination: p, instanceId: m } = x(), { t: h } = (0, _.useT)("search"), g = a(null), v = N(n);
	return r(() => {
		let e = g.current;
		if (e === null || p?.hasMore !== !0 || !window.IntersectionObserver) return;
		let t = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && d();
		});
		return t.observe(e), () => t.disconnect();
	}, [d, p?.hasMore]), f === "error" ? /* @__PURE__ */ s("div", {
		"data-test": e,
		className: "p-4 text-sm text-lt-danger",
		children: h("search.error", "Something went wrong.")
	}) : f === "loading" && n.length === 0 ? /* @__PURE__ */ s("div", {
		"data-test": e,
		className: "p-4 text-sm text-lt-muted-fg",
		children: h("search.loading", "Searching…")
	}) : n.length === 0 ? t.trim() === "" && i.length > 0 ? null : /* @__PURE__ */ s("div", {
		"data-test": e,
		className: "p-4 text-sm text-lt-muted-fg",
		children: h("search.empty", "No results found.")
	}) : /* @__PURE__ */ c("div", {
		"data-test": e,
		"aria-activedescendant": o ? `${m}-result-${encodeURIComponent(o)}` : void 0,
		"aria-label": h("search.results", "Results"),
		className: "flex h-full flex-col gap-1 overflow-y-auto p-1 outline-none",
		onKeyDown: v,
		role: "listbox",
		tabIndex: 0,
		id: `${m}-results`,
		children: [n.map((e) => {
			let t = E(e);
			return /* @__PURE__ */ s(z, {
				focused: t === o,
				id: M(m, e),
				onFocus: () => l(t),
				onOpen: () => u(e),
				result: e
			}, t);
		}), p?.hasMore ? /* @__PURE__ */ s("button", {
			ref: g,
			className: "min-h-11 rounded-lt-sm px-3 text-sm text-lt-muted-fg hover:bg-lt-muted/60",
			disabled: f === "loading",
			onClick: d,
			type: "button",
			children: f === "loading" ? h("search.loading", "Searching…") : h("search.load-more", "Load more")
		}) : null]
	});
}
var W = p((() => {
	y(), C(), P(), k(), B();
}));
//#endregion
//#region resources/js/components/search-box/search-palette.tsx
function G() {
	let { query: e } = x();
	return e.trim() === "" ? /* @__PURE__ */ c("div", {
		className: "flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col",
		children: [/* @__PURE__ */ s(F, {}), /* @__PURE__ */ s(V, {})]
	}) : /* @__PURE__ */ c("div", {
		className: "flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col",
		children: [/* @__PURE__ */ s(F, {}), /* @__PURE__ */ c("div", {
			className: "grid min-h-80 flex-1 grid-rows-[auto_1fr] md:grid-cols-[12rem_minmax(0,1fr)_16rem] md:grid-rows-1",
			children: [
				/* @__PURE__ */ s("div", {
					className: "border-b border-lt-border md:border-e md:border-b-0",
					children: /* @__PURE__ */ s(A, {})
				}),
				/* @__PURE__ */ s("div", {
					className: "min-h-0 overflow-hidden",
					children: /* @__PURE__ */ s(U, {})
				}),
				/* @__PURE__ */ s("div", {
					className: "hidden border-s border-lt-border md:block",
					children: /* @__PURE__ */ s(L, {})
				})
			]
		})]
	});
}
function K({ endpoint: e, perPage: t, placeholder: n, title: a, children: o, onClosed: l }) {
	let u = (0, _.useEmbeddedModal)();
	if (!u) throw Error(_.MODAL_MISSING_ERROR);
	let { t: d } = (0, _.useT)("search"), f = O({
		endpoint: e,
		perPage: t
	}), p = i(), m = n ?? d("search.placeholder", "Search…"), h = a ?? d("search.title", "Search"), { refreshRecent: g } = f;
	return r(() => {
		g();
	}, [g]), /* @__PURE__ */ s(_.Dialog, {
		open: u.open,
		onOpenChange: u.onOpenChange,
		children: /* @__PURE__ */ c(_.DialogContent, {
			className: "overflow-hidden p-0",
			onCloseAutoFocus: (e) => {
				u.onExited(e), l?.();
			},
			width: "3xl",
			children: [/* @__PURE__ */ s(_.DialogTitle, {
				className: "sr-only",
				children: h
			}), /* @__PURE__ */ s(b, {
				value: {
					...f,
					instanceId: p,
					placeholder: m
				},
				children: o ?? /* @__PURE__ */ s(G, {})
			})]
		})
	});
}
var q = p((() => {
	y(), C(), k(), j(), I(), R(), H(), W();
}));
//#endregion
//#region resources/js/components/search-box/search-box.tsx
function te(e) {
	return e instanceof HTMLElement ? e.isContentEditable || e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.tagName === "SELECT" : !1;
}
function ne({ endpoint: e, perPage: n, placeholder: i, title: o, shortcut: l = !1, collapsed: u = !1, children: d, "data-test": f }) {
	let { t: p } = (0, _.useT)("search"), m = (0, _.useModal)(), h = a(null), g = i ?? p("search.placeholder", "Search…"), v = t(() => {
		h.current ||= m.open(/* @__PURE__ */ s(K, {
			endpoint: e,
			perPage: n,
			placeholder: i,
			title: o,
			onClosed: () => {
				h.current = null;
			},
			children: d
		}));
	}, [
		d,
		e,
		m,
		n,
		i,
		o
	]);
	return r(() => {
		if (!l) return;
		function e(e) {
			if (!(e.repeat || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k")) {
				if (h.current) {
					e.preventDefault(), h.current.close();
					return;
				}
				te(e.target) || (e.preventDefault(), v());
			}
		}
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [v, l]), /* @__PURE__ */ c("button", {
		...l ? { "aria-keyshortcuts": "Meta+K Control+K" } : {},
		...u ? { "aria-label": g } : {},
		className: u ? "flex size-9 items-center justify-center rounded-lt border border-lt-border bg-lt-bg text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]" : "flex min-h-11 w-full max-w-sm items-center gap-2 rounded-lt border border-lt-border bg-lt-bg px-3 text-sm text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]",
		"data-test": f,
		onClick: v,
		type: "button",
		children: [
			/* @__PURE__ */ s(_.Icon, {
				name: "search",
				"aria-hidden": "true",
				className: "size-lt-icon-sm"
			}),
			u ? null : /* @__PURE__ */ s("span", {
				className: "min-w-0 flex-1 truncate text-start",
				children: g
			}),
			!u && l ? /* @__PURE__ */ s("kbd", {
				className: "rounded-lt-xs border border-lt-border px-1.5 py-0.5 text-xs",
				children: "⌘K"
			}) : null
		]
	});
}
var re = p((() => {
	y(), q();
})), ie = /* @__PURE__ */ m({
	SearchBoxAdapter: () => J,
	default: () => J
}), J, ae = p((() => {
	y(), re(), J = ({ node: e, children: t }) => {
		let { endpoint: n, perPage: r, placeholder: i, shortcut: a, title: o } = e.props, c = (0, _.useCollapsed)();
		return /* @__PURE__ */ s(ne, {
			collapsed: c,
			"data-test": (0, _.nodeIdentity)(e),
			endpoint: n,
			perPage: r,
			placeholder: i,
			shortcut: a,
			title: o,
			children: e.schema?.length ? t : void 0
		});
	};
})), oe = /* @__PURE__ */ m({
	SearchCategoriesAdapter: () => Y,
	default: () => Y
}), Y, se = p((() => {
	y(), j(), Y = ({ node: e }) => /* @__PURE__ */ s(A, { "data-test": (0, _.nodeIdentity)(e) });
})), ce = /* @__PURE__ */ m({
	SearchInputAdapter: () => X,
	default: () => X
}), X, le = p((() => {
	y(), I(), X = ({ node: e }) => /* @__PURE__ */ s(F, { "data-test": (0, _.nodeIdentity)(e) });
})), ue = /* @__PURE__ */ m({
	SearchPreviewAdapter: () => Z,
	default: () => Z
}), Z, de = p((() => {
	y(), R(), Z = ({ node: e }) => /* @__PURE__ */ s(L, { "data-test": (0, _.nodeIdentity)(e) });
})), fe = /* @__PURE__ */ m({
	SearchRecentAdapter: () => Q,
	default: () => Q
}), Q, pe = p((() => {
	y(), H(), Q = ({ node: e }) => /* @__PURE__ */ s(V, { "data-test": (0, _.nodeIdentity)(e) });
})), me = /* @__PURE__ */ m({
	SearchResultsAdapter: () => $,
	default: () => $
}), $, he = p((() => {
	y(), W(), $ = ({ node: e }) => /* @__PURE__ */ s(U, { "data-test": (0, _.nodeIdentity)(e) });
}));
//#endregion
//#region resources/js/plugin.ts
y();
var ge = {
	name: "lattice/search",
	components: {
		"search.box": (0, _.lazyComponent)(() => Promise.resolve().then(() => (ae(), ie))),
		"search.categories": (0, _.lazyComponent)(() => Promise.resolve().then(() => (se(), oe))),
		"search.input": (0, _.lazyComponent)(() => Promise.resolve().then(() => (le(), ce))),
		"search.preview": (0, _.lazyComponent)(() => Promise.resolve().then(() => (de(), ue))),
		"search.recent": (0, _.lazyComponent)(() => Promise.resolve().then(() => (pe(), fe))),
		"search.results": (0, _.lazyComponent)(() => Promise.resolve().then(() => (he(), me)))
	},
	i18n: { namespace: "search" }
};
//#endregion
export { ge as default };
