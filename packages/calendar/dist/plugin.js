import { useCallback as e, useEffect as t, useMemo as n, useRef as r, useState as i } from "react";
import { Fragment as a, jsx as o, jsxs as s } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var c = Object.defineProperty, l = Object.getOwnPropertyDescriptor, u = Object.getOwnPropertyNames, d = Object.prototype.hasOwnProperty, f = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, p = (e, t) => {
	let n = {};
	for (var r in e) c(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || c(n, Symbol.toStringTag, { value: "Module" }), n;
}, m = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = u(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !d.call(e, s) && s !== n && c(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = l(t, s)) || r.enumerable
	});
	return e;
}, h = (e, t, n) => (m(e, t, "default"), n && m(n, t, "default")), g = /* @__PURE__ */ p({});
import * as _ from "@lattice-php/lattice/runtime";
h(g, _);
var v = f((() => {}));
//#endregion
//#region resources/js/date-axis.ts
function y(e) {
	return /* @__PURE__ */ new Date(`${e}T12:00:00Z`);
}
function b(e, t) {
	let n = [], r = null, i = 0;
	for (let a = 0; a < e; a++) {
		let e = t(a);
		e !== r && (r !== null && n.push({
			start: i,
			span: a - i,
			label: r
		}), r = e, i = a);
	}
	return r !== null && n.push({
		start: i,
		span: e - i,
		label: r
	}), n;
}
function x(e, t, n, r) {
	let i = new Intl.DateTimeFormat(n, {
		month: "long",
		year: "numeric"
	}), a = [];
	for (let n = 0; n < t; n++) {
		let t = (0, g.addDays)(e, n), i = y(t), o = i.getUTCDay();
		a.push({
			index: n,
			date: t,
			weekday: o,
			dayOfMonth: i.getUTCDate(),
			isWeekend: o === 0 || o === 6,
			isToday: t === r
		});
	}
	return {
		start: e,
		days: a,
		weeks: b(t, (e) => String((0, g.isoWeek)(a[e].date))),
		months: b(t, (e) => i.format(y(a[e].date)))
	};
}
function S(e) {
	let t = [...e].sort((e, t) => e.start - t.start || t.span - e.span || e.id.localeCompare(t.id)), n = [], r = [];
	for (let e of t) {
		let t = e.start + e.span, i = n.findIndex((t) => t <= e.start);
		i === -1 ? (i = n.length, n.push(t)) : n[i] = t, r.push({
			...e,
			lane: i
		});
	}
	return {
		bars: r,
		laneCount: n.length
	};
}
var C = f((() => {
	v();
}));
//#endregion
//#region resources/js/timeline-state.ts
function w(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e[0] < t[0] ? -1 : +(e[0] > t[0])), n = [[t[0][0], t[0][1]]];
	for (let [e, r] of t.slice(1)) {
		let t = n[n.length - 1];
		e <= t[1] ? r > t[1] && (t[1] = r) : n.push([e, r]);
	}
	return n;
}
function T(e, t, n) {
	if (t >= n) return [];
	let r = w(e), i = [], a = t;
	for (let [e, t] of r) if (!(t <= a) && (e >= n || (e > a && i.push([a, e]), a = t > a ? t < n ? t : n : a, a >= n))) break;
	return a < n && i.push([a, n]), i;
}
function E(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function D(e) {
	if (!E(e) || !E(e.event)) return null;
	let t = e.event;
	return typeof t.id != "string" || typeof t.resourceId != "string" || typeof t.start != "string" || typeof t.end != "string" || typeof t.label != "string" ? null : t;
}
function O(e) {
	if (!E(e)) return null;
	if (E(e.errors)) {
		for (let t of Object.values(e.errors)) if (Array.isArray(t)) {
			let e = t.find((e) => typeof e == "string");
			if (e) return e;
		}
	}
	return typeof e.message == "string" && e.message !== "" ? e.message : null;
}
function k({ endpoint: t, componentRef: a, initialEvents: o, initialFrom: s, days: c }) {
	let [l, u] = i(() => new Map(o.map((e) => [e.id, e]))), [d, f] = i(!1), [p, m] = i(/* @__PURE__ */ new Set()), h = r([[s, (0, g.addDays)(s, c)]]), _ = r(/* @__PURE__ */ new Map()), v = r(/* @__PURE__ */ new Set()), y = e((e, n) => {
		if (!t || !a) return;
		let r = T(h.current, e, n);
		if (r.length === 0) return;
		let i = r[0][0], o = r[r.length - 1][1], s = `${i}:${o}`;
		if (_.current.has(s)) return;
		let c = (0, g.apiJson)(`${t}?from=${i}&to=${o}`, { ref: a }).then(({ events: e }) => {
			h.current = w([...h.current, [i, o]]), u((t) => {
				let n = new Map(t);
				for (let t of e) n.set(t.id, t);
				return n;
			});
		}).catch(() => {}).finally(() => {
			_.current.delete(s), f(_.current.size > 0);
		});
		_.current.set(s, c), f(!0);
	}, [a, t]), b = e((e) => {
		let t = [];
		for (let n of l.values()) n.resourceId === e && t.push(n);
		return t;
	}, [l]), x = e(async (e) => {
		let n = l.get(e.id);
		if (!t || !a || !n || v.current.has(e.id)) return {
			accepted: !1,
			message: null
		};
		v.current.add(e.id), m(new Set(v.current)), u((t) => new Map(t).set(e.id, {
			...n,
			...e
		}));
		try {
			let r = await (0, g.apiFetch)(t, {
				body: JSON.stringify(e),
				method: "PATCH",
				ref: a,
				throwOnError: !1
			}), i = await r.json().catch(() => null), o = r.ok ? D(i) : null;
			return o?.id === e.id ? (u((t) => new Map(t).set(e.id, o)), {
				accepted: !0,
				message: null
			}) : (u((e) => new Map(e).set(n.id, n)), {
				accepted: !1,
				message: O(i)
			});
		} catch {
			return u((e) => new Map(e).set(n.id, n)), {
				accepted: !1,
				message: null
			};
		} finally {
			v.current.delete(e.id), m(new Set(v.current));
		}
	}, [
		a,
		t,
		l
	]), S = e((e) => p.has(e), [p]);
	return n(() => ({
		events: l,
		eventsForResource: b,
		ensureRange: y,
		isRescheduling: S,
		loading: d,
		reschedule: x
	}), [
		l,
		b,
		y,
		S,
		d,
		x
	]);
}
var A = f((() => {
	v();
})), j = /* @__PURE__ */ p({ default: () => H });
function M(e, t, n, r) {
	let i = [];
	for (let a of t(e)) {
		let e = Math.max(0, (0, g.daysBetween)(n, a.start)), t = Math.min(r, (0, g.daysBetween)(n, a.end)) - e;
		t > 0 && i.push({
			id: a.id,
			start: e,
			span: t,
			event: a
		});
	}
	return S(i);
}
function N({ canReschedule: e, collapsed: t, dayWidth: n, days: r, eventsForResource: i, from: c, group: l, isRescheduling: u, onReschedule: d, onToggle: f, resources: p, t: m }) {
	return /* @__PURE__ */ s(a, { children: [
		/* @__PURE__ */ s("div", {
			className: "lt-timeline-sticky-col flex items-center gap-1.5 border-t border-lt-border bg-lt-muted px-2 py-1.5 text-sm font-medium",
			children: [/* @__PURE__ */ o("button", {
				"aria-expanded": !t,
				"aria-label": t ? m("calendar.expand-group", "Expand {{label}}", { label: l.label }) : m("calendar.collapse-group", "Collapse {{label}}", { label: l.label }),
				onClick: f,
				type: "button",
				children: /* @__PURE__ */ o(g.Icon, {
					className: (0, g.cn)("size-lt-icon-sm shrink-0 transition-transform", !t && "rotate-90"),
					name: "chevron-right"
				})
			}), /* @__PURE__ */ o("span", { children: l.label })]
		}),
		/* @__PURE__ */ o("div", { className: "lt-timeline-group-header-canvas border-t border-lt-border bg-lt-muted" }),
		t ? null : l.resources.map((t) => /* @__PURE__ */ o(P, {
			canReschedule: e,
			dayWidth: n,
			days: r,
			eventsForResource: i,
			from: c,
			isRescheduling: u,
			onReschedule: d,
			resource: t,
			resources: p,
			t: m
		}, t.id))
	] });
}
function P({ canReschedule: e, dayWidth: n, days: c, eventsForResource: l, from: u, isRescheduling: d, onReschedule: f, resource: p, resources: m, t: h }) {
	let { bars: _, laneCount: v } = M(p.id, l, u, c), y = `calc(${Math.max(v, 1)} * var(--lt-timeline-lane-height))`, b = r(null), [x, S] = i(!1);
	return t(() => {
		let t = b.current;
		if (!(!t || !e)) return (0, g.dropTargetForElements)({
			canDrop: ({ source: e }) => e.data.type === V,
			element: t,
			getData: ({ element: e, input: t, source: r }) => {
				let i = typeof r.data.grabOffsetDays == "number" ? r.data.grabOffsetDays : 0, a = Math.floor((t.clientX - e.getBoundingClientRect().left) / n) - i;
				return {
					resourceId: p.id,
					start: (0, g.addDays)(u, a),
					type: V
				};
			},
			onDragEnter: () => S(!0),
			onDragLeave: () => S(!1),
			onDrop: ({ self: e, source: t }) => {
				S(!1);
				let n = t.data.id, r = t.data.durationDays, i = e.data.resourceId, a = e.data.start;
				typeof n == "string" && typeof r == "number" && typeof i == "string" && typeof a == "string" && f({
					id: n,
					resourceId: i,
					start: a,
					end: (0, g.addDays)(a, r)
				});
			}
		});
	}, [
		e,
		n,
		u,
		f,
		p.id
	]), /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ o("div", {
		className: "lt-timeline-sticky-col flex items-center border-t border-lt-border px-2 text-sm text-lt-fg",
		style: { height: y },
		children: p.label
	}), /* @__PURE__ */ s("div", {
		className: (0, g.cn)("lt-timeline-resource-canvas border-t border-lt-border", x && "bg-lt-primary/10"),
		"data-test": `timeline-resource-${p.id}`,
		ref: b,
		style: { height: y },
		children: [/* @__PURE__ */ o("div", {
			className: "lt-timeline-weekend-strip",
			"aria-hidden": "true"
		}), _.map((t) => /* @__PURE__ */ o(F, {
			bar: t,
			canReschedule: e,
			dayWidth: n,
			days: c,
			from: u,
			isRescheduling: d(t.id),
			onReschedule: f,
			resource: p,
			resources: m,
			t: h
		}, t.id))]
	})] });
}
function F({ bar: e, canReschedule: n, dayWidth: a, days: s, from: c, isRescheduling: l, onReschedule: u, resource: d, resources: f, t: p }) {
	let m = r(null), [h, _] = i(!1), v = (0, g.daysBetween)(e.event.start, e.event.end), y = Math.max(0, (0, g.daysBetween)(e.event.start, c)), b = (0, g.toneProps)((0, g.coerceColor)(e.event.color) ?? (0, g.namedColor)("primary"));
	t(() => {
		let t = m.current;
		if (!(!t || !n)) return (0, g.draggable)({
			canDrag: () => !l,
			element: t,
			getInitialData: ({ element: t, input: n }) => ({
				durationDays: v,
				grabOffsetDays: Math.max(0, Math.min(v - 1, y + Math.floor((n.clientX - t.getBoundingClientRect().left) / a))),
				id: e.id,
				type: V
			}),
			onDragStart: () => {
				_(!0), (0, g.announce)(p("calendar.dragging", "Moving {{label}}. Drop on a resource row.", { label: e.event.label }));
			},
			onDrop: () => _(!1)
		});
	}, [
		e.event.label,
		e.id,
		n,
		a,
		v,
		y,
		l,
		p
	]);
	function x(t) {
		if (!n || l || !t.ctrlKey || !t.shiftKey) return;
		let r = e.event.resourceId, i = e.event.start, a = f.findIndex((e) => e.id === r);
		switch (t.key) {
			case "ArrowLeft":
				i = (0, g.addDays)(i, -1);
				break;
			case "ArrowRight":
				i = (0, g.addDays)(i, 1);
				break;
			case "ArrowUp":
				r = f[a - 1]?.id ?? r;
				break;
			case "ArrowDown":
				r = f[a + 1]?.id ?? r;
				break;
			default: return;
		}
		let o = (0, g.addDays)(i, v);
		i < c || o > (0, g.addDays)(c, s) || (t.preventDefault(), u({
			id: e.id,
			resourceId: r,
			start: i,
			end: o
		}));
	}
	return /* @__PURE__ */ o("button", {
		"aria-disabled": !n || l,
		"aria-keyshortcuts": "Control+Shift+ArrowLeft Control+Shift+ArrowRight Control+Shift+ArrowUp Control+Shift+ArrowDown",
		"aria-label": p("calendar.entry-label", "{{label}}, {{resource}}, {{start}} to {{end}}. Use Control Shift and arrow keys to reschedule.", {
			end: e.event.end,
			label: e.event.label,
			resource: d.label,
			start: e.event.start
		}),
		className: (0, g.cn)("lt-timeline-bar cursor-grab rounded-lt-xs px-1.5 py-1 text-left text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary", b.className, h && "opacity-60"),
		"data-resource-id": e.event.resourceId,
		"data-start": e.event.start,
		"data-test": `timeline-entry-${e.id}`,
		onKeyDown: x,
		ref: m,
		style: {
			left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
			width: `calc(var(--lt-timeline-day-width) * ${e.span})`,
			top: `calc(${e.lane} * var(--lt-timeline-lane-height))`,
			height: "var(--lt-timeline-lane-height)",
			...b.style
		},
		title: e.event.label,
		type: "button",
		children: e.event.label
	});
}
var I, L, R, z, B, V, H, U = f((() => {
	v(), C(), A(), I = 10, L = 64, R = 24, z = 1.25, B = 7, V = "lattice-calendar-entry", H = ({ node: t }) => {
		let r = (0, g.nodeIdentity)(t), { t: a, locale: c } = (0, g.useT)("calendar"), [l, u] = i(t.props.from), [d, f] = i(R), [p, m] = i(/* @__PURE__ */ new Set()), [h] = i(() => (0, g.todayISO)((0, g.currentTimezone)())), { days: _ } = t.props, [v, y] = i(null), { events: b, eventsForResource: S, ensureRange: C, isRescheduling: w, loading: T, reschedule: E } = k({
			endpoint: t.props.endpoint,
			componentRef: t.props.ref,
			initialEvents: t.props.events,
			initialFrom: t.props.from,
			days: _
		}), D = n(() => t.props.groups.flatMap((e) => e.resources), [t.props.groups]), O = n(() => x(l, _, c, h), [
			l,
			_,
			c,
			h
		]), A = O.days.length > 0 ? (O.days[0].weekday + 6) % 7 : 0, j = (0, g.daysBetween)(l, h), M = j >= 0 && j < _, P = n(() => new Intl.DateTimeFormat(c, { weekday: "short" }), [c]);
		function F(e) {
			u(e), C(e, (0, g.addDays)(e, _));
		}
		function V(e) {
			m((t) => {
				let n = new Set(t);
				return n.has(e) ? n.delete(e) : n.add(e), n;
			});
		}
		let H = e(async (e) => {
			let t = b.get(e.id);
			if (!t || t.resourceId === e.resourceId && t.start === e.start && t.end === e.end) return;
			y(null);
			let n = await E(e);
			if (n.accepted) {
				(0, g.announce)(a("calendar.rescheduled", "Rescheduled {{label}}", { label: t.label }));
				return;
			}
			let r = n.message ?? a("calendar.reschedule-failed", "Could not reschedule {{label}}", { label: t.label });
			y(r), (0, g.announce)(r);
		}, [
			b,
			E,
			a
		]), U = {
			"--lt-timeline-day-width": `${d}px`,
			"--lt-timeline-canvas-w": `calc(var(--lt-timeline-day-width) * ${_})`,
			"--lt-timeline-weekend-offset": A
		};
		return /* @__PURE__ */ s("div", {
			className: "lt-timeline",
			"data-lattice-component": r,
			children: [
				/* @__PURE__ */ s("div", {
					className: "mb-2 flex items-center gap-1",
					children: [
						/* @__PURE__ */ o("button", {
							"aria-label": a("calendar.previous", "Previous"),
							className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
							onClick: () => F((0, g.addDays)(l, -7)),
							type: "button",
							children: /* @__PURE__ */ o(g.Icon, {
								className: "size-lt-icon-sm",
								name: "chevron-left"
							})
						}),
						/* @__PURE__ */ o("button", {
							"aria-label": a("calendar.next", "Next"),
							className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
							onClick: () => F((0, g.addDays)(l, B)),
							type: "button",
							children: /* @__PURE__ */ o(g.Icon, {
								className: "size-lt-icon-sm",
								name: "chevron-right"
							})
						}),
						/* @__PURE__ */ o("button", {
							className: "rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted",
							onClick: () => F((0, g.addDays)(h, -7)),
							type: "button",
							children: a("calendar.today", "Today")
						}),
						/* @__PURE__ */ s("div", {
							className: "ml-auto flex items-center gap-1",
							children: [/* @__PURE__ */ o("button", {
								"aria-label": a("calendar.zoom-out", "Zoom out"),
								className: "rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40",
								disabled: d <= I,
								onClick: () => f((e) => Math.max(I, e / z)),
								type: "button",
								children: /* @__PURE__ */ o(g.Icon, {
									className: "size-lt-icon-sm",
									name: "minus"
								})
							}), /* @__PURE__ */ o("button", {
								"aria-label": a("calendar.zoom-in", "Zoom in"),
								className: "rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40",
								disabled: d >= L,
								onClick: () => f((e) => Math.min(L, e * z)),
								type: "button",
								children: /* @__PURE__ */ o(g.Icon, {
									className: "size-lt-icon-sm",
									name: "plus"
								})
							})]
						})
					]
				}),
				v ? /* @__PURE__ */ o("div", {
					className: "mb-2 text-sm text-lt-danger",
					role: "alert",
					children: v
				}) : null,
				/* @__PURE__ */ o("div", {
					"aria-busy": T || [...b.keys()].some((e) => w(e)),
					className: "lt-timeline-scroll rounded-lt-sm border border-lt-border",
					children: /* @__PURE__ */ s("div", {
						className: "lt-timeline-grid",
						style: U,
						children: [
							/* @__PURE__ */ o("div", { className: (0, g.cn)("lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-months lt-timeline-header-cell") }),
							/* @__PURE__ */ o("div", {
								className: (0, g.cn)("lt-timeline-sticky-row lt-timeline-row-months lt-timeline-header-cell"),
								children: O.months.map((e) => /* @__PURE__ */ o("div", {
									className: "lt-timeline-segment flex items-center border-l border-lt-border px-2 text-xs font-medium text-lt-fg",
									style: {
										left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
										width: `calc(var(--lt-timeline-day-width) * ${e.span})`
									},
									children: e.label
								}, `${e.start}-${e.label}`))
							}),
							/* @__PURE__ */ o("div", { className: (0, g.cn)("lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-weeks lt-timeline-header-cell") }),
							/* @__PURE__ */ o("div", {
								className: (0, g.cn)("lt-timeline-sticky-row lt-timeline-row-weeks lt-timeline-header-cell"),
								children: O.weeks.map((e) => /* @__PURE__ */ s("div", {
									className: "lt-timeline-segment flex items-center border-l border-lt-border px-2 text-xs text-lt-muted-fg",
									style: {
										left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
										width: `calc(var(--lt-timeline-day-width) * ${e.span})`
									},
									children: [
										a("calendar.week", "CW"),
										" ",
										e.label
									]
								}, `${e.start}-${e.label}`))
							}),
							/* @__PURE__ */ o("div", { className: (0, g.cn)("lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-days lt-timeline-header-cell") }),
							/* @__PURE__ */ o("div", {
								className: (0, g.cn)("lt-timeline-sticky-row lt-timeline-row-days lt-timeline-header-cell"),
								children: /* @__PURE__ */ o("div", {
									className: "lt-timeline-days-row",
									children: O.days.map((e) => /* @__PURE__ */ s("div", {
										className: (0, g.cn)("lt-timeline-day flex flex-col items-center justify-center border-l border-lt-border text-xs", e.isWeekend && "bg-lt-muted text-lt-muted-fg", e.isToday && "font-semibold text-lt-primary"),
										children: [/* @__PURE__ */ o("span", { children: P.format(/* @__PURE__ */ new Date(`${e.date}T12:00:00Z`)) }), /* @__PURE__ */ o("span", { children: e.dayOfMonth })]
									}, e.date))
								})
							}),
							t.props.groups.map((e) => /* @__PURE__ */ o(N, {
								collapsed: p.has(e.key),
								days: _,
								eventsForResource: S,
								from: l,
								group: e,
								isRescheduling: w,
								onReschedule: H,
								onToggle: () => V(e.key),
								resources: D,
								t: a,
								canReschedule: t.props.endpoint !== null && t.props.ref !== null,
								dayWidth: d
							}, e.key)),
							M ? /* @__PURE__ */ o("div", {
								"aria-hidden": "true",
								className: "lt-timeline-today-marker",
								style: { left: `calc(var(--lt-timeline-label-w) + var(--lt-timeline-day-width) * ${j})` }
							}) : null
						]
					})
				})
			]
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
v();
var W = {
	name: "lattice/calendar",
	components: { timeline: (0, g.lazyComponent)(() => Promise.resolve().then(() => (U(), j))) },
	i18n: { namespace: "calendar" }
};
//#endregion
export { W as default };
