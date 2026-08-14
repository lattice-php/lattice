import { useCallback as e, useEffect as t, useMemo as n, useRef as r, useState as i } from "react";
import { jsx as a, jsxs as o } from "react/jsx-runtime";
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
//#region resources/js/lib/transport.ts
function v(e) {
	try {
		return JSON.parse(e);
	} catch {
		return null;
	}
}
function y(e) {
	return async function* (t) {
		let n = await e(t);
		if (!n.ok || !n.body) throw Error(`Chat stream failed (${n.status})`);
		yield* x(n.body);
	};
}
function b(e) {
	return y(({ url: t, body: n, signal: r }) => (0, h.remoteFetch)(t, {
		remote: e,
		method: "POST",
		signal: r,
		headers: {
			Accept: "application/x-ndjson",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(n),
		throwOnError: !1
	}));
}
async function* x(e) {
	let t = e.getReader(), n = new TextDecoder(), r = "";
	try {
		for (;;) {
			let { done: e, value: i } = await t.read();
			if (e) break;
			r += n.decode(i, { stream: !0 });
			let a = r.split("\n");
			r = a.pop() ?? "";
			for (let e of a) {
				if (e.trim() === "") continue;
				let t = v(e);
				t && (yield t);
			}
		}
		if (r += n.decode(), r.trim() !== "") {
			let e = v(r);
			e && (yield e);
		}
	} finally {
		await t.cancel().catch(() => {});
	}
}
var S, C = d((() => {
	_(), S = y(({ url: e, body: t, signal: n }) => (0, h.apiFetch)(e, {
		method: "POST",
		signal: n,
		headers: { Accept: "application/x-ndjson" },
		body: JSON.stringify(t),
		throwOnError: !1
	}));
}));
//#endregion
//#region resources/js/hooks/use-chat.ts
function w() {
	return A += 1, `chat-${A}`;
}
function T(e) {
	return e instanceof DOMException && e.name === "AbortError";
}
function E(e) {
	return e instanceof Error ? e.message : String(e);
}
function D(e) {
	let t = e.at(-1);
	return t !== void 0 && t.role === "assistant";
}
function O(e, t) {
	if (!D(e)) return e;
	let n = e.length - 1, r = e[n];
	if (t.type === "text") {
		let i = [...r.parts], a = i.length - 1, o = i[a];
		o !== void 0 && o.type === "chat.part.text" ? i[a] = {
			type: "chat.part.text",
			props: { text: `${o.props.text}${t.value}` }
		} : i.push({
			type: "chat.part.text",
			props: { text: t.value }
		});
		let s = [...e];
		return s[n] = {
			...r,
			parts: i
		}, s;
	}
	if (t.type === "part") {
		let i = [...e];
		return i[n] = {
			...r,
			parts: [...r.parts, t.part]
		}, i;
	}
	return e;
}
function k({ endpoint: n, transport: a = S, initialMessages: o = [], generateId: s = w }) {
	let [c, l] = i(o), [u, d] = i("idle"), [f, p] = i(null), m = r(null), h = r(null), g = r(c);
	g.current = c;
	let _ = e((e) => {
		g.current = e, l(e);
	}, []), v = e(async (e, t) => {
		m.current?.abort();
		let r = new AbortController();
		m.current = r, p(null), d("submitted");
		let i = {
			id: s(),
			role: "user",
			parts: [{
				type: "chat.part.text",
				props: { text: t }
			}]
		}, o = {
			id: s(),
			role: "assistant",
			parts: []
		};
		_([
			...e,
			i,
			o
		]), d("streaming");
		try {
			for await (let e of a({
				url: n,
				body: { message: t },
				signal: r.signal
			})) {
				if (e.type === "done") {
					d("idle");
					continue;
				}
				if (e.type === "error") {
					p(e.message ?? "Chat failed"), d("error");
					continue;
				}
				_(O(g.current, e));
			}
			d((e) => e === "streaming" || e === "submitted" ? "idle" : e);
		} catch (e) {
			if (T(e)) {
				d("idle");
				return;
			}
			p(E(e)), d("error");
		}
	}, [
		_,
		n,
		s,
		a
	]), y = e((e) => {
		let t = e.trim();
		t !== "" && (h.current = t, v(g.current, t));
	}, [v]), b = e(() => {
		m.current?.abort(), d("idle");
	}, []), x = e(() => {
		let e = h.current;
		if (e === null) return;
		let t = g.current, n = D(t) ? t.slice(0, -2) : t;
		v(n, e);
	}, [v]);
	return t(() => () => {
		m.current?.abort();
	}, []), {
		messages: c,
		status: u,
		error: f,
		sendMessage: y,
		setMessages: _,
		stop: b,
		regenerate: x
	};
}
var A, j = d((() => {
	C(), A = 0;
}));
//#endregion
//#region resources/js/components/message.tsx
function M({ message: e }) {
	let t = e.role === "user";
	return /* @__PURE__ */ a("div", {
		className: (0, h.cn)("flex flex-col gap-1", t ? "items-end" : "items-start"),
		"data-test": (0, h.testIdentity)(`chat-message-${e.role}`),
		children: /* @__PURE__ */ a("div", {
			className: (0, h.cn)("max-w-[80%] rounded-lt px-3 py-2 text-sm", t ? "bg-lt-primary text-lt-primary-fg" : "bg-lt-muted text-lt-fg"),
			children: e.parts.map((e, t) => /* @__PURE__ */ a(h.RenderNode, { node: e }, e.key ?? t))
		})
	});
}
var N = d((() => {
	_();
}));
//#endregion
//#region resources/js/components/message-list.tsx
function P({ messages: e }) {
	let n = r(null), i = e.at(-1), s = i?.parts.at(-1) === void 0 ? 0 : JSON.stringify(i.parts.at(-1)).length;
	return t(() => {
		n.current && typeof n.current.scrollIntoView == "function" && n.current.scrollIntoView({ behavior: "smooth" });
	}, [e.length, s]), /* @__PURE__ */ o("div", {
		className: "flex flex-col gap-2 overflow-y-auto p-3",
		"data-test": (0, h.testIdentity)("chat-messages"),
		children: [e.map((e) => /* @__PURE__ */ a(M, { message: e }, e.id)), /* @__PURE__ */ a("div", { ref: n })]
	});
}
var F = d((() => {
	_(), N();
}));
//#endregion
//#region resources/js/components/prompt-input.tsx
function I({ onSubmit: e, disabled: t = !1, placeholder: n }) {
	let { t: r } = (0, h.useT)("chat"), [s, c] = i("");
	function l() {
		let n = s.trim();
		n === "" || t || (e(n), c(""));
	}
	function u(e) {
		e.key === "Enter" && !e.shiftKey && (e.preventDefault(), l());
	}
	return /* @__PURE__ */ o("div", {
		className: "flex items-end gap-2 border-t border-lt-border p-3",
		children: [/* @__PURE__ */ a("textarea", {
			"aria-label": r("chat.input-label", "Message input"),
			className: (0, h.cn)("min-h-[2.5rem] flex-1 resize-none rounded-lt-sm border border-lt-input bg-lt-bg px-3 py-2 text-sm text-lt-fg placeholder:text-lt-muted-fg focus:outline-none focus:ring-[length:var(--lt-ring-width)] focus:ring-lt-ring/50 disabled:bg-lt-disabled disabled:text-lt-disabled-fg"),
			"data-slot": "prompt-input",
			"data-test": (0, h.testIdentity)("chat-input"),
			disabled: t,
			onChange: (e) => c(e.target.value),
			onKeyDown: u,
			placeholder: n,
			rows: 1,
			value: s
		}), /* @__PURE__ */ a(h.Button, {
			"data-test": (0, h.testIdentity)("chat-send"),
			disabled: t,
			onClick: l,
			size: "sm",
			type: "button",
			children: r("chat.send", "Send")
		})]
	});
}
var L = d((() => {
	_();
})), R = /* @__PURE__ */ f({
	ChatBox: () => z,
	default: () => z
}), z, B = d((() => {
	_(), C(), j(), F(), L(), z = ({ node: i }) => {
		let s = i.props, { t: c } = (0, h.useT)("chat"), l = n(() => s.remote ? b(s.remote) : S, [s.remote]), { messages: u, status: d, error: f, sendMessage: p, setMessages: m } = k({
			endpoint: s.streamEndpoint ?? "",
			transport: l
		}), g = r(!1), _ = e(async () => {
			if (g.current || !s.historyEndpoint) return;
			if (g.current = !0, s.remote) {
				let e = await (0, h.remoteJson)(s.historyEndpoint, { remote: s.remote });
				m(e.messages);
				return;
			}
			let e = await (0, h.apiFetch)(s.historyEndpoint, { throwOnError: !1 });
			if (!e.ok) return;
			let t = await e.json();
			m(t.messages);
		}, [
			s.historyEndpoint,
			s.remote,
			m
		]);
		t(() => {
			_().catch(() => {});
		}, [_]);
		let v = d === "submitted" || d === "streaming" || !s.streamEndpoint;
		return /* @__PURE__ */ o("div", {
			className: (0, h.cn)("flex flex-col overflow-hidden border border-lt-border bg-lt-bg", s.fill ? "sticky top-0 h-full min-h-[28rem] w-full" : "h-[28rem] w-80 rounded-lt shadow-lt-lg"),
			"data-test": (0, h.testIdentity)("chat-box"),
			children: [
				/* @__PURE__ */ a("div", {
					className: "flex items-center border-b border-lt-border px-3 py-2",
					children: /* @__PURE__ */ a("span", {
						className: "text-sm font-medium text-lt-fg",
						children: s.title ?? c("chat.title", "Chat")
					})
				}),
				/* @__PURE__ */ a("div", {
					className: "flex-1 overflow-y-auto",
					children: /* @__PURE__ */ a(P, { messages: u })
				}),
				f ? /* @__PURE__ */ a("div", {
					className: "border-t border-lt-danger/40 px-3 py-2 text-xs text-lt-danger",
					children: f
				}) : null,
				/* @__PURE__ */ a(I, {
					disabled: v,
					onSubmit: p,
					placeholder: s.placeholder ?? void 0
				})
			]
		});
	};
})), V = /* @__PURE__ */ f({
	TextPart: () => H,
	default: () => H
}), H, U = d((() => {
	H = ({ node: e }) => /* @__PURE__ */ a("div", {
		className: "whitespace-pre-wrap text-sm",
		children: e.props.text
	});
})), W = /* @__PURE__ */ f({
	ToolCallPart: () => G,
	default: () => G
}), G, K = d((() => {
	_(), G = ({ node: e }) => /* @__PURE__ */ o("div", {
		className: "mt-1 inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 font-mono text-xs text-lt-muted-fg",
		"data-test": (0, h.testIdentity)("chat-tool-call"),
		children: [
			"🔧 ",
			e.props.name,
			"(",
			JSON.stringify(e.props.args),
			")"
		]
	});
}));
//#endregion
//#region resources/js/plugin.ts
_();
var q = {
	name: "lattice/chat",
	components: {
		"chat.box": (0, h.lazyComponent)(() => Promise.resolve().then(() => (B(), R))),
		"chat.part.text": (0, h.lazyComponent)(() => Promise.resolve().then(() => (U(), V))),
		"chat.part.tool-call": (0, h.lazyComponent)(() => Promise.resolve().then(() => (K(), W)))
	},
	i18n: { namespace: "chat" }
};
//#endregion
export { q as default };
