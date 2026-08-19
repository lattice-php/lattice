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
}, ee = (e, t) => {
	let n = {};
	for (var r in e) u(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || u(n, Symbol.toStringTag, { value: "Module" }), n;
}, h = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = f(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !p.call(e, s) && s !== n && u(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = d(t, s)) || r.enumerable
	});
	return e;
}, g = (e, t, n) => (h(e, t, "default"), n && h(n, t, "default")), _ = /* @__PURE__ */ ee({});
import * as v from "@lattice-php/lattice/runtime";
g(_, v);
var y = m((() => {}));
//#endregion
//#region resources/js/tree-context.tsx
function b(e, t, n) {
	e.children.set(t, n.map((e) => e.id)), e.loaded.add(t);
	for (let r of n) e.nodes.set(r.id, {
		...r,
		children: []
	}), e.parents.set(r.id, t === "" ? null : t), r.children.length > 0 && b(e, r.id, r.children);
}
function te(e, t) {
	let n = {
		children: /* @__PURE__ */ new Map(),
		loaded: /* @__PURE__ */ new Set(),
		nodes: /* @__PURE__ */ new Map(),
		parents: /* @__PURE__ */ new Map()
	};
	return b(n, "", e), t || n.loaded.delete(""), n;
}
function ne(e, t, n) {
	let r = {
		children: new Map(e.children),
		loaded: new Set(e.loaded),
		nodes: new Map(e.nodes),
		parents: new Map(e.parents)
	};
	return b(r, t, n), r;
}
function re(e, t) {
	let n = 1, r = e.parents.get(t);
	for (; r != null;) n += 1, r = e.parents.get(r);
	return n;
}
function x(e, t) {
	let n = e.children.get(t);
	return n === void 0 ? e.nodes.get(t)?.hasChildren === !0 ? 2 : 1 : n.length === 0 ? 1 : 1 + Math.max(...n.map((t) => x(e, t)));
}
function ie(e, t, n) {
	let r = e.parents.get(n);
	for (; r != null;) {
		if (r === t) return !0;
		r = e.parents.get(r);
	}
	return !1;
}
function S(e, t) {
	let n = e.nodes.get(t.nodeId), r = t.parentId === null ? null : e.nodes.get(t.parentId);
	if (!n || n.disabled === !0 || t.parentId !== null && !r || r?.disabled === !0 || t.nodeId === t.parentId || t.parentId !== null && ie(e, t.nodeId, t.parentId)) return null;
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
function ae(e) {
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
function C() {
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
	return !r || (0, _.runAction)(() => (0, _.apiFetch)(r, {
		body: JSON.stringify(t),
		headers: { "Content-Type": "application/json" },
		method: e.props.method ?? "post",
		ref: e.props.ref ?? "",
		throwOnError: !1
	}), n);
}
function D({ activeId: e, activePath: n, defaultExpanded: c, endpoint: l, componentRef: u, lazy: d, maxDepth: f, nodes: p, moveAction: m, rememberState: ee, revision: h, selectAction: g, storageKey: v }) {
	let [y, b] = (0, _.usePersistentState)(v, () => new Set(c), {
		enabled: ee,
		parse: w,
		serialize: (e) => JSON.stringify([...e])
	}), [C, D] = o(() => p[0]?.id ?? null), [O, k] = o(/* @__PURE__ */ new Set()), [A] = o(() => ae({
		activeId: e,
		graph: te(p, !(d && p.length === 0)),
		moving: !1
	})), { activeId: j, graph: M, moving: N } = s(A.subscribe, A.getState), P = a(/* @__PURE__ */ new Map()), F = a({
		text: "",
		timestamp: 0
	}), I = a(/* @__PURE__ */ new Map()), L = a(0), R = a(null), z = a(0), B = a({
		nodes: p,
		revision: h
	}), V = (0, _.useEffectDispatcher)(), H = l !== null && l !== "", se = m !== null;
	r(() => {
		z.current += 1, A.setState({ activeId: e });
	}, [e, A]), r(() => {
		(B.current.nodes !== p || B.current.revision !== h) && (B.current = {
			nodes: p,
			revision: h
		}, L.current += 1, I.current.clear(), A.setState({ graph: te(p, !(d && p.length === 0)) }), k(/* @__PURE__ */ new Set()));
	}, [
		d,
		p,
		h,
		A
	]);
	let U = t((e) => {
		b((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		});
	}, [b]), W = t((e) => b((t) => new Set(t).add(e)), [b]), G = t((e) => {
		let t = A.getState().activeId, n = ++z.current;
		A.setState({ activeId: e }), g && E(g, { nodeId: e }, V).then((e) => {
			!e && z.current === n && A.setState({ activeId: t });
		});
	}, [
		V,
		g,
		A
	]), K = t((e) => {
		D(e);
		let t = [...P.current.values()].find((t) => t.id === e);
		t?.ref.current ? (R.current = null, t.ref.current.focus()) : R.current = e;
	}, []), ce = t((e) => {
		P.current.set(e.path, e), R.current === e.id && (R.current = null, e.ref.current?.focus());
	}, []), le = t((e) => {
		P.current.delete(e);
	}, []), q = t((e, t) => {
		let n = T(P.current);
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
	}, [K]), J = t((e, t) => {
		let n = T(P.current);
		if (n.length === 0) return;
		let r = Date.now(), i = F.current, a = r - i.timestamp > oe ? t : i.text + t;
		F.current = {
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
	}, [K]), Y = t((e) => {
		if (!H || A.getState().graph.loaded.has(e)) return Promise.resolve();
		let t = I.current.get(e);
		if (t) return t;
		let n = L.current;
		k((t) => new Set(t).add(e));
		let r = (0, _.apiJson)(`${l}?parent=${encodeURIComponent(e)}`, { ref: u ?? "" }).then(({ nodes: t }) => {
			n === L.current && A.setState({ graph: ne(A.getState().graph, e, t) });
		}).catch(() => {
			n === L.current && b((t) => {
				let n = new Set(t);
				return n.delete(e), n;
			});
		}).finally(() => {
			n === L.current && (I.current.delete(e), k((t) => {
				let n = new Set(t);
				return n.delete(e), n;
			}));
		});
		return I.current.set(e, r), r;
	}, [
		H,
		u,
		l,
		b,
		A
	]), ue = t((e) => M.children.get(e)?.map((e) => M.nodes.get(e)), [M]), X = t((e) => A.getState().graph.children.get(e ?? "")?.length ?? 0, [A]), Z = t((e) => A.getState().graph.parents.get(e) ?? null, [A]), Q = t((e) => {
		let t = A.getState().graph, n = t.parents.get(e) ?? null;
		return t.children.get(n ?? "")?.indexOf(e) ?? -1;
	}, [A]), de = t((e, t) => {
		let n = A.getState().graph, r = n.nodes.get(e), i = n.nodes.get(t);
		return !!(r && i && r.disabled !== !0 && i.disabled !== !0 && e !== t && !ie(n, e, t));
	}, [A]), $ = t((e, t) => {
		let n = A.getState().graph;
		return t === (n.parents.get(e) ?? null) ? !0 : t !== null && n.nodes.get(t)?.acceptsChildren === !1 ? !1 : f === null || (t === null ? 0 : re(n, t)) + x(n, e) <= f;
	}, [f, A]), fe = t(async (e) => {
		if (!m || A.getState().moving || !$(e.nodeId, e.parentId)) return !1;
		let t = A.getState().graph, n = S(t, e);
		if (!n) return !1;
		let r = L.current;
		A.setState({
			graph: n,
			moving: !0
		}), K(e.nodeId);
		let i = await E(m, e, V);
		return !i && r === L.current && (A.setState({ graph: t }), K(e.nodeId)), A.setState({ moving: !1 }), i;
	}, [
		$,
		V,
		K,
		m,
		A
	]), pe = t(() => {
		if (!H) return;
		L.current += 1;
		let e = L.current;
		I.current.clear(), k(/* @__PURE__ */ new Set()), (0, _.apiJson)(`${l}?parent=`, { ref: u ?? "" }).then(({ nodes: t }) => {
			e === L.current && A.setState({ graph: te(t, !0) });
		}).catch(() => {});
	}, [
		H,
		u,
		l,
		A
	]), me = t((e) => O.has(e), [O]), he = t((e) => A.getState().graph.loaded.has(e), [A]);
	r(() => {
		d && !M.loaded.has("") && Y("");
	}, [
		M.loaded,
		d,
		Y
	]);
	let ge = M.children.get("")?.[0];
	return r(() => {
		C === null && ge !== void 0 && D(ge);
	}, [C, ge]), r(() => {
		if (!e || !n) return;
		let t = !1;
		return (async () => {
			b((e) => /* @__PURE__ */ new Set([...e, ...n]));
			for (let e of n) if (await Y(e), t) return;
			K(e);
		})(), () => {
			t = !0;
		};
	}, [
		n,
		e,
		K,
		Y,
		b
	]), i(() => ({
		activate: G,
		activeId: j,
		canDropOn: de,
		canLoad: H,
		canMove: se,
		canPlace: $,
		childrenCount: X,
		childrenFor: ue,
		expand: W,
		expanded: y,
		focus: K,
		focusedId: C,
		isLoaded: he,
		isLoading: me,
		loadChildren: Y,
		move: fe,
		moveFocus: q,
		moving: N,
		parentFor: Z,
		positionFor: Q,
		register: ce,
		reload: pe,
		toggle: U,
		typeAhead: J,
		unregister: le
	}), [
		G,
		j,
		de,
		H,
		se,
		$,
		X,
		ue,
		W,
		y,
		K,
		C,
		he,
		me,
		Y,
		fe,
		q,
		N,
		Z,
		Q,
		ce,
		pe,
		U,
		J,
		le
	]);
}
var O, k, oe, A = m((() => {
	y(), O = {
		activate: () => {},
		activeId: null,
		canDropOn: () => !1,
		canLoad: !1,
		canMove: !1,
		canPlace: () => !1,
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
		reload: () => {},
		toggle: () => {},
		typeAhead: () => {},
		unregister: () => {}
	}, k = e(O), oe = 800;
})), j = /* @__PURE__ */ ee({ default: () => B });
function M(e, t, n) {
	return !!t?.length || e.hasChildren === !0 && (n || !!e.children?.length);
}
function N(e) {
	return e instanceof Element && e.closest(z) !== null;
}
function P(e) {
	return String(e).padStart(I, "0");
}
function F({ depth: e, node: t, orderPath: n, parentPath: i, ancestors: s, siblingCount: u, siblingIndex: d }) {
	let { activate: f, activeId: p, canDropOn: m, canLoad: ee, canMove: h, canPlace: g, childrenCount: v, childrenFor: y, expand: b, expanded: te, focus: ne, focusedId: re, isLoaded: x, isLoading: ie, loadChildren: S, move: ae, moveFocus: w, moving: T, parentFor: E, positionFor: D, register: O, toggle: k, typeAhead: oe, unregister: A } = C(), { t: j } = (0, _.useT)("tree"), { visit: I } = (0, _.useNavigation)(), z = a(null), B = a(null), V = a(null), [H, se] = o(!1), [U, W] = o(null), G = i ? `${i}/${t.id}` : t.id, K = te.has(t.id), ce = p === t.id, le = re === t.id, q = t.disabled === !0, J = y(t.id), Y = M(t, J, ee), ue = ie(t.id), X = a(null);
	r(() => {
		K && t.hasChildren === !0 && !J && S(t.id);
	}, [
		K,
		t,
		J,
		S
	]), r(() => (O({
		id: t.id,
		label: t.label,
		orderPath: n,
		parentPath: i,
		path: G,
		ref: z
	}), () => A(G)), [
		t.id,
		t.label,
		n,
		i,
		G,
		O,
		A
	]), r(() => {
		let e = X.current;
		e && e.querySelectorAll("button, a[href], [tabindex]").forEach((e) => {
			e.tabIndex = -1;
		});
	}, [t.schema]);
	function Z() {
		V.current !== null && (clearTimeout(V.current), V.current = null);
	}
	function Q(e, t, n) {
		let r = E(t), i = D(t), a = +(E(e) === r && D(e) < i);
		return i + +!!n - a;
	}
	async function de(e, n) {
		let r = e.nodeId, i = typeof e.label == "string" ? e.label : r, a = (0, _.extractTreeItemInstruction)(n);
		if (typeof r != "string" || typeof i != "string" || !a || a.type === "instruction-blocked") return;
		let o = null;
		if (a.type === "reorder-above" || a.type === "reorder-below") o = {
			nodeId: r,
			parentId: E(t.id),
			position: Q(r, t.id, a.type === "reorder-below")
		};
		else if (a.type === "make-child") {
			if (t.hasChildren === !0 && !x(t.id) && (await S(t.id), !x(t.id))) return;
			b(t.id), o = {
				nodeId: r,
				parentId: t.id,
				position: v(t.id)
			};
		} else if (a.type === "reparent") {
			let e = [...s, t.id], n = Math.max(0, Math.min(a.desiredLevel, e.length - 1)), i = e[n];
			o = {
				nodeId: r,
				parentId: n === 0 ? null : e[n - 1],
				position: Q(r, i, !0)
			};
		}
		if (!o) return;
		let c = await ae(o);
		(0, _.announce)(c ? j("tree.moved", "Moved {{label}}", { label: i }) : j("tree.move_failed", "Could not move {{label}}", { label: i }));
	}
	r(() => {
		let n = B.current;
		if (!n || !h || q) return;
		let r = (e) => {
			let t = n.ownerDocument.activeElement;
			(N(e.target) || n.contains(t) && N(t)) && e.preventDefault();
		};
		return n.addEventListener("dragstart", r, !0), (0, _.combine)(() => n.removeEventListener("dragstart", r, !0), (0, _.draggable)({
			canDrag: () => !T,
			element: n,
			getInitialData: () => ({
				label: t.label,
				nodeId: t.id,
				type: L
			}),
			onDragStart: () => se(!0),
			onDrop: () => se(!1)
		}), (0, _.dropTargetForElements)({
			canDrop: ({ source: e }) => e.data.type === L && typeof e.data.nodeId == "string" && m(e.data.nodeId, t.id),
			element: n,
			getData: ({ element: n, input: r, source: i }) => {
				let a = typeof i.data.nodeId == "string" ? i.data.nodeId : null, o = [];
				return a !== null && !g(a, t.id) && o.push("make-child"), a !== null && !g(a, E(t.id)) && o.push("reorder-above", "reorder-below"), (0, _.attachTreeItemInstruction)({
					nodeId: t.id,
					type: L
				}, {
					block: o,
					currentLevel: e - 1,
					element: n,
					indentPerLevel: 24,
					input: r,
					mode: K ? "expanded" : d === u ? "last-in-group" : "standard"
				});
			},
			onDrag: ({ self: e }) => W((0, _.extractTreeItemInstruction)(e.data)?.type ?? null),
			onDragEnter: ({ self: e }) => {
				W((0, _.extractTreeItemInstruction)(e.data)?.type ?? null), Y && !K && (Z(), V.current = setTimeout(() => {
					b(t.id), t.hasChildren === !0 && S(t.id);
				}, R));
			},
			onDragLeave: () => {
				Z(), W(null);
			},
			onDrop: ({ self: e, source: t }) => {
				Z(), W(null), de(t.data, e.data);
			}
		}));
	}, [
		s,
		m,
		h,
		g,
		v,
		e,
		b,
		Y,
		q,
		K,
		x,
		S,
		ae,
		T,
		t,
		E,
		D,
		u,
		d,
		j
	]), r(() => Z, []);
	async function $(e) {
		let n = E(t.id), r = D(t.id), i = null;
		if (e === "ArrowUp" && r > 0) i = {
			nodeId: t.id,
			parentId: n,
			position: r - 1
		};
		else if (e === "ArrowDown" && r < v(n) - 1) i = {
			nodeId: t.id,
			parentId: n,
			position: r + 1
		};
		else if (e === "ArrowRight" && r > 0) {
			let e = y(n ?? "")?.[r - 1];
			if (!e || e.disabled === !0 || !g(t.id, e.id) || e.hasChildren === !0 && !x(e.id) && (await S(e.id), !x(e.id))) return;
			b(e.id), i = {
				nodeId: t.id,
				parentId: e.id,
				position: v(e.id)
			};
		} else if (e === "ArrowLeft" && n !== null) {
			let e = E(n);
			i = {
				nodeId: t.id,
				parentId: e,
				position: D(n) + 1
			};
		}
		if (!i) return;
		let a = await ae(i);
		(0, _.announce)(a ? j("tree.moved", "Moved {{label}}", { label: t.label }) : j("tree.move_failed", "Could not move {{label}}", { label: t.label }));
	}
	function fe(e) {
		if (e.target === e.currentTarget) {
			if (h && !q && !T && e.ctrlKey && e.shiftKey && [
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(e.key)) {
				e.preventDefault(), $(e.key);
				return;
			}
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault(), w(t.id, "next");
					return;
				case "ArrowUp":
					e.preventDefault(), w(t.id, "prev");
					return;
				case "ArrowRight":
					e.preventDefault(), Y && !K ? k(t.id) : Y && w(t.id, "firstChild");
					return;
				case "ArrowLeft":
					e.preventDefault(), Y && K ? k(t.id) : w(t.id, "parent");
					return;
				case "Home":
					e.preventDefault(), w(t.id, "first");
					return;
				case "End":
					e.preventDefault(), w(t.id, "last");
					return;
				case "Enter":
				case " ":
					if (e.preventDefault(), q) return;
					if (t.href) I(t.href);
					else {
						let e = X.current?.querySelector("button");
						e ? (e.click(), z.current?.focus()) : f(t.id);
					}
					return;
				default: e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && oe(t.id, e.key);
			}
		}
	}
	function pe(e) {
		let n = e.target;
		q || !(n instanceof Element) || n.closest("[role=\"treeitem\"]") !== e.currentTarget || n.closest("button, a[href], [role=\"button\"]") || N(n) || (ne(t.id), f(t.id));
	}
	return /* @__PURE__ */ l("li", {
		"aria-disabled": q,
		"aria-expanded": Y ? K : void 0,
		"aria-label": t.label,
		"aria-level": e,
		"aria-keyshortcuts": h && !q ? "Control+Shift+ArrowUp Control+Shift+ArrowDown Control+Shift+ArrowLeft Control+Shift+ArrowRight" : void 0,
		"aria-posinset": d,
		"aria-selected": ce,
		"aria-setsize": u,
		className: (0, _.cn)(t.class) || void 0,
		"data-test": `tree-node-${t.id}`,
		onClick: pe,
		onKeyDown: fe,
		ref: z,
		role: "treeitem",
		tabIndex: le ? 0 : -1,
		children: [/* @__PURE__ */ l("div", {
			className: (0, _.cn)("flex items-center gap-2 rounded-lt-sm border-y border-transparent px-2 py-1.5 text-sm text-lt-fg", ce && "bg-lt-muted font-medium", q && "pointer-events-none opacity-50", h && !q && "cursor-grab", H && "opacity-50", U === "reorder-above" && "border-t-lt-primary", U === "reorder-below" && "border-b-lt-primary", (U === "make-child" || U === "reparent") && "ring-1 ring-lt-primary", U === "instruction-blocked" && "ring-1 ring-lt-danger/50"),
			"data-drop-instruction": U ?? void 0,
			ref: B,
			children: [Y ? /* @__PURE__ */ c("button", {
				"aria-label": K ? j("tree.collapse", "Collapse {{label}}", { label: t.label }) : j("tree.expand", "Expand {{label}}", { label: t.label }),
				"data-test": `tree-node-${t.id}-toggle`,
				onClick: () => k(t.id),
				tabIndex: -1,
				type: "button",
				children: ue ? /* @__PURE__ */ c(_.Icon, {
					className: "size-lt-icon-md shrink-0 animate-spin",
					name: "loader-2"
				}) : /* @__PURE__ */ c(_.Icon, {
					className: (0, _.cn)("size-lt-icon-md shrink-0 transition-transform", K && "rotate-90"),
					name: "chevron-right"
				})
			}) : null, /* @__PURE__ */ c("span", {
				className: "flex min-w-0 flex-1 items-center gap-2",
				ref: X,
				children: /* @__PURE__ */ c(_.Renderer, { nodes: t.schema })
			})]
		}), Y && K && J && J.length > 0 ? /* @__PURE__ */ c("ul", {
			className: "pl-6",
			role: "group",
			children: J.map((r, i) => /* @__PURE__ */ c(F, {
				depth: e + 1,
				ancestors: [...s, t.id],
				node: r,
				orderPath: `${n}.${P(i)}`,
				parentPath: G,
				siblingCount: J.length,
				siblingIndex: i + 1
			}, r.id))
		}) : null]
	});
}
var I, L, R, z, B, V = m((() => {
	y(), A(), I = 6, L = "lattice-tree-node", R = 500, z = "input, textarea, select, label, [contenteditable]", B = ({ node: e }) => {
		let t = (0, _.nodeIdentity)(e), n = D({
			activeId: e.props.activeId,
			activePath: e.props.activePath,
			defaultExpanded: e.props.defaultExpanded,
			endpoint: e.props.endpoint ?? null,
			componentRef: e.props.ref ?? null,
			lazy: e.props.lazy === !0,
			maxDepth: e.props.maxDepth ?? null,
			moveAction: e.props.moveAction ?? null,
			nodes: e.props.nodes,
			rememberState: e.props.rememberState,
			revision: e.props.revision ?? null,
			selectAction: e.props.selectAction ?? null,
			storageKey: `lattice:tree:${t ?? "default"}`
		}), r = n.childrenFor("") ?? [], { reload: i } = n;
		return (0, _.useWindowEvent)(_.LATTICE_EVENT.reloadComponent, (e) => {
			let n = e.detail;
			t !== void 0 && n?.component === t && i();
		}), /* @__PURE__ */ c(k.Provider, {
			value: n,
			children: /* @__PURE__ */ c("ul", {
				"data-lattice-component": t,
				role: "tree",
				children: r.map((e, t) => /* @__PURE__ */ c(F, {
					ancestors: [],
					depth: 1,
					node: e,
					orderPath: P(t),
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
y();
var H = {
	name: "lattice/tree",
	components: { tree: (0, _.lazyComponent)(() => Promise.resolve().then(() => (V(), j))) },
	i18n: { namespace: "tree" }
};
//#endregion
export { H as default };
