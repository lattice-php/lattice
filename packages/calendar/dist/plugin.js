import { useCallback as e, useMemo as t, useRef as n, useState as r } from "react";
import { Fragment as i, jsx as a, jsxs as o } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var s = Object.defineProperty, c = Object.getOwnPropertyDescriptor, l = Object.getOwnPropertyNames, u = Object.prototype.hasOwnProperty, d = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, f = (e, t) => {
	let n = {};
	for (var r in e) s(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || s(n, Symbol.toStringTag, { value: "Module" }), n;
}, p = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = l(t), a = 0, o = i.length, d; a < o; a++) d = i[a], !u.call(e, d) && d !== n && s(e, d, {
		get: ((e) => t[e]).bind(null, d),
		enumerable: !(r = c(t, d)) || r.enumerable
	});
	return e;
}, m = (e, t, n) => (p(e, t, "default"), n && p(n, t, "default")), h = /* @__PURE__ */ f({});
import * as g from "@lattice-php/lattice/runtime";
m(h, g);
var _ = d((() => {}));
//#endregion
//#region resources/js/date-axis.ts
function v(e) {
	return /* @__PURE__ */ new Date(`${e}T12:00:00Z`);
}
function y(e) {
	return e.toISOString().slice(0, 10);
}
function b(e, t) {
	let n = v(e);
	return n.setUTCDate(n.getUTCDate() + t), y(n);
}
function x(e, t) {
	let n = v(e).getTime(), r = v(t).getTime();
	return Math.round((r - n) / E);
}
function S(e) {
	let t = v(e), n = (t.getUTCDay() + 6) % 7;
	t.setUTCDate(t.getUTCDate() - n + 3);
	let r = new Date(Date.UTC(t.getUTCFullYear(), 0, 4)), i = (r.getUTCDay() + 6) % 7;
	return r.setUTCDate(r.getUTCDate() - i + 3), 1 + Math.round((t.getTime() - r.getTime()) / (7 * E));
}
function C(e, t) {
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
function w(e, t, n, r) {
	let i = new Intl.DateTimeFormat(n, {
		month: "long",
		year: "numeric"
	}), a = [];
	for (let n = 0; n < t; n++) {
		let t = b(e, n), i = v(t), o = i.getUTCDay();
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
		weeks: C(t, (e) => String(S(a[e].date))),
		months: C(t, (e) => i.format(v(a[e].date)))
	};
}
function T(e) {
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
var E, D = d((() => {
	E = 864e5;
}));
//#endregion
//#region resources/js/timeline-state.ts
function O(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e[0] < t[0] ? -1 : +(e[0] > t[0])), n = [[t[0][0], t[0][1]]];
	for (let [e, r] of t.slice(1)) {
		let t = n[n.length - 1];
		e <= t[1] ? r > t[1] && (t[1] = r) : n.push([e, r]);
	}
	return n;
}
function k(e, t, n) {
	if (t >= n) return [];
	let r = O(e), i = [], a = t;
	for (let [e, t] of r) if (!(t <= a) && (e >= n || (e > a && i.push([a, e]), a = t > a ? t < n ? t : n : a, a >= n))) break;
	return a < n && i.push([a, n]), i;
}
function A({ endpoint: i, componentRef: a, initialEvents: o, initialFrom: s, days: c }) {
	let [l, u] = r(() => new Map(o.map((e) => [e.id, e]))), [d, f] = r(!1), p = n([[s, b(s, c)]]), m = n(/* @__PURE__ */ new Map()), g = e((e, t) => {
		if (!i || !a) return;
		let n = k(p.current, e, t);
		if (n.length === 0) return;
		let r = n[0][0], o = n[n.length - 1][1], s = `${r}:${o}`;
		if (m.current.has(s)) return;
		let c = (0, h.apiJson)(`${i}?from=${r}&to=${o}`, { ref: a }).then(({ events: e }) => {
			p.current = O([...p.current, [r, o]]), u((t) => {
				let n = new Map(t);
				for (let t of e) n.set(t.id, t);
				return n;
			});
		}).catch(() => {}).finally(() => {
			m.current.delete(s), f(m.current.size > 0);
		});
		m.current.set(s, c), f(!0);
	}, [a, i]), _ = e((e) => {
		let t = [];
		for (let n of l.values()) n.resourceId === e && t.push(n);
		return t;
	}, [l]);
	return t(() => ({
		events: l,
		eventsForResource: _,
		ensureRange: g,
		loading: d
	}), [
		l,
		_,
		g,
		d
	]);
}
var j = d((() => {
	_(), D();
})), M = /* @__PURE__ */ f({ default: () => H });
function N() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function P(e, t, n, r) {
	let i = [];
	for (let a of t(e)) {
		let e = Math.max(0, x(n, a.start)), t = Math.min(r, x(n, a.end)) - e;
		t > 0 && i.push({
			id: a.id,
			start: e,
			span: t,
			event: a
		});
	}
	return T(i);
}
function F({ collapsed: e, days: t, eventsForResource: n, from: r, group: s, onToggle: c, t: l }) {
	return /* @__PURE__ */ o(i, { children: [
		/* @__PURE__ */ o("div", {
			className: "lt-timeline-sticky-col flex items-center gap-1.5 border-t border-lt-border bg-lt-muted px-2 py-1.5 text-sm font-medium",
			children: [/* @__PURE__ */ a("button", {
				"aria-expanded": !e,
				"aria-label": e ? l("calendar.expand-group", "Expand {{label}}", { label: s.label }) : l("calendar.collapse-group", "Collapse {{label}}", { label: s.label }),
				onClick: c,
				type: "button",
				children: /* @__PURE__ */ a(h.Icon, {
					className: (0, h.cn)("size-lt-icon-sm shrink-0 transition-transform", !e && "rotate-90"),
					name: "chevron-right"
				})
			}), /* @__PURE__ */ a("span", { children: s.label })]
		}),
		/* @__PURE__ */ a("div", { className: "lt-timeline-group-header-canvas border-t border-lt-border bg-lt-muted" }),
		e ? null : s.resources.map((e) => /* @__PURE__ */ a(I, {
			days: t,
			eventsForResource: n,
			from: r,
			resource: e
		}, e.id))
	] });
}
function I({ days: e, eventsForResource: t, from: n, resource: r }) {
	let { bars: s, laneCount: c } = P(r.id, t, n, e), l = `calc(${Math.max(c, 1)} * var(--lt-timeline-lane-height))`;
	return /* @__PURE__ */ o(i, { children: [/* @__PURE__ */ a("div", {
		className: "lt-timeline-sticky-col flex items-center border-t border-lt-border px-2 text-sm text-lt-fg",
		style: { height: l },
		children: r.label
	}), /* @__PURE__ */ o("div", {
		className: "lt-timeline-resource-canvas border-t border-lt-border",
		style: { height: l },
		children: [/* @__PURE__ */ a("div", {
			className: "lt-timeline-weekend-strip",
			"aria-hidden": "true"
		}), s.map((e) => {
			let t = (0, h.toneProps)((0, h.coerceColor)(e.event.color) ?? (0, h.namedColor)("primary"));
			return /* @__PURE__ */ a("div", {
				className: (0, h.cn)("lt-timeline-bar rounded-lt-xs px-1.5 py-1 text-xs", t.className),
				style: {
					left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
					width: `calc(var(--lt-timeline-day-width) * ${e.span})`,
					top: `calc(${e.lane} * var(--lt-timeline-lane-height))`,
					height: "var(--lt-timeline-lane-height)",
					...t.style
				},
				title: e.event.label,
				children: e.event.label
			}, e.id);
		})]
	})] });
}
var L, R, z, B, V, H, U = d((() => {
	_(), D(), j(), L = 10, R = 64, z = 24, B = 1.25, V = 7, H = ({ node: e }) => {
		let n = (0, h.nodeIdentity)(e), { t: i, locale: s } = (0, h.useT)("calendar"), [c, l] = r(e.props.from), [u, d] = r(z), [f, p] = r(/* @__PURE__ */ new Set()), [m] = r(N), { days: g } = e.props, { eventsForResource: _, ensureRange: v, loading: y } = A({
			endpoint: e.props.endpoint,
			componentRef: e.props.ref,
			initialEvents: e.props.events,
			initialFrom: e.props.from,
			days: g
		}), S = t(() => w(c, g, s, m), [
			c,
			g,
			s,
			m
		]), C = S.days.length > 0 ? (S.days[0].weekday + 6) % 7 : 0, T = x(c, m), E = T >= 0 && T < g, D = t(() => new Intl.DateTimeFormat(s, { weekday: "short" }), [s]);
		function O(e) {
			l(e), v(e, b(e, g));
		}
		function k(e) {
			p((t) => {
				let n = new Set(t);
				return n.has(e) ? n.delete(e) : n.add(e), n;
			});
		}
		let j = {
			"--lt-timeline-day-width": `${u}px`,
			"--lt-timeline-canvas-w": `calc(var(--lt-timeline-day-width) * ${g})`,
			"--lt-timeline-weekend-offset": C
		};
		return /* @__PURE__ */ o("div", {
			className: "lt-timeline",
			"data-lattice-component": n,
			children: [/* @__PURE__ */ o("div", {
				className: "mb-2 flex items-center gap-1",
				children: [
					/* @__PURE__ */ a("button", {
						"aria-label": i("calendar.previous", "Previous"),
						className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
						onClick: () => O(b(c, -7)),
						type: "button",
						children: /* @__PURE__ */ a(h.Icon, {
							className: "size-lt-icon-sm",
							name: "chevron-left"
						})
					}),
					/* @__PURE__ */ a("button", {
						"aria-label": i("calendar.next", "Next"),
						className: "rounded-lt-sm p-1.5 hover:bg-lt-muted",
						onClick: () => O(b(c, V)),
						type: "button",
						children: /* @__PURE__ */ a(h.Icon, {
							className: "size-lt-icon-sm",
							name: "chevron-right"
						})
					}),
					/* @__PURE__ */ a("button", {
						className: "rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted",
						onClick: () => O(b(m, -7)),
						type: "button",
						children: i("calendar.today", "Today")
					}),
					/* @__PURE__ */ o("div", {
						className: "ml-auto flex items-center gap-1",
						children: [/* @__PURE__ */ a("button", {
							"aria-label": i("calendar.zoom-out", "Zoom out"),
							className: "rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40",
							disabled: u <= L,
							onClick: () => d((e) => Math.max(L, e / B)),
							type: "button",
							children: /* @__PURE__ */ a(h.Icon, {
								className: "size-lt-icon-sm",
								name: "minus"
							})
						}), /* @__PURE__ */ a("button", {
							"aria-label": i("calendar.zoom-in", "Zoom in"),
							className: "rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40",
							disabled: u >= R,
							onClick: () => d((e) => Math.min(R, e * B)),
							type: "button",
							children: /* @__PURE__ */ a(h.Icon, {
								className: "size-lt-icon-sm",
								name: "plus"
							})
						})]
					})
				]
			}), /* @__PURE__ */ a("div", {
				"aria-busy": y,
				className: "lt-timeline-scroll rounded-lt-sm border border-lt-border",
				children: /* @__PURE__ */ o("div", {
					className: "lt-timeline-grid",
					style: j,
					children: [
						/* @__PURE__ */ a("div", { className: (0, h.cn)("lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-months lt-timeline-header-cell") }),
						/* @__PURE__ */ a("div", {
							className: (0, h.cn)("lt-timeline-sticky-row lt-timeline-row-months lt-timeline-header-cell"),
							children: S.months.map((e) => /* @__PURE__ */ a("div", {
								className: "lt-timeline-segment flex items-center border-l border-lt-border px-2 text-xs font-medium text-lt-fg",
								style: {
									left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
									width: `calc(var(--lt-timeline-day-width) * ${e.span})`
								},
								children: e.label
							}, `${e.start}-${e.label}`))
						}),
						/* @__PURE__ */ a("div", { className: (0, h.cn)("lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-weeks lt-timeline-header-cell") }),
						/* @__PURE__ */ a("div", {
							className: (0, h.cn)("lt-timeline-sticky-row lt-timeline-row-weeks lt-timeline-header-cell"),
							children: S.weeks.map((e) => /* @__PURE__ */ o("div", {
								className: "lt-timeline-segment flex items-center border-l border-lt-border px-2 text-xs text-lt-muted-fg",
								style: {
									left: `calc(var(--lt-timeline-day-width) * ${e.start})`,
									width: `calc(var(--lt-timeline-day-width) * ${e.span})`
								},
								children: [
									i("calendar.week", "CW"),
									" ",
									e.label
								]
							}, `${e.start}-${e.label}`))
						}),
						/* @__PURE__ */ a("div", { className: (0, h.cn)("lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-days lt-timeline-header-cell") }),
						/* @__PURE__ */ a("div", {
							className: (0, h.cn)("lt-timeline-sticky-row lt-timeline-row-days lt-timeline-header-cell"),
							children: /* @__PURE__ */ a("div", {
								className: "lt-timeline-days-row",
								children: S.days.map((e) => /* @__PURE__ */ o("div", {
									className: (0, h.cn)("lt-timeline-day flex flex-col items-center justify-center border-l border-lt-border text-xs", e.isWeekend && "bg-lt-muted text-lt-muted-fg", e.isToday && "font-semibold text-lt-primary"),
									children: [/* @__PURE__ */ a("span", { children: D.format(/* @__PURE__ */ new Date(`${e.date}T12:00:00Z`)) }), /* @__PURE__ */ a("span", { children: e.dayOfMonth })]
								}, e.date))
							})
						}),
						e.props.groups.map((e) => /* @__PURE__ */ a(F, {
							collapsed: f.has(e.key),
							days: g,
							eventsForResource: _,
							from: c,
							group: e,
							onToggle: () => k(e.key),
							t: i
						}, e.key)),
						E ? /* @__PURE__ */ a("div", {
							"aria-hidden": "true",
							className: "lt-timeline-today-marker",
							style: { left: `calc(var(--lt-timeline-label-w) + var(--lt-timeline-day-width) * ${T})` }
						}) : null
					]
				})
			})]
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
_();
var W = {
	name: "lattice/calendar",
	components: { timeline: (0, h.lazyComponent)(() => Promise.resolve().then(() => (U(), M))) },
	i18n: { namespace: "calendar" }
};
//#endregion
export { W as default };
