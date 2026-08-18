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
//#region resources/js/date-ranges.ts
function y(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e[0] < t[0] ? -1 : +(e[0] > t[0])), n = [[t[0][0], t[0][1]]];
	for (let [e, r] of t.slice(1)) {
		let t = n[n.length - 1];
		e <= t[1] ? r > t[1] && (t[1] = r) : n.push([e, r]);
	}
	return n;
}
function b(e, t, n) {
	if (t >= n) return [];
	let r = y(e), i = [], a = t;
	for (let [e, t] of r) if (!(t <= a) && (e >= n || (e > a && i.push([a, e]), a = t > a ? t < n ? t : n : a, a >= n))) break;
	return a < n && i.push([a, n]), i;
}
var x = f((() => {}));
//#endregion
//#region resources/js/calendar-state.ts
function S(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function C(e) {
	if (!S(e) || !S(e.event)) return null;
	let t = e.event;
	return typeof t.id != "string" || typeof t.start != "string" || typeof t.end != "string" || typeof t.label != "string" || typeof t.allDay != "boolean" ? null : t;
}
function w(e) {
	if (!S(e)) return null;
	if (S(e.errors)) {
		for (let t of Object.values(e.errors)) if (Array.isArray(t)) {
			let e = t.find((e) => typeof e == "string");
			if (e) return e;
		}
	}
	return typeof e.message == "string" && e.message !== "" ? e.message : null;
}
function T({ endpoint: t, componentRef: a, initialEvents: o, initialFrom: s, initialTo: c }) {
	let [l, u] = i(() => new Map(o.map((e) => [e.id, e]))), [d, f] = i(!1), [p, m] = i(/* @__PURE__ */ new Set()), h = r([[s, c]]), _ = r(/* @__PURE__ */ new Map()), v = r(/* @__PURE__ */ new Set()), x = e((e, n) => {
		if (!t || !a) return;
		let r = b(h.current, e, n);
		if (r.length === 0) return;
		let i = r[0][0], o = r[r.length - 1][1], s = `${i}:${o}`;
		if (_.current.has(s)) return;
		let c = (0, g.apiJson)(`${t}?from=${i}&to=${o}`, { ref: a }).then(({ events: e }) => {
			h.current = y([...h.current, [i, o]]), u((t) => {
				let n = new Map(t);
				for (let t of e) n.set(t.id, t);
				return n;
			});
		}).catch(() => {}).finally(() => {
			_.current.delete(s), f(_.current.size > 0);
		});
		_.current.set(s, c), f(!0);
	}, [a, t]), S = e((e) => {
		let t = [];
		for (let n of l.values()) n.resourceId === e && t.push(n);
		return t;
	}, [l]), T = e(async (e) => {
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
			}), i = await r.json().catch(() => null), o = r.ok ? C(i) : null;
			return o?.id === e.id ? (u((t) => new Map(t).set(e.id, o)), {
				accepted: !0,
				message: null
			}) : (u((e) => new Map(e).set(n.id, n)), {
				accepted: !1,
				message: w(i)
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
	]), E = e((e) => p.has(e), [p]);
	return n(() => ({
		events: l,
		eventsForResource: S,
		ensureRange: x,
		isRescheduling: E,
		loading: d,
		reschedule: T
	}), [
		l,
		S,
		x,
		E,
		d,
		T
	]);
}
var E = f((() => {
	v(), x();
}));
//#endregion
//#region resources/js/date-axis.ts
function D(e) {
	return /* @__PURE__ */ new Date(`${e}T12:00:00Z`);
}
function O(e, t) {
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
function k(e, t, n, r) {
	let i = new Intl.DateTimeFormat(n, {
		month: "long",
		year: "numeric"
	}), a = [];
	for (let n = 0; n < t; n++) {
		let t = (0, g.addDays)(e, n), i = D(t), o = i.getUTCDay();
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
		weeks: O(t, (e) => String((0, g.isoWeek)(a[e].date))),
		months: O(t, (e) => i.format(D(a[e].date)))
	};
}
function A(e) {
	let t = [...e].sort((e, t) => e.start - t.start || t.span - e.span || (e.order ?? e.id).localeCompare(t.order ?? t.id)), n = [], r = [];
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
var j = f((() => {
	v();
}));
//#endregion
//#region resources/js/event-span.ts
function M(e) {
	if (e.allDay) return [e.start, e.end];
	let t = e.start.slice(0, 10), n = e.end.slice(0, 10), r = e.end.endsWith("T00:00:00") ? n : (0, g.addDays)(n, 1);
	return [t, r > t ? r : (0, g.addDays)(t, 1)];
}
function N(e, t) {
	let n = (e) => (0, g.addDays)(e.slice(0, 10), t) + e.slice(10);
	return {
		start: n(e.start),
		end: n(e.end)
	};
}
var P = f((() => {
	v();
}));
//#endregion
//#region resources/js/month-grid.ts
function F(e, t) {
	let n = (0, g.startOfMonthISO)(e), r = (0, g.startOfWeekISO)(n, t);
	return [r, (0, g.addDays)(r, (0, g.weeksInMonth)(n, t) * 7)];
}
function I(e, t, n) {
	let r = (0, g.startOfMonthISO)(e), i = (0, g.addMonths)(r, 1), [a, o] = F(r, t), s = [];
	for (let e = a; e < o; e = (0, g.addDays)(e, 7)) {
		let t = [];
		for (let a = 0; a < 7; a++) {
			let o = (0, g.addDays)(e, a), s = (/* @__PURE__ */ new Date(`${o}T12:00:00Z`)).getUTCDay();
			t.push({
				date: o,
				dayOfMonth: Number(o.slice(8, 10)),
				inMonth: o >= r && o < i,
				isToday: o === n,
				isWeekend: s === 0 || s === 6
			});
		}
		s.push({
			start: e,
			days: t
		});
	}
	return {
		monthStart: r,
		gridStart: a,
		gridEnd: o,
		weeks: s
	};
}
function L(e, t) {
	let n = (0, g.addDays)(t, 7), r = [];
	for (let i of e) {
		let [e, a] = M(i);
		if (e >= n || a <= t) continue;
		let o = Math.max(0, (0, g.daysBetween)(t, e)), s = Math.min(7, (0, g.daysBetween)(t, a));
		r.push({
			id: i.id,
			start: o,
			span: s - o,
			order: `${i.allDay ? "0" : "1"}|${i.start}|${i.id}`,
			continuesBefore: e < t,
			continuesAfter: a > n,
			event: i
		});
	}
	let { bars: i, laneCount: a } = A(r);
	return {
		chips: i,
		laneCount: a
	};
}
function R(e, t) {
	let n = [
		0,
		0,
		0,
		0,
		0,
		0,
		0
	], r = [];
	for (let i of e) {
		if (i.lane < t) {
			r.push(i);
			continue;
		}
		for (let e = i.start; e < i.start + i.span; e++) n[e]++;
	}
	return {
		visible: r,
		hiddenByDay: n
	};
}
function ee(e, t) {
	let n = (0, g.addDays)(t, 1), r = [];
	for (let i of e) {
		let [e, a] = M(i);
		e < n && a > t && r.push(i);
	}
	return r.sort((e, t) => Number(t.allDay) - Number(e.allDay) || (e.start < t.start ? -1 : +(e.start > t.start)) || e.id.localeCompare(t.id));
}
var z = f((() => {
	v(), j(), P();
}));
//#endregion
//#region resources/js/use-announced-reschedule.ts
function te(t, n, r) {
	let i = (0, g.useEffectDispatcher)();
	return { submitReschedule: e(async (e) => {
		let a = t.get(e.id);
		if (!a) return;
		let o = await n(e);
		if (o.accepted) {
			(0, g.announce)(r("calendar.rescheduled", "Rescheduled {{label}}", { label: a.label }));
			return;
		}
		let s = o.message ?? r("calendar.reschedule-failed", "Could not reschedule {{label}}", { label: a.label });
		i([{
			type: "toast",
			props: {
				message: s,
				variant: "danger"
			}
		}]), (0, g.announce)(s);
	}, [
		i,
		t,
		n,
		r
	]) };
}
var B = f((() => {
	v();
}));
//#endregion
//#region resources/js/views/month-view.tsx
function V(e) {
	return /* @__PURE__ */ new Date(`${e}T12:00:00Z`);
}
function H({ canReschedule: a, locale: c, month: l, onDayClick: u, onEventClick: d, onNavigate: f, state: p, t: m, today: h }) {
	let _ = r(null), v = r(null), y = r(null), [b, x] = i(null), [S, C] = i(!1), { events: w, isRescheduling: T, loading: E, reschedule: D } = p, { submitReschedule: O } = te(w, D, m), k = n(() => I(l, c, h), [
		l,
		c,
		h
	]), A = n(() => [...w.values()], [w]), j = n(() => new Intl.DateTimeFormat(c, {
		month: "long",
		year: "numeric"
	}).format(V(k.monthStart)), [k.monthStart, c]), P = n(() => new Intl.DateTimeFormat(c, { weekday: "short" }), [c]), F = n(() => new Intl.DateTimeFormat(c, { dateStyle: "full" }), [c]), L = (e) => e >= k.gridStart && e < k.gridEnd, R = b && L(b) ? b : L(h) ? h : k.monthStart;
	function ee(e) {
		v.current = e, x(e), L(e) || f((0, g.startOfMonthISO)(e));
	}
	t(() => {
		let e = v.current;
		if (!e) return;
		let t = _.current?.querySelector(`[data-date="${e}"]`);
		t && (v.current = null, t.focus());
	}), t(() => {
		let e = y.current;
		if (!e) return;
		let t = _.current?.querySelector(`[data-test="calendar-event-${e}"]`);
		t && (y.current = null, t.focus());
	});
	function z(e, t) {
		let n;
		switch (e.key) {
			case "ArrowLeft":
				n = (0, g.addDays)(t, -1);
				break;
			case "ArrowRight":
				n = (0, g.addDays)(t, 1);
				break;
			case "ArrowUp":
				n = (0, g.addDays)(t, -7);
				break;
			case "ArrowDown":
				n = (0, g.addDays)(t, 7);
				break;
			case "PageUp":
				n = (0, g.addMonths)(t, -1);
				break;
			case "PageDown":
				n = (0, g.addMonths)(t, 1);
				break;
			case "Enter":
			case " ":
				u && e.target === e.currentTarget && (e.preventDefault(), u(t));
				return;
			default: return;
		}
		e.preventDefault(), ee(n);
	}
	function B(e, t) {
		t !== 0 && O({
			id: e.id,
			resourceId: e.resourceId,
			...N(e, t)
		});
	}
	function H(e, t) {
		if (!a || T(t.id) || !e.ctrlKey || !e.shiftKey) return;
		let n;
		switch (e.key) {
			case "ArrowLeft":
				n = -1;
				break;
			case "ArrowRight":
				n = 1;
				break;
			case "ArrowUp":
				n = -7;
				break;
			case "ArrowDown":
				n = 7;
				break;
			default: return;
		}
		e.preventDefault(), y.current = t.id, B(t, n);
	}
	let U = e((e, t) => {
		let n = e.id, r = typeof e.grabOffsetDays == "number" ? e.grabOffsetDays : 0;
		if (typeof n != "string") return;
		let i = w.get(n);
		if (!i) return;
		let [a] = M(i), o = (0, g.daysBetween)(a, (0, g.addDays)(t, -r));
		o !== 0 && O({
			id: i.id,
			resourceId: i.resourceId,
			...N(i, o)
		});
	}, [w, O]);
	return /* @__PURE__ */ s("div", {
		className: "lt-calendar-month",
		"data-dragging": S ? "true" : void 0,
		ref: _,
		children: [/* @__PURE__ */ s("div", {
			className: "mb-2 flex items-center gap-1",
			children: [
				/* @__PURE__ */ o("button", {
					"aria-label": m("calendar.previous", "Previous"),
					className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
					onClick: () => f((0, g.addMonths)(k.monthStart, -1)),
					type: "button",
					children: /* @__PURE__ */ o(g.Icon, {
						className: "size-lt-icon-sm",
						name: "chevron-left"
					})
				}),
				/* @__PURE__ */ o("button", {
					"aria-label": m("calendar.next", "Next"),
					className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
					onClick: () => f((0, g.addMonths)(k.monthStart, 1)),
					type: "button",
					children: /* @__PURE__ */ o(g.Icon, {
						className: "size-lt-icon-sm",
						name: "chevron-right"
					})
				}),
				/* @__PURE__ */ o("button", {
					className: "rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted",
					onClick: () => f((0, g.startOfMonthISO)(h)),
					type: "button",
					children: m("calendar.today", "Today")
				}),
				/* @__PURE__ */ o("h2", {
					"aria-live": "polite",
					className: "ml-2 text-sm font-semibold",
					children: j
				})
			]
		}), /* @__PURE__ */ s("div", {
			"aria-busy": E || [...w.keys()].some((e) => T(e)),
			"aria-label": j,
			className: "overflow-hidden rounded-lt-sm border border-lt-border",
			role: "grid",
			children: [/* @__PURE__ */ o("div", {
				className: "lt-calendar-weekdays border-b border-lt-border",
				role: "row",
				children: k.weeks[0].days.map((e) => /* @__PURE__ */ o("div", {
					className: "px-2 py-1.5 text-xs font-medium text-lt-muted-fg",
					role: "columnheader",
					children: P.format(V(e.date))
				}, e.date))
			}), k.weeks.map((e, t) => /* @__PURE__ */ o(ne, {
				canReschedule: a,
				dayFormatter: F,
				eventList: A,
				first: t === 0,
				isRescheduling: T,
				locale: c,
				onCellKeyDown: z,
				onChipKeyDown: H,
				onDayClick: u,
				onDragStateChange: C,
				onEventClick: d,
				onEventDrop: U,
				t: m,
				tabStopDate: R,
				week: e
			}, e.start))]
		})]
	});
}
function ne({ canReschedule: e, dayFormatter: t, eventList: n, first: r, isRescheduling: i, locale: a, onCellKeyDown: c, onChipKeyDown: l, onDayClick: u, onDragStateChange: d, onEventClick: f, onEventDrop: p, t: m, tabStopDate: h, week: _ }) {
	let { chips: v } = L(n, _.start), { visible: y, hiddenByDay: b } = R(v, 3);
	return /* @__PURE__ */ s("div", {
		className: (0, g.cn)("lt-calendar-week", !r && "border-t border-lt-border"),
		role: "row",
		children: [_.days.map((r, i) => /* @__PURE__ */ o(U, {
			ariaLabel: t.format(V(r.date)),
			canReschedule: e,
			day: r,
			dayIndex: i,
			onDayClick: u,
			onEventDrop: p,
			onKeyDown: c,
			tabStop: r.date === h,
			children: b[i] > 0 ? /* @__PURE__ */ o(ie, {
				count: b[i],
				date: r.date,
				eventList: n,
				label: t.format(V(r.date)),
				locale: a,
				onEventClick: f,
				t: m
			}) : null
		}, r.date)), /* @__PURE__ */ o("div", {
			"aria-hidden": f || e ? void 0 : !0,
			className: "lt-calendar-chips",
			children: y.map((t) => /* @__PURE__ */ o(re, {
				canReschedule: e,
				chip: t,
				isRescheduling: i(t.id),
				locale: a,
				onDragStateChange: d,
				onEventClick: f,
				onMoveKeyDown: l,
				t: m,
				weekStart: _.start
			}, `${t.id}-${t.start}`))
		})]
	});
}
function U({ ariaLabel: e, canReschedule: n, children: a, day: c, dayIndex: l, onDayClick: u, onEventDrop: d, onKeyDown: f, tabStop: p }) {
	let m = r(null), [h, _] = i(!1);
	return t(() => {
		let e = m.current;
		if (!(!e || !n)) return (0, g.dropTargetForElements)({
			canDrop: ({ source: e }) => e.data.type === K,
			element: e,
			onDragEnter: () => _(!0),
			onDragLeave: () => _(!1),
			onDrop: ({ source: e }) => {
				_(!1), d(e.data, c.date);
			}
		});
	}, [
		n,
		c.date,
		d
	]), /* @__PURE__ */ s("div", {
		"aria-current": c.isToday ? "date" : void 0,
		"aria-label": e,
		className: (0, g.cn)("lt-calendar-day", l > 0 && "border-l border-lt-border", c.isWeekend && "bg-lt-muted/40", !c.inMonth && "text-lt-muted-fg", u && "cursor-pointer", h && "bg-lt-primary/10"),
		"data-date": c.date,
		"data-test": `calendar-day-${c.date}`,
		onClick: u ? () => u(c.date) : void 0,
		onKeyDown: (e) => f(e, c.date),
		ref: m,
		role: "gridcell",
		tabIndex: p ? 0 : -1,
		children: [
			/* @__PURE__ */ o("div", {
				className: "flex justify-end px-1.5 pt-1",
				children: /* @__PURE__ */ o("span", {
					className: (0, g.cn)("flex size-6 items-center justify-center rounded-full text-xs", c.isToday && "bg-lt-primary font-semibold text-lt-primary-fg", !c.isToday && !c.inMonth && "text-lt-muted-fg"),
					children: c.dayOfMonth
				})
			}),
			/* @__PURE__ */ o("div", { className: "flex-1" }),
			a
		]
	});
}
function W(e, t) {
	return /* @__PURE__ */ s(a, { children: [e.allDay ? null : /* @__PURE__ */ o("span", {
		className: "shrink-0 font-medium tabular-nums",
		children: (0, g.formatWallTime)(e.start, t)
	}), /* @__PURE__ */ o("span", {
		className: "truncate",
		children: e.label
	})] });
}
function G(e, t, n = !1) {
	return n ? t("calendar.event-chip-label-reschedulable", "{{label}}, {{start}} to {{end}}. Use Control Shift and arrow keys to reschedule.", {
		end: e.end,
		label: e.label,
		start: e.start
	}) : t("calendar.event-chip-label", "{{label}}, {{start}} to {{end}}", {
		end: e.end,
		label: e.label,
		start: e.start
	});
}
function re({ canReschedule: e, chip: n, isRescheduling: i, locale: a, onDragStateChange: s, onEventClick: c, onMoveKeyDown: l, t: u, weekStart: d }) {
	let f = r(null), { event: p, span: m, start: h } = n;
	t(() => {
		let t = f.current;
		if (!t || !e) return;
		let [n, r] = M(p), a = (0, g.daysBetween)(n, r), o = (0, g.daysBetween)(n, (0, g.addDays)(d, h));
		return (0, g.draggable)({
			canDrag: () => !i,
			element: t,
			getInitialData: ({ element: e, input: t }) => {
				let n = e.getBoundingClientRect(), r = n.width / m;
				return {
					grabOffsetDays: Math.max(0, Math.min(a - 1, o + Math.floor((t.clientX - n.left) / r))),
					id: p.id,
					type: K
				};
			},
			onDragStart: () => {
				s(!0), (0, g.announce)(u("calendar.dragging-day", "Moving {{label}}. Drop on a day.", { label: p.label }));
			},
			onDrop: () => s(!1)
		});
	}, [
		e,
		p,
		i,
		s,
		m,
		h,
		u,
		d
	]);
	let _ = (0, g.toneProps)((0, g.coerceColor)(n.event.color) ?? (0, g.namedColor)("primary")), v = (0, g.cn)("lt-calendar-chip mx-1 mb-0.5 flex items-center gap-1 overflow-hidden px-1.5 text-left text-xs", _.className, n.continuesBefore ? "rounded-l-none" : "rounded-l-lt-xs", n.continuesAfter ? "rounded-r-none" : "rounded-r-lt-xs", (c || e) && "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lt-primary", c && "cursor-pointer", e && !c && "cursor-grab"), y = {
		gridColumn: `${n.start + 1} / span ${n.span}`,
		gridRow: n.lane + 1,
		..._.style
	};
	return !c && !e ? /* @__PURE__ */ o("div", {
		className: v,
		"data-end": n.event.end,
		"data-start": n.event.start,
		"data-test": `calendar-event-${n.id}`,
		style: y,
		children: W(n.event, a)
	}) : /* @__PURE__ */ o("button", {
		"aria-disabled": i || void 0,
		"aria-keyshortcuts": e ? "Control+Shift+ArrowLeft Control+Shift+ArrowRight Control+Shift+ArrowUp Control+Shift+ArrowDown" : void 0,
		"aria-label": G(n.event, u, e),
		className: v,
		"data-end": n.event.end,
		"data-start": n.event.start,
		"data-test": `calendar-event-${n.id}`,
		onClick: c ? () => c(n.event) : void 0,
		onKeyDown: (e) => l(e, n.event),
		ref: f,
		style: y,
		title: n.event.label,
		type: "button",
		children: W(n.event, a)
	});
}
function ie({ count: e, date: t, eventList: n, label: r, locale: i, onEventClick: a, t: c }) {
	return /* @__PURE__ */ s(g.Popover, { children: [/* @__PURE__ */ o(g.PopoverTrigger, {
		"aria-label": c("calendar.show-events-for-day", "Show all events on {{date}}", { date: r }),
		className: "mx-1 mb-1 rounded-lt-xs px-1.5 py-0.5 text-left text-xs text-lt-muted-fg hover:bg-lt-muted",
		"data-test": `calendar-more-${t}`,
		onClick: (e) => e.stopPropagation(),
		onKeyDown: (e) => e.stopPropagation(),
		children: c("calendar.more-events", "+{{count}} more", { count: e })
	}), /* @__PURE__ */ s(g.PopoverContent, {
		className: "flex w-64 flex-col gap-1 p-2",
		"data-test": `calendar-more-list-${t}`,
		children: [/* @__PURE__ */ o("p", {
			className: "px-1 text-xs font-medium text-lt-muted-fg",
			children: r
		}), ee(n, t).map((e) => {
			let t = (0, g.toneProps)((0, g.coerceColor)(e.color) ?? (0, g.namedColor)("primary")), n = (0, g.cn)("lt-calendar-chip flex items-center gap-1 overflow-hidden rounded-lt-xs px-1.5 py-1 text-left text-xs", t.className, a && "cursor-pointer");
			return a ? /* @__PURE__ */ o("button", {
				"aria-label": G(e, c),
				className: n,
				onClick: () => a(e),
				style: t.style,
				type: "button",
				children: W(e, i)
			}, e.id) : /* @__PURE__ */ o("div", {
				className: n,
				style: t.style,
				children: W(e, i)
			}, e.id);
		})]
	})] });
}
var K, ae = f((() => {
	v(), z(), P(), B(), K = "lattice-calendar-month-event";
}));
//#endregion
//#region resources/js/views/timeline-view.tsx
function oe(e) {
	return e === "start" || e === "end";
}
function se(e) {
	return e.flatMap((e) => {
		if (e.resourceId === null) return [];
		let [t, n] = M(e);
		return [{
			...e,
			resourceId: e.resourceId,
			dayStart: t,
			dayEnd: n
		}];
	});
}
function q(e, t, n) {
	return t === "start" ? {
		id: e.id,
		resourceId: e.resourceId,
		start: n < e.dayEnd ? n : (0, g.addDays)(e.dayEnd, -1),
		end: e.dayEnd
	} : {
		id: e.id,
		resourceId: e.resourceId,
		start: e.dayStart,
		end: n > e.dayStart ? n : (0, g.addDays)(e.dayStart, 1)
	};
}
function ce(e, t, n) {
	let r = [];
	for (let i of e) {
		let e = Math.max(0, (0, g.daysBetween)(t, i.dayStart)), a = Math.min(n, (0, g.daysBetween)(t, i.dayEnd)) - e;
		a > 0 && r.push({
			id: i.id,
			start: e,
			span: a,
			event: i
		});
	}
	return A(r);
}
function le({ canReschedule: t, days: r, from: a, groups: c, locale: l, onNavigate: u, state: d, t: f, today: p }) {
	let [m, h] = i(pe), [_, v] = i(/* @__PURE__ */ new Set()), { events: y, eventsForResource: b, isRescheduling: x, loading: S, reschedule: C } = d, { submitReschedule: w } = te(y, C, f), T = n(() => c.flatMap((e) => e.resources), [c]), E = e((e) => se(b(e)), [b]), D = n(() => k(a, r, l, p), [
		a,
		r,
		l,
		p
	]), O = D.days.length > 0 ? (D.days[0].weekday + 6) % 7 : 0, A = (0, g.daysBetween)(a, p), j = A >= 0 && A < r, N = n(() => new Intl.DateTimeFormat(l, { weekday: "short" }), [l]);
	function P(e) {
		v((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		});
	}
	let F = e(async (e) => {
		let t = y.get(e.id);
		if (!t) return;
		let [n, r] = M(t);
		(t.resourceId !== e.resourceId || n !== e.start || r !== e.end) && await w(e);
	}, [y, w]), I = {
		"--lt-timeline-day-width": `${m}px`,
		"--lt-timeline-canvas-w": `calc(var(--lt-timeline-day-width) * ${r})`,
		"--lt-timeline-weekend-offset": O
	};
	return /* @__PURE__ */ s("div", {
		className: "lt-timeline",
		children: [/* @__PURE__ */ s("div", {
			className: "mb-2 flex items-center gap-1",
			children: [
				/* @__PURE__ */ o("button", {
					"aria-label": f("calendar.previous", "Previous"),
					className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
					onClick: () => u((0, g.addDays)(a, -7)),
					type: "button",
					children: /* @__PURE__ */ o(g.Icon, {
						className: "size-lt-icon-sm",
						name: "chevron-left"
					})
				}),
				/* @__PURE__ */ o("button", {
					"aria-label": f("calendar.next", "Next"),
					className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
					onClick: () => u((0, g.addDays)(a, me)),
					type: "button",
					children: /* @__PURE__ */ o(g.Icon, {
						className: "size-lt-icon-sm",
						name: "chevron-right"
					})
				}),
				/* @__PURE__ */ o("button", {
					className: "rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted",
					onClick: () => u((0, g.addDays)(p, -7)),
					type: "button",
					children: f("calendar.today", "Today")
				}),
				/* @__PURE__ */ s("div", {
					className: "ml-auto flex items-center gap-1",
					children: [/* @__PURE__ */ o("button", {
						"aria-label": f("calendar.zoom-out", "Zoom out"),
						className: "rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40",
						disabled: m <= Y,
						onClick: () => h((e) => Math.max(Y, e / Z)),
						type: "button",
						children: /* @__PURE__ */ o(g.Icon, {
							className: "size-lt-icon-sm",
							name: "minus"
						})
					}), /* @__PURE__ */ o("button", {
						"aria-label": f("calendar.zoom-in", "Zoom in"),
						className: "rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40",
						disabled: m >= X,
						onClick: () => h((e) => Math.min(X, e * Z)),
						type: "button",
						children: /* @__PURE__ */ o(g.Icon, {
							className: "size-lt-icon-sm",
							name: "plus"
						})
					})]
				})
			]
		}), /* @__PURE__ */ o("div", {
			"aria-busy": S || [...y.keys()].some((e) => x(e)),
			className: "lt-timeline-scroll rounded-lt-sm border border-lt-border",
			children: /* @__PURE__ */ s("div", {
				className: "lt-timeline-grid",
				style: I,
				children: [
					/* @__PURE__ */ o("div", { className: (0, g.cn)("lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-months lt-timeline-header-cell") }),
					/* @__PURE__ */ o("div", {
						className: (0, g.cn)("lt-timeline-sticky-row lt-timeline-row-months lt-timeline-header-cell"),
						children: D.months.map((e) => /* @__PURE__ */ o("div", {
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
						children: D.weeks.map((e) => /* @__PURE__ */ s("div", {
							className: "lt-timeline-segment flex items-center border-l border-lt-border px-2 text-xs text-lt-muted-fg",
							style: {
								left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
								width: `calc(var(--lt-timeline-day-width) * ${e.span})`
							},
							children: [
								f("calendar.week", "CW"),
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
							children: D.days.map((e) => /* @__PURE__ */ s("div", {
								className: (0, g.cn)("lt-timeline-day flex flex-col items-center justify-center border-l border-lt-border text-xs", e.isWeekend && "bg-lt-muted text-lt-muted-fg", e.isToday && "font-semibold text-lt-primary"),
								children: [/* @__PURE__ */ o("span", { children: N.format(/* @__PURE__ */ new Date(`${e.date}T12:00:00Z`)) }), /* @__PURE__ */ o("span", { children: e.dayOfMonth })]
							}, e.date))
						})
					}),
					c.map((e) => /* @__PURE__ */ o(ue, {
						collapsed: _.has(e.key),
						days: r,
						entriesForResource: E,
						from: a,
						group: e,
						isRescheduling: x,
						onReschedule: F,
						onToggle: () => P(e.key),
						resources: T,
						t: f,
						canReschedule: t,
						dayWidth: m
					}, e.key)),
					j ? /* @__PURE__ */ o("div", {
						"aria-hidden": "true",
						className: "lt-timeline-today-marker",
						style: { left: `calc(var(--lt-timeline-label-w) + var(--lt-timeline-day-width) * ${A})` }
					}) : null
				]
			})
		})]
	});
}
function ue({ canReschedule: e, collapsed: t, dayWidth: n, days: r, entriesForResource: i, from: c, group: l, isRescheduling: u, onReschedule: d, onToggle: f, resources: p, t: m }) {
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
		t ? null : l.resources.map((t) => /* @__PURE__ */ o(de, {
			canReschedule: e,
			dayWidth: n,
			days: r,
			entriesForResource: i,
			from: c,
			isRescheduling: u,
			onReschedule: d,
			resource: t,
			resources: p,
			t: m
		}, t.id))
	] });
}
function de({ canReschedule: e, dayWidth: n, days: c, entriesForResource: l, from: u, isRescheduling: d, onReschedule: f, resource: p, resources: m, t: h }) {
	let { bars: _, laneCount: v } = ce(l(p.id), u, c), y = `calc(${Math.max(v, 1)} * var(--lt-timeline-lane-height))`, b = r(null), [x, S] = i(!1);
	return t(() => {
		let t = b.current;
		if (!(!t || !e)) return (0, g.dropTargetForElements)({
			canDrop: ({ source: e }) => e.data.type === Q || e.data.type === $ && e.data.resourceId === p.id,
			element: t,
			getData: ({ element: e, input: t, source: r }) => {
				if (r.data.type === $) {
					let i = typeof r.data.grabOffsetPx == "number" ? r.data.grabOffsetPx : 0, a = Math.round((t.clientX - e.getBoundingClientRect().left - i) / n);
					return {
						boundary: (0, g.addDays)(u, a),
						type: $
					};
				}
				let i = typeof r.data.grabOffsetDays == "number" ? r.data.grabOffsetDays : 0, a = Math.floor((t.clientX - e.getBoundingClientRect().left) / n) - i;
				return {
					resourceId: p.id,
					start: (0, g.addDays)(u, a),
					type: Q
				};
			},
			onDragEnter: () => S(!0),
			onDragLeave: () => S(!1),
			onDrop: ({ self: e, source: t }) => {
				if (S(!1), t.data.type === $) {
					let { edge: n, end: r, id: i, resourceId: a, start: o } = t.data, s = e.data.boundary;
					if (!oe(n) || typeof s != "string" || typeof r != "string" || typeof i != "string" || typeof a != "string" || typeof o != "string") return;
					f(q({
						id: i,
						resourceId: a,
						dayStart: o,
						dayEnd: r
					}, n, s));
					return;
				}
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
		}), _.map((t) => /* @__PURE__ */ o(fe, {
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
function fe({ bar: e, canReschedule: n, dayWidth: a, days: c, from: l, isRescheduling: u, onReschedule: d, resource: f, resources: p, t: m }) {
	let h = r(null), _ = r(null), [v, y] = i(!1), b = (0, g.daysBetween)(e.event.dayStart, e.event.dayEnd), x = Math.max(0, (0, g.daysBetween)(e.event.dayStart, l)), S = (0, g.addDays)(l, c), C = (0, g.toneProps)((0, g.coerceColor)(e.event.color) ?? (0, g.namedColor)("primary"));
	t(() => {
		let t = h.current, r = _.current;
		if (!(!t || !r || !n)) return (0, g.draggable)({
			canDrag: () => !u,
			dragHandle: r,
			element: t,
			getInitialData: ({ element: t, input: n }) => ({
				durationDays: b,
				grabOffsetDays: Math.max(0, Math.min(b - 1, x + Math.floor((n.clientX - t.getBoundingClientRect().left) / a))),
				id: e.id,
				type: Q
			}),
			onDragStart: () => {
				y(!0), (0, g.announce)(m("calendar.dragging", "Moving {{label}}. Drop on a resource row.", { label: e.event.label }));
			},
			onDrop: () => y(!1)
		});
	}, [
		e.event.label,
		e.id,
		n,
		a,
		b,
		x,
		u,
		m
	]);
	function w(t) {
		if (!n || u || !t.ctrlKey || !t.shiftKey) return;
		let r = e.event.resourceId, i = e.event.dayStart, a = p.findIndex((e) => e.id === r);
		switch (t.key) {
			case "ArrowLeft":
				i = (0, g.addDays)(i, -1);
				break;
			case "ArrowRight":
				i = (0, g.addDays)(i, 1);
				break;
			case "ArrowUp":
				r = p[a - 1]?.id ?? r;
				break;
			case "ArrowDown":
				r = p[a + 1]?.id ?? r;
				break;
			default: return;
		}
		let o = (0, g.addDays)(i, b);
		i < l || o > (0, g.addDays)(l, c) || (t.preventDefault(), d({
			id: e.id,
			resourceId: r,
			start: i,
			end: o
		}));
	}
	return /* @__PURE__ */ s("div", {
		className: (0, g.cn)("lt-timeline-bar rounded-lt-xs", C.className, v && "opacity-60"),
		ref: h,
		style: {
			left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
			width: `calc(var(--lt-timeline-day-width) * ${e.span})`,
			top: `calc(${e.lane} * var(--lt-timeline-lane-height))`,
			height: "var(--lt-timeline-lane-height)",
			...C.style
		},
		children: [
			/* @__PURE__ */ o("button", {
				"aria-disabled": !n || u,
				"aria-keyshortcuts": "Control+Shift+ArrowLeft Control+Shift+ArrowRight Control+Shift+ArrowUp Control+Shift+ArrowDown",
				"aria-label": m("calendar.entry-label", "{{label}}, {{resource}}, {{start}} to {{end}}. Use Control Shift and arrow keys to reschedule.", {
					end: e.event.dayEnd,
					label: e.event.label,
					resource: f.label,
					start: e.event.dayStart
				}),
				className: (0, g.cn)("h-full w-full overflow-hidden rounded-lt-xs px-1.5 py-1 text-left text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary", n && "cursor-grab"),
				"data-end": e.event.dayEnd,
				"data-resource-id": e.event.resourceId,
				"data-start": e.event.dayStart,
				"data-test": `timeline-entry-${e.id}`,
				onKeyDown: w,
				ref: _,
				title: e.event.label,
				type: "button",
				children: e.event.label
			}),
			n && e.event.dayStart >= l ? /* @__PURE__ */ o(J, {
				edge: "start",
				event: e.event,
				from: l,
				isRescheduling: u,
				onReschedule: d,
				t: m,
				until: S
			}) : null,
			n && e.event.dayEnd <= S ? /* @__PURE__ */ o(J, {
				edge: "end",
				event: e.event,
				from: l,
				isRescheduling: u,
				onReschedule: d,
				t: m,
				until: S
			}) : null
		]
	});
}
function J({ edge: e, event: n, from: a, isRescheduling: s, onReschedule: c, t: l, until: u }) {
	let d = r(null), [f, p] = i(!1), m = e === "start" ? n.dayStart : n.dayEnd;
	t(() => {
		let t = d.current;
		if (t) return (0, g.draggable)({
			canDrag: () => !s,
			element: t,
			getInitialData: ({ element: t, input: r }) => {
				let i = t.getBoundingClientRect();
				return {
					edge: e,
					end: n.dayEnd,
					grabOffsetPx: r.clientX - (i.left + i.width / 2),
					id: n.id,
					resourceId: n.resourceId,
					start: n.dayStart,
					type: $
				};
			},
			onDragStart: () => {
				p(!0), (0, g.announce)(l(e === "start" ? "calendar.resizing-start" : "calendar.resizing-end", e === "start" ? "Resizing start of {{label}}." : "Resizing end of {{label}}.", { label: n.label }));
			},
			onDrop: () => p(!1)
		});
	}, [
		e,
		n,
		s,
		l
	]);
	function h(t) {
		if (s) return;
		let r = t.key === "ArrowLeft" ? -1 : +(t.key === "ArrowRight");
		if (r === 0) return;
		let i = (0, g.addDays)(m, r);
		e === "start" && i < a || e === "end" && i > u || (t.preventDefault(), c(q(n, e, i)));
	}
	let _ = (0, g.daysBetween)(a, m), v = e === "start" ? 0 : (0, g.daysBetween)(a, n.dayStart) + 1, y = e === "start" ? (0, g.daysBetween)(a, n.dayEnd) - 1 : (0, g.daysBetween)(a, u);
	return /* @__PURE__ */ o("div", {
		"aria-disabled": s,
		"aria-keyshortcuts": "ArrowLeft ArrowRight",
		"aria-label": l(e === "start" ? "calendar.resize-start" : "calendar.resize-end", e === "start" ? "Resize start of {{label}}" : "Resize end of {{label}}", { label: n.label }),
		"aria-orientation": "vertical",
		"aria-valuemax": y,
		"aria-valuemin": v,
		"aria-valuenow": _,
		"aria-valuetext": m,
		className: (0, g.cn)("absolute inset-y-0 z-[2] w-2 cursor-ew-resize touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary after:absolute after:inset-y-1 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-current after:opacity-50", e === "start" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2", f && "opacity-60"),
		"data-test": `timeline-resize-${e}-${n.id}`,
		onKeyDown: h,
		ref: d,
		role: "separator",
		tabIndex: 0
	});
}
var Y, X, pe, Z, me, Q, $, he = f((() => {
	v(), j(), P(), B(), Y = 10, X = 64, pe = 24, Z = 1.25, me = 7, Q = "lattice-calendar-entry", $ = "lattice-calendar-entry-resize";
})), ge = /* @__PURE__ */ p({ default: () => ye });
function _e(e) {
	let t = (0, g.startOfMonthISO)(e.date), n = e.views.includes("month") ? [(0, g.addDays)(t, -7), (0, g.addDays)((0, g.addMonths)(t, 1), 7)] : null, r = e.views.includes("timeline") ? [e.date, (0, g.addDays)(e.date, e.days)] : null;
	return n === null || r === null ? n ?? r ?? [e.date, (0, g.addDays)(e.date, e.days)] : [n[0] < r[0] ? n[0] : r[0], n[1] > r[1] ? n[1] : r[1]];
}
async function ve(e, t, n) {
	let r = e.props.endpoint;
	r && await (0, g.runAction)(() => (0, g.apiFetch)(r, {
		body: JSON.stringify(t),
		headers: { "Content-Type": "application/json" },
		method: e.props.method ?? "post",
		ref: e.props.ref ?? "",
		throwOnError: !1
	}), n);
}
var ye, be = f((() => {
	v(), E(), z(), ae(), he(), ye = ({ node: e }) => {
		let t = (0, g.nodeIdentity)(e), { t: n, locale: r } = (0, g.useT)("calendar"), a = (0, g.useEffectDispatcher)(), { date: c, dayAction: l, days: u, defaultView: d, eventAction: f, views: p } = e.props, [m, h] = i(d), [_, v] = i(() => (0, g.startOfMonthISO)(c)), [y, b] = i(c), [x] = i(() => (0, g.todayISO)((0, g.currentTimezone)())), [[S, C]] = i(() => _e(e.props)), w = T({
			endpoint: e.props.endpoint,
			componentRef: e.props.ref,
			initialEvents: e.props.events,
			initialFrom: S,
			initialTo: C
		});
		function E(e) {
			v(e);
			let [t] = F((0, g.addMonths)(e, -1), r), [, n] = F((0, g.addMonths)(e, 1), r);
			w.ensureRange(t, n);
		}
		function D(e) {
			b(e), w.ensureRange(e, (0, g.addDays)(e, u));
		}
		let O = f ? (e) => {
			ve(f, {
				eventId: e.id,
				...e.context
			}, a);
		} : null, k = l ? (e) => {
			ve(l, { date: e }, a);
		} : null, A = e.props.endpoint !== null && e.props.ref !== null && e.props.reschedulable, j = p.map((e) => ({
			data: null,
			value: e,
			label: e === "month" ? n("calendar.view-month", "Month") : n("calendar.view-timeline", "Timeline")
		}));
		return /* @__PURE__ */ s("div", {
			className: "lt-calendar",
			"data-lattice-component": t,
			children: [p.length > 1 ? /* @__PURE__ */ o("div", {
				className: "mb-3",
				children: /* @__PURE__ */ o(g.SegmentedControl, {
					"aria-label": n("calendar.view-switcher-label", "Calendar view"),
					name: "calendar-view",
					onValueChange: (e) => h(e),
					options: j,
					value: m
				})
			}) : null, m === "month" ? /* @__PURE__ */ o(H, {
				canReschedule: A,
				locale: r,
				month: _,
				onDayClick: k,
				onEventClick: O,
				onNavigate: E,
				state: w,
				t: n,
				today: x
			}) : /* @__PURE__ */ o(le, {
				canReschedule: A,
				days: u,
				from: y,
				groups: e.props.groups,
				locale: r,
				onNavigate: D,
				state: w,
				t: n,
				today: x
			})]
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
v();
var xe = {
	name: "lattice/calendar",
	components: { calendar: (0, g.lazyComponent)(() => Promise.resolve().then(() => (be(), ge))) },
	i18n: { namespace: "calendar" }
};
//#endregion
export { xe as default };
