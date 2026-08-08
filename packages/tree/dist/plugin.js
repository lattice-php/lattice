import { createContext as e, useCallback as t, useContext as n, useEffect as r, useMemo as i, useRef as a, useState as o, useSyncExternalStore as s } from "react";
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
//#region resources/js/tree-context.tsx
function x(e, t, n) {
	e.children.set(t, n.map((e) => e.id)), e.loaded.add(t);
	for (let r of n) e.nodes.set(r.id, {
		...r,
		children: []
	}), e.parents.set(r.id, t === "" ? null : t), r.children.length > 0 && x(e, r.id, r.children);
}
function ee(e, t) {
	let n = {
		children: /* @__PURE__ */ new Map(),
		loaded: /* @__PURE__ */ new Set(),
		nodes: /* @__PURE__ */ new Map(),
		parents: /* @__PURE__ */ new Map()
	};
	return x(n, "", e), t || n.loaded.delete(""), n;
}
function te(e, t, n) {
	let r = {
		children: new Map(e.children),
		loaded: new Set(e.loaded),
		nodes: new Map(e.nodes),
		parents: new Map(e.parents)
	};
	return x(r, t, n), r;
}
function S(e, t, n) {
	let r = e.parents.get(n);
	for (; r != null;) {
		if (r === t) return !0;
		r = e.parents.get(r);
	}
	return !1;
}
function ne(e, t) {
	let n = e.nodes.get(t.nodeId), r = t.parentId === null ? null : e.nodes.get(t.parentId);
	if (!n || n.disabled === !0 || t.parentId !== null && !r || r?.disabled === !0 || t.nodeId === t.parentId || t.parentId !== null && S(e, t.nodeId, t.parentId)) return null;
	let i = e.parents.get(t.nodeId) ?? null, a = i ?? "", o = t.parentId ?? "", s = e.children.get(a) ?? [], c = s.indexOf(t.nodeId);
	if (c === -1) return null;
	let l = {
		children: new Map(e.children),
		loaded: new Set(e.loaded),
		nodes: new Map(e.nodes),
		parents: new Map(e.parents)
	}, u = s.filter((e) => e !== t.nodeId), d = a === o ? u : [...e.children.get(o) ?? []], f = Math.max(0, Math.min(t.position, d.length));
	return a === o && c === f ? null : (d.splice(f, 0, t.nodeId), l.children.set(a, u), l.children.set(o, d), l.loaded.add(o), l.parents.set(t.nodeId, t.parentId), i !== null && u.length === 0 && l.nodes.set(i, {
		...e.nodes.get(i),
		hasChildren: !1
	}), t.parentId !== null && l.nodes.set(t.parentId, {
		...r,
		hasChildren: !0
	}), l);
}
function C(e) {
	let t = e, n = /* @__PURE__ */ new Set();
	return {
		getState: () => t,
		setState: (e) => {
			t = {
				...t,
				...e
			}, n.forEach((e) => e());
		},
		subscribe: (e) => (n.add(e), () => {
			n.delete(e);
		})
	};
}
function re() {
	return n(k);
}
function w(e) {
	let t = JSON.parse(e);
	if (!Array.isArray(t)) throw Error("expected an array of ids");
	return new Set(t.filter((e) => typeof e == "string"));
}
function T(e) {
	return [...e.values()].sort((e, t) => e.orderPath.localeCompare(t.orderPath));
}
async function E(e, t, n) {
	let r = e.props.endpoint;
	return !r || (0, v.runAction)(() => (0, v.apiFetch)(r, {
		body: JSON.stringify(t),
		headers: { "Content-Type": "application/json" },
		method: e.props.method ?? "post",
		ref: e.props.ref ?? "",
		throwOnError: !1
	}), n);
}
function D({ activeId: e, activePath: n, defaultExpanded: c, endpoint: l, componentRef: u, lazy: d, nodes: f, moveAction: p, rememberState: m, revision: h, selectAction: g, storageKey: _ }) {
	let [y, b] = (0, v.usePersistentState)(_, () => new Set(c), {
		enabled: m,
		parse: w,
		serialize: (e) => JSON.stringify([...e])
	}), [x, re] = o(() => f[0]?.id ?? null), [D, O] = o(/* @__PURE__ */ new Set()), [k] = o(() => C({
		activeId: e,
		graph: ee(f, !(d && f.length === 0)),
		moving: !1
	})), { activeId: j, graph: M, moving: ie } = s(k.subscribe, k.getState), N = a(/* @__PURE__ */ new Map()), P = a({
		text: "",
		timestamp: 0
	}), F = a(/* @__PURE__ */ new Map()), I = a(0), L = a(null), R = a(0), z = a({
		nodes: f,
		revision: h
	}), B = (0, v.useEffectDispatcher)(), V = l !== null && l !== "", H = p !== null;
	r(() => {
		R.current += 1, k.setState({ activeId: e });
	}, [e, k]), r(() => {
		(z.current.nodes !== f || z.current.revision !== h) && (z.current = {
			nodes: f,
			revision: h
		}, I.current += 1, F.current.clear(), k.setState({ graph: ee(f, !(d && f.length === 0)) }), O(/* @__PURE__ */ new Set()));
	}, [
		d,
		f,
		h,
		k
	]);
	let U = t((e) => {
		b((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		});
	}, [b]), W = t((e) => b((t) => new Set(t).add(e)), [b]), G = t((e) => {
		let t = k.getState().activeId, n = ++R.current;
		k.setState({ activeId: e }), g && E(g, { nodeId: e }, B).then((e) => {
			!e && R.current === n && k.setState({ activeId: t });
		});
	}, [
		B,
		g,
		k
	]), K = t((e) => {
		re(e);
		let t = [...N.current.values()].find((t) => t.id === e);
		t?.ref.current ? (L.current = null, t.ref.current.focus()) : L.current = e;
	}, []), q = t((e) => {
		N.current.set(e.path, e), L.current === e.id && (L.current = null, e.ref.current?.focus());
	}, []), ae = t((e) => {
		N.current.delete(e);
	}, []), J = t((e, t) => {
		let n = T(N.current);
		if (n.length === 0) return;
		let r = n.findIndex((t) => t.id === e), i = r === -1 ? void 0 : n[r], a;
		switch (t) {
			case "next":
				a = r === -1 ? void 0 : n[r + 1];
				break;
			case "prev":
				a = r === -1 ? void 0 : n[r - 1];
				break;
			case "first":
				a = n[0];
				break;
			case "last":
				a = n[n.length - 1];
				break;
			case "parent":
				a = i ? n.find((e) => e.path === i.parentPath) : void 0;
				break;
			case "firstChild": a = i ? n.find((e) => e.parentPath === i.path) : void 0;
		}
		a && K(a.id);
	}, [K]), Y = t((e, t) => {
		let n = T(N.current);
		if (n.length === 0) return;
		let r = Date.now(), i = P.current, a = r - i.timestamp > A ? t : i.text + t;
		P.current = {
			text: a,
			timestamp: r
		};
		let o = a.toLowerCase(), s = n.findIndex((t) => t.id === e), c = s === -1 ? 0 : s;
		for (let e = 1; e <= n.length; e++) {
			let t = n[(c + e) % n.length];
			if (t.label.toLowerCase().startsWith(o)) {
				K(t.id);
				return;
			}
		}
	}, [K]), X = t((e) => {
		if (!V || k.getState().graph.loaded.has(e)) return Promise.resolve();
		let t = F.current.get(e);
		if (t) return t;
		let n = I.current;
		O((t) => new Set(t).add(e));
		let r = (0, v.apiJson)(`${l}?parent=${encodeURIComponent(e)}`, { ref: u ?? "" }).then(({ nodes: t }) => {
			n === I.current && k.setState({ graph: te(k.getState().graph, e, t) });
		}).catch(() => {
			n === I.current && b((t) => {
				let n = new Set(t);
				return n.delete(e), n;
			});
		}).finally(() => {
			n === I.current && (F.current.delete(e), O((t) => {
				let n = new Set(t);
				return n.delete(e), n;
			}));
		});
		return F.current.set(e, r), r;
	}, [
		V,
		u,
		l,
		b,
		k
	]), oe = t((e) => M.children.get(e)?.map((e) => M.nodes.get(e)), [M]), Z = t((e) => k.getState().graph.children.get(e ?? "")?.length ?? 0, [k]), Q = t((e) => k.getState().graph.parents.get(e) ?? null, [k]), $ = t((e) => {
		let t = k.getState().graph, n = t.parents.get(e) ?? null;
		return t.children.get(n ?? "")?.indexOf(e) ?? -1;
	}, [k]), se = t((e, t) => {
		let n = k.getState().graph, r = n.nodes.get(e), i = n.nodes.get(t);
		return !!(r && i && r.disabled !== !0 && i.disabled !== !0 && e !== t && !S(n, e, t));
	}, [k]), ce = t(async (e) => {
		if (!p || k.getState().moving) return !1;
		let t = k.getState().graph, n = ne(t, e);
		if (!n) return !1;
		let r = I.current;
		k.setState({
			graph: n,
			moving: !0
		}), K(e.nodeId);
		let i = await E(p, e, B);
		return !i && r === I.current && (k.setState({ graph: t }), K(e.nodeId)), k.setState({ moving: !1 }), i;
	}, [
		B,
		K,
		p,
		k
	]), le = t((e) => D.has(e), [D]), ue = t((e) => k.getState().graph.loaded.has(e), [k]);
	r(() => {
		d && !M.loaded.has("") && X("");
	}, [
		M.loaded,
		d,
		X
	]);
	let de = M.children.get("")?.[0];
	return r(() => {
		x === null && de !== void 0 && re(de);
	}, [x, de]), r(() => {
		if (!e || !n) return;
		let t = !1;
		return (async () => {
			b((e) => /* @__PURE__ */ new Set([...e, ...n]));
			for (let e of n) if (await X(e), t) return;
			K(e);
		})(), () => {
			t = !0;
		};
	}, [
		n,
		e,
		K,
		X,
		b
	]), i(() => ({
		activate: G,
		activeId: j,
		canDropOn: se,
		canLoad: V,
		canMove: H,
		childrenCount: Z,
		childrenFor: oe,
		expand: W,
		expanded: y,
		focus: K,
		focusedId: x,
		isLoaded: ue,
		isLoading: le,
		loadChildren: X,
		move: ce,
		moveFocus: J,
		moving: ie,
		parentFor: Q,
		positionFor: $,
		register: q,
		toggle: U,
		typeAhead: Y,
		unregister: ae
	}), [
		G,
		j,
		se,
		V,
		H,
		Z,
		oe,
		W,
		y,
		K,
		x,
		ue,
		le,
		X,
		ce,
		J,
		ie,
		Q,
		$,
		q,
		U,
		Y,
		ae
	]);
}
var O, k, A, j = m((() => {
	b(), O = {
		activate: () => {},
		activeId: null,
		canDropOn: () => !1,
		canLoad: !1,
		canMove: !1,
		childrenCount: () => 0,
		childrenFor: () => void 0,
		expand: () => {},
		expanded: /* @__PURE__ */ new Set(),
		focus: () => {},
		focusedId: null,
		isLoaded: () => !1,
		isLoading: () => !1,
		loadChildren: async () => {},
		move: async () => !1,
		moveFocus: () => {},
		moving: !1,
		parentFor: () => null,
		positionFor: () => -1,
		register: () => {},
		toggle: () => {},
		typeAhead: () => {},
		unregister: () => {}
	}, k = e(O), A = 800;
})), M = /* @__PURE__ */ h({ default: () => R });
function ie(e, t, n) {
	return !!t?.length || e.hasChildren === !0 && (n || !!e.children?.length);
}
function N(e) {
	return String(e).padStart(F, "0");
}
function P({ depth: e, node: t, orderPath: n, parentPath: i, ancestors: s, siblingCount: u, siblingIndex: d }) {
	let { activate: f, activeId: p, canDropOn: m, canLoad: h, canMove: g, childrenCount: _, childrenFor: y, expand: b, expanded: x, focus: ee, focusedId: te, isLoaded: S, isLoading: ne, loadChildren: C, move: w, moveFocus: T, moving: E, parentFor: D, positionFor: O, register: k, toggle: A, typeAhead: j, unregister: M } = re(), { t: F } = (0, v.useT)("tree"), R = a(null), z = a(null), B = a(null), [V, H] = o(!1), [U, W] = o(null), G = i ? `${i}/${t.id}` : t.id, K = x.has(t.id), q = p === t.id, ae = te === t.id, J = t.disabled === !0, Y = y(t.id), X = ie(t, Y, h), oe = ne(t.id), Z = a(null);
	r(() => {
		K && t.hasChildren === !0 && !Y && C(t.id);
	}, [
		K,
		t,
		Y,
		C
	]), r(() => (k({
		id: t.id,
		label: t.label,
		orderPath: n,
		parentPath: i,
		path: G,
		ref: R
	}), () => M(G)), [
		t.id,
		t.label,
		n,
		i,
		G,
		k,
		M
	]), r(() => {
		let e = Z.current;
		e && e.querySelectorAll("button, a[href], [tabindex]").forEach((e) => {
			e.tabIndex = -1;
		});
	}, [t.schema]);
	function Q() {
		B.current !== null && (clearTimeout(B.current), B.current = null);
	}
	function $(e, t, n) {
		let r = D(t), i = O(t), a = +(D(e) === r && O(e) < i);
		return i + +!!n - a;
	}
	async function se(e, n) {
		let r = e.nodeId, i = typeof e.label == "string" ? e.label : r, a = (0, v.extractTreeItemInstruction)(n);
		if (typeof r != "string" || typeof i != "string" || !a || a.type === "instruction-blocked") return;
		let o = null;
		if (a.type === "reorder-above" || a.type === "reorder-below") o = {
			nodeId: r,
			parentId: D(t.id),
			position: $(r, t.id, a.type === "reorder-below")
		};
		else if (a.type === "make-child") {
			if (t.hasChildren === !0 && !S(t.id) && (await C(t.id), !S(t.id))) return;
			b(t.id), o = {
				nodeId: r,
				parentId: t.id,
				position: _(t.id)
			};
		} else if (a.type === "reparent") {
			let e = [...s, t.id], n = Math.max(0, Math.min(a.desiredLevel, e.length - 1)), i = e[n];
			o = {
				nodeId: r,
				parentId: n === 0 ? null : e[n - 1],
				position: $(r, i, !0)
			};
		}
		if (!o) return;
		let c = await w(o);
		(0, v.announce)(c ? F("tree.moved", "Moved {{label}}", { label: i }) : F("tree.move_failed", "Could not move {{label}}", { label: i }));
	}
	r(() => {
		let n = z.current;
		if (!(!n || !g || J)) return (0, v.combine)((0, v.draggable)({
			canDrag: () => !E,
			element: n,
			getInitialData: () => ({
				label: t.label,
				nodeId: t.id,
				type: I
			}),
			onDragStart: () => H(!0),
			onDrop: () => H(!1)
		}), (0, v.dropTargetForElements)({
			canDrop: ({ source: e }) => e.data.type === I && typeof e.data.nodeId == "string" && m(e.data.nodeId, t.id),
			element: n,
			getData: ({ element: n, input: r }) => (0, v.attachTreeItemInstruction)({
				nodeId: t.id,
				type: I
			}, {
				currentLevel: e - 1,
				element: n,
				indentPerLevel: 24,
				input: r,
				mode: K ? "expanded" : d === u ? "last-in-group" : "standard"
			}),
			onDrag: ({ self: e }) => W((0, v.extractTreeItemInstruction)(e.data)?.type ?? null),
			onDragEnter: ({ self: e }) => {
				W((0, v.extractTreeItemInstruction)(e.data)?.type ?? null), X && !K && (Q(), B.current = setTimeout(() => {
					b(t.id), t.hasChildren === !0 && C(t.id);
				}, L));
			},
			onDragLeave: () => {
				Q(), W(null);
			},
			onDrop: ({ self: e, source: t }) => {
				Q(), W(null), se(t.data, e.data);
			}
		}));
	}, [
		s,
		m,
		g,
		_,
		e,
		b,
		X,
		J,
		K,
		S,
		C,
		w,
		E,
		t,
		D,
		O,
		u,
		d,
		F
	]), r(() => Q, []);
	async function ce(e) {
		let n = D(t.id), r = O(t.id), i = null;
		if (e === "ArrowUp" && r > 0) i = {
			nodeId: t.id,
			parentId: n,
			position: r - 1
		};
		else if (e === "ArrowDown" && r < _(n) - 1) i = {
			nodeId: t.id,
			parentId: n,
			position: r + 1
		};
		else if (e === "ArrowRight" && r > 0) {
			let e = y(n ?? "")?.[r - 1];
			if (!e || e.disabled === !0 || e.hasChildren === !0 && !S(e.id) && (await C(e.id), !S(e.id))) return;
			b(e.id), i = {
				nodeId: t.id,
				parentId: e.id,
				position: _(e.id)
			};
		} else if (e === "ArrowLeft" && n !== null) {
			let e = D(n);
			i = {
				nodeId: t.id,
				parentId: e,
				position: O(n) + 1
			};
		}
		if (!i) return;
		let a = await w(i);
		(0, v.announce)(a ? F("tree.moved", "Moved {{label}}", { label: t.label }) : F("tree.move_failed", "Could not move {{label}}", { label: t.label }));
	}
	function le(e) {
		if (e.target === e.currentTarget) {
			if (g && !J && !E && e.ctrlKey && e.shiftKey && [
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(e.key)) {
				e.preventDefault(), ce(e.key);
				return;
			}
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault(), T(t.id, "next");
					return;
				case "ArrowUp":
					e.preventDefault(), T(t.id, "prev");
					return;
				case "ArrowRight":
					e.preventDefault(), X && !K ? A(t.id) : X && T(t.id, "firstChild");
					return;
				case "ArrowLeft":
					e.preventDefault(), X && K ? A(t.id) : T(t.id, "parent");
					return;
				case "Home":
					e.preventDefault(), T(t.id, "first");
					return;
				case "End":
					e.preventDefault(), T(t.id, "last");
					return;
				case "Enter":
				case " ":
					if (e.preventDefault(), J) return;
					if (t.href) v.router.visit(t.href);
					else {
						let e = Z.current?.querySelector("button");
						e ? (e.click(), R.current?.focus()) : f(t.id);
					}
					return;
				default: e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && j(t.id, e.key);
			}
		}
	}
	function ue(e) {
		let n = e.target;
		J || !(n instanceof Element) || n.closest("[role=\"treeitem\"]") !== e.currentTarget || n.closest("button, a[href], [role=\"button\"]") || (ee(t.id), f(t.id));
	}
	return /* @__PURE__ */ l("li", {
		"aria-disabled": J,
		"aria-expanded": X ? K : void 0,
		"aria-label": t.label,
		"aria-level": e,
		"aria-keyshortcuts": g && !J ? "Control+Shift+ArrowUp Control+Shift+ArrowDown Control+Shift+ArrowLeft Control+Shift+ArrowRight" : void 0,
		"aria-posinset": d,
		"aria-selected": q,
		"aria-setsize": u,
		"data-test": `tree-node-${t.id}`,
		onClick: ue,
		onKeyDown: le,
		ref: R,
		role: "treeitem",
		tabIndex: ae ? 0 : -1,
		children: [/* @__PURE__ */ l("div", {
			className: (0, v.cn)("flex items-center gap-2 rounded-lt-sm border-y border-transparent px-2 py-1.5 text-sm text-lt-fg", q && "bg-lt-muted font-medium", J && "pointer-events-none opacity-50", g && !J && "cursor-grab", V && "opacity-50", U === "reorder-above" && "border-t-lt-primary", U === "reorder-below" && "border-b-lt-primary", (U === "make-child" || U === "reparent") && "ring-1 ring-lt-primary"),
			"data-drop-instruction": U ?? void 0,
			ref: z,
			children: [X ? /* @__PURE__ */ c("button", {
				"aria-label": K ? F("tree.collapse", "Collapse {{label}}", { label: t.label }) : F("tree.expand", "Expand {{label}}", { label: t.label }),
				"data-test": `tree-node-${t.id}-toggle`,
				onClick: () => A(t.id),
				tabIndex: -1,
				type: "button",
				children: oe ? /* @__PURE__ */ c(v.Icon, {
					className: "size-lt-icon-md shrink-0 animate-spin",
					name: "loader-2"
				}) : /* @__PURE__ */ c(v.Icon, {
					className: (0, v.cn)("size-lt-icon-md shrink-0 transition-transform", K && "rotate-90"),
					name: "chevron-right"
				})
			}) : null, /* @__PURE__ */ c("span", {
				className: "flex min-w-0 flex-1 items-center gap-2",
				ref: Z,
				children: /* @__PURE__ */ c(v.Renderer, { nodes: t.schema })
			})]
		}), X && K && Y && Y.length > 0 ? /* @__PURE__ */ c("ul", {
			className: "pl-6",
			role: "group",
			children: Y.map((r, i) => /* @__PURE__ */ c(P, {
				depth: e + 1,
				ancestors: [...s, t.id],
				node: r,
				orderPath: `${n}.${N(i)}`,
				parentPath: G,
				siblingCount: Y.length,
				siblingIndex: i + 1
			}, r.id))
		}) : null]
	});
}
var F, I, L, R, z = m((() => {
	b(), j(), F = 6, I = "lattice-tree-node", L = 500, R = ({ node: e }) => {
		let t = (0, v.nodeIdentity)(e), n = D({
			activeId: e.props.activeId,
			activePath: e.props.activePath,
			defaultExpanded: e.props.defaultExpanded,
			endpoint: e.props.endpoint ?? null,
			componentRef: e.props.ref ?? null,
			lazy: e.props.lazy === !0,
			moveAction: e.props.moveAction ?? null,
			nodes: e.props.nodes,
			rememberState: e.props.rememberState,
			revision: e.props.revision ?? null,
			selectAction: e.props.selectAction ?? null,
			storageKey: `lattice:tree:${t ?? "default"}`
		}), r = n.childrenFor("") ?? [];
		return /* @__PURE__ */ c(k.Provider, {
			value: n,
			children: /* @__PURE__ */ c("ul", {
				"data-lattice-component": t,
				role: "tree",
				children: r.map((e, t) => /* @__PURE__ */ c(P, {
					ancestors: [],
					depth: 1,
					node: e,
					orderPath: N(t),
					parentPath: null,
					siblingCount: r.length,
					siblingIndex: t + 1
				}, e.id))
			})
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
b();
var B = {
	name: "lattice/tree",
	components: { tree: (0, v.lazyComponent)(() => Promise.resolve().then(() => (z(), M))) },
	i18n: { namespace: "tree" }
};
//#endregion
export { B as default };
