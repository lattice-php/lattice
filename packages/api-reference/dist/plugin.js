import { useEffect as e, useId as t, useMemo as n, useRef as r, useState as i } from "react";
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
//#region resources/js/api-reference/http-method-color.ts
function y(e) {
	switch (e) {
		case "GET": return "info";
		case "POST": return "success";
		case "PUT":
		case "PATCH": return "warning";
		case "DELETE": return "danger";
		default: return "default";
	}
}
var b = f((() => {}));
//#endregion
//#region resources/js/api-reference/utils.ts
function x(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function ee(e) {
	return JSON.stringify(e, null, 2) ?? "";
}
function te(e) {
	return typeof e == "object" && !!e && "name" in e && e.name === "AbortError";
}
function S(e) {
	return [e.status, e.mediaType].filter((e) => !!e).join(" ") || "default";
}
var C = f((() => {}));
//#endregion
//#region resources/js/api-reference/schema-example.ts
function w(e, t) {
	return O(e, t, /* @__PURE__ */ new Set(), "complete");
}
function T(e, t) {
	return D(e, t, "complete");
}
function E(e, t) {
	return D(e, t, "request");
}
function D(e, t, n) {
	let r = e.examples.find((e) => e.value !== void 0);
	return r === void 0 ? O(e.schema, t, /* @__PURE__ */ new Set(), n) : r.value;
}
function O(e, t, n, r) {
	if (!x(e)) return null;
	let i = e.example;
	if (i !== void 0) return i;
	if (Array.isArray(e.examples) && e.examples.length > 0) return e.examples[0];
	let a = e.default;
	return a === void 0 ? e.const === void 0 ? Array.isArray(e.enum) && e.enum.length > 0 ? e.enum[0] : M([
		ne(e, t, n, r),
		...k(e.allOf, t, n, r),
		A(e, t, n, r),
		j(e, t, n, r)
	]) : e.const : a;
}
function ne(e, t, n, r) {
	let i = P(e);
	if (i === null || n.has(i)) return null;
	let a = re(i, t);
	if (a === null) return null;
	n.add(i);
	let o = O(a, t, n, r);
	return n.delete(i), o;
}
function k(e, t, n, r) {
	return Array.isArray(e) ? e.map((e) => O(e, t, n, r)) : [];
}
function A(e, t, n, r) {
	let i = Array.isArray(e.oneOf) ? e.oneOf : e.anyOf;
	if (!Array.isArray(i)) return null;
	for (let e of i) {
		let i = O(e, t, n, r);
		if (i !== null) return i;
	}
	return null;
}
function j(e, t, n, r) {
	let i = Array.isArray(e.type) ? e.type.find((e) => e !== "null") : e.type;
	return i === "object" || x(e.properties) ? F(e.properties, e.required, t, n, r) : i === "array" ? [O(e.items, t, n, r)] : i === "string" ? N(e.format) : i === "integer" || i === "number" ? 0 : i !== "boolean" && null;
}
function M(e) {
	let t = e.filter(x);
	return t.length > 0 ? Object.assign({}, ...t) : e.find((e) => e !== null) ?? null;
}
function N(e) {
	switch (e) {
		case "email": return "user@example.com";
		case "uri":
		case "url": return "https://example.com";
		case "uuid": return "00000000-0000-4000-8000-000000000000";
		case "date": return "1970-01-01";
		case "date-time": return "1970-01-01T00:00:00Z";
		default: return "string";
	}
}
function P(e) {
	return typeof e.$ref != "string" || !e.$ref.startsWith(I) ? null : e.$ref;
}
function re(e, t) {
	if (!x(t) || !x(t.schemas)) return null;
	let n = e.slice(21);
	return n === "" || !(n in t.schemas) ? null : t.schemas[n];
}
function F(e, t, n, r, i) {
	if (!x(e)) return {};
	let a = new Set(Array.isArray(t) ? t.filter((e) => typeof e == "string") : []);
	return Object.fromEntries(Object.entries(e).filter(([e, t]) => i === "complete" || a.has(e) && (!x(t) || t.readOnly !== !0)).map(([e, t]) => [e, O(t, n, r, i)]));
}
var I, L = f((() => {
	C(), I = "#/components/schemas/";
}));
//#endregion
//#region resources/js/api-reference/parameter-schema.ts
function R(e) {
	if (!x(e)) return "any";
	if (typeof e.$ref == "string") return e.$ref.split("/").pop() ?? "ref";
	for (let [t, n] of [
		["oneOf", " | "],
		["anyOf", " | "],
		["allOf", " & "]
	]) {
		let r = e[t];
		if (Array.isArray(r) && r.length > 0) return [...new Set(r.map(R))].join(n);
	}
	return Array.isArray(e.type) ? e.type.join(" | ") : typeof e.type == "string" ? e.type === "array" && e.items ? `${R(e.items)}[]` : e.type : Array.isArray(e.enum) ? "enum" : "any";
}
function z(e) {
	return x(e) ? Array.isArray(e.enum) ? e.enum.map(ie) : e.type === "array" && x(e.items) && Array.isArray(e.items.enum) ? e.items.enum.map(ie) : [] : [];
}
function ie(e) {
	return typeof e == "string" ? e : JSON.stringify(e) ?? String(e);
}
var B = f((() => {
	C();
}));
//#endregion
//#region resources/js/api-reference/operation-markdown.ts
function ae(e, t) {
	return [
		[
			`# ${e.summary.title}`,
			`\`${e.summary.method} ${e.summary.path}\``,
			e.description
		].filter((e) => !!e).join("\n\n"),
		oe(e.security),
		ce(e.paramGroups.flatMap((e) => e.params)),
		de(e.requests, t),
		pe(e.responses, t)
	].filter((e) => !!e).join("\n\n");
}
function oe(e) {
	return e.length === 0 ? null : ["## Authorization", e.map((e) => se(e)).map((e, t) => t === 0 ? `- ${e}` : `- OR\n- ${e}`).join("\n")].join("\n\n");
}
function se(e) {
	return e.schemes.length === 0 ? "optional authentication" : e.schemes.map((e) => e.scopes.length > 0 ? `${e.name} (${e.scopes.join(", ")})` : e.name).join(" + ");
}
function ce(e) {
	return e.length === 0 ? null : ["## Parameters", le(e)].join("\n\n");
}
function le(e) {
	return [
		"| Name | In | Type | Required | Description |",
		"| --- | --- | --- | --- | --- |",
		...e.map((e) => `| ${ve(e.name)} | ${ve(e.location)} | ${ve(R(e.schema))} | ${e.required ? "yes" : "no"} | ${ve(ue(e))} |`)
	].join("\n");
}
function ue(e) {
	let t = z(e.schema), n = t.length === 0 ? null : `Available values: ${t.map((e) => `\`${e}\``).join(", ")}`, r = [e.description, n].filter((e) => !!e);
	return r.length === 0 ? null : r.join("\n");
}
function de(e, t) {
	return e.length === 0 ? null : ["## Request body", ...e.map((e) => fe(e, t))].join("\n\n");
}
function fe(e, t) {
	return [
		e.mediaType ? `**Content-Type:** \`${e.mediaType}\`` : "**Content-Type:** unspecified",
		e.title,
		he(e, t, 3)
	].filter((e) => !!e).join("\n\n");
}
function pe(e, t) {
	return e.length === 0 ? null : ["## Responses", ...e.map((e) => me(e, t))].join("\n\n");
}
function me(e, t) {
	return [
		`### ${S(e)}`,
		e.title,
		e.headers.length > 0 ? ["#### Headers", le(e.headers)].join("\n\n") : null,
		he(e, t, 4)
	].filter((e) => !!e).join("\n\n");
}
function he(e, t, n) {
	let r = [];
	e.schema !== null && r.push([`${"#".repeat(n)} Schema`, _e(e.schema)].filter((e) => !!e).join("\n\n"));
	let i = e.examples.length > 0 ? e.examples : e.schema === null ? [] : [{
		name: null,
		summary: null,
		value: e.role === "request" ? E(e, t) : T(e, t)
	}];
	r.push(...i.map((e) => ge(e, n)));
	let a = r.filter((e) => !!e);
	return a.length === 0 ? null : a.join("\n\n");
}
function ge(e, t) {
	let n = e.name ? `Example: ${e.name}` : "Example";
	return [
		`${"#".repeat(t)} ${n}`,
		e.summary,
		e.description,
		e.externalValue ? `[Open external example](${e.externalValue})` : null,
		_e(e.value)
	].filter((e) => !!e).join("\n\n");
}
function _e(e) {
	let t = JSON.stringify(e, null, 2);
	return t === void 0 ? null : `\`\`\`json\n${t}\n\`\`\``;
}
function ve(e) {
	return (e ?? "").replaceAll("|", "\\|").replaceAll(/\r?\n/g, "<br>");
}
var ye = f((() => {
	L(), B(), C();
}));
//#endregion
//#region resources/js/api-reference/parse.ts
function be(e) {
	return e.replaceAll("/", "-").replaceAll("{", "").replaceAll("}", "").replace(/^-+|-+$/g, "");
}
function xe(e, t) {
	let n = be(t);
	return n === "" ? `${e}-root` : `${e}-${n}`;
}
function Se(e, t, n) {
	return typeof e.summary == "string" && e.summary !== "" ? e.summary : typeof e.operationId == "string" && e.operationId !== "" ? e.operationId : `${t.toUpperCase()} ${n}`;
}
function V(e, t, n) {
	if (typeof t != "string") return null;
	let r = t.split("/").pop();
	return r ? e?.components?.[n]?.[r] ?? null : null;
}
function Ce(e, t) {
	let n = e.paths ?? {};
	for (let e of Object.keys(n)) {
		let r = n[e];
		for (let n of He) {
			let i = r[n];
			if (!(!i || typeof i != "object") && xe(n, e) === t) return {
				path: e,
				method: n,
				pathItem: r,
				operation: i
			};
		}
	}
	return null;
}
function we(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e?.url == "string").map((e) => ({
		url: Te(e.url, e.variables),
		description: e.description ?? null
	})) : [];
}
function Te(e, t) {
	return t ? e.replaceAll(/\{([^{}]+)\}/g, (e, n) => {
		let r = t[n]?.default;
		return r === void 0 ? e : String(r);
	}) : e;
}
function Ee(e) {
	let t = we(e.servers);
	return t.length > 0 ? t : [{
		url: "/",
		description: null
	}];
}
function De(e) {
	let t = Ve(e), n = {
		title: t.info?.title ?? "",
		version: t.info?.version ?? null,
		description: t.info?.description ?? null
	}, r = {}, i = /* @__PURE__ */ new Map(), a = t.paths ?? {};
	for (let e of Object.keys(a)) {
		let t = a[e];
		for (let n of He) {
			let a = t[n];
			if (!a || typeof a != "object") continue;
			let o = xe(n, e);
			r[o] = {
				id: o,
				method: n.toUpperCase(),
				path: e,
				title: Se(a, n, e),
				deprecated: !!a.deprecated
			};
			let s = a.tags && a.tags.length > 0 ? a.tags : [We];
			for (let e of s) {
				let t = i.get(e) ?? [];
				t.push(o), i.set(e, t);
			}
		}
	}
	return {
		info: n,
		groups: Array.from(i.entries()).map(([e, t]) => ({
			id: Oe(e),
			title: e,
			operationIds: t
		})),
		summaries: r,
		servers: Ee(t)
	};
}
function Oe(e) {
	return e.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function ke(e, t) {
	let n = t.schema ?? {};
	return {
		name: t.name,
		location: t.in,
		required: !!t.required,
		deprecated: !!t.deprecated,
		description: t.description ?? null,
		schema: n,
		example: Ae(e, t, n),
		...t.style === void 0 ? {} : { style: t.style },
		...t.explode === void 0 ? {} : { explode: t.explode }
	};
}
function Ae(e, t, n) {
	if (t.example !== void 0) return t.example;
	let r = je(e, t.examples);
	if (r !== void 0) return r;
	let i = Me(n, "example");
	if (i !== void 0) return i;
	let a = Me(n, "examples");
	return Array.isArray(a) && a.length > 0 ? a[0] : Me(n, "default") ?? null;
}
function je(e, t) {
	if (t) for (let n of Object.values(t)) {
		let t = n.$ref ? V(e, n.$ref, "examples") ?? n : n;
		if (t.value !== void 0) return t.value;
	}
}
function Me(e, t) {
	if (!(typeof e != "object" || !e || !(t in e))) return e[t];
}
function Ne(e, t) {
	return t ? Object.entries(t).map(([t, n]) => ke(e, {
		...n.$ref ? V(e, n.$ref, "headers") ?? n : n,
		name: t,
		in: "header"
	})) : [];
}
function Pe(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of [t, n]) for (let t of i) {
		let n = t.$ref ? V(e, t.$ref, "parameters") ?? t : t;
		r.set(`${n.in}::${n.name}`, n);
	}
	let i = /* @__PURE__ */ new Map();
	for (let t of r.values()) {
		let n = i.get(t.in) ?? [];
		n.push(ke(e, t)), i.set(t.in, n);
	}
	let a = [];
	for (let e of Ue) {
		let t = i.get(e);
		t && t.length > 0 && a.push({
			location: e,
			params: t
		});
	}
	return a;
}
function Fe(e, t) {
	if (!t) return [];
	let n = t.examples;
	return n && Object.keys(n).length > 0 ? Object.entries(n).map(([t, n]) => {
		let r = n && typeof n == "object" && "$ref" in n ? V(e, n.$ref, "examples") ?? n : n;
		return {
			name: t,
			summary: r?.summary ?? null,
			...r?.description === void 0 ? {} : { description: r.description },
			...r?.externalValue === void 0 ? {} : { externalValue: r.externalValue },
			value: r?.value
		};
	}) : t.example === void 0 ? [] : [{
		name: null,
		summary: null,
		value: t.example
	}];
}
function Ie(e, t) {
	if (!t) return [];
	let n = t.$ref ? V(e, t.$ref, "requestBodies") ?? t : t, r = n.content ?? {}, i = n.description ?? null;
	return Object.entries(r).map(([t, r]) => ({
		role: "request",
		status: null,
		mediaType: t,
		schema: r?.schema ?? null,
		title: i,
		examples: Fe(e, r),
		headers: [],
		required: !!n.required
	}));
}
function Le(e, t) {
	if (!t) return [];
	let n = [];
	for (let [r, i] of Object.entries(t)) {
		let t = i.$ref ? V(e, i.$ref, "responses") ?? i : i, a = t.description ?? null, o = t.content ?? {}, s = Object.entries(o), c = Ne(e, t.headers);
		if (s.length === 0) {
			n.push({
				role: "response",
				status: r,
				mediaType: null,
				schema: null,
				title: a,
				examples: [],
				headers: c,
				required: !1
			});
			continue;
		}
		for (let [t, i] of s) n.push({
			role: "response",
			status: r,
			mediaType: t,
			schema: i?.schema ?? null,
			title: a,
			examples: Fe(e, i),
			headers: c,
			required: !1
		});
	}
	return n;
}
function Re(e, t) {
	return (t.security === void 0 ? e.security ?? [] : t.security).map((t) => ({ schemes: Object.entries(t).map(([t, n]) => {
		let r = ze(e, t);
		return {
			name: t,
			scopes: n ?? [],
			type: r?.type ?? null,
			scheme: r?.scheme ?? null
		};
	}) }));
}
function ze(e, t) {
	let n = e.components?.securitySchemes?.[t] ?? null;
	return n?.$ref ? V(e, n.$ref, "securitySchemes") ?? n : n;
}
function Be(e, t) {
	let n = new Set(t), r = e.groups.filter((e) => n.has(e.title)), i = new Set(r.flatMap((e) => e.operationIds)), a = Object.fromEntries(Object.entries(e.summaries).filter(([e]) => i.has(e)));
	return {
		...e,
		groups: r,
		summaries: a
	};
}
function H(e, t, n = null) {
	let r = Ve(e), i = Ce(r, t);
	if (!i) return null;
	let { path: a, method: o, pathItem: s, operation: c } = i, l = we(c.servers), u = we(s.servers), d = l.length === 0 && u.length === 0, f = l.length > 0 ? l : u.length > 0 ? u : Ee(r), p = d && n !== null || n !== null && f.some((e) => e.url === n) ? n : f[0].url;
	return {
		summary: {
			id: t,
			method: o.toUpperCase(),
			path: a,
			title: Se(c, o, a),
			deprecated: !!c.deprecated
		},
		serverUrl: p,
		servers: f,
		usesRootServers: d,
		description: c.description ?? null,
		tags: c.tags ?? [],
		paramGroups: Pe(r, s.parameters ?? [], c.parameters ?? []),
		requests: Ie(r, c.requestBody),
		responses: Le(r, c.responses),
		security: Re(r, c)
	};
}
function Ve(e) {
	return typeof e == "object" && e ? e : {};
}
var He, Ue, We, Ge = f((() => {
	He = [
		"get",
		"post",
		"put",
		"patch",
		"delete",
		"options",
		"head",
		"trace"
	], Ue = [
		"path",
		"query",
		"header",
		"cookie"
	], We = "Default";
}));
//#endregion
//#region resources/js/schema/build-rows.ts
function U(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Ke(e) {
	return typeof e != "string" || !e.startsWith("#/components/schemas/") ? null : e.slice(21);
}
function qe(e, t) {
	let n = Ke(e);
	if (n === null) return null;
	let r = U(U(t?.schemas)?.[n]);
	return r ? {
		name: n,
		schema: r
	} : null;
}
function Je(e, t) {
	for (let [n, r] of Object.entries(t)) n === "properties" ? e.properties = {
		...U(e.properties),
		...U(r)
	} : n === "required" ? e.required = [.../* @__PURE__ */ new Set([...Array.isArray(e.required) ? e.required : [], ...Array.isArray(r) ? r : []])] : e[n] = r;
}
function W(e, t, n) {
	let r = e;
	for (; r.$ref !== void 0;) {
		let e = qe(r.$ref, t);
		if (e === null || n.has(e.name)) return e === null ? {} : r;
		n.add(e.name), r = e.schema;
	}
	if (!Array.isArray(r.allOf)) return r;
	let { allOf: i, ...a } = r, o = {};
	for (let e of i) {
		let r = U(e);
		r && Je(o, W(r, t, n));
	}
	return Je(o, W(a, t, n)), o;
}
function Ye(e, t) {
	let n = Array.isArray(e.type) ? e.type.filter((e) => typeof e == "string") : typeof e.type == "string" ? [e.type] : [];
	if (n.length === 0 && (e.properties !== void 0 || e.additionalProperties !== void 0 ? n.push("object") : e.items !== void 0 && n.push("array")), e.nullable === !0 && !n.includes("null") && n.push("null"), n.length === 0) return Array.isArray(e.oneOf) ? "oneOf" : Array.isArray(e.anyOf) ? "anyOf" : "any";
	let r = U(e.items);
	if (r && n[0] === "array") {
		let e = Ke(r.$ref) ?? Ye(W(r, t, /* @__PURE__ */ new Set()), t);
		e !== "any" && e !== "object" && (n[0] = `array[${e}]`);
	}
	return n.join(" | ");
}
function Xe(e, t, n) {
	return typeof t.title == "string" ? t.title : Ke(e.$ref) ?? Ye(t, n);
}
function G(e) {
	return JSON.stringify(e) ?? String(e);
}
function Ze(e) {
	let t = [];
	typeof e.format == "string" && t.push(`format: ${e.format}`), "const" in e ? t.push(`const: ${G(e.const)}`) : Array.isArray(e.enum) && t.push(`enum: ${G(e.enum)}`), e.default !== void 0 && t.push(`default: ${G(e.default)}`), e.examples !== void 0 && t.push(`examples: ${G(e.examples)}`);
	for (let [n, r] of Object.entries(e)) nt.includes(n) && t.push(`${n}: ${G(r)}`);
	return e.deprecated === !0 && t.push("deprecated"), e.readOnly === !0 && t.push("readOnly"), e.writeOnly === !0 && t.push("writeOnly"), t;
}
function Qe(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function $e(e, t, n, r, i, a) {
	let o = U(e) ?? {}, s = /* @__PURE__ */ new Set(), c = W(o, i, s), l = [...s].some((e) => a.has(e));
	return {
		id: n,
		name: t,
		typeLabel: Ye(c, i),
		required: r,
		description: typeof c.description == "string" ? c.description : null,
		details: Ze(c),
		children: l ? [] : et(c, n, i, s.size > 0 ? /* @__PURE__ */ new Set([...a, ...s]) : a),
		isRecursive: l
	};
}
function et(e, t, n, r) {
	let i = [], a = new Set(Array.isArray(e.required) ? e.required : []), o = U(e.properties);
	for (let [e, s] of Object.entries(o ?? {})) i.push($e(s, e, `${t}/properties/${Qe(e)}`, a.has(e), n, r));
	let s = U(e.additionalProperties);
	s && i.push($e(s, "additionalProperties", `${t}/additionalProperties`, !1, n, r));
	let c = U(e.items);
	if (c) {
		let e = /* @__PURE__ */ new Set(), a = W(c, n, e);
		if ([...e].some((e) => r.has(e))) i.push($e(c, null, `${t}/items`, !1, n, r));
		else {
			let o = e.size > 0 ? /* @__PURE__ */ new Set([...r, ...e]) : r;
			i.push(...et(a, `${t}/items`, n, o));
		}
	}
	for (let a of ["oneOf", "anyOf"]) {
		let o = e[a];
		Array.isArray(o) && o.forEach((e, o) => {
			let s = U(e) ?? {}, c = $e(e, null, `${t}/${a}/${o}`, !1, n, r);
			c.typeLabel = Xe(s, W(s, n, /* @__PURE__ */ new Set()), n), i.push(c);
		});
	}
	return i;
}
function tt(e, t) {
	let n = U(e);
	if (n === null) return [];
	let r = U(t), i = /* @__PURE__ */ new Set();
	return et(W(n, r, i), "#", r, i);
}
var nt, rt = f((() => {
	nt = [
		"minimum",
		"maximum",
		"exclusiveMinimum",
		"exclusiveMaximum",
		"multipleOf",
		"minLength",
		"maxLength",
		"pattern",
		"minItems",
		"maxItems",
		"uniqueItems",
		"minProperties",
		"maxProperties"
	];
}));
//#endregion
//#region resources/js/schema/SchemaView.tsx
function it({ row: e, depth: t, expandDepth: n }) {
	let [r, a] = i(t < n), c = e.children.length > 0 || e.isRecursive;
	return /* @__PURE__ */ s("div", {
		className: "border-l border-lt-border pl-3",
		children: [
			/* @__PURE__ */ s("div", {
				className: "flex items-center gap-2 py-1",
				children: [
					c ? /* @__PURE__ */ o("button", {
						type: "button",
						onClick: () => a((e) => !e),
						className: "text-lt-muted-fg",
						"aria-expanded": r,
						children: /* @__PURE__ */ o(g.Icon, {
							name: "chevron-down",
							className: `size-lt-icon-xs transition-transform${r ? "" : " -rotate-90"}`
						})
					}) : /* @__PURE__ */ o("span", { className: "w-3" }),
					/* @__PURE__ */ o("span", {
						className: "font-mono text-lt-fg",
						children: e.name ?? "—"
					}),
					/* @__PURE__ */ o("span", {
						className: "text-xs text-lt-muted-fg",
						children: e.typeLabel
					}),
					e.required ? /* @__PURE__ */ o("span", {
						className: "text-lt-danger",
						children: "*"
					}) : null,
					e.isRecursive ? /* @__PURE__ */ o("span", {
						className: "text-xs text-lt-muted-fg",
						children: "↩ recursive"
					}) : null
				]
			}),
			(!c || r) && e.description ? /* @__PURE__ */ o("p", {
				className: "pl-5 text-xs text-lt-muted-fg",
				children: e.description
			}) : null,
			e.details.length > 0 ? /* @__PURE__ */ o("p", {
				className: "pl-5 font-mono text-xs text-lt-muted-fg",
				children: e.details.join(" · ")
			}) : null,
			r && !e.isRecursive ? e.children.map((e) => /* @__PURE__ */ o(it, {
				row: e,
				depth: t + 1,
				expandDepth: n
			}, e.id)) : null
		]
	});
}
function at({ schema: e, components: t, expandDepth: r = 2 }) {
	let i = n(() => tt(e, t), [e, t]);
	return /* @__PURE__ */ o("div", {
		className: "text-base",
		children: i.map((e) => /* @__PURE__ */ o(it, {
			row: e,
			depth: 0,
			expandDepth: r
		}, e.id))
	});
}
var ot = f((() => {
	rt(), v();
}));
//#endregion
//#region resources/js/api-reference/execute-request.ts
async function st(e, t) {
	let n = Date.now();
	try {
		let r = await fetch(e.url, {
			method: e.method,
			headers: e.headers,
			body: e.body,
			signal: t
		}), i = ct(await r.text());
		return {
			kind: "response",
			status: r.status,
			statusText: r.statusText,
			durationMs: Math.max(0, Date.now() - n),
			headers: Array.from(r.headers.entries()),
			body: i,
			contentType: r.headers.get("content-type")
		};
	} catch (e) {
		if (te(e)) throw e;
		return {
			kind: "error",
			message: "Request failed. Check the browser console and CORS configuration."
		};
	}
}
function ct(e) {
	try {
		return JSON.stringify(JSON.parse(e), null, 2);
	} catch {
		return e;
	}
}
var lt = f((() => {
	C();
}));
//#endregion
//#region resources/js/api-reference/LiveResponsePanel.tsx
function ut({ result: e }) {
	return e === null ? null : e.kind === "error" ? /* @__PURE__ */ s("section", {
		"aria-live": "polite",
		className: "flex flex-col gap-3 border-t border-lt-border pt-6",
		children: [/* @__PURE__ */ s("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ o("h3", {
				className: "font-semibold text-lt-fg",
				children: "Live response"
			}), /* @__PURE__ */ o(g.Badge, {
				color: "danger",
				children: "Error"
			})]
		}), /* @__PURE__ */ o("p", {
			className: "text-lt-danger",
			children: e.message
		})]
	}) : /* @__PURE__ */ s("section", {
		"aria-live": "polite",
		className: "flex flex-col gap-4 border-t border-lt-border pt-6",
		children: [
			/* @__PURE__ */ s("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ o("h3", {
						className: "font-semibold text-lt-fg",
						children: "Live response"
					}),
					/* @__PURE__ */ s(g.Badge, {
						color: dt(e.status),
						children: [
							e.status,
							" ",
							e.statusText
						]
					}),
					/* @__PURE__ */ s("span", {
						className: "text-xs text-lt-muted-fg",
						children: [e.durationMs, " ms"]
					})
				]
			}),
			e.headers.length > 0 ? /* @__PURE__ */ s("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ o("h4", {
					className: "text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
					children: "Response headers"
				}), /* @__PURE__ */ o("dl", {
					className: "flex flex-col gap-1 text-xs",
					children: e.headers.map(([e, t]) => /* @__PURE__ */ s("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ o("dt", {
							className: "font-mono text-lt-fg",
							children: e
						}), /* @__PURE__ */ o("dd", {
							className: "wrap-anywhere text-lt-muted-fg",
							children: t
						})]
					}, e))
				})]
			}) : null,
			/* @__PURE__ */ o(g.CodeBlock, {
				"aria-label": "Live response body",
				copyable: !0,
				language: e.contentType?.toLowerCase().includes("json") ? "json" : "text",
				lineNumbers: !0,
				maxHeight: 800,
				wrap: !0,
				children: e.body
			})
		]
	});
}
function dt(e) {
	return {
		2: "success",
		3: "info",
		4: "warning",
		5: "danger"
	}[String(e)[0]] ?? "default";
}
var ft = f((() => {
	v();
}));
//#endregion
//#region resources/js/api-reference/request-state.ts
function K(e) {
	return `${e.location}:${e.name}`;
}
function pt(e) {
	if (e === null) return !1;
	let t = e.split(";", 1)[0].trim().toLowerCase();
	return t === "application/json" || t.endsWith("+json");
}
function mt(e) {
	return e.requests.filter((e) => pt(e.mediaType));
}
function ht(e, t) {
	let n = Object.fromEntries(e.paramGroups.flatMap((e) => e.params.map((e) => [K(e), gt(e)]))), r = mt(e)[0];
	return r === void 0 ? {
		parameters: n,
		mediaType: null,
		body: ""
	} : {
		parameters: n,
		mediaType: r.mediaType,
		body: ee(E(r, t))
	};
}
function gt(e) {
	let t = _t(e.example);
	if (t !== null) return t;
	if (!x(e.schema)) return "";
	for (let t of ["example", "default"]) {
		let n = _t(e.schema[t]);
		if (n !== null) return n;
	}
	return Array.isArray(e.schema.enum) ? vt(e.schema.enum[0]) ?? "" : "";
}
function _t(e) {
	if (!Array.isArray(e)) return vt(e);
	let t = e.map(vt);
	return t.every((e) => e !== null) ? t.join(",") : null;
}
function vt(e) {
	return typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : null;
}
var yt = f((() => {
	L(), C();
}));
//#endregion
//#region resources/js/api-reference/request-builder.ts
function bt(e) {
	let t = {
		parameters: {},
		body: null,
		request: e.baseUrl === null ? "Select a server URL before sending the request." : null
	}, n = e.operation.paramGroups.flatMap((e) => e.params);
	wt(n, e.values, t);
	let r = kt(e.operation, e.values, t);
	if (Rt(t) || e.baseUrl === null) return {
		request: null,
		errors: t
	};
	let i = At(n, e.values), a = e.values.body.trim() === "" ? null : e.values.body;
	return Object.keys(i).some((e) => e.toLowerCase() === "accept") || (i.Accept = "application/json"), a !== null && r !== null && r.mediaType !== null && Lt(i, "Content-Type", r.mediaType), e.token !== null && e.token !== "" && St(e.operation) && Lt(i, "Authorization", `Bearer ${e.token}`), {
		request: {
			method: e.operation.summary.method,
			url: jt(e.baseUrl, e.operation.summary.path, n, e.values),
			headers: i,
			body: a
		},
		errors: null
	};
}
function xt(e) {
	return e.type === "oauth2" || e.type === "http" && e.scheme?.toLowerCase() === "bearer";
}
function St(e) {
	return e.security.some((e) => e.schemes.some(xt));
}
function Ct(e) {
	let t = Object.fromEntries(Object.entries(e.headers).map(([e, t]) => [e, e.toLowerCase() === "authorization" && /^Bearer(?:\s|$)/i.test(t) ? "Bearer <YOUR_TOKEN>" : t]));
	return {
		...e,
		headers: t
	};
}
function wt(e, t, n) {
	for (let r of e) {
		let e = K(r), i = t.parameters[e] ?? "", a = Ot(r, i);
		if (a !== null) {
			(r.required || i !== "") && (n.parameters[e] = a);
			continue;
		}
		if (r.required && i === "") {
			n.parameters[e] = `This ${r.location} parameter is required.`;
			continue;
		}
		let o = Tt(r, i);
		o !== null && (n.parameters[e] = o);
	}
}
function Tt(e, t) {
	return t === "" || !x(e.schema) ? null : e.schema.type === "number" || e.schema.type === "integer" ? Et(e.schema, t) : e.schema.type === "string" ? Dt(e.schema, t) : null;
}
function Et(e, t) {
	let n = Number(t);
	if (!Number.isFinite(n)) return "Enter a number.";
	if (e.type === "integer" && !Number.isInteger(n)) return "Enter an integer.";
	let r = q(e.minimum), i = e.exclusiveMinimum === !0 ? r : q(e.exclusiveMinimum);
	if (i !== null && n <= i) return `Enter a value greater than ${i}.`;
	if (r !== null && n < r) return `Enter a value greater than or equal to ${r}.`;
	let a = q(e.maximum), o = e.exclusiveMaximum === !0 ? a : q(e.exclusiveMaximum);
	if (o !== null && n >= o) return `Enter a value less than ${o}.`;
	if (a !== null && n > a) return `Enter a value less than or equal to ${a}.`;
	let s = q(e.multipleOf);
	if (s !== null && s > 0) {
		let e = n / s;
		if (Math.abs(e - Math.round(e)) > 1e-9) return `Enter a multiple of ${s}.`;
	}
	return null;
}
function Dt(e, t) {
	let n = [...t].length, r = q(e.minLength);
	if (r !== null && n < r) return `Enter at least ${r} characters.`;
	let i = q(e.maxLength);
	if (i !== null && n > i) return `Enter no more than ${i} characters.`;
	if (typeof e.pattern == "string") try {
		if (!new RegExp(e.pattern).test(t)) return "Match the required pattern.";
	} catch {
		return null;
	}
	return null;
}
function q(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Ot(e, t) {
	return !Ft(e) && !It(e) ? "Only primitive parameters can be executed." : e.location === "cookie" ? "Cookie parameters cannot be sent from a browser." : e.location === "header" && Nt(e.name) || e.location === "header" && Pt(e.name, t) ? "This header cannot be sent from a browser." : null;
}
function kt(e, t, n) {
	if (t.mediaType === null) return e.requests.find((e) => e.required && pt(e.mediaType)) !== void 0 && (n.body = "A JSON request body is required."), null;
	let r = e.requests.find((e) => e.mediaType === t.mediaType);
	if (r === void 0 || !pt(r.mediaType)) return n.request = "The selected JSON media type is not available for this operation.", null;
	if (t.body.trim() === "") return r.required && (n.body = "A JSON request body is required."), r;
	try {
		JSON.parse(t.body);
	} catch {
		n.body = "Enter a valid JSON request body.";
	}
	return r;
}
function At(e, t) {
	return Object.fromEntries(e.filter((e) => e.location === "header").map((e) => [e.name, t.parameters[K(e)] ?? ""]).filter((e) => e[1] !== ""));
}
function jt(e, t, n, r) {
	let i = t, a = [];
	for (let e of n) {
		let t = r.parameters[K(e)] ?? "";
		e.location === "path" && (i = i.split(`{${e.name}}`).join(encodeURIComponent(t))), e.location === "query" && t !== "" && a.push(`${encodeURIComponent(e.name)}=${encodeURIComponent(t)}`);
	}
	let o = e.split("#", 1)[0], s = o.indexOf("?"), c = s === -1 ? o : o.slice(0, s), l = s === -1 ? "" : o.slice(s + 1), u = Mt(c, i), d = [l, ...a].filter((e) => e !== "");
	return d.length === 0 ? u : `${u}?${d.join("&")}`;
}
function Mt(e, t) {
	return `${(e ?? "").split("#", 1)[0].split("?", 1)[0].replace(/\/+$/, "")}/${t.replace(/^\/+/, "")}`;
}
function Nt(e) {
	let t = e.toLowerCase();
	return zt.has(t) || t.startsWith("proxy-") || t.startsWith("sec-");
}
function Pt(e, t) {
	if (t === void 0) return !1;
	let n = e.toLowerCase();
	return Bt.has(n) && t.split(",").some((e) => Vt.has(e.trim().toUpperCase()));
}
function Ft(e) {
	return !x(e.schema) || "$ref" in e.schema || "oneOf" in e.schema || "allOf" in e.schema || "anyOf" in e.schema ? !1 : typeof e.schema.type == "string" && [
		"string",
		"number",
		"integer",
		"boolean"
	].includes(e.schema.type);
}
function It(e) {
	if (e.location !== "query" || e.style !== void 0 && e.style !== null && e.style !== "form" || e.explode !== !1 || !x(e.schema) || e.schema.type !== "array") return !1;
	let t = e.schema.items;
	return x(t) && t.type === "string" && Array.isArray(t.enum) && t.enum.length > 0 && t.enum.every((e) => typeof e == "string");
}
function Lt(e, t, n) {
	for (let n of Object.keys(e)) n.toLowerCase() === t.toLowerCase() && delete e[n];
	e[t] = n;
}
function Rt(e) {
	return Object.keys(e.parameters).length > 0 || e.body !== null || e.request !== null;
}
var zt, Bt, Vt, Ht = f((() => {
	yt(), C(), zt = /* @__PURE__ */ new Set([
		"accept-charset",
		"accept-encoding",
		"access-control-request-headers",
		"access-control-request-method",
		"connection",
		"content-length",
		"cookie",
		"cookie2",
		"date",
		"dnt",
		"expect",
		"host",
		"keep-alive",
		"origin",
		"permissions-policy",
		"referer",
		"set-cookie",
		"te",
		"trailer",
		"transfer-encoding",
		"upgrade",
		"via"
	]), Bt = /* @__PURE__ */ new Set([
		"x-http-method",
		"x-http-method-override",
		"x-method-override"
	]), Vt = /* @__PURE__ */ new Set([
		"CONNECT",
		"TRACE",
		"TRACK"
	]);
}));
//#endregion
//#region resources/js/api-reference/OperationHeader.tsx
function Ut({ operation: e, baseUrl: t, hideIdentity: n = !1 }) {
	if (n) return e.description ? /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ o("p", {
		className: "whitespace-pre-line text-lt-muted-fg",
		children: e.description
	}), /* @__PURE__ */ o("hr", { className: "my-8 border-lt-border" })] }) : null;
	let r = Mt(t, e.summary.path);
	return /* @__PURE__ */ s("header", {
		className: "mb-6",
		children: [
			/* @__PURE__ */ s("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ o(g.Badge, {
						color: y(e.summary.method),
						className: "text-xs font-semibold uppercase",
						children: e.summary.method
					}),
					/* @__PURE__ */ s("div", {
						className: "inline-flex min-w-0 items-center gap-1",
						children: [/* @__PURE__ */ o("span", {
							className: "font-mono text-lt-muted-fg",
							children: r
						}), /* @__PURE__ */ o(g.CopyButton, {
							value: r,
							label: "operation URL",
							iconOnly: !0,
							className: "size-7"
						})]
					}),
					e.summary.deprecated ? /* @__PURE__ */ o(g.Badge, {
						color: "danger",
						children: "deprecated"
					}) : null
				]
			}),
			/* @__PURE__ */ o("h1", {
				className: "mt-2 text-lg font-semibold text-lt-fg",
				children: e.summary.title
			}),
			e.description ? /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ o("p", {
				className: "mt-1 whitespace-pre-line text-lt-muted-fg",
				children: e.description
			}), /* @__PURE__ */ o("hr", { className: "my-8 border-lt-border" })] }) : null
		]
	});
}
var Wt = f((() => {
	v(), b(), Ht();
}));
//#endregion
//#region resources/js/api-reference/RequestBodyEditor.tsx
function Gt({ idPrefix: e, schema: t, components: r, value: i, required: a, error: c, onChange: l }) {
	let u = n(() => J(t, r, /* @__PURE__ */ new Set()), [r, t]), d = en(i);
	if (u?.kind !== "object" || !x(d)) return /* @__PURE__ */ o(g.FormFieldFrame, {
		id: `${e}-request-body`,
		label: "JSON body",
		required: a,
		error: c,
		children: (e) => /* @__PURE__ */ o(g.Textarea, {
			...e,
			value: i,
			required: a,
			"data-field-key": "body",
			onChange: (e) => l(e.target.value),
			className: "min-h-40 font-mono"
		})
	});
	let f = d;
	function p(e, t) {
		l(ee(Zt(f, e, t)));
	}
	return /* @__PURE__ */ s("fieldset", {
		"aria-label": "JSON body fields",
		className: "@container flex min-w-0 flex-col gap-3",
		children: [c ? /* @__PURE__ */ o("p", {
			className: "text-sm text-lt-danger",
			children: c
		}) : null, /* @__PURE__ */ o(Kt, {
			schema: u,
			path: [],
			value: f,
			onChange: p
		})]
	});
}
function Kt({ schema: e, path: t, value: n, onChange: r }) {
	return /* @__PURE__ */ o("div", {
		className: "grid min-w-0 grid-cols-1 gap-4 @xl:grid-cols-2",
		children: e.properties.map((e) => /* @__PURE__ */ o(qt, {
			schema: e.schema,
			path: [...t, e.name],
			required: e.required,
			value: x(n) ? n[e.name] : void 0,
			onChange: r
		}, e.name))
	});
}
function qt({ schema: e, path: n, required: r, value: i, onChange: a }) {
	let c = `body-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;
	if (e.kind === "object") return /* @__PURE__ */ s("fieldset", {
		className: "min-w-0 rounded-lt-sm border border-lt-border p-3 @xl:col-span-2",
		children: [
			/* @__PURE__ */ s("legend", {
				className: "px-1 text-xs font-semibold text-lt-muted-fg",
				children: [Y(n), r ? /* @__PURE__ */ o("span", {
					className: "text-lt-danger",
					children: " *"
				}) : null]
			}),
			e.description ? /* @__PURE__ */ o("p", {
				className: "mb-3 text-xs text-lt-muted-fg",
				children: e.description
			}) : null,
			/* @__PURE__ */ o(Kt, {
				schema: e,
				path: n,
				value: i,
				onChange: a
			})
		]
	});
	if (e.kind === "array") {
		let t = Array.isArray(i) ? i : [];
		return /* @__PURE__ */ s("fieldset", {
			className: "flex min-w-0 flex-col gap-3 rounded-lt-sm border border-lt-border p-3 @xl:col-span-2",
			children: [
				/* @__PURE__ */ s("legend", {
					className: "px-1 text-xs font-semibold text-lt-muted-fg",
					children: [Y(n), r ? /* @__PURE__ */ o("span", {
						className: "text-lt-danger",
						children: " *"
					}) : null]
				}),
				e.description ? /* @__PURE__ */ o("p", {
					className: "text-xs text-lt-muted-fg",
					children: e.description
				}) : null,
				t.map((r, i) => /* @__PURE__ */ s("div", {
					className: "flex min-w-0 items-start gap-3",
					children: [/* @__PURE__ */ o("div", {
						className: "min-w-0 flex-1",
						children: /* @__PURE__ */ o(qt, {
							schema: e.items,
							path: [...n, i],
							required: !0,
							value: r,
							onChange: a
						})
					}), /* @__PURE__ */ o(g.Button, {
						type: "button",
						emphasis: "outline",
						variant: "danger",
						size: "sm",
						"aria-label": `Remove ${Y([...n, i])}`,
						onClick: () => a(n, t.filter((e, t) => t !== i)),
						children: "Remove"
					})]
				}, i)),
				/* @__PURE__ */ o(g.Button, {
					type: "button",
					emphasis: "outline",
					size: "sm",
					className: "self-start",
					"aria-label": `Add ${Y(n)} item`,
					onClick: () => a(n, [...t, Xt(e.items)]),
					children: "Add item"
				})
			]
		});
	}
	let l = Y(n);
	return /* @__PURE__ */ o(g.FormFieldFrame, {
		id: c,
		label: l,
		required: r,
		helperText: e.description ?? void 0,
		className: "min-w-0",
		children: (t) => e.enumValues.length > 0 ? /* @__PURE__ */ s(g.NativeSelect, {
			...t,
			value: on(i),
			required: r,
			"data-field-key": `body:${l}`,
			onChange: (t) => {
				let i = e.enumValues.find((e) => on(e) === t.target.value);
				a(n, t.target.value === "" && !r ? void 0 : i);
			},
			children: [r ? null : /* @__PURE__ */ o("option", {
				value: "",
				children: "Not set"
			}), e.enumValues.map((e) => /* @__PURE__ */ o("option", {
				value: on(e),
				children: String(e)
			}, on(e)))]
		}) : e.kind === "boolean" ? /* @__PURE__ */ s(g.NativeSelect, {
			...t,
			value: typeof i == "boolean" ? String(i) : "",
			required: r,
			"data-field-key": `body:${l}`,
			onChange: (e) => a(n, e.target.value === "" ? void 0 : e.target.value === "true"),
			children: [
				r ? null : /* @__PURE__ */ o("option", {
					value: "",
					children: "Not set"
				}),
				/* @__PURE__ */ o("option", {
					value: "true",
					children: "true"
				}),
				/* @__PURE__ */ o("option", {
					value: "false",
					children: "false"
				})
			]
		}) : /* @__PURE__ */ o(g.Input, {
			...t,
			type: rn(e),
			value: typeof i == "string" || typeof i == "number" ? i : "",
			required: r,
			min: e.minimum ?? void 0,
			max: e.maximum ?? void 0,
			step: an(e),
			minLength: e.minLength ?? void 0,
			maxLength: e.maxLength ?? void 0,
			pattern: e.pattern ?? void 0,
			"data-field-key": `body:${l}`,
			onChange: (t) => {
				let i = t.target.value;
				a(n, i === "" && !r ? void 0 : e.kind === "number" || e.kind === "integer" ? i === "" ? "" : Number(i) : i);
			}
		})
	});
}
function J(e, t, n) {
	if (!x(e)) return null;
	if (typeof e.$ref == "string") {
		if (!e.$ref.startsWith("#/components/schemas/") || n.has(e.$ref)) return null;
		let r = tn(e.$ref, t);
		if (r === null) return null;
		let i = J(r, t, /* @__PURE__ */ new Set([...n, e.$ref]));
		return i === null ? null : {
			...i,
			description: X(e.description) ?? i.description,
			initialValue: w(e, t)
		};
	}
	if ("oneOf" in e || "anyOf" in e) return null;
	if (Array.isArray(e.allOf)) {
		let r = e.allOf.map((e) => J(e, t, n)), i = Jt(e, t, n);
		return r.some((e) => e?.kind !== "object") || i === null ? null : Yt([...r, i], e, t);
	}
	let r = nn(e);
	if (r === "object" || x(e.properties)) return Jt(e, t, n);
	if (r === "array") {
		let r = J(e.items, t, n);
		return r === null ? null : {
			kind: "array",
			description: X(e.description),
			initialValue: w(e, t),
			items: r
		};
	}
	if (!sn(r)) return null;
	let i = Array.isArray(e.enum) && e.enum.every(cn) ? e.enum : [];
	return Array.isArray(e.enum) && i.length !== e.enum.length ? null : {
		kind: r,
		description: X(e.description),
		initialValue: w(e, t),
		enumValues: i,
		format: X(e.format),
		minimum: Z(e.minimum),
		maximum: Z(e.maximum),
		multipleOf: Z(e.multipleOf),
		minLength: Z(e.minLength),
		maxLength: Z(e.maxLength),
		pattern: X(e.pattern)
	};
}
function Jt(e, t, n) {
	if (e.additionalProperties === !0 || x(e.additionalProperties)) return null;
	let r = x(e.properties) ? e.properties : {}, i = new Set(Array.isArray(e.required) ? e.required.filter((e) => typeof e == "string") : []), a = [];
	for (let [e, o] of Object.entries(r)) {
		if (x(o) && o.readOnly === !0) continue;
		let r = J(o, t, n);
		if (r === null) return null;
		a.push({
			name: e,
			required: i.has(e),
			schema: r
		});
	}
	return {
		kind: "object",
		description: X(e.description),
		initialValue: w(e, t),
		properties: a
	};
}
function Yt(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let t of e) for (let e of t.properties) {
		let t = r.get(e.name);
		r.set(e.name, {
			...e,
			required: e.required || t?.required === !0
		});
	}
	return {
		kind: "object",
		description: X(t.description) ?? e.find((e) => e.description)?.description ?? null,
		initialValue: w(t, n),
		properties: [...r.values()]
	};
}
function Xt(e) {
	if (e.initialValue !== null && e.initialValue !== void 0) return structuredClone(e.initialValue);
	switch (e.kind) {
		case "object": return {};
		case "array": return [];
		case "boolean": return !1;
		case "number":
		case "integer": return 0;
		case "string": return "";
	}
}
function Zt(e, t, n) {
	let r = structuredClone(e), i = r;
	for (let e = 0; e < t.length - 1; e += 1) {
		let n = t[e], r = t[e + 1], a = Qt(i, n);
		!x(a) && !Array.isArray(a) && $t(i, n, typeof r == "number" ? [] : {}), i = Qt(i, n);
	}
	let a = t[t.length - 1];
	return a === void 0 ? x(n) ? n : r : (n === void 0 ? Array.isArray(i) && typeof a == "number" ? i.splice(a, 1) : Array.isArray(i) || delete i[String(a)] : $t(i, a, n), r);
}
function Qt(e, t) {
	return Array.isArray(e) ? typeof t == "number" ? e[t] : void 0 : e[String(t)];
}
function $t(e, t, n) {
	if (Array.isArray(e)) {
		typeof t == "number" && (e[t] = n);
		return;
	}
	e[String(t)] = n;
}
function en(e) {
	try {
		return e.trim() === "" ? {} : JSON.parse(e);
	} catch {
		return null;
	}
}
function Y(e) {
	return e.reduce((e, t) => typeof t == "number" ? `${e}[${t}]` : e === "" ? t : `${e}.${t}`, "");
}
function tn(e, t) {
	if (!x(t) || !x(t.schemas)) return null;
	let n = e.slice(21);
	return n in t.schemas ? t.schemas[n] : null;
}
function nn(e) {
	return Array.isArray(e.type) ? e.type.find((e) => e !== "null") : e.type;
}
function rn(e) {
	if (e.kind === "number" || e.kind === "integer") return "number";
	switch (e.format) {
		case "email": return "email";
		case "uri":
		case "url": return "url";
		case "date": return "date";
		case "password": return "password";
		default: return "text";
	}
}
function an(e) {
	return e.multipleOf === null ? e.kind === "integer" ? 1 : e.kind === "number" ? "any" : void 0 : e.multipleOf;
}
function on(e) {
	return cn(e) ? `${typeof e}:${String(e)}` : "";
}
function sn(e) {
	return typeof e == "string" && [
		"string",
		"number",
		"integer",
		"boolean"
	].includes(e);
}
function cn(e) {
	return typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
function X(e) {
	return typeof e == "string" ? e : null;
}
function Z(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
var ln = f((() => {
	v(), L(), C();
}));
//#endregion
//#region resources/js/api-reference/SnippetPanel.tsx
function un({ idPrefix: e, language: t, snippet: n, onLanguageChange: r }) {
	return /* @__PURE__ */ s("section", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ o(g.SegmentedPills, {
			name: `${e}-request-snippet-language`,
			ariaLabel: "Snippet language",
			options: dn,
			value: t,
			onSelect: (e) => r(e)
		}), /* @__PURE__ */ o(g.CodeBlock, {
			"aria-label": "Request snippet",
			copyable: !0,
			language: t === "curl" ? "shell" : "javascript",
			lineNumbers: !0,
			children: n
		})]
	});
}
var dn, fn = f((() => {
	v(), dn = [{
		label: "cURL",
		value: "curl",
		data: null
	}, {
		label: "JavaScript",
		value: "javascript",
		data: null
	}];
}));
//#endregion
//#region resources/js/api-reference/snippets/curl.ts
function pn(e) {
	return `'${e.replaceAll("'", "'\"'\"'")}'`;
}
var mn, hn = f((() => {
	mn = {
		id: "curl",
		label: "cURL",
		generate(e) {
			let t = [
				`--request ${pn(e.method)}`,
				`--url ${pn(e.url)}`,
				...Object.entries(e.headers).map(([e, t]) => `--header ${pn(`${e}: ${t}`)}`)
			];
			return e.body !== null && t.push(`--data ${pn(e.body)}`), t.length === 2 ? `curl ${t.join(" ")}` : t.map((e, n) => `${n === 0 ? "curl " : "  "}${e}${n === t.length - 1 ? "" : " \\"}`).join("\n");
		}
	};
})), gn, _n = f((() => {
	gn = {
		id: "javascript",
		label: "JavaScript",
		generate(e) {
			let t = Object.entries(e.headers);
			if (t.length === 0 && e.body === null) return `fetch(${JSON.stringify(e.url)}, { method: ${JSON.stringify(e.method)} });`;
			let n = [`fetch(${JSON.stringify(e.url)}, {`, `    method: ${JSON.stringify(e.method)},`];
			return t.length > 0 && (n.push("    headers: {"), t.forEach(([e, r], i) => {
				let a = i === t.length - 1 ? "" : ",";
				n.push(`        ${JSON.stringify(e)}: ${JSON.stringify(r)}${a}`);
			}), n.push(e.body === null ? "    }" : "    },")), e.body !== null && n.push(`    body: ${JSON.stringify(e.body)}`), n.push("});"), n.join("\n");
		}
	};
}));
//#endregion
//#region resources/js/api-reference/RequestPlayground.tsx
function vn({ param: e, control: t }) {
	let n = z(e.schema), r = t ? "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,3fr)_minmax(12rem,2fr)] sm:items-start" : "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-2", i = !!e.description || n.length > 0;
	return /* @__PURE__ */ s("li", {
		className: `border-b border-lt-border last:border-b-0 ${r}`,
		children: [
			/* @__PURE__ */ s("div", {
				className: "flex min-w-0 items-center gap-2",
				children: [
					/* @__PURE__ */ o("span", {
						className: "min-w-0 break-words font-mono text-lt-fg",
						children: e.name
					}),
					e.required ? /* @__PURE__ */ o("span", {
						className: "text-lt-danger",
						children: "*"
					}) : null,
					e.deprecated ? /* @__PURE__ */ o(g.Badge, {
						color: "danger",
						children: "deprecated"
					}) : null
				]
			}),
			/* @__PURE__ */ o("span", {
				className: "col-start-2 row-start-1 justify-self-end rounded-lt-xs bg-lt-muted px-2 py-1 text-xs text-lt-muted-fg",
				children: R(e.schema)
			}),
			i ? /* @__PURE__ */ s("div", {
				className: `col-span-2 min-w-0${t ? " sm:col-span-1 sm:col-start-1 sm:row-start-2" : ""}`,
				children: [e.description ? /* @__PURE__ */ o("p", {
					className: "mt-0.5 text-xs text-lt-muted-fg",
					children: e.description
				}) : null, n.length > 0 ? /* @__PURE__ */ s("p", {
					className: "mt-0.5 text-xs text-lt-muted-fg",
					children: ["Available values: ", n.join(", ")]
				}) : null]
			}) : null,
			t ? /* @__PURE__ */ o("div", {
				className: "col-span-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-2",
				children: t
			}) : null
		]
	});
}
function yn({ group: e, idPrefix: t, values: n, errors: r, onChange: i }) {
	let a = e.location === "path" || e.location === "query";
	return /* @__PURE__ */ s("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ s("h3", {
			className: "mb-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: [e.location, " parameters"]
		}), /* @__PURE__ */ o("ul", { children: e.params.map((s) => /* @__PURE__ */ o(vn, {
			param: s,
			control: a && Ln(e.location, s) ? /* @__PURE__ */ o(Q, {
				inline: !0,
				idPrefix: t,
				param: s,
				value: n.parameters[K(s)] ?? "",
				error: r[K(s)] ?? null,
				onChange: (e) => i(s, e)
			}) : void 0
		}, `${s.location}-${s.name}`)) })]
	});
}
function bn(e) {
	let t = e.paramGroups.flatMap((e) => e.params).filter((e) => e.location === "query");
	return [
		{
			label: "Filter",
			params: t.filter((e) => /^filter\[.+\]$/.test(e.name))
		},
		{
			label: "Sort",
			params: t.filter((e) => e.name === "sort")
		},
		{
			label: "Include",
			params: t.filter((e) => e.name === "include")
		}
	].filter((e) => e.params.length > 0);
}
function xn({ group: e, idPrefix: t, values: n, errors: r, onChange: i }) {
	return /* @__PURE__ */ s("fieldset", {
		className: "mb-4 rounded-lt-sm border border-lt-border p-3",
		children: [/* @__PURE__ */ o("legend", {
			className: "px-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: e.label
		}), /* @__PURE__ */ o("div", {
			className: "flex flex-wrap items-start gap-4",
			children: e.params.map((e) => /* @__PURE__ */ o(Q, {
				idPrefix: t,
				param: e,
				value: n.parameters[K(e)] ?? "",
				error: r[K(e)] ?? null,
				onChange: (t) => i(e, t)
			}, K(e)))
		})]
	});
}
function Sn(e) {
	let t = e.paramGroups.flatMap((e) => e.params), n = t.find((e) => e.location === "header" && e.name.toLowerCase() === "x-pagination") ?? null, r = (e) => t.find((t) => t.location === "query" && t.name === e) ?? null, i = r("page"), a = r("cursor"), o = r("per_page");
	return o === null || i === null && a === null ? null : {
		mode: n,
		page: i,
		cursor: a,
		perPage: o
	};
}
function Cn({ parameters: e, idPrefix: t, values: n, errors: r, onModeChange: i, onChange: a }) {
	let c = (e.mode === null ? e.page === null : n.parameters[K(e.mode)] === "cursor") ? [e.cursor, e.perPage] : [e.page, e.perPage];
	return /* @__PURE__ */ s("fieldset", {
		className: "mb-4 rounded-lt-sm border border-lt-border p-3",
		children: [/* @__PURE__ */ o("legend", {
			className: "px-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: "Pagination"
		}), /* @__PURE__ */ s("div", {
			className: "flex flex-col gap-3",
			children: [e.mode === null ? null : /* @__PURE__ */ o("div", {
				className: "flex flex-wrap items-start gap-4",
				children: /* @__PURE__ */ o(Q, {
					idPrefix: t,
					param: e.mode,
					value: n.parameters[K(e.mode)] ?? "",
					error: r[K(e.mode)] ?? null,
					onChange: i
				})
			}), /* @__PURE__ */ o("div", {
				className: "flex flex-wrap items-start gap-4",
				children: c.map((e) => e === null ? null : /* @__PURE__ */ o(Q, {
					idPrefix: t,
					param: e,
					value: n.parameters[K(e)] ?? "",
					error: r[K(e)] ?? null,
					onChange: (t) => a(e, t)
				}, K(e)))
			})]
		})]
	});
}
function wn({ name: e, schema: t, examples: r, components: a, noSchemaMessage: c, expandDepth: l, exampleLabel: u, maxHeight: d = 2400, defaultTab: f = "schema", generateExample: p = !1 }) {
	let [m, h] = i(f), [_, v] = i(0), y = n(() => r.length > 0 || !p ? r : [{
		name: null,
		summary: null,
		description: null,
		value: w(t, a)
	}], [
		a,
		r,
		p,
		t
	]), b = p && r.length === 0;
	if (y.length === 0) return /* @__PURE__ */ o(at, {
		schema: t,
		components: a,
		expandDepth: l
	});
	let x = y[_] ?? y[0];
	return /* @__PURE__ */ s("div", { children: [/* @__PURE__ */ o("div", {
		className: "mb-2 pb-2",
		children: /* @__PURE__ */ o(g.SegmentedPills, {
			name: e,
			ariaLabel: "Schema or example",
			options: qn.map(({ key: e, label: t }) => ({
				label: t,
				value: e,
				data: null
			})),
			value: m,
			onSelect: (e) => h(e)
		})
	}), m === "schema" ? t ? /* @__PURE__ */ o(at, {
		schema: t,
		components: a,
		expandDepth: l
	}) : /* @__PURE__ */ o("p", {
		className: "text-lt-muted-fg",
		children: c
	}) : /* @__PURE__ */ s("div", { children: [
		y.length > 1 ? /* @__PURE__ */ o(g.NativeSelect, {
			"aria-label": `${u} selection`,
			value: _,
			onChange: (e) => v(Number(e.target.value)),
			className: "mb-2",
			children: y.map((e, t) => /* @__PURE__ */ s("option", {
				value: t,
				children: [e.name ?? `Example ${t + 1}`, e.summary ? ` — ${e.summary}` : ""]
			}, e.name ?? t))
		}) : x?.summary ? /* @__PURE__ */ o("p", {
			className: "mb-1 text-xs text-lt-muted-fg",
			children: x.summary
		}) : null,
		b ? /* @__PURE__ */ o("p", {
			className: "mb-1 text-xs text-lt-muted-fg",
			children: "Generated from schema"
		}) : null,
		x?.description ? /* @__PURE__ */ o("p", {
			className: "mb-1 text-xs text-lt-muted-fg",
			children: x.description
		}) : null,
		x?.externalValue ? /* @__PURE__ */ o("a", {
			href: x.externalValue,
			target: "_blank",
			rel: "noreferrer",
			className: "mb-2 block text-xs text-lt-primary underline underline-offset-2",
			children: "Open external example"
		}) : null,
		x?.value === void 0 ? null : /* @__PURE__ */ o(g.CodeBlock, {
			"aria-label": u,
			copyable: !0,
			language: "json",
			lineNumbers: !0,
			maxHeight: d,
			children: JSON.stringify(x.value, null, 2)
		})
	] })] });
}
function Tn({ requests: e, components: t, expandDepth: n }) {
	return e.length === 0 ? null : /* @__PURE__ */ s("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ o("h2", {
			className: "mb-2 font-semibold text-lt-fg",
			children: "Request body"
		}), e.map((e, r) => /* @__PURE__ */ s("div", {
			className: "mb-4",
			children: [/* @__PURE__ */ s("p", {
				className: "mb-1 font-mono text-xs text-lt-muted-fg",
				children: [e.mediaType ?? "unspecified media type", e.title ? ` — ${e.title}` : ""]
			}), e.schema || e.examples.length > 0 ? /* @__PURE__ */ o(wn, {
				name: `request-${e.mediaType ?? "none"}-${r}-tab`,
				schema: e.schema,
				examples: e.examples,
				components: t,
				noSchemaMessage: "No request body schema.",
				expandDepth: n,
				exampleLabel: "Request body example"
			}) : /* @__PURE__ */ o("p", {
				className: "text-lt-muted-fg",
				children: "No request body schema."
			})]
		}, `${e.mediaType ?? "none"}-${r}`))]
	});
}
function En({ responses: e, components: t, expandDepth: n }) {
	let [r, a] = i(null);
	if (e.length === 0) return null;
	let c = [...e].sort(Dn), l = c.find((e) => S(e) === r) ?? c[0], u = c.map(S);
	return /* @__PURE__ */ s("section", { children: [
		/* @__PURE__ */ o("h2", {
			className: "mb-2 font-semibold text-lt-fg",
			children: "Responses"
		}),
		/* @__PURE__ */ s("div", {
			className: "mb-3 flex items-center gap-2 pb-2",
			children: [/* @__PURE__ */ o(g.NativeSelect, {
				"aria-label": "Response status",
				value: r ?? u[0] ?? "",
				onChange: (e) => a(e.target.value),
				children: u.map((e) => /* @__PURE__ */ o("option", {
					value: e,
					children: e
				}, e))
			}), l ? /* @__PURE__ */ o(g.Badge, {
				color: dt(l.status),
				children: l.status ?? "default"
			}) : null]
		}),
		l ? /* @__PURE__ */ s("div", { children: [
			l.title ? /* @__PURE__ */ o("p", {
				className: "mb-2 text-lt-muted-fg",
				children: l.title
			}) : null,
			l.headers.length > 0 ? /* @__PURE__ */ s("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ o("h3", {
					className: "mb-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
					children: "Response headers"
				}), /* @__PURE__ */ o("ul", { children: l.headers.map((e) => /* @__PURE__ */ o(vn, { param: e }, e.name)) })]
			}) : null,
			l.schema || l.examples.length > 0 ? /* @__PURE__ */ o(wn, {
				name: `response-${S(l)}-tab`,
				schema: l.schema,
				examples: l.examples,
				components: t,
				noSchemaMessage: "No response body.",
				expandDepth: n,
				exampleLabel: "Response example",
				maxHeight: 800,
				defaultTab: "example",
				generateExample: !0
			}, S(l)) : /* @__PURE__ */ o("p", {
				className: "text-lt-muted-fg",
				children: "No response body."
			})
		] }) : null
	] });
}
function Dn(e, t) {
	let n = e.status ?? "default", r = t.status ?? "default", i = On(n) - On(r);
	return i !== 0 || n === r ? i : n.localeCompare(r, void 0, { numeric: !0 });
}
function On(e) {
	return {
		2: 0,
		3: 1,
		4: 2,
		5: 3
	}[e[0]] ?? 4;
}
function kn(e, t) {
	return t ? t.type === "http" && t.scheme === "bearer" ? t.bearerFormat ? `HTTP Bearer (${t.bearerFormat})` : "HTTP Bearer" : t.type === "http" && t.scheme === "basic" ? "HTTP Basic" : t.type === "apiKey" ? `API key (${t.in}: ${t.name})` : t.type === "oauth2" ? "OAuth 2.0" : t.type === "openIdConnect" ? "OpenID Connect" : e : e;
}
function An({ scheme: e, components: t, token: n }) {
	let r = (t?.securitySchemes ?? {})[e.name] ?? null;
	return /* @__PURE__ */ s("li", {
		className: "border-b border-lt-border py-2 last:border-b-0",
		children: [
			/* @__PURE__ */ o("span", {
				className: "text-lt-fg",
				children: kn(e.name, r)
			}),
			r?.description ? /* @__PURE__ */ o("p", {
				className: "mt-0.5 text-xs text-lt-muted-fg",
				children: r.description
			}) : null,
			/* @__PURE__ */ o("p", {
				className: "mt-0.5 text-xs text-lt-muted-fg",
				children: xt(e) ? n ? "Access token supplied by the host page." : "No access token is configured for live requests." : "This authentication scheme is not supported for live requests."
			}),
			e.scopes.length > 0 ? /* @__PURE__ */ o("div", {
				className: "mt-1 flex flex-wrap gap-1",
				children: e.scopes.map((e) => /* @__PURE__ */ o("code", {
					className: "rounded-lt-xs bg-lt-muted px-1.5 py-0.5 text-xs text-lt-muted-fg",
					children: e
				}, e))
			}) : null
		]
	});
}
function jn({ requirement: e, components: t, token: n }) {
	return e.schemes.length === 0 ? /* @__PURE__ */ o("p", {
		className: "text-lt-muted-fg",
		children: "Optional authentication"
	}) : /* @__PURE__ */ o("ul", { children: e.schemes.map((e) => /* @__PURE__ */ o(An, {
		scheme: e,
		components: t,
		token: n
	}, e.name)) });
}
function Mn({ security: e, components: t, token: n }) {
	return e.length === 0 ? null : /* @__PURE__ */ s("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ o("h2", {
			className: "mb-2 font-semibold text-lt-fg",
			children: "Authorization"
		}), e.map((e, r) => /* @__PURE__ */ s("div", { children: [r > 0 ? /* @__PURE__ */ o("p", {
			className: "my-2 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: "OR"
		}) : null, /* @__PURE__ */ o(jn, {
			requirement: e,
			components: t,
			token: n
		})] }, r))]
	});
}
function Nn({ operation: a, baseUrl: c, token: l, components: u, expandDepth: d = 2, twoColumnBreakpoint: f = "lg", hideHeaderIdentity: p = !1 }) {
	let m = `${a.summary.id}-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`, h = r(null), _ = r(null), [v, y] = i(() => In(a, u)), [b, x] = i("curl"), [S, C] = i(!1), [w, T] = i(null), D = bn(a), O = Sn(a), ne = /* @__PURE__ */ new Set([...D.flatMap((e) => e.params).map(K), ...O === null ? [] : [
		O.mode,
		O.page,
		O.cursor,
		O.perPage
	].filter((e) => e !== null).map(K)]), k = a.paramGroups.map((e) => ({
		...e,
		params: e.params.filter((e) => !ne.has(K(e)))
	})).filter((e) => e.params.length > 0), A = mt(a), j = A.find((e) => e.mediaType === v.mediaType) ?? null, M = n(() => bt({
		operation: a,
		baseUrl: c,
		values: v,
		token: l
	}), [
		a,
		c,
		v,
		l
	]), N = Fn(a), P = a.requests.length > 0 && A.length === 0, re = j?.required ?? !1, F = Kn[f], I = n(() => {
		if (M.request === null) return "";
		let e = Ct(M.request);
		return b === "curl" ? mn.generate(e) : gn.generate(e);
	}, [M, b]), L = n(() => ae(a, u), [a, u]);
	e(() => () => {
		let e = _.current;
		_.current = null, e?.abort();
	}, []);
	function R(e, t) {
		let n = K(e);
		y((e) => ({
			...e,
			parameters: {
				...e.parameters,
				[n]: t
			}
		}));
	}
	function z(e) {
		if (O === null || O.mode === null) return;
		let t = O.mode;
		y((n) => {
			let r = {
				...n.parameters,
				[K(t)]: e
			};
			return e === "cursor" && O.page !== null ? r[K(O.page)] = "" : O.cursor !== null && (r[K(O.cursor)] = ""), {
				...n,
				parameters: r
			};
		});
	}
	function ie(e) {
		y((t) => ({
			...t,
			body: e
		}));
	}
	function B(e) {
		let t = A.find((t) => t.mediaType === e);
		y((n) => ({
			...n,
			mediaType: e,
			body: t === void 0 ? "" : ee(E(t, u))
		}));
	}
	async function oe(e) {
		if (e.preventDefault(), P) return;
		let t = bt({
			operation: a,
			baseUrl: c,
			values: v,
			token: l
		});
		if (t.errors !== null) {
			let e = Pn(a, t.errors), n = h.current?.querySelectorAll("[data-field-key]") ?? [];
			Array.from(n).find((t) => t.dataset.fieldKey === e)?.focus();
			return;
		}
		_.current?.abort();
		let n = new AbortController();
		_.current = n, C(!0);
		try {
			let e = await st(t.request, n.signal);
			_.current === n && T(e);
		} catch (e) {
			if (!te(e)) throw e;
		} finally {
			_.current === n && (_.current = null, C(!1));
		}
	}
	return /* @__PURE__ */ s("div", {
		className: `grid min-w-0 items-start text-base ${F.grid}`,
		children: [/* @__PURE__ */ s("aside", {
			ref: h,
			"aria-label": "Request",
			className: "min-w-0 p-6",
			children: [
				/* @__PURE__ */ o(Ut, {
					operation: a,
					baseUrl: c,
					hideIdentity: p
				}),
				/* @__PURE__ */ o(Mn, {
					security: a.security,
					components: u,
					token: l
				}),
				k.length > 0 || D.length > 0 || O !== null ? /* @__PURE__ */ s("section", {
					className: "mb-6",
					children: [
						/* @__PURE__ */ o("h2", {
							className: "mb-2 font-semibold text-lt-fg",
							children: "Parameters"
						}),
						D.map((e) => /* @__PURE__ */ o(xn, {
							group: e,
							idPrefix: m,
							values: v,
							errors: M.errors?.parameters ?? {},
							onChange: R
						}, e.label)),
						O === null ? null : /* @__PURE__ */ o(Cn, {
							parameters: O,
							idPrefix: m,
							values: v,
							errors: M.errors?.parameters ?? {},
							onModeChange: z,
							onChange: R
						}),
						k.map((e) => /* @__PURE__ */ o(yn, {
							group: e,
							idPrefix: m,
							values: v,
							errors: M.errors?.parameters ?? {},
							onChange: R
						}, e.location))
					]
				}) : null,
				/* @__PURE__ */ s("div", {
					className: "flex flex-col gap-6",
					children: [
						k.filter((e) => !Rn(e.location)).map((e) => {
							let t = e.params.filter((t) => Ln(e.location, t));
							return t.length === 0 ? null : /* @__PURE__ */ s("section", {
								className: "flex flex-col gap-3",
								children: [/* @__PURE__ */ s("h3", {
									className: "text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
									children: [e.location, " parameters"]
								}), /* @__PURE__ */ o("div", {
									className: "flex flex-wrap gap-4",
									children: t.map((e) => /* @__PURE__ */ o(Q, {
										idPrefix: m,
										param: e,
										value: v.parameters[K(e)] ?? "",
										error: M.errors?.parameters[K(e)] ?? null,
										onChange: (t) => R(e, t)
									}, K(e)))
								})]
							}, e.location);
						}),
						N.length > 0 || P ? /* @__PURE__ */ s("section", {
							"aria-live": "polite",
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ o("h3", {
								className: "text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
								children: "Request limitations"
							}), /* @__PURE__ */ s("ul", {
								className: "flex flex-col gap-1 text-xs text-lt-danger",
								children: [N.map(({ key: e, name: t, message: n }) => /* @__PURE__ */ s("li", { children: [
									t,
									": ",
									n
								] }, e)), P ? /* @__PURE__ */ o("li", { children: "Only JSON request bodies can be sent from the playground." }) : null]
							})]
						}) : null,
						A.length > 0 ? /* @__PURE__ */ s("section", {
							className: "flex flex-col gap-3",
							children: [A.length > 1 ? /* @__PURE__ */ o(g.FormFieldFrame, {
								id: `${m}-request-media-type`,
								label: "Content type",
								className: "min-w-0 basis-full flex-1 sm:basis-48",
								children: (e) => /* @__PURE__ */ o(g.NativeSelect, {
									...e,
									value: v.mediaType ?? "",
									onChange: (e) => B(e.target.value),
									children: A.map((e) => /* @__PURE__ */ o("option", {
										value: e.mediaType ?? "",
										children: e.mediaType
									}, e.mediaType))
								})
							}) : null, j === null ? null : /* @__PURE__ */ o(Gt, {
								idPrefix: m,
								schema: j.schema,
								components: u,
								value: v.body,
								required: re,
								error: M.errors?.body ?? void 0,
								onChange: ie
							})]
						}) : null,
						M.errors?.request ? /* @__PURE__ */ o("p", {
							className: "text-lt-danger",
							children: M.errors.request
						}) : null,
						/* @__PURE__ */ s("form", {
							onSubmit: oe,
							className: "flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ s(g.Button, {
								type: "submit",
								disabled: S || P,
								children: [S ? /* @__PURE__ */ o(g.Spinner, { className: "size-lt-icon-sm" }) : null, "Execute"]
							}), p ? null : /* @__PURE__ */ o(g.CopyButton, {
								value: L,
								label: "as Markdown",
								testId: "copy-operation-markdown",
								className: "ml-auto",
								children: "Copy as Markdown"
							})]
						}),
						/* @__PURE__ */ o(ut, { result: w })
					]
				})
			]
		}), /* @__PURE__ */ o("aside", {
			"aria-label": "Reference",
			className: `min-w-0 border-t border-lt-border p-6 ${F.reference}`,
			children: /* @__PURE__ */ s("div", {
				className: "flex flex-col gap-6",
				children: [
					/* @__PURE__ */ o(un, {
						idPrefix: m,
						language: b,
						snippet: I,
						onLanguageChange: x
					}),
					/* @__PURE__ */ o(Tn, {
						requests: a.requests,
						components: u,
						expandDepth: d
					}),
					/* @__PURE__ */ o(En, {
						responses: a.responses,
						components: u,
						expandDepth: d
					})
				]
			})
		})]
	});
}
function Q({ idPrefix: e, param: t, value: n, error: r, onChange: a, inline: c = !1 }) {
	let l = K(t), u = `${e}-${Gn(l)}`, d = zn(t), f = Bn(d), p = n === "" ? [] : n.split(","), [m, h] = i(!1);
	function _(e) {
		a(p.includes(e) ? p.filter((t) => t !== e).join(",") : [...p, e].join(","));
	}
	return /* @__PURE__ */ o(g.FormFieldFrame, {
		id: u,
		label: t.name,
		required: t.required,
		helperText: c ? void 0 : t.description ?? void 0,
		error: r ?? void 0,
		className: c ? "min-w-0 [&>div:first-child]:sr-only" : "min-w-0 basis-full flex-1 sm:basis-48",
		children: (e) => f.length > 0 ? /* @__PURE__ */ o(g.Combobox, {
			multiple: !0,
			open: m,
			onOpenChange: h,
			options: f.map((e) => ({
				label: e,
				value: e,
				data: null
			})),
			selected: p,
			onSelect: _,
			emptyLabel: "No values found.",
			showSearch: f.length >= 10,
			searchPlaceholder: "Search values...",
			trigger: /* @__PURE__ */ o("span", {
				className: p.length === 0 ? "text-lt-muted-fg" : void 0,
				children: p.length === 0 ? "Not set" : p.join(", ")
			}),
			triggerClassName: "flex h-lt-control-md w-full items-center rounded-lt-sm border border-lt-input bg-transparent px-3 py-1 text-left outline-none focus-visible:border-lt-ring focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50",
			triggerProps: {
				...e,
				"data-field-key": l
			}
		}) : Array.isArray(d.enum) ? /* @__PURE__ */ s(g.NativeSelect, {
			...e,
			value: n,
			required: t.required,
			"data-field-key": l,
			onChange: (e) => a(e.target.value),
			children: [t.required ? null : /* @__PURE__ */ o("option", {
				value: "",
				children: "Not set"
			}), d.enum.map((e) => /* @__PURE__ */ o("option", {
				value: String(e),
				children: String(e)
			}, String(e)))]
		}) : d.type === "boolean" ? /* @__PURE__ */ s(g.NativeSelect, {
			...e,
			value: n,
			required: t.required,
			"data-field-key": l,
			onChange: (e) => a(e.target.value),
			children: [
				t.required ? null : /* @__PURE__ */ o("option", {
					value: "",
					children: "Not set"
				}),
				/* @__PURE__ */ o("option", {
					value: "true",
					children: "true"
				}),
				/* @__PURE__ */ o("option", {
					value: "false",
					children: "false"
				})
			]
		}) : /* @__PURE__ */ o(g.Input, {
			...e,
			type: Vn(d),
			value: n,
			required: t.required,
			min: Hn(d),
			max: Un(d),
			step: Wn(d),
			minLength: $(d.minLength),
			maxLength: $(d.maxLength),
			pattern: typeof d.pattern == "string" ? d.pattern : void 0,
			"data-field-key": l,
			onChange: (e) => a(e.target.value)
		})
	});
}
function Pn(e, t) {
	for (let n of e.paramGroups) for (let e of n.params) {
		let r = K(e);
		if (Ln(n.location, e) && t.parameters[r] !== void 0) return r;
	}
	return t.body === null ? null : "body";
}
function Fn(e) {
	return e.paramGroups.flatMap((e) => e.params.flatMap((e) => {
		let t = K(e), n = Ot(e);
		return n === null ? [] : [{
			key: t,
			name: e.name,
			message: n
		}];
	}));
}
function In(e, t) {
	let n = ht(e, t), r = { ...n.parameters };
	for (let t of e.paramGroups.flatMap((e) => e.params)) !t.required && Ot(t) !== null && (r[K(t)] = "");
	return {
		...n,
		parameters: r
	};
}
function Ln(e, t) {
	return [
		"path",
		"query",
		"header"
	].includes(e) && Ot(t) === null;
}
function Rn(e) {
	return e === "path" || e === "query";
}
function zn(e) {
	return x(e.schema) ? e.schema : {};
}
function Bn(e) {
	return e.type !== "array" || !x(e.items) || !Array.isArray(e.items.enum) ? [] : e.items.enum.filter((e) => typeof e == "string");
}
function Vn(e) {
	if (e.type === "number" || e.type === "integer") return "number";
	switch (e.format) {
		case "email": return "email";
		case "uri":
		case "url": return "url";
		case "date": return "date";
		case "password": return "password";
		default: return "text";
	}
}
function Hn(e) {
	return $(e.minimum) ?? $(e.exclusiveMinimum);
}
function Un(e) {
	return $(e.maximum) ?? $(e.exclusiveMaximum);
}
function Wn(e) {
	let t = $(e.multipleOf);
	return t === void 0 ? e.type === "integer" ? 1 : e.type === "number" ? "any" : void 0 : t;
}
function $(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : void 0;
}
function Gn(e) {
	return e.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
}
var Kn, qn, Jn = f((() => {
	v(), ot(), lt(), ft(), Wt(), ye(), B(), ln(), Ht(), yt(), fn(), L(), hn(), _n(), C(), Kn = {
		default: {
			grid: "grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
			reference: "sticky top-0 border-l border-t-0"
		},
		sm: {
			grid: "sm:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
			reference: "sm:sticky sm:top-0 sm:border-l sm:border-t-0"
		},
		md: {
			grid: "md:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
			reference: "md:sticky md:top-0 md:border-l md:border-t-0"
		},
		lg: {
			grid: "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
			reference: "lg:sticky lg:top-0 lg:border-l lg:border-t-0"
		},
		xl: {
			grid: "xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
			reference: "xl:sticky xl:top-0 xl:border-l xl:border-t-0"
		},
		"2xl": {
			grid: "2xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
			reference: "2xl:sticky 2xl:top-0 2xl:border-l 2xl:border-t-0"
		}
	}, qn = [{
		key: "schema",
		label: "Schema"
	}, {
		key: "example",
		label: "Example"
	}];
}));
//#endregion
//#region resources/js/api-reference/OperationView.tsx
function Yn({ spec: e, operationId: t, baseUrl: r, token: i, expandDepth: a = 2, twoColumnBreakpoint: c = "lg", hideHeaderIdentity: l = !1 }) {
	let u = n(() => t ? H(e, t, r ?? null) : null, [
		e,
		t,
		r
	]), d = e?.components ?? null;
	return t ? u ? /* @__PURE__ */ o("div", {
		className: "min-w-0 flex-1 overflow-y-auto",
		children: /* @__PURE__ */ o(Nn, {
			operation: u,
			baseUrl: u.serverUrl,
			token: i ?? null,
			components: d,
			expandDepth: a,
			twoColumnBreakpoint: c,
			hideHeaderIdentity: l
		}, u.summary.id)
	}) : /* @__PURE__ */ s("div", {
		className: "flex-1 p-6 text-base text-lt-danger",
		children: [
			"Operation \"",
			t,
			"\" could not be found in this specification."
		]
	}) : /* @__PURE__ */ o("div", {
		className: "flex-1 p-6 text-base text-lt-muted-fg",
		children: "Select an operation to view its details."
	});
}
var Xn = f((() => {
	Ge(), Jn();
}));
//#endregion
//#region resources/js/api-reference/ServerPicker.tsx
function Zn(e) {
	return e.description ? `${e.description} — ${e.url}` : e.url;
}
function Qn({ servers: e, selectedServerUrl: t, onServerChange: n }) {
	return e.length === 0 ? null : e.length === 1 ? /* @__PURE__ */ o("p", {
		className: "truncate py-1 text-xs text-lt-muted-fg",
		title: e[0].url,
		children: Zn(e[0])
	}) : /* @__PURE__ */ o(g.NativeSelect, {
		value: t ?? "",
		onChange: (e) => n(e.target.value),
		"aria-label": "Select server",
		children: e.map((e) => /* @__PURE__ */ o("option", {
			value: e.url,
			children: Zn(e)
		}, e.url))
	});
}
var $n = f((() => {
	v();
})), er = /* @__PURE__ */ p({ default: () => ir });
function tr(e) {
	if (!e) return null;
	for (let t of e.groups) {
		let [e] = t.operationIds;
		if (e) return e;
	}
	return null;
}
function nr() {
	let e = window.location.hash.slice(1);
	return e === "" ? null : e;
}
function rr({ title: e, info: t }) {
	let n = e ?? t.title;
	return !n && !t.version && !t.description ? null : /* @__PURE__ */ s("header", {
		className: "border-b border-lt-border py-6",
		children: [
			n ? /* @__PURE__ */ o("h1", {
				className: "text-lg font-semibold text-lt-fg",
				children: n
			}) : null,
			t.version ? /* @__PURE__ */ s("p", {
				className: "mt-1 text-xs text-lt-muted-fg",
				children: ["v", t.version]
			}) : null,
			t.description ? /* @__PURE__ */ o("p", {
				className: "mt-2 text-lt-muted-fg",
				children: t.description
			}) : null
		]
	});
}
var ir, ar = f((() => {
	v(), b(), ye(), Xn(), Ge(), Ht(), $n(), ir = ({ node: t }) => {
		let { spec: r, url: c, operation: l, tags: u, defaultOperation: d, hideHeader: f, hideBaseUrl: p, title: m = null, expandDepth: h, twoColumnBreakpoint: _, token: v = null } = t.props, [b, x] = i(r ?? null), [ee, te] = i(!!c), [S, C] = i(null), [w, T] = i(() => nr()), [E, D] = i(null), [O, ne] = i(null), [k, A] = i(null), [j, M] = i({});
		e(() => {
			if (!c) return;
			let e = !0;
			return te(!0), C(null), fetch(c).then((e) => {
				if (!e.ok) throw Error(`Failed to fetch spec: ${e.status} ${e.statusText}`);
				return e.json();
			}).then((t) => {
				e && x(t);
			}).catch((t) => {
				e && C(t instanceof Error ? t.message : String(t));
			}).finally(() => {
				e && te(!1);
			}), () => {
				e = !1;
			};
		}, [c]);
		let N = n(() => b ? De(b) : null, [b]), P = n(() => N && u?.length ? Be(N, u) : N, [N, u]), re = b?.components ?? null, F = l ?? w, I = P?.groups.find((e) => e.id === E && w && e.operationIds.includes(w))?.id ?? P?.groups.find((e) => w && e.operationIds.includes(w))?.id, L = n(() => {
			if (!b || !F) return null;
			let e = H(b, F);
			if (!e) return null;
			let t = e.usesRootServers ? k : j[F] ?? null;
			return H(b, F, t);
		}, [
			b,
			F,
			k,
			j
		]);
		e(() => {
			if (w !== null || !P) return;
			let e = nr() ?? d ?? tr(P);
			e && T(e);
		}, [
			P,
			w,
			d
		]), e(() => {
			if (!P || P.servers.some((e) => e.url === k)) return;
			let e = P.servers[0]?.url ?? null;
			e && A(e);
		}, [P, k]), e(() => {
			function e() {
				T(nr());
			}
			return window.addEventListener("hashchange", e), () => window.removeEventListener("hashchange", e);
		}, []);
		function R(e) {
			T(e), window.location.hash = e;
		}
		function z(e, t) {
			let n = `${e}:${t}`;
			if (t === w && e === I && O !== n) {
				ne(n);
				return;
			}
			ne(null), D(e), R(t);
		}
		function ie(e) {
			if (!F || L?.usesRootServers !== !1) {
				A(e);
				return;
			}
			M((t) => ({
				...t,
				[F]: e
			}));
		}
		function B(e) {
			let t = H(b, e);
			if (!t) return k;
			let n = t.usesRootServers ? k : j[e] ?? null;
			return H(b, e, n)?.serverUrl ?? k;
		}
		if (ee) return /* @__PURE__ */ o("div", {
			className: "p-6 text-base text-lt-muted-fg",
			children: "Loading API reference…"
		});
		if (S) return /* @__PURE__ */ o("div", {
			className: "p-6 text-base text-lt-danger",
			children: S
		});
		if (!b || !P) return /* @__PURE__ */ o("div", {
			className: "p-6 text-base text-lt-muted-fg",
			children: "No API specification provided."
		});
		let oe = /* @__PURE__ */ s(a, { children: [f ? null : /* @__PURE__ */ o(rr, {
			title: m,
			info: P.info
		}), L && !p ? /* @__PURE__ */ o("div", {
			className: "border-b border-lt-border py-3",
			children: /* @__PURE__ */ o(Qn, {
				servers: L.servers,
				selectedServerUrl: L.serverUrl,
				onServerChange: ie
			})
		}) : null] });
		return l ? /* @__PURE__ */ o("div", {
			className: "flex w-full text-base",
			children: /* @__PURE__ */ s("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [oe, /* @__PURE__ */ o(Yn, {
					spec: b,
					operationId: l,
					baseUrl: B(l),
					token: v,
					expandDepth: h,
					twoColumnBreakpoint: _
				}, l)]
			})
		}) : /* @__PURE__ */ s("div", {
			className: "flex min-w-0 w-full flex-col text-base",
			children: [oe, /* @__PURE__ */ o("div", {
				className: "flex flex-col gap-8 py-6",
				children: P.groups.map((e) => /* @__PURE__ */ s("section", {
					"aria-labelledby": `api-reference-tag-${e.id}`,
					children: [/* @__PURE__ */ o("h2", {
						id: `api-reference-tag-${e.id}`,
						className: "mb-3 font-semibold text-lt-fg",
						children: e.title
					}), /* @__PURE__ */ o("div", {
						className: "overflow-hidden rounded-lt border border-lt-border",
						children: e.operationIds.map((t) => {
							let n = P.summaries[t];
							if (!n) return null;
							let r = `${e.id}:${t}`, i = t === w && e.id === I && O !== r, a = `api-reference-operation-${e.id}-${t}`, c = B(t), l = Mt(c, n.path), u = H(b, t, c), d = u ? ae(u, re) : "";
							return /* @__PURE__ */ s("div", {
								className: "border-b border-lt-border last:border-b-0",
								children: [/* @__PURE__ */ s("div", {
									className: "relative bg-lt-muted",
									children: [/* @__PURE__ */ s("div", {
										className: "@container pointer-events-none relative z-10 flex items-center gap-2 px-4 py-3",
										children: [
											/* @__PURE__ */ o(g.Icon, {
												name: "chevron-down",
												className: `size-lt-icon-xs shrink-0 text-lt-muted-fg transition-transform${i ? "" : " -rotate-90"}`
											}),
											/* @__PURE__ */ o(g.Badge, {
												color: y(n.method),
												className: "text-xs",
												children: n.method
											}),
											/* @__PURE__ */ s("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ o("span", {
													className: "block font-medium text-lt-fg",
													children: n.title
												}), /* @__PURE__ */ s("div", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ o("span", {
														className: "min-w-0 break-words font-mono text-xs text-lt-muted-fg",
														children: l
													}), /* @__PURE__ */ o(g.CopyButton, {
														value: l,
														label: `${n.title} URL`,
														iconOnly: !0,
														className: "pointer-events-auto size-7 shrink-0"
													})]
												})]
											}),
											/* @__PURE__ */ o(g.CopyButton, {
												value: d,
												label: `${n.title} as Markdown`,
												testId: `copy-${t}-markdown`,
												className: "pointer-events-auto shrink-0",
												children: /* @__PURE__ */ o("span", {
													className: "hidden @3xl:inline",
													children: "Copy as Markdown"
												})
											})
										]
									}), /* @__PURE__ */ o("button", {
										type: "button",
										"aria-label": n.title,
										"aria-expanded": i,
										"aria-controls": a,
										onClick: () => z(e.id, t),
										className: "absolute inset-0 z-0 cursor-pointer transition-colors hover:bg-lt-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lt-ring"
									})]
								}), i ? /* @__PURE__ */ o("div", {
									id: a,
									children: /* @__PURE__ */ o(Yn, {
										spec: b,
										operationId: t,
										baseUrl: B(t),
										token: v,
										expandDepth: h,
										twoColumnBreakpoint: _,
										hideHeaderIdentity: !0
									}, t)
								}) : null]
							}, t);
						})
					})]
				}, e.id))
			})]
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
v();
var or = {
	name: "api-reference",
	components: { "api-reference": (0, g.lazyComponent)(() => Promise.resolve().then(() => (ar(), er))) }
};
//#endregion
export { or as default };
