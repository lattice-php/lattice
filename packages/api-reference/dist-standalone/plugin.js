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
function S(e) {
	return JSON.stringify(e, null, 2) ?? "";
}
function C(e) {
	return typeof e == "object" && !!e && "name" in e && e.name === "AbortError";
}
function w(e) {
	return [e.status, e.mediaType].filter((e) => !!e).join(" ") || "default";
}
var T = f((() => {}));
//#endregion
//#region resources/js/api-reference/schema-example.ts
function E(e, t) {
	return k(e, t, /* @__PURE__ */ new Set(), "complete");
}
function ee(e, t) {
	return O(e, t, "complete");
}
function D(e, t) {
	return O(e, t, "request");
}
function O(e, t, n) {
	let r = e.examples.find((e) => e.value !== void 0);
	return r === void 0 ? k(e.schema, t, /* @__PURE__ */ new Set(), n) : r.value;
}
function k(e, t, n, r) {
	if (!x(e)) return null;
	let i = e.example;
	if (i !== void 0) return i;
	if (Array.isArray(e.examples) && e.examples.length > 0) return e.examples[0];
	let a = e.default;
	return a === void 0 ? e.const === void 0 ? Array.isArray(e.enum) && e.enum.length > 0 ? e.enum[0] : N([
		A(e, t, n, r),
		...te(e.allOf, t, n, r),
		j(e, t, n, r),
		M(e, t, n, r)
	]) : e.const : a;
}
function A(e, t, n, r) {
	let i = F(e);
	if (i === null || n.has(i)) return null;
	let a = I(i, t);
	if (a === null) return null;
	n.add(i);
	let o = k(a, t, n, r);
	return n.delete(i), o;
}
function te(e, t, n, r) {
	return Array.isArray(e) ? e.map((e) => k(e, t, n, r)) : [];
}
function j(e, t, n, r) {
	let i = Array.isArray(e.oneOf) ? e.oneOf : e.anyOf;
	if (!Array.isArray(i)) return null;
	for (let e of i) {
		let i = k(e, t, n, r);
		if (i !== null) return i;
	}
	return null;
}
function M(e, t, n, r) {
	let i = Array.isArray(e.type) ? e.type.find((e) => e !== "null") : e.type;
	return i === "object" || x(e.properties) ? ne(e.properties, e.required, t, n, r) : i === "array" ? [k(e.items, t, n, r)] : i === "string" ? P(e.format) : i === "integer" || i === "number" ? 0 : i !== "boolean" && null;
}
function N(e) {
	let t = e.filter(x);
	return t.length > 0 ? Object.assign({}, ...t) : e.find((e) => e !== null) ?? null;
}
function P(e) {
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
function F(e) {
	return typeof e.$ref != "string" || !e.$ref.startsWith(L) ? null : e.$ref;
}
function I(e, t) {
	if (!x(t) || !x(t.schemas)) return null;
	let n = e.slice(21);
	return n === "" || !(n in t.schemas) ? null : t.schemas[n];
}
function ne(e, t, n, r, i) {
	if (!x(e)) return {};
	let a = new Set(Array.isArray(t) ? t.filter((e) => typeof e == "string") : []);
	return Object.fromEntries(Object.entries(e).filter(([e, t]) => i === "complete" || a.has(e) && (!x(t) || t.readOnly !== !0)).map(([e, t]) => [e, k(t, n, r, i)]));
}
var L, R = f((() => {
	T(), L = "#/components/schemas/";
}));
//#endregion
//#region resources/js/api-reference/parameter-schema.ts
function z(e) {
	if (!x(e)) return "any";
	if (typeof e.$ref == "string") return e.$ref.split("/").pop() ?? "ref";
	for (let [t, n] of [
		["oneOf", " | "],
		["anyOf", " | "],
		["allOf", " & "]
	]) {
		let r = e[t];
		if (Array.isArray(r) && r.length > 0) return [...new Set(r.map(z))].join(n);
	}
	return Array.isArray(e.type) ? e.type.join(" | ") : typeof e.type == "string" ? e.type === "array" && e.items ? `${z(e.items)}[]` : e.type : Array.isArray(e.enum) ? "enum" : "any";
}
function B(e) {
	return x(e) ? Array.isArray(e.enum) ? e.enum.map(V) : e.type === "array" && x(e.items) && Array.isArray(e.items.enum) ? e.items.enum.map(V) : [] : [];
}
function V(e) {
	return typeof e == "string" ? e : JSON.stringify(e) ?? String(e);
}
var H = f((() => {
	T();
}));
//#endregion
//#region resources/js/api-reference/operation-markdown.ts
function re(e, t) {
	return [
		[
			`# ${e.summary.title}`,
			`\`${e.summary.method} ${e.summary.path}\``,
			e.description
		].filter((e) => !!e).join("\n\n"),
		ie(e.security),
		oe(e.paramGroups.flatMap((e) => e.params)),
		le(e.requests, t),
		de(e.responses, t)
	].filter((e) => !!e).join("\n\n");
}
function ie(e) {
	return e.length === 0 ? null : ["## Authorization", e.map((e) => ae(e)).map((e, t) => t === 0 ? `- ${e}` : `- OR\n- ${e}`).join("\n")].join("\n\n");
}
function ae(e) {
	return e.schemes.length === 0 ? "optional authentication" : e.schemes.map((e) => e.scopes.length > 0 ? `${e.name} (${e.scopes.join(", ")})` : e.name).join(" + ");
}
function oe(e) {
	return e.length === 0 ? null : ["## Parameters", se(e)].join("\n\n");
}
function se(e) {
	return [
		"| Name | In | Type | Required | Description |",
		"| --- | --- | --- | --- | --- |",
		...e.map((e) => `| ${ge(e.name)} | ${ge(e.location)} | ${ge(z(e.schema))} | ${e.required ? "yes" : "no"} | ${ge(ce(e))} |`)
	].join("\n");
}
function ce(e) {
	let t = B(e.schema), n = t.length === 0 ? null : `Available values: ${t.map((e) => `\`${e}\``).join(", ")}`, r = [e.description, n].filter((e) => !!e);
	return r.length === 0 ? null : r.join("\n");
}
function le(e, t) {
	return e.length === 0 ? null : ["## Request body", ...e.map((e) => ue(e, t))].join("\n\n");
}
function ue(e, t) {
	return [
		e.mediaType ? `**Content-Type:** \`${e.mediaType}\`` : "**Content-Type:** unspecified",
		e.title,
		pe(e, t, 3)
	].filter((e) => !!e).join("\n\n");
}
function de(e, t) {
	return e.length === 0 ? null : ["## Responses", ...e.map((e) => fe(e, t))].join("\n\n");
}
function fe(e, t) {
	return [
		`### ${w(e)}`,
		e.title,
		e.headers.length > 0 ? ["#### Headers", se(e.headers)].join("\n\n") : null,
		pe(e, t, 4)
	].filter((e) => !!e).join("\n\n");
}
function pe(e, t, n) {
	let r = [];
	e.schema !== null && r.push([`${"#".repeat(n)} Schema`, he(e.schema)].filter((e) => !!e).join("\n\n"));
	let i = e.examples.length > 0 ? e.examples : e.schema === null ? [] : [{
		name: null,
		summary: null,
		value: e.role === "request" ? D(e, t) : ee(e, t)
	}];
	r.push(...i.map((e) => me(e, n)));
	let a = r.filter((e) => !!e);
	return a.length === 0 ? null : a.join("\n\n");
}
function me(e, t) {
	let n = e.name ? `Example: ${e.name}` : "Example";
	return [
		`${"#".repeat(t)} ${n}`,
		e.summary,
		e.description,
		e.externalValue ? `[Open external example](${e.externalValue})` : null,
		he(e.value)
	].filter((e) => !!e).join("\n\n");
}
function he(e) {
	let t = JSON.stringify(e, null, 2);
	return t === void 0 ? null : `\`\`\`json\n${t}\n\`\`\``;
}
function ge(e) {
	return (e ?? "").replaceAll("|", "\\|").replaceAll(/\r?\n/g, "<br>");
}
var _e = f((() => {
	R(), H(), T();
}));
//#endregion
//#region resources/js/api-reference/parse.ts
function ve(e) {
	return e.replaceAll("/", "-").replaceAll("{", "").replaceAll("}", "").replace(/^-+|-+$/g, "");
}
function ye(e, t) {
	let n = ve(t);
	return n === "" ? `${e}-root` : `${e}-${n}`;
}
function be(e, t, n) {
	return typeof e.summary == "string" && e.summary !== "" ? e.summary : typeof e.operationId == "string" && e.operationId !== "" ? e.operationId : `${t.toUpperCase()} ${n}`;
}
function U(e, t, n) {
	if (typeof t != "string") return null;
	let r = t.split("/").pop();
	return r ? e?.components?.[n]?.[r] ?? null : null;
}
function xe(e, t) {
	let n = e.paths ?? {};
	for (let e of Object.keys(n)) {
		let r = n[e];
		for (let n of Be) {
			let i = r[n];
			if (!(!i || typeof i != "object") && ye(n, e) === t) return {
				path: e,
				method: n,
				pathItem: r,
				operation: i
			};
		}
	}
	return null;
}
function Se(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e?.url == "string").map((e) => ({
		url: Ce(e.url, e.variables),
		description: e.description ?? null
	})) : [];
}
function Ce(e, t) {
	return t ? e.replaceAll(/\{([^{}]+)\}/g, (e, n) => {
		let r = t[n]?.default;
		return r === void 0 ? e : String(r);
	}) : e;
}
function we(e) {
	let t = Se(e.servers);
	return t.length > 0 ? t : [{
		url: "/",
		description: null
	}];
}
function Te(e) {
	let t = ze(e), n = {
		title: t.info?.title ?? "",
		version: t.info?.version ?? null,
		description: t.info?.description ?? null
	}, r = {}, i = /* @__PURE__ */ new Map(), a = t.paths ?? {};
	for (let e of Object.keys(a)) {
		let t = a[e];
		for (let n of Be) {
			let a = t[n];
			if (!a || typeof a != "object") continue;
			let o = ye(n, e);
			r[o] = {
				id: o,
				method: n.toUpperCase(),
				path: e,
				title: be(a, n, e),
				deprecated: !!a.deprecated
			};
			let s = a.tags && a.tags.length > 0 ? a.tags : [He];
			for (let e of s) {
				let t = i.get(e) ?? [];
				t.push(o), i.set(e, t);
			}
		}
	}
	return {
		info: n,
		groups: Array.from(i.entries()).map(([e, t]) => ({
			id: Ee(e),
			title: e,
			operationIds: t
		})),
		summaries: r,
		servers: we(t)
	};
}
function Ee(e) {
	return e.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function De(e, t) {
	let n = t.schema ?? {};
	return {
		name: t.name,
		location: t.in,
		required: !!t.required,
		deprecated: !!t.deprecated,
		description: t.description ?? null,
		tooltip: t["x-tooltip"] ?? null,
		schema: n,
		example: Oe(e, t, n),
		...t.style === void 0 ? {} : { style: t.style },
		...t.explode === void 0 ? {} : { explode: t.explode }
	};
}
function Oe(e, t, n) {
	if (t.example !== void 0) return t.example;
	let r = ke(e, t.examples);
	if (r !== void 0) return r;
	let i = Ae(n, "example");
	if (i !== void 0) return i;
	let a = Ae(n, "examples");
	return Array.isArray(a) && a.length > 0 ? a[0] : Ae(n, "default") ?? null;
}
function ke(e, t) {
	if (t) for (let n of Object.values(t)) {
		let t = n.$ref ? U(e, n.$ref, "examples") ?? n : n;
		if (t.value !== void 0) return t.value;
	}
}
function Ae(e, t) {
	if (!(typeof e != "object" || !e || !(t in e))) return e[t];
}
function je(e, t) {
	return t ? Object.entries(t).map(([t, n]) => De(e, {
		...n.$ref ? U(e, n.$ref, "headers") ?? n : n,
		name: t,
		in: "header"
	})) : [];
}
function Me(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of [t, n]) for (let t of i) {
		let n = t.$ref ? U(e, t.$ref, "parameters") ?? t : t;
		r.set(`${n.in}::${n.name}`, n);
	}
	let i = /* @__PURE__ */ new Map();
	for (let t of r.values()) {
		let n = i.get(t.in) ?? [];
		n.push(De(e, t)), i.set(t.in, n);
	}
	let a = [];
	for (let e of Ve) {
		let t = i.get(e);
		t && t.length > 0 && a.push({
			location: e,
			params: t
		});
	}
	return a;
}
function Ne(e, t) {
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
function Pe(e, t) {
	if (!t) return [];
	let n = t.$ref ? U(e, t.$ref, "requestBodies") ?? t : t, r = n.content ?? {}, i = n.description ?? null;
	return Object.entries(r).map(([t, r]) => ({
		role: "request",
		status: null,
		mediaType: t,
		schema: r?.schema ?? null,
		title: i,
		examples: Ne(e, r),
		headers: [],
		required: !!n.required
	}));
}
function Fe(e, t) {
	if (!t) return [];
	let n = [];
	for (let [r, i] of Object.entries(t)) {
		let t = i.$ref ? U(e, i.$ref, "responses") ?? i : i, a = t.description ?? null, o = t.content ?? {}, s = Object.entries(o), c = je(e, t.headers);
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
			examples: Ne(e, i),
			headers: c,
			required: !1
		});
	}
	return n;
}
function Ie(e, t) {
	return (t.security === void 0 ? e.security ?? [] : t.security).map((t) => ({ schemes: Object.entries(t).map(([t, n]) => {
		let r = Le(e, t);
		return {
			name: t,
			scopes: n ?? [],
			type: r?.type ?? null,
			scheme: r?.scheme ?? null
		};
	}) }));
}
function Le(e, t) {
	let n = e.components?.securitySchemes?.[t] ?? null;
	return n?.$ref ? U(e, n.$ref, "securitySchemes") ?? n : n;
}
function Re(e, t) {
	let n = new Set(t), r = e.groups.filter((e) => n.has(e.title)), i = new Set(r.flatMap((e) => e.operationIds)), a = Object.fromEntries(Object.entries(e.summaries).filter(([e]) => i.has(e)));
	return {
		...e,
		groups: r,
		summaries: a
	};
}
function W(e, t, n = null) {
	let r = ze(e), i = xe(r, t);
	if (!i) return null;
	let { path: a, method: o, pathItem: s, operation: c } = i, l = Se(c.servers), u = Se(s.servers), d = l.length === 0 && u.length === 0, f = l.length > 0 ? l : u.length > 0 ? u : we(r), p = d && n !== null || n !== null && f.some((e) => e.url === n) ? n : f[0].url;
	return {
		summary: {
			id: t,
			method: o.toUpperCase(),
			path: a,
			title: be(c, o, a),
			deprecated: !!c.deprecated
		},
		serverUrl: p,
		servers: f,
		usesRootServers: d,
		description: c.description ?? null,
		tooltip: c["x-tooltip"] ?? null,
		tags: c.tags ?? [],
		paramGroups: Me(r, s.parameters ?? [], c.parameters ?? []),
		requests: Pe(r, c.requestBody),
		responses: Fe(r, c.responses),
		security: Ie(r, c)
	};
}
function ze(e) {
	return typeof e == "object" && e ? e : {};
}
var Be, Ve, He, Ue = f((() => {
	Be = [
		"get",
		"post",
		"put",
		"patch",
		"delete",
		"options",
		"head",
		"trace"
	], Ve = [
		"path",
		"query",
		"header",
		"cookie"
	], He = "Default";
}));
//#endregion
//#region resources/js/schema/build-rows.ts
function G(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function We(e) {
	return typeof e != "string" || !e.startsWith("#/components/schemas/") ? null : e.slice(21);
}
function Ge(e, t) {
	let n = We(e);
	if (n === null) return null;
	let r = G(G(t?.schemas)?.[n]);
	return r ? {
		name: n,
		schema: r
	} : null;
}
function Ke(e, t) {
	for (let [n, r] of Object.entries(t)) n === "properties" ? e.properties = {
		...G(e.properties),
		...G(r)
	} : n === "required" ? e.required = [.../* @__PURE__ */ new Set([...Array.isArray(e.required) ? e.required : [], ...Array.isArray(r) ? r : []])] : e[n] = r;
}
function K(e, t, n) {
	let r = e, i = {};
	for (; r.$ref !== void 0;) {
		let e = Ge(r.$ref, t);
		if (e === null) return i;
		if (n.has(e.name)) return {
			...r,
			...i
		};
		n.add(e.name), i = {
			...qe(r),
			...i
		}, r = e.schema;
	}
	if (!Array.isArray(r.allOf)) {
		let e = { ...r };
		return Ke(e, i), e;
	}
	let { allOf: a, ...o } = r, s = {};
	for (let e of a) {
		let r = G(e);
		r && Ke(s, K(r, t, n));
	}
	return Ke(s, K(o, t, n)), Ke(s, i), s;
}
function qe(e) {
	let t = { ...e };
	return delete t.$ref, t;
}
function Je(e, t) {
	let n = Array.isArray(e.type) ? e.type.filter((e) => typeof e == "string") : typeof e.type == "string" ? [e.type] : [];
	if (n.length === 0 && (e.properties !== void 0 || e.additionalProperties !== void 0 ? n.push("object") : e.items !== void 0 && n.push("array")), e.nullable === !0 && !n.includes("null") && n.push("null"), n.length === 0) return Array.isArray(e.oneOf) ? "oneOf" : Array.isArray(e.anyOf) ? "anyOf" : "any";
	let r = G(e.items);
	if (r && n[0] === "array") {
		let e = We(r.$ref) ?? Je(K(r, t, /* @__PURE__ */ new Set()), t);
		e !== "any" && e !== "object" && (n[0] = `array[${e}]`);
	}
	return n.join(" | ");
}
function Ye(e, t, n) {
	return typeof t.title == "string" ? t.title : We(e.$ref) ?? Je(t, n);
}
function Xe(e) {
	return JSON.stringify(e) ?? String(e);
}
function Ze(e) {
	let t = [];
	typeof e.format == "string" && t.push(`format: ${e.format}`), "const" in e ? t.push(`const: ${Xe(e.const)}`) : Array.isArray(e.enum) && t.push(`enum: ${Xe(e.enum)}`), e.default !== void 0 && t.push(`default: ${Xe(e.default)}`), e.examples !== void 0 && t.push(`examples: ${Xe(e.examples)}`);
	for (let [n, r] of Object.entries(e)) nt.includes(n) && t.push(`${n}: ${Xe(r)}`);
	return e.deprecated === !0 && t.push("deprecated"), e.readOnly === !0 && t.push("readOnly"), e.writeOnly === !0 && t.push("writeOnly"), t;
}
function Qe(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function $e(e, t, n, r, i, a) {
	let o = G(e) ?? {}, s = /* @__PURE__ */ new Set(), c = K(o, i, s), l = [...s].some((e) => a.has(e));
	return {
		id: n,
		name: t,
		typeLabel: Je(c, i),
		required: r,
		description: typeof c.description == "string" ? c.description : null,
		details: Ze(c),
		children: l ? [] : et(c, n, i, s.size > 0 ? /* @__PURE__ */ new Set([...a, ...s]) : a),
		isRecursive: l
	};
}
function et(e, t, n, r) {
	let i = [], a = new Set(Array.isArray(e.required) ? e.required : []), o = G(e.properties);
	for (let [e, s] of Object.entries(o ?? {})) i.push($e(s, e, `${t}/properties/${Qe(e)}`, a.has(e), n, r));
	let s = G(e.additionalProperties);
	s && i.push($e(s, "additionalProperties", `${t}/additionalProperties`, !1, n, r));
	let c = G(e.items);
	if (c) {
		let e = /* @__PURE__ */ new Set(), a = K(c, n, e);
		if ([...e].some((e) => r.has(e))) i.push($e(c, null, `${t}/items`, !1, n, r));
		else {
			let o = e.size > 0 ? /* @__PURE__ */ new Set([...r, ...e]) : r;
			i.push(...et(a, `${t}/items`, n, o));
		}
	}
	for (let a of ["oneOf", "anyOf"]) {
		let o = e[a];
		Array.isArray(o) && o.forEach((e, o) => {
			let s = G(e) ?? {}, c = $e(e, null, `${t}/${a}/${o}`, !1, n, r);
			c.typeLabel = Ye(s, K(s, n, /* @__PURE__ */ new Set()), n), i.push(c);
		});
	}
	return i;
}
function tt(e, t) {
	let n = G(e);
	if (n === null) return [];
	let r = G(t), i = /* @__PURE__ */ new Set();
	return et(K(n, r, i), "#", r, i);
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
		if (C(e)) throw e;
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
	T();
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
function q(e) {
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
	let n = Object.fromEntries(e.paramGroups.flatMap((e) => e.params.map((e) => [q(e), gt(e)]))), r = mt(e)[0];
	return r === void 0 ? {
		parameters: n,
		mediaType: null,
		body: ""
	} : {
		parameters: n,
		mediaType: r.mediaType,
		body: S(D(r, t))
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
	return e.required && Array.isArray(e.schema.enum) ? vt(e.schema.enum[0]) ?? "" : "";
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
	R(), T();
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
		let e = q(r), i = t.parameters[e] ?? "", a = Ot(r, i);
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
function Dt(e, t) {
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
	return Object.fromEntries(e.filter((e) => e.location === "header").map((e) => [e.name, t.parameters[q(e)] ?? ""]).filter((e) => e[1] !== ""));
}
function jt(e, t, n, r) {
	let i = t, a = [];
	for (let e of n) {
		let t = r.parameters[q(e)] ?? "";
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
	yt(), T(), zt = /* @__PURE__ */ new Set([
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
	if (n) return /* @__PURE__ */ o(Wt, { operation: e });
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
			/* @__PURE__ */ o(Wt, {
				operation: e,
				className: "mt-1"
			})
		]
	});
}
function Wt({ operation: e, className: t = "" }) {
	return !e.description && !e.tooltip ? null : /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ s("p", {
		className: `${t} whitespace-pre-line text-lt-muted-fg`,
		children: [e.description, /* @__PURE__ */ o(g.InfoTooltip, { content: e.tooltip })]
	}), /* @__PURE__ */ o("hr", { className: "my-8 border-lt-border" })] });
}
var Gt = f((() => {
	v(), b(), Ht();
}));
//#endregion
//#region resources/js/api-reference/RequestBodyEditor.tsx
function Kt({ idPrefix: e, schema: t, components: r, value: i, required: a, error: c, onChange: l }) {
	let u = n(() => Y(t, r, /* @__PURE__ */ new Set()), [r, t]), d = cn(i);
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
		l(S(an(f, e, t)));
	}
	return /* @__PURE__ */ s("fieldset", {
		"aria-label": "JSON body fields",
		className: "@container flex min-w-0 flex-col gap-3",
		children: [c ? /* @__PURE__ */ o("p", {
			className: "text-sm text-lt-danger",
			children: c
		}) : null, /* @__PURE__ */ o(qt, {
			schema: u,
			path: [],
			value: f,
			onChange: p
		})]
	});
}
function qt({ schema: e, path: t, value: n, onChange: r }) {
	return /* @__PURE__ */ o("div", {
		className: "grid min-w-0 grid-cols-1 gap-4 @xl:grid-cols-2",
		children: e.properties.map((e) => /* @__PURE__ */ o(Jt, {
			schema: e.schema,
			path: [...t, e.name],
			required: e.required,
			value: x(n) ? n[e.name] : void 0,
			onChange: r
		}, e.name))
	});
}
function Jt({ schema: e, path: n, required: r, value: i, onChange: a }) {
	let c = `body-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;
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
			/* @__PURE__ */ o(qt, {
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
						children: /* @__PURE__ */ o(Jt, {
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
					onClick: () => a(n, [...t, rn(e.items)]),
					children: "Add item"
				})
			]
		});
	}
	if (e.kind === "json") return /* @__PURE__ */ o(Yt, {
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
			value: pn(i),
			required: r,
			"data-field-key": `body:${l}`,
			onChange: (t) => {
				let i = e.enumValues.find((e) => pn(e) === t.target.value);
				a(n, t.target.value === "" && !r ? void 0 : i);
			},
			children: [r ? null : /* @__PURE__ */ o("option", {
				value: "",
				children: "Not set"
			}), e.enumValues.map((e) => /* @__PURE__ */ o("option", {
				value: pn(e),
				children: String(e)
			}, pn(e)))]
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
			type: dn(e),
			value: typeof i == "string" || typeof i == "number" ? i : "",
			required: r,
			min: e.minimum ?? void 0,
			max: e.maximum ?? void 0,
			step: fn(e),
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
function Yt({ schema: e, path: n, required: r, value: a, onChange: s }) {
	let c = `body-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`, l = X(n), u = S(a), [d, f] = i(u), [p, m] = i(u);
	return d !== u && (f(u), m(u)), /* @__PURE__ */ o(g.FormFieldFrame, {
		id: c,
		label: l,
		required: r,
		helperText: e.description ?? void 0,
		tooltip: e.tooltip ?? void 0,
		error: Xt(p).valid ? void 0 : "Enter valid JSON.",
		className: "min-w-0 @xl:col-span-2",
		children: (e) => /* @__PURE__ */ o(g.Textarea, {
			...e,
			value: p,
			required: r,
			"data-field-key": `body:${l}`,
			className: "min-h-24 font-mono",
			onChange: (e) => {
				m(e.target.value);
				let t = Xt(e.target.value);
				t.valid && (f(S(t.value)), s(n, t.value));
			}
		})
	});
}
function Xt(e) {
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
		let r = ln(e.$ref, t);
		if (r === null) return null;
		let i = Y(r, t, /* @__PURE__ */ new Set([...n, e.$ref]));
		return i === null ? null : {
			...i,
			description: Z(e.description) ?? i.description,
			tooltip: Q(e) ?? i.tooltip,
			initialValue: E(e, t)
		};
	}
	let r = $t(e);
	if (r !== null) {
		let i = Y(r, t, n);
		return i === null ? null : {
			...i,
			description: Z(e.description) ?? i.description,
			tooltip: Q(e) ?? i.tooltip,
			initialValue: E(e, t)
		};
	}
	if ("oneOf" in e || "anyOf" in e) return null;
	if (Array.isArray(e.allOf)) {
		let r = e.allOf.map((e) => Y(e, t, n)), i = Zt(e, t, n);
		return r.some((e) => e?.kind !== "object") || i === null ? null : nn([...r, i], e, t);
	}
	let i = un(e);
	if (i === "object" || x(e.properties)) return Zt(e, t, n);
	if (i === "array") {
		let r = Y(e.items, t, n);
		return r === null ? null : {
			kind: "array",
			description: Z(e.description),
			tooltip: Q(e),
			initialValue: E(e, t),
			items: r
		};
	}
	if (!mn(i)) return null;
	let a = Array.isArray(e.enum) && e.enum.every(hn) ? e.enum : [];
	return Array.isArray(e.enum) && a.length !== e.enum.length ? null : {
		kind: i,
		description: Z(e.description),
		tooltip: Q(e),
		initialValue: E(e, t),
		enumValues: a,
		format: Z(e.format),
		minimum: gn(e.minimum),
		maximum: gn(e.maximum),
		multipleOf: gn(e.multipleOf),
		minLength: gn(e.minLength),
		maxLength: gn(e.maxLength),
		pattern: Z(e.pattern)
	};
}
function Zt(e, t, n) {
	if (e.additionalProperties === !0 || x(e.additionalProperties)) return null;
	let r = x(e.properties) ? e.properties : {}, i = new Set(Array.isArray(e.required) ? e.required.filter((e) => typeof e == "string") : []), a = [];
	for (let [e, o] of Object.entries(r)) {
		if (x(o) && o.readOnly === !0) continue;
		let r = Y(o, t, n) ?? Qt(o, t);
		a.push({
			name: e,
			required: i.has(e) && !tn(o),
			schema: r
		});
	}
	return {
		kind: "object",
		description: Z(e.description),
		tooltip: Q(e),
		initialValue: E(e, t),
		properties: a
	};
}
function Qt(e, t) {
	return {
		kind: "json",
		description: x(e) ? Z(e.description) : null,
		tooltip: x(e) ? Q(e) : null,
		initialValue: E(e, t)
	};
}
function $t(e) {
	let t = Array.isArray(e.oneOf) ? e.oneOf : e.anyOf;
	if (!Array.isArray(t)) return null;
	let n = t.filter((e) => !en(e));
	return n.length === 1 && n.length < t.length ? n[0] : null;
}
function en(e) {
	return x(e) && e.type === "null";
}
function tn(e) {
	return x(e) && $t(e) !== null;
}
function nn(e, t, n) {
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
		initialValue: E(t, n),
		properties: [...r.values()]
	};
}
function rn(e) {
	if (e.initialValue !== null && e.initialValue !== void 0) return structuredClone(e.initialValue);
	switch (e.kind) {
		case "object": return {};
		case "array": return [];
		case "json": return null;
		case "boolean": return !1;
		case "number":
		case "integer": return 0;
		case "string": return "";
	}
}
function an(e, t, n) {
	let r = structuredClone(e), i = r;
	for (let e = 0; e < t.length - 1; e += 1) {
		let n = t[e], r = t[e + 1], a = on(i, n);
		!x(a) && !Array.isArray(a) && sn(i, n, typeof r == "number" ? [] : {}), i = on(i, n);
	}
	let a = t[t.length - 1];
	return a === void 0 ? x(n) ? n : r : (n === void 0 ? Array.isArray(i) && typeof a == "number" ? i.splice(a, 1) : Array.isArray(i) || delete i[String(a)] : sn(i, a, n), r);
}
function on(e, t) {
	return Array.isArray(e) ? typeof t == "number" ? e[t] : void 0 : e[String(t)];
}
function sn(e, t, n) {
	if (Array.isArray(e)) {
		typeof t == "number" && (e[t] = n);
		return;
	}
	e[String(t)] = n;
}
function cn(e) {
	try {
		return e.trim() === "" ? {} : JSON.parse(e);
	} catch {
		return null;
	}
}
function X(e) {
	return e.reduce((e, t) => typeof t == "number" ? `${e}[${t}]` : e === "" ? t : `${e}.${t}`, "");
}
function ln(e, t) {
	if (!x(t) || !x(t.schemas)) return null;
	let n = e.slice(21);
	return n in t.schemas ? t.schemas[n] : null;
}
function un(e) {
	return Array.isArray(e.type) ? e.type.find((e) => e !== "null") : e.type;
}
function dn(e) {
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
function fn(e) {
	return e.multipleOf === null ? e.kind === "integer" ? 1 : e.kind === "number" ? "any" : void 0 : e.multipleOf;
}
function pn(e) {
	return hn(e) ? `${typeof e}:${String(e)}` : "";
}
function mn(e) {
	return typeof e == "string" && [
		"string",
		"number",
		"integer",
		"boolean"
	].includes(e);
}
function hn(e) {
	return typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
function Z(e) {
	return typeof e == "string" ? e : null;
}
function Q(e) {
	return Z(e["x-tooltip"]);
}
function gn(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
var _n = f((() => {
	v(), R(), T();
}));
//#endregion
//#region resources/js/api-reference/SnippetPanel.tsx
function vn({ idPrefix: e, language: t, snippet: n, onLanguageChange: r }) {
	return /* @__PURE__ */ s("section", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ o(g.SegmentedPills, {
			name: `${e}-request-snippet-language`,
			ariaLabel: "Snippet language",
			options: yn,
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
var yn, bn = f((() => {
	v(), yn = [{
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
function xn(e) {
	return `'${e.replaceAll("'", "'\"'\"'")}'`;
}
var Sn, Cn = f((() => {
	Sn = {
		id: "curl",
		label: "cURL",
		generate(e) {
			let t = [
				`--request ${xn(e.method)}`,
				`--url ${xn(e.url)}`,
				...Object.entries(e.headers).map(([e, t]) => `--header ${xn(`${e}: ${t}`)}`)
			];
			return e.body !== null && t.push(`--data ${xn(e.body)}`), t.length === 2 ? `curl ${t.join(" ")}` : t.map((e, n) => `${n === 0 ? "curl " : "  "}${e}${n === t.length - 1 ? "" : " \\"}`).join("\n");
		}
	};
})), wn, Tn = f((() => {
	wn = {
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
function En({ param: e, control: t }) {
	let n = B(e.schema), r = t ? "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,3fr)_minmax(12rem,2fr)] sm:items-start" : "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-2", i = !!e.description || n.length > 0;
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
				children: z(e.schema)
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
function Dn({ group: e, idPrefix: t, values: n, errors: r, onChange: i }) {
	let a = e.location === "path" || e.location === "query";
	return /* @__PURE__ */ s("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ s("h3", {
			className: "mb-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: [e.location, " parameters"]
		}), /* @__PURE__ */ o("ul", { children: e.params.map((s) => /* @__PURE__ */ o(En, {
			param: s,
			control: a && Jn(e.location, s) ? /* @__PURE__ */ o(Wn, {
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
function On(e) {
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
function kn({ group: e, idPrefix: t, values: n, errors: r, onChange: i }) {
	return /* @__PURE__ */ s("fieldset", {
		className: "mb-4 rounded-lt-sm border border-lt-border p-3",
		children: [/* @__PURE__ */ o("legend", {
			className: "px-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: e.label
		}), /* @__PURE__ */ o("div", {
			className: "flex flex-wrap items-start gap-4",
			children: e.params.map((e) => /* @__PURE__ */ o(Wn, {
				idPrefix: t,
				param: e,
				value: n.parameters[q(e)] ?? "",
				error: r[q(e)] ?? null,
				onChange: (t) => i(e, t)
			}, q(e)))
		})]
	});
}
function An(e) {
	let t = e.paramGroups.flatMap((e) => e.params), n = t.find((e) => e.location === "header" && e.name.toLowerCase() === "x-pagination") ?? null, r = (e) => t.find((t) => t.location === "query" && t.name === e) ?? null, i = r("page"), a = r("cursor"), o = r("per_page");
	return o === null || i === null && a === null ? null : {
		mode: n,
		page: i,
		cursor: a,
		perPage: o
	};
}
function jn({ parameters: e, idPrefix: t, values: n, errors: r, onModeChange: i, onChange: a }) {
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
				children: /* @__PURE__ */ o(Wn, {
					idPrefix: t,
					param: e.mode,
					value: n.parameters[q(e.mode)] ?? "",
					error: r[q(e.mode)] ?? null,
					onChange: i
				})
			}), /* @__PURE__ */ o("div", {
				className: "flex flex-wrap items-start gap-4",
				children: c.map((e) => e === null ? null : /* @__PURE__ */ o(Wn, {
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
function Mn({ name: e, schema: t, examples: r, components: a, noSchemaMessage: c, expandDepth: l, exampleLabel: u, maxHeight: d = 2400, defaultTab: f = "schema", generateExample: p = !1 }) {
	let [m, h] = i(f), [_, v] = i(0), y = n(() => r.length > 0 || !p ? r : [{
		name: null,
		summary: null,
		description: null,
		value: E(t, a)
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
			options: ir.map(({ key: e, label: t }) => ({
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
function Nn({ requests: e, components: t, expandDepth: n }) {
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
			}), e.schema || e.examples.length > 0 ? /* @__PURE__ */ o(Mn, {
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
function Pn({ responses: e, components: t, expandDepth: n }) {
	let [r, a] = i(null);
	if (e.length === 0) return null;
	let c = [...e].sort(Fn), l = c.find((e) => w(e) === r) ?? c[0], u = c.map(w);
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
				}), /* @__PURE__ */ o("ul", { children: l.headers.map((e) => /* @__PURE__ */ o(En, { param: e }, e.name)) })]
			}) : null,
			l.schema || l.examples.length > 0 ? /* @__PURE__ */ o(Mn, {
				name: `response-${w(l)}-tab`,
				schema: l.schema,
				examples: l.examples,
				components: t,
				noSchemaMessage: "No response body.",
				expandDepth: n,
				exampleLabel: "Response example",
				maxHeight: 800,
				defaultTab: "example",
				generateExample: !0
			}, w(l)) : /* @__PURE__ */ o("p", {
				className: "text-lt-muted-fg",
				children: "No response body."
			})
		] }) : null
	] });
}
function Fn(e, t) {
	let n = e.status ?? "default", r = t.status ?? "default", i = In(n) - In(r);
	return i !== 0 || n === r ? i : n.localeCompare(r, void 0, { numeric: !0 });
}
function In(e) {
	return {
		2: 0,
		3: 1,
		4: 2,
		5: 3
	}[e[0]] ?? 4;
}
function Ln(e, t) {
	return t ? t.type === "http" && t.scheme === "bearer" ? t.bearerFormat ? `HTTP Bearer (${t.bearerFormat})` : "HTTP Bearer" : t.type === "http" && t.scheme === "basic" ? "HTTP Basic" : t.type === "apiKey" ? `API key (${t.in}: ${t.name})` : t.type === "oauth2" ? "OAuth 2.0" : t.type === "openIdConnect" ? "OpenID Connect" : e : e;
}
function Rn({ scheme: e, components: t, token: n }) {
	let r = (t?.securitySchemes ?? {})[e.name] ?? null, i = zn(r);
	return /* @__PURE__ */ s("li", {
		className: "border-b border-lt-border py-2 last:border-b-0",
		children: [
			/* @__PURE__ */ o("span", {
				className: "text-lt-fg",
				children: Ln(e.name, r)
			}),
			r?.description ? /* @__PURE__ */ o("p", {
				className: "mt-0.5 text-xs text-lt-muted-fg",
				children: r.description
			}) : null,
			/* @__PURE__ */ o("p", {
				className: "mt-0.5 text-xs text-lt-muted-fg",
				children: xt(e) ? n ? "Access token supplied by the host page." : "No access token is configured for live requests." : "This authentication scheme is not supported for live requests."
			}),
			/* @__PURE__ */ o(Bn, { flows: r?.flows }),
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
function zn(e) {
	return Object.values(e?.flows ?? {}).reduce((e, t) => ({
		...e,
		...t.scopes
	}), {});
}
function Bn({ flows: e }) {
	let t = Object.entries(e ?? {});
	return t.length === 0 ? null : /* @__PURE__ */ o("dl", {
		className: "mt-1 flex flex-col gap-0.5 text-xs text-lt-muted-fg",
		children: t.map(([e, t]) => /* @__PURE__ */ s("div", {
			className: "flex flex-wrap items-baseline gap-x-2",
			children: [/* @__PURE__ */ o("dt", {
				className: "font-medium",
				children: e
			}), ar.map(({ key: e, label: n }) => {
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
function Vn({ requirement: e, components: t, token: n }) {
	return e.schemes.length === 0 ? /* @__PURE__ */ o("p", {
		className: "text-lt-muted-fg",
		children: "Optional authentication"
	}) : /* @__PURE__ */ o("ul", { children: e.schemes.map((e) => /* @__PURE__ */ o(Rn, {
		scheme: e,
		components: t,
		token: n
	}, e.name)) });
}
function Hn({ security: e, components: t, token: n }) {
	return e.length === 0 ? null : /* @__PURE__ */ s("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ o("h2", {
			className: "mb-2 font-semibold text-lt-fg",
			children: "Authorization"
		}), e.map((e, r) => /* @__PURE__ */ s("div", { children: [r > 0 ? /* @__PURE__ */ o("p", {
			className: "my-2 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
			children: "OR"
		}) : null, /* @__PURE__ */ o(Vn, {
			requirement: e,
			components: t,
			token: n
		})] }, r))]
	});
}
function Un({ operation: a, baseUrl: c, token: l, components: u, expandDepth: d = 2, twoColumnBreakpoint: f = "lg", hideHeaderIdentity: p = !1 }) {
	let m = `${a.summary.id}-${t().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`, h = r(null), _ = r(null), [v, y] = i(() => qn(a, u)), [b, x] = i("curl"), [w, T] = i(!1), [E, ee] = i(null), O = On(a), k = An(a), A = /* @__PURE__ */ new Set([...O.flatMap((e) => e.params).map(q), ...k === null ? [] : [
		k.mode,
		k.page,
		k.cursor,
		k.perPage
	].filter((e) => e !== null).map(q)]), te = a.paramGroups.map((e) => ({
		...e,
		params: e.params.filter((e) => !A.has(q(e)))
	})).filter((e) => e.params.length > 0), j = mt(a), M = j.find((e) => e.mediaType === v.mediaType) ?? null, N = n(() => bt({
		operation: a,
		baseUrl: c,
		values: v,
		token: l
	}), [
		a,
		c,
		v,
		l
	]), P = Kn(a), F = a.requests.length > 0 && j.length === 0, I = M?.required ?? !1, ne = rr[f], L = n(() => {
		if (N.request === null) return "";
		let e = Ct(N.request);
		return b === "curl" ? Sn.generate(e) : wn.generate(e);
	}, [N, b]), R = n(() => re(a, u), [a, u]);
	e(() => () => {
		let e = _.current;
		_.current = null, e?.abort();
	}, []);
	function z(e, t) {
		let n = q(e);
		y((e) => ({
			...e,
			parameters: {
				...e.parameters,
				[n]: t
			}
		}));
	}
	function B(e) {
		if (k === null || k.mode === null) return;
		let t = k.mode;
		y((n) => {
			let r = {
				...n.parameters,
				[q(t)]: e
			};
			return e === "cursor" && k.page !== null ? r[q(k.page)] = "" : k.cursor !== null && (r[q(k.cursor)] = ""), {
				...n,
				parameters: r
			};
		});
	}
	function V(e) {
		y((t) => ({
			...t,
			body: e
		}));
	}
	function H(e) {
		let t = j.find((t) => t.mediaType === e);
		y((n) => ({
			...n,
			mediaType: e,
			body: t === void 0 ? "" : S(D(t, u))
		}));
	}
	async function ie(e) {
		if (e.preventDefault(), F) return;
		let t = bt({
			operation: a,
			baseUrl: c,
			values: v,
			token: l
		});
		if (t.errors !== null) {
			let e = Gn(a, t.errors), n = h.current?.querySelectorAll("[data-field-key]") ?? [];
			Array.from(n).find((t) => t.dataset.fieldKey === e)?.focus();
			return;
		}
		_.current?.abort();
		let n = new AbortController();
		_.current = n, T(!0);
		try {
			let e = await st(t.request, n.signal);
			_.current === n && ee(e);
		} catch (e) {
			if (!C(e)) throw e;
		} finally {
			_.current === n && (_.current = null, T(!1));
		}
	}
	return /* @__PURE__ */ s("div", {
		className: `grid min-w-0 items-start text-base ${ne.grid}`,
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
				/* @__PURE__ */ o(Hn, {
					security: a.security,
					components: u,
					token: l
				}),
				te.length > 0 || O.length > 0 || k !== null ? /* @__PURE__ */ s("section", {
					className: "mb-6",
					children: [
						/* @__PURE__ */ o("h2", {
							className: "mb-2 font-semibold text-lt-fg",
							children: "Parameters"
						}),
						O.map((e) => /* @__PURE__ */ o(kn, {
							group: e,
							idPrefix: m,
							values: v,
							errors: N.errors?.parameters ?? {},
							onChange: z
						}, e.label)),
						k === null ? null : /* @__PURE__ */ o(jn, {
							parameters: k,
							idPrefix: m,
							values: v,
							errors: N.errors?.parameters ?? {},
							onModeChange: B,
							onChange: z
						}),
						te.map((e) => /* @__PURE__ */ o(Dn, {
							group: e,
							idPrefix: m,
							values: v,
							errors: N.errors?.parameters ?? {},
							onChange: z
						}, e.location))
					]
				}) : null,
				/* @__PURE__ */ s("div", {
					className: "flex flex-col gap-6",
					children: [
						te.filter((e) => !Yn(e.location)).map((e) => {
							let t = e.params.filter((t) => Jn(e.location, t));
							return t.length === 0 ? null : /* @__PURE__ */ s("section", {
								className: "flex flex-col gap-3",
								children: [/* @__PURE__ */ s("h3", {
									className: "text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
									children: [e.location, " parameters"]
								}), /* @__PURE__ */ o("div", {
									className: "flex flex-wrap gap-4",
									children: t.map((e) => /* @__PURE__ */ o(Wn, {
										idPrefix: m,
										param: e,
										value: v.parameters[q(e)] ?? "",
										error: N.errors?.parameters[q(e)] ?? null,
										onChange: (t) => z(e, t)
									}, q(e)))
								})]
							}, e.location);
						}),
						P.length > 0 || F ? /* @__PURE__ */ s("section", {
							"aria-live": "polite",
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ o("h3", {
								className: "text-xs font-semibold uppercase tracking-wide text-lt-muted-fg",
								children: "Request limitations"
							}), /* @__PURE__ */ s("ul", {
								className: "flex flex-col gap-1 text-xs text-lt-danger",
								children: [P.map(({ key: e, name: t, message: n }) => /* @__PURE__ */ s("li", { children: [
									t,
									": ",
									n
								] }, e)), F ? /* @__PURE__ */ o("li", { children: "Only JSON request bodies can be sent from the playground." }) : null]
							})]
						}) : null,
						j.length > 0 ? /* @__PURE__ */ s("section", {
							className: "flex flex-col gap-3",
							children: [j.length > 1 ? /* @__PURE__ */ o(g.FormFieldFrame, {
								id: `${m}-request-media-type`,
								label: "Content type",
								className: "min-w-0 basis-full flex-1 sm:basis-48",
								children: (e) => /* @__PURE__ */ o(g.NativeSelect, {
									...e,
									value: v.mediaType ?? "",
									onChange: (e) => H(e.target.value),
									children: j.map((e) => /* @__PURE__ */ o("option", {
										value: e.mediaType ?? "",
										children: e.mediaType
									}, e.mediaType))
								})
							}) : null, M === null ? null : /* @__PURE__ */ o(Kt, {
								idPrefix: m,
								schema: M.schema,
								components: u,
								value: v.body,
								required: I,
								error: N.errors?.body ?? void 0,
								onChange: V
							})]
						}) : null,
						N.errors?.request ? /* @__PURE__ */ o("p", {
							className: "text-lt-danger",
							children: N.errors.request
						}) : null,
						/* @__PURE__ */ s("form", {
							onSubmit: ie,
							className: "flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ s(g.Button, {
								type: "submit",
								disabled: w || F,
								children: [w ? /* @__PURE__ */ o(g.Spinner, { className: "size-lt-icon-sm" }) : null, "Execute"]
							}), p ? null : /* @__PURE__ */ o(g.CopyButton, {
								value: R,
								label: "as Markdown",
								testId: "copy-operation-markdown",
								className: "ml-auto",
								children: "Copy as Markdown"
							})]
						}),
						/* @__PURE__ */ o(ut, { result: E })
					]
				})
			]
		}), /* @__PURE__ */ o("aside", {
			"aria-label": "Reference",
			className: `min-w-0 border-t border-lt-border p-6 ${ne.reference}`,
			children: /* @__PURE__ */ s("div", {
				className: "flex flex-col gap-6",
				children: [
					/* @__PURE__ */ o(vn, {
						idPrefix: m,
						language: b,
						snippet: L,
						onLanguageChange: x
					}),
					/* @__PURE__ */ o(Nn, {
						requests: a.requests,
						components: u,
						expandDepth: d
					}),
					/* @__PURE__ */ o(Pn, {
						responses: a.responses,
						components: u,
						expandDepth: d
					})
				]
			})
		})]
	});
}
function Wn({ idPrefix: e, param: t, value: n, error: r, onChange: a, inline: c = !1 }) {
	let l = q(t), u = `${e}-${nr(l)}`, d = Xn(t), f = Zn(d), p = n === "" ? [] : n.split(","), [m, h] = i(!1);
	function _(e) {
		a(p.includes(e) ? p.filter((t) => t !== e).join(",") : [...p, e].join(","));
	}
	return /* @__PURE__ */ o(g.FormFieldFrame, {
		id: u,
		label: t.name,
		required: t.required,
		helperText: c ? void 0 : t.description ?? void 0,
		tooltip: c ? void 0 : t.tooltip ?? void 0,
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
			type: Qn(d),
			value: n,
			required: t.required,
			min: $n(d),
			max: er(d),
			step: tr(d),
			minLength: $(d.minLength),
			maxLength: $(d.maxLength),
			pattern: typeof d.pattern == "string" ? d.pattern : void 0,
			"data-field-key": l,
			onChange: (e) => a(e.target.value)
		})
	});
}
function Gn(e, t) {
	for (let n of e.paramGroups) for (let e of n.params) {
		let r = q(e);
		if (Jn(n.location, e) && t.parameters[r] !== void 0) return r;
	}
	return t.body === null ? null : "body";
}
function Kn(e) {
	return e.paramGroups.flatMap((e) => e.params.flatMap((e) => {
		let t = q(e), n = Ot(e);
		return n === null ? [] : [{
			key: t,
			name: e.name,
			message: n
		}];
	}));
}
function qn(e, t) {
	let n = ht(e, t), r = { ...n.parameters };
	for (let t of e.paramGroups.flatMap((e) => e.params)) !t.required && Ot(t) !== null && (r[q(t)] = "");
	return {
		...n,
		parameters: r
	};
}
function Jn(e, t) {
	return [
		"path",
		"query",
		"header"
	].includes(e) && Ot(t) === null;
}
function Yn(e) {
	return e === "path" || e === "query";
}
function Xn(e) {
	return x(e.schema) ? e.schema : {};
}
function Zn(e) {
	return e.type !== "array" || !x(e.items) || !Array.isArray(e.items.enum) ? [] : e.items.enum.filter((e) => typeof e == "string");
}
function Qn(e) {
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
function $n(e) {
	return $(e.minimum) ?? $(e.exclusiveMinimum);
}
function er(e) {
	return $(e.maximum) ?? $(e.exclusiveMaximum);
}
function tr(e) {
	let t = $(e.multipleOf);
	return t === void 0 ? e.type === "integer" ? 1 : e.type === "number" ? "any" : void 0 : t;
}
function $(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : void 0;
}
function nr(e) {
	return e.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
}
var rr, ir, ar, or = f((() => {
	v(), ot(), lt(), ft(), Gt(), _e(), H(), _n(), Ht(), yt(), bn(), R(), Cn(), Tn(), T(), rr = {
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
	}, ir = [{
		key: "schema",
		label: "Schema"
	}, {
		key: "example",
		label: "Example"
	}], ar = [
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
	];
}));
//#endregion
//#region resources/js/api-reference/OperationView.tsx
function sr({ spec: e, operationId: t, baseUrl: r, token: i, expandDepth: a = 2, twoColumnBreakpoint: c = "lg", hideHeaderIdentity: l = !1 }) {
	let u = n(() => t ? W(e, t, r ?? null) : null, [
		e,
		t,
		r
	]), d = e?.components ?? null;
	return t ? u ? /* @__PURE__ */ o("div", {
		className: "min-w-0 flex-1 overflow-y-auto",
		children: /* @__PURE__ */ o(Un, {
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
var cr = f((() => {
	Ue(), or();
}));
//#endregion
//#region resources/js/api-reference/ServerPicker.tsx
function lr(e) {
	return e.description ? `${e.description} — ${e.url}` : e.url;
}
function ur({ servers: e, selectedServerUrl: t, onServerChange: n }) {
	return e.length === 0 ? null : e.length === 1 ? /* @__PURE__ */ o("p", {
		className: "truncate py-1 text-xs text-lt-muted-fg",
		title: e[0].url,
		children: lr(e[0])
	}) : /* @__PURE__ */ o(g.NativeSelect, {
		value: t ?? "",
		onChange: (e) => n(e.target.value),
		"aria-label": "Select server",
		children: e.map((e) => /* @__PURE__ */ o("option", {
			value: e.url,
			children: lr(e)
		}, e.url))
	});
}
var dr = f((() => {
	v();
}));
//#endregion
//#region resources/js/api-reference/ApiReference.tsx
function fr(e) {
	if (!e) return null;
	for (let t of e.groups) {
		let [e] = t.operationIds;
		if (e) return e;
	}
	return null;
}
function pr() {
	if (typeof window > "u") return null;
	let e = window.location.hash.slice(1);
	return e === "" ? null : e;
}
function mr({ title: e, info: t }) {
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
function hr({ spec: t = null, url: r = null, operation: c = null, tags: l = null, defaultOperation: u = null, hideHeader: d = !1, hideBaseUrl: f = !1, title: p = null, expandDepth: m = 2, twoColumnBreakpoint: h = "lg", token: _ = null, selectedOperation: v, onOperationChange: b, deepLinking: x = !0 }) {
	let S = v !== void 0, [C, w] = i(t ?? null), [T, E] = i(!!r), [ee, D] = i(null), [O, k] = i(() => x ? pr() : null), A = S ? v : O, [te, j] = i(null), [M, N] = i(null), [P, F] = i(null), [I, ne] = i({});
	e(() => {
		if (!r) return;
		let e = !0;
		return E(!0), D(null), fetch(r).then((e) => {
			if (!e.ok) throw Error(`Failed to fetch spec: ${e.status} ${e.statusText}`);
			return e.json();
		}).then((t) => {
			e && w(t);
		}).catch((t) => {
			e && D(t instanceof Error ? t.message : String(t));
		}).finally(() => {
			e && E(!1);
		}), () => {
			e = !1;
		};
	}, [r]);
	let L = n(() => C ? Te(C) : null, [C]), R = n(() => L && l?.length ? Re(L, l) : L, [L, l]), z = C?.components ?? null, B = c ?? A, V = R?.groups.find((e) => e.id === te && A && e.operationIds.includes(A))?.id ?? R?.groups.find((e) => A && e.operationIds.includes(A))?.id, H = n(() => {
		if (!C || !B) return null;
		let e = W(C, B);
		if (!e) return null;
		let t = e.usesRootServers ? P : I[B] ?? null;
		return W(C, B, t);
	}, [
		C,
		B,
		P,
		I
	]);
	e(() => {
		if (S || A !== null || !R) return;
		let e = (x ? pr() : null) ?? u ?? fr(R);
		e && k(e);
	}, [
		S,
		R,
		A,
		u,
		x
	]), e(() => {
		if (!R || R.servers.some((e) => e.url === P)) return;
		let e = R.servers[0]?.url ?? null;
		e && F(e);
	}, [R, P]), e(() => {
		if (S || !x) return;
		function e() {
			k(pr());
		}
		return window.addEventListener("hashchange", e), () => window.removeEventListener("hashchange", e);
	}, [S, x]);
	function ie(e) {
		b?.(e), !S && (k(e), x && (window.location.hash = e));
	}
	function ae(e, t) {
		let n = `${e}:${t}`;
		if (t === A && e === V && M !== n) {
			N(n);
			return;
		}
		N(null), j(e), ie(t);
	}
	function oe(e) {
		if (!B || H?.usesRootServers !== !1) {
			F(e);
			return;
		}
		ne((t) => ({
			...t,
			[B]: e
		}));
	}
	function se(e) {
		let t = W(C, e);
		if (!t) return P;
		let n = t.usesRootServers ? P : I[e] ?? null;
		return W(C, e, n)?.serverUrl ?? P;
	}
	if (T) return /* @__PURE__ */ o("div", {
		className: "p-6 text-base text-lt-muted-fg",
		children: "Loading API reference…"
	});
	if (ee) return /* @__PURE__ */ o("div", {
		className: "p-6 text-base text-lt-danger",
		children: ee
	});
	if (!C || !R) return /* @__PURE__ */ o("div", {
		className: "p-6 text-base text-lt-muted-fg",
		children: "No API specification provided."
	});
	let ce = /* @__PURE__ */ s(a, { children: [d ? null : /* @__PURE__ */ o(mr, {
		title: p,
		info: R.info
	}), H && !f ? /* @__PURE__ */ o("div", {
		className: "border-b border-lt-border py-3",
		children: /* @__PURE__ */ o(ur, {
			servers: H.servers,
			selectedServerUrl: H.serverUrl,
			onServerChange: oe
		})
	}) : null] });
	return c ? /* @__PURE__ */ o("div", {
		className: "flex w-full text-base",
		children: /* @__PURE__ */ s("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [ce, /* @__PURE__ */ o(sr, {
				spec: C,
				operationId: c,
				baseUrl: se(c),
				token: _,
				expandDepth: m,
				twoColumnBreakpoint: h
			}, c)]
		})
	}) : /* @__PURE__ */ s("div", {
		className: "flex min-w-0 w-full flex-col text-base",
		children: [ce, /* @__PURE__ */ o("div", {
			className: "flex flex-col gap-8 py-6",
			children: R.groups.map((e) => /* @__PURE__ */ s("section", {
				"aria-labelledby": `api-reference-tag-${e.id}`,
				children: [/* @__PURE__ */ o("h2", {
					id: `api-reference-tag-${e.id}`,
					className: "mb-3 font-semibold text-lt-fg",
					children: e.title
				}), /* @__PURE__ */ o("div", {
					className: "overflow-hidden rounded-lt border border-lt-border",
					children: e.operationIds.map((t) => {
						let n = R.summaries[t];
						if (!n) return null;
						let r = `${e.id}:${t}`, i = t === A && e.id === V && M !== r, a = `api-reference-operation-${e.id}-${t}`, c = se(t), l = Mt(c, n.path), u = W(C, t, c), d = u ? re(u, z) : "";
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
									onClick: () => ae(e.id, t),
									className: "absolute inset-0 z-0 cursor-pointer transition-colors hover:bg-lt-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lt-ring"
								})]
							}), i ? /* @__PURE__ */ o("div", {
								id: a,
								children: /* @__PURE__ */ o(sr, {
									spec: C,
									operationId: t,
									baseUrl: se(t),
									token: _,
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
var gr = f((() => {
	v(), b(), _e(), cr(), Ue(), Ht(), dr();
})), _r = /* @__PURE__ */ p({ default: () => vr }), vr, yr = f((() => {
	gr(), vr = ({ node: e }) => /* @__PURE__ */ o(hr, { ...e.props });
}));
//#endregion
//#region resources/js/plugin.ts
v();
var br = {
	name: "api-reference",
	components: { "api-reference": (0, g.lazyComponent)(() => Promise.resolve().then(() => (yr(), _r))) }
};
//#endregion
export { br as default };
