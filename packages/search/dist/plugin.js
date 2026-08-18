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
})), A = /* @__PURE__ */ m({ default: () => j }), j, M = p((() => {
	y(), C(), j = () => {
		let { categories: e, activeCategory: t, setCategory: n } = x();
		return /* @__PURE__ */ s("div", {
			className: "flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-x-visible",
			children: e.map((e) => /* @__PURE__ */ c("button", {
				"aria-pressed": e.name === t,
				className: (0, _.cn)("flex min-h-11 shrink-0 items-center justify-between gap-2 rounded-lt-sm px-3 text-start text-sm md:w-full", e.name === t ? "bg-lt-muted text-lt-fg" : "text-lt-muted-fg hover:bg-lt-muted/60"),
				onClick: () => n(e.name),
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
	};
}));
//#endregion
//#region resources/js/use-result-keyboard.ts
function N(e, t) {
	return `${e}-result-${encodeURIComponent(E(t))}`;
}
function P(e) {
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
var F = p((() => {
	C(), k();
})), I = /* @__PURE__ */ m({ default: () => L }), L, R = p((() => {
	y(), C(), F(), k(), L = () => {
		let { placeholder: e, query: t, setQuery: n, results: r, recent: i, focusedKey: a, instanceId: o } = x(), l = r.length > 0 ? r : t.trim() === "" ? i : [], u = P(l), d = l.find((e) => E(e) === a);
		return /* @__PURE__ */ c("div", {
			className: "flex min-h-12 items-center gap-2 border-b border-lt-border px-4",
			children: [/* @__PURE__ */ s(_.Icon, {
				name: "search",
				"aria-hidden": "true",
				className: "size-lt-icon-md text-lt-muted-fg"
			}), /* @__PURE__ */ s("input", {
				"aria-activedescendant": d ? N(o, d) : void 0,
				"aria-controls": l.length > 0 ? `${o}-${r.length > 0 ? "results" : "recent"}` : void 0,
				"aria-label": e,
				autoFocus: !0,
				className: "min-h-11 w-full bg-transparent text-sm text-lt-fg outline-none placeholder:text-lt-muted-fg",
				onChange: (e) => n(e.target.value),
				onKeyDown: u,
				placeholder: e,
				type: "search",
				value: t
			})]
		});
	};
})), z = /* @__PURE__ */ m({ default: () => B }), B, V = p((() => {
	y(), C(), k(), B = () => {
		let { results: e, recent: t, focusedKey: n, openResult: r } = x(), { t: i } = (0, _.useT)("search"), a = [...e, ...t].find((e) => E(e) === n);
		if (!a) return /* @__PURE__ */ s("div", {
			className: "p-4 text-sm text-lt-muted-fg",
			children: i("search.preview-empty", "Select a result to preview.")
		});
		let o = [a.item.subtitle, a.item.additionalInfo].filter((e) => e !== null && e !== "").join(" · ");
		return /* @__PURE__ */ c("div", {
			className: "flex flex-col gap-4 p-4",
			children: [/* @__PURE__ */ c("div", {
				className: "grid gap-1",
				children: [
					/* @__PURE__ */ s("span", {
						className: "text-base font-semibold text-lt-fg",
						children: a.item.title
					}),
					o === "" ? null : /* @__PURE__ */ s("span", {
						className: "text-sm text-lt-muted-fg",
						children: o
					}),
					a.item.badge ? /* @__PURE__ */ s("span", {
						className: "w-fit rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg",
						children: a.item.badge
					}) : null
				]
			}), /* @__PURE__ */ s(_.Button, {
				emphasis: "outline",
				onClick: () => r(a),
				variant: "secondary",
				children: i("search.open", "Open")
			})]
		});
	};
}));
//#endregion
//#region resources/js/components/result-row.tsx
function H(e) {
	return [e.item.subtitle, e.item.additionalInfo].filter((e) => e !== null && e !== "").join(" · ");
}
function U({ result: e, focused: t, onOpen: n, onFocus: r, id: i, tabIndex: a = -1 }) {
	let o = H(e);
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
var W = p((() => {
	y();
})), G = /* @__PURE__ */ m({ default: () => K }), K, q = p((() => {
	y(), C(), F(), k(), W(), K = () => {
		let { query: e, results: t, recent: n, focusedKey: r, setFocusedKey: i, openResult: a, instanceId: o } = x(), { t: l } = (0, _.useT)("search"), u = P(n);
		return e.trim() !== "" || t.length > 0 || n.length === 0 ? null : /* @__PURE__ */ c("div", {
			"aria-label": l("search.recent", "Recent"),
			className: "flex max-h-full flex-col gap-1 overflow-y-auto p-1",
			id: `${o}-recent`,
			onKeyDown: u,
			role: "listbox",
			children: [/* @__PURE__ */ s("span", {
				className: "px-3 py-1 text-xs font-medium uppercase tracking-wide text-lt-muted-fg",
				children: l("search.recent", "Recent")
			}), n.map((e) => {
				let t = E(e);
				return /* @__PURE__ */ s(U, {
					focused: t === r,
					id: N(o, e),
					onFocus: () => i(t),
					onOpen: () => a(e),
					result: e,
					tabIndex: 0
				}, t);
			})]
		});
	};
})), J = /* @__PURE__ */ m({ default: () => Y }), Y, X = p((() => {
	y(), C(), F(), k(), W(), Y = () => {
		let { query: e, results: t, recent: n, focusedKey: i, setFocusedKey: o, openResult: l, loadMore: u, status: d, pagination: f, instanceId: p } = x(), { t: m } = (0, _.useT)("search"), h = a(null), g = P(t);
		return r(() => {
			let e = h.current;
			if (e === null || f?.hasMore !== !0 || !window.IntersectionObserver) return;
			let t = new IntersectionObserver((e) => {
				e.some((e) => e.isIntersecting) && u();
			});
			return t.observe(e), () => t.disconnect();
		}, [u, f?.hasMore]), d === "error" ? /* @__PURE__ */ s("div", {
			className: "p-4 text-sm text-lt-danger",
			children: m("search.error", "Something went wrong.")
		}) : d === "loading" && t.length === 0 ? /* @__PURE__ */ s("div", {
			className: "p-4 text-sm text-lt-muted-fg",
			children: m("search.loading", "Searching…")
		}) : t.length === 0 ? e.trim() === "" && n.length > 0 ? null : /* @__PURE__ */ s("div", {
			className: "p-4 text-sm text-lt-muted-fg",
			children: m("search.empty", "No results found.")
		}) : /* @__PURE__ */ c("div", {
			"aria-activedescendant": i ? `${p}-result-${encodeURIComponent(i)}` : void 0,
			"aria-label": m("search.results", "Results"),
			className: "flex h-full flex-col gap-1 overflow-y-auto p-1 outline-none",
			onKeyDown: g,
			role: "listbox",
			tabIndex: 0,
			id: `${p}-results`,
			children: [t.map((e) => {
				let t = E(e);
				return /* @__PURE__ */ s(U, {
					focused: t === i,
					id: N(p, e),
					onFocus: () => o(t),
					onOpen: () => l(e),
					result: e
				}, t);
			}), f?.hasMore ? /* @__PURE__ */ s("button", {
				ref: h,
				className: "min-h-11 rounded-lt-sm px-3 text-sm text-lt-muted-fg hover:bg-lt-muted/60",
				disabled: d === "loading",
				onClick: u,
				type: "button",
				children: d === "loading" ? m("search.loading", "Searching…") : m("search.load-more", "Load more")
			}) : null]
		});
	};
}));
//#endregion
//#region resources/js/components/search-palette.tsx
function Z(e) {
	return {
		type: e,
		props: {}
	};
}
function Q() {
	let { query: e } = x();
	return e.trim() === "" ? /* @__PURE__ */ c("div", {
		className: "flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col",
		children: [/* @__PURE__ */ s(L, {
			node: Z("search.input"),
			children: null
		}), /* @__PURE__ */ s(K, {
			node: Z("search.recent"),
			children: null
		})]
	}) : /* @__PURE__ */ c("div", {
		className: "flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col",
		children: [/* @__PURE__ */ s(L, {
			node: Z("search.input"),
			children: null
		}), /* @__PURE__ */ c("div", {
			className: "grid min-h-80 flex-1 grid-rows-[auto_1fr] md:grid-cols-[12rem_minmax(0,1fr)_16rem] md:grid-rows-1",
			children: [
				/* @__PURE__ */ s("div", {
					className: "border-b border-lt-border md:border-e md:border-b-0",
					children: /* @__PURE__ */ s(j, {
						node: Z("search.categories"),
						children: null
					})
				}),
				/* @__PURE__ */ s("div", {
					className: "min-h-0 overflow-hidden",
					children: /* @__PURE__ */ s(Y, {
						node: Z("search.results"),
						children: null
					})
				}),
				/* @__PURE__ */ s("div", {
					className: "hidden border-s border-lt-border md:block",
					children: /* @__PURE__ */ s(B, {
						node: Z("search.preview"),
						children: null
					})
				})
			]
		})]
	});
}
function ee({ node: e, children: t, onClosed: n }) {
	let a = (0, _.useEmbeddedModal)();
	if (!a) throw Error(_.MODAL_HOST_MISSING_ERROR);
	let { endpoint: o, perPage: l, placeholder: u, title: d } = e.props, { t: f } = (0, _.useT)("search"), p = O({
		endpoint: o,
		perPage: l
	}), m = i(), h = u ?? f("search.placeholder", "Search…"), g = d ?? f("search.title", "Search"), v = e.schema?.length ? t : t ?? /* @__PURE__ */ s(Q, {}), { refreshRecent: y } = p;
	return r(() => {
		y();
	}, [y]), /* @__PURE__ */ s(_.Dialog, {
		open: a.open,
		onOpenChange: a.onOpenChange,
		children: /* @__PURE__ */ c(_.DialogContent, {
			className: "overflow-hidden p-0",
			onCloseAutoFocus: (e) => {
				a.onExited(e), n();
			},
			width: "3xl",
			children: [/* @__PURE__ */ s(_.DialogTitle, {
				className: "sr-only",
				children: g
			}), /* @__PURE__ */ s(b, {
				value: {
					...p,
					instanceId: m,
					placeholder: h
				},
				children: v
			})]
		})
	});
}
var te = p((() => {
	y(), C(), k(), M(), R(), V(), q(), X();
})), ne = /* @__PURE__ */ m({ default: () => $ });
function re(e) {
	return e instanceof HTMLElement ? e.isContentEditable || e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.tagName === "SELECT" : !1;
}
var $, ie = p((() => {
	y(), te(), $ = ({ node: e, children: n }) => {
		let { placeholder: i, shortcut: o } = e.props, { t: l } = (0, _.useT)("search"), u = (0, _.useCollapsed)(), d = (0, _.useModalHost)(), f = a(null), p = i ?? l("search.placeholder", "Search…"), m = t(() => {
			f.current ||= d.open(/* @__PURE__ */ s(ee, {
				node: e,
				onClosed: () => {
					f.current = null;
				},
				children: n
			}));
		}, [
			n,
			d,
			e
		]);
		return r(() => {
			if (!o) return;
			function e(e) {
				if (!(e.repeat || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k")) {
					if (f.current) {
						e.preventDefault(), f.current.close();
						return;
					}
					re(e.target) || (e.preventDefault(), m());
				}
			}
			return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
		}, [m, o]), /* @__PURE__ */ c("button", {
			...o ? { "aria-keyshortcuts": "Meta+K Control+K" } : {},
			...u ? { "aria-label": p } : {},
			className: u ? "flex size-9 items-center justify-center rounded-lt border border-lt-border bg-lt-bg text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]" : "flex min-h-11 w-full max-w-sm items-center gap-2 rounded-lt border border-lt-border bg-lt-bg px-3 text-sm text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]",
			"data-test": "search-trigger",
			onClick: m,
			type: "button",
			children: [
				/* @__PURE__ */ s(_.Icon, {
					name: "search",
					"aria-hidden": "true",
					className: "size-lt-icon-sm"
				}),
				u ? null : /* @__PURE__ */ s("span", {
					className: "min-w-0 flex-1 truncate text-start",
					children: p
				}),
				!u && o ? /* @__PURE__ */ s("kbd", {
					className: "rounded-lt-xs border border-lt-border px-1.5 py-0.5 text-xs",
					children: "⌘K"
				}) : null
			]
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
y();
var ae = {
	name: "lattice/search",
	components: {
		"search.box": (0, _.lazyComponent)(() => Promise.resolve().then(() => (ie(), ne))),
		"search.categories": (0, _.lazyComponent)(() => Promise.resolve().then(() => (M(), A))),
		"search.input": (0, _.lazyComponent)(() => Promise.resolve().then(() => (R(), I))),
		"search.preview": (0, _.lazyComponent)(() => Promise.resolve().then(() => (V(), z))),
		"search.recent": (0, _.lazyComponent)(() => Promise.resolve().then(() => (q(), G))),
		"search.results": (0, _.lazyComponent)(() => Promise.resolve().then(() => (X(), J)))
	},
	i18n: { namespace: "search" }
};
//#endregion
export { ae as default };
