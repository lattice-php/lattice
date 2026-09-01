import { createContext as e, useCallback as t, useContext as n, useEffect as r, useMemo as i, useRef as a, useState as o, useSyncExternalStore as s } from "react";
import { Fragment as c, jsx as l, jsxs as u } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var d = Object.defineProperty, f = Object.getOwnPropertyDescriptor, p = Object.getOwnPropertyNames, m = Object.prototype.hasOwnProperty, h = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, g = (e, t) => {
	let n = {};
	for (var r in e) d(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || d(n, Symbol.toStringTag, { value: "Module" }), n;
}, _ = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = p(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !m.call(e, s) && s !== n && d(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = f(t, s)) || r.enumerable
	});
	return e;
}, v = (e, t, n) => (_(e, t, "default"), n && _(n, t, "default")), y = /* @__PURE__ */ g({});
import * as b from "@lattice-php/lattice/runtime";
v(y, b);
var x = h((() => {}));
//#endregion
//#region resources/js/tree-field-rows.ts
function S(e) {
	let t = e[A];
	return Array.isArray(t) ? t : [];
}
function C(e, t, n = []) {
	for (let [r, i] of e.entries()) {
		if (i[y.ROW_ID_KEY] === t) return [...n, r];
		let e = C(S(i), t, [...n, r]);
		if (e) return e;
	}
	return null;
}
function w(e, t) {
	let n = e, r = null;
	for (let e of t) {
		if (r = n[e] ?? null, !r) return null;
		n = S(r);
	}
	return r;
}
function T(e) {
	return 1 + S(e).reduce((e, t) => Math.max(e, T(t)), 0);
}
function E(e, t) {
	return t.length >= e.length && e.every((e, n) => t[n] === e);
}
function D(e, t, n) {
	if (t.length === 0) return n(e);
	let [r, ...i] = t;
	return e.map((e, t) => t === r ? {
		...e,
		[A]: D(S(e), i, n)
	} : e);
}
function O(e, t, n, r) {
	let i = C(e, t), a = i ? w(e, i) : null;
	if (!i || !a) return !1;
	let o = [];
	if (n !== null) {
		let t = C(e, n), a = t ? w(e, t) : null;
		if (!t || !a || E(i, t) || !r.acceptsChildren(a)) return !1;
		o = t;
	}
	return r.maxDepth === null || o.length + T(a) <= r.maxDepth;
}
function k(e, t, n, r) {
	let i = C(e, t), a = i ? w(e, i) : null;
	if (!i || !a) return e;
	let o = [];
	if (n !== null) {
		let t = C(e, n);
		if (!t || E(i, t)) return e;
		o = t;
	}
	let s = i.slice(0, -1), c = i[i.length - 1], l = s.length === o.length && s.every((e, t) => o[t] === e) && c < r ? r - 1 : r, u = D(e, s, (e) => e.filter((e, t) => t !== c)), d = [...o], f = s.length;
	return o.length > f && s.every((e, t) => o[t] === e) && o[f] > c && --d[f], D(u, d, (e) => {
		let t = Math.max(0, Math.min(l, e.length));
		return [
			...e.slice(0, t),
			a,
			...e.slice(t)
		];
	});
}
var A, j = h((() => {
	x(), A = "children";
}));
//#endregion
//#region resources/js/tree-item-drop.ts
function M(e, t) {
	return {
		label: t.label,
		sourceId: t.id,
		type: e
	};
}
function N(e, t) {
	return t.type !== e || typeof t.sourceId != "string" ? null : {
		id: t.sourceId,
		label: typeof t.label == "string" ? t.label : t.sourceId
	};
}
function P(e) {
	let { dragType: t, onInstruction: n } = e;
	return (0, y.dropTargetForElements)({
		element: e.element,
		canDrop: ({ source: n }) => {
			let r = N(t, n.data);
			return r !== null && e.canDrop(r);
		},
		getData: ({ element: n, input: r, source: i }) => {
			let a = N(t, i.data);
			return (0, y.attachTreeItemInstruction)({ type: t }, {
				block: a ? e.blockedInstructions(a) : [],
				currentLevel: e.currentLevel,
				element: n,
				indentPerLevel: e.indentPerLevel ?? 24,
				input: r,
				mode: e.mode
			});
		},
		onDrag: ({ self: e }) => n((0, y.extractTreeItemInstruction)(e.data)?.type ?? null),
		onDragEnter: ({ self: t }) => {
			n((0, y.extractTreeItemInstruction)(t.data)?.type ?? null), e.onEnter?.();
		},
		onDragLeave: () => {
			e.onLeave?.(), n(null);
		},
		onDrop: ({ self: r, source: i }) => {
			e.onLeave?.(), n(null);
			let a = N(t, i.data), o = (0, y.extractTreeItemInstruction)(r.data);
			!a || !o || o.type === "instruction-blocked" || e.onDrop(a, o);
		}
	});
}
function F(e) {
	switch (e) {
		case "reorder-above": return "relative before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-lt-primary";
		case "reorder-below": return "relative after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-lt-primary";
		case "make-child":
		case "reparent": return "bg-lt-primary/10";
		case "instruction-blocked": return "bg-lt-danger/10";
		default: return null;
	}
}
var I = h((() => {
	x();
})), L = /* @__PURE__ */ g({ default: () => H });
function R() {
	let e = n(V);
	if (!e) throw Error("Tree field rows must render inside their tree field.");
	return e;
}
function z({ node: e, name: t, depth: n, parentRowId: r }) {
	let i = e.props, a = R(), { t: o } = (0, y.useT)("tree"), { path: s, rows: d, onField: f, onRemove: p, onMove: m, append: h, insert: g } = (0, y.useRowCollection)(t, 0), _ = n === 1 && i.maxItems !== null && d.length >= i.maxItems, v = n === 1 && i.minItems !== null && d.length <= i.minItems, b = i.templates.map((e) => ({
		type: e.type,
		label: e.label
	}));
	return /* @__PURE__ */ u(c, { children: [
		/* @__PURE__ */ l(y.RowKeyInputs, {
			path: s,
			rows: d,
			rowKey: y.ROW_ID_KEY
		}),
		/* @__PURE__ */ l(y.RowKeyInputs, {
			path: s,
			rows: d,
			rowKey: "type"
		}),
		d.map((t, i) => /* @__PURE__ */ l(ee, {
			node: e,
			row: t,
			index: i,
			depth: n,
			path: s,
			parentRowId: r,
			siblingCount: d.length,
			removable: !v,
			insertable: !_,
			options: b,
			onField: f,
			onRemove: p,
			onMove: m,
			onInsert: g
		}, String(t[y.ROW_ID_KEY] ?? i))),
		n === 1 && !a.locked && !_ && /* @__PURE__ */ l(y.AddRowMenu, {
			addLabel: i.addLabel ?? o("tree.add", "Add"),
			options: b,
			onSelect: (e) => h({ type: e })
		})
	] });
}
function B({ label: e, testId: t, danger: n = !1, onClick: r, children: i }) {
	return /* @__PURE__ */ l("button", {
		type: "button",
		"aria-label": e,
		"data-test": t,
		className: (0, y.cn)("[&_svg]:size-lt-icon-sm", n ? "text-lt-danger hover:text-lt-danger" : "text-lt-muted-fg hover:text-lt-fg"),
		onClick: r,
		children: i
	});
}
function ee({ node: e, row: t, index: n, depth: i, path: s, parentRowId: c, siblingCount: d, removable: f, insertable: p, options: m, onField: h, onRemove: g, onMove: _, onInsert: v }) {
	let b = R(), { t: x } = (0, y.useT)("tree"), C = a(null), w = a(null), [T, E] = o(!1), [D, O] = o(null), k = typeof t[y.ROW_ID_KEY] == "string" ? t[y.ROW_ID_KEY] : null, A = e.props.templates.find((e) => e.type === t.type), j = A?.label ?? `Unknown block: ${String(t.type)}`, N = b.acceptsChildren(t) && (b.maxDepth === null || i < b.maxDepth), I = S(t).length, L = !b.locked && k !== null;
	return r(() => {
		let e = C.current, t = w.current;
		if (!(!e || !L || k === null)) return (0, y.combine)(...t ? [(0, y.draggable)({
			element: e,
			dragHandle: t,
			getInitialData: () => M(b.dragType, {
				id: k,
				label: j
			}),
			onDragStart: () => E(!0),
			onDrop: () => E(!1)
		})] : [], P({
			element: e,
			dragType: b.dragType,
			currentLevel: i - 1,
			mode: N && I > 0 ? "expanded" : n === d - 1 ? "last-in-group" : "standard",
			canDrop: (e) => e.id !== k,
			blockedInstructions: (e) => {
				let t = ["reparent"];
				return (!N || !b.canPlace(e.id, k)) && t.push("make-child"), b.canPlace(e.id, c) || t.push("reorder-above", "reorder-below"), t;
			},
			onInstruction: O,
			onDrop: (e, t) => {
				t.type === "reorder-above" ? b.move(e.id, c, n, e.label) : t.type === "reorder-below" ? b.move(e.id, c, n + 1, e.label) : t.type === "make-child" && b.move(e.id, k, I, e.label);
			}
		}));
	}, [
		b,
		I,
		i,
		L,
		j,
		N,
		n,
		c,
		k,
		d
	]), /* @__PURE__ */ u("div", {
		ref: C,
		"data-test": `tree-field-${s}-row-${n}`,
		"data-drop-instruction": D ?? void 0,
		className: (0, y.cn)("rounded-lt border border-lt-border bg-lt-surface p-4", T && "opacity-50", F(D)),
		children: [/* @__PURE__ */ u("div", {
			className: "mb-2 flex items-center justify-between",
			children: [/* @__PURE__ */ u("div", {
				className: "flex items-center gap-2",
				children: [!b.locked && /* @__PURE__ */ l("button", {
					ref: w,
					type: "button",
					"aria-label": x("tree.drag", "Drag {{label}}", { label: j }),
					"data-test": `tree-field-${s}-drag-${n}`,
					className: "cursor-grab text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm",
					children: /* @__PURE__ */ l(y.Icon, { name: "grip-vertical" })
				}), /* @__PURE__ */ l("span", {
					className: "text-sm font-medium text-lt-muted-fg",
					children: j
				})]
			}), !b.locked && /* @__PURE__ */ u("div", {
				className: "flex items-center gap-1",
				children: [
					N && /* @__PURE__ */ l(y.AddRowMenu, {
						addLabel: x("tree.add_child", "Add sub-item"),
						icon: "corner-down-right",
						testId: `tree-field-${s}-add-child-${n}`,
						options: m,
						onSelect: (e) => h(n, "children", [...S(t), (0, y.withRowId)({ type: e })])
					}),
					p && /* @__PURE__ */ l(y.AddRowMenu, {
						addLabel: x("tree.add_below", "Add item below"),
						icon: "list-plus",
						testId: `tree-field-${s}-add-below-${n}`,
						options: m,
						onSelect: (e) => v(n + 1, { type: e })
					}),
					e.props.reorderable && n > 0 && /* @__PURE__ */ l(B, {
						label: x("tree.move_up", "Move up"),
						testId: `tree-field-${s}-up-${n}`,
						onClick: () => _(n, -1),
						children: /* @__PURE__ */ l(y.Icon, { name: "arrow-up" })
					}),
					e.props.reorderable && n < d - 1 && /* @__PURE__ */ l(B, {
						label: x("tree.move_down", "Move down"),
						testId: `tree-field-${s}-down-${n}`,
						onClick: () => _(n, 1),
						children: /* @__PURE__ */ l(y.Icon, { name: "arrow-down" })
					}),
					f && /* @__PURE__ */ l(B, {
						label: x("tree.remove", "Remove"),
						testId: `tree-field-${s}-remove-${n}`,
						danger: !0,
						onClick: () => g(n),
						children: /* @__PURE__ */ l(y.Icon, { name: "trash-2" })
					})
				]
			})]
		}), /* @__PURE__ */ u(y.FieldScopeProvider, {
			base: s,
			index: n,
			row: t,
			onChange: (e, t) => h(n, e, t),
			children: [/* @__PURE__ */ l("div", {
				className: "flex flex-col gap-4",
				children: (A?.schema ?? []).map((e, t) => /* @__PURE__ */ l(y.RenderNode, { node: e }, t))
			}), N && /* @__PURE__ */ l("div", {
				className: "mt-3 flex flex-col gap-3 border-l-2 border-lt-border pl-4",
				children: /* @__PURE__ */ l(z, {
					node: e,
					name: "children",
					depth: i + 1,
					parentRowId: k
				})
			})]
		})]
	});
}
var V, H, U = h((() => {
	x(), j(), I(), V = e(null), H = ({ node: e }) => {
		let t = e.props, { errors: n } = (0, y.useFormContext)(), { hidden: r, required: o, readOnly: s, disabled: c } = (0, y.useDependentField)(e), u = (0, y.useFieldScope)(), d = u ? u.errorKey(t.name) : t.name, f = (0, y.useSetFormValue)(), p = (0, y.useFormValue)(d), { t: m } = (0, y.useT)("tree"), h = a([]);
		h.current = Array.isArray(p) ? p : [];
		let g = s || c, _ = i(() => {
			let e = (e) => t.childBearingTypes === null || t.childBearingTypes.includes(String(e.type));
			return {
				dragType: `tree-field:${d}`,
				locked: g,
				maxDepth: t.maxDepth,
				acceptsChildren: e,
				canPlace: (n, r) => O(h.current, n, r, {
					maxDepth: t.maxDepth,
					acceptsChildren: e
				}),
				move: (e, t, n, r) => {
					f(d, (r) => k(Array.isArray(r) ? r : [], e, t, n)), (0, y.announce)(m("tree.moved", "Moved {{label}}", { label: r }));
				}
			};
		}, [
			t.childBearingTypes,
			t.maxDepth,
			d,
			g,
			f,
			m
		]);
		return r ? null : /* @__PURE__ */ l(y.FormFieldFrame, {
			error: n[d],
			helperText: t.helperText ?? void 0,
			tooltip: t.tooltip ?? void 0,
			label: t.label ?? "",
			id: d,
			required: o,
			children: (n) => /* @__PURE__ */ l("div", {
				...n,
				className: "flex flex-col gap-3",
				role: "group",
				children: /* @__PURE__ */ l(V.Provider, {
					value: _,
					children: /* @__PURE__ */ l(z, {
						node: e,
						name: t.name,
						depth: 1,
						parentRowId: null
					})
				})
			})
		});
	};
}));
//#endregion
//#region resources/js/tree-context.tsx
function W(e, t, n) {
	e.children.set(t, n.map((e) => e.id)), e.loaded.add(t);
	for (let r of n) e.nodes.set(r.id, {
		...r,
		children: []
	}), e.parents.set(r.id, t === "" ? null : t), r.children.length > 0 && W(e, r.id, r.children);
}
function te(e, t) {
	let n = {
		children: /* @__PURE__ */ new Map(),
		loaded: /* @__PURE__ */ new Set(),
		nodes: /* @__PURE__ */ new Map(),
		parents: /* @__PURE__ */ new Map()
	};
	return W(n, "", e), t || n.loaded.delete(""), n;
}
function ne(e, t, n) {
	let r = {
		children: new Map(e.children),
		loaded: new Set(e.loaded),
		nodes: new Map(e.nodes),
		parents: new Map(e.parents)
	};
	return W(r, t, n), r;
}
function re(e, t) {
	let n = 1, r = e.parents.get(t);
	for (; r != null;) n += 1, r = e.parents.get(r);
	return n;
}
function G(e, t) {
	let n = e.children.get(t);
	return n === void 0 ? e.nodes.get(t)?.hasChildren === !0 ? 2 : 1 : n.length === 0 ? 1 : 1 + Math.max(...n.map((t) => G(e, t)));
}
function K(e, t, n) {
	let r = e.parents.get(n);
	for (; r != null;) {
		if (r === t) return !0;
		r = e.parents.get(r);
	}
	return !1;
}
function ie(e, t) {
	let n = e.nodes.get(t.nodeId), r = t.parentId === null ? null : e.nodes.get(t.parentId);
	if (!n || n.disabled === !0 || t.parentId !== null && !r || r?.disabled === !0 || t.nodeId === t.parentId || t.parentId !== null && K(e, t.nodeId, t.parentId)) return null;
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
function oe() {
	return n(Z);
}
function q(e) {
	let t = JSON.parse(e);
	if (!Array.isArray(t)) throw Error("expected an array of ids");
	return new Set(t.filter((e) => typeof e == "string"));
}
function J(e) {
	return [...e.values()].sort((e, t) => e.orderPath.localeCompare(t.orderPath));
}
async function Y(e, t, n) {
	let r = e.props.endpoint;
	return !r || (0, y.runAction)(() => (0, y.apiFetch)(r, {
		body: JSON.stringify(t),
		headers: { "Content-Type": "application/json" },
		method: e.props.method ?? "post",
		ref: e.props.ref ?? "",
		throwOnError: !1
	}), n);
}
function se({ activeId: e, activePath: n, defaultExpanded: c, endpoint: l, componentRef: u, lazy: d, maxDepth: f, nodes: p, moveAction: m, rememberState: h, revision: g, selectAction: _, storageKey: v }) {
	let [b, x] = (0, y.usePersistentState)(v, () => new Set(c), {
		enabled: h,
		parse: q,
		serialize: (e) => JSON.stringify([...e])
	}), [S, C] = o(() => p[0]?.id ?? null), [w, T] = o(/* @__PURE__ */ new Set()), [E] = o(() => ae({
		activeId: e,
		graph: te(p, !(d && p.length === 0)),
		moving: !1
	})), { activeId: D, graph: O, moving: k } = s(E.subscribe, E.getState), A = a(/* @__PURE__ */ new Map()), j = a({
		text: "",
		timestamp: 0
	}), M = a(/* @__PURE__ */ new Map()), N = a(0), P = a(null), F = a(0), I = a({
		nodes: p,
		revision: g
	}), L = (0, y.useEffectDispatcher)(), R = l !== null && l !== "", z = m !== null;
	r(() => {
		F.current += 1, E.setState({ activeId: e });
	}, [e, E]), r(() => {
		(I.current.nodes !== p || I.current.revision !== g) && (I.current = {
			nodes: p,
			revision: g
		}, N.current += 1, M.current.clear(), E.setState({ graph: te(p, !(d && p.length === 0)) }), T(/* @__PURE__ */ new Set()));
	}, [
		d,
		p,
		g,
		E
	]);
	let B = t((e) => {
		x((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		});
	}, [x]), ee = t((e) => x((t) => new Set(t).add(e)), [x]), V = t((e) => {
		let t = E.getState().activeId, n = ++F.current;
		E.setState({ activeId: e }), _ && Y(_, { nodeId: e }, L).then((e) => {
			!e && F.current === n && E.setState({ activeId: t });
		});
	}, [
		L,
		_,
		E
	]), H = t((e) => {
		C(e);
		let t = [...A.current.values()].find((t) => t.id === e);
		t?.ref.current ? (P.current = null, t.ref.current.focus()) : P.current = e;
	}, []), U = t((e) => {
		A.current.set(e.path, e), P.current === e.id && (P.current = null, e.ref.current?.focus());
	}, []), W = t((e) => {
		A.current.delete(e);
	}, []), oe = t((e, t) => {
		let n = J(A.current);
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
		a && H(a.id);
	}, [H]), se = t((e, t) => {
		let n = J(A.current);
		if (n.length === 0) return;
		let r = Date.now(), i = j.current, a = r - i.timestamp > ce ? t : i.text + t;
		j.current = {
			text: a,
			timestamp: r
		};
		let o = a.toLowerCase(), s = n.findIndex((t) => t.id === e), c = s === -1 ? 0 : s;
		for (let e = 1; e <= n.length; e++) {
			let t = n[(c + e) % n.length];
			if (t.label.toLowerCase().startsWith(o)) {
				H(t.id);
				return;
			}
		}
	}, [H]), X = t((e) => {
		if (!R || E.getState().graph.loaded.has(e)) return Promise.resolve();
		let t = M.current.get(e);
		if (t) return t;
		let n = N.current;
		T((t) => new Set(t).add(e));
		let r = (0, y.apiJson)(`${l}?parent=${encodeURIComponent(e)}`, { ref: u ?? "" }).then(({ nodes: t }) => {
			n === N.current && E.setState({ graph: ne(E.getState().graph, e, t) });
		}).catch(() => {
			n === N.current && x((t) => {
				let n = new Set(t);
				return n.delete(e), n;
			});
		}).finally(() => {
			n === N.current && (M.current.delete(e), T((t) => {
				let n = new Set(t);
				return n.delete(e), n;
			}));
		});
		return M.current.set(e, r), r;
	}, [
		R,
		u,
		l,
		x,
		E
	]), Z = t((e) => O.children.get(e)?.map((e) => O.nodes.get(e)), [O]), le = t((e) => E.getState().graph.children.get(e ?? "")?.length ?? 0, [E]), ue = t((e) => E.getState().graph.parents.get(e) ?? null, [E]), de = t((e) => {
		let t = E.getState().graph, n = t.parents.get(e) ?? null;
		return t.children.get(n ?? "")?.indexOf(e) ?? -1;
	}, [E]), fe = t((e, t) => {
		let n = E.getState().graph, r = n.nodes.get(e), i = n.nodes.get(t);
		return !!(r && i && r.disabled !== !0 && i.disabled !== !0 && e !== t && !K(n, e, t));
	}, [E]), Q = t((e, t) => {
		let n = E.getState().graph;
		return t === (n.parents.get(e) ?? null) ? !0 : t !== null && n.nodes.get(t)?.acceptsChildren === !1 ? !1 : f === null || (t === null ? 0 : re(n, t)) + G(n, e) <= f;
	}, [f, E]), pe = t(async (e) => {
		if (!m || E.getState().moving || !Q(e.nodeId, e.parentId)) return !1;
		let t = E.getState().graph, n = ie(t, e);
		if (!n) return !1;
		let r = N.current;
		E.setState({
			graph: n,
			moving: !0
		}), H(e.nodeId);
		let i = await Y(m, e, L);
		return !i && r === N.current && (E.setState({ graph: t }), H(e.nodeId)), E.setState({ moving: !1 }), i;
	}, [
		Q,
		L,
		H,
		m,
		E
	]), me = t(() => {
		if (!R) return;
		N.current += 1;
		let e = N.current;
		M.current.clear(), T(/* @__PURE__ */ new Set()), (0, y.apiJson)(`${l}?parent=`, { ref: u ?? "" }).then(({ nodes: t }) => {
			e === N.current && E.setState({ graph: te(t, !0) });
		}).catch(() => {});
	}, [
		R,
		u,
		l,
		E
	]), he = t((e) => w.has(e), [w]), ge = t((e) => E.getState().graph.loaded.has(e), [E]);
	r(() => {
		d && !O.loaded.has("") && X("");
	}, [
		O.loaded,
		d,
		X
	]);
	let $ = O.children.get("")?.[0];
	return r(() => {
		S === null && $ !== void 0 && C($);
	}, [S, $]), r(() => {
		if (!e || !n) return;
		let t = !1;
		return (async () => {
			x((e) => /* @__PURE__ */ new Set([...e, ...n]));
			for (let e of n) if (await X(e), t) return;
			H(e);
		})(), () => {
			t = !0;
		};
	}, [
		n,
		e,
		H,
		X,
		x
	]), i(() => ({
		activate: V,
		activeId: D,
		canDropOn: fe,
		canLoad: R,
		canMove: z,
		canPlace: Q,
		childrenCount: le,
		childrenFor: Z,
		expand: ee,
		expanded: b,
		focus: H,
		focusedId: S,
		isLoaded: ge,
		isLoading: he,
		loadChildren: X,
		move: pe,
		moveFocus: oe,
		moving: k,
		parentFor: ue,
		positionFor: de,
		register: U,
		reload: me,
		toggle: B,
		typeAhead: se,
		unregister: W
	}), [
		V,
		D,
		fe,
		R,
		z,
		Q,
		le,
		Z,
		ee,
		b,
		H,
		S,
		ge,
		he,
		X,
		pe,
		oe,
		k,
		ue,
		de,
		U,
		me,
		B,
		se,
		W
	]);
}
var X, Z, ce, le = h((() => {
	x(), X = {
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
	}, Z = e(X), ce = 800;
})), ue = /* @__PURE__ */ g({ default: () => _e });
function de(e, t, n) {
	return !!t?.length || e.hasChildren === !0 && (n || !!e.children?.length);
}
function fe(e) {
	return e instanceof Element && e.closest($) !== null;
}
function Q(e) {
	return String(e).padStart(me, "0");
}
function pe({ depth: e, node: t, orderPath: n, parentPath: i, ancestors: s, siblingCount: c, siblingIndex: d }) {
	let { activate: f, activeId: p, canDropOn: m, canLoad: h, canMove: g, canPlace: _, childrenCount: v, childrenFor: b, expand: x, expanded: S, focus: C, focusedId: w, isLoaded: T, isLoading: E, loadChildren: D, move: O, moveFocus: k, moving: A, parentFor: j, positionFor: N, register: I, toggle: L, typeAhead: R, unregister: z } = oe(), { t: B } = (0, y.useT)("tree"), { visit: ee } = (0, y.useNavigation)(), V = a(null), H = a(null), U = a(null), [W, te] = o(!1), [ne, re] = o(null), G = i ? `${i}/${t.id}` : t.id, K = S.has(t.id), ie = p === t.id, ae = w === t.id, q = t.disabled === !0, J = b(t.id), Y = de(t, J, h), se = E(t.id), X = a(null);
	r(() => {
		K && t.hasChildren === !0 && !J && D(t.id);
	}, [
		K,
		t,
		J,
		D
	]), r(() => (I({
		id: t.id,
		label: t.label,
		orderPath: n,
		parentPath: i,
		path: G,
		ref: V
	}), () => z(G)), [
		t.id,
		t.label,
		n,
		i,
		G,
		I,
		z
	]), r(() => {
		let e = X.current;
		e && e.querySelectorAll("button, a[href], [tabindex]").forEach((e) => {
			e.tabIndex = -1;
		});
	}, [t.schema]);
	function Z() {
		U.current !== null && (clearTimeout(U.current), U.current = null);
	}
	function ce(e, t, n) {
		let r = j(t), i = N(t), a = +(j(e) === r && N(e) < i);
		return i + +!!n - a;
	}
	async function le(e, n) {
		let r = e.id, i = null;
		if (n.type === "reorder-above" || n.type === "reorder-below") i = {
			nodeId: r,
			parentId: j(t.id),
			position: ce(r, t.id, n.type === "reorder-below")
		};
		else if (n.type === "make-child") {
			if (t.hasChildren === !0 && !T(t.id) && (await D(t.id), !T(t.id))) return;
			x(t.id), i = {
				nodeId: r,
				parentId: t.id,
				position: v(t.id)
			};
		} else if (n.type === "reparent") {
			let e = [...s, t.id], a = Math.max(0, Math.min(n.desiredLevel, e.length - 1)), o = e[a];
			i = {
				nodeId: r,
				parentId: a === 0 ? null : e[a - 1],
				position: ce(r, o, !0)
			};
		}
		if (!i) return;
		let a = await O(i);
		(0, y.announce)(a ? B("tree.moved", "Moved {{label}}", { label: e.label }) : B("tree.move_failed", "Could not move {{label}}", { label: e.label }));
	}
	r(() => {
		let n = H.current;
		if (!(!n || !g || q)) return (0, y.combine)((0, y.cancelDragStartFromInteractive)(n, fe), (0, y.draggable)({
			canDrag: () => !A,
			element: n,
			getInitialData: () => M(he, {
				id: t.id,
				label: t.label
			}),
			onDragStart: () => te(!0),
			onDrop: () => te(!1)
		}), P({
			element: n,
			dragType: he,
			currentLevel: e - 1,
			mode: K ? "expanded" : d === c ? "last-in-group" : "standard",
			canDrop: (e) => m(e.id, t.id),
			blockedInstructions: (e) => {
				let n = [];
				return _(e.id, t.id) || n.push("make-child"), _(e.id, j(t.id)) || n.push("reorder-above", "reorder-below"), n;
			},
			onInstruction: re,
			onEnter: () => {
				Y && !K && (Z(), U.current = setTimeout(() => {
					x(t.id), t.hasChildren === !0 && D(t.id);
				}, ge));
			},
			onLeave: Z,
			onDrop: (e, t) => void le(e, t)
		}));
	}, [
		s,
		m,
		g,
		_,
		v,
		e,
		x,
		Y,
		q,
		K,
		T,
		D,
		O,
		A,
		t,
		j,
		N,
		c,
		d,
		B
	]), r(() => Z, []);
	async function ue(e) {
		let n = j(t.id), r = N(t.id), i = null;
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
			let e = b(n ?? "")?.[r - 1];
			if (!e || e.disabled === !0 || !_(t.id, e.id) || e.hasChildren === !0 && !T(e.id) && (await D(e.id), !T(e.id))) return;
			x(e.id), i = {
				nodeId: t.id,
				parentId: e.id,
				position: v(e.id)
			};
		} else if (e === "ArrowLeft" && n !== null) {
			let e = j(n);
			i = {
				nodeId: t.id,
				parentId: e,
				position: N(n) + 1
			};
		}
		if (!i) return;
		let a = await O(i);
		(0, y.announce)(a ? B("tree.moved", "Moved {{label}}", { label: t.label }) : B("tree.move_failed", "Could not move {{label}}", { label: t.label }));
	}
	function me(e) {
		if (e.target === e.currentTarget) {
			if (g && !q && !A && e.ctrlKey && e.shiftKey && [
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(e.key)) {
				e.preventDefault(), ue(e.key);
				return;
			}
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault(), k(t.id, "next");
					return;
				case "ArrowUp":
					e.preventDefault(), k(t.id, "prev");
					return;
				case "ArrowRight":
					e.preventDefault(), Y && !K ? L(t.id) : Y && k(t.id, "firstChild");
					return;
				case "ArrowLeft":
					e.preventDefault(), Y && K ? L(t.id) : k(t.id, "parent");
					return;
				case "Home":
					e.preventDefault(), k(t.id, "first");
					return;
				case "End":
					e.preventDefault(), k(t.id, "last");
					return;
				case "Enter":
				case " ":
					if (e.preventDefault(), q) return;
					if (t.href) ee(t.href);
					else {
						let e = X.current?.querySelector("button");
						e ? (e.click(), V.current?.focus()) : f(t.id);
					}
					return;
				default: e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && R(t.id, e.key);
			}
		}
	}
	function $(e) {
		let n = e.target;
		q || !(n instanceof Element) || n.closest("[role=\"treeitem\"]") !== e.currentTarget || n.closest("button, a[href], [role=\"button\"]") || fe(n) || (C(t.id), f(t.id));
	}
	return /* @__PURE__ */ u("li", {
		"aria-disabled": q,
		"aria-expanded": Y ? K : void 0,
		"aria-label": t.label,
		"aria-level": e,
		"aria-keyshortcuts": g && !q ? "Control+Shift+ArrowUp Control+Shift+ArrowDown Control+Shift+ArrowLeft Control+Shift+ArrowRight" : void 0,
		"aria-posinset": d,
		"aria-selected": ie,
		"aria-setsize": c,
		className: (0, y.cn)(t.class) || void 0,
		"data-test": `tree-node-${t.id}`,
		onClick: $,
		onKeyDown: me,
		ref: V,
		role: "treeitem",
		tabIndex: ae ? 0 : -1,
		children: [/* @__PURE__ */ u("div", {
			className: (0, y.cn)("flex items-center gap-2 rounded-lt-sm px-2 py-1.5 text-sm text-lt-fg", ie && "bg-lt-muted font-medium", q && "pointer-events-none opacity-50", g && !q && "cursor-grab", W && "opacity-50", F(ne)),
			"data-drop-instruction": ne ?? void 0,
			ref: H,
			children: [Y ? /* @__PURE__ */ l("button", {
				"aria-label": K ? B("tree.collapse", "Collapse {{label}}", { label: t.label }) : B("tree.expand", "Expand {{label}}", { label: t.label }),
				"data-test": `tree-node-${t.id}-toggle`,
				onClick: () => L(t.id),
				tabIndex: -1,
				type: "button",
				children: se ? /* @__PURE__ */ l(y.Icon, {
					className: "size-lt-icon-md shrink-0 animate-spin",
					name: "loader-2"
				}) : /* @__PURE__ */ l(y.Icon, {
					className: (0, y.cn)("size-lt-icon-md shrink-0 transition-transform", K && "rotate-90"),
					name: "chevron-right"
				})
			}) : null, /* @__PURE__ */ l("span", {
				className: "flex min-w-0 flex-1 items-center gap-2",
				ref: X,
				children: /* @__PURE__ */ l(y.Renderer, { nodes: t.schema })
			})]
		}), Y && K && J && J.length > 0 ? /* @__PURE__ */ l("ul", {
			className: "pl-6",
			role: "group",
			children: J.map((r, i) => /* @__PURE__ */ l(pe, {
				depth: e + 1,
				ancestors: [...s, t.id],
				node: r,
				orderPath: `${n}.${Q(i)}`,
				parentPath: G,
				siblingCount: J.length,
				siblingIndex: i + 1
			}, r.id))
		}) : null]
	});
}
var me, he, ge, $, _e, ve = h((() => {
	x(), le(), I(), me = 6, he = "lattice-tree-node", ge = 500, $ = "input, textarea, select, label, [contenteditable]", _e = ({ node: e }) => {
		let t = (0, y.nodeIdentity)(e), n = se({
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
		return (0, y.useWindowEvent)(y.LATTICE_EVENT.reloadComponent, (e) => {
			let n = e.detail;
			t !== void 0 && n?.component === t && i();
		}), /* @__PURE__ */ l(Z.Provider, {
			value: n,
			children: /* @__PURE__ */ l("ul", {
				"data-test": t,
				role: "tree",
				children: r.map((e, t) => /* @__PURE__ */ l(pe, {
					ancestors: [],
					depth: 1,
					node: e,
					orderPath: Q(t),
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
x();
var ye = {
	name: "lattice/tree",
	components: {
		"field.tree": (0, y.lazyComponent)(() => Promise.resolve().then(() => (U(), L))),
		tree: (0, y.lazyComponent)(() => Promise.resolve().then(() => (ve(), ue)))
	},
	i18n: { namespace: "tree" }
};
//#endregion
export { ye as default };
