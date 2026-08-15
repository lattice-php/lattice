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
function S(e) {
	return typeof e == "object" && !!e && "name" in e && e.name === "AbortError";
}
function C(e) {
	return [e.status, e.mediaType].filter((e) => !!e).join(" ") || "default";
}
var w = f((() => {}));
//#endregion
//#region resources/js/api-reference/schema-example.ts
function te(e, t) {
	return D(e, t, /* @__PURE__ */ new Set(), "complete");
}
function T(e, t) {
	return D(e, t, /* @__PURE__ */ new Set(), "request");
}
function ne(e, t) {
	return E(e, t, "complete");
}
function re(e, t) {
	return E(e, t, "request");
}
function E(e, t, n) {
	let r = e.examples.find((e) => e.value !== void 0);
	return r === void 0 ? D(e.schema, t, /* @__PURE__ */ new Set(), n) : r.value;
}
function D(e, t, n, r) {
	if (!x(e)) return null;
	let i = e.example;
	if (i !== void 0) return i;
	if (Array.isArray(e.examples) && e.examples.length > 0) return e.examples[0];
	let a = e.default;
	return a === void 0 ? e.const === void 0 ? Array.isArray(e.enum) && e.enum.length > 0 ? e.enum[0] : j([
		O(e, t, n, r),
		...k(e.allOf, t, n, r),
		ie(e, t, n, r),
		A(e, t, n, r)
	]) : e.const : a;
}
function O(e, t, n, r) {
	let i = N(e);
	if (i === null || n.has(i)) return null;
	let a = ae(i, t);
	if (a === null) return null;
	n.add(i);
	let o = D(a, t, n, r);
	return n.delete(i), o;
}
function k(e, t, n, r) {
	return Array.isArray(e) ? e.map((e) => D(e, t, n, r)) : [];
}
function ie(e, t, n, r) {
	let i = Array.isArray(e.oneOf) ? e.oneOf : e.anyOf;
	if (!Array.isArray(i)) return null;
	for (let e of i) {
		let i = D(e, t, n, r);
		if (i !== null) return i;
	}
	return null;
}
function A(e, t, n, r) {
	let i = Array.isArray(e.type) ? e.type.find((e) => e !== "null") : e.type;
	return i === "object" || x(e.properties) ? P(e.properties, e.required, t, n, r) : i === "array" ? [D(e.items, t, n, r)] : i === "string" ? M(e.format) : i === "integer" || i === "number" ? 0 : i !== "boolean" && null;
}
function j(e) {
	let t = e.filter(x);
	return t.length > 0 ? Object.assign({}, ...t) : e.find((e) => e !== null) ?? null;
}
function M(e) {
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
function N(e) {
	return typeof e.$ref != "string" || !e.$ref.startsWith(F) ? null : e.$ref;
}
function ae(e, t) {
	if (!x(t) || !x(t.schemas)) return null;
	let n = e.slice(21);
	return n === "" || !(n in t.schemas) ? null : t.schemas[n];
}
function P(e, t, n, r, i) {
	if (!x(e)) return {};
	let a = new Set(Array.isArray(t) ? t.filter((e) => typeof e == "string") : []);
	return Object.fromEntries(Object.entries(e).filter(([e, t]) => i === "complete" || a.has(e) && (!x(t) || t.readOnly !== !0)).map(([e, t]) => [e, D(t, n, r, i)]));
}
var F, I = f((() => {
	w(), F = "#/components/schemas/";
}));
//#endregion
//#region resources/js/api-reference/parameter-schema.ts
function L(e) {
	if (!x(e)) return "any";
	if (typeof e.$ref == "string") return e.$ref.split("/").pop() ?? "ref";
	for (let [t, n] of [
		["oneOf", " | "],
		["anyOf", " | "],
		["allOf", " & "]
	]) {
		let r = e[t];
		if (Array.isArray(r) && r.length > 0) return [...new Set(r.map(L))].join(n);
	}
	return Array.isArray(e.type) ? e.type.join(" | ") : typeof e.type == "string" ? e.type === "array" && e.items ? `${L(e.items)}[]` : e.type : Array.isArray(e.enum) ? "enum" : "any";
}
function R(e) {
	return x(e) ? Array.isArray(e.enum) ? e.enum.map(z) : e.type === "array" && x(e.items) && Array.isArray(e.items.enum) ? e.items.enum.map(z) : [] : [];
}
function z(e) {
	return typeof e == "string" ? e : JSON.stringify(e) ?? String(e);
}
var B = f((() => {
	w();
}));
//#endregion
//#region resources/js/api-reference/operation-markdown.ts
function oe(e, t) {
	return [
		[
			`# ${e.summary.title}`,
			`\`${e.summary.method} ${e.summary.path}\``,
			e.description
		].filter((e) => !!e).join("\n\n"),
		V(e.security),
		ce(e.paramGroups.flatMap((e) => e.params)),
		ue(e.requests, t),
		fe(e.responses, t)
	].filter((e) => !!e).join("\n\n");
}
function V(e) {
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
		...e.map((e) => `| ${_e(e.name)} | ${_e(e.location)} | ${_e(L(e.schema))} | ${e.required ? "yes" : "no"} | ${_e(H(e))} |`)
	].join("\n");
}
function H(e) {
	let t = R(e.schema), n = t.length === 0 ? null : `Available values: ${t.map((e) => `\`${e}\``).join(", ")}`, r = [e.description, n].filter((e) => !!e);
	return r.length === 0 ? null : r.join("\n");
}
function ue(e, t) {
	return e.length === 0 ? null : ["## Request body", ...e.map((e) => de(e, t))].join("\n\n");
}
function de(e, t) {
	return [
		e.mediaType ? `**Content-Type:** \`${e.mediaType}\`` : "**Content-Type:** unspecified",
		e.title,
		me(e, t, 3)
	].filter((e) => !!e).join("\n\n");
}
function fe(e, t) {
	return e.length === 0 ? null : ["## Responses", ...e.map((e) => pe(e, t))].join("\n\n");
}
function pe(e, t) {
	return [
		`### ${C(e)}`,
		e.title,
		e.headers.length > 0 ? ["#### Headers", le(e.headers)].join("\n\n") : null,
		me(e, t, 4)
	].filter((e) => !!e).join("\n\n");
}
function me(e, t, n) {
	let r = [];
	e.schema !== null && r.push([`${"#".repeat(n)} Schema`, ge(e.schema)].filter((e) => !!e).join("\n\n"));
	let i = e.examples.length > 0 ? e.examples : e.schema === null ? [] : [{
		name: null,
		summary: null,
		value: e.role === "request" ? re(e, t) : ne(e, t)
	}];
	r.push(...i.map((e) => he(e, n)));
	let a = r.filter((e) => !!e);
	return a.length === 0 ? null : a.join("\n\n");
}
function he(e, t) {
	let n = e.name ? `Example: ${e.name}` : "Example";
	return [
		`${"#".repeat(t)} ${n}`,
		e.summary,
		e.description,
		e.externalValue ? `[Open external example](${e.externalValue})` : null,
		ge(e.value)
	].filter((e) => !!e).join("\n\n");
}
function ge(e) {
	let t = JSON.stringify(e, null, 2);
	return t === void 0 ? null : `\`\`\`json\n${t}\n\`\`\``;
}
function _e(e) {
	return (e ?? "").replaceAll("|", "\\|").replaceAll(/\r?\n/g, "<br>");
}
var ve = f((() => {
	I(), B(), w();
}));
//#endregion
//#region resources/js/api-reference/parse.ts
function ye(e) {
	return e.replaceAll("/", "-").replaceAll("{", "").replaceAll("}", "").replace(/^-+|-+$/g, "");
}
function be(e, t) {
	let n = ye(t);
	return n === "" ? `${e}-root` : `${e}-${n}`;
}
function xe(e, t, n) {
	return typeof e.summary == "string" && e.summary !== "" ? e.summary : typeof e.operationId == "string" && e.operationId !== "" ? e.operationId : `${t.toUpperCase()} ${n}`;
}
function U(e, t, n) {
	if (typeof t != "string") return null;
	let r = t.split("/").pop();
	return r ? e?.components?.[n]?.[r] ?? null : null;
}
function Se(e, t) {
	let n = e.paths ?? {};
	for (let e of Object.keys(n)) {
		let r = n[e];
		for (let n of Ve) {
			let i = r[n];
			if (!(!i || typeof i != "object") && be(n, e) === t) return {
				path: e,
				method: n,
				pathItem: r,
				operation: i
			};
		}
	}
	return null;
}
function Ce(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e?.url == "string").map((e) => ({
		url: we(e.url, e.variables),
		description: e.description ?? null
	})) : [];
}
function we(e, t) {
	return t ? e.replaceAll(/\{([^{}]+)\}/g, (e, n) => {
		let r = t[n]?.default;
		return r === void 0 ? e : String(r);
	}) : e;
}
function Te(e) {
	let t = Ce(e.servers);
	return t.length > 0 ? t : [{
		url: "/",
		description: null
	}];
}
function Ee(e) {
	let t = Be(e), n = {
		title: t.info?.title ?? "",
		version: t.info?.version ?? null,
		description: t.info?.description ?? null
	}, r = {}, i = /* @__PURE__ */ new Map(), a = t.paths ?? {};
	for (let e of Object.keys(a)) {
		let t = a[e];
		for (let n of Ve) {
			let a = t[n];
			if (!a || typeof a != "object") continue;
			let o = be(n, e);
			r[o] = {
				id: o,
				method: n.toUpperCase(),
				path: e,
				title: xe(a, n, e),
				deprecated: !!a.deprecated
			};
			let s = a.tags && a.tags.length > 0 ? a.tags : [Ue];
			for (let e of s) {
				let t = i.get(e) ?? [];
				t.push(o), i.set(e, t);
			}
		}
	}
	return {
		info: n,
		groups: Array.from(i.entries()).map(([e, t]) => ({
			id: De(e),
			title: e,
			operationIds: t
		})),
		summaries: r,
		servers: Te(t)
	};
}
function De(e) {
	return e.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function Oe(e, t) {
	let n = t.schema ?? {};
	return {
		name: t.name,
		location: t.in,
		required: !!t.required,
		deprecated: !!t.deprecated,
		description: t.description ?? null,
		tooltip: t["x-tooltip"] ?? null,
		schema: n,
		example: ke(e, t, n),
		...t.style === void 0 ? {} : { style: t.style },
		...t.explode === void 0 ? {} : { explode: t.explode },
		...t["x-filter-type"] === void 0 ? {} : { filterType: t["x-filter-type"] }
	};
}
function ke(e, t, n) {
	if (t.example !== void 0) return t.example;
	let r = Ae(e, t.examples);
	if (r !== void 0) return r;
	let i = je(n, "example");
	if (i !== void 0) return i;
	let a = je(n, "examples");
	return Array.isArray(a) && a.length > 0 ? a[0] : je(n, "default") ?? null;
}
function Ae(e, t) {
	if (t) for (let n of Object.values(t)) {
		let t = n.$ref ? U(e, n.$ref, "examples") ?? n : n;
		if (t.value !== void 0) return t.value;
	}
}
function je(e, t) {
	if (!(typeof e != "object" || !e || !(t in e))) return e[t];
}
function Me(e, t) {
	return t ? Object.entries(t).map(([t, n]) => Oe(e, {
		...n.$ref ? U(e, n.$ref, "headers") ?? n : n,
		name: t,
		in: "header"
	})) : [];
}
function Ne(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of [t, n]) for (let t of i) {
		let n = t.$ref ? U(e, t.$ref, "parameters") ?? t : t;
		r.set(`${n.in}::${n.name}`, n);
	}
	let i = /* @__PURE__ */ new Map();
	for (let t of r.values()) {
		let n = i.get(t.in) ?? [];
		n.push(Oe(e, t)), i.set(t.in, n);
	}
	let a = [];
	for (let e of He) {
		let t = i.get(e);
		t && t.length > 0 && a.push({
			location: e,
			params: t
		});
	}
	return a;
}
function Pe(e, t) {
	if (!t) return [];
	let n = t.examples;
	return n && Object.keys(n).length > 0 ? Object.entries(n).map(([t, n]) => {
		let r = n && typeof n == "object" && "$ref" in n ? U(e, n.$ref, "examples") ?? n : n;
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
function Fe(e, t) {
	if (!t) return [];
	let n = t.$ref ? U(e, t.$ref, "requestBodies") ?? t : t, r = n.content ?? {}, i = n.description ?? null;
	return Object.entries(r).map(([t, r]) => ({
		role: "request",
		status: null,
		mediaType: t,
		schema: r?.schema ?? null,
		title: i,
		examples: Pe(e, r),
		headers: [],
		required: !!n.required
	}));
}
function Ie(e, t) {
	if (!t) return [];
	let n = [];
	for (let [r, i] of Object.entries(t)) {
		let t = i.$ref ? U(e, i.$ref, "responses") ?? i : i, a = t.description ?? null, o = t.content ?? {}, s = Object.entries(o), c = Me(e, t.headers);
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
			examples: Pe(e, i),
			headers: c,
			required: !1
		});
	}
	return n;
}
function Le(e, t) {
	return (t.security === void 0 ? e.security ?? [] : t.security).map((t) => ({ schemes: Object.entries(t).map(([t, n]) => {
		let r = Re(e, t);
		return {
			name: t,
			scopes: n ?? [],
			type: r?.type ?? null,
			scheme: r?.scheme ?? null
		};
	}) }));
}
function Re(e, t) {
	let n = e.components?.securitySchemes?.[t] ?? null;
	return n?.$ref ? U(e, n.$ref, "securitySchemes") ?? n : n;
}
function ze(e, t) {
	let n = new Set(t), r = e.groups.filter((e) => n.has(e.title)), i = new Set(r.flatMap((e) => e.operationIds)), a = Object.fromEntries(Object.entries(e.summaries).filter(([e]) => i.has(e)));
	return {
		...e,
		groups: r,
		summaries: a
	};
}
function W(e, t, n = null) {
	let r = Be(e), i = Se(r, t);
	if (!i) return null;
	let { path: a, method: o, pathItem: s, operation: c } = i, l = Ce(c.servers), u = Ce(s.servers), d = l.length === 0 && u.length === 0, f = l.length > 0 ? l : u.length > 0 ? u : Te(r), p = d && n !== null || n !== null && f.some((e) => e.url === n) ? n : f[0].url;
	return {
		summary: {
			id: t,
			method: o.toUpperCase(),
			path: a,
			title: xe(c, o, a),
			deprecated: !!c.deprecated
		},
		serverUrl: p,
		servers: f,
		usesRootServers: d,
		description: c.description ?? null,
		tooltip: c["x-tooltip"] ?? null,
		tags: c.tags ?? [],
		paramGroups: Ne(r, s.parameters ?? [], c.parameters ?? []),
		requests: Fe(r, c.requestBody),
		responses: Ie(r, c.responses),
		security: Le(r, c)
	};
}
function Be(e) {
	return typeof e == "object" && e ? e : {};
}
var Ve, He, Ue, We = f((() => {
	Ve = [
		"get",
		"post",
		"put",
		"patch",
		"delete",
		"options",
		"head",
		"trace"
	], He = [
		"path",
		"query",
		"header",
		"cookie"
	], Ue = "Default";
}));
//#endregion
//#region resources/js/schema/build-rows.ts
function G(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Ge(e) {
	return typeof e != "string" || !e.startsWith("#/components/schemas/") ? null : e.slice(21);
}
function Ke(e, t) {
	let n = Ge(e);
	if (n === null) return null;
	let r = G(G(t?.schemas)?.[n]);
	return r ? {
		name: n,
		schema: r
	} : null;
}
function qe(e, t) {
	for (let [n, r] of Object.entries(t)) n === "properties" ? e.properties = {
		...G(e.properties),
		...G(r)
	} : n === "required" ? e.required = [.../* @__PURE__ */ new Set([...Array.isArray(e.required) ? e.required : [], ...Array.isArray(r) ? r : []])] : e[n] = r;
}
function K(e, t, n) {
	let r = e, i = {};
	for (; r.$ref !== void 0;) {
		let e = Ke(r.$ref, t);
		if (e === null) return i;
		if (n.has(e.name)) return {
			...r,
			...i
		};
		n.add(e.name), i = {
			...Je(r),
			...i
		}, r = e.schema;
	}
	if (!Array.isArray(r.allOf)) {
		let e = { ...r };
		return qe(e, i), e;
	}
	let { allOf: a, ...o } = r, s = {};
	for (let e of a) {
		let r = G(e);
		r && qe(s, K(r, t, n));
	}
	return qe(s, K(o, t, n)), qe(s, i), s;
}
function Je(e) {
	let t = { ...e };
	return delete t.$ref, t;
}
function Ye(e, t) {
	let n = Array.isArray(e.type) ? e.type.filter((e) => typeof e == "string") : typeof e.type == "string" ? [e.type] : [];
	if (n.length === 0 && (e.properties !== void 0 || e.additionalProperties !== void 0 ? n.push("object") : e.items !== void 0 && n.push("array")), e.nullable === !0 && !n.includes("null") && n.push("null"), n.length === 0) return Array.isArray(e.oneOf) ? "oneOf" : Array.isArray(e.anyOf) ? "anyOf" : "any";
	let r = G(e.items);
	if (r && n[0] === "array") {
		let e = Ge(r.$ref) ?? Ye(K(r, t, /* @__PURE__ */ new Set()), t);
		e !== "any" && e !== "object" && (n[0] = `array[${e}]`);
	}
	return n.join(" | ");
}
function Xe(e, t, n) {
	return typeof t.title == "string" ? t.title : Ge(e.$ref) ?? Ye(t, n);
}
function Ze(e, t, n) {
	let r = G(e.discriminator), i = r?.propertyName;
	if (typeof i != "string" || i === "") return null;
	let a = G(r?.mapping);
	if (typeof t.$ref == "string") {
		let e = Object.entries(a ?? {}).find(([, e]) => e === t.$ref);
		if (e !== void 0) return {
			property: i,
			value: e[0]
		};
	}
	let o = G(G(n.properties)?.[i]), s = typeof o?.const == "string" ? o.const : Array.isArray(o?.enum) && o.enum.length === 1 && typeof o.enum[0] == "string" ? o.enum[0] : null;
	if (s !== null) return {
		property: i,
		value: s
	};
	let c = Ge(t.$ref);
	return c === null ? null : {
		property: i,
		value: c
	};
}
function Qe(e) {
	return JSON.stringify(e) ?? String(e);
}
function $e(e) {
	let t = [];
	typeof e.format == "string" && t.push(`format: ${e.format}`), "const" in e ? t.push(`const: ${Qe(e.const)}`) : Array.isArray(e.enum) && t.push(`enum: ${Qe(e.enum)}`), e.default !== void 0 && t.push(`default: ${Qe(e.default)}`), e.examples !== void 0 && t.push(`examples: ${Qe(e.examples)}`);
	for (let [n, r] of Object.entries(e)) it.includes(n) && t.push(`${n}: ${Qe(r)}`);
	return e.deprecated === !0 && t.push("deprecated"), e.readOnly === !0 && t.push("readOnly"), e.writeOnly === !0 && t.push("writeOnly"), t;
}
function et(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function tt(e, t, n, r, i, a) {
	let o = G(e) ?? {}, s = /* @__PURE__ */ new Set(), c = K(o, i, s), l = [...s].some((e) => a.has(e));
	return {
		id: n,
		name: t,
		typeLabel: Ye(c, i),
		required: r,
		description: typeof c.description == "string" ? c.description : null,
		details: $e(c),
		children: l ? [] : nt(c, n, i, s.size > 0 ? /* @__PURE__ */ new Set([...a, ...s]) : a),
		isRecursive: l
	};
}
function nt(e, t, n, r) {
	let i = [], a = new Set(Array.isArray(e.required) ? e.required : []), o = G(e.properties);
	for (let [e, s] of Object.entries(o ?? {})) i.push(tt(s, e, `${t}/properties/${et(e)}`, a.has(e), n, r));
	let s = G(e.additionalProperties);
	s && i.push(tt(s, "additionalProperties", `${t}/additionalProperties`, !1, n, r));
	let c = G(e.items);
	if (c) {
		let e = /* @__PURE__ */ new Set(), a = K(c, n, e);
		if ([...e].some((e) => r.has(e))) i.push(tt(c, null, `${t}/items`, !1, n, r));
		else {
			let o = e.size > 0 ? /* @__PURE__ */ new Set([...r, ...e]) : r;
			i.push(...nt(a, `${t}/items`, n, o));
		}
	}
	for (let a of ["oneOf", "anyOf"]) {
		let o = e[a];
		Array.isArray(o) && o.forEach((o, s) => {
			let c = G(o) ?? {}, l = tt(o, null, `${t}/${a}/${s}`, !1, n, r), u = K(c, n, /* @__PURE__ */ new Set()), d = Ze(e, c, u);
			l.typeLabel = Xe(c, u, n), d !== null && (l.name = d.value, l.details.unshift(`discriminator: ${d.property}=${Qe(d.value)}`)), i.push(l);
		});
	}
	return i;
}
function rt(e, t) {
	let n = G(e);
	if (n === null) return [];
	let r = G(t), i = /* @__PURE__ */ new Set();
	return nt(K(n, r, i), "#", r, i);
}
var it, at = f((() => {
	it = [
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
function ot({ row: e, depth: t, expandDepth: n }) {
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
			r && !e.isRecursive ? e.children.map((e) => /* @__PURE__ */ o(ot, {
				row: e,
				depth: t + 1,
				expandDepth: n
			}, e.id)) : null
		]
	});
}
function st({ schema: e, components: t, expandDepth: r = 2 }) {
	let i = n(() => rt(e, t), [e, t]);
	return /* @__PURE__ */ o("div", {
		className: "text-base",
		children: i.map((e) => /* @__PURE__ */ o(ot, {
			row: e,
			depth: 0,
			expandDepth: r
		}, e.id))
	});
}
var ct = f((() => {
	at(), v();
}));
//#endregion
//#region resources/js/api-reference/access-token.ts
function lt(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	return async ({ scopes: r, forceRefresh: i }) => {
		let a = [...r].sort().join(" ");
		if (i) t.delete(a);
		else {
			let e = t.get(a);
			if (e && e.expiresAt > Date.now() + ut) return e.accessToken;
			let r = n.get(a);
			if (r) return r;
		}
		let o = e({
			scopes: [...r],
			forceRefresh: i
		}).then((e) => typeof e == "string" ? e : (e.expiresIn !== void 0 && t.set(a, {
			accessToken: e.accessToken,
			expiresAt: Date.now() + Math.max(0, e.expiresIn) * 1e3
		}), e.accessToken)).finally(() => n.delete(a));
		return n.set(a, o), o;
	};
}
var ut, dt = f((() => {
	ut = 3e4;
}));
//#endregion
//#region resources/js/api-reference/execute-request.ts
async function ft(e, t) {
	let n = Date.now();
	try {
		let r = await fetch(e.url, {
			method: e.method,
			headers: e.headers,
			body: e.body,
			signal: t
		}), i = pt(await r.text());
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
		if (S(e)) throw e;
		return {
			kind: "error",
			message: "Request failed. Check the browser console and CORS configuration."
		};
	}
}
function pt(e) {
	try {
		return JSON.stringify(JSON.parse(e), null, 2);
	} catch {
		return e;
	}
}
var mt = f((() => {
	w();
}));
//#endregion
//#region resources/js/api-reference/LiveResponsePanel.tsx
function ht({ result: e }) {
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
						color: gt(e.status),
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
function gt(e) {
	return {
		2: "success",
		3: "info",
		4: "warning",
		5: "danger"
	}[String(e)[0]] ?? "default";
}
var _t = f((() => {
	v();
}));
//#endregion
//#region resources/js/api-reference/request-state.ts
function q(e) {
	return `${e.location}:${e.name}`;
}
function vt(e) {
	if (e === null) return !1;
	let t = e.split(";", 1)[0].trim().toLowerCase();
	return t === "application/json" || t.endsWith("+json");
}
function yt(e) {
	return e.requests.filter((e) => vt(e.mediaType));
}
function bt(e, t) {
	let n = Object.fromEntries(e.paramGroups.flatMap((e) => e.params.map((e) => [q(e), xt(e)]))), r = yt(e)[0];
	return r === void 0 ? {
		parameters: n,
		mediaType: null,
		body: ""
	} : {
		parameters: n,
		mediaType: r.mediaType,
		body: ee(re(r, t))
	};
}
function xt(e) {
	let t = St(e.example);
	if (t !== null) return t;
	if (!x(e.schema)) return "";
	for (let t of ["example", "default"]) {
		let n = St(e.schema[t]);
		if (n !== null) return n;
	}
	return e.required && Array.isArray(e.schema.enum) ? Ct(e.schema.enum[0]) ?? "" : "";
}
function St(e) {
	if (!Array.isArray(e)) return Ct(e);
	let t = e.map(Ct);
	return t.every((e) => e !== null) ? t.join(",") : null;
}
function Ct(e) {
	return typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : null;
}
var wt = f((() => {
	I(), w();
}));
//#endregion
//#region resources/js/api-reference/request-builder.ts
function Tt(e) {
	let t = {
		parameters: {},
		body: null,
		request: e.baseUrl === null ? "Select a server URL before sending the request." : null
	}, n = e.operation.paramGroups.flatMap((e) => e.params);
	At(n, e.values, t);
	let r = Lt(e.operation, e.values, t);
	if (Yt(t) || e.baseUrl === null) return {
		request: null,
		errors: t
	};
	let i = Rt(n, e.values), a = e.values.body.trim() === "" ? null : e.values.body;
	return Object.keys(i).some((e) => e.toLowerCase() === "accept") || (i.Accept = "application/json"), a !== null && r !== null && r.mediaType !== null && Jt(i, "Content-Type", r.mediaType), e.token !== null && e.token !== "" && Dt(e.operation) && Jt(i, "Authorization", `Bearer ${e.token}`), {
		request: {
			method: e.operation.summary.method,
			url: zt(e.baseUrl, e.operation.summary.path, n, e.values),
			headers: i,
			body: a
		},
		errors: null
	};
}
function Et(e) {
	return e.type === "oauth2" || e.type === "http" && e.scheme?.toLowerCase() === "bearer";
}
function Dt(e) {
	return e.security.some((e) => e.schemes.some(Et));
}
function Ot(e) {
	let t = e.security.find((e) => e.schemes.some(Et));
	if (t === void 0) return null;
	let n = t.schemes.filter(Et).flatMap((e) => e.scopes);
	return [...new Set(n)].sort();
}
function kt(e) {
	let t = Object.fromEntries(Object.entries(e.headers).map(([e, t]) => [e, e.toLowerCase() === "authorization" && /^Bearer(?:\s|$)/i.test(t) ? "Bearer <YOUR_TOKEN>" : t]));
	return {
		...e,
		headers: t
	};
}
function At(e, t, n) {
	for (let r of e) {
		let e = q(r), i = t.parameters[e] ?? "", a = It(r, i);
		if (a !== null) {
			(r.required || i !== "") && (n.parameters[e] = a);
			continue;
		}
		if (r.required && i === "") {
			n.parameters[e] = `This ${r.location} parameter is required.`;
			continue;
		}
		let o = jt(r, i);
		o !== null && (n.parameters[e] = o);
	}
}
function jt(e, t) {
	return t === "" || !x(e.schema) ? null : e.schema.type === "array" ? Mt(e.schema, t) : Nt(e.schema, t);
}
function Mt(e, t) {
	if (!x(e.items)) return null;
	let n = Kt(t), r = J(e.minItems), i = J(e.maxItems);
	if (r !== null && i === r && n.length !== r) return `Enter exactly ${r} values.`;
	if (r !== null && n.length < r) return `Enter at least ${r} values.`;
	if (i !== null && n.length > i) return `Enter no more than ${i} values.`;
	for (let [t, r] of n.entries()) {
		if (r === "") return `Value ${t + 1} is required.`;
		let n = Nt(e.items, r);
		if (n !== null) return `Value ${t + 1}: ${n}`;
	}
	return null;
}
function Nt(e, t) {
	return Array.isArray(e.enum) && !e.enum.some((e) => [
		"string",
		"number",
		"boolean"
	].includes(typeof e) && String(e) === t) ? "Select an available value." : e.type === "boolean" && t !== "true" && t !== "false" ? "Select true or false." : e.type === "number" || e.type === "integer" ? Pt(e, t) : e.type === "string" ? Ft(e, t) : null;
}
function Pt(e, t) {
	let n = Number(t);
	if (!Number.isFinite(n)) return "Enter a number.";
	if (e.type === "integer" && !Number.isInteger(n)) return "Enter an integer.";
	let r = J(e.minimum), i = e.exclusiveMinimum === !0 ? r : J(e.exclusiveMinimum);
	if (i !== null && n <= i) return `Enter a value greater than ${i}.`;
	if (r !== null && n < r) return `Enter a value greater than or equal to ${r}.`;
	let a = J(e.maximum), o = e.exclusiveMaximum === !0 ? a : J(e.exclusiveMaximum);
	if (o !== null && n >= o) return `Enter a value less than ${o}.`;
	if (a !== null && n > a) return `Enter a value less than or equal to ${a}.`;
	let s = J(e.multipleOf);
	if (s !== null && s > 0) {
		let e = n / s;
		if (Math.abs(e - Math.round(e)) > 1e-9) return `Enter a multiple of ${s}.`;
	}
	return null;
}
function Ft(e, t) {
	if (e.format === "date") try {
		(0, g.parseDate)(t);
	} catch {
		return "Enter a valid date.";
	}
	if (e.format === "date-time" && (0, g.toDate)(t) === null) return "Enter a valid date and time.";
	let n = [...t].length, r = J(e.minLength);
	if (r !== null && n < r) return `Enter at least ${r} characters.`;
	let i = J(e.maxLength);
	if (i !== null && n > i) return `Enter no more than ${i} characters.`;
	if (typeof e.pattern == "string") try {
		if (!new RegExp(e.pattern).test(t)) return "Match the required pattern.";
	} catch {
		return null;
	}
	return null;
}
function J(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function It(e, t) {
	return !Ut(e) && !Gt(e) ? "Only primitive parameters can be executed." : e.location === "cookie" ? "Cookie parameters cannot be sent from a browser." : e.location === "header" && Vt(e.name) || e.location === "header" && Ht(e.name, t) ? "This header cannot be sent from a browser." : null;
}
function Lt(e, t, n) {
	if (t.mediaType === null) return e.requests.find((e) => e.required && vt(e.mediaType)) !== void 0 && (n.body = "A JSON request body is required."), null;
	let r = e.requests.find((e) => e.mediaType === t.mediaType);
	if (r === void 0 || !vt(r.mediaType)) return n.request = "The selected JSON media type is not available for this operation.", null;
	if (t.body.trim() === "") return r.required && (n.body = "A JSON request body is required."), r;
	try {
		JSON.parse(t.body);
	} catch {
		n.body = "Enter a valid JSON request body.";
	}
	return r;
}
function Rt(e, t) {
	return Object.fromEntries(e.filter((e) => e.location === "header").map((e) => [e.name, t.parameters[q(e)] ?? ""]).filter((e) => e[1] !== ""));
}
function zt(e, t, n, r) {
	let i = t, a = [];
	for (let e of n) {
		let t = r.parameters[q(e)] ?? "";
		e.location === "path" && (i = i.split(`{${e.name}}`).join(encodeURIComponent(t))), e.location === "query" && t !== "" && a.push(`${encodeURIComponent(e.name)}=${encodeURIComponent(qt(e, t))}`);
	}
	let o = e.split("#", 1)[0], s = o.indexOf("?"), c = s === -1 ? o : o.slice(0, s), l = s === -1 ? "" : o.slice(s + 1), u = Bt(c, i), d = [l, ...a].filter((e) => e !== "");
	return d.length === 0 ? u : `${u}?${d.join("&")}`;
}
function Bt(e, t) {
	return `${(e ?? "").split("#", 1)[0].split("?", 1)[0].replace(/\/+$/, "")}/${t.replace(/^\/+/, "")}`;
}
function Vt(e) {
	let t = e.toLowerCase();
	return Xt.has(t) || t.startsWith("proxy-") || t.startsWith("sec-");
}
function Ht(e, t) {
	if (t === void 0) return !1;
	let n = e.toLowerCase();
	return Zt.has(n) && t.split(",").some((e) => Qt.has(e.trim().toUpperCase()));
}
function Ut(e) {
	return Wt(e.schema);
}
function Wt(e) {
	return !x(e) || "$ref" in e || "oneOf" in e || "allOf" in e || "anyOf" in e ? !1 : typeof e.type == "string" && [
		"string",
		"number",
		"integer",
		"boolean"
	].includes(e.type);
}
function Gt(e) {
	return e.location !== "query" || e.style !== void 0 && e.style !== null && e.style !== "form" || e.explode !== !1 || !x(e.schema) || e.schema.type !== "array" ? !1 : Wt(e.schema.items);
}
function Kt(e) {
	return e.split(",").map((e) => e.trim());
}
function qt(e, t) {
	return Gt(e) ? Kt(t).join(",") : t;
}
function Jt(e, t, n) {
	for (let n of Object.keys(e)) n.toLowerCase() === t.toLowerCase() && delete e[n];
	e[t] = n;
}
function Yt(e) {
	return Object.keys(e.parameters).length > 0 || e.body !== null || e.request !== null;
}
var Xt, Zt, Qt, $t = f((() => {
	wt(), w(), v(), Xt = /* @__PURE__ */ new Set([
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
	]), Zt = /* @__PURE__ */ new Set([
		"x-http-method",
		"x-http-method-override",
		"x-method-override"
	]), Qt = /* @__PURE__ */ new Set([
		"CONNECT",
		"TRACE",
		"TRACK"
	]);
}));
//#endregion
//#region resources/js/api-reference/OperationHeader.tsx
function en({ operation: e, baseUrl: t, hideIdentity: n = !1 }) {
	if (n) return /* @__PURE__ */ o(tn, { operation: e });
	let r = Bt(t, e.summary.path);
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
			/* @__PURE__ */ o(tn, {
				operation: e,
				className: "mt-1"
			})
		]
	});
}
function tn({ operation: e, className: t = "" }) {
	return !e.description && !e.tooltip ? null : /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ s("p", {
		className: `${t} whitespace-pre-line text-lt-muted-fg`,
		children: [e.description, /* @__PURE__ */ o(g.InfoTooltip, { content: e.tooltip })]
	}), /* @__PURE__ */ o("hr", { className: "my-8 border-lt-border" })] });
}
var nn = f((() => {
	v(), b(), $t();
}));
//#endregion
//#region resources/js/api-reference/RequestBodyEditor.tsx
function rn({ idPrefix: e, schema: t, components: r, value: i, required: a, error: c, onChange: l }) {
	let u = n(() => Y(t, r, /* @__PURE__ */ new Set()), [r, t]), d = Sn(i);
	if (u == null || !["object", "oneOf"].includes(u.kind) || !x(d)) return /* @__PURE__ */ o(g.FormFieldFrame, {
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
		l(ee(yn(f, e, t)));
	}
	return /* @__PURE__ */ s("fieldset", {
		"aria-label": "JSON body fields",
		className: "@container flex min-w-0 flex-col gap-3",
		children: [c ? /* @__PURE__ */ o("p", {
			className: "text-sm text-lt-danger",
			children: c
		}) : null, u.kind === "object" ? /* @__PURE__ */ o(an, {
			schema: u,
			path: [],
			value: f,
			onChange: p
		}) : /* @__PURE__ */ o(on, {
			schema: u,
			path: [],
			required: a,
			value: f,
			onChange: p
		})]
	});
}
function an({ schema: e, path: t, value: n, onChange: r }) {
	return /* @__PURE__ */ o("div", {
		className: "grid min-w-0 grid-cols-1 gap-4 @xl:grid-cols-2",
		children: e.properties.map((e) => /* @__PURE__ */ o(on, {
			schema: e.schema,
			path: [...t, e.name],
			required: e.required,
			value: x(n) ? n[e.name] : void 0,
			onChange: r
		}, e.name))
	});
}
function on({ schema: e, path: n, required: r, value: i, onChange: a }) {
	let c = `body-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;
	if (e.kind === "oneOf") return /* @__PURE__ */ o(sn, {
		id: c,
		schema: e,
		path: n,
		required: r,
		value: i,
		onChange: a
	});
	if (e.kind === "object") return /* @__PURE__ */ s("fieldset", {
		className: "min-w-0 rounded-lt-sm border border-lt-border p-3 @xl:col-span-2",
		children: [
			/* @__PURE__ */ s("legend", {
				className: "px-1 text-xs font-semibold text-lt-muted-fg",
				children: [
					X(n),
					r ? /* @__PURE__ */ o("span", {
						className: "text-lt-danger",
						children: " *"
					}) : null,
					/* @__PURE__ */ o(g.InfoTooltip, { content: e.tooltip })
				]
			}),
			e.description ? /* @__PURE__ */ o("p", {
				className: "mb-3 text-xs text-lt-muted-fg",
				children: e.description
			}) : null,
			/* @__PURE__ */ o(an, {
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
					children: [
						X(n),
						r ? /* @__PURE__ */ o("span", {
							className: "text-lt-danger",
							children: " *"
						}) : null,
						/* @__PURE__ */ o(g.InfoTooltip, { content: e.tooltip })
					]
				}),
				e.description ? /* @__PURE__ */ o("p", {
					className: "text-xs text-lt-muted-fg",
					children: e.description
				}) : null,
				t.map((r, i) => /* @__PURE__ */ s("div", {
					className: "flex min-w-0 items-start gap-3",
					children: [/* @__PURE__ */ o("div", {
						className: "min-w-0 flex-1",
						children: /* @__PURE__ */ o(on, {
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
						"aria-label": `Remove ${X([...n, i])}`,
						onClick: () => a(n, t.filter((e, t) => t !== i)),
						children: "Remove"
					})]
				}, i)),
				/* @__PURE__ */ o(g.Button, {
					type: "button",
					emphasis: "outline",
					size: "sm",
					className: "self-start",
					"aria-label": `Add ${X(n)} item`,
					onClick: () => a(n, [...t, vn(e.items)]),
					children: "Add item"
				})
			]
		});
	}
	if (e.kind === "json") return /* @__PURE__ */ o(cn, {
		schema: e,
		path: n,
		required: r,
		value: i,
		onChange: a
	});
	let l = X(n);
	return /* @__PURE__ */ o(g.FormFieldFrame, {
		id: c,
		label: l,
		required: r,
		helperText: e.description ?? void 0,
		tooltip: e.tooltip ?? void 0,
		className: "min-w-0",
		children: (t) => e.enumValues.length > 0 ? /* @__PURE__ */ s(g.NativeSelect, {
			...t,
			value: Dn(i),
			required: r,
			"data-field-key": `body:${l}`,
			onChange: (t) => {
				let i = e.enumValues.find((e) => Dn(e) === t.target.value);
				a(n, t.target.value === "" && !r ? void 0 : i);
			},
			children: [r ? null : /* @__PURE__ */ o("option", {
				value: "",
				children: "Not set"
			}), e.enumValues.map((e) => /* @__PURE__ */ o("option", {
				value: Dn(e),
				children: String(e)
			}, Dn(e)))]
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
			type: Tn(e),
			value: typeof i == "string" || typeof i == "number" ? i : "",
			required: r,
			min: e.minimum ?? void 0,
			max: e.maximum ?? void 0,
			step: En(e),
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
function sn({ id: e, schema: t, path: n, required: r, value: i, onChange: a }) {
	let c = X(n) || "JSON body", l = x(i) ? i[t.discriminator] : null, u = typeof l == "string" ? t.variants.find((e) => e.value === l) ?? null : null;
	return /* @__PURE__ */ s("fieldset", {
		className: "flex min-w-0 flex-col gap-3 rounded-lt-sm border border-lt-border p-3 @xl:col-span-2",
		children: [
			/* @__PURE__ */ s("legend", {
				className: "px-1 text-xs font-semibold text-lt-muted-fg",
				children: [
					c,
					r ? /* @__PURE__ */ o("span", {
						className: "text-lt-danger",
						children: " *"
					}) : null,
					/* @__PURE__ */ o(g.InfoTooltip, { content: t.tooltip })
				]
			}),
			t.description ? /* @__PURE__ */ o("p", {
				className: "text-xs text-lt-muted-fg",
				children: t.description
			}) : null,
			/* @__PURE__ */ o(g.FormFieldFrame, {
				id: `${e}-variant`,
				label: `${c} variant`,
				required: r,
				children: (e) => /* @__PURE__ */ s(g.NativeSelect, {
					...e,
					value: u?.value ?? "",
					required: r,
					"data-field-key": `body:${c}:variant`,
					onChange: (e) => {
						let r = t.variants.find((t) => t.value === e.target.value);
						if (r === void 0) {
							a(n, void 0);
							return;
						}
						let i = vn(r.schema);
						a(n, {
							...x(i) ? i : {},
							[t.discriminator]: r.value
						});
					},
					children: [r ? null : /* @__PURE__ */ o("option", {
						value: "",
						children: "Not set"
					}), t.variants.map((e) => /* @__PURE__ */ o("option", {
						value: e.value,
						children: e.label
					}, e.value))]
				})
			}),
			u === null ? null : /* @__PURE__ */ o(an, {
				schema: u.schema,
				path: n,
				value: i,
				onChange: a
			})
		]
	});
}
function cn({ schema: e, path: n, required: r, value: a, onChange: s }) {
	let c = `body-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`, l = X(n), u = ee(a), [d, f] = i(u), [p, m] = i(u);
	return d !== u && (f(u), m(u)), /* @__PURE__ */ o(g.FormFieldFrame, {
		id: c,
		label: l,
		required: r,
		helperText: e.description ?? void 0,
		tooltip: e.tooltip ?? void 0,
		error: ln(p).valid ? void 0 : "Enter valid JSON.",
		className: "min-w-0 @xl:col-span-2",
		children: (e) => /* @__PURE__ */ o(g.Textarea, {
			...e,
			value: p,
			required: r,
			"data-field-key": `body:${l}`,
			className: "min-h-24 font-mono",
			onChange: (e) => {
				m(e.target.value);
				let t = ln(e.target.value);
				t.valid && (f(ee(t.value)), s(n, t.value));
			}
		})
	});
}
function ln(e) {
	if (e.trim() === "") return {
		valid: !0,
		value: void 0
	};
	try {
		return {
			valid: !0,
			value: JSON.parse(e)
		};
	} catch {
		return {
			valid: !1,
			value: void 0
		};
	}
}
function Y(e, t, n) {
	if (!x(e)) return null;
	if (typeof e.$ref == "string") {
		if (!e.$ref.startsWith("#/components/schemas/") || n.has(e.$ref)) return null;
		let r = Cn(e.$ref, t);
		if (r === null) return null;
		let i = Y(r, t, /* @__PURE__ */ new Set([...n, e.$ref]));
		return i === null ? null : {
			...i,
			description: Z(e.description) ?? i.description,
			tooltip: Q(e) ?? i.tooltip,
			initialValue: T(e, t)
		};
	}
	let r = mn(e);
	if (r !== null) {
		let i = Y(r, t, n);
		return i === null ? null : {
			...i,
			description: Z(e.description) ?? i.description,
			tooltip: Q(e) ?? i.tooltip,
			initialValue: T(e, t)
		};
	}
	let i = dn(e, t, n);
	if (i !== null) return i;
	if ("oneOf" in e || "anyOf" in e) return null;
	if (Array.isArray(e.allOf)) {
		let r = e.allOf.map((e) => Y(e, t, n)), i = un(e, t, n);
		return r.some((e) => e?.kind !== "object") || i === null ? null : _n([...r, i], e, t);
	}
	let a = wn(e);
	if (a === "object" || x(e.properties)) return un(e, t, n);
	if (a === "array") {
		let r = Y(e.items, t, n);
		return r === null ? null : {
			kind: "array",
			description: Z(e.description),
			tooltip: Q(e),
			initialValue: T(e, t),
			items: r
		};
	}
	if (!On(a)) return null;
	let o = Array.isArray(e.enum) && e.enum.every(kn) ? e.enum : [];
	return Array.isArray(e.enum) && o.length !== e.enum.length ? null : {
		kind: a,
		description: Z(e.description),
		tooltip: Q(e),
		initialValue: T(e, t),
		enumValues: o,
		format: Z(e.format),
		minimum: An(e.minimum),
		maximum: An(e.maximum),
		multipleOf: An(e.multipleOf),
		minLength: An(e.minLength),
		maxLength: An(e.maxLength),
		pattern: Z(e.pattern)
	};
}
function un(e, t, n) {
	if (e.additionalProperties === !0 || x(e.additionalProperties)) return null;
	let r = x(e.properties) ? e.properties : {}, i = new Set(Array.isArray(e.required) ? e.required.filter((e) => typeof e == "string") : []), a = [];
	for (let [e, o] of Object.entries(r)) {
		if (x(o) && o.readOnly === !0) continue;
		let r = Y(o, t, n) ?? pn(o, t);
		a.push({
			name: e,
			required: i.has(e) && !gn(o),
			schema: r
		});
	}
	return {
		kind: "object",
		description: Z(e.description),
		tooltip: Q(e),
		initialValue: T(e, t),
		properties: a
	};
}
function dn(e, t, n) {
	if (!Array.isArray(e.oneOf) || !x(e.discriminator)) return null;
	let r = Z(e.discriminator.propertyName);
	if (r === null || r === "") return null;
	let i = x(e.discriminator.mapping) ? e.discriminator.mapping : {}, a = [];
	for (let o of e.oneOf) {
		let e = Y(o, t, new Set(n));
		if (e?.kind !== "object") return null;
		let s = fn(o, e, r, i);
		if (s === null || a.some((e) => e.value === s)) return null;
		a.push({
			label: s,
			value: s,
			schema: {
				...e,
				initialValue: T(o, t),
				properties: e.properties.filter((e) => e.name !== r)
			}
		});
	}
	return a.length < 2 ? null : {
		kind: "oneOf",
		description: Z(e.description),
		tooltip: Q(e),
		initialValue: T(e, t),
		discriminator: r,
		variants: a
	};
}
function fn(e, t, n, r) {
	if (x(e) && typeof e.$ref == "string") {
		let t = Object.entries(r).find(([, t]) => t === e.$ref);
		if (t !== void 0) return t[0];
	}
	let i = t.properties.find((e) => e.name === n);
	return i?.schema.kind !== "string" || i.schema.enumValues.length !== 1 || typeof i.schema.enumValues[0] != "string" ? x(e) && typeof e.$ref == "string" ? e.$ref.split("/").pop() ?? null : null : i.schema.enumValues[0];
}
function pn(e, t) {
	return {
		kind: "json",
		description: x(e) ? Z(e.description) : null,
		tooltip: x(e) ? Q(e) : null,
		initialValue: T(e, t)
	};
}
function mn(e) {
	let t = Array.isArray(e.oneOf) ? e.oneOf : e.anyOf;
	if (!Array.isArray(t)) return null;
	let n = t.filter((e) => !hn(e));
	return n.length === 1 && n.length < t.length ? n[0] : null;
}
function hn(e) {
	return x(e) && e.type === "null";
}
function gn(e) {
	return x(e) && mn(e) !== null;
}
function _n(e, t, n) {
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
		description: Z(t.description) ?? e.find((e) => e.description)?.description ?? null,
		tooltip: Q(t) ?? e.find((e) => e.tooltip)?.tooltip ?? null,
		initialValue: T(t, n),
		properties: [...r.values()]
	};
}
function vn(e) {
	if (e.initialValue !== null && e.initialValue !== void 0) return structuredClone(e.initialValue);
	switch (e.kind) {
		case "object": return {};
		case "array": return [];
		case "oneOf": return e.initialValue === null || e.initialValue === void 0 ? {} : structuredClone(e.initialValue);
		case "json": return null;
		case "boolean": return !1;
		case "number":
		case "integer": return 0;
		case "string": return "";
	}
}
function yn(e, t, n) {
	let r = structuredClone(e), i = r;
	for (let e = 0; e < t.length - 1; e += 1) {
		let n = t[e], r = t[e + 1], a = bn(i, n);
		!x(a) && !Array.isArray(a) && xn(i, n, typeof r == "number" ? [] : {}), i = bn(i, n);
	}
	let a = t[t.length - 1];
	return a === void 0 ? x(n) ? n : r : (n === void 0 ? Array.isArray(i) && typeof a == "number" ? i.splice(a, 1) : Array.isArray(i) || delete i[String(a)] : xn(i, a, n), r);
}
function bn(e, t) {
	return Array.isArray(e) ? typeof t == "number" ? e[t] : void 0 : e[String(t)];
}
function xn(e, t, n) {
	if (Array.isArray(e)) {
		typeof t == "number" && (e[t] = n);
		return;
	}
	e[String(t)] = n;
}
function Sn(e) {
	try {
		return e.trim() === "" ? {} : JSON.parse(e);
	} catch {
		return null;
	}
}
function X(e) {
	return e.reduce((e, t) => typeof t == "number" ? `${e}[${t}]` : e === "" ? t : `${e}.${t}`, "");
}
function Cn(e, t) {
	if (!x(t) || !x(t.schemas)) return null;
	let n = e.slice(21);
	return n in t.schemas ? t.schemas[n] : null;
}
function wn(e) {
	return Array.isArray(e.type) ? e.type.find((e) => e !== "null") : e.type;
}
function Tn(e) {
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
function En(e) {
	return e.multipleOf === null ? e.kind === "integer" ? 1 : e.kind === "number" ? "any" : void 0 : e.multipleOf;
}
function Dn(e) {
	return kn(e) ? `${typeof e}:${String(e)}` : "";
}
function On(e) {
	return typeof e == "string" && [
		"string",
		"number",
		"integer",
		"boolean"
	].includes(e);
}
function kn(e) {
	return typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
function Z(e) {
	return typeof e == "string" ? e : null;
}
function Q(e) {
	return Z(e["x-tooltip"]);
}
function An(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
var jn = f((() => {
	v(), I(), w();
}));
//#endregion
//#region resources/js/api-reference/SnippetPanel.tsx
function Mn({ idPrefix: e, language: t, snippet: n, onLanguageChange: r }) {
	return /* @__PURE__ */ s("section", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ o(g.SegmentedPills, {
			name: `${e}-request-snippet-language`,
			ariaLabel: "Snippet language",
			options: Nn,
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
var Nn, Pn = f((() => {
	v(), Nn = [{
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
function Fn(e) {
	return `'${e.replaceAll("'", "'\"'\"'")}'`;
}
var In, Ln = f((() => {
	In = {
		id: "curl",
		label: "cURL",
		generate(e) {
			let t = [
				`--request ${Fn(e.method)}`,
				`--url ${Fn(e.url)}`,
				...Object.entries(e.headers).map(([e, t]) => `--header ${Fn(`${e}: ${t}`)}`)
			];
			return e.body !== null && t.push(`--data ${Fn(e.body)}`), t.length === 2 ? `curl ${t.join(" ")}` : t.map((e, n) => `${n === 0 ? "curl " : "  "}${e}${n === t.length - 1 ? "" : " \\"}`).join("\n");
		}
	};
})), Rn, zn = f((() => {
	Rn = {
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
function Bn({ param: e, control: t }) {
	let n = R(e.schema), r = t ? "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,3fr)_minmax(12rem,2fr)] sm:items-start" : "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-2", i = !!e.description || n.length > 0;
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
					}) : null,
					/* @__PURE__ */ o(g.InfoTooltip, { content: e.tooltip })
				]
			}),
			/* @__PURE__ */ o("span", {
				className: "col-start-2 row-start-1 justify-self-end rounded-lt-xs bg-lt-muted px-2 py-1 text-xs text-lt-muted-fg",
				children: L(e.schema)
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
function Vn({ group: e, idPrefix: t, values: n, errors: r, onChange: i }) {
	let a = e.location === "path" || e.location === "query";
	return /* @__PURE__ */ s("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ s("h3", {
			className: "mb-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: [e.location, " parameters"]
		}), /* @__PURE__ */ o("ul", { children: e.params.map((s) => /* @__PURE__ */ o(Bn, {
			param: s,
			control: a && pr(e.location, s) ? /* @__PURE__ */ o(sr, {
				inline: !0,
				idPrefix: t,
				param: s,
				value: n.parameters[q(s)] ?? "",
				error: r[q(s)] ?? null,
				onChange: (e) => i(s, e)
			}) : void 0
		}, `${s.location}-${s.name}`)) })]
	});
}
function Hn(e) {
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
function Un({ group: e, idPrefix: t, values: n, errors: r, onChange: i }) {
	return /* @__PURE__ */ s("fieldset", {
		className: "mb-4 rounded-lt-sm border border-lt-border p-3",
		children: [/* @__PURE__ */ o("legend", {
			className: "px-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: e.label
		}), /* @__PURE__ */ o("div", {
			className: "flex flex-wrap items-start gap-4",
			children: e.params.map((e) => /* @__PURE__ */ o(sr, {
				idPrefix: t,
				param: e,
				value: n.parameters[q(e)] ?? "",
				error: r[q(e)] ?? null,
				onChange: (t) => i(e, t)
			}, q(e)))
		})]
	});
}
function Wn(e) {
	let t = e.paramGroups.flatMap((e) => e.params), n = t.find((e) => e.location === "header" && e.name.toLowerCase() === "x-pagination") ?? null, r = (e) => t.find((t) => t.location === "query" && t.name === e) ?? null, i = r("page"), a = r("cursor"), o = r("per_page");
	return o === null || i === null && a === null ? null : {
		mode: n,
		page: i,
		cursor: a,
		perPage: o
	};
}
function Gn({ parameters: e, idPrefix: t, values: n, errors: r, onModeChange: i, onChange: a }) {
	let c = (e.mode === null ? e.page === null : n.parameters[q(e.mode)] === "cursor") ? [e.cursor, e.perPage] : [e.page, e.perPage];
	return /* @__PURE__ */ s("fieldset", {
		className: "mb-4 rounded-lt-sm border border-lt-border p-3",
		children: [/* @__PURE__ */ o("legend", {
			className: "px-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: "Pagination"
		}), /* @__PURE__ */ s("div", {
			className: "flex flex-col gap-3",
			children: [e.mode === null ? null : /* @__PURE__ */ o("div", {
				className: "flex flex-wrap items-start gap-4",
				children: /* @__PURE__ */ o(sr, {
					idPrefix: t,
					param: e.mode,
					value: n.parameters[q(e.mode)] ?? "",
					error: r[q(e.mode)] ?? null,
					onChange: i
				})
			}), /* @__PURE__ */ o("div", {
				className: "flex flex-wrap items-start gap-4",
				children: c.map((e) => e === null ? null : /* @__PURE__ */ o(sr, {
					idPrefix: t,
					param: e,
					value: n.parameters[q(e)] ?? "",
					error: r[q(e)] ?? null,
					onChange: (t) => a(e, t)
				}, q(e)))
			})]
		})]
	});
}
function Kn({ name: e, schema: t, examples: r, components: a, noSchemaMessage: c, expandDepth: l, exampleLabel: u, maxHeight: d = 2400, defaultTab: f = "schema", generateExample: p = !1 }) {
	let [m, h] = i(f), [_, v] = i(0), y = n(() => r.length > 0 || !p ? r : [{
		name: null,
		summary: null,
		description: null,
		value: te(t, a)
	}], [
		a,
		r,
		p,
		t
	]), b = p && r.length === 0;
	if (y.length === 0) return /* @__PURE__ */ o(st, {
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
			options: Tr.map(({ key: e, label: t }) => ({
				label: t,
				value: e,
				data: null
			})),
			value: m,
			onSelect: (e) => h(e)
		})
	}), m === "schema" ? t ? /* @__PURE__ */ o(st, {
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
function qn({ requests: e, components: t, expandDepth: n }) {
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
			}), e.schema || e.examples.length > 0 ? /* @__PURE__ */ o(Kn, {
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
function Jn({ responses: e, components: t, expandDepth: n }) {
	let [r, a] = i(null);
	if (e.length === 0) return null;
	let c = [...e].sort(Yn), l = c.find((e) => C(e) === r) ?? c[0], u = c.map(C);
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
				color: gt(l.status),
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
				}), /* @__PURE__ */ o("ul", { children: l.headers.map((e) => /* @__PURE__ */ o(Bn, { param: e }, e.name)) })]
			}) : null,
			l.schema || l.examples.length > 0 ? /* @__PURE__ */ o(Kn, {
				name: `response-${C(l)}-tab`,
				schema: l.schema,
				examples: l.examples,
				components: t,
				noSchemaMessage: "No response body.",
				expandDepth: n,
				exampleLabel: "Response example",
				maxHeight: 800,
				defaultTab: "example",
				generateExample: !0
			}, C(l)) : /* @__PURE__ */ o("p", {
				className: "text-lt-muted-fg",
				children: "No response body."
			})
		] }) : null
	] });
}
function Yn(e, t) {
	let n = e.status ?? "default", r = t.status ?? "default", i = Xn(n) - Xn(r);
	return i !== 0 || n === r ? i : n.localeCompare(r, void 0, { numeric: !0 });
}
function Xn(e) {
	return {
		2: 0,
		3: 1,
		4: 2,
		5: 3
	}[e[0]] ?? 4;
}
function Zn(e, t) {
	return t ? t.type === "http" && t.scheme === "bearer" ? t.bearerFormat ? `HTTP Bearer (${t.bearerFormat})` : "HTTP Bearer" : t.type === "http" && t.scheme === "basic" ? "HTTP Basic" : t.type === "apiKey" ? `API key (${t.in}: ${t.name})` : t.type === "oauth2" ? "OAuth 2.0" : t.type === "openIdConnect" ? "OpenID Connect" : e : e;
}
function Qn(e) {
	switch (e) {
		case "lazy": return "A scoped access token is fetched automatically when you execute a request. If that fails, sign in again.";
		case "static": return "Access token supplied by the host page.";
		case "none": return "No access token is configured for live requests.";
	}
}
function $n({ scheme: e, components: t, authMode: n }) {
	let r = (t?.securitySchemes ?? {})[e.name] ?? null, i = er(r);
	return /* @__PURE__ */ s("li", {
		className: "border-b border-lt-border py-2 last:border-b-0",
		children: [
			/* @__PURE__ */ o("span", {
				className: "text-lt-fg",
				children: Zn(e.name, r)
			}),
			r?.description ? /* @__PURE__ */ o("p", {
				className: "mt-0.5 text-xs text-lt-muted-fg",
				children: r.description
			}) : null,
			/* @__PURE__ */ o("p", {
				className: "mt-0.5 text-xs text-lt-muted-fg",
				children: Et(e) ? Qn(n) : "This authentication scheme is not supported for live requests."
			}),
			/* @__PURE__ */ o(tr, { flows: r?.flows }),
			e.scopes.length > 0 ? /* @__PURE__ */ o("ul", {
				className: "mt-1 flex flex-col gap-1",
				children: e.scopes.map((e) => /* @__PURE__ */ s("li", {
					className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs",
					children: [/* @__PURE__ */ o("code", {
						className: "rounded-lt-xs bg-lt-muted px-1.5 py-0.5 text-lt-muted-fg",
						children: e
					}), i[e] ? /* @__PURE__ */ o("span", {
						className: "text-lt-muted-fg",
						children: i[e]
					}) : null]
				}, e))
			}) : null
		]
	});
}
function er(e) {
	return Object.values(e?.flows ?? {}).reduce((e, t) => ({
		...e,
		...t.scopes
	}), {});
}
function tr({ flows: e }) {
	let t = Object.entries(e ?? {});
	return t.length === 0 ? null : /* @__PURE__ */ o("dl", {
		className: "mt-1 flex flex-col gap-0.5 text-xs text-lt-muted-fg",
		children: t.map(([e, t]) => /* @__PURE__ */ s("div", {
			className: "flex flex-wrap items-baseline gap-x-2",
			children: [/* @__PURE__ */ o("dt", {
				className: "font-medium",
				children: e
			}), Er.map(({ key: e, label: n }) => {
				let r = t[e];
				return typeof r == "string" && r !== "" ? /* @__PURE__ */ s("dd", {
					className: "min-w-0 break-all",
					children: [
						n,
						": ",
						/* @__PURE__ */ o("span", {
							className: "font-mono",
							children: r
						})
					]
				}, e) : null;
			})]
		}, e))
	});
}
function nr({ requirement: e, components: t, authMode: n }) {
	return e.schemes.length === 0 ? /* @__PURE__ */ o("p", {
		className: "text-lt-muted-fg",
		children: "Optional authentication"
	}) : /* @__PURE__ */ o("ul", { children: e.schemes.map((e) => /* @__PURE__ */ o($n, {
		scheme: e,
		components: t,
		authMode: n
	}, e.name)) });
}
function rr({ security: e, components: t, authMode: n }) {
	return e.length === 0 ? null : /* @__PURE__ */ s("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ o("h2", {
			className: "mb-2 font-semibold text-lt-fg",
			children: "Authorization"
		}), e.map((e, r) => /* @__PURE__ */ s("div", { children: [r > 0 ? /* @__PURE__ */ o("p", {
			className: "my-2 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: "OR"
		}) : null, /* @__PURE__ */ o(nr, {
			requirement: e,
			components: t,
			authMode: n
		})] }, r))]
	});
}
function ir(e, t) {
	if (e === null || t === null) return null;
	let n = t.join(" ");
	return e.find((e) => [...new Set(e.scopes)].sort().join(" ") === n) ?? null;
}
async function ar(e) {
	if (e instanceof g.ApiError) {
		try {
			let t = await e.response.clone().json();
			if (x(t) && typeof t.message == "string" && t.message !== "") return t.message;
		} catch {}
		return `Fetching an access token failed (HTTP ${e.response.status}). Sign in again and retry.`;
	}
	return e instanceof Error && e.message !== "" ? e.message : "Fetching an access token failed. Check your session and try again.";
}
function or({ operation: a, baseUrl: c, token: l, remoteTokens: u = null, resolveAccessToken: d = null, components: f, expandDepth: p = 2, twoColumnBreakpoint: m = "lg", hideHeaderIdentity: h = !1 }) {
	let _ = `${a.summary.id}-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`, v = r(null), y = r(null), [b, x] = i(() => fr(a, f)), [C, w] = i("curl"), [te, T] = i(!1), [ne, E] = i(null), D = Hn(a), O = Wn(a), k = /* @__PURE__ */ new Set([...D.flatMap((e) => e.params).map(q), ...O === null ? [] : [
		O.mode,
		O.page,
		O.cursor,
		O.perPage
	].filter((e) => e !== null).map(q)]), ie = a.paramGroups.map((e) => ({
		...e,
		params: e.params.filter((e) => !k.has(q(e)))
	})).filter((e) => e.params.length > 0), A = yt(a), j = A.find((e) => e.mediaType === b.mediaType) ?? null, M = n(() => Ot(a), [a]), N = n(() => ir(u, M), [u, M]), ae = r(d);
	e(() => {
		ae.current = d;
	});
	let [P] = i(() => lt((e) => {
		let t = ae.current;
		if (t === null) throw Error("No access token resolver is configured.");
		return t(e);
	})), F = n(() => d !== null && M !== null ? P : N === null ? null : async ({ forceRefresh: e }) => (e && (0, g.invalidateRemoteToken)(N), (await (0, g.remoteToken)(N)).accessToken), [
		d,
		M,
		P,
		N
	]), I = F === null ? l !== null && l !== "" ? "static" : "none" : "lazy", L = I === "lazy" ? Dr : l, R = n(() => Tt({
		operation: a,
		baseUrl: c,
		values: b,
		token: L
	}), [
		a,
		c,
		b,
		L
	]), z = dr(a), B = a.requests.length > 0 && A.length === 0, V = j?.required ?? !1, se = wr[m], ce = n(() => {
		if (R.request === null) return "";
		let e = kt(R.request);
		return C === "curl" ? In.generate(e) : Rn.generate(e);
	}, [R, C]), le = n(() => oe(a, f), [a, f]);
	e(() => () => {
		let e = y.current;
		y.current = null, e?.abort();
	}, []);
	function H(e, t) {
		let n = q(e);
		x((e) => ({
			...e,
			parameters: {
				...e.parameters,
				[n]: t
			}
		}));
	}
	function ue(e) {
		if (O === null || O.mode === null) return;
		let t = O.mode;
		x((n) => {
			let r = {
				...n.parameters,
				[q(t)]: e
			};
			return e === "cursor" && O.page !== null ? r[q(O.page)] = "" : O.cursor !== null && (r[q(O.cursor)] = ""), {
				...n,
				parameters: r
			};
		});
	}
	function de(e) {
		x((t) => ({
			...t,
			body: e
		}));
	}
	function fe(e) {
		let t = A.find((t) => t.mediaType === e);
		x((n) => ({
			...n,
			mediaType: e,
			body: t === void 0 ? "" : ee(re(t, f))
		}));
	}
	async function pe(e) {
		if (e.preventDefault(), B) return;
		let t = Tt({
			operation: a,
			baseUrl: c,
			values: b,
			token: L
		});
		if (t.errors !== null) {
			let e = ur(a, t.errors), n = v.current?.querySelectorAll("[data-field-key]") ?? [];
			Array.from(n).find((t) => t.dataset.fieldKey === e)?.focus();
			return;
		}
		y.current?.abort();
		let n = new AbortController();
		y.current = n, T(!0);
		try {
			let e = l;
			if (F !== null && M !== null) try {
				e = await F({
					scopes: M,
					forceRefresh: !1
				});
			} catch (e) {
				let t = await ar(e);
				y.current === n && E({
					kind: "error",
					message: t
				});
				return;
			}
			let t = Tt({
				operation: a,
				baseUrl: c,
				values: b,
				token: e
			});
			if (t.errors !== null) return;
			let r = await ft(t.request, n.signal);
			if (F !== null && M !== null && r.kind === "response" && r.status === 401) try {
				let e = Tt({
					operation: a,
					baseUrl: c,
					values: b,
					token: await F({
						scopes: M,
						forceRefresh: !0
					})
				});
				e.errors === null && (r = await ft(e.request, n.signal));
			} catch (e) {
				if (S(e)) throw e;
			}
			y.current === n && E(r);
		} catch (e) {
			if (!S(e)) throw e;
		} finally {
			y.current === n && (y.current = null, T(!1));
		}
	}
	return /* @__PURE__ */ s("div", {
		className: `grid min-w-0 items-start text-base ${se.grid}`,
		children: [/* @__PURE__ */ s("aside", {
			ref: v,
			"aria-label": "Request",
			className: "min-w-0 p-6",
			children: [
				/* @__PURE__ */ o(en, {
					operation: a,
					baseUrl: c,
					hideIdentity: h
				}),
				/* @__PURE__ */ o(rr, {
					security: a.security,
					components: f,
					authMode: I
				}),
				ie.length > 0 || D.length > 0 || O !== null ? /* @__PURE__ */ s("section", {
					className: "mb-6",
					children: [
						/* @__PURE__ */ o("h2", {
							className: "mb-2 font-semibold text-lt-fg",
							children: "Parameters"
						}),
						D.map((e) => /* @__PURE__ */ o(Un, {
							group: e,
							idPrefix: _,
							values: b,
							errors: R.errors?.parameters ?? {},
							onChange: H
						}, e.label)),
						O === null ? null : /* @__PURE__ */ o(Gn, {
							parameters: O,
							idPrefix: _,
							values: b,
							errors: R.errors?.parameters ?? {},
							onModeChange: ue,
							onChange: H
						}),
						ie.map((e) => /* @__PURE__ */ o(Vn, {
							group: e,
							idPrefix: _,
							values: b,
							errors: R.errors?.parameters ?? {},
							onChange: H
						}, e.location))
					]
				}) : null,
				/* @__PURE__ */ s("div", {
					className: "flex flex-col gap-6",
					children: [
						ie.filter((e) => !mr(e.location)).map((e) => {
							let t = e.params.filter((t) => pr(e.location, t));
							return t.length === 0 ? null : /* @__PURE__ */ s("section", {
								className: "flex flex-col gap-3",
								children: [/* @__PURE__ */ s("h3", {
									className: "text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
									children: [e.location, " parameters"]
								}), /* @__PURE__ */ o("div", {
									className: "flex flex-wrap gap-4",
									children: t.map((e) => /* @__PURE__ */ o(sr, {
										idPrefix: _,
										param: e,
										value: b.parameters[q(e)] ?? "",
										error: R.errors?.parameters[q(e)] ?? null,
										onChange: (t) => H(e, t)
									}, q(e)))
								})]
							}, e.location);
						}),
						z.length > 0 || B ? /* @__PURE__ */ s("section", {
							"aria-live": "polite",
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ o("h3", {
								className: "text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
								children: "Request limitations"
							}), /* @__PURE__ */ s("ul", {
								className: "flex flex-col gap-1 text-xs text-lt-danger",
								children: [z.map(({ key: e, name: t, message: n }) => /* @__PURE__ */ s("li", { children: [
									t,
									": ",
									n
								] }, e)), B ? /* @__PURE__ */ o("li", { children: "Only JSON request bodies can be sent from the playground." }) : null]
							})]
						}) : null,
						A.length > 0 ? /* @__PURE__ */ s("section", {
							className: "flex flex-col gap-3",
							children: [A.length > 1 ? /* @__PURE__ */ o(g.FormFieldFrame, {
								id: `${_}-request-media-type`,
								label: "Content type",
								className: "min-w-0 basis-full flex-1 sm:basis-48",
								children: (e) => /* @__PURE__ */ o(g.NativeSelect, {
									...e,
									value: b.mediaType ?? "",
									onChange: (e) => fe(e.target.value),
									children: A.map((e) => /* @__PURE__ */ o("option", {
										value: e.mediaType ?? "",
										children: e.mediaType
									}, e.mediaType))
								})
							}) : null, j === null ? null : /* @__PURE__ */ o(rn, {
								idPrefix: _,
								schema: j.schema,
								components: f,
								value: b.body,
								required: V,
								error: R.errors?.body ?? void 0,
								onChange: de
							})]
						}) : null,
						R.errors?.request ? /* @__PURE__ */ o("p", {
							className: "text-lt-danger",
							children: R.errors.request
						}) : null,
						/* @__PURE__ */ s("form", {
							onSubmit: pe,
							className: "flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ s(g.Button, {
								type: "submit",
								disabled: te || B,
								children: [te ? /* @__PURE__ */ o(g.Spinner, { className: "size-lt-icon-sm" }) : null, "Execute"]
							}), h ? null : /* @__PURE__ */ o(g.CopyButton, {
								value: le,
								label: "as Markdown",
								testId: "copy-operation-markdown",
								className: "ml-auto",
								children: "Copy as Markdown"
							})]
						}),
						/* @__PURE__ */ o(ht, { result: ne })
					]
				})
			]
		}), /* @__PURE__ */ o("aside", {
			"aria-label": "Reference",
			className: `min-w-0 border-t border-lt-border p-6 ${se.reference}`,
			children: /* @__PURE__ */ s("div", {
				className: "flex flex-col gap-6",
				children: [
					/* @__PURE__ */ o(Mn, {
						idPrefix: _,
						language: C,
						snippet: ce,
						onLanguageChange: w
					}),
					/* @__PURE__ */ o(qn, {
						requests: a.requests,
						components: f,
						expandDepth: p
					}),
					/* @__PURE__ */ o(Jn, {
						responses: a.responses,
						components: f,
						expandDepth: p
					})
				]
			})
		})]
	});
}
function sr({ idPrefix: e, param: t, value: n, error: r, onChange: a, inline: c = !1 }) {
	let l = q(t), u = `${e}-${Cr(l)}`, d = hr(t), f = gr(d), p = _r(n), m = d.type === "array" && x(d.items) ? d.items : null, [h, _] = i(!1);
	function v(e) {
		a(p.includes(e) ? p.filter((t) => t !== e).join(",") : [...p, e].join(","));
	}
	return /* @__PURE__ */ o(g.FormFieldFrame, {
		id: u,
		label: t.name,
		required: t.required,
		helperText: c ? void 0 : vr(t, d),
		tooltip: c ? void 0 : t.tooltip ?? void 0,
		error: r ?? void 0,
		className: c ? "min-w-0 [&>div:first-child]:sr-only" : "min-w-0 basis-full shrink-0 grow-0 sm:basis-48 sm:shrink sm:grow",
		children: (e) => t.filterType === "between" && m !== null ? /* @__PURE__ */ o(cr, {
			controlProps: e,
			fieldKey: l,
			itemSchema: m,
			name: t.name,
			required: t.required,
			value: n,
			onChange: a
		}) : f.length > 0 ? /* @__PURE__ */ o(g.Combobox, {
			multiple: !0,
			open: h,
			onOpenChange: _,
			options: f.map((e) => ({
				...e,
				data: null
			})),
			selected: p,
			onSelect: v,
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
		}) : m === null ? Array.isArray(d.enum) ? /* @__PURE__ */ s(g.NativeSelect, {
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
			type: yr(d),
			value: n,
			required: t.required,
			min: br(d),
			max: xr(d),
			step: Sr(d),
			minLength: $(d.minLength),
			maxLength: $(d.maxLength),
			pattern: typeof d.pattern == "string" ? d.pattern : void 0,
			"data-field-key": l,
			onChange: (e) => a(e.target.value)
		}) : /* @__PURE__ */ o(g.Input, {
			...e,
			type: "text",
			value: n,
			required: t.required,
			placeholder: "Separate values with commas",
			"data-field-key": l,
			onChange: (e) => a(e.target.value)
		})
	});
}
function cr({ controlProps: e, fieldKey: t, itemSchema: n, name: r, required: i, value: a, onChange: c }) {
	let [l = "", u = ""] = _r(a);
	function d(e, t) {
		let n = [l, u];
		n[e] = t, c(n.every((e) => e === "") ? "" : n.join(","));
	}
	return /* @__PURE__ */ s("div", {
		className: "grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2",
		children: [/* @__PURE__ */ s("label", {
			className: "grid min-w-0 gap-1 text-xs text-lt-muted-fg",
			children: ["Start", /* @__PURE__ */ o(lr, {
				ariaLabel: `${r} start`,
				controlProps: e,
				dataFieldKey: t,
				required: i,
				schema: n,
				value: l,
				onChange: (e) => d(0, e)
			})]
		}), /* @__PURE__ */ s("label", {
			className: "grid min-w-0 gap-1 text-xs text-lt-muted-fg",
			children: ["End", /* @__PURE__ */ o(lr, {
				ariaLabel: `${r} end`,
				controlProps: {
					...e,
					id: `${e.id}-end`
				},
				required: i,
				schema: n,
				value: u,
				onChange: (e) => d(1, e)
			})]
		})]
	});
}
function lr({ ariaLabel: e, controlProps: t, dataFieldKey: n, required: r, schema: i, value: a, onChange: c }) {
	let { "aria-labelledby": l, ...u } = t;
	return Array.isArray(i.enum) ? /* @__PURE__ */ s(g.NativeSelect, {
		...u,
		"aria-label": e,
		value: a,
		required: r,
		"data-field-key": n,
		onChange: (e) => c(e.target.value),
		children: [/* @__PURE__ */ o("option", {
			value: "",
			children: "Not set"
		}), i.enum.map((e) => /* @__PURE__ */ o("option", {
			value: String(e),
			children: String(e)
		}, String(e)))]
	}) : i.type === "boolean" ? /* @__PURE__ */ s(g.NativeSelect, {
		...u,
		"aria-label": e,
		value: a,
		required: r,
		"data-field-key": n,
		onChange: (e) => c(e.target.value),
		children: [
			/* @__PURE__ */ o("option", {
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
		...u,
		"aria-label": e,
		type: yr(i),
		value: a,
		required: r,
		min: br(i),
		max: xr(i),
		step: Sr(i),
		minLength: $(i.minLength),
		maxLength: $(i.maxLength),
		pattern: typeof i.pattern == "string" ? i.pattern : void 0,
		"data-field-key": n,
		onChange: (e) => c(e.target.value)
	});
}
function ur(e, t) {
	for (let n of e.paramGroups) for (let e of n.params) {
		let r = q(e);
		if (pr(n.location, e) && t.parameters[r] !== void 0) return r;
	}
	return t.body === null ? null : "body";
}
function dr(e) {
	return e.paramGroups.flatMap((e) => e.params.flatMap((e) => {
		let t = q(e), n = It(e);
		return n === null ? [] : [{
			key: t,
			name: e.name,
			message: n
		}];
	}));
}
function fr(e, t) {
	let n = bt(e, t), r = { ...n.parameters };
	for (let t of e.paramGroups.flatMap((e) => e.params)) !t.required && It(t) !== null && (r[q(t)] = "");
	return {
		...n,
		parameters: r
	};
}
function pr(e, t) {
	return [
		"path",
		"query",
		"header"
	].includes(e) && It(t) === null;
}
function mr(e) {
	return e === "path" || e === "query";
}
function hr(e) {
	return x(e.schema) ? e.schema : {};
}
function gr(e) {
	return e.type !== "array" || !x(e.items) || !Array.isArray(e.items.enum) ? [] : e.items.enum.flatMap((e) => [
		"string",
		"number",
		"boolean"
	].includes(typeof e) ? [{
		label: String(e),
		value: String(e)
	}] : []);
}
function _r(e) {
	return e === "" ? [] : e.split(",").map((e) => e.trim());
}
function vr(e, t) {
	let n = e.filterType === "operator" && typeof t["x-value-format"] == "string" ? `Value format: ${t["x-value-format"]}.` : null;
	return [e.description, n].filter(Boolean).join(" ") || void 0;
}
function yr(e) {
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
function br(e) {
	return $(e.minimum) ?? $(e.exclusiveMinimum);
}
function xr(e) {
	return $(e.maximum) ?? $(e.exclusiveMaximum);
}
function Sr(e) {
	let t = $(e.multipleOf);
	return t === void 0 ? e.type === "integer" ? 1 : e.type === "number" ? "any" : void 0 : t;
}
function $(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : void 0;
}
function Cr(e) {
	return e.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
}
var wr, Tr, Er, Dr, Or = f((() => {
	v(), ct(), dt(), mt(), _t(), nn(), ve(), B(), jn(), $t(), wt(), Pn(), I(), Ln(), zn(), w(), wr = {
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
	}, Tr = [{
		key: "schema",
		label: "Schema"
	}, {
		key: "example",
		label: "Example"
	}], Er = [
		{
			key: "authorizationUrl",
			label: "Authorize"
		},
		{
			key: "tokenUrl",
			label: "Token"
		},
		{
			key: "refreshUrl",
			label: "Refresh"
		}
	], Dr = "<YOUR_TOKEN>";
}));
//#endregion
//#region resources/js/api-reference/OperationView.tsx
function kr({ spec: e, operationId: t, baseUrl: r, token: i, remoteTokens: a, resolveAccessToken: c, expandDepth: l = 2, twoColumnBreakpoint: u = "lg", hideHeaderIdentity: d = !1 }) {
	let f = n(() => t ? W(e, t, r ?? null) : null, [
		e,
		t,
		r
	]), p = e?.components ?? null;
	return t ? f ? /* @__PURE__ */ o("div", {
		className: "min-w-0 flex-1 overflow-y-auto",
		children: /* @__PURE__ */ o(or, {
			operation: f,
			baseUrl: f.serverUrl,
			token: i ?? null,
			remoteTokens: a ?? null,
			resolveAccessToken: c ?? null,
			components: p,
			expandDepth: l,
			twoColumnBreakpoint: u,
			hideHeaderIdentity: d
		}, f.summary.id)
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
var Ar = f((() => {
	We(), Or();
}));
//#endregion
//#region resources/js/api-reference/ServerPicker.tsx
function jr(e) {
	return e.description ? `${e.description} — ${e.url}` : e.url;
}
function Mr({ servers: e, selectedServerUrl: t, onServerChange: n }) {
	return e.length === 0 ? null : e.length === 1 ? /* @__PURE__ */ o("p", {
		className: "truncate py-1 text-xs text-lt-muted-fg",
		title: e[0].url,
		children: jr(e[0])
	}) : /* @__PURE__ */ o(g.NativeSelect, {
		value: t ?? "",
		onChange: (e) => n(e.target.value),
		"aria-label": "Select server",
		children: e.map((e) => /* @__PURE__ */ o("option", {
			value: e.url,
			children: jr(e)
		}, e.url))
	});
}
var Nr = f((() => {
	v();
}));
//#endregion
//#region resources/js/api-reference/ApiReference.tsx
function Pr(e) {
	if (!e) return null;
	for (let t of e.groups) {
		let [e] = t.operationIds;
		if (e) return e;
	}
	return null;
}
function Fr() {
	if (typeof window > "u") return null;
	let e = window.location.hash.slice(1);
	return e === "" ? null : e;
}
function Ir({ title: e, info: t }) {
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
function Lr({ spec: t = null, url: r = null, operation: c = null, tags: l = null, defaultOperation: u = null, hideHeader: d = !1, hideBaseUrl: f = !1, title: p = null, expandDepth: m = 2, twoColumnBreakpoint: h = "lg", token: _ = null, remoteTokens: v = null, resolveAccessToken: b = null, selectedOperation: x, onOperationChange: ee, deepLinking: S = !0 }) {
	let C = x !== void 0, [w, te] = i(t ?? null), [T, ne] = i(!!r), [re, E] = i(null), [D, O] = i(() => S ? Fr() : null), k = C ? x : D, [ie, A] = i(null), [j, M] = i(null), [N, ae] = i(null), [P, F] = i({});
	e(() => {
		if (!r) return;
		let e = !0;
		return ne(!0), E(null), fetch(r).then((e) => {
			if (!e.ok) throw Error(`Failed to fetch spec: ${e.status} ${e.statusText}`);
			return e.json();
		}).then((t) => {
			e && te(t);
		}).catch((t) => {
			e && E(t instanceof Error ? t.message : String(t));
		}).finally(() => {
			e && ne(!1);
		}), () => {
			e = !1;
		};
	}, [r]);
	let I = n(() => w ? Ee(w) : null, [w]), L = n(() => I && l?.length ? ze(I, l) : I, [I, l]), R = w?.components ?? null, z = c ?? k, B = L?.groups.find((e) => e.id === ie && k && e.operationIds.includes(k))?.id ?? L?.groups.find((e) => k && e.operationIds.includes(k))?.id, V = n(() => {
		if (!w || !z) return null;
		let e = W(w, z);
		if (!e) return null;
		let t = e.usesRootServers ? N : P[z] ?? null;
		return W(w, z, t);
	}, [
		w,
		z,
		N,
		P
	]);
	e(() => {
		if (C || k !== null || !L) return;
		let e = (S ? Fr() : null) ?? u ?? Pr(L);
		e && O(e);
	}, [
		C,
		L,
		k,
		u,
		S
	]), e(() => {
		if (!L || L.servers.some((e) => e.url === N)) return;
		let e = L.servers[0]?.url ?? null;
		e && ae(e);
	}, [L, N]), e(() => {
		if (C || !S) return;
		function e() {
			O(Fr());
		}
		return window.addEventListener("hashchange", e), () => window.removeEventListener("hashchange", e);
	}, [C, S]);
	function se(e) {
		ee?.(e), !C && (O(e), S && (window.location.hash = e));
	}
	function ce(e, t) {
		let n = `${e}:${t}`;
		if (t === k && e === B && j !== n) {
			M(n);
			return;
		}
		M(null), A(e), se(t);
	}
	function le(e) {
		if (!z || V?.usesRootServers !== !1) {
			ae(e);
			return;
		}
		F((t) => ({
			...t,
			[z]: e
		}));
	}
	function H(e) {
		let t = W(w, e);
		if (!t) return N;
		let n = t.usesRootServers ? N : P[e] ?? null;
		return W(w, e, n)?.serverUrl ?? N;
	}
	if (T) return /* @__PURE__ */ o("div", {
		className: "p-6 text-base text-lt-muted-fg",
		children: "Loading API reference…"
	});
	if (re) return /* @__PURE__ */ o("div", {
		className: "p-6 text-base text-lt-danger",
		children: re
	});
	if (!w || !L) return /* @__PURE__ */ o("div", {
		className: "p-6 text-base text-lt-muted-fg",
		children: "No API specification provided."
	});
	let ue = /* @__PURE__ */ s(a, { children: [d ? null : /* @__PURE__ */ o(Ir, {
		title: p,
		info: L.info
	}), V && !f ? /* @__PURE__ */ o("div", {
		className: "border-b border-lt-border py-3",
		children: /* @__PURE__ */ o(Mr, {
			servers: V.servers,
			selectedServerUrl: V.serverUrl,
			onServerChange: le
		})
	}) : null] });
	return c ? /* @__PURE__ */ o("div", {
		className: "flex w-full text-base",
		children: /* @__PURE__ */ s("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [ue, /* @__PURE__ */ o(kr, {
				spec: w,
				operationId: c,
				baseUrl: H(c),
				token: _,
				remoteTokens: v,
				resolveAccessToken: b,
				expandDepth: m,
				twoColumnBreakpoint: h
			}, c)]
		})
	}) : /* @__PURE__ */ s("div", {
		className: "flex min-w-0 w-full flex-col text-base",
		children: [ue, /* @__PURE__ */ o("div", {
			className: "flex flex-col gap-8 py-6",
			children: L.groups.map((e) => /* @__PURE__ */ s("section", {
				"aria-labelledby": `api-reference-tag-${e.id}`,
				children: [/* @__PURE__ */ o("h2", {
					id: `api-reference-tag-${e.id}`,
					className: "mb-3 font-semibold text-lt-fg",
					children: e.title
				}), /* @__PURE__ */ o("div", {
					className: "overflow-hidden rounded-lt border border-lt-border",
					children: e.operationIds.map((t) => {
						let n = L.summaries[t];
						if (!n) return null;
						let r = `${e.id}:${t}`, i = t === k && e.id === B && j !== r, a = `api-reference-operation-${e.id}-${t}`, c = H(t), l = Bt(c, n.path), u = W(w, t, c), d = u ? oe(u, R) : "";
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
									onClick: () => ce(e.id, t),
									className: "absolute inset-0 z-0 cursor-pointer transition-colors hover:bg-lt-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lt-ring"
								})]
							}), i ? /* @__PURE__ */ o("div", {
								id: a,
								children: /* @__PURE__ */ o(kr, {
									spec: w,
									operationId: t,
									baseUrl: H(t),
									token: _,
									remoteTokens: v,
									resolveAccessToken: b,
									expandDepth: m,
									twoColumnBreakpoint: h,
									hideHeaderIdentity: !0
								}, t)
							}) : null]
						}, t);
					})
				})]
			}, e.id))
		})]
	});
}
var Rr = f((() => {
	v(), b(), ve(), Ar(), We(), $t(), Nr();
})), zr = /* @__PURE__ */ p({ default: () => Br }), Br, Vr = f((() => {
	Rr(), Br = ({ node: e }) => /* @__PURE__ */ o(Lr, { ...e.props });
}));
//#endregion
//#region resources/js/plugin.ts
v();
var Hr = {
	name: "api-reference",
	components: { "api-reference": (0, g.lazyComponent)(() => Promise.resolve().then(() => (Vr(), zr))) }
};
//#endregion
export { Hr as default };
