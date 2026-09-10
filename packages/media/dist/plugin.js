import * as e from "react";
import t, { Suspense as n, createContext as r, createElement as i, createRef as a, forwardRef as o, lazy as s, memo as c, useContext as l, useMemo as u, useRef as d, useState as f, version as p } from "react";
import m, { flushSync as h } from "react-dom";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var y = Object.defineProperty, b = Object.getOwnPropertyDescriptor, x = Object.getOwnPropertyNames, S = Object.prototype.hasOwnProperty, C = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, w = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), T = (e, t) => {
	let n = {};
	for (var r in e) y(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || y(n, Symbol.toStringTag, { value: "Module" }), n;
}, E = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = x(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !S.call(e, s) && s !== n && y(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = b(t, s)) || r.enumerable
	});
	return e;
}, ee = (e, t, n) => (E(e, t, "default"), n && E(n, t, "default")), D = /* @__PURE__ */ T({});
import * as te from "@lattice-php/lattice/runtime";
ee(D, te);
var O = C((() => {}));
//#endregion
//#region ../../node_modules/@tiptap/core/dist/rolldown-runtime-D7D4PA-g.js
O();
var ne = Object.defineProperty, re = (e, t) => {
	let n = {};
	for (var r in e) ne(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || ne(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region ../../node_modules/orderedmap/dist/index.js
function k(e) {
	this.content = e;
}
k.prototype = {
	constructor: k,
	find: function(e) {
		for (var t = 0; t < this.content.length; t += 2) if (this.content[t] === e) return t;
		return -1;
	},
	get: function(e) {
		var t = this.find(e);
		return t == -1 ? void 0 : this.content[t + 1];
	},
	update: function(e, t, n) {
		var r = n && n != e ? this.remove(n) : this, i = r.find(e), a = r.content.slice();
		return i == -1 ? a.push(n || e, t) : (a[i + 1] = t, n && (a[i] = n)), new k(a);
	},
	remove: function(e) {
		var t = this.find(e);
		if (t == -1) return this;
		var n = this.content.slice();
		return n.splice(t, 2), new k(n);
	},
	addToStart: function(e, t) {
		return new k([e, t].concat(this.remove(e).content));
	},
	addToEnd: function(e, t) {
		var n = this.remove(e).content.slice();
		return n.push(e, t), new k(n);
	},
	addBefore: function(e, t, n) {
		var r = this.remove(t), i = r.content.slice(), a = r.find(e);
		return i.splice(a == -1 ? i.length : a, 0, t, n), new k(i);
	},
	forEach: function(e) {
		for (var t = 0; t < this.content.length; t += 2) e(this.content[t], this.content[t + 1]);
	},
	prepend: function(e) {
		return e = k.from(e), e.size ? new k(e.content.concat(this.subtract(e).content)) : this;
	},
	append: function(e) {
		return e = k.from(e), e.size ? new k(this.subtract(e).content.concat(e.content)) : this;
	},
	subtract: function(e) {
		var t = this;
		e = k.from(e);
		for (var n = 0; n < e.content.length; n += 2) t = t.remove(e.content[n]);
		return t;
	},
	toObject: function() {
		var e = {};
		return this.forEach(function(t, n) {
			e[t] = n;
		}), e;
	},
	get size() {
		return this.content.length >> 1;
	}
}, k.from = function(e) {
	if (e instanceof k) return e;
	var t = [];
	if (e) for (var n in e) t.push(n, e[n]);
	return new k(t);
};
//#endregion
//#region ../../node_modules/prosemirror-model/dist/index.js
function ie(e, t, n) {
	for (let r = 0;; r++) {
		if (r == e.childCount || r == t.childCount) return e.childCount == t.childCount ? null : n;
		let i = e.child(r), a = t.child(r);
		if (i == a) {
			n += i.nodeSize;
			continue;
		}
		if (!i.sameMarkup(a)) return n;
		if (i.isText && i.text != a.text) {
			let e = i.text, t = a.text, r = 0;
			for (; e[r] == t[r]; r++) n++;
			return r && r < e.length && r < t.length && se(e.charCodeAt(r - 1)) && oe(e.charCodeAt(r)) && n--, n;
		}
		if (i.content.size || a.content.size) {
			let e = ie(i.content, a.content, n + 1);
			if (e != null) return e;
		}
		n += i.nodeSize;
	}
}
function ae(e, t, n, r) {
	for (let i = e.childCount, a = t.childCount;;) {
		if (i == 0 || a == 0) return i == a ? null : {
			a: n,
			b: r
		};
		let o = e.child(--i), s = t.child(--a), c = o.nodeSize;
		if (o == s) {
			n -= c, r -= c;
			continue;
		}
		if (!o.sameMarkup(s)) return {
			a: n,
			b: r
		};
		if (o.isText && o.text != s.text) {
			let e = o.text, t = s.text, i = e.length, a = t.length;
			for (; i > 0 && a > 0 && e[i - 1] == t[a - 1];) i--, a--, n--, r--;
			return i && a && i < e.length && se(e.charCodeAt(i - 1)) && oe(e.charCodeAt(i)) && (n++, r++), {
				a: n,
				b: r
			};
		}
		if (o.content.size || s.content.size) {
			let e = ae(o.content, s.content, n - 1, r - 1);
			if (e) return e;
		}
		n -= c, r -= c;
	}
}
function oe(e) {
	return e >= 56320 && e < 57344;
}
function se(e) {
	return e >= 55296 && e < 56320;
}
var A = class e {
	constructor(e, t) {
		if (this.content = e, this.size = t || 0, t == null) for (let t = 0; t < e.length; t++) this.size += e[t].nodeSize;
	}
	nodesBetween(e, t, n, r = 0, i) {
		for (let a = 0, o = 0; o < t; a++) {
			let s = this.content[a], c = o + s.nodeSize;
			if (c > e && n(s, r + o, i || null, a) !== !1 && s.content.size) {
				let i = o + 1;
				s.nodesBetween(Math.max(0, e - i), Math.min(s.content.size, t - i), n, r + i);
			}
			o = c;
		}
	}
	descendants(e) {
		this.nodesBetween(0, this.size, e);
	}
	textBetween(e, t, n, r) {
		let i = "", a = !0;
		return this.nodesBetween(e, t, (o, s) => {
			let c = o.isText ? o.text.slice(Math.max(e, s) - s, t - s) : o.isLeaf ? r ? typeof r == "function" ? r(o) : r : o.type.spec.leafText ? o.type.spec.leafText(o) : "" : "";
			o.isBlock && (o.isLeaf && c || o.isTextblock) && n && (a ? a = !1 : i += n), i += c;
		}, 0), i;
	}
	append(t) {
		if (!t.size) return this;
		if (!this.size) return t;
		let n = this.lastChild, r = t.firstChild, i = this.content.slice(), a = 0;
		for (n.isText && n.sameMarkup(r) && (i[i.length - 1] = n.withText(n.text + r.text), a = 1); a < t.content.length; a++) i.push(t.content[a]);
		return new e(i, this.size + t.size);
	}
	cut(t, n = this.size) {
		if (t == 0 && n == this.size) return this;
		let r = [], i = 0;
		if (n > t) for (let e = 0, a = 0; a < n; e++) {
			let o = this.content[e], s = a + o.nodeSize;
			s > t && ((a < t || s > n) && (o = o.isText ? o.cut(Math.max(0, t - a), Math.min(o.text.length, n - a)) : o.cut(Math.max(0, t - a - 1), Math.min(o.content.size, n - a - 1))), r.push(o), i += o.nodeSize), a = s;
		}
		return new e(r, i);
	}
	cutByIndex(t, n) {
		return t == n ? e.empty : t == 0 && n == this.content.length ? this : new e(this.content.slice(t, n));
	}
	replaceChild(t, n) {
		let r = this.content[t];
		if (r == n) return this;
		let i = this.content.slice(), a = this.size + n.nodeSize - r.nodeSize;
		return i[t] = n, new e(i, a);
	}
	addToStart(t) {
		return new e([t].concat(this.content), this.size + t.nodeSize);
	}
	addToEnd(t) {
		return new e(this.content.concat(t), this.size + t.nodeSize);
	}
	eq(e) {
		if (this.content.length != e.content.length) return !1;
		for (let t = 0; t < this.content.length; t++) if (!this.content[t].eq(e.content[t])) return !1;
		return !0;
	}
	get firstChild() {
		return this.content.length ? this.content[0] : null;
	}
	get lastChild() {
		return this.content.length ? this.content[this.content.length - 1] : null;
	}
	get childCount() {
		return this.content.length;
	}
	child(e) {
		let t = this.content[e];
		if (!t) throw RangeError("Index " + e + " out of range for " + this);
		return t;
	}
	maybeChild(e) {
		return this.content[e] || null;
	}
	forEach(e) {
		for (let t = 0, n = 0; t < this.content.length; t++) {
			let r = this.content[t];
			e(r, n, t), n += r.nodeSize;
		}
	}
	findDiffStart(e, t = 0) {
		return ie(this, e, t);
	}
	findDiffEnd(e, t = this.size, n = e.size) {
		return ae(this, e, t, n);
	}
	findIndex(e) {
		if (e == 0) return j(0, e);
		if (e == this.size) return j(this.content.length, e);
		if (e > this.size || e < 0) throw RangeError(`Position ${e} outside of fragment (${this})`);
		for (let t = 0, n = 0;; t++) {
			let r = this.child(t), i = n + r.nodeSize;
			if (i >= e) return i == e ? j(t + 1, i) : j(t, n);
			n = i;
		}
	}
	toString() {
		return "<" + this.toStringInner() + ">";
	}
	toStringInner() {
		return this.content.join(", ");
	}
	toJSON() {
		return this.content.length ? this.content.map((e) => e.toJSON()) : null;
	}
	static fromJSON(t, n) {
		if (!n) return e.empty;
		if (!Array.isArray(n)) throw RangeError("Invalid input for Fragment.fromJSON");
		return e.fromArray(n.map(t.nodeFromJSON));
	}
	static fromArray(t) {
		if (!t.length) return e.empty;
		let n, r = 0;
		for (let e = 0; e < t.length; e++) {
			let i = t[e];
			r += i.nodeSize, e && i.isText && t[e - 1].sameMarkup(i) ? (n ||= t.slice(0, e), n[n.length - 1] = i.withText(n[n.length - 1].text + i.text)) : n && n.push(i);
		}
		return new e(n || t, r);
	}
	static from(t) {
		if (!t) return e.empty;
		if (t instanceof e) return t;
		if (Array.isArray(t)) return this.fromArray(t);
		if (t.attrs) return new e([t], t.nodeSize);
		throw RangeError("Can not convert " + t + " to a Fragment" + (t.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
	}
};
A.empty = new A([], 0);
var ce = {
	index: 0,
	offset: 0
};
function j(e, t) {
	return ce.index = e, ce.offset = t, ce;
}
function le(e, t) {
	if (e === t) return !0;
	if (!(e && typeof e == "object") || !(t && typeof t == "object")) return !1;
	let n = Array.isArray(e);
	if (Array.isArray(t) != n) return !1;
	if (n) {
		if (e.length != t.length) return !1;
		for (let n = 0; n < e.length; n++) if (!le(e[n], t[n])) return !1;
	} else {
		for (let n in e) if (!(n in t) || !le(e[n], t[n])) return !1;
		for (let n in t) if (!(n in e)) return !1;
	}
	return !0;
}
var M = class e {
	constructor(e, t) {
		this.type = e, this.attrs = t;
	}
	addToSet(e) {
		let t, n = !1;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (this.eq(i)) return e;
			if (this.type.excludes(i.type)) t ||= e.slice(0, r);
			else if (i.type.excludes(this.type)) return e;
			else !n && i.type.rank > this.type.rank && (t ||= e.slice(0, r), t.push(this), n = !0), t && t.push(i);
		}
		return t ||= e.slice(), n || t.push(this), t;
	}
	removeFromSet(e) {
		for (let t = 0; t < e.length; t++) if (this.eq(e[t])) return e.slice(0, t).concat(e.slice(t + 1));
		return e;
	}
	isInSet(e) {
		for (let t = 0; t < e.length; t++) if (this.eq(e[t])) return !0;
		return !1;
	}
	eq(e) {
		return this == e || this.type == e.type && le(this.attrs, e.attrs);
	}
	toJSON() {
		let e = { type: this.type.name };
		for (let t in this.attrs) {
			e.attrs = this.attrs;
			break;
		}
		return e;
	}
	static fromJSON(e, t) {
		if (!t) throw RangeError("Invalid input for Mark.fromJSON");
		let n = e.marks[t.type];
		if (!n) throw RangeError(`There is no mark type ${t.type} in this schema`);
		let r = n.create(t.attrs);
		return n.checkAttrs(r.attrs), r;
	}
	static sameSet(e, t) {
		if (e == t) return !0;
		if (e.length != t.length) return !1;
		for (let n = 0; n < e.length; n++) if (!e[n].eq(t[n])) return !1;
		return !0;
	}
	static setFrom(t) {
		if (!t || Array.isArray(t) && t.length == 0) return e.none;
		if (t instanceof e) return [t];
		let n = t.slice();
		return n.sort((e, t) => e.type.rank - t.type.rank), n;
	}
};
M.none = [];
var ue = class extends Error {}, N = class e {
	constructor(e, t, n) {
		this.content = e, this.openStart = t, this.openEnd = n;
	}
	get size() {
		return this.content.size - this.openStart - this.openEnd;
	}
	insertAt(t, n) {
		let r = fe(this.content, t + this.openStart, n, this.openStart + 1, this.openEnd + 1);
		return r && new e(r, this.openStart, this.openEnd);
	}
	removeBetween(t, n) {
		return new e(de(this.content, t + this.openStart, n + this.openStart), this.openStart, this.openEnd);
	}
	eq(e) {
		return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
	}
	toString() {
		return this.content + "(" + this.openStart + "," + this.openEnd + ")";
	}
	toJSON() {
		if (!this.content.size) return null;
		let e = { content: this.content.toJSON() };
		return this.openStart > 0 && (e.openStart = this.openStart), this.openEnd > 0 && (e.openEnd = this.openEnd), e;
	}
	static fromJSON(t, n) {
		if (!n) return e.empty;
		let r = n.openStart || 0, i = n.openEnd || 0;
		if (typeof r != "number" || typeof i != "number") throw RangeError("Invalid input for Slice.fromJSON");
		return new e(A.fromJSON(t, n.content), r, i);
	}
	static maxOpen(t, n = !0) {
		let r = 0, i = 0;
		for (let e = t.firstChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.firstChild) r++;
		for (let e = t.lastChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.lastChild) i++;
		return new e(t, r, i);
	}
};
N.empty = new N(A.empty, 0, 0);
function de(e, t, n) {
	let { index: r, offset: i } = e.findIndex(t), a = e.maybeChild(r), { index: o, offset: s } = e.findIndex(n);
	if (i == t || a.isText) {
		if (s != n && !e.child(o).isText) throw RangeError("Removing non-flat range");
		return e.cut(0, t).append(e.cut(n));
	}
	if (r != o) throw RangeError("Removing non-flat range");
	return e.replaceChild(r, a.copy(de(a.content, t - i - 1, n - i - 1)));
}
function fe(e, t, n, r, i, a) {
	let { index: o, offset: s } = e.findIndex(t), c = e.maybeChild(o);
	if (s == t || c.isText) return a && r <= 0 && i <= 0 && !a.canReplace(o, o, n) ? null : e.cut(0, t).append(n).append(e.cut(t));
	let l = fe(c.content, t - s - 1, n, o == 0 ? r - 1 : 0, o == e.childCount - 1 ? i - 1 : 0, c);
	return l && e.replaceChild(o, c.copy(l));
}
function pe(e, t, n) {
	if (n.openStart > e.depth) throw new ue("Inserted content deeper than insertion position");
	if (e.depth - n.openStart != t.depth - n.openEnd) throw new ue("Inconsistent open depths");
	return me(e, t, n, 0);
}
function me(e, t, n, r) {
	let i = e.index(r), a = e.node(r);
	if (i == t.index(r) && r < e.depth - n.openStart) {
		let o = me(e, t, n, r + 1);
		return a.copy(a.content.replaceChild(i, o));
	}
	if (!n.content.size) return ye(a, xe(e, t, r));
	if (!n.openStart && !n.openEnd && e.depth == r && t.depth == r) {
		let r = e.parent, i = r.content;
		return ye(r, i.cut(0, e.parentOffset).append(n.content).append(i.cut(t.parentOffset)));
	}
	{
		let { start: i, end: o } = Se(n, e);
		return ye(a, be(e, i, o, t, r));
	}
}
function he(e, t) {
	if (!t.type.compatibleContent(e.type)) throw new ue("Cannot join " + t.type.name + " onto " + e.type.name);
}
function ge(e, t, n) {
	let r = e.node(n);
	return he(r, t.node(n)), r;
}
function _e(e, t) {
	let n = t.length - 1;
	n >= 0 && e.isText && e.sameMarkup(t[n]) ? t[n] = e.withText(t[n].text + e.text) : t.push(e);
}
function ve(e, t, n, r) {
	let i = (t || e).node(n), a = 0, o = t ? t.index(n) : i.childCount;
	e && (a = e.index(n), e.depth > n ? a++ : e.textOffset && (_e(e.nodeAfter, r), a++));
	for (let e = a; e < o; e++) _e(i.child(e), r);
	t && t.depth == n && t.textOffset && _e(t.nodeBefore, r);
}
function ye(e, t) {
	if (!e.type.validContent(t)) throw new ue("Invalid content for node " + e.type.name);
	return e.copy(t);
}
function be(e, t, n, r, i) {
	let a = e.depth > i && ge(e, t, i + 1), o = r.depth > i && ge(n, r, i + 1), s = [];
	return ve(null, e, i, s), a && o && t.index(i) == n.index(i) ? (he(a, o), _e(ye(a, be(e, t, n, r, i + 1)), s)) : (a && _e(ye(a, xe(e, t, i + 1)), s), ve(t, n, i, s), o && _e(ye(o, xe(n, r, i + 1)), s)), ve(r, null, i, s), new A(s);
}
function xe(e, t, n) {
	let r = [];
	return ve(null, e, n, r), e.depth > n && _e(ye(ge(e, t, n + 1), xe(e, t, n + 1)), r), ve(t, null, n, r), new A(r);
}
function Se(e, t) {
	let n = t.depth - e.openStart, r = t.node(n).copy(e.content);
	for (let e = n - 1; e >= 0; e--) r = t.node(e).copy(A.from(r));
	return {
		start: r.resolveNoCache(e.openStart + n),
		end: r.resolveNoCache(r.content.size - e.openEnd - n)
	};
}
var Ce = class e {
	constructor(e, t, n) {
		this.pos = e, this.path = t, this.parentOffset = n, this.depth = t.length / 3 - 1;
	}
	resolveDepth(e) {
		return e == null ? this.depth : e < 0 ? this.depth + e : e;
	}
	get parent() {
		return this.node(this.depth);
	}
	get doc() {
		return this.node(0);
	}
	node(e) {
		return this.path[this.resolveDepth(e) * 3];
	}
	index(e) {
		return this.path[this.resolveDepth(e) * 3 + 1];
	}
	indexAfter(e) {
		return e = this.resolveDepth(e), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1);
	}
	start(e) {
		return e = this.resolveDepth(e), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
	}
	end(e) {
		return e = this.resolveDepth(e), this.start(e) + this.node(e).content.size;
	}
	before(e) {
		if (e = this.resolveDepth(e), !e) throw RangeError("There is no position before the top-level node");
		return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
	}
	after(e) {
		if (e = this.resolveDepth(e), !e) throw RangeError("There is no position after the top-level node");
		return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
	}
	get textOffset() {
		return this.pos - this.path[this.path.length - 1];
	}
	get nodeAfter() {
		let e = this.parent, t = this.index(this.depth);
		if (t == e.childCount) return null;
		let n = this.pos - this.path[this.path.length - 1], r = e.child(t);
		return n ? e.child(t).cut(n) : r;
	}
	get nodeBefore() {
		let e = this.index(this.depth), t = this.pos - this.path[this.path.length - 1];
		return t ? this.parent.child(e).cut(0, t) : e == 0 ? null : this.parent.child(e - 1);
	}
	posAtIndex(e, t) {
		t = this.resolveDepth(t);
		let n = this.path[t * 3], r = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
		for (let t = 0; t < e; t++) r += n.child(t).nodeSize;
		return r;
	}
	marks() {
		let e = this.parent, t = this.index();
		if (e.content.size == 0) return M.none;
		if (this.textOffset) return e.child(t).marks;
		let n = e.maybeChild(t - 1), r = e.maybeChild(t);
		if (!n) {
			let e = n;
			n = r, r = e;
		}
		let i = n.marks;
		for (var a = 0; a < i.length; a++) i[a].type.spec.inclusive === !1 && (!r || !i[a].isInSet(r.marks)) && (i = i[a--].removeFromSet(i));
		return i;
	}
	marksAcross(e) {
		let t = this.parent.maybeChild(this.index());
		if (!t || !t.isInline) return null;
		let n = t.marks, r = e.parent.maybeChild(e.index());
		for (var i = 0; i < n.length; i++) n[i].type.spec.inclusive === !1 && (!r || !n[i].isInSet(r.marks)) && (n = n[i--].removeFromSet(n));
		return n;
	}
	sharedDepth(e) {
		for (let t = this.depth; t > 0; t--) if (this.start(t) <= e && this.end(t) >= e) return t;
		return 0;
	}
	blockRange(e = this, t) {
		if (e.pos < this.pos) return e.blockRange(this);
		for (let n = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); n >= 0; n--) if (e.pos <= this.end(n) && (!t || t(this.node(n)))) return new De(this, e, n);
		return null;
	}
	sameParent(e) {
		return this.pos - this.parentOffset == e.pos - e.parentOffset;
	}
	max(e) {
		return e.pos > this.pos ? e : this;
	}
	min(e) {
		return e.pos < this.pos ? e : this;
	}
	toString() {
		let e = "";
		for (let t = 1; t <= this.depth; t++) e += (e ? "/" : "") + this.node(t).type.name + "_" + this.index(t - 1);
		return e + ":" + this.parentOffset;
	}
	static resolve(t, n) {
		if (!(n >= 0 && n <= t.content.size)) throw RangeError("Position " + n + " out of range");
		let r = [], i = 0, a = n;
		for (let e = t;;) {
			let { index: t, offset: n } = e.content.findIndex(a), o = a - n;
			if (r.push(e, t, i + n), !o || (e = e.child(t), e.isText)) break;
			a = o - 1, i += n + 1;
		}
		return new e(n, r, a);
	}
	static resolveCached(t, n) {
		let r = Ee.get(t);
		if (r) for (let e = 0; e < r.elts.length; e++) {
			let t = r.elts[e];
			if (t.pos == n) return t;
		}
		else Ee.set(t, r = new we());
		let i = r.elts[r.i] = e.resolve(t, n);
		return r.i = (r.i + 1) % Te, i;
	}
}, we = class {
	constructor() {
		this.elts = [], this.i = 0;
	}
}, Te = 12, Ee = /* @__PURE__ */ new WeakMap(), De = class {
	constructor(e, t, n) {
		this.$from = e, this.$to = t, this.depth = n;
	}
	get start() {
		return this.$from.before(this.depth + 1);
	}
	get end() {
		return this.$to.after(this.depth + 1);
	}
	get parent() {
		return this.$from.node(this.depth);
	}
	get startIndex() {
		return this.$from.index(this.depth);
	}
	get endIndex() {
		return this.$to.indexAfter(this.depth);
	}
}, Oe = Object.create(null), ke = class e {
	constructor(e, t, n, r = M.none) {
		this.type = e, this.attrs = t, this.marks = r, this.content = n || A.empty;
	}
	get children() {
		return this.content.content;
	}
	get nodeSize() {
		return this.isLeaf ? 1 : 2 + this.content.size;
	}
	get childCount() {
		return this.content.childCount;
	}
	child(e) {
		return this.content.child(e);
	}
	maybeChild(e) {
		return this.content.maybeChild(e);
	}
	forEach(e) {
		this.content.forEach(e);
	}
	nodesBetween(e, t, n, r = 0) {
		this.content.nodesBetween(e, t, n, r, this);
	}
	descendants(e) {
		this.nodesBetween(0, this.content.size, e);
	}
	get textContent() {
		return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
	}
	textBetween(e, t, n, r) {
		return this.content.textBetween(e, t, n, r);
	}
	get firstChild() {
		return this.content.firstChild;
	}
	get lastChild() {
		return this.content.lastChild;
	}
	eq(e) {
		return this == e || this.sameMarkup(e) && this.content.eq(e.content);
	}
	sameMarkup(e) {
		return this.hasMarkup(e.type, e.attrs, e.marks);
	}
	hasMarkup(e, t, n) {
		return this.type == e && le(this.attrs, t || e.defaultAttrs || Oe) && M.sameSet(this.marks, n || M.none);
	}
	copy(t = null) {
		return t == this.content ? this : new e(this.type, this.attrs, t, this.marks);
	}
	mark(t) {
		return t == this.marks ? this : new e(this.type, this.attrs, this.content, t);
	}
	cut(e, t = this.content.size) {
		return e == 0 && t == this.content.size ? this : this.copy(this.content.cut(e, t));
	}
	slice(e, t = this.content.size, n = !1) {
		if (e == t) return N.empty;
		let r = this.resolve(e), i = this.resolve(t), a = n ? 0 : r.sharedDepth(t), o = r.start(a);
		return new N(r.node(a).content.cut(r.pos - o, i.pos - o), r.depth - a, i.depth - a);
	}
	replace(e, t, n) {
		return pe(this.resolve(e), this.resolve(t), n);
	}
	nodeAt(e) {
		for (let t = this;;) {
			let { index: n, offset: r } = t.content.findIndex(e);
			if (t = t.maybeChild(n), !t) return null;
			if (r == e || t.isText) return t;
			e -= r + 1;
		}
	}
	childAfter(e) {
		let { index: t, offset: n } = this.content.findIndex(e);
		return {
			node: this.content.maybeChild(t),
			index: t,
			offset: n
		};
	}
	childBefore(e) {
		if (e == 0) return {
			node: null,
			index: 0,
			offset: 0
		};
		let { index: t, offset: n } = this.content.findIndex(e);
		if (n < e) return {
			node: this.content.child(t),
			index: t,
			offset: n
		};
		let r = this.content.child(t - 1);
		return {
			node: r,
			index: t - 1,
			offset: n - r.nodeSize
		};
	}
	resolve(e) {
		return Ce.resolveCached(this, e);
	}
	resolveNoCache(e) {
		return Ce.resolve(this, e);
	}
	rangeHasMark(e, t, n) {
		let r = !1;
		return t > e && this.nodesBetween(e, t, (e) => (n.isInSet(e.marks) && (r = !0), !r)), r;
	}
	get isBlock() {
		return this.type.isBlock;
	}
	get isTextblock() {
		return this.type.isTextblock;
	}
	get inlineContent() {
		return this.type.inlineContent;
	}
	get isInline() {
		return this.type.isInline;
	}
	get isText() {
		return this.type.isText;
	}
	get isLeaf() {
		return this.type.isLeaf;
	}
	get isAtom() {
		return this.type.isAtom;
	}
	toString() {
		if (this.type.spec.toDebugString) return this.type.spec.toDebugString(this);
		let e = this.type.name;
		return this.content.size && (e += "(" + this.content.toStringInner() + ")"), je(this.marks, e);
	}
	contentMatchAt(e) {
		let t = this.type.contentMatch.matchFragment(this.content, 0, e);
		if (!t) throw Error("Called contentMatchAt on a node with invalid content");
		return t;
	}
	canReplace(e, t, n = A.empty, r = 0, i = n.childCount) {
		let a = this.contentMatchAt(e).matchFragment(n, r, i), o = a && a.matchFragment(this.content, t);
		if (!o || !o.validEnd) return !1;
		for (let e = r; e < i; e++) if (!this.type.allowsMarks(n.child(e).marks)) return !1;
		return !0;
	}
	canReplaceWith(e, t, n, r) {
		if (r && !this.type.allowsMarks(r)) return !1;
		let i = this.contentMatchAt(e).matchType(n), a = i && i.matchFragment(this.content, t);
		return a ? a.validEnd : !1;
	}
	canAppend(e) {
		return e.content.size ? this.canReplace(this.childCount, this.childCount, e.content) : this.type.compatibleContent(e.type);
	}
	check() {
		this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
		let e = M.none;
		for (let t = 0; t < this.marks.length; t++) {
			let n = this.marks[t];
			n.type.checkAttrs(n.attrs), e = n.addToSet(e);
		}
		if (!M.sameSet(e, this.marks)) throw RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((e) => e.type.name)}`);
		this.content.forEach((e) => e.check());
	}
	toJSON() {
		let e = { type: this.type.name };
		for (let t in this.attrs) {
			e.attrs = this.attrs;
			break;
		}
		return this.content.size && (e.content = this.content.toJSON()), this.marks.length && (e.marks = this.marks.map((e) => e.toJSON())), e;
	}
	static fromJSON(e, t) {
		if (!t) throw RangeError("Invalid input for Node.fromJSON");
		let n;
		if (t.marks) {
			if (!Array.isArray(t.marks)) throw RangeError("Invalid mark data for Node.fromJSON");
			n = t.marks.map(e.markFromJSON);
		}
		if (t.type == "text") {
			if (typeof t.text != "string") throw RangeError("Invalid text node in JSON");
			return e.text(t.text, n);
		}
		let r = A.fromJSON(e, t.content), i = e.nodeType(t.type).create(t.attrs, r, n);
		return i.type.checkAttrs(i.attrs), i;
	}
};
ke.prototype.text = void 0;
var Ae = class e extends ke {
	constructor(e, t, n, r) {
		if (super(e, t, null, r), !n) throw RangeError("Empty text nodes are not allowed");
		this.text = n;
	}
	toString() {
		return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : je(this.marks, JSON.stringify(this.text));
	}
	get textContent() {
		return this.text;
	}
	textBetween(e, t) {
		return this.text.slice(e, t);
	}
	get nodeSize() {
		return this.text.length;
	}
	mark(t) {
		return t == this.marks ? this : new e(this.type, this.attrs, this.text, t);
	}
	withText(t) {
		return t == this.text ? this : new e(this.type, this.attrs, t, this.marks);
	}
	cut(e = 0, t = this.text.length) {
		return e == 0 && t == this.text.length ? this : this.withText(this.text.slice(e, t));
	}
	eq(e) {
		return this.sameMarkup(e) && this.text == e.text;
	}
	toJSON() {
		let e = super.toJSON();
		return e.text = this.text, e;
	}
};
function je(e, t) {
	for (let n = e.length - 1; n >= 0; n--) t = e[n].type.name + "(" + t + ")";
	return t;
}
var Me = class e {
	constructor(e) {
		this.validEnd = e, this.next = [], this.wrapCache = [];
	}
	static parse(t, n) {
		let r = new Ne(t, n);
		if (r.next == null) return e.empty;
		let i = Pe(r);
		r.next && r.err("Unexpected trailing text");
		let a = We(Ve(i));
		return Ge(a, r), a;
	}
	matchType(e) {
		for (let t = 0; t < this.next.length; t++) if (this.next[t].type == e) return this.next[t].next;
		return null;
	}
	matchFragment(e, t = 0, n = e.childCount) {
		let r = this;
		for (let i = t; r && i < n; i++) r = r.matchType(e.child(i).type);
		return r;
	}
	get inlineContent() {
		return this.next.length != 0 && this.next[0].type.isInline;
	}
	get defaultType() {
		for (let e = 0; e < this.next.length; e++) {
			let { type: t } = this.next[e];
			if (!(t.isText || t.hasRequiredAttrs())) return t;
		}
		return null;
	}
	compatible(e) {
		for (let t = 0; t < this.next.length; t++) for (let n = 0; n < e.next.length; n++) if (this.next[t].type == e.next[n].type) return !0;
		return !1;
	}
	fillBefore(e, t = !1, n = 0) {
		let r = [this];
		function i(a, o) {
			let s = a.matchFragment(e, n);
			if (s && (!t || s.validEnd)) return A.from(o.map((e) => e.createAndFill()));
			for (let e = 0; e < a.next.length; e++) {
				let { type: t, next: n } = a.next[e];
				if (!(t.isText || t.hasRequiredAttrs()) && r.indexOf(n) == -1) {
					r.push(n);
					let e = i(n, o.concat(t));
					if (e) return e;
				}
			}
			return null;
		}
		return i(this, []);
	}
	findWrapping(e) {
		for (let t = 0; t < this.wrapCache.length; t += 2) if (this.wrapCache[t] == e) return this.wrapCache[t + 1];
		let t = this.computeWrapping(e);
		return this.wrapCache.push(e, t), t;
	}
	computeWrapping(e) {
		let t = Object.create(null), n = [{
			match: this,
			type: null,
			via: null
		}];
		for (; n.length;) {
			let r = n.shift(), i = r.match;
			if (i.matchType(e)) {
				let e = [];
				for (let t = r; t.type; t = t.via) e.push(t.type);
				return e.reverse();
			}
			for (let e = 0; e < i.next.length; e++) {
				let { type: a, next: o } = i.next[e];
				!a.isLeaf && !a.hasRequiredAttrs() && !(a.name in t) && (!r.type || o.validEnd) && (n.push({
					match: a.contentMatch,
					type: a,
					via: r
				}), t[a.name] = !0);
			}
		}
		return null;
	}
	get edgeCount() {
		return this.next.length;
	}
	edge(e) {
		if (e >= this.next.length) throw RangeError(`There's no ${e}th edge in this content match`);
		return this.next[e];
	}
	toString() {
		let e = [];
		function t(n) {
			e.push(n);
			for (let r = 0; r < n.next.length; r++) e.indexOf(n.next[r].next) == -1 && t(n.next[r].next);
		}
		return t(this), e.map((t, n) => {
			let r = n + (t.validEnd ? "*" : " ") + " ";
			for (let n = 0; n < t.next.length; n++) r += (n ? ", " : "") + t.next[n].type.name + "->" + e.indexOf(t.next[n].next);
			return r;
		}).join("\n");
	}
};
Me.empty = new Me(!0);
var Ne = class {
	constructor(e, t) {
		this.string = e, this.nodeTypes = t, this.inline = null, this.pos = 0, this.tokens = e.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
	}
	get next() {
		return this.tokens[this.pos];
	}
	eat(e) {
		return this.next == e && (this.pos++ || !0);
	}
	err(e) {
		throw SyntaxError(e + " (in content expression '" + this.string + "')");
	}
};
function Pe(e) {
	let t = [];
	do
		t.push(Fe(e));
	while (e.eat("|"));
	return t.length == 1 ? t[0] : {
		type: "choice",
		exprs: t
	};
}
function Fe(e) {
	let t = [];
	do
		t.push(Ie(e));
	while (e.next && e.next != ")" && e.next != "|");
	return t.length == 1 ? t[0] : {
		type: "seq",
		exprs: t
	};
}
function Ie(e) {
	let t = Be(e);
	for (;;) if (e.eat("+")) t = {
		type: "plus",
		expr: t
	};
	else if (e.eat("*")) t = {
		type: "star",
		expr: t
	};
	else if (e.eat("?")) t = {
		type: "opt",
		expr: t
	};
	else if (e.eat("{")) t = Re(e, t);
	else break;
	return t;
}
function Le(e) {
	/\D/.test(e.next) && e.err("Expected number, got '" + e.next + "'");
	let t = Number(e.next);
	return e.pos++, t;
}
function Re(e, t) {
	let n = Le(e), r = n;
	return e.eat(",") && (r = e.next == "}" ? -1 : Le(e)), e.eat("}") || e.err("Unclosed braced range"), {
		type: "range",
		min: n,
		max: r,
		expr: t
	};
}
function ze(e, t) {
	let n = e.nodeTypes, r = n[t];
	if (r) return [r];
	let i = [];
	for (let e in n) {
		let r = n[e];
		r.isInGroup(t) && i.push(r);
	}
	return i.length == 0 && e.err("No node type or group '" + t + "' found"), i;
}
function Be(e) {
	if (e.eat("(")) {
		let t = Pe(e);
		return e.eat(")") || e.err("Missing closing paren"), t;
	}
	if (/\W/.test(e.next)) e.err("Unexpected token '" + e.next + "'");
	else {
		let t = ze(e, e.next).map((t) => (e.inline == null ? e.inline = t.isInline : e.inline != t.isInline && e.err("Mixing inline and block content"), {
			type: "name",
			value: t
		}));
		return e.pos++, t.length == 1 ? t[0] : {
			type: "choice",
			exprs: t
		};
	}
}
function Ve(e) {
	let t = [[]];
	return i(a(e, 0), n()), t;
	function n() {
		return t.push([]) - 1;
	}
	function r(e, n, r) {
		let i = {
			term: r,
			to: n
		};
		return t[e].push(i), i;
	}
	function i(e, t) {
		e.forEach((e) => e.to = t);
	}
	function a(e, t) {
		if (e.type == "choice") return e.exprs.reduce((e, n) => e.concat(a(n, t)), []);
		if (e.type == "seq") for (let r = 0;; r++) {
			let o = a(e.exprs[r], t);
			if (r == e.exprs.length - 1) return o;
			i(o, t = n());
		}
		else if (e.type == "star") {
			let o = n();
			return r(t, o), i(a(e.expr, o), o), [r(o)];
		} else if (e.type == "plus") {
			let o = n();
			return i(a(e.expr, t), o), i(a(e.expr, o), o), [r(o)];
		} else if (e.type == "opt") return [r(t)].concat(a(e.expr, t));
		else if (e.type == "range") {
			let o = t;
			for (let t = 0; t < e.min; t++) {
				let t = n();
				i(a(e.expr, o), t), o = t;
			}
			if (e.max == -1) i(a(e.expr, o), o);
			else for (let t = e.min; t < e.max; t++) {
				let t = n();
				r(o, t), i(a(e.expr, o), t), o = t;
			}
			return [r(o)];
		} else if (e.type == "name") return [r(t, void 0, e.value)];
		else throw Error("Unknown expr type");
	}
}
function He(e, t) {
	return t - e;
}
function Ue(e, t) {
	let n = [];
	return r(t), n.sort(He);
	function r(t) {
		let i = e[t];
		if (i.length == 1 && !i[0].term) return r(i[0].to);
		n.push(t);
		for (let e = 0; e < i.length; e++) {
			let { term: t, to: a } = i[e];
			!t && n.indexOf(a) == -1 && r(a);
		}
	}
}
function We(e) {
	let t = Object.create(null);
	return n(Ue(e, 0));
	function n(r) {
		let i = [];
		r.forEach((t) => {
			e[t].forEach(({ term: t, to: n }) => {
				if (!t) return;
				let r;
				for (let e = 0; e < i.length; e++) i[e][0] == t && (r = i[e][1]);
				Ue(e, n).forEach((e) => {
					r || i.push([t, r = []]), r.indexOf(e) == -1 && r.push(e);
				});
			});
		});
		let a = t[r.join(",")] = new Me(r.indexOf(e.length - 1) > -1);
		for (let e = 0; e < i.length; e++) {
			let r = i[e][1].sort(He);
			a.next.push({
				type: i[e][0],
				next: t[r.join(",")] || n(r)
			});
		}
		return a;
	}
}
function Ge(e, t) {
	for (let n = 0, r = [e]; n < r.length; n++) {
		let e = r[n], i = !e.validEnd, a = [];
		for (let t = 0; t < e.next.length; t++) {
			let { type: n, next: o } = e.next[t];
			a.push(n.name), i && !(n.isText || n.hasRequiredAttrs()) && (i = !1), r.indexOf(o) == -1 && r.push(o);
		}
		i && t.err("Only non-generatable nodes (" + a.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
	}
}
function Ke(e) {
	let t = Object.create(null);
	for (let n in e) {
		let r = e[n];
		if (!r.hasDefault) return null;
		t[n] = r.default;
	}
	return t;
}
function qe(e, t) {
	let n = Object.create(null);
	for (let r in e) {
		let i = t && t[r];
		if (i === void 0) {
			let t = e[r];
			if (t.hasDefault) i = t.default;
			else throw RangeError("No value supplied for attribute " + r);
		}
		n[r] = i;
	}
	return n;
}
function Je(e, t, n, r) {
	for (let i in t) if (!(i in e)) throw RangeError(`Unsupported attribute ${i} for ${n} of type ${r}`);
	for (let n in e) e[n].validate && e[n].validate(t[n]);
}
function Ye(e, t) {
	let n = Object.create(null);
	if (t) for (let r in t) n[r] = new Qe(e, r, t[r]);
	return n;
}
var Xe = class e {
	constructor(e, t, n) {
		this.name = e, this.schema = t, this.spec = n, this.markSet = null, this.groups = n.group ? n.group.split(" ") : [], this.attrs = Ye(e, n.attrs), this.defaultAttrs = Ke(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(n.inline || e == "text"), this.isText = e == "text";
	}
	get isInline() {
		return !this.isBlock;
	}
	get isTextblock() {
		return this.isBlock && this.inlineContent;
	}
	get isLeaf() {
		return this.contentMatch == Me.empty;
	}
	get isAtom() {
		return this.isLeaf || !!this.spec.atom;
	}
	isInGroup(e) {
		return this.groups.indexOf(e) > -1;
	}
	get whitespace() {
		return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
	}
	hasRequiredAttrs() {
		for (let e in this.attrs) if (this.attrs[e].isRequired) return !0;
		return !1;
	}
	compatibleContent(e) {
		return this == e || this.contentMatch.compatible(e.contentMatch);
	}
	computeAttrs(e) {
		return !e && this.defaultAttrs ? this.defaultAttrs : qe(this.attrs, e);
	}
	create(e = null, t, n) {
		if (this.isText) throw Error("NodeType.create can't construct text nodes");
		return new ke(this, this.computeAttrs(e), A.from(t), M.setFrom(n));
	}
	createChecked(e = null, t, n) {
		return t = A.from(t), this.checkContent(t), new ke(this, this.computeAttrs(e), t, M.setFrom(n));
	}
	createAndFill(e = null, t, n) {
		if (e = this.computeAttrs(e), t = A.from(t), t.size) {
			let e = this.contentMatch.fillBefore(t);
			if (!e) return null;
			t = e.append(t);
		}
		let r = this.contentMatch.matchFragment(t), i = r && r.fillBefore(A.empty, !0);
		return i ? new ke(this, e, t.append(i), M.setFrom(n)) : null;
	}
	validContent(e) {
		let t = this.contentMatch.matchFragment(e);
		if (!t || !t.validEnd) return !1;
		for (let t = 0; t < e.childCount; t++) if (!this.allowsMarks(e.child(t).marks)) return !1;
		return !0;
	}
	checkContent(e) {
		if (!this.validContent(e)) throw RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
	}
	checkAttrs(e) {
		Je(this.attrs, e, "node", this.name);
	}
	allowsMarkType(e) {
		return this.markSet == null || this.markSet.indexOf(e) > -1;
	}
	allowsMarks(e) {
		if (this.markSet == null) return !0;
		for (let t = 0; t < e.length; t++) if (!this.allowsMarkType(e[t].type)) return !1;
		return !0;
	}
	allowedMarks(e) {
		if (this.markSet == null) return e;
		let t;
		for (let n = 0; n < e.length; n++) this.allowsMarkType(e[n].type) ? t && t.push(e[n]) : t ||= e.slice(0, n);
		return t ? t.length ? t : M.none : e;
	}
	static compile(t, n) {
		let r = Object.create(null);
		t.forEach((t, i) => r[t] = new e(t, n, i));
		let i = n.spec.topNode || "doc";
		if (!r[i]) throw RangeError("Schema is missing its top node type ('" + i + "')");
		if (!r.text) throw RangeError("Every schema needs a 'text' type");
		for (let e in r.text.attrs) throw RangeError("The text node type should not have attributes");
		return r;
	}
};
function Ze(e, t, n) {
	let r = n.split("|");
	return (n) => {
		let i = n === null ? "null" : typeof n;
		if (r.indexOf(i) < 0) throw RangeError(`Expected value of type ${r} for attribute ${t} on type ${e}, got ${i}`);
	};
}
var Qe = class {
	constructor(e, t, n) {
		this.hasDefault = Object.prototype.hasOwnProperty.call(n, "default"), this.default = n.default, this.validate = typeof n.validate == "string" ? Ze(e, t, n.validate) : n.validate;
	}
	get isRequired() {
		return !this.hasDefault;
	}
}, $e = class e {
	constructor(e, t, n, r) {
		this.name = e, this.rank = t, this.schema = n, this.spec = r, this.attrs = Ye(e, r.attrs), this.excluded = null;
		let i = Ke(this.attrs);
		this.instance = i ? new M(this, i) : null;
	}
	create(e = null) {
		return !e && this.instance ? this.instance : new M(this, qe(this.attrs, e));
	}
	static compile(t, n) {
		let r = Object.create(null), i = 0;
		return t.forEach((t, a) => r[t] = new e(t, i++, n, a)), r;
	}
	removeFromSet(e) {
		for (var t = 0; t < e.length; t++) e[t].type == this && (e = e.slice(0, t).concat(e.slice(t + 1)), t--);
		return e;
	}
	isInSet(e) {
		for (let t = 0; t < e.length; t++) if (e[t].type == this) return e[t];
	}
	checkAttrs(e) {
		Je(this.attrs, e, "mark", this.name);
	}
	excludes(e) {
		return this.excluded.indexOf(e) > -1;
	}
}, et = class {
	constructor(e) {
		this.linebreakReplacement = null, this.cached = Object.create(null);
		let t = this.spec = {};
		for (let n in e) t[n] = e[n];
		t.nodes = k.from(e.nodes), t.marks = k.from(e.marks || {}), this.nodes = Xe.compile(this.spec.nodes, this), this.marks = $e.compile(this.spec.marks, this);
		let n = Object.create(null);
		for (let e in this.nodes) {
			if (e in this.marks) throw RangeError(e + " can not be both a node and a mark");
			let t = this.nodes[e], r = t.spec.content || "", i = t.spec.marks;
			if (t.contentMatch = n[r] || (n[r] = Me.parse(r, this.nodes)), t.inlineContent = t.contentMatch.inlineContent, t.spec.linebreakReplacement) {
				if (this.linebreakReplacement) throw RangeError("Multiple linebreak nodes defined");
				if (!t.isInline || !t.isLeaf) throw RangeError("Linebreak replacement nodes must be inline leaf nodes");
				this.linebreakReplacement = t;
			}
			t.markSet = i == "_" ? null : i ? tt(this, i.split(" ")) : i == "" || !t.inlineContent ? [] : null;
		}
		for (let e in this.marks) {
			let t = this.marks[e], n = t.spec.excludes;
			t.excluded = n == null ? [t] : n == "" ? [] : tt(this, n.split(" "));
		}
		this.nodeFromJSON = (e) => ke.fromJSON(this, e), this.markFromJSON = (e) => M.fromJSON(this, e), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = Object.create(null);
	}
	node(e, t = null, n, r) {
		if (typeof e == "string") e = this.nodeType(e);
		else if (!(e instanceof Xe)) throw RangeError("Invalid node type: " + e);
		else if (e.schema != this) throw RangeError("Node type from different schema used (" + e.name + ")");
		return e.createChecked(t, n, r);
	}
	text(e, t) {
		let n = this.nodes.text;
		return new Ae(n, n.defaultAttrs, e, M.setFrom(t));
	}
	mark(e, t) {
		return typeof e == "string" && (e = this.marks[e]), e.create(t);
	}
	nodeType(e) {
		let t = this.nodes[e];
		if (!t) throw RangeError("Unknown node type: " + e);
		return t;
	}
};
function tt(e, t) {
	let n = [];
	for (let r = 0; r < t.length; r++) {
		let i = t[r], a = e.marks[i], o = a;
		if (a) n.push(a);
		else for (let t in e.marks) {
			let r = e.marks[t];
			(i == "_" || r.spec.group && r.spec.group.split(" ").indexOf(i) > -1) && n.push(o = r);
		}
		if (!o) throw SyntaxError("Unknown mark type: '" + t[r] + "'");
	}
	return n;
}
function nt(e) {
	return e.tag != null;
}
function rt(e) {
	return e.style != null;
}
var it = class e {
	constructor(e, t) {
		this.schema = e, this.rules = t, this.tags = [], this.styles = [];
		let n = this.matchedStyles = [];
		t.forEach((e) => {
			if (nt(e)) this.tags.push(e);
			else if (rt(e)) {
				let t = /[^=]*/.exec(e.style)[0];
				n.indexOf(t) < 0 && n.push(t), this.styles.push(e);
			}
		}), this.normalizeLists = !this.tags.some((t) => {
			if (!/^(ul|ol)\b/.test(t.tag) || !t.node) return !1;
			let n = e.nodes[t.node];
			return n.contentMatch.matchType(n);
		});
	}
	parse(e, t = {}) {
		let n = new pt(this, t, !1);
		return n.addAll(e, M.none, t.from, t.to), n.finish();
	}
	parseSlice(e, t = {}) {
		let n = new pt(this, t, !0);
		return n.addAll(e, M.none, t.from, t.to), N.maxOpen(n.finish());
	}
	matchTag(e, t, n) {
		for (let r = n ? this.tags.indexOf(n) + 1 : 0; r < this.tags.length; r++) {
			let n = this.tags[r];
			if (ht(e, n.tag) && (n.namespace === void 0 || e.namespaceURI == n.namespace) && (!n.context || t.matchesContext(n.context))) {
				if (n.getAttrs) {
					let t = n.getAttrs(e);
					if (t === !1) continue;
					n.attrs = t || void 0;
				}
				return n;
			}
		}
	}
	matchStyle(e, t, n, r) {
		for (let i = r ? this.styles.indexOf(r) + 1 : 0; i < this.styles.length; i++) {
			let r = this.styles[i], a = r.style;
			if (!(a.indexOf(e) != 0 || r.context && !n.matchesContext(r.context) || a.length > e.length && (a.charCodeAt(e.length) != 61 || a.slice(e.length + 1) != t))) {
				if (r.getAttrs) {
					let e = r.getAttrs(t);
					if (e === !1) continue;
					r.attrs = e || void 0;
				}
				return r;
			}
		}
	}
	static schemaRules(e) {
		let t = [];
		function n(e) {
			let n = e.priority == null ? 50 : e.priority, r = 0;
			for (; r < t.length; r++) {
				let e = t[r];
				if ((e.priority == null ? 50 : e.priority) < n) break;
			}
			t.splice(r, 0, e);
		}
		for (let t in e.marks) {
			let r = e.marks[t].spec.parseDOM;
			r && r.forEach((e) => {
				n(e = gt(e)), e.mark || e.ignore || e.clearMark || (e.mark = t);
			});
		}
		for (let t in e.nodes) {
			let r = e.nodes[t].spec.parseDOM;
			r && r.forEach((e) => {
				n(e = gt(e)), e.node || e.ignore || e.mark || (e.node = t);
			});
		}
		return t;
	}
	static fromSchema(t) {
		return t.cached.domParser || (t.cached.domParser = new e(t, e.schemaRules(t)));
	}
}, at = {
	address: !0,
	article: !0,
	aside: !0,
	blockquote: !0,
	body: !0,
	canvas: !0,
	dd: !0,
	div: !0,
	dl: !0,
	fieldset: !0,
	figcaption: !0,
	figure: !0,
	footer: !0,
	form: !0,
	h1: !0,
	h2: !0,
	h3: !0,
	h4: !0,
	h5: !0,
	h6: !0,
	header: !0,
	hgroup: !0,
	hr: !0,
	li: !0,
	noscript: !0,
	ol: !0,
	output: !0,
	p: !0,
	pre: !0,
	section: !0,
	table: !0,
	tfoot: !0,
	ul: !0
}, ot = {
	head: !0,
	noscript: !0,
	object: !0,
	script: !0,
	style: !0,
	title: !0
}, st = {
	ol: !0,
	ul: !0
}, ct = 1, lt = 2, ut = 4;
function dt(e, t, n) {
	return t == null ? e && e.whitespace == "pre" ? 3 : n & -5 : (t ? ct : 0) | (t === "full" ? lt : 0);
}
var ft = class {
	constructor(e, t, n, r, i, a) {
		this.type = e, this.attrs = t, this.marks = n, this.solid = r, this.options = a, this.content = [], this.activeMarks = M.none, this.match = i || (a & ut ? null : e.contentMatch);
	}
	findWrapping(e) {
		if (!this.match) {
			if (!this.type) return [];
			let t = this.type.contentMatch.fillBefore(A.from(e));
			if (t) this.match = this.type.contentMatch.matchFragment(t);
			else {
				let t = this.type.contentMatch, n;
				return (n = t.findWrapping(e.type)) ? (this.match = t, n) : null;
			}
		}
		return this.match.findWrapping(e.type);
	}
	finish(e) {
		if (!(this.options & ct)) {
			let e = this.content[this.content.length - 1], t;
			if (e && e.isText && (t = /[ \t\r\n\u000c]+$/.exec(e.text))) {
				let n = e;
				e.text.length == t[0].length ? this.content.pop() : this.content[this.content.length - 1] = n.withText(n.text.slice(0, n.text.length - t[0].length));
			}
		}
		let t = A.from(this.content);
		return !e && this.match && (t = t.append(this.match.fillBefore(A.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
	}
	inlineContext(e) {
		return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !at.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
	}
}, pt = class {
	constructor(e, t, n) {
		this.parser = e, this.options = t, this.isOpen = n, this.open = 0, this.localPreserveWS = !1;
		let r = t.topNode, i, a = dt(null, t.preserveWhitespace, 0) | (n ? ut : 0);
		i = r ? new ft(r.type, r.attrs, M.none, !0, t.topMatch || r.type.contentMatch, a) : n ? new ft(null, null, M.none, !0, null, a) : new ft(e.schema.topNodeType, null, M.none, !0, null, a), this.nodes = [i], this.find = t.findPositions, this.needsBlock = !1;
	}
	get top() {
		return this.nodes[this.open];
	}
	addDOM(e, t) {
		e.nodeType == 3 ? this.addTextNode(e, t) : e.nodeType == 1 && this.addElement(e, t);
	}
	addTextNode(e, t) {
		let n = e.nodeValue, r = this.top, i = r.options & lt ? "full" : this.localPreserveWS || (r.options & ct) > 0, { schema: a } = this.parser;
		if (i === "full" || r.inlineContext(e) || /[^ \t\r\n\u000c]/.test(n)) {
			if (!i) {
				if (n = n.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(n) && this.open == this.nodes.length - 1) {
					let t = r.content[r.content.length - 1], i = e.previousSibling;
					(!t || i && i.nodeName == "BR" || t.isText && /[ \t\r\n\u000c]$/.test(t.text)) && (n = n.slice(1));
				}
			} else if (i === "full") n = n.replace(/\r\n?/g, "\n");
			else if (a.linebreakReplacement && /[\r\n]/.test(n) && this.top.findWrapping(a.linebreakReplacement.create())) {
				let e = n.split(/\r?\n|\r/);
				for (let n = 0; n < e.length; n++) n && this.insertNode(a.linebreakReplacement.create(), t, !0), e[n] && this.insertNode(a.text(e[n]), t, !/\S/.test(e[n]));
				n = "";
			} else n = n.replace(/\r?\n|\r/g, " ");
			n && this.insertNode(a.text(n), t, !/\S/.test(n)), this.findInText(e);
		} else this.findInside(e);
	}
	addElement(e, t, n) {
		let r = this.localPreserveWS, i = this.top;
		(e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
		let a = e.nodeName.toLowerCase(), o;
		st.hasOwnProperty(a) && this.parser.normalizeLists && mt(e);
		let s = this.options.ruleFromNode && this.options.ruleFromNode(e) || (o = this.parser.matchTag(e, this, n));
		out: if (s ? s.ignore : ot.hasOwnProperty(a)) this.findInside(e), this.ignoreFallback(e, t);
		else if (!s || s.skip || s.closeParent) {
			s && s.closeParent ? this.open = Math.max(0, this.open - 1) : s && s.skip.nodeType && (e = s.skip);
			let n, r = this.needsBlock;
			if (at.hasOwnProperty(a)) i.content.length && i.content[0].isInline && this.open && (this.open--, i = this.top), n = !0, i.type || (this.needsBlock = !0);
			else if (!e.firstChild) {
				this.leafFallback(e, t);
				break out;
			}
			let o = s && s.skip ? t : this.readStyles(e, t);
			o && this.addAll(e, o), n && this.sync(i), this.needsBlock = r;
		} else {
			let n = this.readStyles(e, t);
			n && this.addElementByRule(e, s, n, s.consuming === !1 ? o : void 0);
		}
		this.localPreserveWS = r;
	}
	leafFallback(e, t) {
		e.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(e.ownerDocument.createTextNode("\n"), t);
	}
	ignoreFallback(e, t) {
		e.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), t, !0);
	}
	readStyles(e, t) {
		let n = e.style;
		if (n && n.length) for (let e = 0; e < this.parser.matchedStyles.length; e++) {
			let r = this.parser.matchedStyles[e], i = n.getPropertyValue(r);
			if (i) for (let e;;) {
				let n = this.parser.matchStyle(r, i, this, e);
				if (!n) break;
				if (n.ignore) return null;
				if (t = n.clearMark ? t.filter((e) => !n.clearMark(e)) : t.concat(this.parser.schema.marks[n.mark].create(n.attrs)), n.consuming === !1) e = n;
				else break;
			}
		}
		return t;
	}
	addElementByRule(e, t, n, r) {
		let i, a;
		if (t.node) {
			if (a = this.parser.schema.nodes[t.node], a.isLeaf) this.insertNode(a.create(t.attrs), n, e.nodeName == "BR") || this.leafFallback(e, n);
			else {
				let e = this.enter(a, t.attrs || null, n, t.preserveWhitespace);
				e && (i = !0, n = e);
			}
		} else {
			let e = this.parser.schema.marks[t.mark];
			n = n.concat(e.create(t.attrs));
		}
		let o = this.top;
		if (a && a.isLeaf) this.findInside(e);
		else if (r) this.addElement(e, n, r);
		else if (t.getContent) this.findInside(e), t.getContent(e, this.parser.schema).forEach((e) => this.insertNode(e, n, !1));
		else {
			let r = e;
			typeof t.contentElement == "string" ? r = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? r = t.contentElement(e) : t.contentElement && (r = t.contentElement), this.findAround(e, r, !0), this.addAll(r, n), this.findAround(e, r, !1);
		}
		i && this.sync(o) && this.open--;
	}
	addAll(e, t, n, r) {
		let i = n || 0;
		for (let a = n ? e.childNodes[n] : e.firstChild, o = r == null ? null : e.childNodes[r]; a != o; a = a.nextSibling, ++i) this.findAtPoint(e, i), this.addDOM(a, t);
		this.findAtPoint(e, i);
	}
	findPlace(e, t, n) {
		let r, i;
		for (let t = this.open, a = 0; t >= 0; t--) {
			let o = this.nodes[t], s = o.findWrapping(e);
			if (s && (!r || r.length > s.length + a) && (r = s, i = o, !s.length)) break;
			if (o.solid) {
				if (n) break;
				a += 2;
			}
		}
		if (!r) return null;
		this.sync(i);
		for (let e = 0; e < r.length; e++) t = this.enterInner(r[e], null, t, !1);
		return t;
	}
	insertNode(e, t, n) {
		if (e.isInline && this.needsBlock && !this.top.type) {
			let e = this.textblockFromContext();
			e && (t = this.enterInner(e, null, t));
		}
		let r = this.findPlace(e, t, n);
		if (r) {
			this.closeExtra();
			let t = this.top;
			t.match &&= t.match.matchType(e.type);
			let n = M.none;
			for (let i of r.concat(e.marks)) (t.type ? t.type.allowsMarkType(i.type) : _t(i.type, e.type)) && (n = i.addToSet(n));
			return t.content.push(e.mark(n)), !0;
		}
		return !1;
	}
	enter(e, t, n, r) {
		let i = this.findPlace(e.create(t), n, !1);
		return i &&= this.enterInner(e, t, n, !0, r), i;
	}
	enterInner(e, t, n, r = !1, i) {
		this.closeExtra();
		let a = this.top;
		a.match = a.match && a.match.matchType(e);
		let o = dt(e, i, a.options);
		a.options & ut && a.content.length == 0 && (o |= ut);
		let s = M.none;
		return n = n.filter((t) => !(a.type ? a.type.allowsMarkType(t.type) : _t(t.type, e)) || (s = t.addToSet(s), !1)), this.nodes.push(new ft(e, t, s, r, null, o)), this.open++, n;
	}
	closeExtra(e = !1) {
		let t = this.nodes.length - 1;
		if (t > this.open) {
			for (; t > this.open; t--) this.nodes[t - 1].content.push(this.nodes[t].finish(e));
			this.nodes.length = this.open + 1;
		}
	}
	finish() {
		return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
	}
	sync(e) {
		for (let t = this.open; t >= 0; t--) if (this.nodes[t] == e) return this.open = t, !0;
		else this.localPreserveWS && (this.nodes[t].options |= ct);
		return !1;
	}
	get currentPos() {
		this.closeExtra();
		let e = 0;
		for (let t = this.open; t >= 0; t--) {
			let n = this.nodes[t].content;
			for (let t = n.length - 1; t >= 0; t--) e += n[t].nodeSize;
			t && e++;
		}
		return e;
	}
	findAtPoint(e, t) {
		if (this.find) for (let n = 0; n < this.find.length; n++) this.find[n].node == e && this.find[n].offset == t && (this.find[n].pos = this.currentPos);
	}
	findInside(e) {
		if (this.find) for (let t = 0; t < this.find.length; t++) this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
	}
	findAround(e, t, n) {
		if (e != t && this.find) for (let r = 0; r < this.find.length; r++) this.find[r].pos == null && e.nodeType == 1 && e.contains(this.find[r].node) && t.compareDocumentPosition(this.find[r].node) & (n ? 2 : 4) && (this.find[r].pos = this.currentPos);
	}
	findInText(e) {
		if (this.find) for (let t = 0; t < this.find.length; t++) this.find[t].node == e && (this.find[t].pos = this.currentPos - (e.nodeValue.length - this.find[t].offset));
	}
	matchesContext(e) {
		if (e.indexOf("|") > -1) return e.split(/\s*\|\s*/).some(this.matchesContext, this);
		let t = e.split("/"), n = this.options.context, r = !this.isOpen && (!n || n.parent.type == this.nodes[0].type), i = -(n ? n.depth + 1 : 0) + +!r, a = (e, o) => {
			for (; e >= 0; e--) {
				let s = t[e];
				if (s == "") {
					if (e == t.length - 1 || e == 0) continue;
					for (; o >= i; o--) if (a(e - 1, o)) return !0;
					return !1;
				}
				{
					let e = o > 0 || o == 0 && r ? this.nodes[o].type : n && o >= i ? n.node(o - i).type : null;
					if (!e || e.name != s && !e.isInGroup(s)) return !1;
					o--;
				}
			}
			return !0;
		};
		return a(t.length - 1, this.open);
	}
	textblockFromContext() {
		let e = this.options.context;
		if (e) for (let t = e.depth; t >= 0; t--) {
			let n = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
			if (n && n.isTextblock && n.defaultAttrs) return n;
		}
		for (let e in this.parser.schema.nodes) {
			let t = this.parser.schema.nodes[e];
			if (t.isTextblock && t.defaultAttrs) return t;
		}
	}
};
function mt(e) {
	for (let t = e.firstChild, n = null; t; t = t.nextSibling) {
		let e = t.nodeType == 1 ? t.nodeName.toLowerCase() : null;
		e && st.hasOwnProperty(e) && n ? (n.appendChild(t), t = n) : e == "li" ? n = t : e && (n = null);
	}
}
function ht(e, t) {
	return (e.matches || e.msMatchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector).call(e, t);
}
function gt(e) {
	let t = {};
	for (let n in e) t[n] = e[n];
	return t;
}
function _t(e, t) {
	let n = t.schema.nodes;
	for (let r in n) {
		let i = n[r];
		if (!i.allowsMarkType(e)) continue;
		let a = [], o = (e) => {
			a.push(e);
			for (let n = 0; n < e.edgeCount; n++) {
				let { type: r, next: i } = e.edge(n);
				if (r == t || a.indexOf(i) < 0 && o(i)) return !0;
			}
		};
		if (o(i.contentMatch)) return !0;
	}
}
var vt = class e {
	constructor(e, t) {
		this.nodes = e, this.marks = t;
	}
	serializeFragment(e, t = {}, n) {
		n ||= bt(t).createDocumentFragment();
		let r = n, i = [];
		return e.forEach((e) => {
			if (i.length || e.marks.length) {
				let n = 0, a = 0;
				for (; n < i.length && a < e.marks.length;) {
					let t = e.marks[a];
					if (!this.marks[t.type.name]) {
						a++;
						continue;
					}
					if (!t.eq(i[n][0]) || t.type.spec.spanning === !1) break;
					n++, a++;
				}
				for (; n < i.length;) r = i.pop()[1];
				for (; a < e.marks.length;) {
					let n = e.marks[a++], o = this.serializeMark(n, e.isInline, t);
					o && (i.push([n, r]), r.appendChild(o.dom), r = o.contentDOM || o.dom);
				}
			}
			r.appendChild(this.serializeNodeInner(e, t));
		}), n;
	}
	serializeNodeInner(e, t) {
		if (e.isText) return bt(t).createTextNode(e.text);
		let { dom: n, contentDOM: r } = wt(bt(t), this.nodes[e.type.name](e), null, e.attrs);
		if (r) {
			if (e.isLeaf) throw RangeError("Content hole not allowed in a leaf node spec");
			this.serializeFragment(e.content, t, r);
		}
		return n;
	}
	serializeNode(e, t = {}) {
		let n = this.serializeNodeInner(e, t);
		for (let r = e.marks.length - 1; r >= 0; r--) {
			let i = this.serializeMark(e.marks[r], e.isInline, t);
			i && ((i.contentDOM || i.dom).appendChild(n), n = i.dom);
		}
		return n;
	}
	serializeMark(e, t, n = {}) {
		let r = this.marks[e.type.name];
		return r && wt(bt(n), r(e, t), null, e.attrs);
	}
	static renderSpec(e, t, n = null, r) {
		return typeof t == "string" ? { dom: e.createTextNode(t) } : wt(e, t, n, r);
	}
	static fromSchema(t) {
		return t.cached.domSerializer || (t.cached.domSerializer = new e(this.nodesFromSchema(t), this.marksFromSchema(t)));
	}
	static nodesFromSchema(e) {
		let t = yt(e.nodes);
		return t.text ||= (e) => e.text, t;
	}
	static marksFromSchema(e) {
		return yt(e.marks);
	}
};
function yt(e) {
	let t = {};
	for (let n in e) {
		let r = e[n].spec.toDOM;
		r && (t[n] = r);
	}
	return t;
}
function bt(e) {
	return e.document || window.document;
}
var xt = /* @__PURE__ */ new WeakMap();
function St(e) {
	let t = xt.get(e);
	return t === void 0 && xt.set(e, t = Ct(e)), t;
}
function Ct(e) {
	let t = null;
	function n(e) {
		if (e && typeof e == "object") {
			if (Array.isArray(e)) {
				if (typeof e[0] == "string") t ||= [], t.push(e);
				else for (let t = 0; t < e.length; t++) n(e[t]);
			} else for (let t in e) n(e[t]);
		}
	}
	return n(e), t;
}
function wt(e, t, n, r) {
	if (t.nodeType == 1) return { dom: t };
	if (t.dom && t.dom.nodeType == 1) return t;
	let i = t[0], a;
	if (typeof i != "string") throw RangeError("Invalid array passed to renderSpec");
	if (r && (a = St(r)) && a.indexOf(t) > -1) throw RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
	let o = i.indexOf(" ");
	o > 0 && (n = i.slice(0, o), i = i.slice(o + 1));
	let s, c = n ? e.createElementNS(n, i) : e.createElement(i), l = t[1], u = 1;
	if (l && typeof l == "object" && l.nodeType == null && !Array.isArray(l)) {
		u = 2;
		for (let e in l) if (l[e] != null) {
			let t = e.indexOf(" ");
			t > 0 ? c.setAttributeNS(e.slice(0, t), e.slice(t + 1), l[e]) : e == "style" && c.style ? c.style.cssText = l[e] : c.setAttribute(e, l[e]);
		}
	}
	for (let i = u; i < t.length; i++) {
		let a = t[i];
		if (a === 0) {
			if (i < t.length - 1 || i > u) throw RangeError("Content hole must be the only child of its parent node");
			return {
				dom: c,
				contentDOM: c
			};
		}
		if (typeof a == "string") c.appendChild(e.createTextNode(a));
		else {
			let { dom: t, contentDOM: i } = wt(e, a, n, r);
			if (c.appendChild(t), i) {
				if (s) throw RangeError("Multiple content holes");
				s = i;
			}
		}
	}
	return {
		dom: c,
		contentDOM: s
	};
}
//#endregion
//#region ../../node_modules/prosemirror-transform/dist/index.js
var Tt = 65535, Et = 2 ** 16;
function Dt(e, t) {
	return e + t * Et;
}
function Ot(e) {
	return e & Tt;
}
function kt(e) {
	return (e - (e & Tt)) / Et;
}
var At = 1, jt = 2, Mt = 4, Nt = 8, Pt = class {
	constructor(e, t, n) {
		this.pos = e, this.delInfo = t, this.recover = n;
	}
	get deleted() {
		return (this.delInfo & Nt) > 0;
	}
	get deletedBefore() {
		return (this.delInfo & 5) > 0;
	}
	get deletedAfter() {
		return (this.delInfo & 6) > 0;
	}
	get deletedAcross() {
		return (this.delInfo & Mt) > 0;
	}
}, Ft = class e {
	constructor(t, n = !1) {
		if (this.ranges = t, this.inverted = n, !t.length && e.empty) return e.empty;
	}
	recover(e) {
		let t = 0, n = Ot(e);
		if (!this.inverted) for (let e = 0; e < n; e++) t += this.ranges[e * 3 + 2] - this.ranges[e * 3 + 1];
		return this.ranges[n * 3] + t + kt(e);
	}
	mapResult(e, t = 1) {
		return this._map(e, t, !1);
	}
	map(e, t = 1) {
		return this._map(e, t, !0);
	}
	_map(e, t, n) {
		let r = 0, i = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
		for (let o = 0; o < this.ranges.length; o += 3) {
			let s = this.ranges[o] - (this.inverted ? r : 0);
			if (s > e) break;
			let c = this.ranges[o + i], l = this.ranges[o + a], u = s + c;
			if (e <= u) {
				let i = c ? e == s ? -1 : e == u ? 1 : t : t, a = s + r + (i < 0 ? 0 : l);
				if (n) return a;
				let d = e == (t < 0 ? s : u) ? null : Dt(o / 3, e - s), f = e == s ? jt : e == u ? At : Mt;
				return (t < 0 ? e != s : e != u) && (f |= Nt), new Pt(a, f, d);
			}
			r += l - c;
		}
		return n ? e + r : new Pt(e + r, 0, null);
	}
	touches(e, t) {
		let n = 0, r = Ot(t), i = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
		for (let t = 0; t < this.ranges.length; t += 3) {
			let o = this.ranges[t] - (this.inverted ? n : 0);
			if (o > e) break;
			let s = this.ranges[t + i];
			if (e <= o + s && t == r * 3) return !0;
			n += this.ranges[t + a] - s;
		}
		return !1;
	}
	forEach(e) {
		let t = this.inverted ? 2 : 1, n = this.inverted ? 1 : 2;
		for (let r = 0, i = 0; r < this.ranges.length; r += 3) {
			let a = this.ranges[r], o = a - (this.inverted ? i : 0), s = a + (this.inverted ? 0 : i), c = this.ranges[r + t], l = this.ranges[r + n];
			e(o, o + c, s, s + l), i += l - c;
		}
	}
	invert() {
		return new e(this.ranges, !this.inverted);
	}
	toString() {
		return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
	}
	static offset(t) {
		return t == 0 ? e.empty : new e(t < 0 ? [
			0,
			-t,
			0
		] : [
			0,
			0,
			t
		]);
	}
};
Ft.empty = new Ft([]);
var It = class e {
	constructor(e, t, n = 0, r = e ? e.length : 0) {
		this.mirror = t, this.from = n, this.to = r, this._maps = e || [], this.ownData = !(e || t);
	}
	get maps() {
		return this._maps;
	}
	slice(t = 0, n = this.maps.length) {
		return new e(this._maps, this.mirror, t, n);
	}
	appendMap(e, t) {
		this.ownData ||= (this._maps = this._maps.slice(), this.mirror = this.mirror && this.mirror.slice(), !0), this.to = this._maps.push(e), t != null && this.setMirror(this._maps.length - 1, t);
	}
	appendMapping(e) {
		for (let t = 0, n = this._maps.length; t < e._maps.length; t++) {
			let r = e.getMirror(t);
			this.appendMap(e._maps[t], r != null && r < t ? n + r : void 0);
		}
	}
	getMirror(e) {
		if (this.mirror) {
			for (let t = 0; t < this.mirror.length; t++) if (this.mirror[t] == e) return this.mirror[t + (t % 2 ? -1 : 1)];
		}
	}
	setMirror(e, t) {
		this.mirror ||= [], this.mirror.push(e, t);
	}
	appendMappingInverted(e) {
		for (let t = e.maps.length - 1, n = this._maps.length + e._maps.length; t >= 0; t--) {
			let r = e.getMirror(t);
			this.appendMap(e._maps[t].invert(), r != null && r > t ? n - r - 1 : void 0);
		}
	}
	invert() {
		let t = new e();
		return t.appendMappingInverted(this), t;
	}
	map(e, t = 1) {
		if (this.mirror) return this._map(e, t, !0);
		for (let n = this.from; n < this.to; n++) e = this._maps[n].map(e, t);
		return e;
	}
	mapResult(e, t = 1) {
		return this._map(e, t, !1);
	}
	_map(e, t, n) {
		let r = 0;
		for (let n = this.from; n < this.to; n++) {
			let i = this._maps[n].mapResult(e, t);
			if (i.recover != null) {
				let t = this.getMirror(n);
				if (t != null && t > n && t < this.to) {
					n = t, e = this._maps[t].recover(i.recover);
					continue;
				}
			}
			r |= i.delInfo, e = i.pos;
		}
		return n ? e : new Pt(e, r, null);
	}
}, Lt = Object.create(null), P = class {
	getMap() {
		return Ft.empty;
	}
	merge(e) {
		return null;
	}
	static fromJSON(e, t) {
		if (!t || !t.stepType) throw RangeError("Invalid input for Step.fromJSON");
		let n = Lt[t.stepType];
		if (!n) throw RangeError(`No step type ${t.stepType} defined`);
		return n.fromJSON(e, t);
	}
	static jsonID(e, t) {
		if (e in Lt) throw RangeError("Duplicate use of step JSON ID " + e);
		return Lt[e] = t, t.prototype.jsonID = e, t;
	}
}, F = class e {
	constructor(e, t) {
		this.doc = e, this.failed = t;
	}
	static ok(t) {
		return new e(t, null);
	}
	static fail(t) {
		return new e(null, t);
	}
	static fromReplace(t, n, r, i) {
		try {
			return e.ok(t.replace(n, r, i));
		} catch (t) {
			if (t instanceof ue) return e.fail(t.message);
			throw t;
		}
	}
};
function Rt(e, t, n) {
	let r = [];
	for (let i = 0; i < e.childCount; i++) {
		let a = e.child(i);
		a.content.size && (a = a.copy(Rt(a.content, t, a))), a.isInline && (a = t(a, n, i)), r.push(a);
	}
	return A.fromArray(r);
}
var zt = class e extends P {
	constructor(e, t, n) {
		super(), this.from = e, this.to = t, this.mark = n;
	}
	apply(e) {
		let t = e.slice(this.from, this.to), n = e.resolve(this.from), r = n.node(n.sharedDepth(this.to)), i = new N(Rt(t.content, (e, t) => !e.isAtom || !t.type.allowsMarkType(this.mark.type) ? e : e.mark(this.mark.addToSet(e.marks)), r), t.openStart, t.openEnd);
		return F.fromReplace(e, this.from, this.to, i);
	}
	invert() {
		return new Bt(this.from, this.to, this.mark);
	}
	map(t) {
		let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1);
		return n.deleted && r.deleted || n.pos >= r.pos ? null : new e(n.pos, r.pos, this.mark);
	}
	merge(t) {
		return t instanceof e && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new e(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
	}
	toJSON() {
		return {
			stepType: "addMark",
			mark: this.mark.toJSON(),
			from: this.from,
			to: this.to
		};
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for AddMarkStep.fromJSON");
		return new e(n.from, n.to, t.markFromJSON(n.mark));
	}
};
P.jsonID("addMark", zt);
var Bt = class e extends P {
	constructor(e, t, n) {
		super(), this.from = e, this.to = t, this.mark = n;
	}
	apply(e) {
		let t = e.slice(this.from, this.to), n = new N(Rt(t.content, (e) => e.mark(this.mark.removeFromSet(e.marks)), e), t.openStart, t.openEnd);
		return F.fromReplace(e, this.from, this.to, n);
	}
	invert() {
		return new zt(this.from, this.to, this.mark);
	}
	map(t) {
		let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1);
		return n.deleted && r.deleted || n.pos >= r.pos ? null : new e(n.pos, r.pos, this.mark);
	}
	merge(t) {
		return t instanceof e && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new e(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
	}
	toJSON() {
		return {
			stepType: "removeMark",
			mark: this.mark.toJSON(),
			from: this.from,
			to: this.to
		};
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for RemoveMarkStep.fromJSON");
		return new e(n.from, n.to, t.markFromJSON(n.mark));
	}
};
P.jsonID("removeMark", Bt);
var Vt = class e extends P {
	constructor(e, t) {
		super(), this.pos = e, this.mark = t;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return F.fail("No node at mark step's position");
		let n = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
		return F.fromReplace(e, this.pos, this.pos + 1, new N(A.from(n), 0, +!t.isLeaf));
	}
	invert(t) {
		let n = t.nodeAt(this.pos);
		if (n) {
			let t = this.mark.addToSet(n.marks);
			if (t.length == n.marks.length) {
				for (let r = 0; r < n.marks.length; r++) if (!n.marks[r].isInSet(t)) return new e(this.pos, n.marks[r]);
				return new e(this.pos, this.mark);
			}
		}
		return new Ht(this.pos, this.mark);
	}
	map(t) {
		let n = t.mapResult(this.pos, 1);
		return n.deletedAfter ? null : new e(n.pos, this.mark);
	}
	toJSON() {
		return {
			stepType: "addNodeMark",
			pos: this.pos,
			mark: this.mark.toJSON()
		};
	}
	static fromJSON(t, n) {
		if (typeof n.pos != "number") throw RangeError("Invalid input for AddNodeMarkStep.fromJSON");
		return new e(n.pos, t.markFromJSON(n.mark));
	}
};
P.jsonID("addNodeMark", Vt);
var Ht = class e extends P {
	constructor(e, t) {
		super(), this.pos = e, this.mark = t;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return F.fail("No node at mark step's position");
		let n = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
		return F.fromReplace(e, this.pos, this.pos + 1, new N(A.from(n), 0, +!t.isLeaf));
	}
	invert(e) {
		let t = e.nodeAt(this.pos);
		return !t || !this.mark.isInSet(t.marks) ? this : new Vt(this.pos, this.mark);
	}
	map(t) {
		let n = t.mapResult(this.pos, 1);
		return n.deletedAfter ? null : new e(n.pos, this.mark);
	}
	toJSON() {
		return {
			stepType: "removeNodeMark",
			pos: this.pos,
			mark: this.mark.toJSON()
		};
	}
	static fromJSON(t, n) {
		if (typeof n.pos != "number") throw RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
		return new e(n.pos, t.markFromJSON(n.mark));
	}
};
P.jsonID("removeNodeMark", Ht);
var I = class e extends P {
	constructor(e, t, n, r = !1) {
		super(), this.from = e, this.to = t, this.slice = n, this.structure = r;
	}
	apply(e) {
		return this.structure && Ut(e, this.from, this.to) ? F.fail("Structure replace would overwrite content") : F.fromReplace(e, this.from, this.to, this.slice);
	}
	getMap() {
		return new Ft([
			this.from,
			this.to - this.from,
			this.slice.size
		]);
	}
	invert(t) {
		return new e(this.from, this.from + this.slice.size, t.slice(this.from, this.to));
	}
	map(t) {
		let n = t.mapResult(this.to, -1), r = this.from == this.to && e.MAP_BIAS < 0 ? n : t.mapResult(this.from, 1);
		return r.deletedAcross && n.deletedAcross ? null : new e(r.pos, Math.max(r.pos, n.pos), this.slice, this.structure);
	}
	merge(t) {
		if (!(t instanceof e) || t.structure || this.structure) return null;
		if (this.from + this.slice.size == t.from && !this.slice.openEnd && !t.slice.openStart) {
			let n = this.slice.size + t.slice.size == 0 ? N.empty : new N(this.slice.content.append(t.slice.content), this.slice.openStart, t.slice.openEnd);
			return new e(this.from, this.to + (t.to - t.from), n, this.structure);
		}
		if (t.to == this.from && !this.slice.openStart && !t.slice.openEnd) {
			let n = this.slice.size + t.slice.size == 0 ? N.empty : new N(t.slice.content.append(this.slice.content), t.slice.openStart, this.slice.openEnd);
			return new e(t.from, this.to, n, this.structure);
		}
		return null;
	}
	toJSON() {
		let e = {
			stepType: "replace",
			from: this.from,
			to: this.to
		};
		return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for ReplaceStep.fromJSON");
		return new e(n.from, n.to, N.fromJSON(t, n.slice), !!n.structure);
	}
};
I.MAP_BIAS = 1, P.jsonID("replace", I);
var L = class e extends P {
	constructor(e, t, n, r, i, a, o = !1) {
		super(), this.from = e, this.to = t, this.gapFrom = n, this.gapTo = r, this.slice = i, this.insert = a, this.structure = o;
	}
	apply(e) {
		if (this.structure && (Ut(e, this.from, this.gapFrom) || Ut(e, this.gapTo, this.to))) return F.fail("Structure gap-replace would overwrite content");
		let t = e.slice(this.gapFrom, this.gapTo);
		if (t.openStart || t.openEnd) return F.fail("Gap is not a flat range");
		let n = this.slice.insertAt(this.insert, t.content);
		return n ? F.fromReplace(e, this.from, this.to, n) : F.fail("Content does not fit in gap");
	}
	getMap() {
		return new Ft([
			this.from,
			this.gapFrom - this.from,
			this.insert,
			this.gapTo,
			this.to - this.gapTo,
			this.slice.size - this.insert
		]);
	}
	invert(t) {
		let n = this.gapTo - this.gapFrom;
		return new e(this.from, this.from + this.slice.size + n, this.from + this.insert, this.from + this.insert + n, t.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
	}
	map(t) {
		let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1), i = this.from == this.gapFrom ? n.pos : t.map(this.gapFrom, -1), a = this.to == this.gapTo ? r.pos : t.map(this.gapTo, 1);
		return n.deletedAcross && r.deletedAcross || i < n.pos || a > r.pos ? null : new e(n.pos, r.pos, i, a, this.slice, this.insert, this.structure);
	}
	toJSON() {
		let e = {
			stepType: "replaceAround",
			from: this.from,
			to: this.to,
			gapFrom: this.gapFrom,
			gapTo: this.gapTo,
			insert: this.insert
		};
		return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number" || typeof n.gapFrom != "number" || typeof n.gapTo != "number" || typeof n.insert != "number") throw RangeError("Invalid input for ReplaceAroundStep.fromJSON");
		return new e(n.from, n.to, n.gapFrom, n.gapTo, N.fromJSON(t, n.slice), n.insert, !!n.structure);
	}
};
P.jsonID("replaceAround", L);
function Ut(e, t, n) {
	let r = e.resolve(t), i = n - t, a = r.depth;
	for (; i > 0 && a > 0 && r.indexAfter(a) == r.node(a).childCount;) a--, i--;
	if (i > 0) {
		let e = r.node(a).maybeChild(r.indexAfter(a));
		for (; i > 0;) {
			if (!e || e.isLeaf) return !0;
			e = e.firstChild, i--;
		}
	}
	return !1;
}
function Wt(e, t, n, r) {
	let i = [], a = [], o, s;
	e.doc.nodesBetween(t, n, (e, c, l) => {
		if (!e.isInline) return;
		let u = e.marks;
		if (!r.isInSet(u) && l.type.allowsMarkType(r.type)) {
			let l = Math.max(c, t), d = Math.min(c + e.nodeSize, n), f = r.addToSet(u);
			for (let e = 0; e < u.length; e++) u[e].isInSet(f) || (o && o.to == l && o.mark.eq(u[e]) ? o.to = d : i.push(o = new Bt(l, d, u[e])));
			s && s.to == l ? s.to = d : a.push(s = new zt(l, d, r));
		}
	}), i.forEach((t) => e.step(t)), a.forEach((t) => e.step(t));
}
function Gt(e, t, n, r) {
	let i = [], a = 0;
	e.doc.nodesBetween(t, n, (e, o) => {
		if (!e.isInline) return;
		a++;
		let s = null;
		if (r instanceof $e) {
			let t = e.marks, n;
			for (; n = r.isInSet(t);) (s ||= []).push(n), t = n.removeFromSet(t);
		} else r ? r.isInSet(e.marks) && (s = [r]) : s = e.marks;
		if (s && s.length) {
			let r = Math.min(o + e.nodeSize, n);
			for (let e = 0; e < s.length; e++) {
				let n = s[e], c;
				for (let e = 0; e < i.length; e++) {
					let t = i[e];
					t.step == a - 1 && n.eq(i[e].style) && (c = t);
				}
				c ? (c.to = r, c.step = a) : i.push({
					style: n,
					from: Math.max(o, t),
					to: r,
					step: a
				});
			}
		}
	}), i.forEach((t) => e.step(new Bt(t.from, t.to, t.style)));
}
function Kt(e, t, n, r = n.contentMatch, i = !0) {
	let a = e.doc.nodeAt(t), o = [], s = t + 1;
	for (let t = 0; t < a.childCount; t++) {
		let c = a.child(t), l = s + c.nodeSize, u = r.matchType(c.type);
		if (!u) o.push(new I(s, l, N.empty));
		else {
			r = u;
			for (let t = 0; t < c.marks.length; t++) n.allowsMarkType(c.marks[t].type) || e.step(new Bt(s, l, c.marks[t]));
			if (i && c.isText && n.whitespace != "pre") {
				let e, t = /\r?\n|\r/g, r;
				for (; e = t.exec(c.text);) r ||= new N(A.from(n.schema.text(" ", n.allowedMarks(c.marks))), 0, 0), o.push(new I(s + e.index, s + e.index + e[0].length, r));
			}
		}
		s = l;
	}
	if (!r.validEnd) {
		let t = r.fillBefore(A.empty, !0);
		e.replace(s, s, new N(t, 0, 0));
	}
	for (let t = o.length - 1; t >= 0; t--) e.step(o[t]);
}
function qt(e, t, n) {
	return (t == 0 || e.canReplace(t, e.childCount)) && (n == e.childCount || e.canReplace(0, n));
}
function Jt(e) {
	let t = e.parent.content.cutByIndex(e.startIndex, e.endIndex);
	for (let n = e.depth, r = 0, i = 0;; --n) {
		let a = e.$from.node(n), o = e.$from.index(n) + r, s = e.$to.indexAfter(n) - i;
		if (n < e.depth && a.canReplace(o, s, t)) return n;
		if (n == 0 || a.type.spec.isolating || !qt(a, o, s)) break;
		o && (r = 1), s < a.childCount && (i = 1);
	}
	return null;
}
function Yt(e, t, n) {
	let { $from: r, $to: i, depth: a } = t, o = r.before(a + 1), s = i.after(a + 1), c = o, l = s, u = A.empty, d = 0;
	for (let e = a, t = !1; e > n; e--) t || r.index(e) > 0 ? (t = !0, u = A.from(r.node(e).copy(u)), d++) : c--;
	let f = A.empty, p = 0;
	for (let e = a, t = !1; e > n; e--) t || i.after(e + 1) < i.end(e) ? (t = !0, f = A.from(i.node(e).copy(f)), p++) : l++;
	e.step(new L(c, l, o, s, new N(u.append(f), d, p), u.size - d, !0));
}
function Xt(e, t, n = null, r = e) {
	let i = Qt(e, t), a = i && $t(r, t);
	return a ? i.map(Zt).concat({
		type: t,
		attrs: n
	}).concat(a.map(Zt)) : null;
}
function Zt(e) {
	return {
		type: e,
		attrs: null
	};
}
function Qt(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.contentMatchAt(r).findWrapping(t);
	if (!a) return null;
	let o = a.length ? a[0] : t;
	return n.canReplaceWith(r, i, o) ? a : null;
}
function $t(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.child(r), o = t.contentMatch.findWrapping(a.type);
	if (!o) return null;
	let s = (o.length ? o[o.length - 1] : t).contentMatch;
	for (let e = r; s && e < i; e++) s = s.matchType(n.child(e).type);
	return !s || !s.validEnd ? null : o;
}
function en(e, t, n) {
	let r = A.empty;
	for (let e = n.length - 1; e >= 0; e--) {
		if (r.size) {
			let t = n[e].type.contentMatch.matchFragment(r);
			if (!t || !t.validEnd) throw RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
		}
		r = A.from(n[e].type.create(n[e].attrs, r));
	}
	let i = t.start, a = t.end;
	e.step(new L(i, a, i, a, new N(r, 0, 0), n.length, !0));
}
function tn(e, t, n, r, i) {
	if (!r.isTextblock) throw RangeError("Type given to setBlockType should be a textblock");
	let a = e.steps.length;
	e.doc.nodesBetween(t, n, (t, n) => {
		let o = typeof i == "function" ? i(t) : i;
		if (t.isTextblock && !t.hasMarkup(r, o) && an(e.doc, e.mapping.slice(a).map(n), r)) {
			let i = null;
			if (r.schema.linebreakReplacement) {
				let e = r.whitespace == "pre", t = !!r.contentMatch.matchType(r.schema.linebreakReplacement);
				e && !t ? i = !1 : !e && t && (i = !0);
			}
			i === !1 && rn(e, t, n, a), Kt(e, e.mapping.slice(a).map(n, 1), r, void 0, i === null);
			let s = e.mapping.slice(a), c = s.map(n, 1), l = s.map(n + t.nodeSize, 1);
			return e.step(new L(c, l, c + 1, l - 1, new N(A.from(r.create(o, null, t.marks)), 0, 0), 1, !0)), i === !0 && nn(e, t, n, a), !1;
		}
	});
}
function nn(e, t, n, r) {
	t.forEach((i, a) => {
		if (i.isText) {
			let o, s = /\r?\n|\r/g;
			for (; o = s.exec(i.text);) {
				let i = e.mapping.slice(r).map(n + 1 + a + o.index);
				e.replaceWith(i, i + 1, t.type.schema.linebreakReplacement.create());
			}
		}
	});
}
function rn(e, t, n, r) {
	t.forEach((i, a) => {
		if (i.type == i.type.schema.linebreakReplacement) {
			let i = e.mapping.slice(r).map(n + 1 + a);
			e.replaceWith(i, i + 1, t.type.schema.text("\n"));
		}
	});
}
function an(e, t, n) {
	let r = e.resolve(t), i = r.index();
	return r.parent.canReplaceWith(i, i + 1, n);
}
function on(e, t, n, r, i) {
	let a = e.doc.nodeAt(t);
	if (!a) throw RangeError("No node at given position");
	n ||= a.type;
	let o = n.create(r, null, i || a.marks);
	if (a.isLeaf) return e.replaceWith(t, t + a.nodeSize, o);
	if (!n.validContent(a.content)) throw RangeError("Invalid content for node type " + n.name);
	e.step(new L(t, t + a.nodeSize, t + 1, t + a.nodeSize - 1, new N(A.from(o), 0, 0), 1, !0));
}
function sn(e, t, n = 1, r) {
	let i = e.resolve(t), a = i.depth - n, o = r && r[r.length - 1] || i.parent;
	if (a < 0 || i.parent.type.spec.isolating || !i.parent.canReplace(i.index(), i.parent.childCount) || !o.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount))) return !1;
	for (let e = i.depth - 1, t = n - 2; e > a; e--, t--) {
		let n = i.node(e), a = i.index(e);
		if (n.type.spec.isolating) return !1;
		let o = n.content.cutByIndex(a, n.childCount), s = r && r[t + 1];
		s && (o = o.replaceChild(0, s.type.create(s.attrs)));
		let c = r && r[t] || n;
		if (!n.canReplace(a + 1, n.childCount) || !c.type.validContent(o)) return !1;
	}
	let s = i.indexAfter(a), c = r && r[0];
	return i.node(a).canReplaceWith(s, s, c ? c.type : i.node(a + 1).type);
}
function cn(e, t, n = 1, r) {
	let i = e.doc.resolve(t), a = A.empty, o = A.empty;
	for (let e = i.depth, t = i.depth - n, s = n - 1; e > t; e--, s--) {
		a = A.from(i.node(e).copy(a));
		let t = r && r[s];
		o = A.from(t ? t.type.create(t.attrs, o) : i.node(e).copy(o));
	}
	e.step(new I(t, t, new N(a.append(o), n, n), !0));
}
function ln(e, t) {
	let n = e.resolve(t), r = n.index();
	return dn(n.nodeBefore, n.nodeAfter) && n.parent.canReplace(r, r + 1);
}
function un(e, t) {
	t.content.size || e.type.compatibleContent(t.type);
	let n = e.contentMatchAt(e.childCount), { linebreakReplacement: r } = e.type.schema;
	for (let i = 0; i < t.childCount; i++) {
		let a = t.child(i), o = a.type == r ? e.type.schema.nodes.text : a.type;
		if (n = n.matchType(o), !n || !e.type.allowsMarks(a.marks)) return !1;
	}
	return n.validEnd;
}
function dn(e, t) {
	return !!(e && t && !e.isLeaf && un(e, t));
}
function fn(e, t, n = -1) {
	let r = e.resolve(t);
	for (let e = r.depth;; e--) {
		let i, a, o = r.index(e);
		if (e == r.depth ? (i = r.nodeBefore, a = r.nodeAfter) : n > 0 ? (i = r.node(e + 1), o++, a = r.node(e).maybeChild(o)) : (i = r.node(e).maybeChild(o - 1), a = r.node(e + 1)), i && !i.isTextblock && dn(i, a) && r.node(e).canReplace(o, o + 1)) return t;
		if (e == 0) break;
		t = n < 0 ? r.before(e) : r.after(e);
	}
}
function pn(e, t, n) {
	let r = null, { linebreakReplacement: i } = e.doc.type.schema, a = e.doc.resolve(t - n), o = a.node().type;
	if (i && o.inlineContent) {
		let e = o.whitespace == "pre", t = !!o.contentMatch.matchType(i);
		e && !t ? r = !1 : !e && t && (r = !0);
	}
	let s = e.steps.length;
	if (r === !1) {
		let r = e.doc.resolve(t + n);
		rn(e, r.node(), r.before(), s);
	}
	o.inlineContent && Kt(e, t + n - 1, o, a.node().contentMatchAt(a.index()), r == null);
	let c = e.mapping.slice(s), l = c.map(t - n);
	if (e.step(new I(l, c.map(t + n, -1), N.empty, !0)), r === !0) {
		let t = e.doc.resolve(l);
		nn(e, t.node(), t.before(), e.steps.length);
	}
	return e;
}
function mn(e, t, n) {
	let r = e.resolve(t);
	if (r.parent.canReplaceWith(r.index(), r.index(), n)) return t;
	if (r.parentOffset == 0) for (let e = r.depth - 1; e >= 0; e--) {
		let t = r.index(e);
		if (r.node(e).canReplaceWith(t, t, n)) return r.before(e + 1);
		if (t > 0) return null;
	}
	if (r.parentOffset == r.parent.content.size) for (let e = r.depth - 1; e >= 0; e--) {
		let t = r.indexAfter(e);
		if (r.node(e).canReplaceWith(t, t, n)) return r.after(e + 1);
		if (t < r.node(e).childCount) return null;
	}
	return null;
}
function hn(e, t, n) {
	let r = e.resolve(t);
	if (!n.content.size) return t;
	let i = n.content;
	for (let e = 0; e < n.openStart; e++) i = i.firstChild.content;
	for (let e = 1; e <= (n.openStart == 0 && n.size ? 2 : 1); e++) for (let t = r.depth; t >= 0; t--) {
		let n = t == r.depth ? 0 : r.pos <= (r.start(t + 1) + r.end(t + 1)) / 2 ? -1 : 1, a = r.index(t) + +(n > 0), o = r.node(t), s = !1;
		if (e == 1) s = o.canReplace(a, a, i);
		else {
			let e = o.contentMatchAt(a).findWrapping(i.firstChild.type);
			s = e && o.canReplaceWith(a, a, e[0]);
		}
		if (s) return n == 0 ? r.pos : n < 0 ? r.before(t + 1) : r.after(t + 1);
	}
	return null;
}
function gn(e, t, n = t, r = N.empty) {
	if (t == n && !r.size) return null;
	let i = e.resolve(t), a = e.resolve(n);
	return _n(i, a, r) ? new I(t, n, r) : new vn(i, a, r).fit();
}
function _n(e, t, n) {
	return !n.openStart && !n.openEnd && e.start() == t.start() && e.parent.canReplace(e.index(), t.index(), n.content);
}
var vn = class {
	constructor(e, t, n) {
		this.$from = e, this.$to = t, this.unplaced = n, this.frontier = [], this.placed = A.empty;
		for (let t = 0; t <= e.depth; t++) {
			let n = e.node(t);
			this.frontier.push({
				type: n.type,
				match: n.contentMatchAt(e.indexAfter(t))
			});
		}
		for (let t = e.depth; t > 0; t--) this.placed = A.from(e.node(t).copy(this.placed));
	}
	get depth() {
		return this.frontier.length - 1;
	}
	fit() {
		for (; this.unplaced.size;) {
			let e = this.findFittable();
			e ? this.placeNodes(e) : this.openMore() || this.dropNode();
		}
		let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, n = this.$from, r = this.close(e < 0 ? this.$to : n.doc.resolve(e));
		if (!r) return null;
		let i = this.placed, a = n.depth, o = r.depth;
		for (; a && o && i.childCount == 1;) i = i.firstChild.content, a--, o--;
		let s = new N(i, a, o);
		return e > -1 ? new L(n.pos, e, this.$to.pos, this.$to.end(), s, t) : s.size || n.pos != this.$to.pos ? new I(n.pos, r.pos, s) : null;
	}
	findFittable() {
		let e = this.unplaced.openStart;
		for (let t = this.unplaced.content, n = 0, r = this.unplaced.openEnd; n < e; n++) {
			let i = t.firstChild;
			if (t.childCount > 1 && (r = 0), i.type.spec.isolating && r <= n) {
				e = n;
				break;
			}
			t = i.content;
		}
		for (let t = 1; t <= 2; t++) for (let n = t == 1 ? e : this.unplaced.openStart; n >= 0; n--) {
			let e, r = null;
			n ? (r = xn(this.unplaced.content, n - 1).firstChild, e = r.content) : e = this.unplaced.content;
			let i = e.firstChild;
			for (let e = this.depth; e >= 0; e--) {
				let { type: a, match: o } = this.frontier[e], s, c = null;
				if (t == 1 && (i ? o.matchType(i.type) || (c = o.fillBefore(A.from(i), !1)) : r && a.compatibleContent(r.type))) return {
					sliceDepth: n,
					frontierDepth: e,
					parent: r,
					inject: c
				};
				if (t == 2 && i && (s = o.findWrapping(i.type))) return {
					sliceDepth: n,
					frontierDepth: e,
					parent: r,
					wrap: s
				};
				if (r && o.matchType(r.type)) break;
			}
		}
	}
	openMore() {
		let { content: e, openStart: t, openEnd: n } = this.unplaced;
		return En(e, -1) <= t ? !1 : (this.unplaced.size > 1 && En(e, 1) > n && n++, this.unplaced = new N(e, t + 1, n), !0);
	}
	dropNode() {
		let { content: e, openStart: t, openEnd: n } = this.unplaced, r = xn(e, t);
		if (r.childCount <= 1 && t > 0) {
			let i = e.size - t <= t + r.size;
			this.unplaced = new N(yn(e, t - 1, 1), t - 1, i ? t - 1 : n);
		} else this.unplaced = new N(yn(e, t, 1), t, n);
	}
	placeNodes({ sliceDepth: e, frontierDepth: t, parent: n, inject: r, wrap: i }) {
		for (; this.depth > t;) this.closeFrontierNode();
		if (i) for (let e = 0; e < i.length; e++) this.openFrontierNode(i[e]);
		let a = this.unplaced, o = n ? n.content : a.content, s = a.openStart - e, c = 0, l = [], { match: u, type: d } = this.frontier[t];
		if (r) {
			for (let e = 0; e < r.childCount; e++) l.push(r.child(e));
			u = u.matchFragment(r);
		}
		let f = o.size + e - (a.content.size - a.openEnd);
		for (; c < o.childCount;) {
			let e = o.child(c), t = u.matchType(e.type);
			if (!t) break;
			c++, (c > 1 || s == 0 || e.content.size) && (u = t, l.push(Sn(e.mark(d.allowedMarks(e.marks)), c == 1 ? s : 0, c == o.childCount ? f : -1)));
		}
		let p = c == o.childCount;
		p || (f = -1), this.placed = bn(this.placed, t, A.from(l)), this.frontier[t].match = u, p && f < 0 && n && n.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
		for (let e = 0, t = o; e < f; e++) {
			let e = t.lastChild;
			this.frontier.push({
				type: e.type,
				match: e.contentMatchAt(e.childCount)
			}), t = e.content;
		}
		this.unplaced = p ? e == 0 ? N.empty : new N(yn(a.content, e - 1, 1), e - 1, f < 0 ? a.openEnd : e - 1) : new N(yn(a.content, e, c), a.openStart, a.openEnd);
	}
	mustMoveInline() {
		if (!this.$to.parent.isTextblock) return -1;
		let e = this.frontier[this.depth], t;
		if (!e.type.isTextblock || !Cn(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth) return -1;
		let { depth: n } = this.$to, r = this.$to.after(n);
		for (; n > 1 && r == this.$to.end(--n);) ++r;
		return r;
	}
	findCloseLevel(e) {
		scan: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
			let { match: n, type: r } = this.frontier[t], i = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), a = Cn(e, t, r, n, i);
			if (a) {
				for (let n = t - 1; n >= 0; n--) {
					let { match: t, type: r } = this.frontier[n], i = Cn(e, n, r, t, !0);
					if (!i || i.childCount) continue scan;
				}
				return {
					depth: t,
					fit: a,
					move: i ? e.doc.resolve(e.after(t + 1)) : e
				};
			}
		}
	}
	close(e) {
		let t = this.findCloseLevel(e);
		if (!t) return null;
		for (; this.depth > t.depth;) this.closeFrontierNode();
		t.fit.childCount && (this.placed = bn(this.placed, t.depth, t.fit)), e = t.move;
		for (let n = t.depth + 1; n <= e.depth; n++) {
			let t = e.node(n), r = t.type.contentMatch.fillBefore(t.content, !0, e.index(n));
			this.openFrontierNode(t.type, t.attrs, r);
		}
		return e;
	}
	openFrontierNode(e, t = null, n) {
		let r = this.frontier[this.depth];
		r.match = r.match.matchType(e), this.placed = bn(this.placed, this.depth, A.from(e.create(t, n))), this.frontier.push({
			type: e,
			match: e.contentMatch
		});
	}
	closeFrontierNode() {
		let e = this.frontier.pop().match.fillBefore(A.empty, !0);
		e.childCount && (this.placed = bn(this.placed, this.frontier.length, e));
	}
};
function yn(e, t, n) {
	return t == 0 ? e.cutByIndex(n, e.childCount) : e.replaceChild(0, e.firstChild.copy(yn(e.firstChild.content, t - 1, n)));
}
function bn(e, t, n) {
	return t == 0 ? e.append(n) : e.replaceChild(e.childCount - 1, e.lastChild.copy(bn(e.lastChild.content, t - 1, n)));
}
function xn(e, t) {
	for (let n = 0; n < t; n++) e = e.firstChild.content;
	return e;
}
function Sn(e, t, n) {
	if (t <= 0) return e;
	let r = e.content;
	return t > 1 && (r = r.replaceChild(0, Sn(r.firstChild, t - 1, r.childCount == 1 ? n - 1 : 0))), t > 0 && (r = e.type.contentMatch.fillBefore(r).append(r), n <= 0 && (r = r.append(e.type.contentMatch.matchFragment(r).fillBefore(A.empty, !0)))), e.copy(r);
}
function Cn(e, t, n, r, i) {
	let a = e.node(t), o = i ? e.indexAfter(t) : e.index(t);
	if (o == a.childCount && !n.compatibleContent(a.type)) return null;
	let s = r.fillBefore(a.content, !0, o);
	return s && !wn(n, a.content, o) ? s : null;
}
function wn(e, t, n) {
	for (let r = n; r < t.childCount; r++) if (!e.allowsMarks(t.child(r).marks)) return !0;
	return !1;
}
function Tn(e) {
	return e.spec.defining || e.spec.definingForContent;
}
function En(e, t) {
	for (let n = 0;; n++) {
		let r = t < 0 ? e.firstChild : e.lastChild;
		if (!r || r.isAtom) return n;
		e = r.content;
	}
}
function Dn(e, t, n, r) {
	if (!r.size) return e.deleteRange(t, n);
	let i = e.doc.resolve(t), a = e.doc.resolve(n);
	if (_n(i, a, r)) return e.step(new I(t, n, r));
	let o = jn(i, a);
	o[o.length - 1] == 0 && o.pop();
	let s = -(i.depth + 1);
	o.unshift(s);
	for (let e = i.depth, t = i.pos - 1; e > 0; e--, t--) {
		let n = i.node(e).type.spec;
		if (n.defining || n.definingAsContext || n.isolating) break;
		o.indexOf(e) > -1 ? s = e : i.before(e) == t && o.splice(1, 0, -e);
	}
	let c = o.indexOf(s), l = [], u = r.openStart;
	for (let e = r.content, t = 0;; t++) {
		let n = e.firstChild;
		if (l.push(n), t == r.openStart) break;
		e = n.content;
	}
	for (let e = u - 1; e >= 0; e--) {
		let t = l[e], n = Tn(t.type);
		if (n && !t.sameMarkup(i.node(Math.abs(s) - 1))) u = e;
		else if (n || !t.type.isTextblock) break;
	}
	for (let t = r.openStart; t >= 0; t--) {
		let s = (t + u + 1) % (r.openStart + 1), d = l[s];
		if (d) for (let t = 0; t < o.length; t++) {
			let l = o[(t + c) % o.length], u = !0;
			l < 0 && (u = !1, l = -l);
			let f = i.node(l - 1), p = i.index(l - 1);
			if (f.canReplaceWith(p, p, d.type, d.marks)) return e.replace(i.before(l), u ? a.after(l) : n, new N(On(r.content, 0, r.openStart, s), s, r.openEnd));
		}
	}
	let d = e.steps.length;
	for (let s = o.length - 1; s >= 0 && (e.replace(t, n, r), !(e.steps.length > d)); s--) {
		let e = o[s];
		e < 0 || (t = i.before(e), n = a.after(e));
	}
}
function On(e, t, n, r, i) {
	if (t < n) {
		let i = e.firstChild;
		e = e.replaceChild(0, i.copy(On(i.content, t + 1, n, r, i)));
	}
	if (t > r) {
		let t = i.contentMatchAt(0), n = t.fillBefore(e).append(e);
		e = n.append(t.matchFragment(n).fillBefore(A.empty, !0));
	}
	return e;
}
function kn(e, t, n, r) {
	if (!r.isInline && t == n && e.doc.resolve(t).parent.content.size) {
		let i = mn(e.doc, t, r.type);
		i != null && (t = n = i);
	}
	e.replaceRange(t, n, new N(A.from(r), 0, 0));
}
function An(e, t, n) {
	let r = e.doc.resolve(t), i = e.doc.resolve(n);
	if (r.parent.isTextblock && i.parent.isTextblock && r.start() != i.start() && r.parentOffset == 0 && i.parentOffset == 0) {
		let a = r.sharedDepth(n), o = !1;
		for (let e = r.depth; e > a; e--) r.node(e).type.spec.isolating && (o = !0);
		for (let e = i.depth; e > a; e--) i.node(e).type.spec.isolating && (o = !0);
		if (!o) {
			for (let e = r.depth; e > 0 && t == r.start(e); e--) t = r.before(e);
			for (let e = i.depth; e > 0 && n == i.start(e); e--) n = i.before(e);
			r = e.doc.resolve(t), i = e.doc.resolve(n);
		}
	}
	let a = jn(r, i);
	for (let t = 0; t < a.length; t++) {
		let n = a[t], o = t == a.length - 1;
		if (o && n == 0 || r.node(n).type.contentMatch.validEnd) return e.delete(r.start(n), i.end(n));
		if (n > 0 && (o || r.node(n - 1).canReplace(r.index(n - 1), i.indexAfter(n - 1)))) return e.delete(r.before(n), i.after(n));
	}
	for (let a = 1; a <= r.depth && a <= i.depth; a++) if (t - r.start(a) == r.depth - a && n > r.end(a) && i.end(a) - n != i.depth - a && r.start(a - 1) == i.start(a - 1) && r.node(a - 1).canReplace(r.index(a - 1), i.index(a - 1))) return e.delete(r.before(a), n);
	e.delete(t, n);
}
function jn(e, t) {
	let n = [], r = Math.min(e.depth, t.depth);
	for (let i = r; i >= 0; i--) {
		let r = e.start(i);
		if (r < e.pos - (e.depth - i) || t.end(i) > t.pos + (t.depth - i) || e.node(i).type.spec.isolating || t.node(i).type.spec.isolating) break;
		(r == t.start(i) || i == e.depth && i == t.depth && e.parent.inlineContent && t.parent.inlineContent && i && t.start(i - 1) == r - 1) && n.push(i);
	}
	return n;
}
var Mn = class e extends P {
	constructor(e, t, n) {
		super(), this.pos = e, this.attr = t, this.value = n;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return F.fail("No node at attribute step's position");
		let n = Object.create(null);
		for (let e in t.attrs) n[e] = t.attrs[e];
		n[this.attr] = this.value;
		let r = t.type.create(n, null, t.marks);
		return F.fromReplace(e, this.pos, this.pos + 1, new N(A.from(r), 0, +!t.isLeaf));
	}
	getMap() {
		return Ft.empty;
	}
	invert(t) {
		return new e(this.pos, this.attr, t.nodeAt(this.pos).attrs[this.attr]);
	}
	map(t) {
		let n = t.mapResult(this.pos, 1);
		return n.deletedAfter ? null : new e(n.pos, this.attr, this.value);
	}
	toJSON() {
		return {
			stepType: "attr",
			pos: this.pos,
			attr: this.attr,
			value: this.value
		};
	}
	static fromJSON(t, n) {
		if (typeof n.pos != "number" || typeof n.attr != "string") throw RangeError("Invalid input for AttrStep.fromJSON");
		return new e(n.pos, n.attr, n.value);
	}
};
P.jsonID("attr", Mn);
var Nn = class e extends P {
	constructor(e, t) {
		super(), this.attr = e, this.value = t;
	}
	apply(e) {
		let t = Object.create(null);
		for (let n in e.attrs) t[n] = e.attrs[n];
		t[this.attr] = this.value;
		let n = e.type.create(t, e.content, e.marks);
		return F.ok(n);
	}
	getMap() {
		return Ft.empty;
	}
	invert(t) {
		return new e(this.attr, t.attrs[this.attr]);
	}
	map(e) {
		return this;
	}
	toJSON() {
		return {
			stepType: "docAttr",
			attr: this.attr,
			value: this.value
		};
	}
	static fromJSON(t, n) {
		if (typeof n.attr != "string") throw RangeError("Invalid input for DocAttrStep.fromJSON");
		return new e(n.attr, n.value);
	}
};
P.jsonID("docAttr", Nn);
var Pn = class extends Error {};
Pn = function e(t) {
	let n = Error.call(this, t);
	return n.__proto__ = e.prototype, n;
}, Pn.prototype = Object.create(Error.prototype), Pn.prototype.constructor = Pn, Pn.prototype.name = "TransformError";
var Fn = class {
	constructor(e) {
		this.doc = e, this.steps = [], this.docs = [], this.mapping = new It();
	}
	get before() {
		return this.docs.length ? this.docs[0] : this.doc;
	}
	step(e) {
		let t = this.maybeStep(e);
		if (t.failed) throw new Pn(t.failed);
		return this;
	}
	maybeStep(e) {
		let t = e.apply(this.doc);
		return t.failed || this.addStep(e, t.doc), t;
	}
	get docChanged() {
		return this.steps.length > 0;
	}
	changedRange() {
		let e = 1e9, t = -1e9;
		for (let n = 0; n < this.mapping.maps.length; n++) {
			let r = this.mapping.maps[n];
			n && (e = r.map(e, 1), t = r.map(t, -1)), r.forEach((n, r, i, a) => {
				e = Math.min(e, i), t = Math.max(t, a);
			});
		}
		return e == 1e9 ? null : {
			from: e,
			to: t
		};
	}
	addStep(e, t) {
		this.docs.push(this.doc), this.steps.push(e), this.mapping.appendMap(e.getMap()), this.doc = t;
	}
	replace(e, t = e, n = N.empty) {
		let r = gn(this.doc, e, t, n);
		return r && this.step(r), this;
	}
	replaceWith(e, t, n) {
		return this.replace(e, t, new N(A.from(n), 0, 0));
	}
	delete(e, t) {
		return this.replace(e, t, N.empty);
	}
	insert(e, t) {
		return this.replaceWith(e, e, t);
	}
	replaceRange(e, t, n) {
		return Dn(this, e, t, n), this;
	}
	replaceRangeWith(e, t, n) {
		return kn(this, e, t, n), this;
	}
	deleteRange(e, t) {
		return An(this, e, t), this;
	}
	lift(e, t) {
		return Yt(this, e, t), this;
	}
	join(e, t = 1) {
		return pn(this, e, t), this;
	}
	wrap(e, t) {
		return en(this, e, t), this;
	}
	setBlockType(e, t = e, n, r = null) {
		return tn(this, e, t, n, r), this;
	}
	setNodeMarkup(e, t, n = null, r) {
		return on(this, e, t, n, r), this;
	}
	setNodeAttribute(e, t, n) {
		return this.step(new Mn(e, t, n)), this;
	}
	setDocAttribute(e, t) {
		return this.step(new Nn(e, t)), this;
	}
	addNodeMark(e, t) {
		return this.step(new Vt(e, t)), this;
	}
	removeNodeMark(e, t) {
		let n = this.doc.nodeAt(e);
		if (!n) throw RangeError("No node at position " + e);
		if (t instanceof M) t.isInSet(n.marks) && this.step(new Ht(e, t));
		else {
			let r = n.marks, i, a = [];
			for (; i = t.isInSet(r);) a.push(new Ht(e, i)), r = i.removeFromSet(r);
			for (let e = a.length - 1; e >= 0; e--) this.step(a[e]);
		}
		return this;
	}
	split(e, t = 1, n) {
		return cn(this, e, t, n), this;
	}
	addMark(e, t, n) {
		return Wt(this, e, t, n), this;
	}
	removeMark(e, t, n) {
		return Gt(this, e, t, n), this;
	}
	clearIncompatible(e, t, n) {
		return Kt(this, e, t, n), this;
	}
}, In = Object.create(null), R = class {
	constructor(e, t, n) {
		this.$anchor = e, this.$head = t, this.ranges = n || [new Ln(e.min(t), e.max(t))];
	}
	get anchor() {
		return this.$anchor.pos;
	}
	get head() {
		return this.$head.pos;
	}
	get from() {
		return this.$from.pos;
	}
	get to() {
		return this.$to.pos;
	}
	get $from() {
		return this.ranges[0].$from;
	}
	get $to() {
		return this.ranges[0].$to;
	}
	get empty() {
		let e = this.ranges;
		for (let t = 0; t < e.length; t++) if (e[t].$from.pos != e[t].$to.pos) return !1;
		return !0;
	}
	content() {
		return this.$from.doc.slice(this.from, this.to, !0);
	}
	replace(e, t = N.empty) {
		let n = t.content.lastChild, r = null;
		for (let e = 0; e < t.openEnd; e++) r = n, n = n.lastChild;
		let i = e.steps.length, a = this.ranges;
		for (let o = 0; o < a.length; o++) {
			let { $from: s, $to: c } = a[o], l = e.mapping.slice(i);
			e.replaceRange(l.map(s.pos), l.map(c.pos), o ? N.empty : t), o == 0 && Gn(e, i, (n ? n.isInline : r && r.isTextblock) ? -1 : 1);
		}
	}
	replaceWith(e, t) {
		let n = e.steps.length, r = this.ranges;
		for (let i = 0; i < r.length; i++) {
			let { $from: a, $to: o } = r[i], s = e.mapping.slice(n), c = s.map(a.pos), l = s.map(o.pos);
			i ? e.deleteRange(c, l) : (e.replaceRangeWith(c, l, t), Gn(e, n, t.isInline ? -1 : 1));
		}
	}
	static findFrom(e, t, n = !1) {
		let r = e.parent.inlineContent ? new z(e) : Wn(e.node(0), e.parent, e.pos, e.index(), t, n);
		if (r) return r;
		for (let r = e.depth - 1; r >= 0; r--) {
			let i = t < 0 ? Wn(e.node(0), e.node(r), e.before(r + 1), e.index(r), t, n) : Wn(e.node(0), e.node(r), e.after(r + 1), e.index(r) + 1, t, n);
			if (i) return i;
		}
		return null;
	}
	static near(e, t = 1) {
		return this.findFrom(e, t) || this.findFrom(e, -t) || new Hn(e.node(0));
	}
	static atStart(e) {
		return Wn(e, e, 0, 0, 1) || new Hn(e);
	}
	static atEnd(e) {
		return Wn(e, e, e.content.size, e.childCount, -1) || new Hn(e);
	}
	static fromJSON(e, t) {
		if (!t || !t.type) throw RangeError("Invalid input for Selection.fromJSON");
		let n = In[t.type];
		if (!n) throw RangeError(`No selection type ${t.type} defined`);
		return n.fromJSON(e, t);
	}
	static jsonID(e, t) {
		if (e in In) throw RangeError("Duplicate use of selection JSON ID " + e);
		return In[e] = t, t.prototype.jsonID = e, t;
	}
	getBookmark() {
		return z.between(this.$anchor, this.$head).getBookmark();
	}
};
R.prototype.visible = !0;
var Ln = class {
	constructor(e, t) {
		this.$from = e, this.$to = t;
	}
}, Rn = !1;
function zn(e) {
	!Rn && !e.parent.inlineContent && (Rn = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + e.parent.type.name + ")"));
}
var z = class e extends R {
	constructor(e, t = e) {
		zn(e), zn(t), super(e, t);
	}
	get $cursor() {
		return this.$anchor.pos == this.$head.pos ? this.$head : null;
	}
	map(t, n) {
		let r = t.resolve(n.map(this.head));
		if (!r.parent.inlineContent) return R.near(r);
		let i = t.resolve(n.map(this.anchor));
		return new e(i.parent.inlineContent ? i : r, r);
	}
	replace(e, t = N.empty) {
		if (super.replace(e, t), t == N.empty) {
			let t = this.$from.marksAcross(this.$to);
			t && e.ensureMarks(t);
		}
	}
	eq(t) {
		return t instanceof e && t.anchor == this.anchor && t.head == this.head;
	}
	getBookmark() {
		return new Bn(this.anchor, this.head);
	}
	toJSON() {
		return {
			type: "text",
			anchor: this.anchor,
			head: this.head
		};
	}
	static fromJSON(t, n) {
		if (typeof n.anchor != "number" || typeof n.head != "number") throw RangeError("Invalid input for TextSelection.fromJSON");
		return new e(t.resolve(n.anchor), t.resolve(n.head));
	}
	static create(e, t, n = t) {
		let r = e.resolve(t);
		return new this(r, n == t ? r : e.resolve(n));
	}
	static between(t, n, r) {
		let i = t.pos - n.pos;
		if ((!r || i) && (r = i >= 0 ? 1 : -1), !n.parent.inlineContent) {
			let e = R.findFrom(n, r, !0) || R.findFrom(n, -r, !0);
			if (e) n = e.$head;
			else return R.near(n, r);
		}
		return t.parent.inlineContent || (i == 0 ? t = n : (t = (R.findFrom(t, -r, !0) || R.findFrom(t, r, !0)).$anchor, t.pos < n.pos != i < 0 && (t = n))), new e(t, n);
	}
};
R.jsonID("text", z);
var Bn = class e {
	constructor(e, t) {
		this.anchor = e, this.head = t;
	}
	map(t) {
		return new e(t.map(this.anchor), t.map(this.head));
	}
	resolve(e) {
		return z.between(e.resolve(this.anchor), e.resolve(this.head));
	}
}, B = class e extends R {
	constructor(e) {
		let t = e.nodeAfter, n = e.node(0).resolve(e.pos + t.nodeSize);
		super(e, n), this.node = t;
	}
	map(t, n) {
		let { deleted: r, pos: i } = n.mapResult(this.anchor), a = t.resolve(i);
		return r ? R.near(a) : new e(a);
	}
	content() {
		return new N(A.from(this.node), 0, 0);
	}
	eq(t) {
		return t instanceof e && t.anchor == this.anchor;
	}
	toJSON() {
		return {
			type: "node",
			anchor: this.anchor
		};
	}
	getBookmark() {
		return new Vn(this.anchor);
	}
	static fromJSON(t, n) {
		if (typeof n.anchor != "number") throw RangeError("Invalid input for NodeSelection.fromJSON");
		return new e(t.resolve(n.anchor));
	}
	static create(t, n) {
		return new e(t.resolve(n));
	}
	static isSelectable(e) {
		return !e.isText && e.type.spec.selectable !== !1;
	}
};
B.prototype.visible = !1, R.jsonID("node", B);
var Vn = class e {
	constructor(e) {
		this.anchor = e;
	}
	map(t) {
		let { deleted: n, pos: r } = t.mapResult(this.anchor);
		return n ? new Bn(r, r) : new e(r);
	}
	resolve(e) {
		let t = e.resolve(this.anchor), n = t.nodeAfter;
		return n && B.isSelectable(n) ? new B(t) : R.near(t);
	}
}, Hn = class e extends R {
	constructor(e) {
		super(e.resolve(0), e.resolve(e.content.size));
	}
	replace(e, t = N.empty) {
		if (t == N.empty) {
			e.delete(0, e.doc.content.size);
			let t = R.atStart(e.doc);
			t.eq(e.selection) || e.setSelection(t);
		} else super.replace(e, t);
	}
	toJSON() {
		return { type: "all" };
	}
	static fromJSON(t) {
		return new e(t);
	}
	map(t) {
		return new e(t);
	}
	eq(t) {
		return t instanceof e;
	}
	getBookmark() {
		return Un;
	}
};
R.jsonID("all", Hn);
var Un = {
	map() {
		return this;
	},
	resolve(e) {
		return new Hn(e);
	}
};
function Wn(e, t, n, r, i, a = !1) {
	if (t.inlineContent) return z.create(e, n);
	for (let o = r - (i > 0 ? 0 : 1); i > 0 ? o < t.childCount : o >= 0; o += i) {
		let r = t.child(o);
		if (!r.isAtom) {
			let t = Wn(e, r, n + i, i < 0 ? r.childCount : 0, i, a);
			if (t) return t;
		} else if (!a && B.isSelectable(r)) return B.create(e, n - (i < 0 ? r.nodeSize : 0));
		n += r.nodeSize * i;
	}
	return null;
}
function Gn(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof I || i instanceof L)) return;
	let a = e.mapping.maps[r], o;
	a.forEach((e, t, n, r) => {
		o ??= r;
	}), e.setSelection(R.near(e.doc.resolve(o), n));
}
function Kn(e, t) {
	return !t || !e ? e : e.bind(t);
}
var qn = class {
	constructor(e, t, n) {
		this.name = e, this.init = Kn(t.init, n), this.apply = Kn(t.apply, n);
	}
};
new qn("doc", {
	init(e) {
		return e.doc || e.schema.topNodeType.createAndFill();
	},
	apply(e) {
		return e.doc;
	}
}), new qn("selection", {
	init(e, t) {
		return e.selection || R.atStart(t.doc);
	},
	apply(e) {
		return e.selection;
	}
}), new qn("storedMarks", {
	init(e) {
		return e.storedMarks || null;
	},
	apply(e, t, n, r) {
		return r.selection.$cursor ? e.storedMarks : null;
	}
}), new qn("scrollToSelection", {
	init() {
		return 0;
	},
	apply(e, t) {
		return e.scrolledIntoView ? t + 1 : t;
	}
});
function Jn(e, t, n) {
	for (let r in e) {
		let i = e[r];
		i instanceof Function ? i = i.bind(t) : r == "handleDOMEvents" && (i = Jn(i, t, {})), n[r] = i;
	}
	return n;
}
var Yn = class {
	constructor(e) {
		this.spec = e, this.props = {}, e.props && Jn(e.props, this, this.props), this.key = e.key ? e.key.key : Zn("plugin");
	}
	getState(e) {
		return e[this.key];
	}
}, Xn = Object.create(null);
function Zn(e) {
	return e in Xn ? e + "$" + ++Xn[e] : (Xn[e] = 0, e + "$");
}
var Qn = class {
	constructor(e = "key") {
		this.key = Zn(e);
	}
	get(e) {
		return e.config.pluginsByKey[this.key];
	}
	getState(e) {
		return e[this.key];
	}
}, $n = (e, t) => !e.selection.empty && (t && t(e.tr.deleteSelection().scrollIntoView()), !0);
function er(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("backward", e) : n.parentOffset > 0) ? null : n;
}
var tr = (e, t, n) => {
	let r = er(e, n);
	if (!r) return !1;
	let i = sr(r);
	if (!i) {
		let n = r.blockRange(), i = n && Jt(n);
		return i != null && (t && t(e.tr.lift(n, i).scrollIntoView()), !0);
	}
	let a = i.nodeBefore;
	if (Tr(e, i, t, -1)) return !0;
	if (r.parent.content.size == 0 && (ar(a, "end") || B.isSelectable(a))) for (let n = r.depth;; n--) {
		let o = gn(e.doc, r.before(n), r.after(n), N.empty);
		if (o && o.slice.size < o.to - o.from) {
			if (t) {
				let n = e.tr.step(o);
				n.setSelection(ar(a, "end") ? R.findFrom(n.doc.resolve(n.mapping.map(i.pos, -1)), -1) : B.create(n.doc, i.pos - a.nodeSize)), t(n.scrollIntoView());
			}
			return !0;
		}
		if (n == 1 || r.node(n - 1).childCount > 1) break;
	}
	return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos - a.nodeSize, i.pos).scrollIntoView()), !0) : !1;
}, nr = (e, t, n) => {
	let r = er(e, n);
	if (!r) return !1;
	let i = sr(r);
	return i ? ir(e, i, t) : !1;
}, rr = (e, t, n) => {
	let r = cr(e, n);
	if (!r) return !1;
	let i = dr(r);
	return i ? ir(e, i, t) : !1;
};
function ir(e, t, n) {
	let r = t.nodeBefore, i = t.pos - 1;
	for (; !r.isTextblock; i--) {
		if (r.type.spec.isolating) return !1;
		let e = r.lastChild;
		if (!e) return !1;
		r = e;
	}
	let a = t.nodeAfter, o = t.pos + 1;
	for (; !a.isTextblock; o++) {
		if (a.type.spec.isolating) return !1;
		let e = a.firstChild;
		if (!e) return !1;
		a = e;
	}
	let s = gn(e.doc, i, o, N.empty);
	if (!s || s.from != i || s instanceof I && s.slice.size >= o - i) return !1;
	if (n) {
		let t = e.tr.step(s);
		t.setSelection(z.create(t.doc, i)), n(t.scrollIntoView());
	}
	return !0;
}
function ar(e, t, n = !1) {
	for (let r = e; r; r = t == "start" ? r.firstChild : r.lastChild) {
		if (r.isTextblock) return !0;
		if (n && r.childCount != 1) return !1;
	}
	return !1;
}
var or = (e, t, n) => {
	let { $head: r, empty: i } = e.selection, a = r;
	if (!i) return !1;
	if (r.parent.isTextblock) {
		if (n ? !n.endOfTextblock("backward", e) : r.parentOffset > 0) return !1;
		a = sr(r);
	}
	let o = a && a.nodeBefore;
	return !o || !B.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(B.create(e.doc, a.pos - o.nodeSize)).scrollIntoView()), !0);
};
function sr(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		if (e.index(t) > 0) return e.doc.resolve(e.before(t + 1));
		if (e.node(t).type.spec.isolating) break;
	}
	return null;
}
function cr(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("forward", e) : n.parentOffset < n.parent.content.size) ? null : n;
}
var lr = (e, t, n) => {
	let r = cr(e, n);
	if (!r) return !1;
	let i = dr(r);
	if (!i) return !1;
	let a = i.nodeAfter;
	if (Tr(e, i, t, 1)) return !0;
	if (r.parent.content.size == 0 && (ar(a, "start") || B.isSelectable(a))) {
		let n = gn(e.doc, r.before(), r.after(), N.empty);
		if (n && n.slice.size < n.to - n.from) {
			if (t) {
				let r = e.tr.step(n);
				r.setSelection(ar(a, "start") ? R.findFrom(r.doc.resolve(r.mapping.map(i.pos)), 1) : B.create(r.doc, r.mapping.map(i.pos))), t(r.scrollIntoView());
			}
			return !0;
		}
	}
	return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos, i.pos + a.nodeSize).scrollIntoView()), !0) : !1;
}, ur = (e, t, n) => {
	let { $head: r, empty: i } = e.selection, a = r;
	if (!i) return !1;
	if (r.parent.isTextblock) {
		if (n ? !n.endOfTextblock("forward", e) : r.parentOffset < r.parent.content.size) return !1;
		a = dr(r);
	}
	let o = a && a.nodeAfter;
	return !o || !B.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(B.create(e.doc, a.pos)).scrollIntoView()), !0);
};
function dr(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		let n = e.node(t);
		if (e.index(t) + 1 < n.childCount) return e.doc.resolve(e.after(t + 1));
		if (n.type.spec.isolating) break;
	}
	return null;
}
var fr = (e, t) => {
	let n = e.selection, r = n instanceof B, i;
	if (r) {
		if (n.node.isTextblock || !ln(e.doc, n.from)) return !1;
		i = n.from;
	} else if (i = fn(e.doc, n.from, -1), i == null) return !1;
	if (t) {
		let n = e.tr.join(i);
		r && n.setSelection(B.create(n.doc, i - e.doc.resolve(i).nodeBefore.nodeSize)), t(n.scrollIntoView());
	}
	return !0;
}, pr = (e, t) => {
	let n = e.selection, r;
	if (n instanceof B) {
		if (n.node.isTextblock || !ln(e.doc, n.to)) return !1;
		r = n.to;
	} else if (r = fn(e.doc, n.to, 1), r == null) return !1;
	return t && t(e.tr.join(r).scrollIntoView()), !0;
}, mr = (e, t) => {
	let { $from: n, $to: r } = e.selection, i = n.blockRange(r), a = i && Jt(i);
	return a != null && (t && t(e.tr.lift(i, a).scrollIntoView()), !0);
}, hr = (e, t) => {
	let { $head: n, $anchor: r } = e.selection;
	return !n.parent.type.spec.code || !n.sameParent(r) ? !1 : (t && t(e.tr.insertText("\n").scrollIntoView()), !0);
};
function gr(e) {
	for (let t = 0; t < e.edgeCount; t++) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
var _r = (e, t) => {
	let { $head: n, $anchor: r } = e.selection;
	if (!n.parent.type.spec.code || !n.sameParent(r)) return !1;
	let i = n.node(-1), a = n.indexAfter(-1), o = gr(i.contentMatchAt(a));
	if (!o || !i.canReplaceWith(a, a, o)) return !1;
	if (t) {
		let r = n.after(), i = e.tr.replaceWith(r, r, o.createAndFill());
		i.setSelection(R.near(i.doc.resolve(r), 1)), t(i.scrollIntoView());
	}
	return !0;
}, vr = (e, t) => {
	let n = e.selection, { $from: r, $to: i } = n;
	if (n instanceof Hn || r.parent.inlineContent || i.parent.inlineContent) return !1;
	let a = gr(i.parent.contentMatchAt(i.indexAfter()));
	if (!a || !a.isTextblock) return !1;
	if (t) {
		let n = (!r.parentOffset && i.index() < i.parent.childCount ? r : i).pos, o = e.tr.insert(n, a.createAndFill());
		o.setSelection(z.create(o.doc, n + 1)), t(o.scrollIntoView());
	}
	return !0;
}, yr = (e, t) => {
	let { $cursor: n } = e.selection;
	if (!n || n.parent.content.size) return !1;
	if (n.depth > 1 && n.after() != n.end(-1)) {
		let r = n.before();
		if (sn(e.doc, r)) return t && t(e.tr.split(r).scrollIntoView()), !0;
	}
	let r = n.blockRange(), i = r && Jt(r);
	return i != null && (t && t(e.tr.lift(r, i).scrollIntoView()), !0);
};
function br(e) {
	return (t, n) => {
		if (t.selection instanceof B && t.selection.node.isBlock) {
			let { $from: e } = t.selection;
			return !e.parentOffset || !sn(t.doc, e.pos) ? !1 : (n && n(t.tr.split(e.pos).scrollIntoView()), !0);
		}
		if (!t.selection.$from.depth) return !1;
		let r = t.tr;
		!t.selection.empty && (t.selection instanceof z || t.selection instanceof Hn) && r.deleteSelection();
		let { $from: i } = r.selection, a = r.steps.length, o = [], s, c, l = !1, u = !1;
		for (let t = i.depth;; t--) if (i.node(t).isBlock) {
			l = i.end(t) == i.pos + (i.depth - t), u = i.start(t) == i.pos - (i.depth - t), c = gr(i.node(t - 1).contentMatchAt(i.indexAfter(t - 1)));
			let n = e && e(i.parent, l, i);
			o.unshift(n || (l && c ? { type: c } : null)), s = t;
			break;
		} else {
			if (t == 1) return !1;
			o.unshift(null);
		}
		let d = i.pos, f = sn(r.doc, d, o.length, o);
		if (f ||= (o[0] = c ? { type: c } : null, sn(r.doc, d, o.length, o)), !f) return !1;
		if (r.split(d, o.length, o), !l && u && i.node(s).type != c) {
			let e = r.mapping.slice(a), t = e.map(i.before(s)), n = r.doc.resolve(t);
			c && i.node(s - 1).canReplaceWith(n.index(), n.index() + 1, c) && r.setNodeMarkup(e.map(i.before(s)), c);
		}
		return n && n(r.scrollIntoView()), !0;
	};
}
var xr = br(), Sr = (e, t) => {
	let { $from: n, to: r } = e.selection, i, a = n.sharedDepth(r);
	return a != 0 && (i = n.before(a), t && t(e.tr.setSelection(B.create(e.doc, i))), !0);
}, Cr = (e, t) => (t && t(e.tr.setSelection(new Hn(e.doc))), !0);
function wr(e, t, n) {
	let r = t.nodeBefore, i = t.nodeAfter, a = t.index();
	return !r || !i || !r.type.compatibleContent(i.type) ? !1 : !r.content.size && t.parent.canReplace(a - 1, a) ? (n && n(e.tr.delete(t.pos - r.nodeSize, t.pos).scrollIntoView()), !0) : !t.parent.canReplace(a, a + 1) || !(i.isTextblock || ln(e.doc, t.pos)) ? !1 : (n && n(e.tr.join(t.pos).scrollIntoView()), !0);
}
function Tr(e, t, n, r) {
	let i = t.nodeBefore, a = t.nodeAfter, o, s, c = i.type.spec.isolating || a.type.spec.isolating;
	if (!c && wr(e, t, n)) return !0;
	let l = !c && t.parent.canReplace(t.index(), t.index() + 1);
	if (l && (o = (s = i.contentMatchAt(i.childCount)).findWrapping(a.type)) && s.matchType(o[0] || a.type).validEnd) {
		if (n) {
			let r = t.pos + a.nodeSize, s = A.empty;
			for (let e = o.length - 1; e >= 0; e--) s = A.from(o[e].create(null, s));
			s = A.from(i.copy(s));
			let c = e.tr.step(new L(t.pos - 1, r, t.pos, r, new N(s, 1, 0), o.length, !0)), l = c.doc.resolve(r + 2 * o.length);
			l.nodeAfter && l.nodeAfter.type == i.type && ln(c.doc, l.pos) && c.join(l.pos), n(c.scrollIntoView());
		}
		return !0;
	}
	let u = a.type.spec.isolating || r > 0 && c ? null : R.findFrom(t, 1), d = u && u.$from.blockRange(u.$to), f = d && Jt(d);
	if (f != null && f >= t.depth) return n && n(e.tr.lift(d, f).scrollIntoView()), !0;
	if (l && ar(a, "start", !0) && ar(i, "end")) {
		let r = i, o = [];
		for (; o.push(r), !r.isTextblock;) r = r.lastChild;
		let s = a, c = 1;
		for (; !s.isTextblock; s = s.firstChild) c++;
		if (r.canReplace(r.childCount, r.childCount, s.content)) {
			if (n) {
				let r = A.empty;
				for (let e = o.length - 1; e >= 0; e--) r = A.from(o[e].copy(r));
				n(e.tr.step(new L(t.pos - o.length, t.pos + a.nodeSize, t.pos + c, t.pos + a.nodeSize - c, new N(r, o.length, 0), 0, !0)).scrollIntoView());
			}
			return !0;
		}
	}
	return !1;
}
function Er(e) {
	return function(t, n) {
		let r = t.selection, i = e < 0 ? r.$from : r.$to, a = i.depth;
		for (; i.node(a).isInline;) {
			if (!a) return !1;
			a--;
		}
		return i.node(a).isTextblock ? (n && n(t.tr.setSelection(z.create(t.doc, e < 0 ? i.start(a) : i.end(a)))), !0) : !1;
	};
}
var Dr = Er(-1), Or = Er(1);
function kr(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a), s = o && Xt(o, e, t);
		return s ? (r && r(n.tr.wrap(o, s).scrollIntoView()), !0) : !1;
	};
}
function Ar(e, t = null) {
	return function(n, r) {
		let i = !1;
		for (let r = 0; r < n.selection.ranges.length && !i; r++) {
			let { $from: { pos: a }, $to: { pos: o } } = n.selection.ranges[r];
			n.doc.nodesBetween(a, o, (r, a) => {
				if (i) return !1;
				if (r.isTextblock && !r.hasMarkup(e, t)) {
					if (r.type == e) i = !0;
					else {
						let t = n.doc.resolve(a), r = t.index();
						i = t.parent.canReplaceWith(r, r + 1, e);
					}
				}
			});
		}
		if (!i) return !1;
		if (r) {
			let i = n.tr;
			for (let r = 0; r < n.selection.ranges.length; r++) {
				let { $from: { pos: a }, $to: { pos: o } } = n.selection.ranges[r];
				i.setBlockType(a, o, e, t);
			}
			r(i.scrollIntoView());
		}
		return !0;
	};
}
function jr(...e) {
	return function(t, n, r) {
		for (let i = 0; i < e.length; i++) if (e[i](t, n, r)) return !0;
		return !1;
	};
}
var Mr = jr($n, tr, or), Nr = jr($n, lr, ur), Pr = {
	Enter: jr(hr, vr, yr, xr),
	"Mod-Enter": _r,
	Backspace: Mr,
	"Mod-Backspace": Mr,
	"Shift-Backspace": Mr,
	Delete: Nr,
	"Mod-Delete": Nr,
	"Mod-a": Cr
}, Fr = {
	"Ctrl-h": Pr.Backspace,
	"Alt-Backspace": Pr["Mod-Backspace"],
	"Ctrl-d": Pr.Delete,
	"Ctrl-Alt-Backspace": Pr["Mod-Delete"],
	"Alt-Delete": Pr["Mod-Delete"],
	"Alt-d": Pr["Mod-Delete"],
	"Ctrl-a": Dr,
	"Ctrl-e": Or
};
for (let e in Pr) Fr[e] = Pr[e];
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform();
//#endregion
//#region ../../node_modules/prosemirror-schema-list/dist/index.js
function Ir(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a);
		if (!o) return !1;
		let s = r ? n.tr : null;
		return Lr(s, o, e, t) ? (r && r(s.scrollIntoView()), !0) : !1;
	};
}
function Lr(e, t, n, r = null) {
	let i = !1, a = t, o = t.$from.doc;
	if (t.depth >= 2 && t.$from.node(t.depth - 1).type.compatibleContent(n) && t.startIndex == 0) {
		if (t.$from.index(t.depth - 1) == 0) return !1;
		let e = o.resolve(t.start - 2);
		a = new De(e, e, t.depth), t.endIndex < t.parent.childCount && (t = new De(t.$from, o.resolve(t.$to.end(t.depth)), t.depth)), i = !0;
	}
	let s = Xt(a, n, r, t);
	return s ? (e && Rr(e, t, s, i, n), !0) : !1;
}
function Rr(e, t, n, r, i) {
	let a = A.empty;
	for (let e = n.length - 1; e >= 0; e--) a = A.from(n[e].type.create(n[e].attrs, a));
	e.step(new L(t.start - (r ? 2 : 0), t.end, t.start, t.end, new N(a, 0, 0), n.length, !0));
	let o = 0;
	for (let e = 0; e < n.length; e++) n[e].type == i && (o = e + 1);
	let s = n.length - o, c = t.start + n.length - (r ? 2 : 0), l = t.parent;
	for (let n = t.startIndex, r = t.endIndex, i = !0; n < r; n++, i = !1) !i && sn(e.doc, c, s) && (e.split(c, s), c += 2 * s), c += l.child(n).nodeSize;
	return e;
}
function zr(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && t.firstChild.type == e);
		return a ? n ? r.node(a.depth - 1).type == e ? Br(t, n, e, a) : Vr(t, n, a) : !0 : !1;
	};
}
function Br(e, t, n, r) {
	let i = e.tr, a = r.end, o = r.$to.end(r.depth);
	a < o && (i.step(new L(a - 1, o, a, o, new N(A.from(n.create(null, r.parent.copy())), 1, 0), 1, !0)), r = new De(i.doc.resolve(r.$from.pos), i.doc.resolve(o), r.depth));
	let s = Jt(r);
	if (s == null) return !1;
	i.lift(r, s);
	let c = i.doc.resolve(i.mapping.map(a, -1) - 1);
	return ln(i.doc, c.pos) && c.nodeBefore.type == c.nodeAfter.type && i.join(c.pos), t(i.scrollIntoView()), !0;
}
function Vr(e, t, n) {
	let r = e.tr, i = n.parent;
	for (let e = n.end, t = n.endIndex - 1, a = n.startIndex; t > a; t--) e -= i.child(t).nodeSize, r.delete(e - 1, e + 1);
	let a = r.doc.resolve(n.start), o = a.nodeAfter;
	if (r.mapping.map(n.end) != n.start + a.nodeAfter.nodeSize) return !1;
	let s = n.startIndex == 0, c = n.endIndex == i.childCount, l = a.node(-1), u = a.index(-1);
	if (!l.canReplace(u + +!s, u + 1, o.content.append(c ? A.empty : A.from(i)))) return !1;
	let d = a.pos, f = d + o.nodeSize;
	return r.step(new L(d - +!!s, f + +!!c, d + 1, f - 1, new N((s ? A.empty : A.from(i.copy(A.empty))).append(c ? A.empty : A.from(i.copy(A.empty))), +!s, +!c), +!s)), t(r.scrollIntoView()), !0;
}
function Hr(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && t.firstChild.type == e);
		if (!a) return !1;
		let o = a.startIndex;
		if (o == 0) return !1;
		let s = a.parent, c = s.child(o - 1);
		if (c.type != e) return !1;
		if (n) {
			let r = c.lastChild && c.lastChild.type == s.type, i = A.from(r ? e.create() : null), o = new N(A.from(e.create(null, A.from(s.type.create(null, i)))), r ? 3 : 1, 0), l = a.start, u = a.end;
			n(t.tr.step(new L(l - (r ? 3 : 1), u, l, u, o, 1, !0)).scrollIntoView());
		}
		return !0;
	};
}
//#endregion
//#region ../../node_modules/prosemirror-view/dist/index.js
var V = function(e) {
	for (var t = 0;; t++) if (e = e.previousSibling, !e) return t;
}, Ur = function(e) {
	let t = e.assignedSlot || e.parentNode;
	return t && t.nodeType == 11 ? t.host : t;
}, Wr = null, Gr = function(e, t, n) {
	let r = Wr ||= document.createRange();
	return r.setEnd(e, n ?? e.nodeValue.length), r.setStart(e, t || 0), r;
}, Kr = function() {
	Wr = null;
}, qr = function(e, t, n, r) {
	return n && (Yr(e, t, n, r, -1) || Yr(e, t, n, r, 1));
}, Jr = /^(img|br|input|textarea|hr)$/i;
function Yr(e, t, n, r, i) {
	for (;;) {
		if (e == n && t == r) return !0;
		if (t == (i < 0 ? 0 : H(e))) {
			let n = e.parentNode;
			if (!n || n.nodeType != 1 || $r(e) || Jr.test(e.nodeName) || e.contentEditable == "false") return !1;
			t = V(e) + (i < 0 ? 0 : 1), e = n;
		} else if (e.nodeType == 1) {
			let n = e.childNodes[t + (i < 0 ? -1 : 0)];
			if (n.nodeType == 1 && n.contentEditable == "false") {
				if (n.pmViewDesc?.ignoreForSelection) t += i;
				else return !1;
			} else e = n, t = i < 0 ? H(e) : 0;
		} else return !1;
	}
}
function H(e) {
	return e.nodeType == 3 ? e.nodeValue.length : e.childNodes.length;
}
function Xr(e, t) {
	for (;;) {
		if (e.nodeType == 3 && t) return e;
		if (e.nodeType == 1 && t > 0) {
			if (e.contentEditable == "false") return null;
			e = e.childNodes[t - 1], t = H(e);
		} else if (e.parentNode && !$r(e)) t = V(e), e = e.parentNode;
		else return null;
	}
}
function Zr(e, t) {
	for (;;) {
		if (e.nodeType == 3 && t < e.nodeValue.length) return e;
		if (e.nodeType == 1 && t < e.childNodes.length) {
			if (e.contentEditable == "false") return null;
			e = e.childNodes[t], t = 0;
		} else if (e.parentNode && !$r(e)) t = V(e) + 1, e = e.parentNode;
		else return null;
	}
}
function Qr(e, t, n) {
	for (let r = t == 0, i = t == H(e); r || i;) {
		if (e == n) return !0;
		let t = V(e);
		if (e = e.parentNode, !e) return !1;
		r &&= t == 0, i &&= t == H(e);
	}
}
function $r(e) {
	let t;
	for (let n = e; n && !(t = n.pmViewDesc); n = n.parentNode);
	return t && t.node && t.node.isBlock && (t.dom == e || t.contentDOM == e);
}
var ei = function(e) {
	return e.focusNode && qr(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset);
};
function ti(e, t) {
	let n = document.createEvent("Event");
	return n.initEvent("keydown", !0, !0), n.keyCode = e, n.key = n.code = t, n;
}
function ni(e) {
	let t = e.activeElement;
	for (; t && t.shadowRoot;) t = t.shadowRoot.activeElement;
	return t;
}
function ri(e, t, n) {
	if (e.caretPositionFromPoint) try {
		let r = e.caretPositionFromPoint(t, n);
		if (r) return {
			node: r.offsetNode,
			offset: Math.min(H(r.offsetNode), r.offset)
		};
	} catch {}
	if (e.caretRangeFromPoint) {
		let r = e.caretRangeFromPoint(t, n);
		if (r) return {
			node: r.startContainer,
			offset: Math.min(H(r.startContainer), r.startOffset)
		};
	}
}
var ii = typeof navigator < "u" ? navigator : null, ai = typeof document < "u" ? document : null, oi = ii && ii.userAgent || "", si = /Edge\/(\d+)/.exec(oi), ci = /MSIE \d/.exec(oi), li = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(oi), U = !!(ci || li || si), ui = ci ? document.documentMode : li ? +li[1] : si ? +si[1] : 0, W = !U && /gecko\/(\d+)/i.test(oi);
W && +(/Firefox\/(\d+)/.exec(oi) || [0, 0])[1];
var di = !U && /Chrome\/(\d+)/.exec(oi), G = !!di, fi = di ? +di[1] : 0, K = !U && !!ii && /Apple Computer/.test(ii.vendor), pi = K && (/Mobile\/\w+/.test(oi) || !!ii && ii.maxTouchPoints > 2), q = pi || (ii ? /Mac/.test(ii.platform) : !1), mi = ii ? /Win/.test(ii.platform) : !1, hi = /Android \d/.test(oi), gi = !!ai && "webkitFontSmoothing" in ai.documentElement.style, _i = gi ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function vi(e) {
	let t = e.defaultView && e.defaultView.visualViewport;
	return t ? {
		left: 0,
		right: t.width,
		top: 0,
		bottom: t.height
	} : {
		left: 0,
		right: e.documentElement.clientWidth,
		top: 0,
		bottom: e.documentElement.clientHeight
	};
}
function yi(e, t) {
	return typeof e == "number" ? e : e[t];
}
function bi(e) {
	let t = e.getBoundingClientRect(), n = t.width / e.offsetWidth || 1, r = t.height / e.offsetHeight || 1;
	return {
		left: t.left,
		right: t.left + e.clientWidth * n,
		top: t.top,
		bottom: t.top + e.clientHeight * r
	};
}
function xi(e, t, n) {
	if (!Ii(t) && t.left == 0) return;
	let r = e.someProp("scrollThreshold") || 0, i = e.someProp("scrollMargin") || 5, a = e.dom.ownerDocument;
	for (let o = n || e.dom; o;) {
		if (o.nodeType != 1) {
			o = Ur(o);
			continue;
		}
		let e = o, n = e == a.body, s = n ? vi(a) : bi(e), c = 0, l = 0;
		if (t.top < s.top + yi(r, "top") ? l = -(s.top - t.top + yi(i, "top")) : t.bottom > s.bottom - yi(r, "bottom") && (l = t.bottom - t.top > s.bottom - s.top ? t.top + yi(i, "top") - s.top : t.bottom - s.bottom + yi(i, "bottom")), t.left < s.left + yi(r, "left") ? c = -(s.left - t.left + yi(i, "left")) : t.right > s.right - yi(r, "right") && (c = t.right - s.right + yi(i, "right")), c || l) {
			if (n) a.defaultView.scrollBy(c, l);
			else {
				let n = e.scrollLeft, r = e.scrollTop;
				l && (e.scrollTop += l), c && (e.scrollLeft += c);
				let i = e.scrollLeft - n, a = e.scrollTop - r;
				t = {
					left: t.left - i,
					top: t.top - a,
					right: t.right - i,
					bottom: t.bottom - a
				};
			}
		}
		let u = n ? "fixed" : getComputedStyle(o).position;
		if (/^(fixed|sticky)$/.test(u)) break;
		o = u == "absolute" ? o.offsetParent : Ur(o);
	}
}
function Si(e) {
	let t = e.dom.getBoundingClientRect(), n = Math.max(0, t.top), r, i;
	for (let a = (t.left + t.right) / 2, o = n + 1; o < Math.min(innerHeight, t.bottom); o += 5) {
		let t = e.root.elementFromPoint(a, o);
		if (!t || t == e.dom || !e.dom.contains(t)) continue;
		let s = t.getBoundingClientRect();
		if (s.top >= n - 20) {
			r = t, i = s.top;
			break;
		}
	}
	return {
		refDOM: r,
		refTop: i,
		stack: Ci(e.dom)
	};
}
function Ci(e) {
	let t = [], n = e.ownerDocument;
	for (let r = e; r && (t.push({
		dom: r,
		top: r.scrollTop,
		left: r.scrollLeft
	}), e != n); r = Ur(r));
	return t;
}
function wi({ refDOM: e, refTop: t, stack: n }) {
	let r = e ? e.getBoundingClientRect().top : 0;
	Ti(n, r == 0 ? 0 : r - t);
}
function Ti(e, t) {
	for (let n = 0; n < e.length; n++) {
		let { dom: r, top: i, left: a } = e[n];
		r.scrollTop != i + t && (r.scrollTop = i + t), r.scrollLeft != a && (r.scrollLeft = a);
	}
}
var Ei = null;
function Di(e) {
	if (e.setActive) return e.setActive();
	if (Ei) return e.focus(Ei);
	let t = Ci(e);
	e.focus(Ei == null ? { get preventScroll() {
		return Ei = { preventScroll: !0 }, !0;
	} } : void 0), Ei || (Ei = !1, Ti(t, 0));
}
function Oi(e, t) {
	let n, r = 2e8, i, a = 0, o = t.top, s = t.top, c, l;
	for (let u = e.firstChild, d = 0; u; u = u.nextSibling, d++) {
		let e;
		if (u.nodeType == 1) e = u.getClientRects();
		else if (u.nodeType == 3) e = Gr(u).getClientRects();
		else continue;
		for (let f = 0; f < e.length; f++) {
			let p = e[f];
			if (p.top <= o && p.bottom >= s) {
				o = Math.max(p.bottom, o), s = Math.min(p.top, s);
				let e = p.left > t.left ? p.left - t.left : p.right < t.left ? t.left - p.right : 0;
				if (e < r) {
					n = u, r = e, i = e && n.nodeType == 3 ? {
						left: p.right < t.left ? p.right : p.left,
						top: t.top
					} : t, u.nodeType == 1 && e && (a = d + +(t.left >= (p.left + p.right) / 2));
					continue;
				}
			} else p.top > t.top && !c && p.left <= t.left && p.right >= t.left && (c = u, l = {
				left: Math.max(p.left, Math.min(p.right, t.left)),
				top: p.top
			});
			!n && (t.left >= p.right && t.top >= p.top || t.left >= p.left && t.top >= p.bottom) && (a = d + 1);
		}
	}
	return !n && c && (n = c, i = l, r = 0), n && n.nodeType == 3 ? ki(n, i) : !n || r && n.nodeType == 1 ? {
		node: e,
		offset: a
	} : Oi(n, i);
}
function ki(e, t) {
	let n = e.nodeValue.length, r = document.createRange(), i;
	for (let a = 0; a < n; a++) {
		r.setEnd(e, a + 1), r.setStart(e, a);
		let n = Li(r, 1);
		if (n.top != n.bottom && Ai(t, n)) {
			i = {
				node: e,
				offset: a + +(t.left >= (n.left + n.right) / 2)
			};
			break;
		}
	}
	return r.detach(), i || {
		node: e,
		offset: 0
	};
}
function Ai(e, t) {
	return e.left >= t.left - 1 && e.left <= t.right + 1 && e.top >= t.top - 1 && e.top <= t.bottom + 1;
}
function ji(e, t) {
	let n = e.parentNode;
	return n && /^li$/i.test(n.nodeName) && t.left < e.getBoundingClientRect().left ? n : e;
}
function Mi(e, t, n) {
	let { node: r, offset: i } = Oi(t, n), a = -1;
	if (r.nodeType == 1 && !r.firstChild) {
		let e = r.getBoundingClientRect();
		a = e.left != e.right && n.left > (e.left + e.right) / 2 ? 1 : -1;
	}
	return e.docView.posFromDOM(r, i, a);
}
function Ni(e, t, n, r) {
	let i = -1;
	for (let n = t, a = !1; n != e.dom;) {
		let t = e.docView.nearestDesc(n, !0), o;
		if (!t) return null;
		if (t.dom.nodeType == 1 && (t.node.isBlock && t.parent || !t.contentDOM) && ((o = t.dom.getBoundingClientRect()).width || o.height) && (t.node.isBlock && t.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(t.dom.nodeName) && (!a && o.left > r.left || o.top > r.top ? i = t.posBefore : (!a && o.right < r.left || o.bottom < r.top) && (i = t.posAfter), a = !0), !t.contentDOM && i < 0 && !t.node.isText)) return (t.node.isBlock ? r.top < (o.top + o.bottom) / 2 : r.left < (o.left + o.right) / 2) ? t.posBefore : t.posAfter;
		n = t.dom.parentNode;
	}
	return i > -1 ? i : e.docView.posFromDOM(t, n, -1);
}
function Pi(e, t, n) {
	let r = e.childNodes.length;
	if (r && n.top < n.bottom) for (let i = Math.max(0, Math.min(r - 1, Math.floor(r * (t.top - n.top) / (n.bottom - n.top)) - 2)), a = i;;) {
		let n = e.childNodes[a];
		if (n.nodeType == 1) {
			let e = n.getClientRects();
			for (let r = 0; r < e.length; r++) {
				let i = e[r];
				if (Ai(t, i)) return Pi(n, t, i);
			}
		}
		if ((a = (a + 1) % r) == i) break;
	}
	return e;
}
function Fi(e, t) {
	let n = e.dom.ownerDocument, r, i = 0, a = ri(n, t.left, t.top);
	a && ({node: r, offset: i} = a);
	let o = (e.root.elementFromPoint ? e.root : n).elementFromPoint(t.left, t.top), s;
	if (!o || !e.dom.contains(o.nodeType == 1 ? o : o.parentNode)) {
		let n = e.dom.getBoundingClientRect();
		if (!Ai(t, n) || (o = Pi(e.dom, t, n), !o)) return null;
	}
	if (K) for (let e = o; r && e; e = Ur(e)) e.draggable && (r = void 0);
	if (o = ji(o, t), r) {
		if (W && r.nodeType == 1 && (i = Math.min(i, r.childNodes.length), i < r.childNodes.length)) {
			let e = r.childNodes[i], n;
			e.nodeName == "IMG" && (n = e.getBoundingClientRect()).right <= t.left && n.bottom > t.top && i++;
		}
		let n;
		gi && i && r.nodeType == 1 && (n = r.childNodes[i - 1]).nodeType == 1 && n.contentEditable == "false" && n.getBoundingClientRect().top >= t.top && i--, r == e.dom && i == r.childNodes.length - 1 && r.lastChild.nodeType == 1 && t.top > r.lastChild.getBoundingClientRect().bottom ? s = e.state.doc.content.size : (i == 0 || r.nodeType != 1 || r.childNodes[i - 1].nodeName != "BR") && (s = Ni(e, r, i, t));
	}
	s ??= Mi(e, o, t);
	let c = e.docView.nearestDesc(o, !0);
	return {
		pos: s,
		inside: c ? c.posAtStart - c.border : -1
	};
}
function Ii(e) {
	return e.top < e.bottom || e.left < e.right;
}
function Li(e, t) {
	let n = e.getClientRects();
	if (n.length) {
		let e = n[t < 0 ? 0 : n.length - 1];
		if (Ii(e)) return e;
	}
	return Array.prototype.find.call(n, Ii) || e.getBoundingClientRect();
}
var Ri = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function zi(e, t, n) {
	let { node: r, offset: i, atom: a } = e.docView.domFromPos(t, n < 0 ? -1 : 1), o = gi || W;
	if (r.nodeType == 3) {
		if (o && (Ri.test(r.nodeValue) || (n < 0 ? !i : i == r.nodeValue.length))) {
			let e = Li(Gr(r, i, i), n);
			if (W && i && /\s/.test(r.nodeValue[i - 1]) && i < r.nodeValue.length) {
				let t = Li(Gr(r, i - 1, i - 1), -1);
				if (t.top == e.top) {
					let n = Li(Gr(r, i, i + 1), -1);
					if (n.top != e.top) return Bi(n, n.left < t.left);
				}
			}
			return e;
		}
		{
			let e = i, t = i, a = n < 0 ? 1 : -1;
			return n < 0 && !i ? (t++, a = -1) : n >= 0 && i == r.nodeValue.length ? (e--, a = 1) : n < 0 ? e-- : t++, Bi(Li(Gr(r, e, t), a), a < 0);
		}
	}
	if (!e.state.doc.resolve(t - (a || 0)).parent.inlineContent) {
		if (a == null && i && (n < 0 || i == H(r))) {
			let e = r.childNodes[i - 1];
			if (e.nodeType == 1) return Vi(e.getBoundingClientRect(), !1);
		}
		if (a == null && i < H(r)) {
			let e = r.childNodes[i];
			if (e.nodeType == 1) return Vi(e.getBoundingClientRect(), !0);
		}
		return Vi(r.getBoundingClientRect(), n >= 0);
	}
	if (a == null && i && (n < 0 || i == H(r))) {
		let e = r.childNodes[i - 1], t = e.nodeType == 3 ? Gr(e, H(e) - +!o) : e.nodeType == 1 && (e.nodeName != "BR" || !e.nextSibling) ? e : null;
		if (t) return Bi(Li(t, 1), !1);
	}
	if (a == null && i < H(r)) {
		let e = r.childNodes[i];
		for (; e.pmViewDesc && e.pmViewDesc.ignoreForCoords;) e = e.nextSibling;
		let t = e ? e.nodeType == 3 ? Gr(e, 0, +!o) : e.nodeType == 1 ? e : null : null;
		if (t) return Bi(Li(t, -1), !0);
	}
	return Bi(Li(r.nodeType == 3 ? Gr(r) : r, -n), n >= 0);
}
function Bi(e, t) {
	if (e.width == 0) return e;
	let n = t ? e.left : e.right;
	return {
		top: e.top,
		bottom: e.bottom,
		left: n,
		right: n
	};
}
function Vi(e, t) {
	if (e.height == 0) return e;
	let n = t ? e.top : e.bottom;
	return {
		top: n,
		bottom: n,
		left: e.left,
		right: e.right
	};
}
function Hi(e, t, n) {
	let r = e.state, i = e.root.activeElement;
	r != t && e.updateState(t), i != e.dom && e.focus();
	try {
		return n();
	} finally {
		r != t && e.updateState(r), i != e.dom && i && i.focus();
	}
}
function Ui(e, t, n) {
	let r = t.selection, i = n == "up" ? r.$from : r.$to;
	return Hi(e, t, () => {
		let { node: t } = e.docView.domFromPos(i.pos, n == "up" ? -1 : 1);
		for (;;) {
			let n = e.docView.nearestDesc(t, !0);
			if (!n) break;
			if (n.node.isBlock) {
				t = n.contentDOM || n.dom;
				break;
			}
			t = n.dom.parentNode;
		}
		let r = zi(e, i.pos, 1);
		for (let e = t.firstChild; e; e = e.nextSibling) {
			let t;
			if (e.nodeType == 1) t = e.getClientRects();
			else if (e.nodeType == 3) t = Gr(e, 0, e.nodeValue.length).getClientRects();
			else continue;
			for (let e = 0; e < t.length; e++) {
				let i = t[e];
				if (i.bottom > i.top + 1 && (n == "up" ? r.top - i.top > (i.bottom - r.top) * 2 : i.bottom - r.bottom > (r.bottom - i.top) * 2)) return !1;
			}
		}
		return !0;
	});
}
var Wi = /[\u0590-\u08ac]/;
function Gi(e, t, n) {
	let { $head: r } = t.selection;
	if (!r.parent.isTextblock) return !1;
	let i = r.parentOffset, a = !i, o = i == r.parent.content.size, s = e.domSelection();
	return s ? !Wi.test(r.parent.textContent) || !s.modify ? n == "left" || n == "backward" ? a : o : Hi(e, t, () => {
		let { focusNode: t, focusOffset: i, anchorNode: a, anchorOffset: o } = e.domSelectionRange(), c = s.caretBidiLevel;
		s.modify("move", n, "character");
		let l = r.depth ? e.docView.domAfterPos(r.before()) : e.dom, { focusNode: u, focusOffset: d } = e.domSelectionRange(), f = u && !l.contains(u.nodeType == 1 ? u : u.parentNode) || t == u && i == d;
		try {
			s.collapse(a, o), t && (t != a || i != o) && s.extend && s.extend(t, i);
		} catch {}
		return c != null && (s.caretBidiLevel = c), f;
	}) : r.pos == r.start() || r.pos == r.end();
}
var Ki = null, qi = null, Ji = !1;
function Yi(e, t, n) {
	return Ki == t && qi == n ? Ji : (Ki = t, qi = n, Ji = n == "up" || n == "down" ? Ui(e, t, n) : Gi(e, t, n));
}
var J = 0, Xi = 1, Zi = 2, Qi = 3, $i = class {
	constructor(e, t, n, r) {
		this.parent = e, this.children = t, this.dom = n, this.contentDOM = r, this.dirty = J, n.pmViewDesc = this;
	}
	matchesWidget(e) {
		return !1;
	}
	matchesMark(e) {
		return !1;
	}
	matchesNode(e, t, n) {
		return !1;
	}
	matchesHack(e) {
		return !1;
	}
	parseRule(e) {
		return null;
	}
	stopEvent(e) {
		return !1;
	}
	get size() {
		let e = 0;
		for (let t = 0; t < this.children.length; t++) e += this.children[t].size;
		return e;
	}
	get border() {
		return 0;
	}
	destroy() {
		this.parent = void 0, this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
		for (let e = 0; e < this.children.length; e++) this.children[e].destroy();
	}
	posBeforeChild(e) {
		for (let t = 0, n = this.posAtStart;; t++) {
			let r = this.children[t];
			if (r == e) return n;
			n += r.size;
		}
	}
	get posBefore() {
		return this.parent.posBeforeChild(this);
	}
	get posAtStart() {
		return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
	}
	get posAfter() {
		return this.posBefore + this.size;
	}
	get posAtEnd() {
		return this.posAtStart + this.size - 2 * this.border;
	}
	localPosFromDOM(e, t, n) {
		if (this.contentDOM && this.contentDOM.contains(e.nodeType == 1 ? e : e.parentNode)) {
			if (n < 0) {
				let n, r;
				if (e == this.contentDOM) n = e.childNodes[t - 1];
				else {
					for (; e.parentNode != this.contentDOM;) e = e.parentNode;
					n = e.previousSibling;
				}
				for (; n && !((r = n.pmViewDesc) && r.parent == this);) n = n.previousSibling;
				return n ? this.posBeforeChild(r) + r.size : this.posAtStart;
			}
			{
				let n, r;
				if (e == this.contentDOM) n = e.childNodes[t];
				else {
					for (; e.parentNode != this.contentDOM;) e = e.parentNode;
					n = e.nextSibling;
				}
				for (; n && !((r = n.pmViewDesc) && r.parent == this);) n = n.nextSibling;
				return n ? this.posBeforeChild(r) : this.posAtEnd;
			}
		}
		let r;
		if (e == this.dom && this.contentDOM) r = t > V(this.contentDOM);
		else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) r = e.compareDocumentPosition(this.contentDOM) & 2;
		else if (this.dom.firstChild) {
			if (t == 0) for (let t = e;; t = t.parentNode) {
				if (t == this.dom) {
					r = !1;
					break;
				}
				if (t.previousSibling) break;
			}
			if (r == null && t == e.childNodes.length) for (let t = e;; t = t.parentNode) {
				if (t == this.dom) {
					r = !0;
					break;
				}
				if (t.nextSibling) break;
			}
		}
		return r ?? n > 0 ? this.posAtEnd : this.posAtStart;
	}
	nearestDesc(e, t = !1) {
		for (let n = !0, r = e; r; r = r.parentNode) {
			let i = this.getDesc(r), a;
			if (i && (!t || i.node)) {
				if (n && (a = i.nodeDOM) && !(a.nodeType == 1 ? a.contains(e.nodeType == 1 ? e : e.parentNode) : a == e)) n = !1;
				else return i;
			}
		}
	}
	getDesc(e) {
		let t = e.pmViewDesc;
		for (let e = t; e; e = e.parent) if (e == this) return t;
	}
	posFromDOM(e, t, n) {
		for (let r = e; r; r = r.parentNode) {
			let i = this.getDesc(r);
			if (i) return i.localPosFromDOM(e, t, n);
		}
		return -1;
	}
	descAt(e) {
		for (let t = 0, n = 0; t < this.children.length; t++) {
			let r = this.children[t], i = n + r.size;
			if (n == e && i != n) {
				for (; !r.border && r.children.length;) for (let e = 0; e < r.children.length; e++) {
					let t = r.children[e];
					if (t.size) {
						r = t;
						break;
					}
				}
				return r;
			}
			if (e < i) return r.descAt(e - n - r.border);
			n = i;
		}
	}
	domFromPos(e, t) {
		if (!this.contentDOM) return {
			node: this.dom,
			offset: 0,
			atom: e + 1
		};
		let n = 0, r = 0;
		for (let t = 0; n < this.children.length; n++) {
			let i = this.children[n], a = t + i.size;
			if (a > e || i instanceof oa) {
				r = e - t;
				break;
			}
			t = a;
		}
		if (r) return this.children[n].domFromPos(r - this.children[n].border, t);
		for (let e; n && !(e = this.children[n - 1]).size && e instanceof ea && e.side >= 0; n--);
		if (t <= 0) {
			let e, r = !0;
			for (; e = n ? this.children[n - 1] : null, e && e.dom.parentNode != this.contentDOM; n--, r = !1);
			return e && t && r && !e.border && !e.domAtom ? e.domFromPos(e.size, t) : {
				node: this.contentDOM,
				offset: e ? V(e.dom) + 1 : 0
			};
		}
		{
			let e, r = !0;
			for (; e = n < this.children.length ? this.children[n] : null, e && e.dom.parentNode != this.contentDOM; n++, r = !1);
			return e && r && !e.border && !e.domAtom ? e.domFromPos(0, t) : {
				node: this.contentDOM,
				offset: e ? V(e.dom) : this.contentDOM.childNodes.length
			};
		}
	}
	parseRange(e, t, n = 0) {
		if (this.children.length == 0) return {
			node: this.contentDOM,
			from: e,
			to: t,
			fromOffset: 0,
			toOffset: this.contentDOM.childNodes.length
		};
		let r = -1, i = -1;
		for (let a = n, o = 0;; o++) {
			let n = this.children[o], s = a + n.size;
			if (r == -1 && e <= s) {
				let i = a + n.border;
				if (e >= i && t <= s - n.border && n.node && n.contentDOM && this.contentDOM.contains(n.contentDOM)) return n.parseRange(e, t, i);
				e = a;
				for (let t = o; t > 0; t--) {
					let n = this.children[t - 1];
					if (n.size && n.dom.parentNode == this.contentDOM && !n.emptyChildAt(1)) {
						r = V(n.dom) + 1;
						break;
					}
					e -= n.size;
				}
				r == -1 && (r = 0);
			}
			if (r > -1 && (s > t || o == this.children.length - 1)) {
				t = s;
				for (let e = o + 1; e < this.children.length; e++) {
					let n = this.children[e];
					if (n.size && n.dom.parentNode == this.contentDOM && !n.emptyChildAt(-1)) {
						i = V(n.dom);
						break;
					}
					t += n.size;
				}
				i == -1 && (i = this.contentDOM.childNodes.length);
				break;
			}
			a = s;
		}
		return {
			node: this.contentDOM,
			from: e,
			to: t,
			fromOffset: r,
			toOffset: i
		};
	}
	emptyChildAt(e) {
		if (this.border || !this.contentDOM || !this.children.length) return !1;
		let t = this.children[e < 0 ? 0 : this.children.length - 1];
		return t.size == 0 || t.emptyChildAt(e);
	}
	domAfterPos(e) {
		let { node: t, offset: n } = this.domFromPos(e, 0);
		if (t.nodeType != 1 || n == t.childNodes.length) throw RangeError("No node after pos " + e);
		return t.childNodes[n];
	}
	setSelection(e, t, n, r = !1) {
		let i = Math.min(e, t), a = Math.max(e, t);
		for (let o = 0, s = 0; o < this.children.length; o++) {
			let c = this.children[o], l = s + c.size;
			if (i > s && a < l) return c.setSelection(e - s - c.border, t - s - c.border, n, r);
			s = l;
		}
		let o = this.domFromPos(e, e ? -1 : 1), s = t == e ? o : this.domFromPos(t, t ? -1 : 1), c = n.root.getSelection(), l = n.domSelectionRange(), u = !1;
		if ((W || K) && e == t) {
			let { node: e, offset: t } = o;
			if (e.nodeType == 3) {
				if (u = !!(t && e.nodeValue[t - 1] == "\n"), u && t == e.nodeValue.length) for (let t = e, n; t; t = t.parentNode) {
					if (n = t.nextSibling) {
						n.nodeName == "BR" && (o = s = {
							node: n.parentNode,
							offset: V(n) + 1
						});
						break;
					}
					let e = t.pmViewDesc;
					if (e && e.node && e.node.isBlock) break;
				}
			} else {
				let n = e.childNodes[t - 1];
				u = n && (n.nodeName == "BR" || n.contentEditable == "false");
			}
		}
		if (W && l.focusNode && l.focusNode != s.node && l.focusNode.nodeType == 1) {
			let e = l.focusNode.childNodes[l.focusOffset];
			e && e.contentEditable == "false" && (r = !0);
		}
		if (!(r || u && K) && qr(o.node, o.offset, l.anchorNode, l.anchorOffset) && qr(s.node, s.offset, l.focusNode, l.focusOffset)) return;
		let d = !1;
		if ((c.extend || e == t) && !(u && W)) {
			c.collapse(o.node, o.offset);
			try {
				e != t && c.extend(s.node, s.offset), d = !0;
			} catch {}
		}
		if (!d) {
			if (e > t) {
				let e = o;
				o = s, s = e;
			}
			let n = document.createRange();
			n.setEnd(s.node, s.offset), n.setStart(o.node, o.offset), c.removeAllRanges(), c.addRange(n);
		}
	}
	ignoreMutation(e) {
		return !this.contentDOM && e.type != "selection";
	}
	get contentLost() {
		return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
	}
	markDirty(e, t) {
		for (let n = 0, r = 0; r < this.children.length; r++) {
			let i = this.children[r], a = n + i.size;
			if (n == a ? e <= a && t >= n : e < a && t > n) {
				let r = n + i.border, o = a - i.border;
				if (e >= r && t <= o) {
					this.dirty = e == n || t == a ? Zi : Xi, e == r && t == o && (i.contentLost || i.dom.parentNode != this.contentDOM) ? i.dirty = Qi : i.markDirty(e - r, t - r);
					return;
				}
				i.dirty = i.dom == i.contentDOM && i.dom.parentNode == this.contentDOM && !i.children.length ? Zi : Qi;
			}
			n = a;
		}
		this.dirty = Zi;
	}
	markParentsDirty() {
		let e = 1;
		for (let t = this.parent; t; t = t.parent, e++) {
			let n = e == 1 ? Zi : Xi;
			t.dirty < n && (t.dirty = n);
		}
	}
	get domAtom() {
		return !1;
	}
	get ignoreForCoords() {
		return !1;
	}
	get ignoreForSelection() {
		return !1;
	}
	isText(e) {
		return !1;
	}
}, ea = class extends $i {
	constructor(e, t, n, r) {
		let i, a = t.type.toDOM;
		if (typeof a == "function" && (a = a(n, () => {
			if (!i) return r;
			if (i.parent) return i.parent.posBeforeChild(i);
		})), !t.type.spec.raw) {
			if (a.nodeType != 1) {
				let e = document.createElement("span");
				e.appendChild(a), a = e;
			}
			a.hasAttribute("contenteditable") || (a.contentEditable = "false"), a.classList.add("ProseMirror-widget");
		}
		super(e, [], a, null), this.widget = t, this.widget = t, i = this;
	}
	matchesWidget(e) {
		return this.dirty == J && e.type.eq(this.widget.type);
	}
	parseRule() {
		return { ignore: !0 };
	}
	stopEvent(e) {
		let t = this.widget.spec.stopEvent;
		return t ? t(e) : !1;
	}
	ignoreMutation(e) {
		return e.type != "selection" || this.widget.spec.ignoreSelection;
	}
	destroy() {
		this.widget.type.destroy(this.dom), super.destroy();
	}
	get domAtom() {
		return !0;
	}
	get ignoreForSelection() {
		return !!this.widget.type.spec.relaxedSide;
	}
	get side() {
		return this.widget.type.side;
	}
}, ta = class extends $i {
	constructor(e, t, n, r) {
		super(e, [], t, null), this.textDOM = n, this.text = r;
	}
	get size() {
		return this.text.length;
	}
	localPosFromDOM(e, t) {
		return e == this.textDOM ? this.posAtStart + t : this.posAtStart + (t ? this.size : 0);
	}
	domFromPos(e) {
		return {
			node: this.textDOM,
			offset: e
		};
	}
	ignoreMutation(e) {
		return e.type === "characterData" && e.target.nodeValue == e.oldValue;
	}
}, na = class e extends $i {
	constructor(e, t, n, r, i) {
		super(e, [], n, r), this.mark = t, this.spec = i;
	}
	static create(t, n, r, i) {
		let a = i.nodeViews[n.type.name], o = a && a(n, i, r);
		return (!o || !o.dom) && (o = vt.renderSpec(document, n.type.spec.toDOM(n, r), null, n.attrs)), new e(t, n, o.dom, o.contentDOM || o.dom, o);
	}
	parseRule() {
		return this.dirty & Qi || this.mark.type.spec.reparseInView ? null : {
			mark: this.mark.type.name,
			attrs: this.mark.attrs,
			contentElement: this.contentDOM
		};
	}
	matchesMark(e) {
		return this.dirty != Qi && this.mark.eq(e);
	}
	markDirty(e, t) {
		if (super.markDirty(e, t), this.dirty != J) {
			let e = this.parent;
			for (; !e.node;) e = e.parent;
			e.dirty < this.dirty && (e.dirty = this.dirty), this.dirty = J;
		}
	}
	slice(t, n, r) {
		let i = e.create(this.parent, this.mark, !0, r), a = this.children, o = this.size;
		n < o && (a = Ca(a, n, o, r)), t > 0 && (a = Ca(a, 0, t, r));
		for (let e = 0; e < a.length; e++) a[e].parent = i;
		return i.children = a, i;
	}
	ignoreMutation(e) {
		return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
	}
	destroy() {
		this.spec.destroy && this.spec.destroy(), super.destroy();
	}
}, ra = class e extends $i {
	constructor(e, t, n, r, i, a, o) {
		super(e, [], i, a), this.node = t, this.outerDeco = n, this.innerDeco = r, this.nodeDOM = o;
	}
	static create(t, n, r, i, a, o) {
		let s = a.nodeViews[n.type.name], c, l = s && s(n, a, () => {
			if (!c) return o;
			if (c.parent) return c.parent.posBeforeChild(c);
		}, r, i), u = l && l.dom, d = l && l.contentDOM;
		if (n.isText) {
			if (!u) u = document.createTextNode(n.text);
			else if (u.nodeType != 3) throw RangeError("Text must be rendered as a DOM text node");
		} else if (!u) {
			let e = vt.renderSpec(document, n.type.spec.toDOM(n), null, n.attrs);
			({dom: u, contentDOM: d} = e);
		}
		!d && !n.isText && u.nodeName != "BR" && (u.hasAttribute("contenteditable") || (u.contentEditable = "false"), n.type.spec.draggable && (u.draggable = !0));
		let f = u;
		return u = ma(u, r, n), l ? c = new sa(t, n, r, i, u, d || null, f, l) : n.isText ? new aa(t, n, r, i, u, f) : new e(t, n, r, i, u, d || null, f);
	}
	parseRule(e) {
		if (this.node.type.spec.reparseInView) return null;
		let t = {
			node: this.node.type.name,
			attrs: this.node.attrs
		};
		if (this.node.type.whitespace == "pre" && (t.preserveWhitespace = "full"), !this.contentDOM) t.getContent = () => this.node.content;
		else if (!this.contentLost) t.contentElement = this.contentDOM;
		else {
			for (let e = this.children.length - 1; e >= 0; e--) {
				let n = this.children[e];
				if (this.dom.contains(n.dom.parentNode)) {
					t.contentElement = n.dom.parentNode;
					break;
				}
			}
			if (!t.contentElement) {
				let n = e && e.find((t) => t.nodeType == 1 && e.indexOf(t.parentNode) < 0 && this.dom.contains(t));
				n ? t.contentElement = n : t.getContent = () => A.empty;
			}
		}
		return t;
	}
	matchesNode(e, t, n) {
		return this.dirty == J && e.eq(this.node) && ha(t, this.outerDeco) && n.eq(this.innerDeco);
	}
	get size() {
		return this.node.nodeSize;
	}
	get border() {
		return +!this.node.isLeaf;
	}
	updateChildren(e, t) {
		let n = this.node.inlineContent, r = t, i = e.composing ? this.localCompositionInfo(e, t) : null, a = i && i.pos > -1 ? i : null, o = i && i.pos < 0, s = new _a(this, a && a.node, e);
		ba(this.node, this.innerDeco, (t, i, a) => {
			t.spec.marks ? s.syncToMarks(t.spec.marks, n, e, i) : t.type.side >= 0 && !a && s.syncToMarks(i == this.node.childCount ? M.none : this.node.child(i).marks, n, e, i), s.placeWidget(t, e, r);
		}, (t, a, c, l) => {
			s.syncToMarks(t.marks, n, e, l);
			let u;
			s.findNodeMatch(t, a, c, l) || o && e.state.selection.from > r && e.state.selection.to < r + t.nodeSize && (u = s.findIndexWithChild(i.node)) > -1 && s.updateNodeAt(t, a, c, u, e) || s.updateNextNode(t, a, c, e, l, r) || s.addNode(t, a, c, e, r), r += t.nodeSize;
		}), s.syncToMarks([], n, e, 0), this.node.isTextblock && s.addTextblockHacks(), s.destroyRest(), (s.changed || this.dirty == Zi) && (a && this.protectLocalComposition(e, a), ca(this.contentDOM, this.children, e), pi && xa(this.dom));
	}
	localCompositionInfo(e, t) {
		let { from: n, to: r } = e.state.selection;
		if (!(e.state.selection instanceof z) || n < t || r > t + this.node.content.size) return null;
		let i = e.input.compositionNode;
		if (!i || !this.dom.contains(i.parentNode)) return null;
		if (this.node.inlineContent) {
			let e = i.nodeValue, a = Sa(this.node.content, e, n - t, r - t);
			return a < 0 ? null : {
				node: i,
				pos: a,
				text: e
			};
		}
		return {
			node: i,
			pos: -1,
			text: ""
		};
	}
	protectLocalComposition(e, { node: t, pos: n, text: r }) {
		if (this.getDesc(t)) return;
		let i = t;
		for (; i.parentNode != this.contentDOM; i = i.parentNode) {
			for (; i.previousSibling;) i.parentNode.removeChild(i.previousSibling);
			for (; i.nextSibling;) i.parentNode.removeChild(i.nextSibling);
			i.pmViewDesc && (i.pmViewDesc = void 0);
		}
		let a = new ta(this, i, t, r);
		e.input.compositionNodes.push(a), this.children = Ca(this.children, n, n + r.length, e, a);
	}
	update(e, t, n, r) {
		return this.dirty == Qi || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, t, n, r), !0);
	}
	updateInner(e, t, n, r) {
		this.updateOuterDeco(t), this.node = e, this.innerDeco = n, this.contentDOM && this.updateChildren(r, this.posAtStart), this.dirty = J;
	}
	updateOuterDeco(e) {
		if (ha(e, this.outerDeco)) return;
		let t = this.nodeDOM.nodeType != 1, n = this.dom;
		this.dom = fa(this.dom, this.nodeDOM, da(this.outerDeco, this.node, t), da(e, this.node, t)), this.dom != n && (n.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = e;
	}
	selectNode() {
		this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.add("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && (this.nodeDOM.draggable = !0));
	}
	deselectNode() {
		this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.remove("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && this.nodeDOM.removeAttribute("draggable"));
	}
	get domAtom() {
		return this.node.isAtom;
	}
};
function ia(e, t, n, r, i) {
	ma(r, t, e);
	let a = new ra(void 0, e, t, n, r, r, r);
	return a.contentDOM && a.updateChildren(i, 0), a;
}
var aa = class e extends ra {
	constructor(e, t, n, r, i, a) {
		super(e, t, n, r, i, null, a);
	}
	parseRule() {
		let e = this.nodeDOM.parentNode;
		for (; e && e != this.dom && !e.pmIsDeco;) e = e.parentNode;
		return { skip: e || !0 };
	}
	update(e, t, n, r) {
		return this.dirty == Qi || this.dirty != J && !this.inParent() || !e.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(t), (this.dirty != J || e.text != this.node.text) && e.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = e.text, r.trackWrites == this.nodeDOM && (r.trackWrites = null)), this.node = e, this.dirty = J, !0);
	}
	inParent() {
		let e = this.parent.contentDOM;
		for (let t = this.nodeDOM; t; t = t.parentNode) if (t == e) return !0;
		return !1;
	}
	domFromPos(e) {
		return {
			node: this.nodeDOM,
			offset: e
		};
	}
	localPosFromDOM(e, t, n) {
		return e == this.nodeDOM ? this.posAtStart + Math.min(t, this.node.text.length) : super.localPosFromDOM(e, t, n);
	}
	ignoreMutation(e) {
		return e.type != "characterData" && e.type != "selection";
	}
	slice(t, n, r) {
		let i = this.node.cut(t, n), a = document.createTextNode(i.text);
		return new e(this.parent, i, this.outerDeco, this.innerDeco, a, a);
	}
	markDirty(e, t) {
		super.markDirty(e, t), this.dom != this.nodeDOM && (e == 0 || t == this.nodeDOM.nodeValue.length) && (this.dirty = Qi);
	}
	get domAtom() {
		return !1;
	}
	isText(e) {
		return this.node.text == e;
	}
}, oa = class extends $i {
	parseRule() {
		return { ignore: !0 };
	}
	matchesHack(e) {
		return this.dirty == J && this.dom.nodeName == e;
	}
	get domAtom() {
		return !0;
	}
	get ignoreForCoords() {
		return this.dom.nodeName == "IMG";
	}
}, sa = class extends ra {
	constructor(e, t, n, r, i, a, o, s) {
		super(e, t, n, r, i, a, o), this.spec = s;
	}
	update(e, t, n, r) {
		if (this.dirty == Qi) return !1;
		if (this.spec.update && (this.node.type == e.type || this.spec.multiType)) {
			let i = this.spec.update(e, t, n);
			return i && this.updateInner(e, t, n, r), i;
		}
		return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, t, n, r);
	}
	selectNode() {
		this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
	}
	deselectNode() {
		this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
	}
	setSelection(e, t, n, r) {
		this.spec.setSelection ? this.spec.setSelection(e, t, n.root) : super.setSelection(e, t, n, r);
	}
	destroy() {
		this.spec.destroy && this.spec.destroy(), super.destroy();
	}
	stopEvent(e) {
		return this.spec.stopEvent ? this.spec.stopEvent(e) : !1;
	}
	ignoreMutation(e) {
		return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
	}
};
function ca(e, t, n) {
	let r = e.firstChild, i = !1;
	for (let a = 0; a < t.length; a++) {
		let o = t[a], s = o.dom;
		if (s.parentNode == e) {
			for (; s != r;) r = ga(r), i = !0;
			r = r.nextSibling;
		} else i = !0, e.insertBefore(s, r);
		if (o instanceof na) {
			let t = r ? r.previousSibling : e.lastChild;
			ca(o.contentDOM, o.children, n), r = t ? t.nextSibling : e.firstChild;
		}
	}
	for (; r;) r = ga(r), i = !0;
	i && n.trackWrites == e && (n.trackWrites = null);
}
var la = function(e) {
	e && (this.nodeName = e);
};
la.prototype = Object.create(null);
var ua = [new la()];
function da(e, t, n) {
	if (e.length == 0) return ua;
	let r = n ? ua[0] : new la(), i = [r];
	for (let a = 0; a < e.length; a++) {
		let o = e[a].type.attrs;
		if (o) {
			o.nodeName && i.push(r = new la(o.nodeName));
			for (let e in o) {
				let a = o[e];
				a != null && (n && i.length == 1 && i.push(r = new la(t.isInline ? "span" : "div")), e == "class" ? r.class = (r.class ? r.class + " " : "") + a : e == "style" ? r.style = (r.style ? r.style + ";" : "") + a : e != "nodeName" && (r[e] = a));
			}
		}
	}
	return i;
}
function fa(e, t, n, r) {
	if (n == ua && r == ua) return t;
	let i = t;
	for (let t = 0; t < r.length; t++) {
		let a = r[t], o = n[t];
		if (t) {
			let t;
			o && o.nodeName == a.nodeName && i != e && (t = i.parentNode) && t.nodeName.toLowerCase() == a.nodeName ? i = t : (t = document.createElement(a.nodeName), t.pmIsDeco = !0, t.appendChild(i), o = ua[0], i = t);
		}
		pa(i, o || ua[0], a);
	}
	return i;
}
function pa(e, t, n) {
	for (let r in t) r != "class" && r != "style" && r != "nodeName" && !(r in n) && e.removeAttribute(r);
	for (let r in n) r != "class" && r != "style" && r != "nodeName" && n[r] != t[r] && e.setAttribute(r, n[r]);
	if (t.class != n.class) {
		let r = t.class ? t.class.split(" ").filter(Boolean) : [], i = n.class ? n.class.split(" ").filter(Boolean) : [];
		for (let t = 0; t < r.length; t++) i.indexOf(r[t]) == -1 && e.classList.remove(r[t]);
		for (let t = 0; t < i.length; t++) r.indexOf(i[t]) == -1 && e.classList.add(i[t]);
		e.classList.length == 0 && e.removeAttribute("class");
	}
	if (t.style != n.style) {
		if (t.style) {
			let n = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, r;
			for (; r = n.exec(t.style);) e.style.removeProperty(r[1]);
		}
		n.style && (e.style.cssText += n.style);
	}
}
function ma(e, t, n) {
	return fa(e, e, ua, da(t, n, e.nodeType != 1));
}
function ha(e, t) {
	if (e.length != t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!e[n].type.eq(t[n].type)) return !1;
	return !0;
}
function ga(e) {
	let t = e.nextSibling;
	return e.parentNode.removeChild(e), t;
}
var _a = class {
	constructor(e, t, n) {
		this.lock = t, this.view = n, this.index = 0, this.stack = [], this.changed = !1, this.top = e, this.preMatch = va(e.node.content, e);
	}
	destroyBetween(e, t) {
		if (e != t) {
			for (let n = e; n < t; n++) this.top.children[n].destroy();
			this.top.children.splice(e, t - e), this.changed = !0;
		}
	}
	destroyRest() {
		this.destroyBetween(this.index, this.top.children.length);
	}
	syncToMarks(e, t, n, r) {
		let i = 0, a = this.stack.length >> 1, o = Math.min(a, e.length);
		for (; i < o && (i == a - 1 ? this.top : this.stack[i + 1 << 1]).matchesMark(e[i]) && e[i].type.spec.spanning !== !1;) i++;
		for (; i < a;) this.destroyRest(), this.top.dirty = J, this.index = this.stack.pop(), this.top = this.stack.pop(), a--;
		for (; a < e.length;) {
			this.stack.push(this.top, this.index + 1);
			let i = -1, o = this.top.children.length;
			r < this.preMatch.index && (o = Math.min(this.index + 3, o));
			for (let t = this.index; t < o; t++) {
				let n = this.top.children[t];
				if (n.matchesMark(e[a]) && !this.isLocked(n.dom)) {
					i = t;
					break;
				}
			}
			if (i < 0 && this.index < this.top.children.length) {
				let t = this.top.children[this.index];
				t instanceof na && t.dirty != Qi && t.mark.type == e[a].type && t.spec.update && !this.isLocked(t.dom) && t.spec.update(e[a]) && (t.mark = e[a], i = this.index, this.changed = !0);
			}
			if (i > -1) i > this.index && (this.changed = !0, this.destroyBetween(this.index, i)), this.top = this.top.children[this.index];
			else {
				let r = na.create(this.top, e[a], t, n);
				this.top.children.splice(this.index, 0, r), this.top = r, this.changed = !0;
			}
			this.index = 0, a++;
		}
	}
	findNodeMatch(e, t, n, r) {
		let i = -1, a;
		if (r >= this.preMatch.index && (a = this.preMatch.matches[r - this.preMatch.index]).parent == this.top && a.matchesNode(e, t, n)) i = this.top.children.indexOf(a, this.index);
		else for (let r = this.index, a = Math.min(this.top.children.length, r + 5); r < a; r++) {
			let a = this.top.children[r];
			if (a.matchesNode(e, t, n) && !this.preMatch.matched.has(a)) {
				i = r;
				break;
			}
		}
		return i < 0 ? !1 : (this.destroyBetween(this.index, i), this.index++, !0);
	}
	updateNodeAt(e, t, n, r, i) {
		let a = this.top.children[r];
		return a.dirty == Qi && a.dom == a.contentDOM && (a.dirty = Zi), a.update(e, t, n, i) ? (this.destroyBetween(this.index, r), this.index++, !0) : !1;
	}
	findIndexWithChild(e) {
		for (;;) {
			let t = e.parentNode;
			if (!t) return -1;
			if (t == this.top.contentDOM) {
				let t = e.pmViewDesc;
				if (t) {
					for (let e = this.index; e < this.top.children.length; e++) if (this.top.children[e] == t) return e;
				}
				return -1;
			}
			e = t;
		}
	}
	updateNextNode(e, t, n, r, i, a) {
		for (let o = this.index; o < this.top.children.length; o++) {
			let s = this.top.children[o];
			if (s instanceof ra) {
				let c = this.preMatch.matched.get(s);
				if (c != null && c != i) return !1;
				let l = s.dom, u, d = this.isLocked(l) && !(e.isText && s.node && s.node.isText && s.nodeDOM.nodeValue == e.text && s.dirty != Qi && ha(t, s.outerDeco));
				if (!d && s.update(e, t, n, r)) return this.destroyBetween(this.index, o), s.dom != l && (this.changed = !0), this.index++, !0;
				if (!d && (u = this.recreateWrapper(s, e, t, n, r, a))) return this.destroyBetween(this.index, o), this.top.children[this.index] = u, u.contentDOM && (u.dirty = Zi, u.updateChildren(r, a + 1), u.dirty = J), this.changed = !0, this.index++, !0;
				break;
			}
		}
		return !1;
	}
	recreateWrapper(e, t, n, r, i, a) {
		if (e.dirty || t.isAtom || !e.children.length || !e.node.content.eq(t.content) || !ha(n, e.outerDeco) || !r.eq(e.innerDeco)) return null;
		let o = ra.create(this.top, t, n, r, i, a);
		if (o.contentDOM) {
			o.children = e.children, e.children = [];
			for (let e of o.children) e.parent = o;
		}
		return e.destroy(), o;
	}
	addNode(e, t, n, r, i) {
		let a = ra.create(this.top, e, t, n, r, i);
		a.contentDOM && a.updateChildren(r, i + 1), this.top.children.splice(this.index++, 0, a), this.changed = !0;
	}
	placeWidget(e, t, n) {
		let r = this.index < this.top.children.length ? this.top.children[this.index] : null;
		if (r && r.matchesWidget(e) && (e == r.widget || !r.widget.type.toDOM.parentNode)) this.index++;
		else {
			let r = new ea(this.top, e, t, n);
			this.top.children.splice(this.index++, 0, r), this.changed = !0;
		}
	}
	addTextblockHacks() {
		let e = this.top.children[this.index - 1], t = this.top;
		for (; e instanceof na;) t = e, e = t.children[t.children.length - 1];
		(!e || !(e instanceof aa) || /\n$/.test(e.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(e.node.text)) && ((K || G) && e && e.dom.contentEditable == "false" && this.addHackNode("IMG", t), this.addHackNode("BR", this.top));
	}
	addHackNode(e, t) {
		if (t == this.top && this.index < t.children.length && t.children[this.index].matchesHack(e)) this.index++;
		else {
			let n = document.createElement(e);
			e == "IMG" && (n.className = "ProseMirror-separator", n.alt = ""), e == "BR" && (n.className = "ProseMirror-trailingBreak");
			let r = new oa(this.top, [], n, null);
			t == this.top ? t.children.splice(this.index++, 0, r) : t.children.push(r), this.changed = !0;
		}
	}
	isLocked(e) {
		return this.lock && (e == this.lock || e.nodeType == 1 && e.contains(this.lock.parentNode));
	}
};
function va(e, t) {
	let n = t, r = n.children.length, i = e.childCount, a = /* @__PURE__ */ new Map(), o = [];
	outer: for (; i > 0;) {
		let s;
		for (;;) if (r) {
			let e = n.children[r - 1];
			if (e instanceof na) n = e, r = e.children.length;
			else {
				s = e, r--;
				break;
			}
		} else if (n == t) break outer;
		else r = n.parent.children.indexOf(n), n = n.parent;
		let c = s.node;
		if (c) {
			if (c != e.child(i - 1)) break;
			--i, a.set(s, i), o.push(s);
		}
	}
	return {
		index: i,
		matched: a,
		matches: o.reverse()
	};
}
function ya(e, t) {
	return e.type.side - t.type.side;
}
function ba(e, t, n, r) {
	let i = t.locals(e), a = 0;
	if (i.length == 0) {
		for (let n = 0; n < e.childCount; n++) {
			let o = e.child(n);
			r(o, i, t.forChild(a, o), n), a += o.nodeSize;
		}
		return;
	}
	let o = 0, s = [], c = null;
	for (let l = 0;;) {
		let u, d;
		for (; o < i.length && i[o].to == a;) {
			let e = i[o++];
			e.widget && (u ? (d ||= [u]).push(e) : u = e);
		}
		if (u) {
			if (d) {
				d.sort(ya);
				for (let e = 0; e < d.length; e++) n(d[e], l, !!c);
			} else n(u, l, !!c);
		}
		let f, p;
		if (c) p = -1, f = c, c = null;
		else if (l < e.childCount) p = l, f = e.child(l++);
		else break;
		for (let e = 0; e < s.length; e++) s[e].to <= a && s.splice(e--, 1);
		for (; o < i.length && i[o].from <= a && i[o].to > a;) s.push(i[o++]);
		let m = a + f.nodeSize;
		if (f.isText) {
			let e = m;
			o < i.length && i[o].from < e && (e = i[o].from);
			for (let t = 0; t < s.length; t++) s[t].to < e && (e = s[t].to);
			e < m && (c = f.cut(e - a), f = f.cut(0, e - a), m = e, p = -1);
		} else for (; o < i.length && i[o].to < m;) o++;
		let h = f.isInline && !f.isLeaf ? s.filter((e) => !e.inline) : s.slice();
		r(f, h, t.forChild(a, f), p), a = m;
	}
}
function xa(e) {
	if (e.nodeName == "UL" || e.nodeName == "OL") {
		let t = e.style.cssText;
		e.style.cssText = t + "; list-style: square !important", window.getComputedStyle(e).listStyle, e.style.cssText = t;
	}
}
function Sa(e, t, n, r) {
	for (let i = 0, a = 0; i < e.childCount && a <= r;) {
		let o = e.child(i++), s = a;
		if (a += o.nodeSize, !o.isText) continue;
		let c = o.text;
		for (; i < e.childCount;) {
			let t = e.child(i++);
			if (a += t.nodeSize, !t.isText) break;
			c += t.text;
		}
		if (a >= n) {
			if (a >= r && c.slice(r - t.length - s, r - s) == t) return r - t.length;
			let e = s < r ? c.lastIndexOf(t, r - s - 1) : -1;
			if (e >= 0 && e + t.length + s >= n) return s + e;
			if (n == r && c.length >= r + t.length - s && c.slice(r - s, r - s + t.length) == t) return r;
		}
	}
	return -1;
}
function Ca(e, t, n, r, i) {
	let a = [];
	for (let o = 0, s = 0; o < e.length; o++) {
		let c = e[o], l = s, u = s += c.size;
		l >= n || u <= t ? a.push(c) : (l < t && a.push(c.slice(0, t - l, r)), i &&= (a.push(i), void 0), u > n && a.push(c.slice(n - l, c.size, r)));
	}
	return a;
}
function wa(e, t = null) {
	let n = e.domSelectionRange(), r = e.state.doc;
	if (!n.focusNode) return null;
	let i = e.docView.nearestDesc(n.focusNode), a = i && i.size == 0, o = e.docView.posFromDOM(n.focusNode, n.focusOffset, 1);
	if (o < 0) return null;
	let s = r.resolve(o), c, l;
	if (ei(n)) {
		for (c = o; i && !i.node;) i = i.parent;
		let e = i.node;
		if (i && e.isAtom && B.isSelectable(e) && i.parent && !(e.isInline && Qr(n.focusNode, n.focusOffset, i.dom))) {
			let e = i.posBefore;
			l = new B(o == e ? s : r.resolve(e));
		}
	} else {
		if (n instanceof e.dom.ownerDocument.defaultView.Selection && n.rangeCount > 1) {
			let t = o, i = o;
			for (let r = 0; r < n.rangeCount; r++) {
				let a = n.getRangeAt(r);
				t = Math.min(t, e.docView.posFromDOM(a.startContainer, a.startOffset, 1)), i = Math.max(i, e.docView.posFromDOM(a.endContainer, a.endOffset, -1));
			}
			if (t < 0) return null;
			[c, o] = i == e.state.selection.anchor ? [i, t] : [t, i], s = r.resolve(o);
		} else c = e.docView.posFromDOM(n.anchorNode, n.anchorOffset, 1);
		if (c < 0) return null;
	}
	let u = r.resolve(c);
	if (!l) {
		let n = t == "pointer" || e.state.selection.head < s.pos && !a ? 1 : -1;
		l = Fa(e, u, s, n);
	}
	return l;
}
function Ta(e) {
	return e.editable ? e.hasFocus() : La(e) && document.activeElement && document.activeElement.contains(e.dom);
}
function Ea(e, t = !1) {
	let n = e.state.selection;
	if (Na(e, n), !Ta(e)) return;
	let r = e.input.mouseDown;
	if (!t && G && r) {
		let t = e.domSelectionRange(), n = e.domObserver.currentSelection;
		if (t.anchorNode && n.anchorNode && qr(t.anchorNode, t.anchorOffset, n.anchorNode, n.anchorOffset) && r.delaySelUpdate()) {
			e.domObserver.setCurSelection();
			return;
		}
	}
	if (e.domObserver.disconnectSelection(), e.cursorWrapper) Ma(e);
	else {
		let { anchor: r, head: i } = n, a, o;
		Da && !(n instanceof z) && (n.$from.parent.inlineContent || (a = Oa(e, n.from)), !n.empty && !n.$from.parent.inlineContent && (o = Oa(e, n.to))), e.docView.setSelection(r, i, e, t), Da && (a && Aa(a), o && Aa(o)), n.visible ? e.dom.classList.remove("ProseMirror-hideselection") : (e.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && ja(e));
	}
	e.domObserver.setCurSelection(), e.domObserver.connectSelection();
}
var Da = K || G && fi < 63;
function Oa(e, t) {
	let { node: n, offset: r } = e.docView.domFromPos(t, 0), i = r < n.childNodes.length ? n.childNodes[r] : null, a = r ? n.childNodes[r - 1] : null;
	if (K && i && i.contentEditable == "false") return ka(i);
	if ((!i || i.contentEditable == "false") && (!a || a.contentEditable == "false")) {
		if (i) return ka(i);
		if (a) return ka(a);
	}
}
function ka(e) {
	return e.contentEditable = "true", K && e.draggable && (e.draggable = !1, e.wasDraggable = !0), e;
}
function Aa(e) {
	e.contentEditable = "false", e.wasDraggable &&= (e.draggable = !0, null);
}
function ja(e) {
	let t = e.dom.ownerDocument;
	t.removeEventListener("selectionchange", e.input.hideSelectionGuard);
	let n = e.domSelectionRange(), r = n.anchorNode, i = n.anchorOffset;
	t.addEventListener("selectionchange", e.input.hideSelectionGuard = () => {
		(n.anchorNode != r || n.anchorOffset != i) && (t.removeEventListener("selectionchange", e.input.hideSelectionGuard), setTimeout(() => {
			(!Ta(e) || e.state.selection.visible) && e.dom.classList.remove("ProseMirror-hideselection");
		}, 20));
	});
}
function Ma(e) {
	let t = e.domSelection();
	if (!t) return;
	let n = e.cursorWrapper.dom, r = n.nodeName == "IMG";
	r ? t.collapse(n.parentNode, V(n) + 1) : t.collapse(n, 0), !r && !e.state.selection.visible && U && ui <= 11 && (n.disabled = !0, n.disabled = !1);
}
function Na(e, t) {
	if (t instanceof B) {
		let n = e.docView.descAt(t.from);
		n != e.lastSelectedViewDesc && (Pa(e), n && n.selectNode(), e.lastSelectedViewDesc = n);
	} else Pa(e);
}
function Pa(e) {
	e.lastSelectedViewDesc &&= (e.lastSelectedViewDesc.parent && e.lastSelectedViewDesc.deselectNode(), void 0);
}
function Fa(e, t, n, r) {
	return e.someProp("createSelectionBetween", (r) => r(e, t, n)) || z.between(t, n, r);
}
function Ia(e) {
	return e.editable && !e.hasFocus() ? !1 : La(e);
}
function La(e) {
	let t = e.domSelectionRange();
	if (!t.anchorNode) return !1;
	try {
		return e.dom.contains(t.anchorNode.nodeType == 3 ? t.anchorNode.parentNode : t.anchorNode) && (e.editable || e.dom.contains(t.focusNode.nodeType == 3 ? t.focusNode.parentNode : t.focusNode));
	} catch {
		return !1;
	}
}
function Ra(e) {
	let t = e.docView.domFromPos(e.state.selection.anchor, 0), n = e.domSelectionRange();
	return qr(t.node, t.offset, n.anchorNode, n.anchorOffset);
}
function za(e, t) {
	let { $anchor: n, $head: r } = e.selection, i = t > 0 ? n.max(r) : n.min(r), a = i.parent.inlineContent ? i.depth ? e.doc.resolve(t > 0 ? i.after() : i.before()) : null : i;
	return a && R.findFrom(a, t);
}
function Ba(e, t) {
	return e.dispatch(e.state.tr.setSelection(t).scrollIntoView()), !0;
}
function Va(e, t, n) {
	let r = e.state.selection;
	if (r instanceof z) {
		if (n.indexOf("s") > -1) {
			let { $head: n } = r, i = n.textOffset ? null : t < 0 ? n.nodeBefore : n.nodeAfter;
			if (!i || i.isText || !i.isLeaf) return !1;
			let a = e.state.doc.resolve(n.pos + i.nodeSize * (t < 0 ? -1 : 1));
			return Ba(e, new z(r.$anchor, a));
		}
		if (!r.empty) return !1;
		if (e.endOfTextblock(t > 0 ? "forward" : "backward")) {
			let n = za(e.state, t);
			return n && n instanceof B ? Ba(e, n) : !1;
		}
		if (!(q && n.indexOf("m") > -1)) {
			let n = r.$head, i = n.textOffset ? null : t < 0 ? n.nodeBefore : n.nodeAfter, a;
			if (!i || i.isText) return !1;
			let o = t < 0 ? n.pos - i.nodeSize : n.pos;
			return i.isAtom || (a = e.docView.descAt(o)) && !a.contentDOM ? B.isSelectable(i) ? Ba(e, new B(t < 0 ? e.state.doc.resolve(n.pos - i.nodeSize) : n)) : gi ? Ba(e, new z(e.state.doc.resolve(t < 0 ? o : o + i.nodeSize))) : !1 : !1;
		}
	} else if (r instanceof B && r.node.isInline) return Ba(e, new z(t > 0 ? r.$to : r.$from));
	else {
		let n = za(e.state, t);
		return n ? Ba(e, n) : !1;
	}
}
function Ha(e) {
	return e.nodeType == 3 ? e.nodeValue.length : e.childNodes.length;
}
function Ua(e, t) {
	let n = e.pmViewDesc;
	return n && n.size == 0 && (t < 0 || e.nextSibling || e.nodeName != "BR");
}
function Wa(e, t) {
	return t < 0 ? Ga(e) : Ka(e);
}
function Ga(e) {
	let t = e.domSelectionRange(), n = t.focusNode, r = t.focusOffset;
	if (!n) return;
	let i, a, o = !1;
	for (W && n.nodeType == 1 && r < Ha(n) && Ua(n.childNodes[r], -1) && (o = !0);;) if (r > 0) {
		if (n.nodeType != 1) break;
		{
			let e = n.childNodes[r - 1];
			if (Ua(e, -1)) i = n, a = --r;
			else if (e.nodeType == 3) n = e, r = n.nodeValue.length;
			else break;
		}
	} else if (qa(n)) break;
	else {
		let t = n.previousSibling;
		for (; t && Ua(t, -1);) i = n.parentNode, a = V(t), t = t.previousSibling;
		if (t) n = t, r = Ha(n);
		else {
			if (n = n.parentNode, n == e.dom) break;
			r = 0;
		}
	}
	o ? Xa(e, n, r) : i && Xa(e, i, a);
}
function Ka(e) {
	let t = e.domSelectionRange(), n = t.focusNode, r = t.focusOffset;
	if (!n) return;
	let i = Ha(n), a, o;
	for (;;) if (r < i) {
		if (n.nodeType != 1) break;
		let e = n.childNodes[r];
		if (Ua(e, 1)) a = n, o = ++r;
		else break;
	} else if (qa(n)) break;
	else {
		let t = n.nextSibling;
		for (; t && Ua(t, 1);) a = t.parentNode, o = V(t) + 1, t = t.nextSibling;
		if (t) n = t, r = 0, i = Ha(n);
		else {
			if (n = n.parentNode, n == e.dom) break;
			r = i = 0;
		}
	}
	a && Xa(e, a, o);
}
function qa(e) {
	let t = e.pmViewDesc;
	return t && t.node && t.node.isBlock;
}
function Ja(e, t) {
	for (; e && t == e.childNodes.length && !$r(e);) t = V(e) + 1, e = e.parentNode;
	for (; e && t < e.childNodes.length;) {
		let n = e.childNodes[t];
		if (n.nodeType == 3) return n;
		if (n.nodeType == 1 && n.contentEditable == "false") break;
		e = n, t = 0;
	}
}
function Ya(e, t) {
	for (; e && !t && !$r(e);) t = V(e), e = e.parentNode;
	for (; e && t;) {
		let n = e.childNodes[t - 1];
		if (n.nodeType == 3) return n;
		if (n.nodeType == 1 && n.contentEditable == "false") break;
		e = n, t = e.childNodes.length;
	}
}
function Xa(e, t, n) {
	if (t.nodeType != 3) {
		let e, r;
		(r = Ja(t, n)) ? (t = r, n = 0) : (e = Ya(t, n)) && (t = e, n = e.nodeValue.length);
	}
	let r = e.domSelection();
	if (!r) return;
	if (ei(r)) {
		let e = document.createRange();
		e.setEnd(t, n), e.setStart(t, n), r.removeAllRanges(), r.addRange(e);
	} else r.extend && r.extend(t, n);
	e.domObserver.setCurSelection();
	let { state: i } = e;
	setTimeout(() => {
		e.state == i && Ea(e);
	}, 50);
}
function Za(e, t) {
	let n = e.state.doc.resolve(t);
	if (!(G || mi) && n.parent.inlineContent) {
		let r = e.coordsAtPos(t);
		if (t > n.start()) {
			let n = e.coordsAtPos(t - 1), i = (n.top + n.bottom) / 2;
			if (i > r.top && i < r.bottom && Math.abs(n.left - r.left) > 1) return n.left < r.left ? "ltr" : "rtl";
		}
		if (t < n.end()) {
			let n = e.coordsAtPos(t + 1), i = (n.top + n.bottom) / 2;
			if (i > r.top && i < r.bottom && Math.abs(n.left - r.left) > 1) return n.left > r.left ? "ltr" : "rtl";
		}
	}
	return getComputedStyle(e.dom).direction == "rtl" ? "rtl" : "ltr";
}
function Qa(e, t, n) {
	let r = e.state.selection;
	if (r instanceof z && !r.empty || n.indexOf("s") > -1 || q && n.indexOf("m") > -1) return !1;
	let { $from: i, $to: a } = r;
	if (!i.parent.inlineContent || e.endOfTextblock(t < 0 ? "up" : "down")) {
		let n = za(e.state, t);
		if (n && n instanceof B) return Ba(e, n);
	}
	if (!i.parent.inlineContent) {
		let n = t < 0 ? i : a, o = r instanceof Hn ? R.near(n, t) : R.findFrom(n, t);
		return o ? Ba(e, o) : !1;
	}
	return !1;
}
function $a(e, t) {
	if (!(e.state.selection instanceof z)) return !0;
	let { $head: n, $anchor: r, empty: i } = e.state.selection;
	if (!n.sameParent(r)) return !0;
	if (!i) return !1;
	if (e.endOfTextblock(t > 0 ? "forward" : "backward")) return !0;
	let a = !n.textOffset && (t < 0 ? n.nodeBefore : n.nodeAfter);
	if (a && !a.isText) {
		let r = e.state.tr;
		return t < 0 ? r.delete(n.pos - a.nodeSize, n.pos) : r.delete(n.pos, n.pos + a.nodeSize), e.dispatch(r), !0;
	}
	return !1;
}
function eo(e, t, n) {
	e.domObserver.stop(), t.contentEditable = n, e.domObserver.start();
}
function to(e) {
	if (!K || e.state.selection.$head.parentOffset > 0) return !1;
	let { focusNode: t, focusOffset: n } = e.domSelectionRange();
	if (t && t.nodeType == 1 && n == 0 && t.firstChild && t.firstChild.contentEditable == "false") {
		let n = t.firstChild;
		eo(e, n, "true"), setTimeout(() => eo(e, n, "false"), 20);
	}
	return !1;
}
function no(e) {
	let t = "";
	return e.ctrlKey && (t += "c"), e.metaKey && (t += "m"), e.altKey && (t += "a"), e.shiftKey && (t += "s"), t;
}
function ro(e, t) {
	let n = t.keyCode, r = no(t);
	if (n == 8 || q && n == 72 && r == "c") return $a(e, -1) || Wa(e, -1);
	if (n == 46 && !t.shiftKey || q && n == 68 && r == "c") return $a(e, 1) || Wa(e, 1);
	if (n == 13 || n == 27) return !0;
	if (n == 37 || q && n == 66 && r == "c") {
		let t = n == 37 ? Za(e, e.state.selection.from) == "ltr" ? -1 : 1 : -1;
		return Va(e, t, r) || Wa(e, t);
	}
	if (n == 39 || q && n == 70 && r == "c") {
		let t = n == 39 ? Za(e, e.state.selection.from) == "ltr" ? 1 : -1 : 1;
		return Va(e, t, r) || Wa(e, t);
	}
	return n == 38 || q && n == 80 && r == "c" ? Qa(e, -1, r) || Wa(e, -1) : n == 40 || q && n == 78 && r == "c" ? to(e) || Qa(e, 1, r) || Wa(e, 1) : !(r != (q ? "m" : "c") || n != 66 && n != 73 && n != 89 && n != 90);
}
function io(e, t) {
	e.someProp("transformCopied", (n) => {
		t = n(t, e);
	});
	let n = [], { content: r, openStart: i, openEnd: a } = t;
	for (; i > 1 && a > 1 && r.childCount == 1 && r.firstChild.childCount == 1;) {
		i--, a--;
		let e = r.firstChild;
		n.push(e.type.name, e.attrs == e.type.defaultAttrs ? null : e.attrs), r = e.content;
	}
	let o = e.someProp("clipboardSerializer") || vt.fromSchema(e.state.schema), s = ho(), c = s.createElement("div");
	c.appendChild(o.serializeFragment(r, { document: s }));
	let l = c.firstChild, u, d = 0;
	for (; l && l.nodeType == 1 && (u = mo[l.nodeName.toLowerCase()]);) {
		for (let e = u.length - 1; e >= 0; e--) {
			let t = s.createElement(u[e]);
			for (; c.firstChild;) t.appendChild(c.firstChild);
			c.appendChild(t), d++;
		}
		l = c.firstChild;
	}
	return l && l.nodeType == 1 && l.setAttribute("data-pm-slice", `${i} ${a}${d ? ` -${d}` : ""} ${JSON.stringify(n)}`), {
		dom: c,
		text: e.someProp("clipboardTextSerializer", (n) => n(t, e)) || t.content.textBetween(0, t.content.size, "\n\n"),
		slice: t
	};
}
function ao(e, t, n, r, i) {
	let a = i.parent.type.spec.code, o, s;
	if (!n && !t) return null;
	let c = !!t && (r || a || !n);
	if (c) {
		if (e.someProp("transformPastedText", (n) => {
			t = n(t, a || r, e);
		}), a) return s = new N(A.from(e.state.schema.text(t.replace(/\r\n?/g, "\n"))), 0, 0), e.someProp("transformPasted", (t) => {
			s = t(s, e, !0);
		}), s;
		let n = e.someProp("clipboardTextParser", (n) => n(t, i, r, e));
		if (n) s = n;
		else {
			let n = i.marks(), { schema: r } = e.state, a = vt.fromSchema(r);
			o = document.createElement("div"), t.split(/(?:\r\n?|\n)+/).forEach((e) => {
				let t = o.appendChild(document.createElement("p"));
				e && t.appendChild(a.serializeNode(r.text(e, n)));
			});
		}
	} else e.someProp("transformPastedHTML", (t) => {
		n = t(n, e);
	}), o = vo(n), gi && yo(o);
	let l = o && o.querySelector("[data-pm-slice]"), u = l && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(l.getAttribute("data-pm-slice") || "");
	if (u && u[3]) for (let e = +u[3]; e > 0; e--) {
		let e = o.firstChild;
		for (; e && e.nodeType != 1;) e = e.nextSibling;
		if (!e) break;
		o = e;
	}
	if (s ||= (e.someProp("clipboardParser") || e.someProp("domParser") || it.fromSchema(e.state.schema)).parseSlice(o, {
		preserveWhitespace: !!(c || u),
		context: i,
		ruleFromNode(e) {
			return e.nodeName == "BR" && !e.nextSibling && e.parentNode && !oo.test(e.parentNode.nodeName) ? { ignore: !0 } : null;
		}
	}), u) s = bo(po(s, +u[1], +u[2]), u[4]);
	else if (s = N.maxOpen(so(s.content, i), !0), s.openStart || s.openEnd) {
		let e = 0, t = 0;
		for (let t = s.content.firstChild; e < s.openStart && !t.type.spec.isolating; e++, t = t.firstChild);
		for (let e = s.content.lastChild; t < s.openEnd && !e.type.spec.isolating; t++, e = e.lastChild);
		s = po(s, e, t);
	}
	return e.someProp("transformPasted", (t) => {
		s = t(s, e, c);
	}), s;
}
var oo = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function so(e, t) {
	if (e.childCount < 2) return e;
	for (let n = t.depth; n >= 0; n--) {
		let r = t.node(n).contentMatchAt(t.index(n)), i, a = [];
		if (e.forEach((e) => {
			if (!a) return;
			let t = r.findWrapping(e.type), n;
			if (!t) return a = null;
			if (n = a.length && i.length && lo(t, i, e, a[a.length - 1], 0)) a[a.length - 1] = n;
			else {
				a.length && (a[a.length - 1] = uo(a[a.length - 1], i.length));
				let n = co(e, t);
				a.push(n), r = r.matchType(n.type), i = t;
			}
		}), a) return A.from(a);
	}
	return e;
}
function co(e, t, n = 0) {
	for (let r = t.length - 1; r >= n; r--) e = t[r].create(null, A.from(e));
	return e;
}
function lo(e, t, n, r, i) {
	if (i < e.length && i < t.length && e[i] == t[i]) {
		let a = lo(e, t, n, r.lastChild, i + 1);
		if (a) return r.copy(r.content.replaceChild(r.childCount - 1, a));
		if (r.contentMatchAt(r.childCount).matchType(i == e.length - 1 ? n.type : e[i + 1])) return r.copy(r.content.append(A.from(co(n, e, i + 1))));
	}
}
function uo(e, t) {
	if (t == 0) return e;
	let n = e.content.replaceChild(e.childCount - 1, uo(e.lastChild, t - 1)), r = e.contentMatchAt(e.childCount).fillBefore(A.empty, !0);
	return e.copy(n.append(r));
}
function fo(e, t, n, r, i, a) {
	let o = t < 0 ? e.firstChild : e.lastChild, s = o.content;
	return e.childCount > 1 && (a = 0), i < r - 1 && (s = fo(s, t, n, r, i + 1, a)), i >= n && (s = t < 0 ? o.contentMatchAt(0).fillBefore(s, a <= i).append(s) : s.append(o.contentMatchAt(o.childCount).fillBefore(A.empty, !0))), e.replaceChild(t < 0 ? 0 : e.childCount - 1, o.copy(s));
}
function po(e, t, n) {
	return t < e.openStart && (e = new N(fo(e.content, -1, t, e.openStart, 0, e.openEnd), t, e.openEnd)), n < e.openEnd && (e = new N(fo(e.content, 1, n, e.openEnd, 0, 0), e.openStart, n)), e;
}
var mo = {
	thead: ["table"],
	tbody: ["table"],
	tfoot: ["table"],
	caption: ["table"],
	colgroup: ["table"],
	col: ["table", "colgroup"],
	tr: ["table", "tbody"],
	td: [
		"table",
		"tbody",
		"tr"
	],
	th: [
		"table",
		"tbody",
		"tr"
	]
};
function ho() {
	return document.implementation.createHTMLDocument("title");
}
var go = null;
function _o(e) {
	let t = window.trustedTypes;
	if (!t) return e;
	if (!go) {
		if (go = t.defaultPolicy) try {
			return go.createHTML(e);
		} catch {}
		go = t.createPolicy("ProseMirrorClipboard", { createHTML: (e) => e });
	}
	return go.createHTML(e);
}
function vo(e) {
	let t = /^(\s*<meta [^>]*>)*/.exec(e);
	t && (e = e.slice(t[0].length));
	let n = ho(), r = n.body, i = /<([a-z][^>\s]+)/i.exec(e), a;
	if ((a = i && mo[i[1].toLowerCase()]) && (e = a.map((e) => "<" + e + ">").join("") + e + a.map((e) => "</" + e + ">").reverse().join("")), r.innerHTML = _o(e), a) for (let e = 0; e < a.length; e++) r = r.querySelector(a[e]) || r;
	for (let e = 0; e < n.styleSheets.length; e++) {
		let t = n.styleSheets[e];
		for (let e = 0; e < t.rules.length; e++) {
			let n = t.rules[e];
			if (n instanceof CSSStyleRule) {
				let e = r.querySelectorAll(n.selectorText);
				for (let t = 0; t < e.length; t++) e[t].style.cssText += n.style.cssText;
			}
		}
	}
	return r;
}
function yo(e) {
	let t = e.querySelectorAll(G ? "span:not([class]):not([style])" : "span.Apple-converted-space");
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		r.childNodes.length == 1 && r.textContent == "\xA0" && r.parentNode && r.parentNode.replaceChild(e.ownerDocument.createTextNode(" "), r);
	}
}
function bo(e, t) {
	if (!e.size) return e;
	let n = e.content.firstChild.type.schema, r;
	try {
		r = JSON.parse(t);
	} catch {
		return e;
	}
	let { content: i, openStart: a, openEnd: o } = e;
	for (let e = r.length - 2; e >= 0; e -= 2) {
		let t = n.nodes[r[e]];
		if (!t || t.hasRequiredAttrs()) break;
		try {
			t.checkAttrs(r[e + 1]);
		} catch {
			break;
		}
		i = A.from(t.create(r[e + 1], i)), a++, o++;
	}
	return new N(i, a, o);
}
var Y = {}, X = {}, xo = {
	touchstart: !0,
	touchmove: !0
}, So = class {
	constructor() {
		this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = {
			time: 0,
			x: 0,
			y: 0,
			type: "",
			button: 0
		}, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = Object.create(null), this.hideSelectionGuard = null;
	}
};
function Co(e) {
	for (let t in Y) {
		let n = Y[t];
		e.dom.addEventListener(t, e.input.eventHandlers[t] = (t) => {
			Oo(e, t) && !Do(e, t) && (e.editable || !(t.type in X)) && n(e, t);
		}, xo[t] ? { passive: !0 } : void 0);
	}
	K && e.dom.addEventListener("input", () => null), Eo(e);
}
function wo(e, t) {
	e.input.lastSelectionOrigin = t, e.input.lastSelectionTime = Date.now();
}
function To(e) {
	e.input.mouseDown && e.input.mouseDown.done(), e.domObserver.stop();
	for (let t in e.input.eventHandlers) e.dom.removeEventListener(t, e.input.eventHandlers[t]);
	clearTimeout(e.input.composingTimeout), clearTimeout(e.input.lastIOSEnterFallbackTimeout);
}
function Eo(e) {
	e.someProp("handleDOMEvents", (t) => {
		for (let n in t) e.input.eventHandlers[n] || e.dom.addEventListener(n, e.input.eventHandlers[n] = (t) => Do(e, t));
	});
}
function Do(e, t) {
	return e.someProp("handleDOMEvents", (n) => {
		let r = n[t.type];
		return r ? r(e, t) || t.defaultPrevented : !1;
	});
}
function Oo(e, t) {
	if (!t.bubbles) return !0;
	if (t.defaultPrevented) return !1;
	for (let n = t.target; n != e.dom; n = n.parentNode) if (!n || n.nodeType == 11 || n.pmViewDesc && n.pmViewDesc.stopEvent(t)) return !1;
	return !0;
}
function ko(e, t) {
	!Do(e, t) && Y[t.type] && (e.editable || !(t.type in X)) && Y[t.type](e, t);
}
X.keydown = (e, t) => {
	let n = t;
	if (e.input.shiftKey = n.keyCode == 16 || n.shiftKey, !Ko(e) && (e.input.lastKeyCode = n.keyCode, e.input.lastKeyCodeTime = Date.now(), !(hi && G && n.keyCode == 13))) {
		if (n.keyCode != 229 && e.domObserver.forceFlush(), pi && n.keyCode == 13 && !n.ctrlKey && !n.altKey && !n.metaKey) {
			let t = Date.now();
			e.input.lastIOSEnter = t, e.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
				e.input.lastIOSEnter == t && (e.someProp("handleKeyDown", (t) => t(e, ti(13, "Enter"))), e.input.lastIOSEnter = 0);
			}, 200);
		} else e.someProp("handleKeyDown", (t) => t(e, n)) || ro(e, n) ? n.preventDefault() : wo(e, "key");
	}
}, X.keyup = (e, t) => {
	t.keyCode == 16 && (e.input.shiftKey = !1);
}, X.keypress = (e, t) => {
	let n = t;
	if (Ko(e) || !n.charCode || n.ctrlKey && !n.altKey || q && n.metaKey) return;
	if (e.someProp("handleKeyPress", (t) => t(e, n))) {
		n.preventDefault();
		return;
	}
	let r = e.state.selection;
	if (!(r instanceof z) || !r.$from.sameParent(r.$to)) {
		let t = String.fromCharCode(n.charCode), i = () => e.state.tr.insertText(t).scrollIntoView();
		!/[\r\n]/.test(t) && !e.someProp("handleTextInput", (n) => n(e, r.$from.pos, r.$to.pos, t, i)) && e.dispatch(i()), n.preventDefault();
	}
};
function Ao(e) {
	return {
		left: e.clientX,
		top: e.clientY
	};
}
function jo(e, t) {
	let n = t.x - e.clientX, r = t.y - e.clientY;
	return n * n + r * r < 100;
}
function Mo(e, t, n, r, i) {
	if (r == -1) return !1;
	let a = e.state.doc.resolve(r);
	for (let r = a.depth + 1; r > 0; r--) if (e.someProp(t, (t) => r > a.depth ? t(e, n, a.nodeAfter, a.before(r), i, !0) : t(e, n, a.node(r), a.before(r), i, !1))) return !0;
	return !1;
}
function No(e, t, n) {
	if (e.focused || e.focus(), e.state.selection.eq(t)) return;
	let r = e.state.tr.setSelection(t);
	n == "pointer" && r.setMeta("pointer", !0), e.dispatch(r);
}
function Po(e, t) {
	if (t == -1) return !1;
	let n = e.state.doc.resolve(t), r = n.nodeAfter;
	return r && r.isAtom && B.isSelectable(r) ? (No(e, new B(n), "pointer"), !0) : !1;
}
function Fo(e, t) {
	if (t == -1) return !1;
	let n = e.state.selection, r, i;
	n instanceof B && (r = n.node);
	let a = e.state.doc.resolve(t);
	for (let e = a.depth + 1; e > 0; e--) {
		let t = e > a.depth ? a.nodeAfter : a.node(e);
		if (B.isSelectable(t)) {
			i = r && n.$from.depth > 0 && e >= n.$from.depth && a.before(n.$from.depth + 1) == n.$from.pos ? a.before(n.$from.depth) : a.before(e);
			break;
		}
	}
	return i != null && (No(e, B.create(e.state.doc, i), "pointer"), !0);
}
function Io(e, t, n, r, i) {
	return Mo(e, "handleClickOn", t, n, r) || e.someProp("handleClick", (n) => n(e, t, r)) || (i ? Fo(e, n) : Po(e, n));
}
function Lo(e, t, n, r) {
	return Mo(e, "handleDoubleClickOn", t, n, r) || e.someProp("handleDoubleClick", (n) => n(e, t, r));
}
function Ro(e, t, n, r) {
	return Mo(e, "handleTripleClickOn", t, n, r) || e.someProp("handleTripleClick", (n) => n(e, t, r)) || zo(e, n, r);
}
function zo(e, t, n) {
	if (n.button != 0) return !1;
	let r = Bo(e, t, !0), i = e.state.doc;
	return r ? (No(e, r, "pointer"), r instanceof z && i.eq(e.state.doc) && (e.input.mouseDown = new Go(e, r)), !0) : !1;
}
function Bo(e, t, n) {
	let r = e.state.doc;
	if (t == -1) return r.inlineContent ? z.create(r, 0, r.content.size) : null;
	let i = r.resolve(t);
	for (let e = i.depth + 1; e > 0; e--) {
		let t = e > i.depth ? i.nodeAfter : i.node(e), a = i.before(e);
		if (t.inlineContent) return z.create(r, a + 1, a + 1 + t.content.size);
		if (n && B.isSelectable(t)) return B.create(r, a);
	}
	return null;
}
function Vo(e) {
	return Qo(e);
}
var Ho = q ? "metaKey" : "ctrlKey";
Y.mousedown = (e, t) => {
	let n = t;
	e.input.shiftKey = n.shiftKey;
	let r = Vo(e), i = Date.now(), a = "singleClick";
	i - e.input.lastClick.time < 500 && jo(n, e.input.lastClick) && !n[Ho] && e.input.lastClick.button == n.button && (e.input.lastClick.type == "singleClick" ? a = "doubleClick" : e.input.lastClick.type == "doubleClick" && (a = "tripleClick")), e.input.lastClick = {
		time: i,
		x: n.clientX,
		y: n.clientY,
		type: a,
		button: n.button
	}, e.input.mouseDown && e.input.mouseDown.done();
	let o = e.posAtCoords(Ao(n));
	o && (a == "singleClick" ? e.input.mouseDown = new Wo(e, o, n, !!r) : (a == "doubleClick" ? Lo : Ro)(e, o.pos, o.inside, n) ? n.preventDefault() : wo(e, "pointer"));
};
var Uo = class {
	constructor(e) {
		this.view = e, this.mightDrag = null, e.root.addEventListener("mouseup", this.up = this.up.bind(this)), e.root.addEventListener("mousemove", this.move = this.move.bind(this));
	}
	up(e) {
		this.done();
	}
	move(e) {
		e.buttons == 0 && this.done();
	}
	done() {
		this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.view.input.mouseDown == this && (this.view.input.mouseDown = null);
	}
	delaySelUpdate() {
		return !1;
	}
}, Wo = class extends Uo {
	constructor(e, t, n, r) {
		super(e), this.pos = t, this.event = n, this.flushed = r, this.delayedSelectionSync = !1, this.startDoc = e.state.doc, this.selectNode = !!n[Ho], this.allowDefault = n.shiftKey;
		let i, a;
		if (t.inside > -1) i = e.state.doc.nodeAt(t.inside), a = t.inside;
		else {
			let n = e.state.doc.resolve(t.pos);
			i = n.parent, a = n.depth ? n.before() : 0;
		}
		let o = r ? null : n.target, s = o ? e.docView.nearestDesc(o, !0) : null;
		this.target = s && s.nodeDOM.nodeType == 1 ? s.nodeDOM : null;
		let { selection: c } = e.state;
		n.button == 0 && (i.type.spec.draggable && i.type.spec.selectable !== !1 || c instanceof B && c.from <= a && c.to > a) && (this.mightDrag = {
			node: i,
			pos: a,
			addAttr: !(!this.target || this.target.draggable),
			setUneditable: !!(this.target && W && !this.target.hasAttribute("contentEditable"))
		}), this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable) && (this.view.domObserver.stop(), this.mightDrag.addAttr && (this.target.draggable = !0), this.mightDrag.setUneditable && setTimeout(() => {
			this.view.input.mouseDown == this && this.target.setAttribute("contentEditable", "false");
		}, 20), this.view.domObserver.start()), wo(e, "pointer");
	}
	done() {
		super.done(), this.mightDrag && this.target && (this.view.domObserver.stop(), this.mightDrag.addAttr && this.target.removeAttribute("draggable"), this.mightDrag.setUneditable && this.target.removeAttribute("contentEditable"), this.view.domObserver.start()), this.delayedSelectionSync && setTimeout(() => {
			this.view.isDestroyed || Ea(this.view);
		});
	}
	up(e) {
		if (this.done(), !this.view.dom.contains(e.target)) return;
		let t = this.pos;
		this.view.state.doc != this.startDoc && (t = this.view.posAtCoords(Ao(e))), this.updateAllowDefault(e), this.allowDefault || !t ? wo(this.view, "pointer") : Io(this.view, t.pos, t.inside, e, this.selectNode) ? e.preventDefault() : e.button == 0 && (this.flushed || K && this.mightDrag && !this.mightDrag.node.isAtom || G && !this.view.state.selection.visible && Math.min(Math.abs(t.pos - this.view.state.selection.from), Math.abs(t.pos - this.view.state.selection.to)) <= 2) ? (No(this.view, R.near(this.view.state.doc.resolve(t.pos)), "pointer"), e.preventDefault()) : wo(this.view, "pointer");
	}
	move(e) {
		this.updateAllowDefault(e), wo(this.view, "pointer"), super.move(e);
	}
	updateAllowDefault(e) {
		!this.allowDefault && (Math.abs(this.event.x - e.clientX) > 4 || Math.abs(this.event.y - e.clientY) > 4) && (this.allowDefault = !0);
	}
	delaySelUpdate() {
		return this.allowDefault ? (this.delayedSelectionSync = !0, !0) : !1;
	}
}, Go = class extends Uo {
	constructor(e, t) {
		super(e), this.startSelection = t, this.startDoc = e.state.doc;
	}
	move(e) {
		if (e.buttons == 0 || this.view.isDestroyed || !this.view.state.doc.eq(this.startDoc)) {
			this.done();
			return;
		}
		e.preventDefault(), wo(this.view, "pointer");
		let t = this.view.posAtCoords(Ao(e)), n = t && Bo(this.view, t.inside, !1);
		if (!n) return;
		let { doc: r } = this.view.state, i = this.startSelection, [a, o] = n.from < i.from ? [i.to, n.from] : [i.from, n.to];
		No(this.view, z.create(r, a, o), "pointer");
	}
};
Y.touchstart = (e) => {
	e.input.lastTouch = Date.now(), Vo(e), wo(e, "pointer");
}, Y.touchmove = (e) => {
	e.input.lastTouch = Date.now(), wo(e, "pointer");
}, Y.contextmenu = (e) => Vo(e);
function Ko(e, t) {
	return e.composing ? !0 : K && Math.abs(Date.now() - e.input.compositionEndedAt) < 500 ? (e.input.compositionEndedAt = -2e8, !0) : !1;
}
var qo = hi ? 5e3 : -1;
X.compositionstart = X.compositionupdate = (e) => {
	if (!e.composing) {
		e.domObserver.flush();
		let { state: t } = e, n = t.selection.$to;
		if (t.selection instanceof z && (t.storedMarks || !n.textOffset && n.parentOffset && n.nodeBefore.marks.some((e) => e.type.spec.inclusive === !1) || G && mi && Jo(e))) e.markCursor = e.state.storedMarks || n.marks(), Qo(e, !0), e.markCursor = null;
		else if (Qo(e, !t.selection.empty), W && t.selection.empty && n.parentOffset && !n.textOffset && n.nodeBefore.marks.length) {
			let t = e.domSelectionRange();
			for (let n = t.focusNode, r = t.focusOffset; n && n.nodeType == 1 && r != 0;) {
				let t = r < 0 ? n.lastChild : n.childNodes[r - 1];
				if (!t) break;
				if (t.nodeType == 3) {
					let n = e.domSelection();
					n && n.collapse(t, t.nodeValue.length);
					break;
				}
				n = t, r = -1;
			}
		}
		e.input.composing = !0;
	}
	Yo(e, qo);
};
function Jo(e) {
	let { focusNode: t, focusOffset: n } = e.domSelectionRange();
	if (!t || t.nodeType != 1 || n >= t.childNodes.length) return !1;
	let r = t.childNodes[n];
	return r.nodeType == 1 && r.contentEditable == "false";
}
X.compositionend = (e, t) => {
	e.composing && (e.input.composing = !1, e.input.compositionEndedAt = Date.now(), e.input.compositionPendingChanges = e.domObserver.pendingRecords().length ? e.input.compositionID : 0, e.input.compositionNode = null, e.input.badSafariComposition ? e.domObserver.forceFlush() : e.input.compositionPendingChanges && Promise.resolve().then(() => e.domObserver.flush()), e.input.compositionID++, Yo(e, 20));
};
function Yo(e, t) {
	clearTimeout(e.input.composingTimeout), t > -1 && (e.input.composingTimeout = setTimeout(() => Qo(e), t));
}
function Xo(e) {
	for (e.composing && (e.input.composing = !1, e.input.compositionEndedAt = Date.now()); e.input.compositionNodes.length > 0;) e.input.compositionNodes.pop().markParentsDirty();
}
function Zo(e) {
	let t = e.domSelectionRange();
	if (!t.focusNode) return null;
	let n = Xr(t.focusNode, t.focusOffset), r = Zr(t.focusNode, t.focusOffset);
	if (n && r && n != r) {
		let t = r.pmViewDesc, i = e.domObserver.lastChangedTextNode;
		if (n == i || r == i) return i;
		if (!t || !t.isText(r.nodeValue)) return r;
		if (e.input.compositionNode == r) {
			let e = n.pmViewDesc;
			if (e && e.isText(n.nodeValue)) return r;
		}
	}
	return n || r;
}
function Qo(e, t = !1) {
	if (!(hi && e.domObserver.flushingSoon >= 0)) {
		if (e.domObserver.forceFlush(), Xo(e), t || e.docView && e.docView.dirty) {
			let n = wa(e), r = e.state.selection;
			return n && !n.eq(r) ? e.dispatch(e.state.tr.setSelection(n)) : (e.markCursor || t) && !r.$from.node(r.$from.sharedDepth(r.to)).inlineContent ? e.dispatch(e.state.tr.deleteSelection()) : e.updateState(e.state), !0;
		}
		return !1;
	}
}
function $o(e, t) {
	if (!e.dom.parentNode) return;
	let n = e.dom.parentNode.appendChild(document.createElement("div"));
	n.appendChild(t), n.style.cssText = "position: fixed; left: -10000px; top: 10px";
	let r = getSelection(), i = document.createRange();
	i.selectNodeContents(t), e.dom.blur(), r.removeAllRanges(), r.addRange(i), setTimeout(() => {
		n.parentNode && n.parentNode.removeChild(n), e.focus();
	}, 50);
}
var es = U && ui < 15 || pi && _i < 604;
Y.copy = X.cut = (e, t) => {
	let n = t, r = e.state.selection, i = n.type == "cut";
	if (r.empty) return;
	let a = es ? null : n.clipboardData, { dom: o, text: s } = io(e, r.content());
	a ? (n.preventDefault(), a.clearData(), a.setData("text/html", o.innerHTML), a.setData("text/plain", s)) : $o(e, o), i && e.dispatch(e.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function ts(e) {
	return e.openStart == 0 && e.openEnd == 0 && e.content.childCount == 1 ? e.content.firstChild : null;
}
function ns(e, t) {
	if (!e.dom.parentNode) return;
	let n = e.input.shiftKey || e.state.selection.$from.parent.type.spec.code, r = e.dom.parentNode.appendChild(document.createElement(n ? "textarea" : "div"));
	n || (r.contentEditable = "true"), r.style.cssText = "position: fixed; left: -10000px; top: 10px", r.focus();
	let i = e.input.shiftKey && e.input.lastKeyCode != 45;
	setTimeout(() => {
		e.focus(), r.parentNode && r.parentNode.removeChild(r), n ? rs(e, r.value, null, i, t) : rs(e, r.textContent, r.innerHTML, i, t);
	}, 50);
}
function rs(e, t, n, r, i) {
	let a = ao(e, t, n, r, e.state.selection.$from);
	if (e.someProp("handlePaste", (t) => t(e, i, a || N.empty))) return !0;
	if (!a) return !1;
	let o = ts(a), s = o ? e.state.tr.replaceSelectionWith(o, r) : e.state.tr.replaceSelection(a);
	return e.dispatch(s.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function is(e) {
	let t = e.getData("text/plain") || e.getData("Text");
	if (t) return t;
	let n = e.getData("text/uri-list");
	return n ? n.replace(/\r?\n/g, " ") : "";
}
X.paste = (e, t) => {
	let n = t;
	if (e.composing && !hi) return;
	let r = es ? null : n.clipboardData, i = e.input.shiftKey && e.input.lastKeyCode != 45;
	r && rs(e, is(r), r.getData("text/html"), i, n) ? n.preventDefault() : ns(e, n);
};
var as = class {
	constructor(e, t, n) {
		this.slice = e, this.move = t, this.node = n;
	}
}, ss = q ? "altKey" : "ctrlKey";
function cs(e, t) {
	let n;
	return e.someProp("dragCopies", (e) => {
		n ||= e(t);
	}), n == null ? !t[ss] : !n;
}
Y.dragstart = (e, t) => {
	let n = t, r = e.input.mouseDown;
	if (r && r.done(), !n.dataTransfer) return;
	let i = e.state.selection, a = i.empty ? null : e.posAtCoords(Ao(n)), o;
	if (!(a && a.pos >= i.from && a.pos <= (i instanceof B ? i.to - 1 : i.to))) {
		if (r && r.mightDrag) o = B.create(e.state.doc, r.mightDrag.pos);
		else if (n.target && n.target.nodeType == 1) {
			let t = e.docView.nearestDesc(n.target, !0);
			t && t.node.type.spec.draggable && t != e.docView && (o = B.create(e.state.doc, t.posBefore));
		}
	}
	let { dom: s, text: c, slice: l } = io(e, (o || e.state.selection).content());
	(!n.dataTransfer.files.length || !G || fi > 120) && n.dataTransfer.clearData(), n.dataTransfer.setData(es ? "Text" : "text/html", s.innerHTML), n.dataTransfer.effectAllowed = "copyMove", es || n.dataTransfer.setData("text/plain", c), e.dragging = new as(l, cs(e, n), o);
}, Y.dragend = (e) => {
	let t = e.dragging;
	window.setTimeout(() => {
		e.dragging == t && (e.dragging = null);
	}, 50);
}, X.dragover = X.dragenter = (e, t) => t.preventDefault(), X.drop = (e, t) => {
	try {
		ls(e, t, e.dragging);
	} finally {
		e.dragging = null;
	}
};
function ls(e, t, n) {
	if (!t.dataTransfer) return;
	let r = e.posAtCoords(Ao(t));
	if (!r) return;
	let i = e.state.doc.resolve(r.pos), a = n && n.slice;
	a ? e.someProp("transformPasted", (t) => {
		a = t(a, e, !1);
	}) : a = ao(e, is(t.dataTransfer), es ? null : t.dataTransfer.getData("text/html"), !1, i);
	let o = !!(n && cs(e, t));
	if (e.someProp("handleDrop", (n) => n(e, t, a || N.empty, o))) {
		t.preventDefault();
		return;
	}
	if (!a) return;
	t.preventDefault();
	let s = a ? hn(e.state.doc, i.pos, a) : i.pos;
	s ??= i.pos;
	let c = e.state.tr;
	if (o) {
		let { node: e } = n;
		e ? e.replace(c) : c.deleteSelection();
	}
	let l = c.mapping.map(s), u = a.openStart == 0 && a.openEnd == 0 && a.content.childCount == 1, d = c.doc;
	if (u ? c.replaceRangeWith(l, l, a.content.firstChild) : c.replaceRange(l, l, a), c.doc.eq(d)) return;
	let f = c.doc.resolve(l);
	if (u && B.isSelectable(a.content.firstChild) && f.nodeAfter && f.nodeAfter.sameMarkup(a.content.firstChild)) c.setSelection(new B(f));
	else {
		let t = c.mapping.map(s);
		c.mapping.maps[c.mapping.maps.length - 1].forEach((e, n, r, i) => t = i), c.setSelection(Fa(e, f, c.doc.resolve(t)));
	}
	e.focus(), e.dispatch(c.setMeta("uiEvent", "drop"));
}
Y.focus = (e) => {
	e.input.lastFocus = Date.now(), e.focused || (e.domObserver.stop(), e.dom.classList.add("ProseMirror-focused"), e.domObserver.start(), e.focused = !0, setTimeout(() => {
		e.docView && e.hasFocus() && !e.domObserver.currentSelection.eq(e.domSelectionRange()) && Ea(e);
	}, 20));
}, Y.blur = (e, t) => {
	let n = t;
	e.focused &&= (e.domObserver.stop(), e.dom.classList.remove("ProseMirror-focused"), e.domObserver.start(), n.relatedTarget && e.dom.contains(n.relatedTarget) && e.domObserver.currentSelection.clear(), !1);
}, Y.beforeinput = (e, t) => {
	if (hi && t.inputType == "deleteContentBackward") {
		e.domObserver.flushSoon();
		let { domChangeCount: t } = e.input;
		setTimeout(() => {
			if (e.input.domChangeCount != t || (e.dom.blur(), e.focus(), e.someProp("handleKeyDown", (t) => t(e, ti(8, "Backspace"))))) return;
			let { $cursor: n } = e.state.selection;
			n && n.pos > 0 && e.dispatch(e.state.tr.delete(n.pos - 1, n.pos).scrollIntoView());
		}, 50);
	}
};
for (let e in X) Y[e] = X[e];
function us(e, t) {
	if (e == t) return !0;
	for (let n in e) if (e[n] !== t[n]) return !1;
	for (let n in t) if (!(n in e)) return !1;
	return !0;
}
var ds = class e {
	constructor(e, t) {
		this.toDOM = e, this.spec = t || gs, this.side = this.spec.side || 0;
	}
	map(e, t, n, r) {
		let { pos: i, deleted: a } = e.mapResult(t.from + r, this.side < 0 ? -1 : 1);
		return a ? null : new ms(i - n, i - n, this);
	}
	valid() {
		return !0;
	}
	eq(t) {
		return this == t || t instanceof e && (this.spec.key && this.spec.key == t.spec.key || this.toDOM == t.toDOM && us(this.spec, t.spec));
	}
	destroy(e) {
		this.spec.destroy && this.spec.destroy(e);
	}
}, fs = class e {
	constructor(e, t) {
		this.attrs = e, this.spec = t || gs;
	}
	map(e, t, n, r) {
		let i = e.map(t.from + r, this.spec.inclusiveStart ? -1 : 1) - n, a = e.map(t.to + r, this.spec.inclusiveEnd ? 1 : -1) - n;
		return i >= a ? null : new ms(i, a, this);
	}
	valid(e, t) {
		return t.from < t.to;
	}
	eq(t) {
		return this == t || t instanceof e && us(this.attrs, t.attrs) && us(this.spec, t.spec);
	}
	static is(t) {
		return t.type instanceof e;
	}
	destroy() {}
}, ps = class e {
	constructor(e, t) {
		this.attrs = e, this.spec = t || gs;
	}
	map(e, t, n, r) {
		let i = e.mapResult(t.from + r, 1);
		if (i.deleted) return null;
		let a = e.mapResult(t.to + r, -1);
		return a.deleted || a.pos <= i.pos ? null : new ms(i.pos - n, a.pos - n, this);
	}
	valid(e, t) {
		let { index: n, offset: r } = e.content.findIndex(t.from), i;
		return r == t.from && !(i = e.child(n)).isText && r + i.nodeSize == t.to;
	}
	eq(t) {
		return this == t || t instanceof e && us(this.attrs, t.attrs) && us(this.spec, t.spec);
	}
	destroy() {}
}, ms = class e {
	constructor(e, t, n) {
		this.from = e, this.to = t, this.type = n;
	}
	copy(t, n) {
		return new e(t, n, this.type);
	}
	eq(e, t = 0) {
		return this.type.eq(e.type) && this.from + t == e.from && this.to + t == e.to;
	}
	map(e, t, n) {
		return this.type.map(e, this, t, n);
	}
	static widget(t, n, r) {
		return new e(t, t, new ds(n, r));
	}
	static inline(t, n, r, i) {
		return new e(t, n, new fs(r, i));
	}
	static node(t, n, r, i) {
		return new e(t, n, new ps(r, i));
	}
	get spec() {
		return this.type.spec;
	}
	get inline() {
		return this.type instanceof fs;
	}
	get widget() {
		return this.type instanceof ds;
	}
}, hs = [], gs = {}, _s = class e {
	constructor(e, t) {
		this.local = e.length ? e : hs, this.children = t.length ? t : hs;
	}
	static create(e, t) {
		return t.length ? ws(t, e, 0, gs) : Z;
	}
	find(e, t, n) {
		let r = [];
		return this.findInner(e ?? 0, t ?? 1e9, r, 0, n), r;
	}
	findInner(e, t, n, r, i) {
		for (let a = 0; a < this.local.length; a++) {
			let o = this.local[a];
			o.from <= t && o.to >= e && (!i || i(o.spec)) && n.push(o.copy(o.from + r, o.to + r));
		}
		for (let a = 0; a < this.children.length; a += 3) if (this.children[a] < t && this.children[a + 1] > e) {
			let o = this.children[a] + 1;
			this.children[a + 2].findInner(e - o, t - o, n, r + o, i);
		}
	}
	map(e, t, n) {
		return this == Z || e.maps.length == 0 ? this : this.mapInner(e, t, 0, 0, n || gs);
	}
	mapInner(t, n, r, i, a) {
		let o;
		for (let e = 0; e < this.local.length; e++) {
			let s = this.local[e].map(t, r, i);
			s && s.type.valid(n, s) ? (o ||= []).push(s) : a.onRemove && a.onRemove(this.local[e].spec);
		}
		return this.children.length ? ys(this.children, o || [], t, n, r, i, a) : o ? new e(o.sort(Ts), hs) : Z;
	}
	add(t, n) {
		return n.length ? this == Z ? e.create(t, n) : this.addInner(t, n, 0) : this;
	}
	addInner(t, n, r) {
		let i, a = 0;
		t.forEach((e, t) => {
			let o = t + r, s;
			if (s = Ss(n, e, o)) {
				for (i ||= this.children.slice(); a < i.length && i[a] < t;) a += 3;
				i[a] == t ? i[a + 2] = i[a + 2].addInner(e, s, o + 1) : i.splice(a, 0, t, t + e.nodeSize, ws(s, e, o + 1, gs)), a += 3;
			}
		});
		let o = bs(a ? Cs(n) : n, -r);
		for (let e = 0; e < o.length; e++) o[e].type.valid(t, o[e]) || o.splice(e--, 1);
		return new e(o.length ? this.local.concat(o).sort(Ts) : this.local, i || this.children);
	}
	remove(e) {
		return e.length == 0 || this == Z ? this : this.removeInner(e, 0);
	}
	removeInner(t, n) {
		let r = this.children, i = this.local;
		for (let e = 0; e < r.length; e += 3) {
			let i, a = r[e] + n, o = r[e + 1] + n;
			for (let e = 0, n; e < t.length; e++) (n = t[e]) && n.from > a && n.to < o && (t[e] = null, (i ||= []).push(n));
			if (!i) continue;
			r == this.children && (r = this.children.slice());
			let s = r[e + 2].removeInner(i, a + 1);
			s == Z ? (r.splice(e, 3), e -= 3) : r[e + 2] = s;
		}
		if (i.length) {
			for (let e = 0, r; e < t.length; e++) if (r = t[e]) for (let e = 0; e < i.length; e++) i[e].eq(r, n) && (i == this.local && (i = this.local.slice()), i.splice(e--, 1));
		}
		return r == this.children && i == this.local ? this : i.length || r.length ? new e(i, r) : Z;
	}
	forChild(t, n) {
		if (this == Z) return this;
		if (n.isLeaf) return e.empty;
		let r, i;
		for (let e = 0; e < this.children.length; e += 3) if (this.children[e] >= t) {
			this.children[e] == t && (r = this.children[e + 2]);
			break;
		}
		let a = t + 1, o = a + n.content.size;
		for (let e = 0; e < this.local.length; e++) {
			let t = this.local[e];
			if (t.from < o && t.to > a && t.type instanceof fs) {
				let e = Math.max(a, t.from) - a, n = Math.min(o, t.to) - a;
				e < n && (i ||= []).push(t.copy(e, n));
			}
		}
		if (i) {
			let t = new e(i.sort(Ts), hs);
			return r ? new vs([t, r]) : t;
		}
		return r || Z;
	}
	eq(t) {
		if (this == t) return !0;
		if (!(t instanceof e) || this.local.length != t.local.length || this.children.length != t.children.length) return !1;
		for (let e = 0; e < this.local.length; e++) if (!this.local[e].eq(t.local[e])) return !1;
		for (let e = 0; e < this.children.length; e += 3) if (this.children[e] != t.children[e] || this.children[e + 1] != t.children[e + 1] || !this.children[e + 2].eq(t.children[e + 2])) return !1;
		return !0;
	}
	locals(e) {
		return Es(this.localsInner(e));
	}
	localsInner(e) {
		if (this == Z) return hs;
		if (e.inlineContent || !this.local.some(fs.is)) return this.local;
		let t = [];
		for (let e = 0; e < this.local.length; e++) this.local[e].type instanceof fs || t.push(this.local[e]);
		return t;
	}
	forEachSet(e) {
		e(this);
	}
};
_s.empty = new _s([], []), _s.removeOverlap = Es;
var Z = _s.empty, vs = class e {
	constructor(e) {
		this.members = e;
	}
	map(t, n) {
		let r = this.members.map((e) => e.map(t, n, gs));
		return e.from(r);
	}
	forChild(t, n) {
		if (n.isLeaf) return _s.empty;
		let r = [];
		for (let i = 0; i < this.members.length; i++) {
			let a = this.members[i].forChild(t, n);
			a != Z && (a instanceof e ? r = r.concat(a.members) : r.push(a));
		}
		return e.from(r);
	}
	eq(t) {
		if (!(t instanceof e) || t.members.length != this.members.length) return !1;
		for (let e = 0; e < this.members.length; e++) if (!this.members[e].eq(t.members[e])) return !1;
		return !0;
	}
	locals(e) {
		let t, n = !0;
		for (let r = 0; r < this.members.length; r++) {
			let i = this.members[r].localsInner(e);
			if (i.length) {
				if (!t) t = i;
				else {
					n &&= (t = t.slice(), !1);
					for (let e = 0; e < i.length; e++) t.push(i[e]);
				}
			}
		}
		return t ? Es(n ? t : t.sort(Ts)) : hs;
	}
	static from(t) {
		switch (t.length) {
			case 0: return Z;
			case 1: return t[0];
			default: return new e(t.every((e) => e instanceof _s) ? t : t.reduce((e, t) => e.concat(t instanceof _s ? t : t.members), []));
		}
	}
	forEachSet(e) {
		for (let t = 0; t < this.members.length; t++) this.members[t].forEachSet(e);
	}
};
function ys(e, t, n, r, i, a, o) {
	let s = e.slice();
	for (let e = 0, t = a; e < n.maps.length; e++) {
		let r = 0;
		n.maps[e].forEach((e, n, i, a) => {
			let o = a - i - (n - e);
			for (let i = 0; i < s.length; i += 3) {
				let a = s[i + 1];
				if (a < 0 || e > a + t - r) continue;
				let c = s[i] + t - r;
				n >= c ? s[i + 1] = e <= c ? -2 : -1 : e >= t && o && (s[i] += o, s[i + 1] += o);
			}
			r += o;
		}), t = n.maps[e].map(t, -1);
	}
	let c = !1;
	for (let t = 0; t < s.length; t += 3) if (s[t + 1] < 0) {
		if (s[t + 1] == -2) {
			c = !0, s[t + 1] = -1;
			continue;
		}
		let l = n.map(e[t] + a), u = l - i;
		if (u < 0 || u >= r.content.size) {
			c = !0;
			continue;
		}
		let d = n.map(e[t + 1] + a, -1) - i, { index: f, offset: p } = r.content.findIndex(u), m = r.maybeChild(f);
		if (m && p == u && p + m.nodeSize == d) {
			let r = s[t + 2].mapInner(n, m, l + 1, e[t] + a + 1, o);
			r == Z ? (s[t + 1] = -2, c = !0) : (s[t] = u, s[t + 1] = d, s[t + 2] = r);
		} else c = !0;
	}
	if (c) {
		let c = ws(xs(s, e, t, n, i, a, o), r, 0, o);
		t = c.local;
		for (let e = 0; e < s.length; e += 3) s[e + 1] < 0 && (s.splice(e, 3), e -= 3);
		for (let e = 0, t = 0; e < c.children.length; e += 3) {
			let n = c.children[e];
			for (; t < s.length && s[t] < n;) t += 3;
			s.splice(t, 0, c.children[e], c.children[e + 1], c.children[e + 2]);
		}
	}
	return new _s(t.sort(Ts), s);
}
function bs(e, t) {
	if (!t || !e.length) return e;
	let n = [];
	for (let r = 0; r < e.length; r++) {
		let i = e[r];
		n.push(new ms(i.from + t, i.to + t, i.type));
	}
	return n;
}
function xs(e, t, n, r, i, a, o) {
	function s(e, t) {
		for (let a = 0; a < e.local.length; a++) {
			let s = e.local[a].map(r, i, t);
			s ? n.push(s) : o.onRemove && o.onRemove(e.local[a].spec);
		}
		for (let n = 0; n < e.children.length; n += 3) s(e.children[n + 2], e.children[n] + t + 1);
	}
	for (let n = 0; n < e.length; n += 3) e[n + 1] == -1 && s(e[n + 2], t[n] + a + 1);
	return n;
}
function Ss(e, t, n) {
	if (t.isLeaf) return null;
	let r = n + t.nodeSize, i = null;
	for (let t = 0, a; t < e.length; t++) (a = e[t]) && a.from > n && a.to < r && ((i ||= []).push(a), e[t] = null);
	return i;
}
function Cs(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) e[n] != null && t.push(e[n]);
	return t;
}
function ws(e, t, n, r) {
	let i = [], a = !1;
	t.forEach((t, o) => {
		let s = Ss(e, t, o + n);
		if (s) {
			a = !0;
			let e = ws(s, t, n + o + 1, r);
			e != Z && i.push(o, o + t.nodeSize, e);
		}
	});
	let o = bs(a ? Cs(e) : e, -n).sort(Ts);
	for (let e = 0; e < o.length; e++) o[e].type.valid(t, o[e]) || (r.onRemove && r.onRemove(o[e].spec), o.splice(e--, 1));
	return o.length || i.length ? new _s(o, i) : Z;
}
function Ts(e, t) {
	return e.from - t.from || e.to - t.to;
}
function Es(e) {
	let t = e;
	for (let n = 0; n < t.length - 1; n++) {
		let r = t[n];
		if (r.from != r.to) for (let i = n + 1; i < t.length; i++) {
			let a = t[i];
			if (a.from == r.from) {
				a.to != r.to && (t == e && (t = e.slice()), t[i] = a.copy(a.from, r.to), Ds(t, i + 1, a.copy(r.to, a.to)));
				continue;
			}
			a.from < r.to && (t == e && (t = e.slice()), t[n] = r.copy(r.from, a.from), Ds(t, i, r.copy(a.from, r.to)));
			break;
		}
	}
	return t;
}
function Ds(e, t, n) {
	for (; t < e.length && Ts(n, e[t]) > 0;) t++;
	e.splice(t, 0, n);
}
function Os(e) {
	let t = [];
	return e.someProp("decorations", (n) => {
		let r = n(e.state);
		r && r != Z && t.push(r);
	}), e.cursorWrapper && t.push(_s.create(e.state.doc, [e.cursorWrapper.deco])), vs.from(t);
}
var ks = {
	childList: !0,
	characterData: !0,
	characterDataOldValue: !0,
	attributes: !0,
	attributeOldValue: !0,
	subtree: !0
}, As = U && ui <= 11, js = class {
	constructor() {
		this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
	}
	set(e) {
		this.anchorNode = e.anchorNode, this.anchorOffset = e.anchorOffset, this.focusNode = e.focusNode, this.focusOffset = e.focusOffset;
	}
	clear() {
		this.anchorNode = this.focusNode = null;
	}
	eq(e) {
		return e.anchorNode == this.anchorNode && e.anchorOffset == this.anchorOffset && e.focusNode == this.focusNode && e.focusOffset == this.focusOffset;
	}
}, Ms = class {
	constructor(e, t) {
		this.view = e, this.handleDOMChange = t, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new js(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((t) => {
			for (let e = 0; e < t.length; e++) this.queue.push(t[e]);
			U && ui <= 11 && t.some((e) => e.type == "childList" && e.removedNodes.length || e.type == "characterData" && e.oldValue.length > e.target.nodeValue.length) ? this.flushSoon() : K && e.composing && t.some((e) => e.type == "childList" && e.target.nodeName == "TR") ? (e.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
		}), As && (this.onCharData = (e) => {
			this.queue.push({
				target: e.target,
				type: "characterData",
				oldValue: e.prevValue
			}), this.flushSoon();
		}), this.onSelectionChange = this.onSelectionChange.bind(this);
	}
	flushSoon() {
		this.flushingSoon < 0 && (this.flushingSoon = window.setTimeout(() => {
			this.flushingSoon = -1, this.flush();
		}, 20));
	}
	forceFlush() {
		this.flushingSoon > -1 && (window.clearTimeout(this.flushingSoon), this.flushingSoon = -1, this.flush());
	}
	start() {
		this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, ks)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
	}
	stop() {
		if (this.observer) {
			let e = this.observer.takeRecords();
			if (e.length) {
				for (let t = 0; t < e.length; t++) this.queue.push(e[t]);
				window.setTimeout(() => this.flush(), 20);
			}
			this.observer.disconnect();
		}
		this.onCharData && this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData), this.disconnectSelection();
	}
	connectSelection() {
		this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
	}
	disconnectSelection() {
		this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
	}
	suppressSelectionUpdates() {
		this.suppressingSelectionUpdates = !0, setTimeout(() => this.suppressingSelectionUpdates = !1, 50);
	}
	onSelectionChange() {
		if (Ia(this.view)) {
			if (this.suppressingSelectionUpdates) return Ea(this.view);
			if (U && ui <= 11 && !this.view.state.selection.empty) {
				let e = this.view.domSelectionRange();
				if (e.focusNode && qr(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset)) return this.flushSoon();
			}
			this.flush();
		}
	}
	setCurSelection() {
		this.currentSelection.set(this.view.domSelectionRange());
	}
	ignoreSelectionChange(e) {
		if (!e.focusNode) return !0;
		let t = /* @__PURE__ */ new Set(), n;
		for (let n = e.focusNode; n; n = Ur(n)) t.add(n);
		for (let r = e.anchorNode; r; r = Ur(r)) if (t.has(r)) {
			n = r;
			break;
		}
		let r = n && this.view.docView.nearestDesc(n);
		if (r && r.ignoreMutation({
			type: "selection",
			target: n.nodeType == 3 ? n.parentNode : n
		})) return this.setCurSelection(), !0;
	}
	pendingRecords() {
		if (this.observer) for (let e of this.observer.takeRecords()) this.queue.push(e);
		return this.queue;
	}
	flush() {
		let { view: e } = this;
		if (!e.docView || this.flushingSoon > -1) return;
		let t = this.pendingRecords();
		t.length && (this.queue = []);
		let n = e.domSelectionRange(), r = !this.suppressingSelectionUpdates && !this.currentSelection.eq(n) && Ia(e) && !this.ignoreSelectionChange(n), i = -1, a = -1, o = !1, s = [];
		if (e.editable) for (let e = 0; e < t.length; e++) {
			let n = this.registerMutation(t[e], s);
			n && (i = i < 0 ? n.from : Math.min(n.from, i), a = a < 0 ? n.to : Math.max(n.to, a), n.typeOver && (o = !0));
		}
		if (s.some((e) => e.nodeName == "BR") && (e.input.lastKeyCode == 8 || e.input.lastKeyCode == 46 || G && (e.composing || e.input.compositionEndedAt > Date.now() - 50) && t.some((e) => e.type == "childList" && e.removedNodes.length))) {
			for (let e of s) if (e.nodeName == "BR" && e.parentNode) {
				let t = e.nextSibling;
				for (; t && t.nodeType == 1;) {
					if (t.contentEditable == "false") {
						e.parentNode.removeChild(e);
						break;
					}
					t = t.firstChild;
				}
			}
		} else if (W && s.length) {
			let t = s.filter((e) => e.nodeName == "BR");
			if (t.length == 2) {
				let [e, n] = t;
				e.parentNode && e.parentNode.parentNode == n.parentNode ? n.remove() : e.remove();
			} else {
				let { focusNode: n } = this.currentSelection;
				for (let r of t) {
					let t = r.parentNode;
					t && t.nodeName == "LI" && (!n || Rs(e, n) != t) && r.remove();
				}
			}
		}
		let c = null;
		i < 0 && r && e.input.lastFocus > Date.now() - 200 && Math.max(e.input.lastTouch, e.input.lastClick.time) < Date.now() - 300 && ei(n) && (c = wa(e)) && c.eq(R.near(e.state.doc.resolve(0), 1)) ? (e.input.lastFocus = 0, Ea(e), this.currentSelection.set(n), e.scrollToSelection()) : (i > -1 || r) && (i > -1 && (e.docView.markDirty(i, a), Fs(e)), e.input.badSafariComposition && (e.input.badSafariComposition = !1, zs(e, s)), this.handleDOMChange(i, a, o, s), e.docView && e.docView.dirty ? e.updateState(e.state) : this.currentSelection.eq(n) || Ea(e), this.currentSelection.set(n));
	}
	registerMutation(e, t) {
		if (t.indexOf(e.target) > -1) return null;
		let n = this.view.docView.nearestDesc(e.target);
		if (e.type == "attributes" && (n == this.view.docView || e.attributeName == "contenteditable" || e.attributeName == "style" && !e.oldValue && !e.target.getAttribute("style")) || !n || n.ignoreMutation(e)) return null;
		if (e.type == "childList") {
			for (let n = 0; n < e.addedNodes.length; n++) {
				let r = e.addedNodes[n];
				t.push(r), r.nodeType == 3 && (this.lastChangedTextNode = r);
			}
			if (n.contentDOM && n.contentDOM != n.dom && !n.contentDOM.contains(e.target)) return {
				from: n.posBefore,
				to: n.posAfter
			};
			let r = e.previousSibling, i = e.nextSibling;
			if (U && ui <= 11 && e.addedNodes.length) for (let t = 0; t < e.addedNodes.length; t++) {
				let { previousSibling: n, nextSibling: a } = e.addedNodes[t];
				(!n || Array.prototype.indexOf.call(e.addedNodes, n) < 0) && (r = n), (!a || Array.prototype.indexOf.call(e.addedNodes, a) < 0) && (i = a);
			}
			let a = r && r.parentNode == e.target ? V(r) + 1 : 0, o = n.localPosFromDOM(e.target, a, -1), s = i && i.parentNode == e.target ? V(i) : e.target.childNodes.length;
			return {
				from: o,
				to: n.localPosFromDOM(e.target, s, 1)
			};
		}
		return e.type == "attributes" ? {
			from: n.posAtStart - n.border,
			to: n.posAtEnd + n.border
		} : (this.lastChangedTextNode = e.target, {
			from: n.posAtStart,
			to: n.posAtEnd,
			typeOver: e.target.nodeValue == e.oldValue
		});
	}
}, Ns = /* @__PURE__ */ new WeakMap(), Ps = !1;
function Fs(e) {
	if (!Ns.has(e) && (Ns.set(e, null), [
		"normal",
		"nowrap",
		"pre-line"
	].indexOf(getComputedStyle(e.dom).whiteSpace) !== -1)) {
		if (e.requiresGeckoHackNode = W, Ps) return;
		console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), Ps = !0;
	}
}
function Is(e, t) {
	let n = t.startContainer, r = t.startOffset, i = t.endContainer, a = t.endOffset, o = e.domAtPos(e.state.selection.anchor);
	return qr(o.node, o.offset, i, a) && ([n, r, i, a] = [
		i,
		a,
		n,
		r
	]), {
		anchorNode: n,
		anchorOffset: r,
		focusNode: i,
		focusOffset: a
	};
}
function Ls(e, t) {
	if (t.getComposedRanges) {
		let n = t.getComposedRanges(e.root)[0];
		if (n) return Is(e, n);
	}
	let n;
	function r(e) {
		e.preventDefault(), e.stopImmediatePropagation(), n = e.getTargetRanges()[0];
	}
	return e.dom.addEventListener("beforeinput", r, !0), document.execCommand("indent"), e.dom.removeEventListener("beforeinput", r, !0), n ? Is(e, n) : null;
}
function Rs(e, t) {
	for (let n = t.parentNode; n && n != e.dom; n = n.parentNode) {
		let t = e.docView.nearestDesc(n, !0);
		if (t && t.node.isBlock) return n;
	}
	return null;
}
function zs(e, t) {
	let { focusNode: n, focusOffset: r } = e.domSelectionRange();
	for (let i of t) if (i.parentNode?.nodeName == "TR") {
		let t = i.nextSibling;
		for (; t && t.nodeName != "TD" && t.nodeName != "TH";) t = t.nextSibling;
		if (t) {
			let a = t;
			for (;;) {
				let e = a.firstChild;
				if (!e || e.nodeType != 1 || e.contentEditable == "false" || /^(BR|IMG)$/.test(e.nodeName)) break;
				a = e;
			}
			a.insertBefore(i, a.firstChild), n == i && e.domSelection().collapse(i, r);
		} else i.parentNode.removeChild(i);
	}
}
function Bs(e, t, n, r) {
	let { node: i, fromOffset: a, toOffset: o, from: s, to: c } = e.docView.parseRange(t, n), l = e.domSelectionRange(), u, d = l.anchorNode;
	if (d && e.dom.contains(d.nodeType == 1 ? d : d.parentNode) && (u = [{
		node: d,
		offset: l.anchorOffset
	}], ei(l) || u.push({
		node: l.focusNode,
		offset: l.focusOffset
	})), G && e.input.lastKeyCode === 8) for (let e = o; e > a; e--) {
		let t = i.childNodes[e - 1], n = t.pmViewDesc;
		if (t.nodeName == "BR" && !n) {
			o = e;
			break;
		}
		if (!n || n.size) break;
	}
	let f = e.state.doc, p = e.someProp("domParser") || it.fromSchema(e.state.schema), m = f.resolve(s), h = null, g = p.parse(i, {
		topNode: m.parent,
		topMatch: m.parent.contentMatchAt(m.index()),
		topOpen: !0,
		from: a,
		to: o,
		preserveWhitespace: m.parent.type.whitespace != "pre" || "full",
		findPositions: u,
		ruleFromNode: Vs(r),
		context: m
	});
	if (u && u[0].pos != null) {
		let e = u[0].pos, t = u[1] && u[1].pos;
		t ??= e, h = {
			anchor: e + s,
			head: t + s
		};
	}
	return {
		doc: g,
		sel: h,
		from: s,
		to: c
	};
}
var Vs = (e) => (t) => {
	let n = t.pmViewDesc;
	if (n) return n.parseRule(e);
	if (t.nodeName == "BR" && t.parentNode) {
		if (K && /^(ul|ol)$/i.test(t.parentNode.nodeName)) {
			let e = document.createElement("div");
			return e.appendChild(document.createElement("li")), { skip: e };
		}
		if (t.parentNode.lastChild == t || K && /^(tr|table)$/i.test(t.parentNode.nodeName)) return { ignore: !0 };
	} else if (t.nodeName == "IMG" && t.getAttribute("mark-placeholder")) return { ignore: !0 };
	return null;
}, Hs = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function Us(e, t, n, r, i) {
	let a = e.input.compositionPendingChanges || (e.composing ? e.input.compositionID : 0);
	if (e.input.compositionPendingChanges = 0, t < 0) {
		let t = e.input.lastSelectionTime > Date.now() - 50 ? e.input.lastSelectionOrigin : null, n = wa(e, t);
		if (n && !e.state.selection.eq(n)) {
			if (G && hi && e.input.lastKeyCode === 13 && Date.now() - 100 < e.input.lastKeyCodeTime && e.someProp("handleKeyDown", (t) => t(e, ti(13, "Enter")))) return;
			let r = e.state.tr.setSelection(n);
			t == "pointer" ? r.setMeta("pointer", !0) : t == "key" && r.scrollIntoView(), a && r.setMeta("composition", a), e.dispatch(r);
		}
		return;
	}
	let o = e.state.doc.resolve(t), s = o.sharedDepth(n);
	t = o.before(s + 1), n = e.state.doc.resolve(n).after(s + 1);
	let c = e.state.selection, l = Bs(e, t, n, i), u = e.state.doc, d = u.slice(l.from, l.to), f, p;
	e.input.lastKeyCode === 8 && Date.now() - 100 < e.input.lastKeyCodeTime ? (f = e.state.selection.to, p = "end") : (f = e.state.selection.from, p = "start"), e.input.lastKeyCode = null;
	let m = Js(d.content, l.doc.content, l.from, f, p);
	if (m && e.input.domChangeCount++, (pi && e.input.lastIOSEnter > Date.now() - 225 || hi) && i.some((e) => e.nodeType == 1 && !Hs.test(e.nodeName)) && (!m || m.endA >= m.endB) && e.someProp("handleKeyDown", (t) => t(e, ti(13, "Enter")))) {
		e.input.lastIOSEnter = 0;
		return;
	}
	if (!m) {
		if (r && c instanceof z && !c.empty && c.$head.sameParent(c.$anchor) && !e.composing && !(l.sel && l.sel.anchor != l.sel.head)) m = {
			start: c.from,
			endA: c.to,
			endB: c.to
		};
		else {
			if (l.sel) {
				let t = Ws(e, e.state.doc, l.sel);
				if (t && !t.eq(e.state.selection)) {
					let n = e.state.tr.setSelection(t);
					a && n.setMeta("composition", a), e.dispatch(n);
				}
			}
			return;
		}
	}
	e.state.selection.from < e.state.selection.to && m.start == m.endB && e.state.selection instanceof z && (m.start > e.state.selection.from && m.start <= e.state.selection.from + 2 && e.state.selection.from >= l.from ? m.start = e.state.selection.from : m.endA < e.state.selection.to && m.endA >= e.state.selection.to - 2 && e.state.selection.to <= l.to && (m.endB += e.state.selection.to - m.endA, m.endA = e.state.selection.to)), U && ui <= 11 && m.endB == m.start + 1 && m.endA == m.start && m.start > l.from && l.doc.textBetween(m.start - l.from - 1, m.start - l.from + 1) == " \xA0" && (m.start--, m.endA--, m.endB--);
	let h = l.doc.resolveNoCache(m.start - l.from), g = l.doc.resolveNoCache(m.endB - l.from), _ = u.resolve(m.start), v = h.sameParent(g) && h.parent.inlineContent && _.end() >= m.endA;
	if ((pi && e.input.lastIOSEnter > Date.now() - 225 && (!v || i.some((e) => e.nodeName == "DIV" || e.nodeName == "P")) || !v && h.pos < l.doc.content.size && (!h.sameParent(g) || !h.parent.inlineContent) && h.pos < g.pos && !/\S/.test(l.doc.textBetween(h.pos, g.pos, "", ""))) && e.someProp("handleKeyDown", (t) => t(e, ti(13, "Enter")))) {
		e.input.lastIOSEnter = 0;
		return;
	}
	if (e.state.selection.anchor > m.start && Ks(u, m.start, m.endA, h, g) && e.someProp("handleKeyDown", (t) => t(e, ti(8, "Backspace")))) {
		hi && G && e.domObserver.suppressSelectionUpdates();
		return;
	}
	G && m.endB == m.start && (e.input.lastChromeDelete = Date.now()), hi && !v && h.start() != g.start() && g.parentOffset == 0 && h.depth == g.depth && l.sel && l.sel.anchor == l.sel.head && l.sel.head == m.endA && (m.endB -= 2, g = l.doc.resolveNoCache(m.endB - l.from), setTimeout(() => {
		e.someProp("handleKeyDown", function(t) {
			return t(e, ti(13, "Enter"));
		});
	}, 20));
	let y = m.start, b = m.endA, x = (t) => {
		let n = t || e.state.tr.replace(y, b, l.doc.slice(m.start - l.from, m.endB - l.from));
		if (l.sel) {
			let t = Ws(e, n.doc, l.sel);
			t && !(G && e.composing && t.empty && (m.start != m.endB || e.input.lastChromeDelete < Date.now() - 100) && (t.head == y || t.head == n.mapping.map(b) - 1) || U && t.empty && t.head == y) && n.setSelection(t);
		}
		return a && n.setMeta("composition", a), n.scrollIntoView();
	}, S;
	if (v) {
		if (h.pos == g.pos) {
			U && ui <= 11 && h.parentOffset == 0 && (e.domObserver.suppressSelectionUpdates(), setTimeout(() => Ea(e), 20));
			let t = x(e.state.tr.delete(y, b)), n = u.resolve(m.start).marksAcross(u.resolve(m.endA));
			n && t.ensureMarks(n), e.dispatch(t);
		} else if (m.endA == m.endB && (S = Gs(h.parent.content.cut(h.parentOffset, g.parentOffset), _.parent.content.cut(_.parentOffset, m.endA - _.start())))) {
			let t = x(e.state.tr);
			S.type == "add" ? t.addMark(y, b, S.mark) : t.removeMark(y, b, S.mark), e.dispatch(t);
		} else if (h.parent.child(h.index()).isText && h.index() == g.index() - +!g.textOffset) {
			let t = h.parent.textBetween(h.parentOffset, g.parentOffset), n = () => x(e.state.tr.insertText(t, y, b));
			e.someProp("handleTextInput", (r) => r(e, y, b, t, n)) || e.dispatch(n());
		} else e.dispatch(x());
	} else e.dispatch(x());
}
function Ws(e, t, n) {
	return Math.max(n.anchor, n.head) > t.content.size ? null : Fa(e, t.resolve(n.anchor), t.resolve(n.head));
}
function Gs(e, t) {
	let n = e.firstChild.marks, r = t.firstChild.marks, i = n, a = r, o, s, c;
	for (let e = 0; e < r.length; e++) i = r[e].removeFromSet(i);
	for (let e = 0; e < n.length; e++) a = n[e].removeFromSet(a);
	if (i.length == 1 && a.length == 0) s = i[0], o = "add", c = (e) => e.mark(s.addToSet(e.marks));
	else if (i.length == 0 && a.length == 1) s = a[0], o = "remove", c = (e) => e.mark(s.removeFromSet(e.marks));
	else return null;
	let l = [];
	for (let e = 0; e < t.childCount; e++) l.push(c(t.child(e)));
	if (A.from(l).eq(e)) return {
		mark: s,
		type: o
	};
}
function Ks(e, t, n, r, i) {
	if (n - t <= i.pos - r.pos || qs(r, !0, !1) < i.pos) return !1;
	let a = e.resolve(t);
	if (!r.parent.isTextblock) {
		let e = a.nodeAfter;
		return e != null && n == t + e.nodeSize;
	}
	if (a.parentOffset < a.parent.content.size || !a.parent.isTextblock) return !1;
	let o = e.resolve(qs(a, !0, !0));
	return !o.parent.isTextblock || o.pos > n || qs(o, !0, !1) < n ? !1 : r.parent.content.cut(r.parentOffset).eq(o.parent.content);
}
function qs(e, t, n) {
	let r = e.depth, i = t ? e.end() : e.pos;
	for (; r > 0 && (t || e.indexAfter(r) == e.node(r).childCount);) r--, i++, t = !1;
	if (n) {
		let t = e.node(r).maybeChild(e.indexAfter(r));
		for (; t && !t.isLeaf;) t = t.firstChild, i++;
	}
	return i;
}
function Js(e, t, n, r, i) {
	let a = e.findDiffStart(t, n), o = n + e.size, s = n + t.size;
	if (a == null) return null;
	let { a: c, b: l } = e.findDiffEnd(t, o, s);
	if (i == "end") {
		let e = Math.max(0, a - Math.min(c, l));
		r -= c + e - a;
	}
	if (c < a && o < s) {
		let e = r <= a && r >= c ? a - r : 0;
		a -= e, l = a + (l - c), c = a;
	} else if (l < a) {
		let e = r <= a && r >= l ? a - r : 0;
		a -= e, c = a + (c - l), l = a;
	}
	return {
		start: a,
		endA: c,
		endB: l
	};
}
var Ys = class {
	constructor(e, t) {
		this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new So(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = t, this.state = t.state, this.directPlugins = t.plugins || [], this.directPlugins.forEach(nc), this.dispatch = this.dispatch.bind(this), this.dom = e && e.mount || document.createElement("div"), e && (e.appendChild ? e.appendChild(this.dom) : typeof e == "function" ? e(this.dom) : e.mount && (this.mounted = !0)), this.editable = Qs(this), Zs(this), this.nodeViews = ec(this), this.docView = ia(this.state.doc, Xs(this), Os(this), this.dom, this), this.domObserver = new Ms(this, (e, t, n, r) => Us(this, e, t, n, r)), this.domObserver.start(), Co(this), this.updatePluginViews();
	}
	get composing() {
		return this.input.composing;
	}
	get props() {
		if (this._props.state != this.state) {
			let e = this._props;
			this._props = {};
			for (let t in e) this._props[t] = e[t];
			this._props.state = this.state;
		}
		return this._props;
	}
	update(e) {
		e.handleDOMEvents != this._props.handleDOMEvents && Eo(this);
		let t = this._props;
		this._props = e, e.plugins && (e.plugins.forEach(nc), this.directPlugins = e.plugins), this.updateStateInner(e.state, t);
	}
	setProps(e) {
		let t = {};
		for (let e in this._props) t[e] = this._props[e];
		t.state = this.state;
		for (let n in e) t[n] = e[n];
		this.update(t);
	}
	updateState(e) {
		this.updateStateInner(e, this._props);
	}
	updateStateInner(e, t) {
		let n = this.state, r = !1, i = !1;
		e.storedMarks && this.composing && (Xo(this), i = !0), this.state = e;
		let a = n.plugins != e.plugins || this._props.plugins != t.plugins;
		if (a || this._props.plugins != t.plugins || this._props.nodeViews != t.nodeViews) {
			let e = ec(this);
			tc(e, this.nodeViews) && (this.nodeViews = e, r = !0);
		}
		(a || t.handleDOMEvents != this._props.handleDOMEvents) && Eo(this), this.editable = Qs(this), Zs(this);
		let o = Os(this), s = Xs(this), c = n.plugins != e.plugins && !n.doc.eq(e.doc) ? "reset" : e.scrollToSelection > n.scrollToSelection ? "to selection" : "preserve", l = r || !this.docView.matchesNode(e.doc, s, o);
		(l || !e.selection.eq(n.selection)) && (i = !0);
		let u = c == "preserve" && i && this.dom.style.overflowAnchor == null && Si(this);
		if (i) {
			this.domObserver.stop();
			let t = l && (U || G) && !this.composing && !n.selection.empty && !e.selection.empty && $s(n.selection, e.selection);
			if (l) {
				let n = G ? this.trackWrites = this.domSelectionRange().focusNode : null;
				this.composing && (this.input.compositionNode = Zo(this)), (r || !this.docView.update(e.doc, s, o, this)) && (this.docView.updateOuterDeco(s), this.docView.destroy(), this.docView = ia(e.doc, s, o, this.dom, this)), n && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (t = !0);
			}
			let i = this.input.mouseDown;
			t || !(i && this.domObserver.currentSelection.eq(this.domSelectionRange()) && Ra(this) && i.delaySelUpdate()) ? Ea(this, t) : (Na(this, e.selection), this.domObserver.setCurSelection()), this.domObserver.start();
		}
		this.updatePluginViews(n), this.dragging?.node && !n.doc.eq(e.doc) && this.updateDraggedNode(this.dragging, n), c == "reset" ? this.dom.scrollTop = 0 : c == "to selection" ? this.scrollToSelection() : u && wi(u);
	}
	scrollToSelection() {
		let e = this.domSelectionRange().focusNode;
		if (e && this.dom.contains(e.nodeType == 1 ? e : e.parentNode) && !this.someProp("handleScrollToSelection", (e) => e(this))) {
			if (this.state.selection instanceof B) {
				let t = this.docView.domAfterPos(this.state.selection.from);
				t.nodeType == 1 && xi(this, t.getBoundingClientRect(), e);
			} else xi(this, this.coordsAtPos(this.state.selection.head, 1), e);
		}
	}
	destroyPluginViews() {
		let e;
		for (; e = this.pluginViews.pop();) e.destroy && e.destroy();
	}
	updatePluginViews(e) {
		if (!e || e.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
			this.prevDirectPlugins = this.directPlugins, this.destroyPluginViews();
			for (let e = 0; e < this.directPlugins.length; e++) {
				let t = this.directPlugins[e];
				t.spec.view && this.pluginViews.push(t.spec.view(this));
			}
			for (let e = 0; e < this.state.plugins.length; e++) {
				let t = this.state.plugins[e];
				t.spec.view && this.pluginViews.push(t.spec.view(this));
			}
		} else for (let t = 0; t < this.pluginViews.length; t++) {
			let n = this.pluginViews[t];
			n.update && n.update(this, e);
		}
	}
	updateDraggedNode(e, t) {
		let n = e.node, r = -1;
		if (n.from < this.state.doc.content.size && this.state.doc.nodeAt(n.from) == n.node) r = n.from;
		else {
			let e = n.from + (this.state.doc.content.size - t.doc.content.size);
			(e > 0 && e < this.state.doc.content.size && this.state.doc.nodeAt(e)) == n.node && (r = e);
		}
		this.dragging = new as(e.slice, e.move, r < 0 ? void 0 : B.create(this.state.doc, r));
	}
	someProp(e, t) {
		let n = this._props && this._props[e], r;
		if (n != null && (r = t ? t(n) : n)) return r;
		for (let n = 0; n < this.directPlugins.length; n++) {
			let i = this.directPlugins[n].props[e];
			if (i != null && (r = t ? t(i) : i)) return r;
		}
		let i = this.state.plugins;
		if (i) for (let n = 0; n < i.length; n++) {
			let a = i[n].props[e];
			if (a != null && (r = t ? t(a) : a)) return r;
		}
	}
	hasFocus() {
		if (U) {
			let e = this.root.activeElement;
			if (e == this.dom) return !0;
			if (!e || !this.dom.contains(e)) return !1;
			for (; e && this.dom != e && this.dom.contains(e);) {
				if (e.contentEditable == "false") return !1;
				e = e.parentElement;
			}
			return !0;
		}
		return this.root.activeElement == this.dom;
	}
	focus() {
		this.domObserver.stop(), this.editable && Di(this.dom), Ea(this), this.domObserver.start();
	}
	get root() {
		let e = this._root;
		if (e == null) {
			for (let e = this.dom.parentNode; e; e = e.parentNode) if (e.nodeType == 9 || e.nodeType == 11 && e.host) return e.getSelection || (Object.getPrototypeOf(e).getSelection = () => e.ownerDocument.getSelection()), this._root = e;
		}
		return e || document;
	}
	updateRoot() {
		this._root = null;
	}
	posAtCoords(e) {
		return Fi(this, e);
	}
	coordsAtPos(e, t = 1) {
		return zi(this, e, t);
	}
	domAtPos(e, t = 0) {
		return this.docView.domFromPos(e, t);
	}
	nodeDOM(e) {
		let t = this.docView.descAt(e);
		return t ? t.nodeDOM : null;
	}
	posAtDOM(e, t, n = -1) {
		let r = this.docView.posFromDOM(e, t, n);
		if (r == null) throw RangeError("DOM position not inside the editor");
		return r;
	}
	endOfTextblock(e, t) {
		return Yi(this, t || this.state, e);
	}
	pasteHTML(e, t) {
		return rs(this, "", e, !1, t || new ClipboardEvent("paste"));
	}
	pasteText(e, t) {
		return rs(this, e, null, !0, t || new ClipboardEvent("paste"));
	}
	serializeForClipboard(e) {
		return io(this, e);
	}
	destroy() {
		this.docView && (To(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], Os(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, Kr());
	}
	get isDestroyed() {
		return this.docView == null;
	}
	dispatchEvent(e) {
		return ko(this, e);
	}
	domSelectionRange() {
		let e = this.domSelection();
		return e ? K && this.root.nodeType === 11 && ni(this.dom.ownerDocument) == this.dom && Ls(this, e) || e : {
			focusNode: null,
			focusOffset: 0,
			anchorNode: null,
			anchorOffset: 0
		};
	}
	domSelection() {
		return this.root.getSelection();
	}
};
Ys.prototype.dispatch = function(e) {
	let t = this._props.dispatchTransaction;
	t ? t.call(this, e) : this.updateState(this.state.apply(e));
};
function Xs(e) {
	let t = Object.create(null);
	return t.class = "ProseMirror", t.contenteditable = String(e.editable), e.someProp("attributes", (n) => {
		if (typeof n == "function" && (n = n(e.state)), n) for (let e in n) e == "class" ? t.class += " " + n[e] : e == "style" ? t.style = (t.style ? t.style + ";" : "") + n[e] : !t[e] && e != "contenteditable" && e != "nodeName" && (t[e] = String(n[e]));
	}), t.translate ||= "no", [ms.node(0, e.state.doc.content.size, t)];
}
function Zs(e) {
	if (e.markCursor) {
		let t = document.createElement("img");
		t.className = "ProseMirror-separator", t.setAttribute("mark-placeholder", "true"), t.setAttribute("alt", ""), e.cursorWrapper = {
			dom: t,
			deco: ms.widget(e.state.selection.from, t, {
				raw: !0,
				marks: e.markCursor
			})
		};
	} else e.cursorWrapper = null;
}
function Qs(e) {
	return !e.someProp("editable", (t) => t(e.state) === !1);
}
function $s(e, t) {
	let n = Math.min(e.$anchor.sharedDepth(e.head), t.$anchor.sharedDepth(t.head));
	return e.$anchor.start(n) != t.$anchor.start(n);
}
function ec(e) {
	let t = Object.create(null);
	function n(e) {
		for (let n in e) Object.prototype.hasOwnProperty.call(t, n) || (t[n] = e[n]);
	}
	return e.someProp("nodeViews", n), e.someProp("markViews", n), t;
}
function tc(e, t) {
	let n = 0, r = 0;
	for (let r in e) {
		if (e[r] != t[r]) return !0;
		n++;
	}
	for (let e in t) r++;
	return n != r;
}
function nc(e) {
	if (e.spec.state || e.spec.filterTransaction || e.spec.appendTransaction) throw RangeError("Plugins passed directly to the view must not have a state component");
}
for (var rc = {
	8: "Backspace",
	9: "Tab",
	10: "Enter",
	12: "NumLock",
	13: "Enter",
	16: "Shift",
	17: "Control",
	18: "Alt",
	20: "CapsLock",
	27: "Escape",
	32: " ",
	33: "PageUp",
	34: "PageDown",
	35: "End",
	36: "Home",
	37: "ArrowLeft",
	38: "ArrowUp",
	39: "ArrowRight",
	40: "ArrowDown",
	44: "PrintScreen",
	45: "Insert",
	46: "Delete",
	59: ";",
	61: "=",
	91: "Meta",
	92: "Meta",
	106: "*",
	107: "+",
	108: ",",
	109: "-",
	110: ".",
	111: "/",
	144: "NumLock",
	145: "ScrollLock",
	160: "Shift",
	161: "Shift",
	162: "Control",
	163: "Control",
	164: "Alt",
	165: "Alt",
	173: "-",
	186: ";",
	187: "=",
	188: ",",
	189: "-",
	190: ".",
	191: "/",
	192: "`",
	219: "[",
	220: "\\",
	221: "]",
	222: "'"
}, ic = {
	48: ")",
	49: "!",
	50: "@",
	51: "#",
	52: "$",
	53: "%",
	54: "^",
	55: "&",
	56: "*",
	57: "(",
	59: ":",
	61: "+",
	173: "_",
	186: ":",
	187: "+",
	188: "<",
	189: "_",
	190: ">",
	191: "?",
	192: "~",
	219: "{",
	220: "|",
	221: "}",
	222: "\""
}, ac = typeof navigator < "u" && /Mac/.test(navigator.platform), oc = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent), Q = 0; Q < 10; Q++) rc[48 + Q] = rc[96 + Q] = String(Q);
for (var Q = 1; Q <= 24; Q++) rc[Q + 111] = "F" + Q;
for (var Q = 65; Q <= 90; Q++) rc[Q] = String.fromCharCode(Q + 32), ic[Q] = String.fromCharCode(Q);
for (var sc in rc) ic.hasOwnProperty(sc) || (ic[sc] = rc[sc]);
typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), typeof navigator < "u" && /Win/.test(navigator.platform);
//#endregion
//#region ../../node_modules/@tiptap/core/dist/index.js
function cc(e) {
	let { state: t, transaction: n } = e, { selection: r } = n, { doc: i } = n, { storedMarks: a } = n;
	return {
		...t,
		apply: t.apply.bind(t),
		applyTransaction: t.applyTransaction.bind(t),
		plugins: t.plugins,
		schema: t.schema,
		reconfigure: t.reconfigure.bind(t),
		toJSON: t.toJSON.bind(t),
		get storedMarks() {
			return a;
		},
		get selection() {
			return r;
		},
		get doc() {
			return i;
		},
		get tr() {
			return r = n.selection, i = n.doc, a = n.storedMarks, n;
		}
	};
}
var lc = class e {
	constructor(e) {
		this.editor = e.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = e.state;
	}
	get hasCustomState() {
		return !!this.customState;
	}
	get state() {
		return this.customState || this.editor.state;
	}
	get commands() {
		let { rawCommands: e, editor: t, state: n } = this, { view: r } = t, { tr: i } = n, a = this.buildProps(i);
		return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, (...e) => {
			let n = t(...e)(a);
			return !i.getMeta("preventDispatch") && !this.hasCustomState && r.dispatch(i), n;
		}]));
	}
	get chain() {
		return () => this.createChain();
	}
	get can() {
		return () => this.createCan();
	}
	createChain(e, t = !0) {
		let { rawCommands: n, editor: r, state: i } = this, { view: a } = r, o = [], s = !!e, c = e || i.tr, l = () => (!s && t && !c.getMeta("preventDispatch") && !this.hasCustomState && a.dispatch(c), o.every((e) => e === !0)), u = {
			...Object.fromEntries(Object.entries(n).map(([e, n]) => [e, (...e) => {
				let r = this.buildProps(c, t), i = n(...e)(r);
				return o.push(i), u;
			}])),
			run: l
		};
		return u;
	}
	static createFakeChain() {
		let e = new Proxy({}, { get: (t, n) => {
			if (n !== "then") return n === "run" ? () => !1 : () => e;
		} });
		return e;
	}
	createCan(e) {
		let { rawCommands: t, state: n } = this, r = e || n.tr, i = this.buildProps(r, !1);
		return {
			...Object.fromEntries(Object.entries(t).map(([e, t]) => [e, (...e) => t(...e)({
				...i,
				dispatch: void 0
			})])),
			chain: () => this.createChain(r, !1)
		};
	}
	static createFallbackCan() {
		let t = e.createFakeChain();
		return new Proxy({ chain: () => t }, { get: (e, t) => {
			if (t !== "then") return t === "chain" ? e.chain : () => !1;
		} });
	}
	buildProps(e, t = !0) {
		let { rawCommands: n, editor: r, state: i } = this, { view: a } = r, o = {
			tr: e,
			editor: r,
			view: a,
			state: cc({
				state: i,
				transaction: e
			}),
			dispatch: t ? () => void 0 : void 0,
			chain: () => this.createChain(e, t),
			can: () => this.createCan(e),
			get commands() {
				return Object.fromEntries(Object.entries(n).map(([e, t]) => [e, (...e) => t(...e)(o)]));
			}
		};
		return o;
	}
}, uc = () => ({ editor: e, view: t }) => (requestAnimationFrame(() => {
	if (!e.isDestroyed) {
		var n;
		t.dom.blur(), (n = window) == null || (n = n.getSelection()) == null || n.removeAllRanges();
	}
}), !0), dc = (e = !0) => ({ commands: t }) => t.setContent("", { emitUpdate: e }), fc = () => ({ state: e, tr: t, dispatch: n }) => {
	let { selection: r } = t, { ranges: i } = r;
	return n && i.forEach(({ $from: n, $to: r }) => {
		e.doc.nodesBetween(n.pos, r.pos, (e, n) => {
			if (e.type.isText) return;
			let { doc: r, mapping: i } = t, a = r.resolve(i.map(n)), o = r.resolve(i.map(n + e.nodeSize)), s = a.blockRange(o);
			if (!s) return;
			let c = Jt(s);
			if (e.type.isTextblock) {
				let { defaultType: e } = a.parent.contentMatchAt(a.index());
				t.setNodeMarkup(s.start, e);
			}
			(c || c === 0) && t.lift(s, c);
		});
	}), !0;
}, pc = (e) => (t) => e(t), mc = () => ({ state: e, dispatch: t }) => vr(e, t), hc = (e, t) => ({ editor: n, tr: r }) => {
	let { state: i } = n, a = i.doc.slice(e.from, e.to);
	r.deleteRange(e.from, e.to);
	let o = r.mapping.map(t);
	return r.insert(o, a.content), r.setSelection(new z(r.doc.resolve(Math.max(o - 1, 0)))), !0;
}, gc = () => ({ tr: e, dispatch: t }) => {
	let { selection: n } = e, r = n.$anchor.node();
	if (r.content.size > 0) return !1;
	let i = e.selection.$anchor;
	for (let n = i.depth; n > 0; --n) if (i.node(n).type === r.type) {
		if (t) {
			let t = i.before(n), r = i.after(n);
			e.delete(t, r).scrollIntoView();
		}
		return !0;
	}
	return !1;
};
function $(e, t) {
	if (typeof e == "string") {
		if (!t.nodes[e]) throw Error(`There is no node type named '${e}'. Maybe you forgot to add the extension?`);
		return t.nodes[e];
	}
	return e;
}
var _c = (e) => ({ tr: t, state: n, dispatch: r }) => {
	let i = $(e, n.schema), a = t.selection.$anchor;
	for (let e = a.depth; e > 0; --e) if (a.node(e).type === i) {
		if (r) {
			let n = a.before(e), r = a.after(e);
			t.delete(n, r).scrollIntoView();
		}
		return !0;
	}
	return !1;
}, vc = (e) => ({ tr: t, dispatch: n }) => {
	let { from: r, to: i } = e;
	return n && t.delete(r, i), !0;
}, yc = (e) => e.content ? /^text(\*|\+)/.test(e.content) : !1, bc = (e, t, n) => {
	if (!e.parent.isInline || n === "left" && e.pos > e.start() || n === "right" && e.pos < e.end()) return e.pos;
	let r = t.nodes[e.parent.type.name].spec;
	return yc(r) ? n === "left" ? e.start() - 1 : e.end() + 1 : e.pos;
}, xc = (e, t, n) => ({
	from: bc(e, n, "left"),
	to: bc(t, n, "right")
}), Sc = () => ({ state: e, dispatch: t }) => {
	if (e.selection.empty) return !1;
	if (t) {
		let n = e.tr, { ranges: r } = e.selection, i = n.steps.length;
		r.forEach((t) => {
			let r = n.mapping.slice(i), { from: a, to: o } = xc(n.doc.resolve(r.map(t.$from.pos)), n.doc.resolve(r.map(t.$to.pos)), e.schema);
			n.deleteRange(a, o);
		}), n.selection.empty || n.setSelection(z.near(n.doc.resolve(n.selection.from))), n.scrollIntoView(), t(n);
	}
	return !0;
}, Cc = () => ({ commands: e }) => e.keyboardShortcut("Enter"), wc = () => ({ state: e, dispatch: t }) => _r(e, t);
function Tc(e) {
	return Object.prototype.toString.call(e) === "[object RegExp]";
}
function Ec(e, t, n = { strict: !0 }) {
	let r = Object.keys(t);
	return !r.length || r.every((r) => n.strict ? t[r] === e[r] : Tc(t[r]) ? t[r].test(e[r]) : t[r] === e[r]);
}
function Dc(e, t, n = {}) {
	return e.find((e) => e.type === t && Ec(Object.fromEntries(Object.keys(n).map((t) => [t, e.attrs[t]])), n));
}
function Oc(e, t, n = {}) {
	return !!Dc(e, t, n);
}
function kc(e, t, n) {
	if (!e || !t) return;
	let r = e.parent.childAfter(e.parentOffset);
	if ((!r.node || !r.node.marks.some((e) => e.type === t)) && (r = e.parent.childBefore(e.parentOffset)), !r.node || !r.node.marks.some((e) => e.type === t)) return;
	if (!n) {
		let e = r.node.marks.find((e) => e.type === t);
		e && (n = e.attrs);
	}
	if (!Dc([...r.node.marks], t, n)) return;
	let i = r.index, a = e.start() + r.offset, o = i + 1, s = a + r.node.nodeSize;
	for (; i > 0 && Oc([...e.parent.child(i - 1).marks], t, n);) --i, a -= e.parent.child(i).nodeSize;
	for (; o < e.parent.childCount && Oc([...e.parent.child(o).marks], t, n);) s += e.parent.child(o).nodeSize, o += 1;
	return {
		from: a,
		to: s
	};
}
function Ac(e, t) {
	if (typeof e == "string") {
		if (!t.marks[e]) throw Error(`There is no mark type named '${e}'. Maybe you forgot to add the extension?`);
		return t.marks[e];
	}
	return e;
}
var jc = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let a = Ac(e, r.schema), { doc: o, selection: s } = n, { $from: c, from: l, to: u } = s;
	if (i) {
		let e = kc(c, a, t);
		if (e && e.from <= l && e.to >= u) {
			let t = z.create(o, e.from, e.to);
			n.setSelection(t);
		}
	}
	return !0;
}, Mc = (e) => (t) => {
	let n = typeof e == "function" ? e(t) : e;
	for (let e = 0; e < n.length; e += 1) if (n[e](t)) return !0;
	return !1;
};
function Nc(e) {
	return e instanceof z;
}
function Pc(e = 0, t = 0, n = 0) {
	return Math.min(Math.max(e, t), n);
}
function Fc(e, t = null) {
	if (!t) return null;
	let n = R.atStart(e), r = R.atEnd(e);
	if (t === "start" || t === !0) return n;
	if (t === "end") return r;
	let i = n.from, a = r.to;
	return t === "all" ? z.create(e, Pc(0, i, a), Pc(e.content.size, i, a)) : z.create(e, Pc(t, i, a), Pc(t, i, a));
}
function Ic() {
	return ["Android"].includes(navigator.platform) || /android/i.test(navigator.userAgent);
}
function Lc() {
	return [
		"iPad Simulator",
		"iPhone Simulator",
		"iPod Simulator",
		"iPad",
		"iPhone",
		"iPod"
	].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function Rc() {
	return typeof navigator < "u" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
var zc = (e = null, t = {}) => ({ editor: n, view: r, tr: i, dispatch: a }) => {
	t = {
		scrollIntoView: !0,
		...t
	};
	let o = () => {
		(Lc() || Ic()) && r.dom.focus(), Rc() && !Lc() && !Ic() && r.dom.focus({ preventScroll: !0 }), requestAnimationFrame(() => {
			n.isDestroyed || (r.focus(), t?.scrollIntoView && n.commands.scrollIntoView());
		});
	};
	try {
		if (r.hasFocus() && e === null || e === !1) return !0;
	} catch {
		return !1;
	}
	if (a && e === null && !Nc(n.state.selection)) return o(), !0;
	let s = Fc(i.doc, e) || n.state.selection, c = n.state.selection.eq(s);
	return a && (c || i.setSelection(s), c && i.storedMarks && i.setStoredMarks(i.storedMarks), o()), !0;
}, Bc = (e, t) => (n) => e.every((e, r) => t(e, {
	...n,
	index: r
})), Vc = (e, t) => ({ tr: n, commands: r }) => r.insertContentAt({
	from: n.selection.from,
	to: n.selection.to
}, e, t), Hc = (e) => {
	let t = e.childNodes;
	for (let n = t.length - 1; n >= 0; --n) {
		let r = t[n];
		r.nodeType === 3 && r.nodeValue && /^(\n\s\s|\n)$/.test(r.nodeValue) ? e.removeChild(r) : r.nodeType === 1 && Hc(r);
	}
	return e;
};
function Uc(e) {
	if (typeof window > "u") throw Error("[tiptap error]: there is no window object available, so this function cannot be used");
	let t = `<body>${e}</body>`, n = new window.DOMParser().parseFromString(t, "text/html").body;
	return Hc(n);
}
function Wc(e) {
	return typeof e?.nodesBetween == "function";
}
function Gc(e, t, n) {
	if (Wc(e)) return e;
	let r = typeof e == "object" && !!e;
	n = {
		slice: !0,
		parseOptions: {},
		...n
	};
	let i = typeof e == "string";
	if (r) try {
		if (Array.isArray(e) && e.length > 0) return A.fromArray(e.map((e) => t.nodeFromJSON(e)));
		let r = t.nodeFromJSON(e);
		return n.errorOnInvalidContent && r.check(), r;
	} catch (r) {
		if (n.errorOnInvalidContent) throw Error("[tiptap error]: Invalid JSON content", { cause: r });
		return console.warn("[tiptap warn]: Invalid content.", "Passed value:", e, "Error:", r), Gc("", t, n);
	}
	if (i) {
		if (n.errorOnInvalidContent) {
			let r = !1, i = "", a = new et({
				topNode: t.spec.topNode,
				marks: t.spec.marks,
				nodes: t.spec.nodes.append({ __tiptap__private__unknown__catch__all__node: {
					content: "inline*",
					group: "block",
					parseDOM: [{
						tag: "*",
						getAttrs: (e) => (r = !0, i = typeof e == "string" ? e : e.outerHTML, null)
					}]
				} })
			});
			if (n.slice ? it.fromSchema(a).parseSlice(Uc(e), n.parseOptions) : it.fromSchema(a).parse(Uc(e), n.parseOptions), n.errorOnInvalidContent && r) throw Error("[tiptap error]: Invalid HTML content", { cause: /* @__PURE__ */ Error(`Invalid element found: ${i}`) });
		}
		let r = it.fromSchema(t);
		return n.slice ? r.parseSlice(Uc(e), n.parseOptions).content : r.parse(Uc(e), n.parseOptions);
	}
	return Gc("", t, n);
}
function Kc(e) {
	return !("type" in e);
}
function qc(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof I || i instanceof L)) return;
	let a = e.mapping.maps[r], o = 0;
	a.forEach((e, t, n, r) => {
		o === 0 && (o = r);
	}), e.setSelection(R.near(e.doc.resolve(o), n));
}
var Jc = (e, t, n) => ({ tr: r, dispatch: i, editor: a }) => {
	if (i) {
		n = {
			parseOptions: a.options.parseOptions,
			updateSelection: !0,
			applyInputRules: !1,
			applyPasteRules: !1,
			...n
		};
		let i, o = (e) => {
			a.emit("contentError", {
				editor: a,
				error: e,
				disableCollaboration: () => {
					"collaboration" in a.storage && typeof a.storage.collaboration == "object" && a.storage.collaboration && (a.storage.collaboration.isDisabled = !0);
				}
			});
		}, s = {
			preserveWhitespace: "full",
			...n.parseOptions
		};
		if (!n.errorOnInvalidContent && !a.options.enableContentCheck && a.options.emitContentError) try {
			Gc(t, a.schema, {
				parseOptions: s,
				errorOnInvalidContent: !0
			});
		} catch (e) {
			o(e);
		}
		try {
			i = Gc(t, a.schema, {
				parseOptions: s,
				errorOnInvalidContent: n.errorOnInvalidContent ?? a.options.enableContentCheck
			});
		} catch (e) {
			return o(e), !1;
		}
		let { from: c, to: l } = typeof e == "number" ? {
			from: e,
			to: e
		} : {
			from: e.from,
			to: e.to
		}, u = !0, d = !0, f = Kc(i) ? i.content : [i];
		if (f.forEach((e) => {
			e.check(), u = u ? e.isText && e.marks.length === 0 : !1, d = d ? e.isBlock : !1;
		}), c === l && d) {
			let { parent: e } = r.doc.resolve(c);
			e.isTextblock && !e.type.spec.code && !e.childCount && (--c, l += 1);
		}
		let p;
		if (u) p = Array.isArray(t) ? t.map((e) => e.text || "").join("") : Wc(t) ? f.map((e) => e.text ?? "").join("") : typeof t == "object" && t && t.text ? t.text : t, r.insertText(p, c, l);
		else {
			p = A.from(f);
			let e = r.doc.resolve(c), t = e.node(), n = e.parentOffset === 0, i = t.isText || t.isTextblock, a = t.content.size > 0;
			n && i && a && d && (c = Math.max(0, c - 1)), r.replaceWith(c, l, f);
		}
		n.updateSelection && qc(r, r.steps.length - 1, -1), n.applyInputRules && r.setMeta("applyInputRules", {
			from: c,
			text: p
		}), n.applyPasteRules && r.setMeta("applyPasteRules", {
			from: c,
			text: p
		});
	}
	return !0;
};
function Yc(e) {
	for (let t = 0; t < e.edgeCount; t += 1) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
var Xc = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
	let { pos: i, attrs: a, content: o, updateSelection: s = !0 } = e, c;
	c = typeof i == "number" ? t.doc.resolve(i) : i || t.selection.$from;
	let l = Yc(c.parent.contentMatchAt(c.index()));
	if (!l) return !1;
	let u = Object.keys(l.spec.attrs || {}), d = a ? Object.fromEntries(Object.entries(a).filter(([e]) => u.includes(e))) : {}, f;
	if (o) {
		let e = Gc(o, r.schema);
		f = l.createAndFill(d, e);
	} else f = l.createAndFill(d);
	return f ? (n && (t.insert(c.pos, f), s && qc(t, t.steps.length - 1, -1)), !0) : !1;
}, Zc = () => ({ state: e, dispatch: t }) => fr(e, t), Qc = () => ({ state: e, dispatch: t }) => pr(e, t), $c = () => ({ state: e, dispatch: t }) => tr(e, t), el = () => ({ state: e, dispatch: t }) => lr(e, t), tl = () => ({ state: e, dispatch: t, tr: n }) => {
	try {
		let r = fn(e.doc, e.selection.$from.pos, -1);
		return r != null && (n.join(r, 2), t && t(n), !0);
	} catch {
		return !1;
	}
}, nl = () => ({ state: e, dispatch: t, tr: n }) => {
	try {
		let r = fn(e.doc, e.selection.$from.pos, 1);
		return r != null && (n.join(r, 2), t && t(n), !0);
	} catch {
		return !1;
	}
}, rl = () => ({ state: e, dispatch: t }) => nr(e, t), il = () => ({ state: e, dispatch: t }) => rr(e, t);
function al() {
	return typeof navigator < "u" && /Mac/.test(navigator.platform);
}
function ol(e) {
	let t = e.split(/-(?!$)/), n = t[t.length - 1];
	n === "Space" && (n = " ");
	let r, i, a, o;
	for (let e = 0; e < t.length - 1; e += 1) {
		let n = t[e];
		if (/^(cmd|meta|m)$/i.test(n)) o = !0;
		else if (/^a(lt)?$/i.test(n)) r = !0;
		else if (/^(c|ctrl|control)$/i.test(n)) i = !0;
		else if (/^s(hift)?$/i.test(n)) a = !0;
		else if (/^mod$/i.test(n)) Lc() || al() ? o = !0 : i = !0;
		else throw Error(`Unrecognized modifier name: ${n}`);
	}
	return r && (n = `Alt-${n}`), i && (n = `Ctrl-${n}`), o && (n = `Meta-${n}`), a && (n = `Shift-${n}`), n;
}
var sl = (e) => ({ editor: t, view: n, tr: r, dispatch: i }) => {
	let a = ol(e).split(/-(?!$)/), o = a.find((e) => ![
		"Alt",
		"Ctrl",
		"Meta",
		"Shift"
	].includes(e)), s = new KeyboardEvent("keydown", {
		key: o === "Space" ? " " : o,
		altKey: a.includes("Alt"),
		ctrlKey: a.includes("Ctrl"),
		metaKey: a.includes("Meta"),
		shiftKey: a.includes("Shift"),
		bubbles: !0,
		cancelable: !0
	});
	return t.captureTransaction(() => {
		n.someProp("handleKeyDown", (e) => e(n, s));
	})?.steps.forEach((e) => {
		let t = e.map(r.mapping);
		t && i && r.maybeStep(t);
	}), !0;
};
function cl(e, t, n = {}) {
	let { from: r, to: i, empty: a } = e.selection, o = t ? $(t, e.schema) : null, s = [];
	e.doc.nodesBetween(r, i, (e, t) => {
		if (e.isText) return;
		let n = Math.max(r, t), a = Math.min(i, t + e.nodeSize);
		s.push({
			node: e,
			from: n,
			to: a
		});
	});
	let c = i - r, l = s.filter((e) => !o || o.name === e.node.type.name).filter((e) => Ec(e.node.attrs, n, { strict: !1 }));
	return a ? !!l.length : l.reduce((e, t) => e + t.to - t.from, 0) >= c;
}
var ll = (e, t = {}) => ({ state: n, dispatch: r }) => cl(n, $(e, n.schema), t) ? mr(n, r) : !1, ul = () => ({ state: e, dispatch: t }) => yr(e, t), dl = (e) => ({ state: t, dispatch: n }) => zr($(e, t.schema))(t, n), fl = () => ({ state: e, dispatch: t }) => hr(e, t);
function pl(e, t) {
	return t.nodes[e] ? "node" : t.marks[e] ? "mark" : null;
}
function ml(e, t) {
	let n = typeof t == "string" ? [t] : t;
	return Object.keys(e).reduce((t, r) => (n.includes(r) || (t[r] = e[r]), t), {});
}
var hl = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let a = null, o = null, s = pl(typeof e == "string" ? e : e.name, r.schema);
	if (!s) return !1;
	s === "node" && (a = $(e, r.schema)), s === "mark" && (o = Ac(e, r.schema));
	let c = !1;
	return n.selection.ranges.forEach((e) => {
		r.doc.nodesBetween(e.$from.pos, e.$to.pos, (e, r) => {
			a && a === e.type && (c = !0, i && n.setNodeMarkup(r, void 0, ml(e.attrs, t))), o && e.marks.length && e.marks.forEach((a) => {
				o === a.type && (c = !0, i && n.addMark(r, r + e.nodeSize, o.create(ml(a.attrs, t))));
			});
		});
	}), c;
}, gl = () => ({ tr: e, dispatch: t }) => (t && e.scrollIntoView(), !0), _l = () => ({ tr: e, dispatch: t }) => {
	if (t) {
		let t = new Hn(e.doc);
		e.setSelection(t);
	}
	return !0;
}, vl = () => ({ state: e, dispatch: t }) => or(e, t), yl = () => ({ state: e, dispatch: t }) => ur(e, t), bl = () => ({ state: e, dispatch: t }) => Sr(e, t), xl = () => ({ state: e, dispatch: t }) => Or(e, t), Sl = () => ({ state: e, dispatch: t }) => Dr(e, t);
function Cl(e, t, n = {}, r = {}) {
	return Gc(e, t, {
		slice: !1,
		parseOptions: n,
		errorOnInvalidContent: r.errorOnInvalidContent
	});
}
var wl = (e, { errorOnInvalidContent: t, emitUpdate: n = !0, parseOptions: r = {} } = {}) => ({ editor: i, tr: a, dispatch: o, commands: s }) => {
	let { doc: c } = a;
	if (r.preserveWhitespace !== "full") {
		let s = Cl(e, i.schema, r, { errorOnInvalidContent: t ?? i.options.enableContentCheck });
		if (o) {
			let e = Kc(s) ? s.content : [s];
			a.replaceWith(0, c.content.size, e).setMeta("preventUpdate", !n);
		}
		return !0;
	}
	return o && a.setMeta("preventUpdate", !n), s.insertContentAt({
		from: 0,
		to: c.content.size
	}, e, {
		parseOptions: r,
		errorOnInvalidContent: t ?? i.options.enableContentCheck
	});
};
function Tl(e, t) {
	let n = Ac(t, e.schema), { from: r, to: i, empty: a } = e.selection, o = [];
	a ? (e.storedMarks && o.push(...e.storedMarks), o.push(...e.selection.$head.marks())) : e.doc.nodesBetween(r, i, (e) => {
		o.push(...e.marks);
	});
	let s = o.find((e) => e.type.name === n.name);
	return s ? { ...s.attrs } : {};
}
function El(e, t) {
	let n = new Fn(e);
	return t.forEach((e) => {
		e.steps.forEach((e) => {
			n.step(e);
		});
	}), n;
}
function Dl(e, t) {
	for (let n = e.depth; n > 0; --n) {
		let r = e.node(n);
		if (t(r)) return {
			pos: n > 0 ? e.before(n) : 0,
			start: e.start(n),
			depth: n,
			node: r
		};
	}
}
function Ol(e) {
	return (t) => Dl(t.$from, e);
}
function kl(e, t, n) {
	return e.config[t] === void 0 && e.parent ? kl(e.parent, t, n) : typeof e.config[t] == "function" ? e.config[t].bind({
		...n,
		parent: e.parent ? kl(e.parent, t, n) : null
	}) : e.config[t];
}
function Al(e) {
	return typeof e == "function";
}
function jl(e, t = void 0, ...n) {
	return Al(e) ? t ? e.bind(t)(...n) : e(...n) : e;
}
function Ml(e) {
	return {
		baseExtensions: e.filter((e) => e.type === "extension"),
		nodeExtensions: e.filter((e) => e.type === "node"),
		markExtensions: e.filter((e) => e.type === "mark")
	};
}
function Nl(e) {
	let t = [], n = "", r = !1, i = !1, a = 0, o = e.length;
	for (let s = 0; s < o; s += 1) {
		let o = e[s];
		if (o === "'" && !i) {
			r = !r, n += o;
			continue;
		}
		if (o === "\"" && !r) {
			i = !i, n += o;
			continue;
		}
		if (!r && !i) {
			if (o === "(") {
				a += 1, n += o;
				continue;
			}
			if (o === ")" && a > 0) {
				--a, n += o;
				continue;
			}
			if (o === ";" && a === 0) {
				t.push(n), n = "";
				continue;
			}
		}
		n += o;
	}
	return n && t.push(n), t;
}
function Pl(e) {
	let t = [], n = Nl(e || ""), r = n.length;
	for (let e = 0; e < r; e += 1) {
		let r = n[e], i = r.indexOf(":");
		if (i === -1) continue;
		let a = r.slice(0, i).trim(), o = r.slice(i + 1).trim();
		a && o && t.push([a, o]);
	}
	return t;
}
function Fl(...e) {
	return e.filter((e) => !!e).reduce((e, t) => {
		let n = { ...e };
		return Object.entries(t).forEach(([e, t]) => {
			if (e === "__proto__") {
				Object.defineProperty(n, e, {
					configurable: !0,
					enumerable: !0,
					value: t,
					writable: !0
				});
				return;
			}
			if (!n[e]) {
				n[e] = t;
				return;
			}
			if (e === "class") {
				let r = t ? String(t).split(" ") : [], i = n[e] ? n[e].split(" ") : [], a = r.filter((e) => !i.includes(e));
				n[e] = [...i, ...a].join(" ");
			} else if (e === "style") {
				let r = new Map([...Pl(n[e]), ...Pl(t)]);
				n[e] = Array.from(r.entries()).map(([e, t]) => `${e}: ${t}`).join("; ");
			} else n[e] = t;
		}), n;
	}, {});
}
function Il(e, t) {
	return t.filter((t) => t.type === e.type.name).filter((e) => e.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(e.attrs) || {} : { [t.name]: e.attrs[t.name] }).reduce((e, t) => Fl(e, t), {});
}
function Ll(e, t, n) {
	let { from: r, to: i } = t, { blockSeparator: a = "\n\n", textSerializers: o = {} } = n || {}, s = "";
	return e.nodesBetween(r, i, (e, n, c, l) => {
		e.isBlock && n > r && (s += a);
		let u = o?.[e.type.name];
		if (u) return c && (s += u({
			node: e,
			pos: n,
			parent: c,
			index: l,
			range: t
		})), !1;
		if (e.isText) {
			var d;
			s += e == null || (d = e.text) == null ? void 0 : d.slice(Math.max(r, n) - n, i - n);
		}
	}), s;
}
function Rl(e) {
	return Object.fromEntries(Object.entries(e.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
function zl(e, t = JSON.stringify) {
	let n = {};
	return e.filter((e) => {
		let r = t(e);
		return Object.prototype.hasOwnProperty.call(n, r) ? !1 : n[r] = !0;
	});
}
function Bl(e) {
	let t = zl(e);
	return t.length === 1 ? t : t.filter((e, n) => !t.filter((e, t) => t !== n).some((t) => e.oldRange.from >= t.oldRange.from && e.oldRange.to <= t.oldRange.to && e.newRange.from >= t.newRange.from && e.newRange.to <= t.newRange.to));
}
function Vl(e) {
	let { mapping: t, steps: n } = e, r = [];
	return t.maps.forEach((e, i) => {
		let a = [];
		if (e.ranges.length) e.forEach((e, t) => {
			a.push({
				from: e,
				to: t
			});
		});
		else {
			let { from: e, to: t } = n[i];
			if (e === void 0 || t === void 0) return;
			a.push({
				from: e,
				to: t
			});
		}
		a.forEach(({ from: e, to: n }) => {
			let a = t.slice(i).map(e, -1), o = t.slice(i).map(n), s = t.invert().map(a, -1), c = t.invert().map(o);
			r.push({
				oldRange: {
					from: s,
					to: c
				},
				newRange: {
					from: a,
					to: o
				}
			});
		});
	}), Bl(r);
}
function Hl(e, t, n) {
	return Object.fromEntries(Object.entries(n).filter(([n]) => {
		let r = e.find((e) => e.type === t && e.name === n);
		return r ? r.attribute.keepOnSplit : !1;
	}));
}
function Ul(e, t, n = {}) {
	let { empty: r, ranges: i } = e.selection, a = t ? Ac(t, e.schema) : null;
	if (r) return !!(e.storedMarks || e.selection.$from.marks()).filter((e) => !a || a.name === e.type.name).find((e) => Ec(e.attrs, n, { strict: !1 }));
	let o = 0, s = [];
	if (i.forEach(({ $from: t, $to: n }) => {
		let r = t.pos, i = n.pos;
		e.doc.nodesBetween(r, i, (e, t) => {
			if (a && e.inlineContent && !e.type.allowsMarkType(a)) return !1;
			if (!e.isText && !e.marks.length) return;
			let n = Math.max(r, t), c = Math.min(i, t + e.nodeSize), l = c - n;
			o += l, s.push(...e.marks.map((e) => ({
				mark: e,
				from: n,
				to: c
			})));
		});
	}), o === 0) return !1;
	let c = s.filter((e) => !a || a.name === e.mark.type.name).filter((e) => Ec(e.mark.attrs, n, { strict: !1 })).reduce((e, t) => e + t.to - t.from, 0), l = s.filter((e) => !a || e.mark.type !== a && e.mark.type.excludes(a)).reduce((e, t) => e + t.to - t.from, 0);
	return (c > 0 ? c + l : c) >= o;
}
function Wl(e, t) {
	let { nodeExtensions: n } = Ml(t), r = n.find((t) => t.name === e);
	if (!r) return !1;
	let i = jl(kl(r, "group", {
		name: r.name,
		options: r.options,
		storage: r.storage
	}));
	return typeof i == "string" && i.split(" ").includes("list");
}
function Gl(e, { checkChildren: t = !0, ignoreWhitespace: n = !1 } = {}) {
	if (n) {
		if (e.type.name === "hardBreak") return !0;
		if (e.isText) return !/\S/.test(e.text ?? "");
	}
	if (e.isText) return !e.text;
	if (e.isAtom || e.isLeaf) return !1;
	if (e.content.childCount === 0) return !0;
	if (t) {
		let r = !0;
		return e.content.forEach((e) => {
			r !== !1 && (Gl(e, {
				ignoreWhitespace: n,
				checkChildren: t
			}) || (r = !1));
		}), r;
	}
	return !1;
}
function Kl(e, t, n) {
	let { selection: r } = t, i = null;
	if (Nc(r) && (i = r.$cursor), i) {
		let t = e.storedMarks ?? i.marks();
		return i.parent.type.allowsMarkType(n) && (!!n.isInSet(t) || !t.some((e) => e.type.excludes(n)));
	}
	let { ranges: a } = r;
	return a.some(({ $from: t, $to: r }) => {
		let i = t.depth === 0 && e.doc.inlineContent && e.doc.type.allowsMarkType(n);
		return e.doc.nodesBetween(t.pos, r.pos, (e, t, r) => {
			if (i) return !1;
			if (e.isInline) {
				let t = !r || r.type.allowsMarkType(n), a = !!n.isInSet(e.marks) || !e.marks.some((e) => e.type.excludes(n));
				i = t && a;
			}
			return !i;
		}), i;
	});
}
var ql = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let { selection: a } = n, { empty: o, ranges: s } = a, c = Ac(e, r.schema);
	if (i) {
		if (o) {
			let e = Tl(r, c);
			n.addStoredMark(c.create({
				...e,
				...t
			}));
		} else s.forEach((e) => {
			let i = e.$from.pos, a = e.$to.pos;
			r.doc.nodesBetween(i, a, (e, r) => {
				let o = Math.max(r, i), s = Math.min(r + e.nodeSize, a);
				e.marks.find((e) => e.type === c) ? e.marks.forEach((e) => {
					c === e.type && n.addMark(o, s, c.create({
						...e.attrs,
						...t
					}));
				}) : n.addMark(o, s, c.create(t));
			});
		});
	}
	return Kl(r, n, c);
}, Jl = (e, t) => ({ tr: n }) => (n.setMeta(e, t), !0), Yl = (e, t = {}) => ({ state: n, dispatch: r, chain: i }) => {
	let a = $(e, n.schema), o;
	return n.selection.$anchor.sameParent(n.selection.$head) && (o = n.selection.$anchor.parent.attrs), a.isTextblock ? i().command(({ commands: e }) => Ar(a, {
		...o,
		...t
	})(n) ? !0 : e.clearNodes()).command(({ state: e }) => Ar(a, {
		...o,
		...t
	})(e, r)).run() : (console.warn("[tiptap warn]: Currently \"setNode()\" only supports text block nodes."), !1);
}, Xl = (e) => ({ tr: t, dispatch: n }) => {
	if (n) {
		let { doc: n } = t, r = Pc(e, 0, n.content.size), i = B.create(n, r);
		t.setSelection(i);
	}
	return !0;
}, Zl = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let { selection: a } = r, o, s;
	return typeof t == "number" ? (o = t, s = t) : t && "from" in t && "to" in t ? (o = t.from, s = t.to) : (o = a.from, s = a.to), i && n.doc.nodesBetween(o, s, (t, r) => {
		t.isText || n.setNodeMarkup(r, void 0, {
			...t.attrs,
			dir: e
		});
	}), !0;
}, Ql = (e) => ({ tr: t, dispatch: n }) => {
	if (n) {
		let { doc: n } = t, { from: r, to: i } = typeof e == "number" ? {
			from: e,
			to: e
		} : e, a = z.atStart(n).from, o = z.atEnd(n).to, s = Pc(r, a, o), c = Pc(i, a, o), l = z.create(n, s, c);
		t.setSelection(l);
	}
	return !0;
}, $l = (e) => ({ state: t, dispatch: n }) => Hr($(e, t.schema))(t, n);
function eu(e, t) {
	let n = e.storedMarks || e.selection.$to.parentOffset && e.selection.$from.marks();
	if (n) {
		let r = n.filter((e) => t?.includes(e.type.name));
		e.tr.ensureMarks(r);
	}
}
var tu = ({ keepMarks: e = !0 } = {}) => ({ tr: t, state: n, dispatch: r, editor: i }) => {
	let { selection: a, doc: o } = t, { $from: s, $to: c } = a, l = i.extensionManager.attributes, u = Hl(l, s.node().type.name, s.node().attrs);
	if (a instanceof B && a.node.isBlock) return !s.parentOffset || !sn(o, s.pos) ? !1 : (r && (e && eu(n, i.extensionManager.splittableMarks), t.split(s.pos).scrollIntoView()), !0);
	if (!s.parent.isBlock) return !1;
	let d = c.parentOffset === c.parent.content.size, f = s.depth === 0 ? void 0 : Yc(s.node(-1).contentMatchAt(s.indexAfter(-1))), p = d && f ? [{
		type: f,
		attrs: u
	}] : void 0, m = sn(t.doc, t.mapping.map(s.pos), 1, p);
	if (!p && !m && sn(t.doc, t.mapping.map(s.pos), 1, f ? [{ type: f }] : void 0) && (m = !0, p = f ? [{
		type: f,
		attrs: u
	}] : void 0), r) {
		if (m && (a instanceof z && t.deleteSelection(), t.split(t.mapping.map(s.pos), 1, p), f && !d && !s.parentOffset && s.parent.type !== f)) {
			let e = t.mapping.map(s.before()), n = t.doc.resolve(e);
			s.node(-1).canReplaceWith(n.index(), n.index() + 1, f) && t.setNodeMarkup(t.mapping.map(s.before()), f);
		}
		e && eu(n, i.extensionManager.splittableMarks), t.scrollIntoView();
	}
	return m;
}, nu = (e, t = {}) => ({ tr: n, state: r, dispatch: i, editor: a }) => {
	let o = $(e, r.schema), { $from: s, $to: c } = r.selection, l = r.selection.node;
	if (l && l.isBlock || s.depth < 2 || !s.sameParent(c)) return !1;
	let u = s.node(-1);
	if (u.type !== o) return !1;
	let d = a.extensionManager.attributes;
	if (s.parent.content.size === 0 && s.node(-1).childCount === s.indexAfter(-1)) {
		if (s.depth === 2 || s.node(-3).type !== o || s.index(-2) !== s.node(-2).childCount - 1) return !1;
		if (i) {
			let e = A.empty, r = s.index(-1) ? 1 : s.index(-2) ? 2 : 3;
			for (let t = s.depth - r; t >= s.depth - 3; --t) e = A.from(s.node(t).copy(e));
			let i = s.indexAfter(-1) < s.node(-2).childCount ? 1 : s.indexAfter(-2) < s.node(-3).childCount ? 2 : 3, a = {
				...Hl(d, s.node().type.name, s.node().attrs),
				...t
			}, c = o.contentMatch.defaultType?.createAndFill(a) || void 0;
			e = e.append(A.from(o.createAndFill(null, c) || void 0));
			let l = s.before(s.depth - (r - 1));
			n.replace(l, s.after(-i), new N(e, 4 - r, 0));
			let u = -1;
			n.doc.nodesBetween(l, n.doc.content.size, (e, t) => {
				if (u > -1) return !1;
				e.isTextblock && e.content.size === 0 && (u = t + 1);
			}), u > -1 && n.setSelection(z.near(n.doc.resolve(u))), n.scrollIntoView();
		}
		return !0;
	}
	let f = c.pos === s.end() ? u.contentMatchAt(0).defaultType : null, p = {
		...Hl(d, u.type.name, u.attrs),
		...t
	}, m = {
		...Hl(d, s.node().type.name, s.node().attrs),
		...t
	};
	n.delete(s.pos, c.pos);
	let h = f ? [{
		type: o,
		attrs: p
	}, {
		type: f,
		attrs: m
	}] : [{
		type: o,
		attrs: p
	}];
	if (!sn(n.doc, s.pos, 2)) return !1;
	if (i) {
		let { selection: e, storedMarks: t } = r, { splittableMarks: o } = a.extensionManager, c = t || e.$to.parentOffset && e.$from.marks();
		if (n.split(s.pos, 2, h).scrollIntoView(), !c || !i) return !0;
		let l = c.filter((e) => o.includes(e.type.name));
		n.ensureMarks(l);
	}
	return !0;
};
function ru(e) {
	return !e || e === "1" ? null : e;
}
function iu(e, t) {
	return ru(e) === ru(t);
}
var au = (e, t) => {
	let n = Ol((e) => e.type === t)(e.selection);
	if (!n) return !0;
	let r = e.doc.resolve(Math.max(0, n.pos - 1)).before(n.depth);
	if (r === void 0) return !0;
	let i = e.doc.nodeAt(r);
	return !(n.node.type === i?.type && ln(e.doc, n.pos)) || !iu(n.node.attrs.type, i?.attrs.type) || e.join(n.pos), !0;
}, ou = (e, t) => {
	let n = Ol((e) => e.type === t)(e.selection);
	if (!n) return !0;
	let r = e.doc.resolve(n.start).after(n.depth);
	if (r === void 0) return !0;
	let i = e.doc.nodeAt(r);
	return !(n.node.type === i?.type && ln(e.doc, r)) || !iu(n.node.attrs.type, i?.attrs.type) || e.join(r), !0;
};
function su(e) {
	let t = e.doc, n = t.firstChild;
	if (!n) return null;
	let r = t.resolve(1), i = t.resolve(n.nodeSize - 1);
	return z.between(r, i);
}
var cu = (e, t, n, r = {}) => ({ editor: i, tr: a, state: o, dispatch: s, chain: c, commands: l, can: u }) => {
	let { extensions: d, splittableMarks: f } = i.extensionManager, p = $(e, o.schema), m = $(t, o.schema), { selection: h, storedMarks: g } = o, { $from: _, $to: v } = h, y = _.blockRange(v), b = g || h.$to.parentOffset && h.$from.marks();
	if (!y) return !1;
	let x = Ol((e) => Wl(e.type.name, d))(h), S = h.from === 0 && h.to === o.doc.content.size, C = o.doc.content.content, w = C.length === 1 ? C[0] : null, T = S && w && Wl(w.type.name, d) ? {
		node: w,
		pos: 0,
		depth: 0
	} : null, E = x ?? T, ee = !!x && y.depth >= 1 && y.depth - x.depth <= 1, D = !!T;
	if ((ee || D) && E) {
		if (E.node.type === p) return S && D ? c().command(({ tr: e, dispatch: t }) => {
			let n = su(e);
			return n ? (e.setSelection(n), t && t(e), !0) : !1;
		}).liftListItem(m).run() : l.liftListItem(m);
		if (Wl(E.node.type.name, d) && p.validContent(E.node.content)) return c().command(() => (a.setNodeMarkup(E.pos, p), !0)).command(() => au(a, p)).command(() => ou(a, p)).run();
	}
	return !n || !b || !s ? c().command(() => u().wrapInList(p, r) ? !0 : l.clearNodes()).wrapInList(p, r).command(() => au(a, p)).command(() => ou(a, p)).run() : c().command(() => {
		let e = u().wrapInList(p, r), t = b.filter((e) => f.includes(e.type.name));
		return a.ensureMarks(t), e ? !0 : l.clearNodes();
	}).wrapInList(p, r).command(() => au(a, p)).command(() => ou(a, p)).run();
}, lu = (e, t = {}, n = {}) => ({ state: r, commands: i }) => {
	let { extendEmptyMarkRange: a = !1 } = n, o = Ac(e, r.schema);
	return Ul(r, o, t) ? i.unsetMark(o, { extendEmptyMarkRange: a }) : i.setMark(o, t);
}, uu = (e, t, n = {}) => ({ state: r, commands: i }) => {
	let a = $(e, r.schema), o = $(t, r.schema), s = cl(r, a, n), c;
	return r.selection.$anchor.sameParent(r.selection.$head) && (c = r.selection.$anchor.parent.attrs), s ? i.setNode(o, c) : i.setNode(a, {
		...c,
		...n
	});
}, du = (e, t = {}) => ({ state: n, commands: r }) => {
	let i = $(e, n.schema);
	return cl(n, i, t) ? r.lift(i) : r.wrapIn(i, t);
}, fu = () => ({ state: e, dispatch: t }) => {
	let n = e.plugins;
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r], a;
		if (i.spec.isInputRules && (a = i.getState(e))) {
			if (t) {
				let t = e.tr, n = a.transform;
				for (let e = n.steps.length - 1; e >= 0; --e) t.step(n.steps[e].invert(n.docs[e]));
				if (a.text) {
					let n = t.doc.resolve(a.from).marks();
					t.replaceWith(a.from, a.to, e.schema.text(a.text, n));
				} else t.delete(a.from, a.to);
			}
			return !0;
		}
	}
	return !1;
}, pu = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
	let { ignoreClearable: i = !1 } = e, { selection: a } = t, { empty: o, ranges: s } = a;
	if (o) return !0;
	let { nonClearableMarks: c } = r.extensionManager;
	if (n) {
		let e = Object.values(r.schema.marks).filter((e) => i || !c.includes(e.name));
		s.forEach((n) => {
			for (let r of e) t.removeMark(n.$from.pos, n.$to.pos, r);
		});
	}
	return !0;
}, mu = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let { extendEmptyMarkRange: a = !1 } = t, { selection: o } = n, s = Ac(e, r.schema), { $from: c, empty: l, ranges: u } = o;
	if (!i) return !0;
	if (l && a) {
		let { from: e, to: t } = o, r = kc(c, s, c.marks().find((e) => e.type === s)?.attrs);
		r && (e = r.from, t = r.to), n.removeMark(e, t, s);
	} else u.forEach((e) => {
		n.removeMark(e.$from.pos, e.$to.pos, s);
	});
	return n.removeStoredMark(s), !0;
}, hu = (e) => ({ tr: t, state: n, dispatch: r }) => {
	let { selection: i } = n, a, o;
	return typeof e == "number" ? (a = e, o = e) : e && "from" in e && "to" in e ? (a = e.from, o = e.to) : (a = i.from, o = i.to), r && t.doc.nodesBetween(a, o, (e, n) => {
		if (e.isText) return;
		let r = { ...e.attrs };
		delete r.dir, t.setNodeMarkup(n, void 0, r);
	}), !0;
}, gu = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let a = null, o = null, s = pl(typeof e == "string" ? e : e.name, r.schema);
	if (!s) return !1;
	s === "node" && (a = $(e, r.schema)), s === "mark" && (o = Ac(e, r.schema));
	let c = !1;
	return n.selection.ranges.forEach((e) => {
		let s = e.$from.pos, l = e.$to.pos, u, d, f, p;
		n.selection.empty ? r.doc.nodesBetween(s, l, (e, t) => {
			a && a === e.type && (c = !0, f = Math.max(t, s), p = Math.min(t + e.nodeSize, l), u = t, d = e);
		}) : r.doc.nodesBetween(s, l, (e, r) => {
			r < s && a && a === e.type && (c = !0, f = Math.max(r, s), p = Math.min(r + e.nodeSize, l), u = r, d = e), r >= s && r <= l && (a && a === e.type && (c = !0, i && n.setNodeMarkup(r, void 0, {
				...e.attrs,
				...t
			})), o && e.marks.length && e.marks.forEach((a) => {
				if (o === a.type && (c = !0, i)) {
					let i = Math.max(r, s), c = Math.min(r + e.nodeSize, l);
					n.addMark(i, c, o.create({
						...a.attrs,
						...t
					}));
				}
			}));
		}), d && (u !== void 0 && i && n.setNodeMarkup(u, void 0, {
			...d.attrs,
			...t
		}), o && d.marks.length && d.marks.forEach((e) => {
			o === e.type && i && n.addMark(f, p, o.create({
				...e.attrs,
				...t
			}));
		}));
	}), c;
}, _u = new Qn("__tiptap_decorations__"), vu = (e) => ({ tr: t, dispatch: n }) => (n && t.setMeta(_u, {
	type: "force",
	name: e
}), !0), yu = (e, t = {}) => ({ state: n, dispatch: r }) => kr($(e, n.schema), t)(n, r), bu = (e, t = {}) => ({ state: n, dispatch: r }) => Ir($(e, n.schema), t)(n, r), xu = /* @__PURE__ */ re({
	blur: () => uc,
	clearContent: () => dc,
	clearNodes: () => fc,
	command: () => pc,
	createParagraphNear: () => mc,
	cut: () => hc,
	deleteCurrentNode: () => gc,
	deleteNode: () => _c,
	deleteRange: () => vc,
	deleteSelection: () => Sc,
	enter: () => Cc,
	exitCode: () => wc,
	extendMarkRange: () => jc,
	first: () => Mc,
	focus: () => zc,
	forEach: () => Bc,
	insertContent: () => Vc,
	insertContentAt: () => Jc,
	insertDefaultBlock: () => Xc,
	joinBackward: () => $c,
	joinDown: () => Qc,
	joinForward: () => el,
	joinItemBackward: () => tl,
	joinItemForward: () => nl,
	joinTextblockBackward: () => rl,
	joinTextblockForward: () => il,
	joinUp: () => Zc,
	keyboardShortcut: () => sl,
	lift: () => ll,
	liftEmptyBlock: () => ul,
	liftListItem: () => dl,
	newlineInCode: () => fl,
	resetAttributes: () => hl,
	scrollIntoView: () => gl,
	selectAll: () => _l,
	selectNodeBackward: () => vl,
	selectNodeForward: () => yl,
	selectParentNode: () => bl,
	selectTextblockEnd: () => xl,
	selectTextblockStart: () => Sl,
	setContent: () => wl,
	setMark: () => ql,
	setMeta: () => Jl,
	setNode: () => Yl,
	setNodeSelection: () => Xl,
	setTextDirection: () => Zl,
	setTextSelection: () => Ql,
	sinkListItem: () => $l,
	splitBlock: () => tu,
	splitListItem: () => nu,
	toggleList: () => cu,
	toggleMark: () => lu,
	toggleNode: () => uu,
	toggleWrap: () => du,
	undoInputRule: () => fu,
	unsetAllMarks: () => pu,
	unsetMark: () => mu,
	unsetTextDirection: () => hu,
	updateAttributes: () => gu,
	updateDecorations: () => vu,
	wrapIn: () => yu,
	wrapInList: () => bu
});
function Su(e) {
	return Object.prototype.toString.call(e).slice(8, -1);
}
function Cu(e) {
	return Su(e) === "Object" && e.constructor === Object && Object.getPrototypeOf(e) === Object.prototype;
}
function wu(e, t) {
	let n = { ...e };
	return Cu(e) && Cu(t) && Object.keys(t).forEach((r) => {
		Cu(t[r]) && Cu(e[r]) ? n[r] = wu(e[r], t[r]) : n[r] = t[r];
	}), n;
}
var Tu = class {
	constructor(e = {}) {
		this.type = "extendable", this.parent = null, this.child = null, this.name = "", this.config = { name: this.name }, this.config = {
			...this.config,
			...e
		}, this.name = this.config.name;
	}
	get options() {
		return { ...jl(kl(this, "addOptions", { name: this.name })) };
	}
	get storage() {
		return { ...jl(kl(this, "addStorage", {
			name: this.name,
			options: this.options
		})) };
	}
	configure(e = {}) {
		let t = this.extend({
			...this.config,
			addOptions: () => wu(this.options, e)
		});
		return t.name = this.name, t.parent = this.parent, this.child = null, t;
	}
	extend(e = {}) {
		let t = new this.constructor({
			...this.config,
			...e
		});
		return t.parent = this, this.child = t, t.name = "name" in e ? e.name : t.parent.name, t;
	}
}, Eu = class e extends Tu {
	constructor(...e) {
		super(...e), this.type = "extension";
	}
	static create(t = {}) {
		let n = typeof t == "function" ? t() : t;
		return new e(n);
	}
	configure(e) {
		return super.configure(e);
	}
	extend(e) {
		let t = typeof e == "function" ? e() : e;
		return super.extend(t);
	}
};
Eu.create({
	name: "clipboardTextSerializer",
	addOptions() {
		return { blockSeparator: void 0 };
	},
	addProseMirrorPlugins() {
		return [new Yn({
			key: new Qn("clipboardTextSerializer"),
			props: { clipboardTextSerializer: () => {
				let { editor: e } = this, { state: t, schema: n } = e, { doc: r, selection: i } = t, a = Rl(n), { blockSeparator: o } = this.options, s = {
					...o === void 0 ? {} : { blockSeparator: o },
					textSerializers: a
				};
				return [...i.ranges].sort((e, t) => e.$from.pos - t.$from.pos).map(({ $from: e, $to: t }) => Ll(r, {
					from: e.pos,
					to: t.pos
				}, s)).join(o ?? "\n\n");
			} }
		})];
	}
}), Eu.create({
	name: "commands",
	addCommands() {
		return { ...xu };
	}
}), Eu.create({
	name: "delete",
	onUpdate({ transaction: e, appendedTransactions: t }) {
		var n;
		let r = () => {
			var n, r;
			if (((n = this.editor.options.coreExtensionOptions) == null || (n = n.delete) == null || (r = n.filterTransaction) == null ? void 0 : r.call(n, e)) ?? e.getMeta("y-sync$")) return;
			let i = El(e.before, [e, ...t]);
			Vl(i).forEach((t) => {
				i.mapping.mapResult(t.oldRange.from).deletedAfter && i.mapping.mapResult(t.oldRange.to).deletedBefore && i.before.nodesBetween(t.oldRange.from, t.oldRange.to, (n, r) => {
					let a = r + n.nodeSize - 2, o = t.oldRange.from <= r && a <= t.oldRange.to;
					this.editor.emit("delete", {
						type: "node",
						node: n,
						from: r,
						to: a,
						newFrom: i.mapping.map(r),
						newTo: i.mapping.map(a),
						deletedRange: t.oldRange,
						newRange: t.newRange,
						partial: !o,
						editor: this.editor,
						transaction: e,
						combinedTransform: i
					});
				});
			});
			let a = i.mapping;
			i.steps.forEach((t, n) => {
				if (t instanceof Bt) {
					let r = a.slice(n).map(t.from, -1), o = a.slice(n).map(t.to), s = a.invert().map(r, -1), c = a.invert().map(o), l = r > 0 && i.doc.nodeAt(r - 1)?.marks.some((e) => e.eq(t.mark)), u = i.doc.nodeAt(o)?.marks.some((e) => e.eq(t.mark));
					this.editor.emit("delete", {
						type: "mark",
						mark: t.mark,
						from: t.from,
						to: t.to,
						deletedRange: {
							from: s,
							to: c
						},
						newRange: {
							from: r,
							to: o
						},
						partial: !!(u || l),
						editor: this.editor,
						transaction: e,
						combinedTransform: i
					});
				}
			});
		};
		((n = this.editor.options.coreExtensionOptions) == null || (n = n.delete) == null ? void 0 : n.async) ?? !0 ? setTimeout(r, 0) : r();
	}
}), Eu.create({
	name: "drop",
	addProseMirrorPlugins() {
		return [new Yn({
			key: new Qn("tiptapDrop"),
			props: { handleDrop: (e, t, n, r) => {
				this.editor.emit("drop", {
					editor: this.editor,
					event: t,
					slice: n,
					moved: r
				});
			} }
		})];
	}
}), Eu.create({
	name: "editable",
	addProseMirrorPlugins() {
		return [new Yn({
			key: new Qn("editable"),
			props: { editable: () => this.editor.options.editable }
		})];
	}
});
var Du = new Qn("focusEvents");
Eu.create({
	name: "focusEvents",
	addProseMirrorPlugins() {
		let { editor: e } = this;
		return [new Yn({
			key: Du,
			props: { handleDOMEvents: {
				focus: (t, n) => {
					e.isFocused = !0;
					let r = e.state.tr.setMeta("focus", { event: n }).setMeta("addToHistory", !1);
					return t.dispatch(r), !1;
				},
				blur: (t, n) => {
					e.isFocused = !1;
					let r = e.state.tr.setMeta("blur", { event: n }).setMeta("addToHistory", !1);
					return t.dispatch(r), !1;
				}
			} }
		})];
	}
}), Eu.create({
	name: "keymap",
	addKeyboardShortcuts() {
		let e = () => this.editor.commands.first(({ commands: e }) => [
			() => e.undoInputRule(),
			() => e.command(({ tr: t }) => {
				let { selection: n, doc: r } = t, { empty: i, $anchor: a } = n, { pos: o, parent: s } = a, c = a.parent.isTextblock && o > 0 ? t.doc.resolve(o - 1) : a, l = c.parent.type.spec.isolating, u = a.pos - a.parentOffset, d = l && c.parent.childCount === 1 ? u === a.pos : R.atStart(r).from === o;
				return !i || !s.type.isTextblock || s.textContent.length || !d || d && a.parent.type.name === "paragraph" ? !1 : e.clearNodes();
			}),
			() => e.deleteSelection(),
			() => e.joinBackward(),
			() => e.selectNodeBackward()
		]), t = () => this.editor.commands.first(({ commands: e }) => [
			() => e.deleteSelection(),
			() => e.deleteCurrentNode(),
			() => e.joinForward(),
			() => e.selectNodeForward()
		]), n = {
			Enter: () => this.editor.commands.first(({ commands: e }) => [
				() => e.newlineInCode(),
				() => e.createParagraphNear(),
				() => e.liftEmptyBlock(),
				() => e.splitBlock()
			]),
			"Mod-Enter": () => this.editor.commands.exitCode(),
			Backspace: e,
			"Mod-Backspace": e,
			"Shift-Backspace": e,
			Delete: t,
			"Mod-Delete": t,
			"Mod-a": () => this.editor.commands.selectAll()
		}, r = { ...n }, i = {
			...n,
			"Ctrl-h": e,
			"Alt-Backspace": e,
			"Ctrl-d": t,
			"Ctrl-Alt-Backspace": t,
			"Alt-Delete": t,
			"Alt-d": t,
			"Ctrl-a": () => this.editor.commands.selectTextblockStart(),
			"Ctrl-e": () => this.editor.commands.selectTextblockEnd()
		};
		return Lc() || al() ? i : r;
	},
	addProseMirrorPlugins() {
		return [new Yn({
			key: new Qn("clearDocument"),
			appendTransaction: (e, t, n) => {
				if (e.some((e) => e.getMeta("composition"))) return;
				let r = e.some((e) => e.docChanged) && !t.doc.eq(n.doc), i = e.some((e) => e.getMeta("preventClearDocument"));
				if (!r || i) return;
				let { empty: a, from: o, to: s } = t.selection, c = R.atStart(t.doc).from, l = R.atEnd(t.doc).to;
				if (a || o !== c || s !== l || !Gl(n.doc)) return;
				let u = n.tr, d = cc({
					state: n,
					transaction: u
				}), { commands: f } = new lc({
					editor: this.editor,
					state: d
				});
				if (f.clearNodes(), u.steps.length) return u;
			}
		})];
	}
}), Eu.create({
	name: "paste",
	addProseMirrorPlugins() {
		return [new Yn({
			key: new Qn("tiptapPaste"),
			props: { handlePaste: (e, t, n) => {
				this.editor.emit("paste", {
					editor: this.editor,
					event: t,
					slice: n
				});
			} }
		})];
	}
}), Eu.create({
	name: "tabindex",
	addOptions() {
		return { value: void 0 };
	},
	addProseMirrorPlugins() {
		return [new Yn({
			key: new Qn("tabindex"),
			props: { attributes: () => !this.editor.isEditable && this.options.value === void 0 ? {} : { tabindex: this.options.value ?? "0" } }
		})];
	}
}), Eu.create({
	name: "textDirection",
	addOptions() {
		return { direction: void 0 };
	},
	addGlobalAttributes() {
		if (!this.options.direction) return [];
		let { nodeExtensions: e } = Ml(this.extensions);
		return [{
			types: e.filter((e) => e.name !== "text").map((e) => e.name),
			attributes: { dir: {
				default: this.options.direction,
				parseHTML: (e) => {
					let t = e.getAttribute("dir");
					return t && (t === "ltr" || t === "rtl" || t === "auto") ? t : this.options.direction;
				},
				renderHTML: (e) => e.dir ? { dir: e.dir } : {}
			} }
		}];
	},
	addProseMirrorPlugins() {
		return [new Yn({
			key: new Qn("textDirection"),
			props: { attributes: () => {
				let e = this.options.direction;
				return e ? { dir: e } : {};
			} }
		})];
	}
});
var Ou = class e extends Tu {
	constructor(...e) {
		super(...e), this.type = "node";
	}
	static create(t = {}) {
		let n = typeof t == "function" ? t() : t;
		return new e(n);
	}
	configure(e) {
		return super.configure(e);
	}
	extend(e) {
		let t = typeof e == "function" ? e() : e;
		return super.extend(t);
	}
}, ku = class {
	constructor(e, t, n) {
		this.isDragging = !1, this.component = e, this.editor = t.editor, this.options = {
			stopEvent: null,
			ignoreMutation: null,
			...n
		}, this.extension = t.extension, this.node = t.node, this.decorations = t.decorations, this.innerDecorations = t.innerDecorations, this.view = t.view, this.HTMLAttributes = t.HTMLAttributes, this.getPos = () => {
			try {
				return t.getPos();
			} catch {
				return;
			}
		}, this.mount();
	}
	mount() {}
	get dom() {
		return this.editor.view.dom;
	}
	get contentDOM() {
		return null;
	}
	onDragStart(e) {
		let { view: t } = this.editor, n = e.target, r = n.nodeType === 3 ? n.parentElement?.closest("[data-drag-handle]") : n.closest("[data-drag-handle]");
		if (!this.dom || this.contentDOM?.contains(n) || !r) return;
		let i = 0, a = 0;
		if (this.dom !== r) {
			let t = this.dom.getBoundingClientRect(), n = r.getBoundingClientRect(), o = e.offsetX ?? e.nativeEvent?.offsetX, s = e.offsetY ?? e.nativeEvent?.offsetY;
			i = n.x - t.x + o, a = n.y - t.y + s;
		}
		let o = this.dom.cloneNode(!0);
		try {
			let e = this.dom.getBoundingClientRect();
			o.style.width = `${Math.round(e.width)}px`, o.style.height = `${Math.round(e.height)}px`, o.style.boxSizing = "border-box", o.style.pointerEvents = "none";
		} catch {}
		let s = null;
		try {
			var c;
			s = document.createElement("div"), s.style.position = "absolute", s.style.top = "-9999px", s.style.left = "-9999px", s.style.pointerEvents = "none", s.appendChild(o), document.body.appendChild(s), (c = e.dataTransfer) == null || c.setDragImage(o, i, a);
		} finally {
			s && setTimeout(() => {
				try {
					s?.remove();
				} catch {}
			}, 0);
		}
		let l = this.getPos();
		if (typeof l != "number") return;
		let u = B.create(t.state.doc, l), d = t.state.tr.setSelection(u);
		t.dispatch(d);
	}
	stopEvent(e) {
		if (!this.dom) return !1;
		if (typeof this.options.stopEvent == "function") return this.options.stopEvent({ event: e });
		let t = e.target;
		if (!this.dom.contains(t) || this.contentDOM?.contains(t)) return !1;
		let n = e.type.startsWith("drag"), r = e.type === "dragover" || e.type === "dragenter", i = e.type === "drop";
		if (([
			"INPUT",
			"BUTTON",
			"SELECT",
			"TEXTAREA"
		].includes(t.tagName) || t.isContentEditable) && !i && !n) return !0;
		let { isEditable: a } = this.editor, { isDragging: o } = this, s = !!this.node.type.spec.draggable, c = B.isSelectable(this.node), l = e.type === "copy", u = e.type === "paste", d = e.type === "cut", f = e.type === "mousedown";
		if (!s && c && n && e.target === this.dom && e.preventDefault(), s && n && !o && e.target === this.dom) return e.preventDefault(), !1;
		if (s && a && !o && f) {
			let e = t.closest("[data-drag-handle]");
			e && (this.dom === e || this.dom.contains(e)) && (this.isDragging = !0, document.addEventListener("dragend", () => {
				this.isDragging = !1;
			}, { once: !0 }), document.addEventListener("drop", () => {
				this.isDragging = !1;
			}, { once: !0 }), document.addEventListener("mouseup", () => {
				this.isDragging = !1;
			}, { once: !0 }));
		}
		return !(o || r || i || l || u || d || f && c);
	}
	ignoreMutation(e) {
		return !this.dom || !this.contentDOM ? !0 : typeof this.options.ignoreMutation == "function" ? this.options.ignoreMutation({ mutation: e }) : this.node.isLeaf || this.node.isAtom ? !0 : e.type === "selection" || this.contentDOM.contains(e.target) && e.type === "childList" && (Lc() || Ic()) && this.editor.isFocused && [...Array.from(e.addedNodes), ...Array.from(e.removedNodes)].every((e) => e.isContentEditable) ? !1 : this.contentDOM === e.target && e.type === "attributes" || !this.contentDOM.contains(e.target);
	}
	updateAttributes(e) {
		this.editor.commands.command(({ tr: t }) => {
			let n = this.getPos();
			return typeof n == "number" && (t.setNodeMarkup(n, void 0, {
				...this.node.attrs,
				...e
			}), !0);
		});
	}
	deleteNode() {
		let e = this.getPos();
		if (typeof e != "number") return;
		let t = e + this.node.nodeSize;
		this.editor.commands.deleteRange({
			from: e,
			to: t
		});
	}
}, Au = /* @__PURE__ */ w(((t, n) => {
	n.exports = { ...e };
})), ju = /* @__PURE__ */ w(((e) => {
	var t = Au();
	function n(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var r = typeof Object.is == "function" ? Object.is : n, i = t.useState, a = t.useEffect, o = t.useLayoutEffect, s = t.useDebugValue;
	function c(e, t) {
		var n = t(), r = i({ inst: {
			value: n,
			getSnapshot: t
		} }), c = r[0].inst, u = r[1];
		return o(function() {
			c.value = n, c.getSnapshot = t, l(c) && u({ inst: c });
		}, [
			e,
			n,
			t
		]), a(function() {
			return l(c) && u({ inst: c }), e(function() {
				l(c) && u({ inst: c });
			});
		}, [e]), s(n), n;
	}
	function l(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !r(e, n);
		} catch {
			return !0;
		}
	}
	function u(e, t) {
		return t();
	}
	var d = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? u : c;
	e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? d : t.useSyncExternalStore;
})), Mu = /* @__PURE__ */ w(((e, t) => {
	t.exports = ju();
})), Nu = /* @__PURE__ */ w(((e) => {
	var t = Au();
	Mu().useSyncExternalStore, t.useRef, t.useEffect, t.useMemo, t.useDebugValue;
})), Pu = /* @__PURE__ */ w(((e, t) => {
	t.exports = Nu();
})), Fu = Mu();
Pu();
var Iu = (...e) => (t) => {
	e.forEach((e) => {
		typeof e == "function" ? e(t) : e && (e.current = t);
	});
}, Lu = ({ contentComponent: e }) => {
	let t = (0, Fu.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getServerSnapshot);
	return /* @__PURE__ */ _(g, { children: Object.values(t) });
};
function Ru() {
	let e = /* @__PURE__ */ new Set(), t = {}, n = !1, r = () => {
		!n && e.size && (n = !0, queueMicrotask(() => {
			n = !1, e.forEach((e) => e());
		}));
	};
	return {
		subscribe(t) {
			return e.add(t), () => {
				e.delete(t);
			};
		},
		getSnapshot() {
			return t;
		},
		getServerSnapshot() {
			return t;
		},
		setRenderer(e, n) {
			t = {
				...t,
				[e]: m.createPortal(n.reactElement, n.element, e)
			}, r();
		},
		removeRenderer(e) {
			let n = { ...t };
			delete n[e], t = n, r();
		}
	};
}
var zu = class extends t.Component {
	constructor(e) {
		super(e), this.editorContentRef = t.createRef();
	}
	componentDidMount() {
		this.init();
	}
	componentDidUpdate() {
		this.init();
	}
	init() {
		let e = this.props.editor;
		if (e && !e.isDestroyed && e.view.dom?.parentNode) {
			if (e.contentComponent) return;
			let t = this.editorContentRef.current;
			t.append(...e.view.dom.parentNode.childNodes), e.setOptions({ element: t }), e.contentComponent = Ru(), e.createNodeViews(), e.isEditorContentInitialized = !0, this.forceUpdate();
		}
	}
	componentWillUnmount() {
		let e = this.props.editor;
		if (e) {
			e.isEditorContentInitialized = !1, e.isDestroyed || e.view.setProps({ nodeViews: {} }), e.contentComponent = null;
			try {
				if (!e.view.dom?.parentNode) return;
				let t = document.createElement("div");
				t.append(...e.view.dom.parentNode.childNodes), e.setOptions({ element: t });
			} catch {}
		}
	}
	render() {
		let { editor: e, innerRef: t, ...n } = this.props;
		return /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _("div", {
			ref: Iu(t, this.editorContentRef),
			...n
		}), e?.contentComponent && /* @__PURE__ */ _(Lu, { contentComponent: e.contentComponent })] });
	}
}, Bu = o((e, n) => {
	let r = t.useMemo(() => Math.floor(Math.random() * 4294967295).toString(), [e.editor]);
	return t.createElement(zu, {
		key: r,
		innerRef: n,
		...e
	});
}), Vu = t.memo(Bu);
typeof window > "u" || typeof window < "u" && window.next;
var Hu = r({ editor: null });
Hu.Consumer;
var Uu = r({
	onDragStart: () => {},
	nodeViewContentChildren: void 0,
	nodeViewContentRef: () => {}
}), Wu = () => l(Uu), Gu = t.forwardRef((e, t) => {
	let { onDragStart: n } = Wu(), r = e.as || "div";
	return /* @__PURE__ */ _(r, {
		...e,
		ref: t,
		"data-node-view-wrapper": "",
		onDragStart: n,
		style: {
			whiteSpace: "normal",
			...e.style
		}
	});
});
function Ku(e) {
	return !!(typeof e == "function" && e.prototype && e.prototype.isReactComponent);
}
function qu(e) {
	return !(typeof e != "object" || !e.$$typeof || e.$$typeof.toString() !== "Symbol(react.forward_ref)" && e.$$typeof.description !== "react.forward_ref");
}
function Ju(e) {
	return !(typeof e != "object" || !e.$$typeof || e.$$typeof.toString() !== "Symbol(react.memo)" && e.$$typeof.description !== "react.memo");
}
function Yu(e) {
	if (Ku(e) || qu(e)) return !0;
	if (Ju(e)) {
		let t = e.type;
		if (t) return Ku(t) || qu(t);
	}
	return !1;
}
function Xu() {
	try {
		if (p) return parseInt(p.split(".")[0], 10) >= 19;
	} catch {}
	return !1;
}
var Zu = class {
	constructor(e, { editor: t, props: n = {}, as: r = "div", className: i = "" }) {
		this.ref = null, this.destroyed = !1, this.id = Math.floor(Math.random() * 4294967295).toString(), this.component = e, this.editor = t, this.props = n, this.element = document.createElement(r), this.element.classList.add("react-renderer"), i && this.element.classList.add(...i.split(" ")), this.editor.isEditorContentInitialized ? h(() => {
			this.render();
		}) : queueMicrotask(() => {
			this.destroyed || this.render();
		});
	}
	render() {
		var e;
		if (this.destroyed) return;
		let t = this.component, n = this.props, r = this.editor, i = Xu(), a = Yu(t), o = { ...n };
		o.ref && !(i || a) && delete o.ref, !o.ref && (i || a) && (o.ref = (e) => {
			this.ref = e;
		}), this.reactElement = /* @__PURE__ */ _(t, { ...o }), r == null || (e = r.contentComponent) == null || e.setRenderer(this.id, this);
	}
	updateProps(e = {}) {
		if (this.destroyed) return;
		let t = !1, n = Object.keys(e);
		for (let r = 0; r < n.length; r += 1) {
			let i = n[r];
			if (e[i] !== this.props[i]) {
				t = !0;
				break;
			}
		}
		t && (this.props = {
			...this.props,
			...e
		}, this.render());
	}
	destroy() {
		var e;
		this.destroyed = !0;
		let t = this.editor;
		t == null || (e = t.contentComponent) == null || e.removeRenderer(this.id);
		try {
			this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element);
		} catch {}
	}
	updateAttributes(e) {
		Object.keys(e).forEach((t) => {
			this.element.setAttribute(t, e[t]);
		});
	}
};
t.createContext({ markViewContentRef: () => {} });
function Qu(e) {
	var t;
	let n = e.getRootNode(), r = typeof n.getSelection == "function" ? n.getSelection() : (t = e.ownerDocument) == null || (t = t.defaultView) == null ? void 0 : t.getSelection();
	if (!r || r.rangeCount === 0) return null;
	let { anchorNode: i, anchorOffset: a, focusNode: o, focusOffset: s } = r;
	return !i || !o || !e.contains(i) || !e.contains(o) ? null : () => {
		try {
			r.setBaseAndExtent(i, a, o, s);
		} catch {}
	};
}
function $u(e, t, n) {
	return e.node(n) === t.node(n) && e.before(n) === t.before(n);
}
function ed(e) {
	if (!Nc(e)) return [];
	let { $from: t, $to: n } = e, r = [], i = Math.min(t.depth, n.depth);
	for (let e = 1; e <= i && $u(t, n, e); e += 1) r.push(t.before(e));
	return r;
}
var td = class {
	constructor(e) {
		this.views = /* @__PURE__ */ new WeakMap(), this.viewCount = 0, this.insideViews = /* @__PURE__ */ new Set(), this.syncQueued = !1, this.scheduleSync = () => {
			this.syncQueued || (this.syncQueued = !0, queueMicrotask(() => {
				this.syncQueued = !1, this.sync();
			}));
		}, this.handleTransaction = () => this.scheduleSync(), this.editor = e;
	}
	register(e) {
		this.viewCount === 0 && this.editor.on("transaction", this.handleTransaction), this.views.set(e.dom, e), this.viewCount += 1, this.scheduleSync();
	}
	unregister(e) {
		this.views.delete(e.dom), --this.viewCount, this.insideViews.delete(e), this.viewCount === 0 && this.editor.off("transaction", this.handleTransaction);
	}
	sync() {
		if (this.viewCount === 0 || this.editor.isDestroyed) return;
		let e = this.findInsideViews();
		this.updateViews(this.insideViews, e, !1), this.updateViews(e, this.insideViews, !0), this.insideViews = e;
	}
	updateViews(e, t, n) {
		for (let r of e) t.has(r) || r.setSelectionInside(n);
	}
	findInsideViews() {
		let e = /* @__PURE__ */ new Set();
		for (let t of ed(this.editor.state.selection)) {
			let n = this.editor.view.nodeDOM(t), r = n ? this.views.get(n) : void 0;
			r && e.add(r);
		}
		return e;
	}
}, nd = /* @__PURE__ */ new WeakMap();
function rd(e) {
	let t = nd.get(e);
	return t || (t = new td(e), nd.set(e, t)), t;
}
var id = class extends ku {
	constructor(e, t, n) {
		if (super(e, t, n), this.nodeSelected = !1, this.handlePositionUpdate = () => {
			let e = this.getPos();
			typeof e == "number" && e !== this.currentPos && (this.currentPos = e, this.renderer.updateProps({ getPos: () => this.getPos() }), typeof this.options.attrs == "function" && this.updateElementAttributes());
		}, this.cachedExtensionWithSyncedStorage = null, !this.node.isLeaf) {
			this.contentDOMElement = this.options.contentDOMElementTag ? document.createElement(this.options.contentDOMElementTag) : document.createElement(this.node.isInline ? "span" : "div"), this.contentDOMElement.dataset.nodeViewContentReact = "", this.contentDOMElement.dataset.nodeViewWrapper = "", this.contentDOMElement.style.whiteSpace = "inherit";
			let e = this.dom.querySelector("[data-node-view-content]");
			e ? e.appendChild(this.contentDOMElement) : this.dom.appendChild(this.contentDOMElement);
		}
		this.options.trackNodeViewPosition && this.editor.on("update", this.handlePositionUpdate);
	}
	get extensionWithSyncedStorage() {
		if (!this.cachedExtensionWithSyncedStorage) {
			let e = this.editor, t = this.extension;
			this.cachedExtensionWithSyncedStorage = new Proxy(t, { get(n, r, i) {
				return r === "storage" ? e.storage[t.name] ?? {} : Reflect.get(n, r, i);
			} });
		}
		return this.cachedExtensionWithSyncedStorage;
	}
	mount() {
		let e = {
			editor: this.editor,
			node: this.node,
			decorations: this.decorations,
			innerDecorations: this.innerDecorations,
			view: this.view,
			selected: !1,
			selectionInside: !1,
			extension: this.extensionWithSyncedStorage,
			HTMLAttributes: this.HTMLAttributes,
			getPos: () => this.getPos(),
			updateAttributes: (e = {}) => this.updateAttributes(e),
			deleteNode: () => this.deleteNode(),
			ref: a()
		};
		if (!this.component.displayName) {
			let e = (e) => e.charAt(0).toUpperCase() + e.substring(1);
			this.component.displayName = e(this.extension.name);
		}
		let t = {
			onDragStart: this.onDragStart.bind(this),
			nodeViewContentRef: (e) => {
				if (e && this.contentDOMElement && e.firstChild !== this.contentDOMElement) {
					e.hasAttribute("data-node-view-wrapper") && e.removeAttribute("data-node-view-wrapper");
					let t = Qu(this.contentDOMElement);
					e.appendChild(this.contentDOMElement), t?.();
				}
			}
		}, n = this.component, r = c((e) => /* @__PURE__ */ _(Uu.Provider, {
			value: t,
			children: i(n, e)
		}));
		r.displayName = "ReactNodeView";
		let o = this.node.isInline ? "span" : "div";
		this.options.as && (o = this.options.as);
		let { className: s = "" } = this.options;
		this.renderer = new Zu(r, {
			editor: this.editor,
			props: e,
			as: o,
			className: `node-${this.node.type.name} ${s}`.trim()
		}), rd(this.editor).register(this), this.updateElementAttributes(), this.currentPos = this.getPos();
	}
	get dom() {
		if (this.renderer.element.firstElementChild && !this.renderer.element.firstElementChild?.hasAttribute("data-node-view-wrapper")) throw Error("Please use the NodeViewWrapper component for your node view.");
		return this.renderer.element;
	}
	get contentDOM() {
		return this.node.isLeaf ? null : this.contentDOMElement;
	}
	update(e, t, n) {
		let r = (e) => {
			this.renderer.updateProps(e), typeof this.options.attrs == "function" && this.updateElementAttributes();
		};
		if (e.type !== this.node.type) return !1;
		if (typeof this.options.update == "function") {
			let i = this.node, a = this.decorations, o = this.innerDecorations;
			return this.node = e, this.decorations = t, this.innerDecorations = n, this.currentPos = this.getPos(), this.options.update({
				oldNode: i,
				oldDecorations: a,
				newNode: e,
				newDecorations: t,
				oldInnerDecorations: o,
				innerDecorations: n,
				updateProps: () => r({
					node: e,
					decorations: t,
					innerDecorations: n,
					extension: this.extensionWithSyncedStorage
				})
			});
		}
		if (e === this.node) return this.node = e, this.decorations = t, this.innerDecorations = n, !0;
		let i = this.getPos();
		this.node = e, this.decorations = t, this.innerDecorations = n, this.currentPos = i;
		let a = {
			node: e,
			decorations: t,
			innerDecorations: n,
			extension: this.extensionWithSyncedStorage
		};
		return this.options.trackNodeViewPosition && (a.getPos = () => this.getPos()), r(a), !0;
	}
	selectNode() {
		this.nodeSelected = !0, this.updateSelectedState(!0);
	}
	deselectNode() {
		this.nodeSelected = !1, this.updateSelectedState(this.options.selectedOnTextSelection === !0 && this.isTextSelectionInside());
	}
	setSelectionInside(e) {
		let t = this.nodeSelected || this.options.selectedOnTextSelection === !0 && e;
		this.renderer.updateProps({
			selectionInside: e,
			selected: t
		}), this.renderer.element.classList.toggle("ProseMirror-selectednode", t);
	}
	updateSelectedState(e) {
		this.renderer.updateProps({ selected: e }), this.renderer.element.classList.toggle("ProseMirror-selectednode", e);
	}
	isTextSelectionInside() {
		let e = this.getPos();
		return typeof e == "number" && ed(this.editor.state.selection).includes(e);
	}
	destroy() {
		this.renderer.destroy(), rd(this.editor).unregister(this), this.options.trackNodeViewPosition && this.editor.off("update", this.handlePositionUpdate), this.contentDOMElement = null;
	}
	updateElementAttributes() {
		if (this.options.attrs) {
			let e = {};
			if (typeof this.options.attrs == "function") {
				let t = this.editor.extensionManager.attributes, n = Il(this.node, t);
				e = this.options.attrs({
					node: this.node,
					HTMLAttributes: n
				});
			} else e = this.options.attrs;
			this.renderer.updateAttributes(e);
		}
	}
};
function ad(e, t) {
	return (n) => n.editor.contentComponent ? new id(e, n, t) : {
		dom: document.createElement("span"),
		contentDOM: null,
		update: () => !1,
		destroy: () => {},
		selectNode: () => {},
		deselectNode: () => {},
		stopEvent: () => !1,
		ignoreMutation: () => !0
	};
}
var od = r({ get editor() {
	throw Error("useTiptap must be used within a <Tiptap> provider");
} });
od.displayName = "TiptapContext";
var sd = () => l(od);
function cd({ children: e, ...t }) {
	let n = "editor" in t ? t.editor : t.instance;
	if (!n) throw Error("Tiptap: An editor instance is required. Pass a non-null `editor` prop.");
	let r = u(() => ({ editor: n }), [n]), i = u(() => ({ editor: n }), [n]);
	return /* @__PURE__ */ _(Hu.Provider, {
		value: i,
		children: /* @__PURE__ */ _(od.Provider, {
			value: r,
			children: e
		})
	});
}
cd.displayName = "Tiptap";
function ld({ ...e }) {
	let { editor: t } = sd();
	return /* @__PURE__ */ _(Vu, {
		editor: t,
		...e
	});
}
ld.displayName = "Tiptap.Content", Object.assign(cd, { Content: ld });
//#endregion
//#region resources/js/components/folders.ts
function ud(e, t = 0) {
	return (e?.props?.nodes ?? []).flatMap((e) => [{
		id: String(e.id),
		label: `${"— ".repeat(t)}${e.label}`
	}, ...ud({
		props: { nodes: e.children ?? [] },
		type: "tree"
	}, t + 1)]);
}
var dd, fd = C((() => {
	dd = "unassigned";
}));
//#endregion
//#region resources/js/components/folder-rail.tsx
function pd({ activeFolder: e, create: t, onSelect: n, tree: r }) {
	let { t: i } = (0, D.useT)("media");
	return /* @__PURE__ */ v("aside", {
		className: "flex w-56 shrink-0 flex-col gap-1",
		"data-test": "media-folders",
		children: [
			/* @__PURE__ */ _(md, {
				active: e === "",
				label: i("media.folders.all", "All files"),
				onSelect: () => n(""),
				testId: "media-folder-all"
			}),
			/* @__PURE__ */ _(md, {
				active: e === dd,
				label: i("media.folders.unassigned", "Without folder"),
				onSelect: () => n(dd),
				testId: "media-folder-unassigned"
			}),
			/* @__PURE__ */ _(D.Renderer, { nodes: [{
				...r,
				props: {
					...r.props,
					activeId: e === "unassigned" ? null : e
				}
			}] }),
			t && /* @__PURE__ */ _(D.Renderer, { nodes: [t] })
		]
	});
}
function md({ active: e, label: t, onSelect: n, testId: r }) {
	return /* @__PURE__ */ _("button", {
		"aria-current": e,
		className: (0, D.cn)("rounded-lt-sm px-2 py-1 text-start text-sm text-lt-fg hover:bg-lt-accent", e && "bg-lt-accent font-medium"),
		"data-test": r,
		onClick: n,
		type: "button",
		children: t
	});
}
var hd = C((() => {
	fd();
}));
//#endregion
//#region resources/js/components/file-type.ts
function gd(e) {
	return e.startsWith("image/") ? "image" : e.startsWith("video/") ? "video" : e.startsWith("audio/") ? "audio" : e === "application/pdf" ? "pdf" : xd.includes(e) ? "archive" : e.startsWith("text/") ? "text" : "file";
}
function _d(e) {
	return bd[gd(e)];
}
function vd(e, t) {
	let n = e.split(".").pop();
	return n !== void 0 && n !== e && /^[a-z0-9]{1,5}$/i.test(n) ? n.toLowerCase() : t.split("/").pop() ?? t;
}
function yd(e, t) {
	let n = e > 0 ? Math.min(Math.floor(Math.log10(e) / 3), Sd.length - 1) : 0;
	return new Intl.NumberFormat(t, {
		style: "unit",
		unit: Sd[n],
		maximumFractionDigits: n === 0 ? 0 : 1
	}).format(e / 1e3 ** n);
}
var bd, xd, Sd, Cd = C((() => {
	bd = {
		archive: "file-archive",
		audio: "music",
		file: "file",
		image: "image",
		pdf: "file-text",
		text: "file-text",
		video: "film"
	}, xd = [
		"application/gzip",
		"application/vnd.rar",
		"application/x-7z-compressed",
		"application/x-bzip2",
		"application/x-rar-compressed",
		"application/x-tar",
		"application/zip"
	], Sd = [
		"byte",
		"kilobyte",
		"megabyte",
		"gigabyte",
		"terabyte"
	];
}));
//#endregion
//#region resources/js/components/media-preview.tsx
function wd(e) {
	return e.mime_type.startsWith("image/");
}
function Td(e, t) {
	return e.mime_type === "application/pdf" && e.url !== null && t !== void 0;
}
function Ed(e, t, n = {}) {
	return {
		...e,
		id: `${e.id ?? "media-document"}-${t.id}-${String(n.height ?? "inline")}`,
		props: {
			...e.props,
			url: t.url ?? "",
			filename: t.name,
			...n
		}
	};
}
function Dd({ className: e, row: t, testId: n }) {
	return wd(t) && t.preview_url !== null ? /* @__PURE__ */ _("img", {
		alt: t.alt ?? t.name,
		className: (0, D.cn)("object-cover", e),
		"data-test": n,
		loading: "lazy",
		src: t.preview_url
	}) : /* @__PURE__ */ v("span", {
		className: (0, D.cn)("flex flex-col items-center justify-center gap-1 bg-lt-muted text-lt-muted-fg", e),
		"data-test": n ?? "media-thumb-icon",
		children: [/* @__PURE__ */ _(D.Icon, {
			className: "size-lt-icon-lg",
			name: _d(t.mime_type)
		}), /* @__PURE__ */ _("span", {
			className: "text-xs uppercase",
			children: vd(t.name, t.mime_type)
		})]
	});
}
function Od({ row: e, viewer: t }) {
	return Td(e, t) && t ? /* @__PURE__ */ _(D.Renderer, { nodes: [Ed(t, e)] }) : wd(e) && e.url !== null ? /* @__PURE__ */ _(D.PreviewableImage, {
		alt: e.alt ?? e.name,
		className: "h-48 w-full rounded-lt-sm border border-lt-border object-contain",
		previewable: !0,
		src: e.url,
		testId: "media-detail-preview"
	}) : /* @__PURE__ */ _(Dd, {
		className: "h-32 w-full rounded-lt-sm border border-lt-border",
		row: e,
		testId: "media-detail-preview"
	});
}
var kd = C((() => {
	O(), Cd();
}));
//#endregion
//#region resources/js/components/inspector.tsx
function Ad({ folders: e, onClose: t, onDeleted: n, remove: r, row: i, update: a, viewer: o }) {
	let { t: s } = (0, D.useT)("media"), { locale: c, timezone: l } = (0, D.useFormatContext)(), u = (0, D.useEffectDispatcher)(), d = (0, D.useOptionalModal)(), [p, m] = f(i.name), [h, y] = f(i.alt ?? ""), [b, x] = f(i.folder_id === null ? "" : String(i.folder_id)), [S, C] = f(!1), [w, T] = f(!1), E = s("media.actions.delete.label", "Delete"), ee = Td(i, o) ? o : void 0;
	async function te() {
		C(!0), await (0, D.runAction)(() => (0, D.apiFetch)(a.props.endpoint ?? "", {
			method: a.props.method ?? "post",
			ref: a.props.ref ?? "",
			body: JSON.stringify({
				media_id: i.id,
				name: p,
				alt: h === "" ? null : h,
				...e.length > 0 ? { folder_id: b === "" ? null : Number(b) } : {}
			}),
			throwOnError: !1
		}), u), C(!1);
	}
	function O() {
		if (!d) throw Error(D.MODAL_MISSING_ERROR);
		d.open(/* @__PURE__ */ _(D.ActionConfirmOverlay, {
			extraData: { media_id: i.id },
			node: {
				...r,
				props: {
					...r.props,
					confirmation: {
						title: s("media.actions.delete.confirm-title", "Delete this file?"),
						description: s("media.actions.delete.confirm-description", "This file is attached to {{count}} record(s). Deleting removes it everywhere.", { count: i.attachments_count }),
						confirmLabel: E,
						cancelLabel: null
					},
					variant: r.props.variant ?? "danger"
				}
			},
			onSuccess: n
		}));
	}
	return /* @__PURE__ */ v("div", {
		className: "flex flex-col gap-4",
		"data-test": "media-detail",
		children: [
			/* @__PURE__ */ v("div", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ _("p", {
					className: "min-w-0 flex-1 break-words text-sm font-medium text-lt-fg",
					children: i.name
				}), /* @__PURE__ */ _(D.IconButton, {
					"data-test": "media-detail-close",
					icon: "x",
					label: s("media.detail.close", "Close details"),
					onClick: t
				})]
			}),
			/* @__PURE__ */ _(Od, {
				row: i,
				viewer: ee
			}),
			ee && /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(D.Button, {
				"data-test": "media-detail-full-view",
				emphasis: "outline",
				onClick: () => T(!0),
				size: "sm",
				type: "button",
				children: s("media.detail.full-view", "Open full view")
			}), /* @__PURE__ */ _(D.Dialog, {
				open: w,
				onOpenChange: T,
				children: /* @__PURE__ */ v(D.DialogContent, {
					"aria-describedby": void 0,
					"data-test": "media-document-dialog",
					height: "max",
					width: "5xl",
					children: [/* @__PURE__ */ _(D.DialogHeader, {
						closeLabel: (0, D.translate)("lattice", "common.close", "Close"),
						title: i.name
					}), /* @__PURE__ */ _(D.Renderer, { nodes: [Ed(ee, i, {
						height: "70vh",
						maxHeight: null,
						searchable: !0,
						sidebar: !0
					})] })]
				})
			})] }),
			/* @__PURE__ */ v("dl", {
				className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm",
				children: [
					/* @__PURE__ */ _("dt", {
						className: "text-lt-muted-fg",
						children: s("media.columns.type", "Type")
					}),
					/* @__PURE__ */ _("dd", {
						className: "truncate text-lt-fg",
						children: i.mime_type
					}),
					/* @__PURE__ */ _("dt", {
						className: "text-lt-muted-fg",
						children: s("media.columns.size", "Size")
					}),
					/* @__PURE__ */ _("dd", {
						className: "text-lt-fg",
						children: yd(i.size, c)
					}),
					/* @__PURE__ */ _("dt", {
						className: "text-lt-muted-fg",
						children: s("media.columns.uploaded-at", "Uploaded")
					}),
					/* @__PURE__ */ _("dd", {
						className: "text-lt-fg",
						children: (0, D.formatDateValue)(i.created_at, {
							dateStyle: "medium",
							timeStyle: "short"
						}, {
							locale: c,
							timeZone: l
						})
					}),
					/* @__PURE__ */ _("dt", {
						className: "text-lt-muted-fg",
						children: s("media.columns.usage", "Used")
					}),
					/* @__PURE__ */ _("dd", {
						className: "text-lt-fg",
						children: i.attachments_count
					})
				]
			}),
			/* @__PURE__ */ v(D.Label, {
				className: "grid gap-1.5",
				children: [s("media.columns.name", "Name"), /* @__PURE__ */ _(D.Input, {
					"data-test": "media-detail-name",
					maxLength: 255,
					onChange: (e) => m(e.target.value),
					value: p
				})]
			}),
			/* @__PURE__ */ v(D.Label, {
				className: "grid gap-1.5",
				children: [s("media.columns.alt", "Alt text"), /* @__PURE__ */ _(D.Input, {
					"data-test": "media-detail-alt",
					maxLength: 255,
					onChange: (e) => y(e.target.value),
					value: h
				})]
			}),
			e.length > 0 && /* @__PURE__ */ v(D.Label, {
				className: "grid gap-1.5",
				children: [s("media.folders.label", "Folder"), /* @__PURE__ */ v(D.NativeSelect, {
					"data-test": "media-detail-folder",
					onChange: (e) => x(e.target.value),
					value: b,
					children: [/* @__PURE__ */ _("option", {
						value: "",
						children: s("media.folders.none", "No folder")
					}), e.map((e) => /* @__PURE__ */ _("option", {
						value: e.id,
						children: e.label
					}, e.id))]
				})]
			}),
			/* @__PURE__ */ v("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ _(D.Button, {
						"data-test": "media-detail-save",
						disabled: S || p.trim() === "",
						onClick: () => void te(),
						type: "button",
						variant: "primary",
						children: s("media.detail.save", "Save")
					}),
					i.url !== null && /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(D.Button, {
						asChild: !0,
						emphasis: "outline",
						size: "sm",
						children: /* @__PURE__ */ v("a", {
							"data-test": "media-detail-download",
							download: i.name,
							href: i.url,
							rel: "noreferrer",
							target: "_blank",
							children: [/* @__PURE__ */ _(D.Icon, {
								"aria-hidden": "true",
								name: "download"
							}), s("media.detail.download", "Download")]
						})
					}), /* @__PURE__ */ _(D.CopyButton, {
						label: s("media.detail.url", "URL"),
						testId: "media-detail-copy-url",
						value: i.url
					})] }),
					/* @__PURE__ */ _(D.IconButton, {
						className: "ms-auto text-lt-danger",
						"data-test": "media-detail-delete",
						disabled: S,
						icon: "trash-2",
						label: E,
						onClick: O
					})
				]
			})
		]
	});
}
function jd({ rows: e }) {
	let { t } = (0, D.useT)("media"), { locale: n } = (0, D.useFormatContext)(), r = e.reduce((e, t) => e + t.size, 0);
	return /* @__PURE__ */ v("div", {
		className: "flex flex-col gap-2 text-sm",
		"data-test": "media-selection-summary",
		children: [/* @__PURE__ */ _("p", {
			className: "font-medium text-lt-fg",
			children: t("media.library.selected", "{{count}} selected", { count: e.length })
		}), /* @__PURE__ */ _("p", {
			className: "text-lt-muted-fg",
			children: yd(r, n)
		})]
	});
}
var Md = C((() => {
	O(), Cd(), kd();
}));
//#endregion
//#region resources/js/components/library-toolbar.tsx
function Nd(e) {
	let [t, n] = e.split(":");
	return t === void 0 || t === "" || n === void 0 ? [] : [{
		direction: n === "desc" ? "desc" : "asc",
		key: t
	}];
}
function Pd({ accept: e, defaultSearch: t, onFiles: n, onSearch: r, onSortChange: i, onTypeChange: a, onViewChange: o, sort: s, sortableKeys: c, uploadLabel: l, view: u }) {
	let { t: f } = (0, D.useT)("media"), p = d(null), m = [
		{
			key: "name",
			label: f("media.sort.name-asc", "Name A–Z"),
			value: "name:asc"
		},
		{
			key: "name",
			label: f("media.sort.name-desc", "Name Z–A"),
			value: "name:desc"
		},
		{
			key: "size",
			label: f("media.sort.size-desc", "Largest first"),
			value: "size:desc"
		},
		{
			key: "size",
			label: f("media.sort.size-asc", "Smallest first"),
			value: "size:asc"
		},
		{
			key: "created_at",
			label: f("media.sort.oldest", "Oldest first"),
			value: "created_at:asc"
		}
	].filter((e) => c.includes(e.key));
	return /* @__PURE__ */ v("div", {
		className: "flex flex-wrap items-center gap-3",
		children: [
			/* @__PURE__ */ _(D.Input, {
				className: "max-w-xs",
				"data-test": "media-search",
				defaultValue: t,
				onChange: (e) => r(e.target.value),
				placeholder: f("media.library.search", "Search media"),
				type: "search"
			}),
			/* @__PURE__ */ v(D.NativeSelect, {
				"aria-label": f("media.filters.type.label", "Type"),
				className: "max-w-40",
				"data-test": "media-type-filter",
				defaultValue: "",
				onChange: (e) => a(e.target.value),
				children: [
					/* @__PURE__ */ _("option", {
						value: "",
						children: f("media.filters.type.all", "All types")
					}),
					/* @__PURE__ */ _("option", {
						value: "image",
						children: f("media.filters.type.image", "Images")
					}),
					/* @__PURE__ */ _("option", {
						value: "video",
						children: f("media.filters.type.video", "Video")
					}),
					/* @__PURE__ */ _("option", {
						value: "audio",
						children: f("media.filters.type.audio", "Audio")
					}),
					/* @__PURE__ */ _("option", {
						value: "document",
						children: f("media.filters.type.document", "Documents")
					})
				]
			}),
			m.length > 0 && /* @__PURE__ */ v(D.NativeSelect, {
				"aria-label": f("media.sort.label", "Sort by"),
				className: "max-w-44",
				"data-test": "media-sort",
				onChange: (e) => i(e.target.value),
				value: s,
				children: [/* @__PURE__ */ _("option", {
					value: "",
					children: f("media.sort.newest", "Newest first")
				}), m.map((e) => /* @__PURE__ */ _("option", {
					value: e.value,
					children: e.label
				}, e.value))]
			}),
			o && /* @__PURE__ */ _(D.SegmentedControl, {
				"aria-label": f("media.view.label", "View"),
				"data-test": "media-view",
				onValueChange: (e) => o(e === "list" ? "list" : "grid"),
				options: [{
					label: /* @__PURE__ */ v("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ _(D.Icon, {
							className: "size-lt-icon-sm",
							name: "layout-grid"
						}), f("media.view.grid", "Grid")]
					}),
					value: "grid"
				}, {
					label: /* @__PURE__ */ v("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ _(D.Icon, {
							className: "size-lt-icon-sm",
							name: "list"
						}), f("media.view.list", "List")]
					}),
					value: "list"
				}],
				value: u
			}),
			n && /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(D.Button, {
				className: "ms-auto",
				"data-test": "media-upload-button",
				onClick: () => p.current?.click(),
				type: "button",
				variant: "primary",
				children: l
			}), /* @__PURE__ */ _("input", {
				accept: e ?? void 0,
				"aria-label": l,
				className: "sr-only",
				"data-test": "media-upload-input",
				multiple: !0,
				onChange: (e) => {
					n(e.target.files), e.target.value = "";
				},
				ref: p,
				type: "file"
			})] })
		]
	});
}
var Fd = C((() => {
	O();
}));
//#endregion
//#region resources/js/components/media-grid.tsx
function Id({ row: e }) {
	let { t } = (0, D.useT)("media");
	return e.url === null ? null : /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _("a", {
		className: (0, D.cn)((0, D.iconButtonVariants)(), "bg-lt-surface"),
		"data-test": "media-download",
		download: e.name,
		href: e.url,
		"aria-label": t("media.detail.download", "Download"),
		rel: "noreferrer",
		target: "_blank",
		children: /* @__PURE__ */ _(D.Icon, {
			"aria-hidden": "true",
			className: "size-lt-icon-md",
			name: "download"
		})
	}), /* @__PURE__ */ _(D.CopyButton, {
		className: "bg-lt-surface",
		iconOnly: !0,
		label: t("media.detail.url", "URL"),
		testId: "media-copy-url",
		value: e.url
	})] });
}
function Ld({ activeId: e, isSelected: t, onActivate: n, onToggle: r, reloading: i, rows: a }) {
	let { t: o } = (0, D.useT)("media"), { locale: s, timezone: c } = (0, D.useFormatContext)();
	return /* @__PURE__ */ _("ul", {
		"aria-busy": i,
		className: (0, D.cn)("grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5", i && "opacity-60"),
		"data-test": "media-grid",
		children: a.map((i, a) => /* @__PURE__ */ v("li", {
			className: "group relative",
			children: [
				/* @__PURE__ */ v("button", {
					"aria-current": e === i.id,
					className: (0, D.cn)("flex w-full flex-col overflow-hidden rounded-lt-sm border border-lt-border bg-lt-surface text-left", (t(i) || e === i.id) && "ring-[length:var(--lt-ring-width)] ring-lt-ring"),
					"data-test": "media-card",
					onClick: (e) => n(i, a, e.shiftKey),
					type: "button",
					children: [/* @__PURE__ */ _(Dd, {
						className: "aspect-square w-full",
						row: i
					}), /* @__PURE__ */ v("span", {
						className: "flex flex-col gap-0.5 px-2 py-1.5",
						children: [/* @__PURE__ */ _("span", {
							className: "truncate text-sm text-lt-fg",
							children: i.name
						}), /* @__PURE__ */ _("span", {
							className: "truncate text-xs text-lt-muted-fg",
							"data-test": "media-card-meta",
							children: [
								vd(i.name, i.mime_type).toUpperCase(),
								yd(i.size, s),
								(0, D.formatDateValue)(i.created_at, {
									dateStyle: "medium",
									timeStyle: null
								}, {
									locale: s,
									timeZone: c
								})
							].join(" · ")
						})]
					})]
				}),
				/* @__PURE__ */ _(D.Checkbox, {
					"aria-label": o("media.library.select", "Select {{name}}", { name: i.name }),
					checked: t(i),
					className: "absolute left-2 top-2 bg-lt-surface",
					"data-test": "media-card-select",
					onClick: (e) => r(i, a, e.shiftKey)
				}),
				/* @__PURE__ */ _("span", {
					className: "absolute right-2 top-2 hidden gap-1 group-focus-within:flex group-hover:flex",
					children: /* @__PURE__ */ _(Id, { row: i })
				})
			]
		}, i.id))
	});
}
var Rd = C((() => {
	O(), Cd(), kd();
}));
//#endregion
//#region resources/js/components/media-list.tsx
function zd({ activeId: e, isSelected: t, onActivate: n, onToggle: r, reloading: i, rows: a }) {
	let { t: o } = (0, D.useT)("media"), { locale: s, timezone: c } = (0, D.useFormatContext)();
	return /* @__PURE__ */ _("ul", {
		"aria-busy": i,
		className: (0, D.cn)("divide-y divide-lt-border rounded-lt-sm border border-lt-border transition-opacity", i && "opacity-60"),
		"data-test": "media-list",
		children: a.map((i, a) => /* @__PURE__ */ v("li", {
			className: (0, D.cn)("group flex items-center gap-3 bg-lt-surface px-3 py-2", e === i.id && "bg-lt-accent"),
			children: [
				/* @__PURE__ */ _(D.Checkbox, {
					"aria-label": o("media.library.select", "Select {{name}}", { name: i.name }),
					checked: t(i),
					"data-test": "media-card-select",
					onClick: (e) => r(i, a, e.shiftKey)
				}),
				/* @__PURE__ */ v("button", {
					"aria-current": e === i.id,
					className: "flex min-w-0 flex-1 items-center gap-3 text-left",
					"data-test": "media-card",
					onClick: (e) => n(i, a, e.shiftKey),
					type: "button",
					children: [
						/* @__PURE__ */ _(Dd, {
							className: "size-10 shrink-0 rounded-lt-xs",
							row: i
						}),
						/* @__PURE__ */ _("span", {
							className: "min-w-0 flex-1 truncate text-sm text-lt-fg",
							children: i.name
						}),
						/* @__PURE__ */ _("span", {
							className: "hidden w-20 shrink-0 text-xs uppercase text-lt-muted-fg sm:block",
							children: vd(i.name, i.mime_type)
						}),
						/* @__PURE__ */ _("span", {
							className: "hidden w-24 shrink-0 text-end text-xs text-lt-muted-fg sm:block",
							children: yd(i.size, s)
						}),
						/* @__PURE__ */ _("span", {
							className: "hidden w-28 shrink-0 text-end text-xs text-lt-muted-fg md:block",
							children: (0, D.formatDateValue)(i.created_at, {
								dateStyle: "medium",
								timeStyle: null
							}, {
								locale: s,
								timeZone: c
							})
						})
					]
				}),
				/* @__PURE__ */ _("span", {
					className: "flex shrink-0 gap-1",
					children: /* @__PURE__ */ _(Id, { row: i })
				})
			]
		}, i.id))
	});
}
var Bd = C((() => {
	O(), Cd(), Rd(), kd();
}));
//#endregion
//#region resources/js/components/upload-list.tsx
function Vd({ uploads: e, retry: t, dismiss: n }) {
	let { t: r } = (0, D.useT)("media");
	return e.length === 0 ? null : /* @__PURE__ */ _("ul", {
		className: "flex flex-wrap gap-2",
		children: e.map((e) => /* @__PURE__ */ v("li", {
			className: "flex max-w-64 items-center gap-2 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1 text-sm",
			children: [/* @__PURE__ */ v("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ _("span", {
					className: "block truncate text-lt-fg",
					children: e.name
				}), e.status === "error" && /* @__PURE__ */ _("span", {
					className: "block truncate text-xs text-lt-danger",
					"data-test": "media-upload-reason",
					children: e.reason ?? r("media.library.upload-failed", "Upload failed")
				})]
			}), e.status === "error" ? /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(D.IconButton, {
				"data-test": "media-upload-retry",
				icon: "rotate-ccw",
				label: r("media.library.upload-retry", "Retry {{name}}", { name: e.name }),
				onClick: () => t(e)
			}), /* @__PURE__ */ _(D.IconButton, {
				"data-test": "media-upload-dismiss",
				icon: "x",
				label: r("media.library.upload-dismiss", "Dismiss {{name}}", { name: e.name }),
				onClick: () => n(e.id)
			})] }) : /* @__PURE__ */ _("span", {
				className: "text-lt-muted-fg",
				children: `${e.progress}%`
			})]
		}, e.id))
	});
}
var Hd = C((() => {
	O();
}));
//#endregion
//#region resources/js/components/use-media-upload.ts
function Ud({ body: e }, t) {
	return e.errors?.[`files.${t}`]?.[0] ?? e.message;
}
function Wd({ endpoint: e, folder: t = "", ref: n, signed: r, onUploaded: i }) {
	let a = (0, D.useEffectDispatcher)(), { t: o } = (0, D.useT)("media"), [s, c] = f([]);
	function l(e, t) {
		c((n) => n.map((n) => n.id === e ? {
			...n,
			...t
		} : n));
	}
	function u(e) {
		c((t) => t.filter((t) => t.id !== e));
	}
	function d(e, t, n) {
		if (t.ok) {
			u(e.id);
			return;
		}
		l(e.id, {
			status: "error",
			reason: Ud(t, n)
		});
	}
	async function p(e) {
		let t = {}, n;
		return {
			ok: await (0, D.runAction)(async () => {
				let n = await e();
				return t = await n.clone().json().catch(() => ({})), n;
			}, (e) => {
				n = e.find((e) => e.type === "reload-component"), a(e.filter((e) => e.type !== "toast" && e.type !== "reload-component"));
			}),
			body: t,
			reload: n
		};
	}
	async function m(r) {
		let i = new FormData();
		i.append("files[]", r.file), t !== "" && i.append("folder_id", t);
		let a = await p(() => (0, D.xhrTransfer)({
			url: e,
			method: "POST",
			body: i,
			headers: (0, D.withHeaders)(n, {
				Accept: "application/json",
				"X-Requested-With": "XMLHttpRequest",
				"X-XSRF-TOKEN": (0, D.xsrfToken)()
			}),
			onProgress: (e) => l(r.id, { progress: e })
		}));
		return d(r, a, 0), {
			ok: a.ok,
			reload: a.reload,
			media: a.body.data?.media
		};
	}
	async function h(t) {
		let r = await p(() => (0, D.requestSignedUpload)(e, {
			ref: n,
			target: "files",
			filename: t.file.name,
			contentType: t.file.type
		}));
		if (!r.ok) return d(t, r, 0), null;
		let i = r.body;
		return (await (0, D.xhrTransfer)({
			url: i.url,
			method: i.method.toUpperCase(),
			body: t.file,
			headers: i.headers,
			onProgress: (e) => l(t.id, { progress: e })
		}).catch(() => null))?.ok === !0 ? i.key : (d(t, {
			ok: !1,
			body: {}
		}, 0), null);
	}
	async function g(r) {
		let i = await Promise.all(r.map(h)), a = i.filter((e) => e !== null);
		if (a.length === 0) return r.map(() => ({ ok: !1 }));
		let o = await p(() => (0, D.apiFetch)(e, {
			method: "POST",
			ref: n,
			body: JSON.stringify({
				files: a,
				...t === "" ? {} : { folder_id: t }
			}),
			throwOnError: !1
		}));
		return r.filter((e, t) => i[t] !== null).forEach((e, t) => d(e, o, t)), i.map((e) => ({
			ok: e !== null && o.ok,
			reload: o.reload,
			media: e !== null && o.ok ? o.body.data?.media : void 0
		}));
	}
	async function _(e) {
		let t = r ? await g(e) : await Promise.all(e.map(m)), n = t.filter((e) => e.ok).length;
		if (n === 0) return;
		let s = t.find((e) => e.reload)?.reload;
		a([{
			type: "toast",
			props: { message: o("media.library.uploaded", "{{count}} file(s) uploaded", { count: n }) }
		}, ...s ? [s] : []]);
		let c = [...new Map(t.filter((e) => e.ok).flatMap((e) => e.media ?? []).map((e) => [e.id, e])).values()];
		c.length > 0 && i?.(c);
	}
	function v(t) {
		let n = Array.from(t ?? []);
		if (n.length === 0 || e === "") return;
		let r = n.map((e) => ({
			id: crypto.randomUUID(),
			name: e.name,
			status: "uploading",
			progress: 0,
			file: e
		}));
		c((e) => [...e, ...r]), _(r);
	}
	function y(e) {
		l(e.id, {
			status: "uploading",
			progress: 0,
			reason: void 0
		}), _([e]);
	}
	return {
		uploads: s,
		addFiles: v,
		retry: y,
		dismiss: u
	};
}
var Gd = C((() => {
	O();
}));
//#endregion
//#region resources/js/components/library-view.tsx
function Kd(e, t) {
	return e.schema?.find((e) => e.key === t);
}
function qd({ node: e, pick: t }) {
	let { t: n } = (0, D.useT)("media"), r = e.props ?? {}, i = e.schema?.find((e) => e.type === "table") ?? { type: "table" }, a = (0, D.useTable)(i), o = a.rows, s = (0, D.useTableSelection)(o.map((e) => String(e.id))), c = (0, D.getBulkActionNodes)(i.props?.bulkActions), l = Kd(e, "media-upload"), u = Kd(e, "media-update"), p = Kd(e, "media-delete"), m = e.schema?.find((e) => e.key === "media-pdf"), h = e.schema?.find((e) => e.type === "tree"), g = Kd(e, "media-folder-create"), [y, b] = f(""), { uploads: x, addFiles: S, retry: C, dismiss: w } = Wd({
		endpoint: l?.props.endpoint ?? "",
		folder: y === "unassigned" ? "" : y,
		ref: l?.props.ref ?? "",
		signed: r.signed
	}), [T, E] = (0, D.usePersistentState)("lattice:media:view", "grid"), [ee, te] = f(""), [O, ne] = f(null), [re, k] = f(!1), ie = d(null), ae = (0, D.useMediaQuery)(Zd, !0), oe = l?.props.label ?? n("media.actions.upload.label", "Upload"), se = a.processing && a.hasLoaded, A = (0, D.useDebouncedCallback)((e) => a.setSearch(e), Xd), ce = t === void 0 && r.inspector !== !1 && u !== void 0 && p !== void 0, j = ce ? o.find((e) => e.id === O) ?? null : null, le = o.filter((e) => s.isSelected(String(e.id))), M = ae || j === null, ue = a.columns.filter((e) => e.props.sortable === !0).map((e) => e.key);
	function N(e) {
		b(e), ne(null), a.setTableFilter("folder", e === "" ? null : { value: e });
	}
	(0, D.useWindowEvent)(D.LATTICE_EVENT.treeActivate, (e) => {
		let t = e.detail;
		h !== void 0 && t.component === (0, D.nodeIdentity)(h) && N(t.nodeId);
	});
	function de(e) {
		te(e), a.setSorts(Nd(e));
	}
	function fe(e, n, r) {
		if (t) {
			pe(e, n, r);
			return;
		}
		ne(e.id), ie.current = n;
	}
	function pe(e, n, r) {
		let i = String(e.id), a = s.isSelected(i);
		if (t && !t.multiple) {
			if (s.clear(), ie.current = n, a) return;
			s.toggle(i);
			return;
		}
		if (r && ie.current !== null) {
			me(ie.current, n);
			return;
		}
		ie.current = n, !(t?.max !== void 0 && !a && s.selectedKeys.length >= t.max) && s.toggle(i);
	}
	function me(e, n) {
		let [r, i] = e <= n ? [e, n] : [n, e], a = s.selectedKeys.length;
		for (let e of o.slice(r, i + 1)) {
			let n = String(e.id);
			if (!s.isSelected(n)) {
				if (t?.max !== void 0 && a >= t.max) return;
				s.toggle(n), a += 1;
			}
		}
	}
	let he = {
		activeId: j?.id ?? null,
		isSelected: (e) => s.isSelected(String(e.id)),
		onActivate: fe,
		onToggle: pe,
		reloading: se,
		rows: o
	}, ge = j !== null && u && p ? /* @__PURE__ */ _(Ad, {
		onClose: () => ne(null),
		onDeleted: () => ne(null),
		folders: ud(h),
		remove: p,
		row: j,
		update: u,
		viewer: m
	}, j.id) : le.length > 1 ? /* @__PURE__ */ _(jd, { rows: le }) : /* @__PURE__ */ _("p", {
		className: "text-sm text-lt-muted-fg",
		"data-test": "media-inspector-empty",
		children: n("media.detail.empty", "Select a file to see its details.")
	});
	return /* @__PURE__ */ v("div", {
		className: (0, D.cn)("flex flex-col gap-4 rounded-lt-sm border border-dashed border-transparent", re && "border-lt-primary"),
		"data-test": "media-library",
		onDragLeave: (e) => {
			e.currentTarget.contains(e.relatedTarget) || k(!1);
		},
		onDragOver: (e) => {
			e.preventDefault(), M && k(!0);
		},
		onDrop: (e) => {
			e.preventDefault(), k(!1), M && S(e.dataTransfer.files);
		},
		children: [
			/* @__PURE__ */ _(Pd, {
				accept: r.accept,
				defaultSearch: a.search,
				onFiles: l?.props.endpoint ? S : null,
				onSearch: A,
				onSortChange: de,
				onTypeChange: (e) => a.setTableFilter("type", { value: e }),
				onViewChange: E,
				sort: ee,
				sortableKeys: ue,
				uploadLabel: oe,
				view: T
			}),
			/* @__PURE__ */ _(Vd, {
				dismiss: w,
				retry: C,
				uploads: x
			}),
			/* @__PURE__ */ v("div", {
				className: "flex items-start gap-4",
				children: [
					h && /* @__PURE__ */ _(pd, {
						activeFolder: y,
						create: g,
						onSelect: N,
						tree: h
					}),
					/* @__PURE__ */ v("div", {
						className: "min-w-0 flex-1",
						children: [o.length === 0 && a.hasLoaded ? /* @__PURE__ */ _("p", {
							className: "py-12 text-center text-sm text-lt-muted-fg",
							"data-test": "media-empty",
							children: a.search !== "" || Object.keys(a.tableFilters).length > 0 ? n("media.library.no-results", "No media matches your search.") : n("media.library.empty", "No media yet. Drop files anywhere to upload.")
						}) : _(T === "list" ? zd : Ld, { ...he }), /* @__PURE__ */ _("div", { ref: a.infiniteLoaderRef })]
					}),
					ce && ae && /* @__PURE__ */ _("aside", {
						className: "w-80 shrink-0 rounded-lt-sm border border-lt-border bg-lt-surface p-4",
						"data-test": "media-inspector",
						children: ge
					})
				]
			}),
			ce && !ae && /* @__PURE__ */ _(D.Dialog, {
				open: j !== null,
				onOpenChange: () => ne(null),
				children: /* @__PURE__ */ v(D.DialogContent, {
					"aria-describedby": void 0,
					"data-test": "media-inspector",
					placement: "end",
					width: "md",
					children: [/* @__PURE__ */ _(D.DialogHeader, {
						closeLabel: (0, D.translate)("lattice", "common.close", "Close"),
						title: j?.name ?? ""
					}), ge]
				})
			}),
			t ? /* @__PURE__ */ v("div", {
				className: "flex items-center justify-end gap-3 border-t border-lt-border pt-3",
				children: [t.max !== void 0 && /* @__PURE__ */ _("span", {
					className: (0, D.cn)("text-sm text-lt-muted-fg", s.selectedKeys.length >= t.max && "text-lt-danger"),
					"data-test": "media-pick-counter",
					children: n("media.picker.selected-of-max", "{{count}}/{{max}} selected", {
						count: s.selectedKeys.length,
						max: t.max
					})
				}), /* @__PURE__ */ _(D.Button, {
					"data-test": "media-pick-confirm",
					disabled: !s.active,
					onClick: () => t.onConfirm(le),
					type: "button",
					variant: "primary",
					children: n("media.picker.confirm", "Select {{count}} item(s)", { count: s.selectedKeys.length })
				})]
			}) : c.length > 0 && s.active && /* @__PURE__ */ _(Jd, {
				actions: c,
				onDone: s.clear,
				selectedKeys: s.selectedKeys
			})
		]
	});
}
function Jd({ actions: e, selectedKeys: t, onDone: n }) {
	let { t: r } = (0, D.useT)("media");
	return /* @__PURE__ */ v("div", {
		className: "sticky bottom-0 z-lt-sticky flex items-center justify-between gap-3 rounded-lt-sm border border-lt-border bg-lt-surface px-4 py-3 text-sm shadow-lt-md",
		children: [/* @__PURE__ */ _("span", { children: r("media.library.selected", "{{count}} selected", { count: t.length }) }), /* @__PURE__ */ _("span", {
			className: "flex items-center gap-2",
			children: e.map((e) => /* @__PURE__ */ _(Yd, {
				action: e,
				onDone: n,
				selectedKeys: t
			}, (0, D.nodeIdentity)(e)))
		})]
	});
}
function Yd({ action: e, selectedKeys: t, onDone: n }) {
	let { processing: r, requestSubmit: i } = (0, D.useAction)(e, {
		extraData: () => ({ selected: t }),
		onSuccess: n
	});
	return /* @__PURE__ */ _(D.Button, {
		"data-test": (0, D.prefixedNodeTestId)("media-bulk", e),
		disabled: r,
		emphasis: e.props.emphasis ?? "solid",
		onClick: i,
		type: "button",
		variant: e.props.variant ?? "secondary",
		children: e.props.label
	});
}
var Xd, Zd, Qd = C((() => {
	O(), hd(), fd(), Md(), Fd(), Rd(), Bd(), Hd(), Gd(), Xd = 300, Zd = "(min-width: 64rem)";
})), $d = /* @__PURE__ */ T({ default: () => ef });
function ef({ editor: e, library: t }) {
	let { t: n } = (0, D.useT)("media"), r = (0, D.useEmbeddedModal)();
	if (!r) throw Error(D.MODAL_MISSING_ERROR);
	return /* @__PURE__ */ _(D.Dialog, {
		open: r.open,
		onOpenChange: r.onOpenChange,
		children: /* @__PURE__ */ v(D.DialogContent, {
			"aria-describedby": void 0,
			className: "flex flex-col gap-5",
			"data-test": "editor-media-image-dialog",
			onCloseAutoFocus: r.onExited,
			width: "3xl",
			children: [/* @__PURE__ */ _(D.DialogHeader, {
				closeLabel: (0, D.translate)("lattice", "common.close", "Close"),
				title: n("media.picker.heading", "Choose media")
			}), /* @__PURE__ */ _(qd, {
				node: t,
				pick: {
					multiple: !0,
					onConfirm: (t) => {
						e.chain().focus().insertContent(t.map((e) => ({
							type: "mediaImage",
							attrs: {
								id: e.id,
								url: e.url,
								mediaAlt: e.alt
							}
						}))).run(), r.onOpenChange(!1);
					}
				}
			})]
		})
	});
}
var tf = C((() => {
	O(), Qd();
}));
//#endregion
//#region resources/js/rich-editor/media-image.tsx
O();
var nf = s(() => Promise.resolve().then(() => (tf(), $d)));
function rf({ editor: e, extension: t, node: n, selected: r, updateAttributes: i }) {
	let { t: a } = (0, D.useT)("media"), o = t.options.conversions, s = n.attrs.url, c = n.attrs.alt ?? n.attrs.mediaAlt ?? "";
	return /* @__PURE__ */ v(Gu, {
		className: "flex flex-col gap-2",
		"data-test": "editor-media-image",
		children: [s ? /* @__PURE__ */ _("img", {
			alt: c,
			className: (0, D.cn)("max-w-full rounded-lt-sm", r && "ring-2 ring-lt-ring"),
			src: s
		}) : /* @__PURE__ */ _("div", {
			className: "rounded-lt-sm border border-dashed border-lt-border px-3 py-2 text-sm text-lt-fg-muted",
			"data-test": "editor-media-image-missing",
			children: a("media.editor.missing", "Missing media")
		}), r && e.isEditable && /* @__PURE__ */ v("div", {
			className: "flex items-center gap-2",
			"data-test": "editor-media-image-controls",
			children: [/* @__PURE__ */ _(D.Input, {
				"aria-label": a("media.editor.alt", "Alt text"),
				onChange: (e) => i({ alt: e.target.value === "" ? null : e.target.value }),
				placeholder: a("media.editor.alt", "Alt text"),
				value: n.attrs.alt ?? ""
			}), o.length > 0 && /* @__PURE__ */ v(D.NativeSelect, {
				"aria-label": a("media.editor.size", "Size"),
				onChange: (e) => i({ conversion: e.target.value === "" ? null : e.target.value }),
				value: n.attrs.conversion ?? "",
				children: [/* @__PURE__ */ _("option", {
					value: "",
					children: a("media.editor.original", "Original")
				}), o.map((e) => /* @__PURE__ */ _("option", {
					value: e,
					children: e
				}, e))]
			})]
		})]
	});
}
var af = Ou.create({
	name: "mediaImage",
	group: "block",
	atom: !0,
	draggable: !0,
	addOptions() {
		return { conversions: [] };
	},
	addAttributes() {
		return {
			id: { default: null },
			alt: { default: null },
			conversion: { default: null },
			url: { default: null },
			width: { default: null },
			height: { default: null },
			mediaAlt: { default: null }
		};
	},
	parseHTML() {
		return [{ tag: "img[data-media-id]" }];
	},
	renderHTML({ node: e, HTMLAttributes: t }) {
		return ["img", Fl(t, {
			src: e.attrs.url,
			alt: e.attrs.alt ?? e.attrs.mediaAlt ?? "",
			"data-media-id": e.attrs.id
		})];
	},
	addNodeView() {
		return ad(rf);
	}
});
function of({ editor: e, library: t }) {
	let { t: r } = (0, D.useT)("media"), i = (0, D.useModal)();
	return t ? /* @__PURE__ */ _(D.ToolbarIconButton, {
		icon: "image",
		label: r("media.editor.insert", "Insert image"),
		onClick: () => i.open(/* @__PURE__ */ _(n, {
			fallback: null,
			children: /* @__PURE__ */ _(nf, {
				editor: e,
				library: t
			})
		})),
		testId: "editor-media-image-insert"
	}) : null;
}
var sf = {
	extensions: (e) => [af.configure({ conversions: e.conversions ?? [] })],
	toolbar: (e) => [{
		key: "media-image",
		component: ({ editor: t }) => /* @__PURE__ */ _(of, {
			editor: t,
			library: e.library ?? null
		})
	}]
}, cf = /* @__PURE__ */ T({ default: () => lf }), lf, uf = C((() => {
	Qd(), lf = ({ node: e }) => /* @__PURE__ */ _(qd, { node: e });
}));
//#endregion
//#region resources/js/dropzone-context.tsx
function df({ value: e, children: t }) {
	return /* @__PURE__ */ _(pf.Provider, {
		value: e,
		children: t
	});
}
function ff() {
	return l(pf);
}
var pf, mf = C((() => {
	pf = r(null);
})), hf = /* @__PURE__ */ T({
	DropzoneRemoveButton: () => gf,
	default: () => _f
});
function gf() {
	let { t: e } = (0, D.useT)("media"), t = ff();
	return t ? /* @__PURE__ */ _(D.IconButton, {
		"data-test": "media-dropzone-remove",
		disabled: t.disabled,
		icon: "x",
		label: e("media.dropzone.remove", "Remove file"),
		onClick: t.remove
	}) : null;
}
var _f, vf = C((() => {
	O(), mf(), _f = () => /* @__PURE__ */ _(gf, {});
})), yf = /* @__PURE__ */ T({ default: () => Sf });
function bf({ libraryNode: e, multiple: t, max: n, onConfirm: r }) {
	let { t: i } = (0, D.useT)("media"), a = (0, D.useEmbeddedModal)();
	if (!a) throw Error(D.MODAL_MISSING_ERROR);
	return /* @__PURE__ */ _(D.Dialog, {
		open: a.open,
		onOpenChange: a.onOpenChange,
		children: /* @__PURE__ */ v(D.DialogContent, {
			"aria-describedby": void 0,
			className: "flex flex-col gap-5",
			"data-test": "media-picker-dialog",
			onCloseAutoFocus: a.onExited,
			width: "3xl",
			children: [/* @__PURE__ */ _(D.DialogHeader, {
				closeLabel: (0, D.translate)("lattice", "common.close", "Close"),
				title: i("media.picker.heading", "Choose media")
			}), /* @__PURE__ */ _(qd, {
				node: e,
				pick: {
					multiple: t,
					max: n,
					onConfirm: (e) => {
						r(e), a.onOpenChange(!1);
					}
				}
			})]
		})
	});
}
function xf({ libraryNode: e, multiple: t, disabled: n, onUploaded: r }) {
	let { t: i } = (0, D.useT)("media"), a = e?.schema?.find((e) => e.key === "media-upload"), { uploads: o, addFiles: s, retry: c, dismiss: l } = Wd({
		endpoint: a?.props.endpoint ?? "",
		ref: a?.props.ref ?? "",
		signed: e?.props.signed ?? !1,
		onUploaded: r
	}), u = d(null), f = a?.props.label ?? i("media.actions.upload.label", "Upload"), p = o.some((e) => e.status === "uploading");
	return /* @__PURE__ */ v(g, { children: [
		/* @__PURE__ */ _(D.Button, {
			className: "self-start",
			"data-test": "media-picker-upload",
			disabled: n || p,
			onClick: () => u.current?.click(),
			type: "button",
			children: f
		}),
		/* @__PURE__ */ _("input", {
			accept: e?.props.accept ?? void 0,
			"aria-label": f,
			className: "sr-only",
			"data-test": "media-picker-upload-input",
			multiple: t,
			onChange: (e) => {
				s(e.target.files), e.target.value = "";
			},
			ref: u,
			type: "file"
		}),
		/* @__PURE__ */ _(Vd, {
			dismiss: l,
			retry: c,
			uploads: o
		})
	] });
}
var Sf, Cf = C((() => {
	O(), Qd(), Hd(), Gd(), Sf = ({ node: e }) => {
		let { t } = (0, D.useT)("media"), n = e.props, r = (0, D.useModal)(), [i, a] = f(n.selected ?? []), o = d(i);
		o.current = i;
		let s = e.schema?.find((e) => e.type === "media.library"), c = e.schema?.filter((e) => e.type !== "media.library") ?? [], l = c.length > 0, u = n.multiple, p = n.maxFiles, m = u && p !== null ? Math.max(0, p - i.length) : void 0;
		return /* @__PURE__ */ _(D.SimpleField, {
			label: n.label ?? "",
			node: e,
			children: ({ name: e, commit: d, disabled: f, readOnly: h }) => {
				let g = f || h, y = (e) => l ? e.map((e) => ({
					id: e.id,
					...e.values
				})) : u ? e.map((e) => e.id) : e[0]?.id ?? "", b = (e) => {
					a(e), d(y(e));
				}, x = (e, t, n) => {
					b(i.map((r, i) => i === e ? {
						...r,
						values: {
							...r.values,
							[t]: n
						}
					} : r));
				}, S = (e) => {
					let t = e.map((e) => ({
						...e,
						values: o.current.find((t) => t.id === e.id)?.values ?? {}
					})), n = u ? [...o.current.filter((e) => !t.some((t) => t.id === e.id)), ...t] : t.slice(0, 1);
					b(u && p !== null ? n.slice(0, p) : n);
				};
				return /* @__PURE__ */ v("div", {
					className: "flex flex-col gap-2",
					"data-test": `media-picker-${e}`,
					children: [
						l ? i.map((t, n) => /* @__PURE__ */ _("input", {
							name: `${e}[${n}][id]`,
							type: "hidden",
							value: t.id
						}, t.id)) : u ? i.map((t) => /* @__PURE__ */ _("input", {
							name: `${e}[]`,
							type: "hidden",
							value: t.id
						}, t.id)) : /* @__PURE__ */ _("input", {
							name: e,
							type: "hidden",
							value: i[0]?.id ?? ""
						}),
						i.length > 0 && /* @__PURE__ */ _("ul", {
							className: l ? "flex flex-col gap-2" : "flex flex-wrap gap-2",
							children: i.map((n, r) => /* @__PURE__ */ v("li", {
								className: l ? "flex flex-col gap-3 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-2 text-sm" : "flex max-w-56 items-center gap-2 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1 text-sm",
								"data-test": "media-picker-item",
								children: [/* @__PURE__ */ v("div", {
									className: "flex items-center gap-2",
									children: [
										n.preview_url !== null && n.mime_type.startsWith("image/") && /* @__PURE__ */ _("img", {
											alt: "",
											className: "size-8 rounded-lt-xs object-cover",
											src: n.preview_url
										}),
										/* @__PURE__ */ _("span", {
											className: "truncate text-lt-fg",
											children: n.name
										}),
										!g && /* @__PURE__ */ _(D.IconButton, {
											"data-test": "media-picker-remove",
											icon: "x",
											label: t("media.picker.remove", "Remove {{name}}", { name: n.name }),
											onClick: () => b(i.filter((e) => e.id !== n.id))
										})
									]
								}), l && !f && /* @__PURE__ */ _(D.FieldScopeProvider, {
									base: e,
									index: r,
									onChange: (e, t) => x(r, e, t),
									row: {
										id: n.id,
										...n.values
									},
									children: /* @__PURE__ */ _("div", {
										className: "flex flex-col gap-3",
										"data-test": "media-picker-item-fields",
										children: c.map((e, t) => /* @__PURE__ */ _(D.RenderNode, { node: e }, t))
									})
								})]
							}, n.id))
						}),
						n.uploadOnly ? /* @__PURE__ */ _(xf, {
							disabled: g,
							libraryNode: s,
							multiple: u,
							onUploaded: (e) => {
								let t = e.map((e) => ({
									...e,
									values: {}
								})), n = u ? [...i.filter((e) => !t.some((t) => t.id === e.id)), ...t] : t.slice(0, 1);
								b(u && p !== null ? n.slice(0, p) : n);
							}
						}) : /* @__PURE__ */ _(D.Button, {
							className: "self-start",
							"data-test": "media-picker-open",
							disabled: g,
							onClick: () => s && r.open(/* @__PURE__ */ _(bf, {
								libraryNode: s,
								max: m,
								multiple: u,
								onConfirm: S
							})),
							type: "button",
							children: n.pickerLabel ?? t("media.picker.open", "Choose from library")
						})
					]
				});
			}
		});
	};
})), wf = /* @__PURE__ */ T({ default: () => Ef });
function Tf({ name: e, onConfirm: t }) {
	let { t: n } = (0, D.useT)("media"), r = (0, D.useEmbeddedModal)();
	if (!r) throw Error(D.MODAL_MISSING_ERROR);
	return /* @__PURE__ */ _(D.ConfirmDialog, {
		cancelLabel: n("media.dropzone.replace-cancel", "Keep file"),
		confirmLabel: n("media.dropzone.replace-confirm", "Replace"),
		description: n("media.dropzone.replace-description", "{{name}} is replaced by the dropped file.", { name: e }),
		onCancel: () => r.onOpenChange(!1),
		onConfirm: () => {
			r.onOpenChange(!1), t();
		},
		onExited: r.onExited,
		open: r.open,
		title: n("media.dropzone.replace-title", "Replace this file?")
	});
}
var Ef, Df = C((() => {
	O(), kd(), Hd(), Gd(), mf(), vf(), Ef = ({ node: e }) => {
		let { t } = (0, D.useT)("media"), n = e.props, r = (0, D.useModal)(), i = e.schema?.find((e) => e.type === "media.library"), a = i?.schema?.find((e) => e.key === "media-upload"), o = e.schema?.find((e) => e.key === "media-dropzone-pdf"), [s, c] = f(n.selected?.[0] ?? null), [l, u] = f(!1), p = d(null), m = d(() => {}), { uploads: h, addFiles: y, retry: b, dismiss: x } = Wd({
			endpoint: a?.props.endpoint ?? "",
			ref: a?.props.ref ?? "",
			signed: i?.props.signed ?? !1,
			onUploaded: (e) => {
				let t = e[0];
				t && (c(t), m.current(t.id));
			}
		}), S = h.some((e) => e.status === "uploading");
		return /* @__PURE__ */ _(D.SimpleField, {
			label: n.label ?? "",
			node: e,
			children: ({ name: e, commit: d, disabled: f, readOnly: C }) => {
				m.current = d;
				let w = f || C, T = s !== null && Td(s, o) && o !== void 0 ? Ed(o, s, { height: "100%" }) : null, E = () => {
					c(null), d("");
				}, ee = (e) => {
					let t = e ? Array.from(e)[0] : void 0;
					if (!(w || S || !t)) {
						if (s) {
							r.open(/* @__PURE__ */ _(Tf, {
								name: s.name,
								onConfirm: () => y([t])
							}));
							return;
						}
						y([t]);
					}
				};
				return /* @__PURE__ */ v("div", {
					className: "flex min-w-0 flex-col gap-2",
					"data-test": `media-dropzone-${e}`,
					children: [
						/* @__PURE__ */ _("input", {
							name: e,
							type: "hidden",
							value: s?.id ?? ""
						}),
						/* @__PURE__ */ _("input", {
							accept: i?.props.accept ?? void 0,
							"aria-label": a?.props.label ?? t("media.actions.upload.label", "Upload"),
							className: "sr-only",
							"data-test": "media-dropzone-input",
							onChange: (e) => {
								ee(e.target.files), e.target.value = "";
							},
							ref: p,
							type: "file"
						}),
						/* @__PURE__ */ v("div", {
							className: (0, D.cn)("relative flex min-w-0 flex-col overflow-hidden rounded-lt bg-lt-surface", T === null && [
								"border",
								s === null && "border-dashed",
								l ? "border-lt-primary" : "border-lt-border"
							], T !== null && l && "ring-2 ring-lt-primary"),
							"data-drag-active": l || void 0,
							"data-test": "media-dropzone-face",
							onDragLeave: (e) => {
								e.currentTarget.contains(e.relatedTarget) || u(!1);
							},
							onDragOver: (e) => {
								e.preventDefault(), !w && !S && u(!0);
							},
							onDrop: (e) => {
								e.preventDefault(), u(!1), ee(e.dataTransfer.files);
							},
							style: { height: n.height },
							children: [s === null ? /* @__PURE__ */ v("button", {
								className: "flex flex-1 flex-col items-center justify-center gap-2 text-sm text-lt-muted-fg enabled:hover:text-lt-fg disabled:cursor-not-allowed",
								"data-test": "media-dropzone-target",
								disabled: w || S,
								onClick: () => p.current?.click(),
								type: "button",
								children: [/* @__PURE__ */ _(D.Icon, {
									className: "size-lt-icon-lg",
									name: "file"
								}), /* @__PURE__ */ _("span", { children: n.emptyText ?? t("media.dropzone.empty", "Drop a file here or click to upload.") })]
							}) : /* @__PURE__ */ _(df, {
								value: {
									disabled: w || S,
									remove: E
								},
								children: T ? /* @__PURE__ */ _(D.RenderNode, { node: T }) : /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ v("div", {
									className: "flex items-center gap-2 border-b border-lt-border px-2 py-1 text-sm",
									children: [/* @__PURE__ */ _("span", {
										className: "min-w-0 flex-1 truncate text-lt-fg",
										children: s.name
									}), /* @__PURE__ */ _(gf, {})]
								}), s.mime_type.startsWith("image/") && s.url !== null ? /* @__PURE__ */ _(D.PreviewableImage, {
									alt: s.alt ?? s.name,
									className: "min-h-0 w-full flex-1 object-contain",
									previewable: !0,
									src: s.url,
									testId: "media-dropzone-image"
								}) : /* @__PURE__ */ _(Dd, {
									className: "min-h-0 w-full flex-1",
									row: s,
									testId: "media-dropzone-file"
								})] })
							}), S && /* @__PURE__ */ _("div", {
								className: "pointer-events-none absolute inset-0 animate-pulse bg-lt-muted/20",
								"data-test": "media-dropzone-uploading",
								role: "status",
								children: /* @__PURE__ */ _("span", {
									className: "sr-only",
									children: t("media.dropzone.uploading", "Uploading…")
								})
							})]
						}),
						/* @__PURE__ */ _(Vd, {
							dismiss: x,
							retry: b,
							uploads: h
						})
					]
				});
			}
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
O();
var Of = {
	name: "media",
	components: {
		"media.library": (0, D.lazyComponent)(() => Promise.resolve().then(() => (uf(), cf))),
		"media.dropzone-remove": (0, D.lazyComponent)(() => Promise.resolve().then(() => (vf(), hf))),
		"field.media-picker": (0, D.lazyComponent)(() => Promise.resolve().then(() => (Cf(), yf))),
		"field.media-dropzone": (0, D.lazyComponent)(() => Promise.resolve().then(() => (Df(), wf)))
	},
	extensions: { [D.RICH_EDITOR_EXTENSION]: { "media-image": sf } },
	i18n: { namespace: "media" }
};
//#endregion
export { Of as default };
