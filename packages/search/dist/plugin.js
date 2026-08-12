import { createContext as e, useCallback as t, useContext as n, useEffect as r, useId as i, useRef as a, useState as o } from "react";
import { Fragment as s, jsx as c, jsxs as l } from "react/jsx-runtime";
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
//#region resources/js/context.tsx
function x({ value: e, children: t }) {
	return /* @__PURE__ */ c(C.Provider, {
		value: e,
		children: t
	});
}
function S() {
	let e = n(C);
	if (e === null) throw Error("useSearchContext must be used within a SearchBox.");
	return e;
}
var C, w = m((() => {
	C = e(null);
})), T = m((() => {}));
//#endregion
//#region resources/js/use-search.ts
function E(e, t) {
	let n = new URLSearchParams(t).toString();
	return n === "" ? e : `${e}${e.includes("?") ? "&" : "?"}${n}`;
}
function D(e) {
	return `${e.category.name}:${e.item.id}`;
}
function O(e) {
	return e instanceof Error && e.name === "AbortError";
}
function k({ endpoint: e, perPage: n = 20 }) {
	let { visit: i } = (0, v.useNavigation)(), [s, c] = o(""), [l, u] = o([]), [d, f] = o(null), [p, m] = o([]), [h, g] = o([]), [_, y] = o(null), [b, x] = o("idle"), [S, C] = o(null), [w, T] = o(null), k = a(null), A = a(null), j = a(0), M = a(null), N = t(async (t, r, i, a) => {
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
			let l = await (0, v.apiJson)(E(e, c), { signal: o.signal });
			if (s !== j.current) return;
			u(l.categories), f(l.state.category), y(l.pagination), m((e) => a ? [...e, ...l.data] : l.data), a || T(l.data[0] ? D(l.data[0]) : null), x("success");
		} catch (e) {
			if (O(e)) return;
			C(e instanceof Error ? e.message : String(e)), x("error");
		}
	}, [e, n]), P = t((e) => {
		if (c(e), T(null), m([]), y(null), k.current?.abort(), j.current += 1, M.current !== null && clearTimeout(M.current), e.trim() === "") {
			x("idle"), C(null);
			return;
		}
		x("loading"), M.current = setTimeout(() => {
			N(e, d, 1, !1);
		}, 250);
	}, [d, N]), F = t((e) => {
		f(e), T(null), N(s, e, 1, !1);
	}, [s, N]), I = t(() => {
		_?.nextPage !== null && _ !== null && b !== "loading" && N(s, d, _.nextPage, !0);
	}, [
		d,
		_,
		s,
		N,
		b
	]), L = t(async () => {
		A.current?.abort();
		let t = new AbortController();
		A.current = t;
		try {
			let r = await (0, v.apiJson)(E(e, {
				recent: "1",
				per_page: String(n)
			}), { signal: t.signal });
			g(r.data);
		} catch (e) {
			O(e) || g([]);
		}
	}, [e, n]), R = t(async (t) => {
		try {
			let n = await (0, v.apiJson)(e, {
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
		pagination: _,
		status: b,
		error: S,
		focusedKey: w,
		setFocusedKey: T,
		loadMore: I,
		openResult: (e) => void R(e),
		refreshRecent: () => void L()
	};
}
var A = m((() => {
	b(), T();
})), j = /* @__PURE__ */ h({ default: () => M }), M, N = m((() => {
	b(), w(), M = () => {
		let { categories: e, activeCategory: t, setCategory: n } = S();
		return /* @__PURE__ */ c("div", {
			className: "flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-x-visible",
			children: e.map((e) => /* @__PURE__ */ l("button", {
				"aria-pressed": e.name === t,
				className: (0, v.cn)("flex min-h-11 shrink-0 items-center justify-between gap-2 rounded-lt-sm px-3 text-start text-sm md:w-full", e.name === t ? "bg-lt-muted text-lt-fg" : "text-lt-muted-fg hover:bg-lt-muted/60"),
				onClick: () => n(e.name),
				type: "button",
				children: [/* @__PURE__ */ l("span", {
					className: "flex min-w-0 items-center gap-2",
					children: [e.icon ? /* @__PURE__ */ c(v.Icon, {
						name: e.icon,
						"aria-hidden": "true",
						className: "size-lt-icon-sm"
					}) : null, /* @__PURE__ */ c("span", {
						className: "truncate",
						children: e.label
					})]
				}), e.count === null ? null : /* @__PURE__ */ c("span", {
					className: "text-xs tabular-nums text-lt-muted-fg",
					children: e.count
				})]
			}, e.name))
		});
	};
}));
//#endregion
//#region resources/js/use-result-keyboard.ts
function P(e, t) {
	return `${e}-result-${encodeURIComponent(D(t))}`;
}
function F(e) {
	let { focusedKey: n, setFocusedKey: r, openResult: i } = S();
	return t((t) => {
		if (e.length === 0) return;
		let a = e.findIndex((e) => D(e) === n);
		if (t.key === "ArrowDown") {
			t.preventDefault();
			let n = e[Math.min(e.length - 1, a + 1)];
			r(n ? D(n) : null);
		} else if (t.key === "ArrowUp") {
			t.preventDefault();
			let n = e[a < 0 ? e.length - 1 : Math.max(0, a - 1)];
			r(n ? D(n) : null);
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
var I = m((() => {
	w(), A();
})), L = /* @__PURE__ */ h({ default: () => R }), R, z = m((() => {
	b(), w(), I(), A(), R = () => {
		let { placeholder: e, query: t, setQuery: n, results: r, recent: i, focusedKey: a, instanceId: o } = S(), s = r.length > 0 ? r : t.trim() === "" ? i : [], u = F(s), d = s.find((e) => D(e) === a);
		return /* @__PURE__ */ l("div", {
			className: "flex min-h-12 items-center gap-2 border-b border-lt-border px-4",
			children: [/* @__PURE__ */ c(v.Icon, {
				name: "search",
				"aria-hidden": "true",
				className: "size-lt-icon-md text-lt-muted-fg"
			}), /* @__PURE__ */ c("input", {
				"aria-activedescendant": d ? P(o, d) : void 0,
				"aria-controls": s.length > 0 ? `${o}-${r.length > 0 ? "results" : "recent"}` : void 0,
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
})), ee = /* @__PURE__ */ h({ default: () => B }), B, V = m((() => {
	b(), w(), A(), B = () => {
		let { results: e, recent: t, focusedKey: n, openResult: r } = S(), { t: i } = (0, v.useT)("search"), a = [...e, ...t].find((e) => D(e) === n);
		if (!a) return /* @__PURE__ */ c("div", {
			className: "p-4 text-sm text-lt-muted-fg",
			children: i("search.preview-empty", "Select a result to preview.")
		});
		let o = [a.item.subtitle, a.item.additionalInfo].filter((e) => e !== null && e !== "").join(" · ");
		return /* @__PURE__ */ l("div", {
			className: "flex flex-col gap-4 p-4",
			children: [/* @__PURE__ */ l("div", {
				className: "grid gap-1",
				children: [
					/* @__PURE__ */ c("span", {
						className: "text-base font-semibold text-lt-fg",
						children: a.item.title
					}),
					o === "" ? null : /* @__PURE__ */ c("span", {
						className: "text-sm text-lt-muted-fg",
						children: o
					}),
					a.item.badge ? /* @__PURE__ */ c("span", {
						className: "w-fit rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg",
						children: a.item.badge
					}) : null
				]
			}), /* @__PURE__ */ c(v.Button, {
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
	return /* @__PURE__ */ l("button", {
		"aria-selected": t,
		className: (0, v.cn)("flex min-h-11 w-full items-center gap-3 rounded-lt-sm px-3 py-2 text-start", t ? "bg-lt-muted" : "hover:bg-lt-muted/60"),
		"data-test": `search-result-${e.category.name}-${e.item.id}`,
		id: i,
		onClick: n,
		onFocus: r,
		onMouseEnter: r,
		role: "option",
		tabIndex: a,
		type: "button",
		children: [/* @__PURE__ */ l("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ l("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ c("span", {
					className: "truncate text-sm font-medium text-lt-fg",
					children: e.item.title
				}), e.item.badge ? /* @__PURE__ */ c("span", {
					className: "rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg",
					children: e.item.badge
				}) : null]
			}), o === "" ? null : /* @__PURE__ */ c("span", {
				className: "block truncate text-xs text-lt-muted-fg",
				children: o
			})]
		}), t ? /* @__PURE__ */ c(v.Icon, {
			name: "arrow-down",
			"aria-hidden": "true",
			className: "size-lt-icon-sm -rotate-90 text-lt-muted-fg"
		}) : null]
	});
}
var W = m((() => {
	b();
})), G = /* @__PURE__ */ h({ default: () => K }), K, q = m((() => {
	b(), w(), I(), A(), W(), K = () => {
		let { query: e, results: t, recent: n, focusedKey: r, setFocusedKey: i, openResult: a, instanceId: o } = S(), { t: s } = (0, v.useT)("search"), u = F(n);
		return e.trim() !== "" || t.length > 0 || n.length === 0 ? null : /* @__PURE__ */ l("div", {
			"aria-label": s("search.recent", "Recent"),
			className: "flex max-h-full flex-col gap-1 overflow-y-auto p-1",
			id: `${o}-recent`,
			onKeyDown: u,
			role: "listbox",
			children: [/* @__PURE__ */ c("span", {
				className: "px-3 py-1 text-xs font-medium uppercase tracking-wide text-lt-muted-fg",
				children: s("search.recent", "Recent")
			}), n.map((e) => {
				let t = D(e);
				return /* @__PURE__ */ c(U, {
					focused: t === r,
					id: P(o, e),
					onFocus: () => i(t),
					onOpen: () => a(e),
					result: e,
					tabIndex: 0
				}, t);
			})]
		});
	};
})), J = /* @__PURE__ */ h({ default: () => Y }), Y, X = m((() => {
	b(), w(), I(), A(), W(), Y = () => {
		let { query: e, results: t, recent: n, focusedKey: i, setFocusedKey: o, openResult: s, loadMore: u, status: d, pagination: f, instanceId: p } = S(), { t: m } = (0, v.useT)("search"), h = a(null), g = F(t);
		return r(() => {
			let e = h.current;
			if (e === null || f?.hasMore !== !0 || !window.IntersectionObserver) return;
			let t = new IntersectionObserver((e) => {
				e.some((e) => e.isIntersecting) && u();
			});
			return t.observe(e), () => t.disconnect();
		}, [u, f?.hasMore]), d === "error" ? /* @__PURE__ */ c("div", {
			className: "p-4 text-sm text-lt-danger",
			children: m("search.error", "Something went wrong.")
		}) : d === "loading" && t.length === 0 ? /* @__PURE__ */ c("div", {
			className: "p-4 text-sm text-lt-muted-fg",
			children: m("search.loading", "Searching…")
		}) : t.length === 0 ? e.trim() === "" && n.length > 0 ? null : /* @__PURE__ */ c("div", {
			className: "p-4 text-sm text-lt-muted-fg",
			children: m("search.empty", "No results found.")
		}) : /* @__PURE__ */ l("div", {
			"aria-activedescendant": i ? `${p}-result-${encodeURIComponent(i)}` : void 0,
			"aria-label": m("search.results", "Results"),
			className: "flex h-full flex-col gap-1 overflow-y-auto p-1 outline-none",
			onKeyDown: g,
			role: "listbox",
			tabIndex: 0,
			id: `${p}-results`,
			children: [t.map((e) => {
				let t = D(e);
				return /* @__PURE__ */ c(U, {
					focused: t === i,
					id: P(p, e),
					onFocus: () => o(t),
					onOpen: () => s(e),
					result: e
				}, t);
			}), f?.hasMore ? /* @__PURE__ */ c("button", {
				ref: h,
				className: "min-h-11 rounded-lt-sm px-3 text-sm text-lt-muted-fg hover:bg-lt-muted/60",
				disabled: d === "loading",
				onClick: u,
				type: "button",
				children: d === "loading" ? m("search.loading", "Searching…") : m("search.load-more", "Load more")
			}) : null]
		});
	};
})), Z = /* @__PURE__ */ h({ default: () => $ });
function Q(e) {
	return {
		type: e,
		props: {}
	};
}
function te(e) {
	return e instanceof HTMLElement ? e.isContentEditable || e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.tagName === "SELECT" : !1;
}
function ne() {
	return /* @__PURE__ */ l("div", {
		className: "flex h-[min(36rem,calc(100dvh-2rem))] flex-col",
		children: [/* @__PURE__ */ c(R, {
			node: Q("search.input"),
			children: null
		}), /* @__PURE__ */ l("div", {
			className: "grid min-h-0 flex-1 grid-rows-[auto_1fr] md:grid-cols-[12rem_minmax(0,1fr)_16rem] md:grid-rows-1",
			children: [
				/* @__PURE__ */ c("div", {
					className: "border-b border-lt-border md:border-e md:border-b-0",
					children: /* @__PURE__ */ c(M, {
						node: Q("search.categories"),
						children: null
					})
				}),
				/* @__PURE__ */ l("div", {
					className: "min-h-0 overflow-hidden",
					children: [/* @__PURE__ */ c(K, {
						node: Q("search.recent"),
						children: null
					}), /* @__PURE__ */ c(Y, {
						node: Q("search.results"),
						children: null
					})]
				}),
				/* @__PURE__ */ c("div", {
					className: "hidden border-s border-lt-border md:block",
					children: /* @__PURE__ */ c(B, {
						node: Q("search.preview"),
						children: null
					})
				})
			]
		})]
	});
}
var $, re = m((() => {
	b(), w(), A(), N(), z(), V(), q(), X(), $ = ({ node: e, children: t }) => {
		let { endpoint: n, placeholder: a, title: u, shortcut: d, perPage: f } = e.props, { t: p } = (0, v.useT)("search"), [m, h] = o(!1), g = i(), _ = k({
			endpoint: n,
			perPage: f
		}), y = a ?? p("search.placeholder", "Search…"), b = u ?? p("search.title", "Search");
		r(() => {
			if (!d) return;
			function e(e) {
				!e.repeat && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !te(e.target) && (e.preventDefault(), h((e) => !e));
			}
			return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
		}, [d]);
		let { refreshRecent: S } = _;
		r(() => {
			m && S();
		}, [m, S]);
		let C = e.schema?.length ? t : t ?? /* @__PURE__ */ c(ne, {});
		return /* @__PURE__ */ l(s, { children: [/* @__PURE__ */ l("button", {
			...d ? { "aria-keyshortcuts": "Meta+K Control+K" } : {},
			className: "flex min-h-11 w-full max-w-sm items-center gap-2 rounded-lt border border-lt-border bg-lt-bg px-3 text-sm text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]",
			"data-test": "search-trigger",
			onClick: () => h(!0),
			type: "button",
			children: [
				/* @__PURE__ */ c(v.Icon, {
					name: "search",
					"aria-hidden": "true",
					className: "size-lt-icon-sm"
				}),
				/* @__PURE__ */ c("span", {
					className: "min-w-0 flex-1 truncate text-start",
					children: y
				}),
				d ? /* @__PURE__ */ c("kbd", {
					className: "rounded-lt-xs border border-lt-border px-1.5 py-0.5 text-xs",
					children: "⌘K"
				}) : null
			]
		}), /* @__PURE__ */ c(v.Dialog, {
			open: m,
			onOpenChange: h,
			children: /* @__PURE__ */ l(v.DialogContent, {
				className: "overflow-hidden p-0",
				width: "3xl",
				children: [/* @__PURE__ */ c(v.DialogTitle, {
					className: "sr-only",
					children: b
				}), /* @__PURE__ */ c(x, {
					value: {
						..._,
						instanceId: g,
						placeholder: y
					},
					children: C
				})]
			})
		})] });
	};
}));
//#endregion
//#region resources/js/plugin.ts
b();
var ie = {
	name: "lattice/search",
	components: {
		"search.box": (0, v.lazyComponent)(() => Promise.resolve().then(() => (re(), Z))),
		"search.categories": (0, v.lazyComponent)(() => Promise.resolve().then(() => (N(), j))),
		"search.input": (0, v.lazyComponent)(() => Promise.resolve().then(() => (z(), L))),
		"search.preview": (0, v.lazyComponent)(() => Promise.resolve().then(() => (V(), ee))),
		"search.recent": (0, v.lazyComponent)(() => Promise.resolve().then(() => (q(), G))),
		"search.results": (0, v.lazyComponent)(() => Promise.resolve().then(() => (X(), J)))
	},
	i18n: { namespace: "search" }
};
//#endregion
export { ie as default };
