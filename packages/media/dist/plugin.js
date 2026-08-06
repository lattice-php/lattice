import * as e from "react";
import t, { Suspense as n, createContext as r, createElement as i, createRef as a, forwardRef as o, lazy as s, memo as c, useContext as l, useMemo as u, useRef as d, useState as f, version as p } from "react";
import m, { flushSync as h } from "react-dom";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var y = Object.defineProperty, b = Object.getOwnPropertyDescriptor, ee = Object.getOwnPropertyNames, te = Object.prototype.hasOwnProperty, x = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, S = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), C = (e, t) => {
	let n = {};
	for (var r in e) y(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || y(n, Symbol.toStringTag, { value: "Module" }), n;
}, w = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = ee(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !te.call(e, s) && s !== n && y(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = b(t, s)) || r.enumerable
	});
	return e;
}, ne = (e, t, n) => (w(e, t, "default"), n && w(n, t, "default")), T = /* @__PURE__ */ C({});
import * as re from "@lattice-php/lattice/runtime";
ne(T, re);
var E = x((() => {}));
//#endregion
//#region ../../node_modules/orderedmap/dist/index.js
function D(e) {
	this.content = e;
}
D.prototype = {
	constructor: D,
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
		return i == -1 ? a.push(n || e, t) : (a[i + 1] = t, n && (a[i] = n)), new D(a);
	},
	remove: function(e) {
		var t = this.find(e);
		if (t == -1) return this;
		var n = this.content.slice();
		return n.splice(t, 2), new D(n);
	},
	addToStart: function(e, t) {
		return new D([e, t].concat(this.remove(e).content));
	},
	addToEnd: function(e, t) {
		var n = this.remove(e).content.slice();
		return n.push(e, t), new D(n);
	},
	addBefore: function(e, t, n) {
		var r = this.remove(t), i = r.content.slice(), a = r.find(e);
		return i.splice(a == -1 ? i.length : a, 0, t, n), new D(i);
	},
	forEach: function(e) {
		for (var t = 0; t < this.content.length; t += 2) e(this.content[t], this.content[t + 1]);
	},
	prepend: function(e) {
		return e = D.from(e), e.size ? new D(e.content.concat(this.subtract(e).content)) : this;
	},
	append: function(e) {
		return e = D.from(e), e.size ? new D(this.subtract(e).content.concat(e.content)) : this;
	},
	subtract: function(e) {
		var t = this;
		e = D.from(e);
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
}, D.from = function(e) {
	if (e instanceof D) return e;
	var t = [];
	if (e) for (var n in e) t.push(n, e[n]);
	return new D(t);
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
var O = class e {
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
		if (e == 0) return le(0, e);
		if (e == this.size) return le(this.content.length, e);
		if (e > this.size || e < 0) throw RangeError(`Position ${e} outside of fragment (${this})`);
		for (let t = 0, n = 0;; t++) {
			let r = this.child(t), i = n + r.nodeSize;
			if (i >= e) return i == e ? le(t + 1, i) : le(t, n);
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
O.empty = new O([], 0);
var ce = {
	index: 0,
	offset: 0
};
function le(e, t) {
	return ce.index = e, ce.offset = t, ce;
}
function ue(e, t) {
	if (e === t) return !0;
	if (!(e && typeof e == "object") || !(t && typeof t == "object")) return !1;
	let n = Array.isArray(e);
	if (Array.isArray(t) != n) return !1;
	if (n) {
		if (e.length != t.length) return !1;
		for (let n = 0; n < e.length; n++) if (!ue(e[n], t[n])) return !1;
	} else {
		for (let n in e) if (!(n in t) || !ue(e[n], t[n])) return !1;
		for (let n in t) if (!(n in e)) return !1;
	}
	return !0;
}
var k = class e {
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
		return this == e || this.type == e.type && ue(this.attrs, e.attrs);
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
k.none = [];
var de = class extends Error {}, A = class e {
	constructor(e, t, n) {
		this.content = e, this.openStart = t, this.openEnd = n;
	}
	get size() {
		return this.content.size - this.openStart - this.openEnd;
	}
	insertAt(t, n) {
		let r = pe(this.content, t + this.openStart, n, this.openStart + 1, this.openEnd + 1);
		return r && new e(r, this.openStart, this.openEnd);
	}
	removeBetween(t, n) {
		return new e(fe(this.content, t + this.openStart, n + this.openStart), this.openStart, this.openEnd);
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
		return new e(O.fromJSON(t, n.content), r, i);
	}
	static maxOpen(t, n = !0) {
		let r = 0, i = 0;
		for (let e = t.firstChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.firstChild) r++;
		for (let e = t.lastChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.lastChild) i++;
		return new e(t, r, i);
	}
};
A.empty = new A(O.empty, 0, 0);
function fe(e, t, n) {
	let { index: r, offset: i } = e.findIndex(t), a = e.maybeChild(r), { index: o, offset: s } = e.findIndex(n);
	if (i == t || a.isText) {
		if (s != n && !e.child(o).isText) throw RangeError("Removing non-flat range");
		return e.cut(0, t).append(e.cut(n));
	}
	if (r != o) throw RangeError("Removing non-flat range");
	return e.replaceChild(r, a.copy(fe(a.content, t - i - 1, n - i - 1)));
}
function pe(e, t, n, r, i, a) {
	let { index: o, offset: s } = e.findIndex(t), c = e.maybeChild(o);
	if (s == t || c.isText) return a && r <= 0 && i <= 0 && !a.canReplace(o, o, n) ? null : e.cut(0, t).append(n).append(e.cut(t));
	let l = pe(c.content, t - s - 1, n, o == 0 ? r - 1 : 0, o == e.childCount - 1 ? i - 1 : 0, c);
	return l && e.replaceChild(o, c.copy(l));
}
function me(e, t, n) {
	if (n.openStart > e.depth) throw new de("Inserted content deeper than insertion position");
	if (e.depth - n.openStart != t.depth - n.openEnd) throw new de("Inconsistent open depths");
	return he(e, t, n, 0);
}
function he(e, t, n, r) {
	let i = e.index(r), a = e.node(r);
	if (i == t.index(r) && r < e.depth - n.openStart) {
		let o = he(e, t, n, r + 1);
		return a.copy(a.content.replaceChild(i, o));
	}
	if (!n.content.size) return M(a, be(e, t, r));
	if (!n.openStart && !n.openEnd && e.depth == r && t.depth == r) {
		let r = e.parent, i = r.content;
		return M(r, i.cut(0, e.parentOffset).append(n.content).append(i.cut(t.parentOffset)));
	}
	{
		let { start: i, end: o } = xe(n, e);
		return M(a, ye(e, i, o, t, r));
	}
}
function ge(e, t) {
	if (!t.type.compatibleContent(e.type)) throw new de("Cannot join " + t.type.name + " onto " + e.type.name);
}
function _e(e, t, n) {
	let r = e.node(n);
	return ge(r, t.node(n)), r;
}
function j(e, t) {
	let n = t.length - 1;
	n >= 0 && e.isText && e.sameMarkup(t[n]) ? t[n] = e.withText(t[n].text + e.text) : t.push(e);
}
function ve(e, t, n, r) {
	let i = (t || e).node(n), a = 0, o = t ? t.index(n) : i.childCount;
	e && (a = e.index(n), e.depth > n ? a++ : e.textOffset && (j(e.nodeAfter, r), a++));
	for (let e = a; e < o; e++) j(i.child(e), r);
	t && t.depth == n && t.textOffset && j(t.nodeBefore, r);
}
function M(e, t) {
	if (!e.type.validContent(t)) throw new de("Invalid content for node " + e.type.name);
	return e.copy(t);
}
function ye(e, t, n, r, i) {
	let a = e.depth > i && _e(e, t, i + 1), o = r.depth > i && _e(n, r, i + 1), s = [];
	return ve(null, e, i, s), a && o && t.index(i) == n.index(i) ? (ge(a, o), j(M(a, ye(e, t, n, r, i + 1)), s)) : (a && j(M(a, be(e, t, i + 1)), s), ve(t, n, i, s), o && j(M(o, be(n, r, i + 1)), s)), ve(r, null, i, s), new O(s);
}
function be(e, t, n) {
	let r = [];
	return ve(null, e, n, r), e.depth > n && j(M(_e(e, t, n + 1), be(e, t, n + 1)), r), ve(t, null, n, r), new O(r);
}
function xe(e, t) {
	let n = t.depth - e.openStart, r = t.node(n).copy(e.content);
	for (let e = n - 1; e >= 0; e--) r = t.node(e).copy(O.from(r));
	return {
		start: r.resolveNoCache(e.openStart + n),
		end: r.resolveNoCache(r.content.size - e.openEnd - n)
	};
}
var Se = class e {
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
		if (e.content.size == 0) return k.none;
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
		for (let n = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); n >= 0; n--) if (e.pos <= this.end(n) && (!t || t(this.node(n)))) return new Ee(this, e, n);
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
		let r = Te.get(t);
		if (r) for (let e = 0; e < r.elts.length; e++) {
			let t = r.elts[e];
			if (t.pos == n) return t;
		}
		else Te.set(t, r = new Ce());
		let i = r.elts[r.i] = e.resolve(t, n);
		return r.i = (r.i + 1) % we, i;
	}
}, Ce = class {
	constructor() {
		this.elts = [], this.i = 0;
	}
}, we = 12, Te = /* @__PURE__ */ new WeakMap(), Ee = class {
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
}, De = Object.create(null), N = class e {
	constructor(e, t, n, r = k.none) {
		this.type = e, this.attrs = t, this.marks = r, this.content = n || O.empty;
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
		return this.type == e && ue(this.attrs, t || e.defaultAttrs || De) && k.sameSet(this.marks, n || k.none);
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
		if (e == t) return A.empty;
		let r = this.resolve(e), i = this.resolve(t), a = n ? 0 : r.sharedDepth(t), o = r.start(a);
		return new A(r.node(a).content.cut(r.pos - o, i.pos - o), r.depth - a, i.depth - a);
	}
	replace(e, t, n) {
		return me(this.resolve(e), this.resolve(t), n);
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
		return Se.resolveCached(this, e);
	}
	resolveNoCache(e) {
		return Se.resolve(this, e);
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
		return this.content.size && (e += "(" + this.content.toStringInner() + ")"), ke(this.marks, e);
	}
	contentMatchAt(e) {
		let t = this.type.contentMatch.matchFragment(this.content, 0, e);
		if (!t) throw Error("Called contentMatchAt on a node with invalid content");
		return t;
	}
	canReplace(e, t, n = O.empty, r = 0, i = n.childCount) {
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
		let e = k.none;
		for (let t = 0; t < this.marks.length; t++) {
			let n = this.marks[t];
			n.type.checkAttrs(n.attrs), e = n.addToSet(e);
		}
		if (!k.sameSet(e, this.marks)) throw RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((e) => e.type.name)}`);
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
		let r = O.fromJSON(e, t.content), i = e.nodeType(t.type).create(t.attrs, r, n);
		return i.type.checkAttrs(i.attrs), i;
	}
};
N.prototype.text = void 0;
var Oe = class e extends N {
	constructor(e, t, n, r) {
		if (super(e, t, null, r), !n) throw RangeError("Empty text nodes are not allowed");
		this.text = n;
	}
	toString() {
		return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : ke(this.marks, JSON.stringify(this.text));
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
function ke(e, t) {
	for (let n = e.length - 1; n >= 0; n--) t = e[n].type.name + "(" + t + ")";
	return t;
}
var Ae = class e {
	constructor(e) {
		this.validEnd = e, this.next = [], this.wrapCache = [];
	}
	static parse(t, n) {
		let r = new je(t, n);
		if (r.next == null) return e.empty;
		let i = Me(r);
		r.next && r.err("Unexpected trailing text");
		let a = He(ze(i));
		return Ue(a, r), a;
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
			if (s && (!t || s.validEnd)) return O.from(o.map((e) => e.createAndFill()));
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
Ae.empty = new Ae(!0);
var je = class {
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
function Me(e) {
	let t = [];
	do
		t.push(Ne(e));
	while (e.eat("|"));
	return t.length == 1 ? t[0] : {
		type: "choice",
		exprs: t
	};
}
function Ne(e) {
	let t = [];
	do
		t.push(Pe(e));
	while (e.next && e.next != ")" && e.next != "|");
	return t.length == 1 ? t[0] : {
		type: "seq",
		exprs: t
	};
}
function Pe(e) {
	let t = Re(e);
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
	else if (e.eat("{")) t = Ie(e, t);
	else break;
	return t;
}
function Fe(e) {
	/\D/.test(e.next) && e.err("Expected number, got '" + e.next + "'");
	let t = Number(e.next);
	return e.pos++, t;
}
function Ie(e, t) {
	let n = Fe(e), r = n;
	return e.eat(",") && (r = e.next == "}" ? -1 : Fe(e)), e.eat("}") || e.err("Unclosed braced range"), {
		type: "range",
		min: n,
		max: r,
		expr: t
	};
}
function Le(e, t) {
	let n = e.nodeTypes, r = n[t];
	if (r) return [r];
	let i = [];
	for (let e in n) {
		let r = n[e];
		r.isInGroup(t) && i.push(r);
	}
	return i.length == 0 && e.err("No node type or group '" + t + "' found"), i;
}
function Re(e) {
	if (e.eat("(")) {
		let t = Me(e);
		return e.eat(")") || e.err("Missing closing paren"), t;
	}
	if (/\W/.test(e.next)) e.err("Unexpected token '" + e.next + "'");
	else {
		let t = Le(e, e.next).map((t) => (e.inline == null ? e.inline = t.isInline : e.inline != t.isInline && e.err("Mixing inline and block content"), {
			type: "name",
			value: t
		}));
		return e.pos++, t.length == 1 ? t[0] : {
			type: "choice",
			exprs: t
		};
	}
}
function ze(e) {
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
function Be(e, t) {
	return t - e;
}
function Ve(e, t) {
	let n = [];
	return r(t), n.sort(Be);
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
function He(e) {
	let t = Object.create(null);
	return n(Ve(e, 0));
	function n(r) {
		let i = [];
		r.forEach((t) => {
			e[t].forEach(({ term: t, to: n }) => {
				if (!t) return;
				let r;
				for (let e = 0; e < i.length; e++) i[e][0] == t && (r = i[e][1]);
				Ve(e, n).forEach((e) => {
					r || i.push([t, r = []]), r.indexOf(e) == -1 && r.push(e);
				});
			});
		});
		let a = t[r.join(",")] = new Ae(r.indexOf(e.length - 1) > -1);
		for (let e = 0; e < i.length; e++) {
			let r = i[e][1].sort(Be);
			a.next.push({
				type: i[e][0],
				next: t[r.join(",")] || n(r)
			});
		}
		return a;
	}
}
function Ue(e, t) {
	for (let n = 0, r = [e]; n < r.length; n++) {
		let e = r[n], i = !e.validEnd, a = [];
		for (let t = 0; t < e.next.length; t++) {
			let { type: n, next: o } = e.next[t];
			a.push(n.name), i && !(n.isText || n.hasRequiredAttrs()) && (i = !1), r.indexOf(o) == -1 && r.push(o);
		}
		i && t.err("Only non-generatable nodes (" + a.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
	}
}
function We(e) {
	let t = Object.create(null);
	for (let n in e) {
		let r = e[n];
		if (!r.hasDefault) return null;
		t[n] = r.default;
	}
	return t;
}
function Ge(e, t) {
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
function Ke(e, t, n, r) {
	for (let i in t) if (!(i in e)) throw RangeError(`Unsupported attribute ${i} for ${n} of type ${r}`);
	for (let n in e) e[n].validate && e[n].validate(t[n]);
}
function qe(e, t) {
	let n = Object.create(null);
	if (t) for (let r in t) n[r] = new Xe(e, r, t[r]);
	return n;
}
var Je = class e {
	constructor(e, t, n) {
		this.name = e, this.schema = t, this.spec = n, this.markSet = null, this.groups = n.group ? n.group.split(" ") : [], this.attrs = qe(e, n.attrs), this.defaultAttrs = We(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(n.inline || e == "text"), this.isText = e == "text";
	}
	get isInline() {
		return !this.isBlock;
	}
	get isTextblock() {
		return this.isBlock && this.inlineContent;
	}
	get isLeaf() {
		return this.contentMatch == Ae.empty;
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
		return !e && this.defaultAttrs ? this.defaultAttrs : Ge(this.attrs, e);
	}
	create(e = null, t, n) {
		if (this.isText) throw Error("NodeType.create can't construct text nodes");
		return new N(this, this.computeAttrs(e), O.from(t), k.setFrom(n));
	}
	createChecked(e = null, t, n) {
		return t = O.from(t), this.checkContent(t), new N(this, this.computeAttrs(e), t, k.setFrom(n));
	}
	createAndFill(e = null, t, n) {
		if (e = this.computeAttrs(e), t = O.from(t), t.size) {
			let e = this.contentMatch.fillBefore(t);
			if (!e) return null;
			t = e.append(t);
		}
		let r = this.contentMatch.matchFragment(t), i = r && r.fillBefore(O.empty, !0);
		return i ? new N(this, e, t.append(i), k.setFrom(n)) : null;
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
		Ke(this.attrs, e, "node", this.name);
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
		return t ? t.length ? t : k.none : e;
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
function Ye(e, t, n) {
	let r = n.split("|");
	return (n) => {
		let i = n === null ? "null" : typeof n;
		if (r.indexOf(i) < 0) throw RangeError(`Expected value of type ${r} for attribute ${t} on type ${e}, got ${i}`);
	};
}
var Xe = class {
	constructor(e, t, n) {
		this.hasDefault = Object.prototype.hasOwnProperty.call(n, "default"), this.default = n.default, this.validate = typeof n.validate == "string" ? Ye(e, t, n.validate) : n.validate;
	}
	get isRequired() {
		return !this.hasDefault;
	}
}, Ze = class e {
	constructor(e, t, n, r) {
		this.name = e, this.rank = t, this.schema = n, this.spec = r, this.attrs = qe(e, r.attrs), this.excluded = null;
		let i = We(this.attrs);
		this.instance = i ? new k(this, i) : null;
	}
	create(e = null) {
		return !e && this.instance ? this.instance : new k(this, Ge(this.attrs, e));
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
		Ke(this.attrs, e, "mark", this.name);
	}
	excludes(e) {
		return this.excluded.indexOf(e) > -1;
	}
}, Qe = class {
	constructor(e) {
		this.linebreakReplacement = null, this.cached = Object.create(null);
		let t = this.spec = {};
		for (let n in e) t[n] = e[n];
		t.nodes = D.from(e.nodes), t.marks = D.from(e.marks || {}), this.nodes = Je.compile(this.spec.nodes, this), this.marks = Ze.compile(this.spec.marks, this);
		let n = Object.create(null);
		for (let e in this.nodes) {
			if (e in this.marks) throw RangeError(e + " can not be both a node and a mark");
			let t = this.nodes[e], r = t.spec.content || "", i = t.spec.marks;
			if (t.contentMatch = n[r] || (n[r] = Ae.parse(r, this.nodes)), t.inlineContent = t.contentMatch.inlineContent, t.spec.linebreakReplacement) {
				if (this.linebreakReplacement) throw RangeError("Multiple linebreak nodes defined");
				if (!t.isInline || !t.isLeaf) throw RangeError("Linebreak replacement nodes must be inline leaf nodes");
				this.linebreakReplacement = t;
			}
			t.markSet = i == "_" ? null : i ? $e(this, i.split(" ")) : i == "" || !t.inlineContent ? [] : null;
		}
		for (let e in this.marks) {
			let t = this.marks[e], n = t.spec.excludes;
			t.excluded = n == null ? [t] : n == "" ? [] : $e(this, n.split(" "));
		}
		this.nodeFromJSON = (e) => N.fromJSON(this, e), this.markFromJSON = (e) => k.fromJSON(this, e), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = Object.create(null);
	}
	node(e, t = null, n, r) {
		if (typeof e == "string") e = this.nodeType(e);
		else if (!(e instanceof Je)) throw RangeError("Invalid node type: " + e);
		else if (e.schema != this) throw RangeError("Node type from different schema used (" + e.name + ")");
		return e.createChecked(t, n, r);
	}
	text(e, t) {
		let n = this.nodes.text;
		return new Oe(n, n.defaultAttrs, e, k.setFrom(t));
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
function $e(e, t) {
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
function et(e) {
	return e.tag != null;
}
function tt(e) {
	return e.style != null;
}
var nt = class e {
	constructor(e, t) {
		this.schema = e, this.rules = t, this.tags = [], this.styles = [];
		let n = this.matchedStyles = [];
		t.forEach((e) => {
			if (et(e)) this.tags.push(e);
			else if (tt(e)) {
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
		let n = new dt(this, t, !1);
		return n.addAll(e, k.none, t.from, t.to), n.finish();
	}
	parseSlice(e, t = {}) {
		let n = new dt(this, t, !0);
		return n.addAll(e, k.none, t.from, t.to), A.maxOpen(n.finish());
	}
	matchTag(e, t, n) {
		for (let r = n ? this.tags.indexOf(n) + 1 : 0; r < this.tags.length; r++) {
			let n = this.tags[r];
			if (pt(e, n.tag) && (n.namespace === void 0 || e.namespaceURI == n.namespace) && (!n.context || t.matchesContext(n.context))) {
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
				n(e = mt(e)), e.mark || e.ignore || e.clearMark || (e.mark = t);
			});
		}
		for (let t in e.nodes) {
			let r = e.nodes[t].spec.parseDOM;
			r && r.forEach((e) => {
				n(e = mt(e)), e.node || e.ignore || e.mark || (e.node = t);
			});
		}
		return t;
	}
	static fromSchema(t) {
		return t.cached.domParser || (t.cached.domParser = new e(t, e.schemaRules(t)));
	}
}, rt = {
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
}, it = {
	head: !0,
	noscript: !0,
	object: !0,
	script: !0,
	style: !0,
	title: !0
}, at = {
	ol: !0,
	ul: !0
}, ot = 1, st = 2, ct = 4;
function lt(e, t, n) {
	return t == null ? e && e.whitespace == "pre" ? 3 : n & -5 : (t ? ot : 0) | (t === "full" ? st : 0);
}
var ut = class {
	constructor(e, t, n, r, i, a) {
		this.type = e, this.attrs = t, this.marks = n, this.solid = r, this.options = a, this.content = [], this.activeMarks = k.none, this.match = i || (a & ct ? null : e.contentMatch);
	}
	findWrapping(e) {
		if (!this.match) {
			if (!this.type) return [];
			let t = this.type.contentMatch.fillBefore(O.from(e));
			if (t) this.match = this.type.contentMatch.matchFragment(t);
			else {
				let t = this.type.contentMatch, n;
				return (n = t.findWrapping(e.type)) ? (this.match = t, n) : null;
			}
		}
		return this.match.findWrapping(e.type);
	}
	finish(e) {
		if (!(this.options & ot)) {
			let e = this.content[this.content.length - 1], t;
			if (e && e.isText && (t = /[ \t\r\n\u000c]+$/.exec(e.text))) {
				let n = e;
				e.text.length == t[0].length ? this.content.pop() : this.content[this.content.length - 1] = n.withText(n.text.slice(0, n.text.length - t[0].length));
			}
		}
		let t = O.from(this.content);
		return !e && this.match && (t = t.append(this.match.fillBefore(O.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
	}
	inlineContext(e) {
		return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !rt.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
	}
}, dt = class {
	constructor(e, t, n) {
		this.parser = e, this.options = t, this.isOpen = n, this.open = 0, this.localPreserveWS = !1;
		let r = t.topNode, i, a = lt(null, t.preserveWhitespace, 0) | (n ? ct : 0);
		i = r ? new ut(r.type, r.attrs, k.none, !0, t.topMatch || r.type.contentMatch, a) : n ? new ut(null, null, k.none, !0, null, a) : new ut(e.schema.topNodeType, null, k.none, !0, null, a), this.nodes = [i], this.find = t.findPositions, this.needsBlock = !1;
	}
	get top() {
		return this.nodes[this.open];
	}
	addDOM(e, t) {
		e.nodeType == 3 ? this.addTextNode(e, t) : e.nodeType == 1 && this.addElement(e, t);
	}
	addTextNode(e, t) {
		let n = e.nodeValue, r = this.top, i = r.options & st ? "full" : this.localPreserveWS || (r.options & ot) > 0, { schema: a } = this.parser;
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
		at.hasOwnProperty(a) && this.parser.normalizeLists && ft(e);
		let s = this.options.ruleFromNode && this.options.ruleFromNode(e) || (o = this.parser.matchTag(e, this, n));
		out: if (s ? s.ignore : it.hasOwnProperty(a)) this.findInside(e), this.ignoreFallback(e, t);
		else if (!s || s.skip || s.closeParent) {
			s && s.closeParent ? this.open = Math.max(0, this.open - 1) : s && s.skip.nodeType && (e = s.skip);
			let n, r = this.needsBlock;
			if (rt.hasOwnProperty(a)) i.content.length && i.content[0].isInline && this.open && (this.open--, i = this.top), n = !0, i.type || (this.needsBlock = !0);
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
		if (t.node) if (a = this.parser.schema.nodes[t.node], a.isLeaf) this.insertNode(a.create(t.attrs), n, e.nodeName == "BR") || this.leafFallback(e, n);
		else {
			let e = this.enter(a, t.attrs || null, n, t.preserveWhitespace);
			e && (i = !0, n = e);
		}
		else {
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
			let n = k.none;
			for (let i of r.concat(e.marks)) (t.type ? t.type.allowsMarkType(i.type) : ht(i.type, e.type)) && (n = i.addToSet(n));
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
		let o = lt(e, i, a.options);
		a.options & ct && a.content.length == 0 && (o |= ct);
		let s = k.none;
		return n = n.filter((t) => !(a.type ? a.type.allowsMarkType(t.type) : ht(t.type, e)) || (s = t.addToSet(s), !1)), this.nodes.push(new ut(e, t, s, r, null, o)), this.open++, n;
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
		else this.localPreserveWS && (this.nodes[t].options |= ot);
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
function ft(e) {
	for (let t = e.firstChild, n = null; t; t = t.nextSibling) {
		let e = t.nodeType == 1 ? t.nodeName.toLowerCase() : null;
		e && at.hasOwnProperty(e) && n ? (n.appendChild(t), t = n) : e == "li" ? n = t : e && (n = null);
	}
}
function pt(e, t) {
	return (e.matches || e.msMatchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector).call(e, t);
}
function mt(e) {
	let t = {};
	for (let n in e) t[n] = e[n];
	return t;
}
function ht(e, t) {
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
var gt = 65535, _t = 2 ** 16;
function vt(e, t) {
	return e + t * _t;
}
function yt(e) {
	return e & gt;
}
function bt(e) {
	return (e - (e & gt)) / _t;
}
var xt = 1, St = 2, Ct = 4, wt = 8, Tt = class {
	constructor(e, t, n) {
		this.pos = e, this.delInfo = t, this.recover = n;
	}
	get deleted() {
		return (this.delInfo & wt) > 0;
	}
	get deletedBefore() {
		return (this.delInfo & 5) > 0;
	}
	get deletedAfter() {
		return (this.delInfo & 6) > 0;
	}
	get deletedAcross() {
		return (this.delInfo & Ct) > 0;
	}
}, P = class e {
	constructor(t, n = !1) {
		if (this.ranges = t, this.inverted = n, !t.length && e.empty) return e.empty;
	}
	recover(e) {
		let t = 0, n = yt(e);
		if (!this.inverted) for (let e = 0; e < n; e++) t += this.ranges[e * 3 + 2] - this.ranges[e * 3 + 1];
		return this.ranges[n * 3] + t + bt(e);
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
				let d = e == (t < 0 ? s : u) ? null : vt(o / 3, e - s), f = e == s ? St : e == u ? xt : Ct;
				return (t < 0 ? e != s : e != u) && (f |= wt), new Tt(a, f, d);
			}
			r += l - c;
		}
		return n ? e + r : new Tt(e + r, 0, null);
	}
	touches(e, t) {
		let n = 0, r = yt(t), i = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
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
P.empty = new P([]);
var Et = class e {
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
		return n ? e : new Tt(e, r, null);
	}
}, Dt = Object.create(null), F = class {
	getMap() {
		return P.empty;
	}
	merge(e) {
		return null;
	}
	static fromJSON(e, t) {
		if (!t || !t.stepType) throw RangeError("Invalid input for Step.fromJSON");
		let n = Dt[t.stepType];
		if (!n) throw RangeError(`No step type ${t.stepType} defined`);
		return n.fromJSON(e, t);
	}
	static jsonID(e, t) {
		if (e in Dt) throw RangeError("Duplicate use of step JSON ID " + e);
		return Dt[e] = t, t.prototype.jsonID = e, t;
	}
}, I = class e {
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
			if (t instanceof de) return e.fail(t.message);
			throw t;
		}
	}
};
function Ot(e, t, n) {
	let r = [];
	for (let i = 0; i < e.childCount; i++) {
		let a = e.child(i);
		a.content.size && (a = a.copy(Ot(a.content, t, a))), a.isInline && (a = t(a, n, i)), r.push(a);
	}
	return O.fromArray(r);
}
var kt = class e extends F {
	constructor(e, t, n) {
		super(), this.from = e, this.to = t, this.mark = n;
	}
	apply(e) {
		let t = e.slice(this.from, this.to), n = e.resolve(this.from), r = n.node(n.sharedDepth(this.to)), i = new A(Ot(t.content, (e, t) => !e.isAtom || !t.type.allowsMarkType(this.mark.type) ? e : e.mark(this.mark.addToSet(e.marks)), r), t.openStart, t.openEnd);
		return I.fromReplace(e, this.from, this.to, i);
	}
	invert() {
		return new At(this.from, this.to, this.mark);
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
F.jsonID("addMark", kt);
var At = class e extends F {
	constructor(e, t, n) {
		super(), this.from = e, this.to = t, this.mark = n;
	}
	apply(e) {
		let t = e.slice(this.from, this.to), n = new A(Ot(t.content, (e) => e.mark(this.mark.removeFromSet(e.marks)), e), t.openStart, t.openEnd);
		return I.fromReplace(e, this.from, this.to, n);
	}
	invert() {
		return new kt(this.from, this.to, this.mark);
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
F.jsonID("removeMark", At);
var jt = class e extends F {
	constructor(e, t) {
		super(), this.pos = e, this.mark = t;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return I.fail("No node at mark step's position");
		let n = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
		return I.fromReplace(e, this.pos, this.pos + 1, new A(O.from(n), 0, +!t.isLeaf));
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
		return new Mt(this.pos, this.mark);
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
F.jsonID("addNodeMark", jt);
var Mt = class e extends F {
	constructor(e, t) {
		super(), this.pos = e, this.mark = t;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return I.fail("No node at mark step's position");
		let n = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
		return I.fromReplace(e, this.pos, this.pos + 1, new A(O.from(n), 0, +!t.isLeaf));
	}
	invert(e) {
		let t = e.nodeAt(this.pos);
		return !t || !this.mark.isInSet(t.marks) ? this : new jt(this.pos, this.mark);
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
F.jsonID("removeNodeMark", Mt);
var L = class e extends F {
	constructor(e, t, n, r = !1) {
		super(), this.from = e, this.to = t, this.slice = n, this.structure = r;
	}
	apply(e) {
		return this.structure && Nt(e, this.from, this.to) ? I.fail("Structure replace would overwrite content") : I.fromReplace(e, this.from, this.to, this.slice);
	}
	getMap() {
		return new P([
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
			let n = this.slice.size + t.slice.size == 0 ? A.empty : new A(this.slice.content.append(t.slice.content), this.slice.openStart, t.slice.openEnd);
			return new e(this.from, this.to + (t.to - t.from), n, this.structure);
		}
		if (t.to == this.from && !this.slice.openStart && !t.slice.openEnd) {
			let n = this.slice.size + t.slice.size == 0 ? A.empty : new A(t.slice.content.append(this.slice.content), t.slice.openStart, this.slice.openEnd);
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
		return new e(n.from, n.to, A.fromJSON(t, n.slice), !!n.structure);
	}
};
L.MAP_BIAS = 1, F.jsonID("replace", L);
var R = class e extends F {
	constructor(e, t, n, r, i, a, o = !1) {
		super(), this.from = e, this.to = t, this.gapFrom = n, this.gapTo = r, this.slice = i, this.insert = a, this.structure = o;
	}
	apply(e) {
		if (this.structure && (Nt(e, this.from, this.gapFrom) || Nt(e, this.gapTo, this.to))) return I.fail("Structure gap-replace would overwrite content");
		let t = e.slice(this.gapFrom, this.gapTo);
		if (t.openStart || t.openEnd) return I.fail("Gap is not a flat range");
		let n = this.slice.insertAt(this.insert, t.content);
		return n ? I.fromReplace(e, this.from, this.to, n) : I.fail("Content does not fit in gap");
	}
	getMap() {
		return new P([
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
		return new e(n.from, n.to, n.gapFrom, n.gapTo, A.fromJSON(t, n.slice), n.insert, !!n.structure);
	}
};
F.jsonID("replaceAround", R);
function Nt(e, t, n) {
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
function Pt(e, t, n, r) {
	let i = [], a = [], o, s;
	e.doc.nodesBetween(t, n, (e, c, l) => {
		if (!e.isInline) return;
		let u = e.marks;
		if (!r.isInSet(u) && l.type.allowsMarkType(r.type)) {
			let l = Math.max(c, t), d = Math.min(c + e.nodeSize, n), f = r.addToSet(u);
			for (let e = 0; e < u.length; e++) u[e].isInSet(f) || (o && o.to == l && o.mark.eq(u[e]) ? o.to = d : i.push(o = new At(l, d, u[e])));
			s && s.to == l ? s.to = d : a.push(s = new kt(l, d, r));
		}
	}), i.forEach((t) => e.step(t)), a.forEach((t) => e.step(t));
}
function Ft(e, t, n, r) {
	let i = [], a = 0;
	e.doc.nodesBetween(t, n, (e, o) => {
		if (!e.isInline) return;
		a++;
		let s = null;
		if (r instanceof Ze) {
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
	}), i.forEach((t) => e.step(new At(t.from, t.to, t.style)));
}
function It(e, t, n, r = n.contentMatch, i = !0) {
	let a = e.doc.nodeAt(t), o = [], s = t + 1;
	for (let t = 0; t < a.childCount; t++) {
		let c = a.child(t), l = s + c.nodeSize, u = r.matchType(c.type);
		if (!u) o.push(new L(s, l, A.empty));
		else {
			r = u;
			for (let t = 0; t < c.marks.length; t++) n.allowsMarkType(c.marks[t].type) || e.step(new At(s, l, c.marks[t]));
			if (i && c.isText && n.whitespace != "pre") {
				let e, t = /\r?\n|\r/g, r;
				for (; e = t.exec(c.text);) r ||= new A(O.from(n.schema.text(" ", n.allowedMarks(c.marks))), 0, 0), o.push(new L(s + e.index, s + e.index + e[0].length, r));
			}
		}
		s = l;
	}
	if (!r.validEnd) {
		let t = r.fillBefore(O.empty, !0);
		e.replace(s, s, new A(t, 0, 0));
	}
	for (let t = o.length - 1; t >= 0; t--) e.step(o[t]);
}
function Lt(e, t, n) {
	return (t == 0 || e.canReplace(t, e.childCount)) && (n == e.childCount || e.canReplace(0, n));
}
function Rt(e) {
	let t = e.parent.content.cutByIndex(e.startIndex, e.endIndex);
	for (let n = e.depth, r = 0, i = 0;; --n) {
		let a = e.$from.node(n), o = e.$from.index(n) + r, s = e.$to.indexAfter(n) - i;
		if (n < e.depth && a.canReplace(o, s, t)) return n;
		if (n == 0 || a.type.spec.isolating || !Lt(a, o, s)) break;
		o && (r = 1), s < a.childCount && (i = 1);
	}
	return null;
}
function zt(e, t, n) {
	let { $from: r, $to: i, depth: a } = t, o = r.before(a + 1), s = i.after(a + 1), c = o, l = s, u = O.empty, d = 0;
	for (let e = a, t = !1; e > n; e--) t || r.index(e) > 0 ? (t = !0, u = O.from(r.node(e).copy(u)), d++) : c--;
	let f = O.empty, p = 0;
	for (let e = a, t = !1; e > n; e--) t || i.after(e + 1) < i.end(e) ? (t = !0, f = O.from(i.node(e).copy(f)), p++) : l++;
	e.step(new R(c, l, o, s, new A(u.append(f), d, p), u.size - d, !0));
}
function Bt(e, t, n = null, r = e) {
	let i = Ht(e, t), a = i && Ut(r, t);
	return a ? i.map(Vt).concat({
		type: t,
		attrs: n
	}).concat(a.map(Vt)) : null;
}
function Vt(e) {
	return {
		type: e,
		attrs: null
	};
}
function Ht(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.contentMatchAt(r).findWrapping(t);
	if (!a) return null;
	let o = a.length ? a[0] : t;
	return n.canReplaceWith(r, i, o) ? a : null;
}
function Ut(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.child(r), o = t.contentMatch.findWrapping(a.type);
	if (!o) return null;
	let s = (o.length ? o[o.length - 1] : t).contentMatch;
	for (let e = r; s && e < i; e++) s = s.matchType(n.child(e).type);
	return !s || !s.validEnd ? null : o;
}
function Wt(e, t, n) {
	let r = O.empty;
	for (let e = n.length - 1; e >= 0; e--) {
		if (r.size) {
			let t = n[e].type.contentMatch.matchFragment(r);
			if (!t || !t.validEnd) throw RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
		}
		r = O.from(n[e].type.create(n[e].attrs, r));
	}
	let i = t.start, a = t.end;
	e.step(new R(i, a, i, a, new A(r, 0, 0), n.length, !0));
}
function Gt(e, t, n, r, i) {
	if (!r.isTextblock) throw RangeError("Type given to setBlockType should be a textblock");
	let a = e.steps.length;
	e.doc.nodesBetween(t, n, (t, n) => {
		let o = typeof i == "function" ? i(t) : i;
		if (t.isTextblock && !t.hasMarkup(r, o) && Jt(e.doc, e.mapping.slice(a).map(n), r)) {
			let i = null;
			if (r.schema.linebreakReplacement) {
				let e = r.whitespace == "pre", t = !!r.contentMatch.matchType(r.schema.linebreakReplacement);
				e && !t ? i = !1 : !e && t && (i = !0);
			}
			i === !1 && qt(e, t, n, a), It(e, e.mapping.slice(a).map(n, 1), r, void 0, i === null);
			let s = e.mapping.slice(a), c = s.map(n, 1), l = s.map(n + t.nodeSize, 1);
			return e.step(new R(c, l, c + 1, l - 1, new A(O.from(r.create(o, null, t.marks)), 0, 0), 1, !0)), i === !0 && Kt(e, t, n, a), !1;
		}
	});
}
function Kt(e, t, n, r) {
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
function qt(e, t, n, r) {
	t.forEach((i, a) => {
		if (i.type == i.type.schema.linebreakReplacement) {
			let i = e.mapping.slice(r).map(n + 1 + a);
			e.replaceWith(i, i + 1, t.type.schema.text("\n"));
		}
	});
}
function Jt(e, t, n) {
	let r = e.resolve(t), i = r.index();
	return r.parent.canReplaceWith(i, i + 1, n);
}
function Yt(e, t, n, r, i) {
	let a = e.doc.nodeAt(t);
	if (!a) throw RangeError("No node at given position");
	n ||= a.type;
	let o = n.create(r, null, i || a.marks);
	if (a.isLeaf) return e.replaceWith(t, t + a.nodeSize, o);
	if (!n.validContent(a.content)) throw RangeError("Invalid content for node type " + n.name);
	e.step(new R(t, t + a.nodeSize, t + 1, t + a.nodeSize - 1, new A(O.from(o), 0, 0), 1, !0));
}
function z(e, t, n = 1, r) {
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
function Xt(e, t, n = 1, r) {
	let i = e.doc.resolve(t), a = O.empty, o = O.empty;
	for (let e = i.depth, t = i.depth - n, s = n - 1; e > t; e--, s--) {
		a = O.from(i.node(e).copy(a));
		let t = r && r[s];
		o = O.from(t ? t.type.create(t.attrs, o) : i.node(e).copy(o));
	}
	e.step(new L(t, t, new A(a.append(o), n, n), !0));
}
function B(e, t) {
	let n = e.resolve(t), r = n.index();
	return Qt(n.nodeBefore, n.nodeAfter) && n.parent.canReplace(r, r + 1);
}
function Zt(e, t) {
	t.content.size || e.type.compatibleContent(t.type);
	let n = e.contentMatchAt(e.childCount), { linebreakReplacement: r } = e.type.schema;
	for (let i = 0; i < t.childCount; i++) {
		let a = t.child(i), o = a.type == r ? e.type.schema.nodes.text : a.type;
		if (n = n.matchType(o), !n || !e.type.allowsMarks(a.marks)) return !1;
	}
	return n.validEnd;
}
function Qt(e, t) {
	return !!(e && t && !e.isLeaf && Zt(e, t));
}
function $t(e, t, n = -1) {
	let r = e.resolve(t);
	for (let e = r.depth;; e--) {
		let i, a, o = r.index(e);
		if (e == r.depth ? (i = r.nodeBefore, a = r.nodeAfter) : n > 0 ? (i = r.node(e + 1), o++, a = r.node(e).maybeChild(o)) : (i = r.node(e).maybeChild(o - 1), a = r.node(e + 1)), i && !i.isTextblock && Qt(i, a) && r.node(e).canReplace(o, o + 1)) return t;
		if (e == 0) break;
		t = n < 0 ? r.before(e) : r.after(e);
	}
}
function en(e, t, n) {
	let r = null, { linebreakReplacement: i } = e.doc.type.schema, a = e.doc.resolve(t - n), o = a.node().type;
	if (i && o.inlineContent) {
		let e = o.whitespace == "pre", t = !!o.contentMatch.matchType(i);
		e && !t ? r = !1 : !e && t && (r = !0);
	}
	let s = e.steps.length;
	if (r === !1) {
		let r = e.doc.resolve(t + n);
		qt(e, r.node(), r.before(), s);
	}
	o.inlineContent && It(e, t + n - 1, o, a.node().contentMatchAt(a.index()), r == null);
	let c = e.mapping.slice(s), l = c.map(t - n);
	if (e.step(new L(l, c.map(t + n, -1), A.empty, !0)), r === !0) {
		let t = e.doc.resolve(l);
		Kt(e, t.node(), t.before(), e.steps.length);
	}
	return e;
}
function tn(e, t, n) {
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
function nn(e, t, n = t, r = A.empty) {
	if (t == n && !r.size) return null;
	let i = e.resolve(t), a = e.resolve(n);
	return rn(i, a, r) ? new L(t, n, r) : new an(i, a, r).fit();
}
function rn(e, t, n) {
	return !n.openStart && !n.openEnd && e.start() == t.start() && e.parent.canReplace(e.index(), t.index(), n.content);
}
var an = class {
	constructor(e, t, n) {
		this.$from = e, this.$to = t, this.unplaced = n, this.frontier = [], this.placed = O.empty;
		for (let t = 0; t <= e.depth; t++) {
			let n = e.node(t);
			this.frontier.push({
				type: n.type,
				match: n.contentMatchAt(e.indexAfter(t))
			});
		}
		for (let t = e.depth; t > 0; t--) this.placed = O.from(e.node(t).copy(this.placed));
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
		let s = new A(i, a, o);
		return e > -1 ? new R(n.pos, e, this.$to.pos, this.$to.end(), s, t) : s.size || n.pos != this.$to.pos ? new L(n.pos, r.pos, s) : null;
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
			n ? (r = cn(this.unplaced.content, n - 1).firstChild, e = r.content) : e = this.unplaced.content;
			let i = e.firstChild;
			for (let e = this.depth; e >= 0; e--) {
				let { type: a, match: o } = this.frontier[e], s, c = null;
				if (t == 1 && (i ? o.matchType(i.type) || (c = o.fillBefore(O.from(i), !1)) : r && a.compatibleContent(r.type))) return {
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
		let { content: e, openStart: t, openEnd: n } = this.unplaced, r = cn(e, t);
		return !r.childCount || r.firstChild.isLeaf ? !1 : (this.unplaced = new A(e, t + 1, Math.max(n, r.size + t >= e.size - n ? t + 1 : 0)), !0);
	}
	dropNode() {
		let { content: e, openStart: t, openEnd: n } = this.unplaced, r = cn(e, t);
		if (r.childCount <= 1 && t > 0) {
			let i = e.size - t <= t + r.size;
			this.unplaced = new A(on(e, t - 1, 1), t - 1, i ? t - 1 : n);
		} else this.unplaced = new A(on(e, t, 1), t, n);
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
			c++, (c > 1 || s == 0 || e.content.size) && (u = t, l.push(ln(e.mark(d.allowedMarks(e.marks)), c == 1 ? s : 0, c == o.childCount ? f : -1)));
		}
		let p = c == o.childCount;
		p || (f = -1), this.placed = sn(this.placed, t, O.from(l)), this.frontier[t].match = u, p && f < 0 && n && n.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
		for (let e = 0, t = o; e < f; e++) {
			let e = t.lastChild;
			this.frontier.push({
				type: e.type,
				match: e.contentMatchAt(e.childCount)
			}), t = e.content;
		}
		this.unplaced = p ? e == 0 ? A.empty : new A(on(a.content, e - 1, 1), e - 1, f < 0 ? a.openEnd : e - 1) : new A(on(a.content, e, c), a.openStart, a.openEnd);
	}
	mustMoveInline() {
		if (!this.$to.parent.isTextblock) return -1;
		let e = this.frontier[this.depth], t;
		if (!e.type.isTextblock || !un(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth) return -1;
		let { depth: n } = this.$to, r = this.$to.after(n);
		for (; n > 1 && r == this.$to.end(--n);) ++r;
		return r;
	}
	findCloseLevel(e) {
		scan: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
			let { match: n, type: r } = this.frontier[t], i = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), a = un(e, t, r, n, i);
			if (a) {
				for (let n = t - 1; n >= 0; n--) {
					let { match: t, type: r } = this.frontier[n], i = un(e, n, r, t, !0);
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
		t.fit.childCount && (this.placed = sn(this.placed, t.depth, t.fit)), e = t.move;
		for (let n = t.depth + 1; n <= e.depth; n++) {
			let t = e.node(n), r = t.type.contentMatch.fillBefore(t.content, !0, e.index(n));
			this.openFrontierNode(t.type, t.attrs, r);
		}
		return e;
	}
	openFrontierNode(e, t = null, n) {
		let r = this.frontier[this.depth];
		r.match = r.match.matchType(e), this.placed = sn(this.placed, this.depth, O.from(e.create(t, n))), this.frontier.push({
			type: e,
			match: e.contentMatch
		});
	}
	closeFrontierNode() {
		let e = this.frontier.pop().match.fillBefore(O.empty, !0);
		e.childCount && (this.placed = sn(this.placed, this.frontier.length, e));
	}
};
function on(e, t, n) {
	return t == 0 ? e.cutByIndex(n, e.childCount) : e.replaceChild(0, e.firstChild.copy(on(e.firstChild.content, t - 1, n)));
}
function sn(e, t, n) {
	return t == 0 ? e.append(n) : e.replaceChild(e.childCount - 1, e.lastChild.copy(sn(e.lastChild.content, t - 1, n)));
}
function cn(e, t) {
	for (let n = 0; n < t; n++) e = e.firstChild.content;
	return e;
}
function ln(e, t, n) {
	if (t <= 0) return e;
	let r = e.content;
	return t > 1 && (r = r.replaceChild(0, ln(r.firstChild, t - 1, r.childCount == 1 ? n - 1 : 0))), t > 0 && (r = e.type.contentMatch.fillBefore(r).append(r), n <= 0 && (r = r.append(e.type.contentMatch.matchFragment(r).fillBefore(O.empty, !0)))), e.copy(r);
}
function un(e, t, n, r, i) {
	let a = e.node(t), o = i ? e.indexAfter(t) : e.index(t);
	if (o == a.childCount && !n.compatibleContent(a.type)) return null;
	let s = r.fillBefore(a.content, !0, o);
	return s && !dn(n, a.content, o) ? s : null;
}
function dn(e, t, n) {
	for (let r = n; r < t.childCount; r++) if (!e.allowsMarks(t.child(r).marks)) return !0;
	return !1;
}
function fn(e) {
	return e.spec.defining || e.spec.definingForContent;
}
function pn(e, t, n, r) {
	if (!r.size) return e.deleteRange(t, n);
	let i = e.doc.resolve(t), a = e.doc.resolve(n);
	if (rn(i, a, r)) return e.step(new L(t, n, r));
	let o = _n(i, a);
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
		let t = l[e], n = fn(t.type);
		if (n && !t.sameMarkup(i.node(Math.abs(s) - 1))) u = e;
		else if (n || !t.type.isTextblock) break;
	}
	for (let t = r.openStart; t >= 0; t--) {
		let s = (t + u + 1) % (r.openStart + 1), d = l[s];
		if (d) for (let t = 0; t < o.length; t++) {
			let l = o[(t + c) % o.length], u = !0;
			l < 0 && (u = !1, l = -l);
			let f = i.node(l - 1), p = i.index(l - 1);
			if (f.canReplaceWith(p, p, d.type, d.marks)) return e.replace(i.before(l), u ? a.after(l) : n, new A(mn(r.content, 0, r.openStart, s), s, r.openEnd));
		}
	}
	let d = e.steps.length;
	for (let s = o.length - 1; s >= 0 && (e.replace(t, n, r), !(e.steps.length > d)); s--) {
		let e = o[s];
		e < 0 || (t = i.before(e), n = a.after(e));
	}
}
function mn(e, t, n, r, i) {
	if (t < n) {
		let i = e.firstChild;
		e = e.replaceChild(0, i.copy(mn(i.content, t + 1, n, r, i)));
	}
	if (t > r) {
		let t = i.contentMatchAt(0), n = t.fillBefore(e).append(e);
		e = n.append(t.matchFragment(n).fillBefore(O.empty, !0));
	}
	return e;
}
function hn(e, t, n, r) {
	if (!r.isInline && t == n && e.doc.resolve(t).parent.content.size) {
		let i = tn(e.doc, t, r.type);
		i != null && (t = n = i);
	}
	e.replaceRange(t, n, new A(O.from(r), 0, 0));
}
function gn(e, t, n) {
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
	let a = _n(r, i);
	for (let t = 0; t < a.length; t++) {
		let n = a[t], o = t == a.length - 1;
		if (o && n == 0 || r.node(n).type.contentMatch.validEnd) return e.delete(r.start(n), i.end(n));
		if (n > 0 && (o || r.node(n - 1).canReplace(r.index(n - 1), i.indexAfter(n - 1)))) return e.delete(r.before(n), i.after(n));
	}
	for (let a = 1; a <= r.depth && a <= i.depth; a++) if (t - r.start(a) == r.depth - a && n > r.end(a) && i.end(a) - n != i.depth - a && r.start(a - 1) == i.start(a - 1) && r.node(a - 1).canReplace(r.index(a - 1), i.index(a - 1))) return e.delete(r.before(a), n);
	e.delete(t, n);
}
function _n(e, t) {
	let n = [], r = Math.min(e.depth, t.depth);
	for (let i = r; i >= 0; i--) {
		let r = e.start(i);
		if (r < e.pos - (e.depth - i) || t.end(i) > t.pos + (t.depth - i) || e.node(i).type.spec.isolating || t.node(i).type.spec.isolating) break;
		(r == t.start(i) || i == e.depth && i == t.depth && e.parent.inlineContent && t.parent.inlineContent && i && t.start(i - 1) == r - 1) && n.push(i);
	}
	return n;
}
var vn = class e extends F {
	constructor(e, t, n) {
		super(), this.pos = e, this.attr = t, this.value = n;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return I.fail("No node at attribute step's position");
		let n = Object.create(null);
		for (let e in t.attrs) n[e] = t.attrs[e];
		n[this.attr] = this.value;
		let r = t.type.create(n, null, t.marks);
		return I.fromReplace(e, this.pos, this.pos + 1, new A(O.from(r), 0, +!t.isLeaf));
	}
	getMap() {
		return P.empty;
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
F.jsonID("attr", vn);
var yn = class e extends F {
	constructor(e, t) {
		super(), this.attr = e, this.value = t;
	}
	apply(e) {
		let t = Object.create(null);
		for (let n in e.attrs) t[n] = e.attrs[n];
		t[this.attr] = this.value;
		let n = e.type.create(t, e.content, e.marks);
		return I.ok(n);
	}
	getMap() {
		return P.empty;
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
F.jsonID("docAttr", yn);
var V = class extends Error {};
V = function e(t) {
	let n = Error.call(this, t);
	return n.__proto__ = e.prototype, n;
}, V.prototype = Object.create(Error.prototype), V.prototype.constructor = V, V.prototype.name = "TransformError";
var bn = class {
	constructor(e) {
		this.doc = e, this.steps = [], this.docs = [], this.mapping = new Et();
	}
	get before() {
		return this.docs.length ? this.docs[0] : this.doc;
	}
	step(e) {
		let t = this.maybeStep(e);
		if (t.failed) throw new V(t.failed);
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
	replace(e, t = e, n = A.empty) {
		let r = nn(this.doc, e, t, n);
		return r && this.step(r), this;
	}
	replaceWith(e, t, n) {
		return this.replace(e, t, new A(O.from(n), 0, 0));
	}
	delete(e, t) {
		return this.replace(e, t, A.empty);
	}
	insert(e, t) {
		return this.replaceWith(e, e, t);
	}
	replaceRange(e, t, n) {
		return pn(this, e, t, n), this;
	}
	replaceRangeWith(e, t, n) {
		return hn(this, e, t, n), this;
	}
	deleteRange(e, t) {
		return gn(this, e, t), this;
	}
	lift(e, t) {
		return zt(this, e, t), this;
	}
	join(e, t = 1) {
		return en(this, e, t), this;
	}
	wrap(e, t) {
		return Wt(this, e, t), this;
	}
	setBlockType(e, t = e, n, r = null) {
		return Gt(this, e, t, n, r), this;
	}
	setNodeMarkup(e, t, n = null, r) {
		return Yt(this, e, t, n, r), this;
	}
	setNodeAttribute(e, t, n) {
		return this.step(new vn(e, t, n)), this;
	}
	setDocAttribute(e, t) {
		return this.step(new yn(e, t)), this;
	}
	addNodeMark(e, t) {
		return this.step(new jt(e, t)), this;
	}
	removeNodeMark(e, t) {
		let n = this.doc.nodeAt(e);
		if (!n) throw RangeError("No node at position " + e);
		if (t instanceof k) t.isInSet(n.marks) && this.step(new Mt(e, t));
		else {
			let r = n.marks, i, a = [];
			for (; i = t.isInSet(r);) a.push(new Mt(e, i)), r = i.removeFromSet(r);
			for (let e = a.length - 1; e >= 0; e--) this.step(a[e]);
		}
		return this;
	}
	split(e, t = 1, n) {
		return Xt(this, e, t, n), this;
	}
	addMark(e, t, n) {
		return Pt(this, e, t, n), this;
	}
	removeMark(e, t, n) {
		return Ft(this, e, t, n), this;
	}
	clearIncompatible(e, t, n) {
		return It(this, e, t, n), this;
	}
}, xn = Object.create(null), H = class {
	constructor(e, t, n) {
		this.$anchor = e, this.$head = t, this.ranges = n || [new Sn(e.min(t), e.max(t))];
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
	replace(e, t = A.empty) {
		let n = t.content.lastChild, r = null;
		for (let e = 0; e < t.openEnd; e++) r = n, n = n.lastChild;
		let i = e.steps.length, a = this.ranges;
		for (let o = 0; o < a.length; o++) {
			let { $from: s, $to: c } = a[o], l = e.mapping.slice(i);
			e.replaceRange(l.map(s.pos), l.map(c.pos), o ? A.empty : t), o == 0 && kn(e, i, (n ? n.isInline : r && r.isTextblock) ? -1 : 1);
		}
	}
	replaceWith(e, t) {
		let n = e.steps.length, r = this.ranges;
		for (let i = 0; i < r.length; i++) {
			let { $from: a, $to: o } = r[i], s = e.mapping.slice(n), c = s.map(a.pos), l = s.map(o.pos);
			i ? e.deleteRange(c, l) : (e.replaceRangeWith(c, l, t), kn(e, n, t.isInline ? -1 : 1));
		}
	}
	static findFrom(e, t, n = !1) {
		let r = e.parent.inlineContent ? new U(e) : On(e.node(0), e.parent, e.pos, e.index(), t, n);
		if (r) return r;
		for (let r = e.depth - 1; r >= 0; r--) {
			let i = t < 0 ? On(e.node(0), e.node(r), e.before(r + 1), e.index(r), t, n) : On(e.node(0), e.node(r), e.after(r + 1), e.index(r) + 1, t, n);
			if (i) return i;
		}
		return null;
	}
	static near(e, t = 1) {
		return this.findFrom(e, t) || this.findFrom(e, -t) || new G(e.node(0));
	}
	static atStart(e) {
		return On(e, e, 0, 0, 1) || new G(e);
	}
	static atEnd(e) {
		return On(e, e, e.content.size, e.childCount, -1) || new G(e);
	}
	static fromJSON(e, t) {
		if (!t || !t.type) throw RangeError("Invalid input for Selection.fromJSON");
		let n = xn[t.type];
		if (!n) throw RangeError(`No selection type ${t.type} defined`);
		return n.fromJSON(e, t);
	}
	static jsonID(e, t) {
		if (e in xn) throw RangeError("Duplicate use of selection JSON ID " + e);
		return xn[e] = t, t.prototype.jsonID = e, t;
	}
	getBookmark() {
		return U.between(this.$anchor, this.$head).getBookmark();
	}
};
H.prototype.visible = !0;
var Sn = class {
	constructor(e, t) {
		this.$from = e, this.$to = t;
	}
}, Cn = !1;
function wn(e) {
	!Cn && !e.parent.inlineContent && (Cn = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + e.parent.type.name + ")"));
}
var U = class e extends H {
	constructor(e, t = e) {
		wn(e), wn(t), super(e, t);
	}
	get $cursor() {
		return this.$anchor.pos == this.$head.pos ? this.$head : null;
	}
	map(t, n) {
		let r = t.resolve(n.map(this.head));
		if (!r.parent.inlineContent) return H.near(r);
		let i = t.resolve(n.map(this.anchor));
		return new e(i.parent.inlineContent ? i : r, r);
	}
	replace(e, t = A.empty) {
		if (super.replace(e, t), t == A.empty) {
			let t = this.$from.marksAcross(this.$to);
			t && e.ensureMarks(t);
		}
	}
	eq(t) {
		return t instanceof e && t.anchor == this.anchor && t.head == this.head;
	}
	getBookmark() {
		return new Tn(this.anchor, this.head);
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
			let e = H.findFrom(n, r, !0) || H.findFrom(n, -r, !0);
			if (e) n = e.$head;
			else return H.near(n, r);
		}
		return t.parent.inlineContent || (i == 0 ? t = n : (t = (H.findFrom(t, -r, !0) || H.findFrom(t, r, !0)).$anchor, t.pos < n.pos != i < 0 && (t = n))), new e(t, n);
	}
};
H.jsonID("text", U);
var Tn = class e {
	constructor(e, t) {
		this.anchor = e, this.head = t;
	}
	map(t) {
		return new e(t.map(this.anchor), t.map(this.head));
	}
	resolve(e) {
		return U.between(e.resolve(this.anchor), e.resolve(this.head));
	}
}, W = class e extends H {
	constructor(e) {
		let t = e.nodeAfter, n = e.node(0).resolve(e.pos + t.nodeSize);
		super(e, n), this.node = t;
	}
	map(t, n) {
		let { deleted: r, pos: i } = n.mapResult(this.anchor), a = t.resolve(i);
		return r ? H.near(a) : new e(a);
	}
	content() {
		return new A(O.from(this.node), 0, 0);
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
		return new En(this.anchor);
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
W.prototype.visible = !1, H.jsonID("node", W);
var En = class e {
	constructor(e) {
		this.anchor = e;
	}
	map(t) {
		let { deleted: n, pos: r } = t.mapResult(this.anchor);
		return n ? new Tn(r, r) : new e(r);
	}
	resolve(e) {
		let t = e.resolve(this.anchor), n = t.nodeAfter;
		return n && W.isSelectable(n) ? new W(t) : H.near(t);
	}
}, G = class e extends H {
	constructor(e) {
		super(e.resolve(0), e.resolve(e.content.size));
	}
	replace(e, t = A.empty) {
		if (t == A.empty) {
			e.delete(0, e.doc.content.size);
			let t = H.atStart(e.doc);
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
		return Dn;
	}
};
H.jsonID("all", G);
var Dn = {
	map() {
		return this;
	},
	resolve(e) {
		return new G(e);
	}
};
function On(e, t, n, r, i, a = !1) {
	if (t.inlineContent) return U.create(e, n);
	for (let o = r - (i > 0 ? 0 : 1); i > 0 ? o < t.childCount : o >= 0; o += i) {
		let r = t.child(o);
		if (!r.isAtom) {
			let t = On(e, r, n + i, i < 0 ? r.childCount : 0, i, a);
			if (t) return t;
		} else if (!a && W.isSelectable(r)) return W.create(e, n - (i < 0 ? r.nodeSize : 0));
		n += r.nodeSize * i;
	}
	return null;
}
function kn(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof L || i instanceof R)) return;
	let a = e.mapping.maps[r], o;
	a.forEach((e, t, n, r) => {
		o ??= r;
	}), e.setSelection(H.near(e.doc.resolve(o), n));
}
function An(e, t) {
	return !t || !e ? e : e.bind(t);
}
var jn = class {
	constructor(e, t, n) {
		this.name = e, this.init = An(t.init, n), this.apply = An(t.apply, n);
	}
};
new jn("doc", {
	init(e) {
		return e.doc || e.schema.topNodeType.createAndFill();
	},
	apply(e) {
		return e.doc;
	}
}), new jn("selection", {
	init(e, t) {
		return e.selection || H.atStart(t.doc);
	},
	apply(e) {
		return e.selection;
	}
}), new jn("storedMarks", {
	init(e) {
		return e.storedMarks || null;
	},
	apply(e, t, n, r) {
		return r.selection.$cursor ? e.storedMarks : null;
	}
}), new jn("scrollToSelection", {
	init() {
		return 0;
	},
	apply(e, t) {
		return e.scrolledIntoView ? t + 1 : t;
	}
});
function Mn(e, t, n) {
	for (let r in e) {
		let i = e[r];
		i instanceof Function ? i = i.bind(t) : r == "handleDOMEvents" && (i = Mn(i, t, {})), n[r] = i;
	}
	return n;
}
var K = class {
	constructor(e) {
		this.spec = e, this.props = {}, e.props && Mn(e.props, this, this.props), this.key = e.key ? e.key.key : Pn("plugin");
	}
	getState(e) {
		return e[this.key];
	}
}, Nn = Object.create(null);
function Pn(e) {
	return e in Nn ? e + "$" + ++Nn[e] : (Nn[e] = 0, e + "$");
}
var q = class {
	constructor(e = "key") {
		this.key = Pn(e);
	}
	get(e) {
		return e.config.pluginsByKey[this.key];
	}
	getState(e) {
		return e[this.key];
	}
}, Fn = (e, t) => !e.selection.empty && (t && t(e.tr.deleteSelection().scrollIntoView()), !0);
function In(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("backward", e) : n.parentOffset > 0) ? null : n;
}
var Ln = (e, t, n) => {
	let r = In(e, n);
	if (!r) return !1;
	let i = Un(r);
	if (!i) {
		let n = r.blockRange(), i = n && Rt(n);
		return i != null && (t && t(e.tr.lift(n, i).scrollIntoView()), !0);
	}
	let a = i.nodeBefore;
	if (sr(e, i, t, -1)) return !0;
	if (r.parent.content.size == 0 && (Vn(a, "end") || W.isSelectable(a))) for (let n = r.depth;; n--) {
		let o = nn(e.doc, r.before(n), r.after(n), A.empty);
		if (o && o.slice.size < o.to - o.from) {
			if (t) {
				let n = e.tr.step(o);
				n.setSelection(Vn(a, "end") ? H.findFrom(n.doc.resolve(n.mapping.map(i.pos, -1)), -1) : W.create(n.doc, i.pos - a.nodeSize)), t(n.scrollIntoView());
			}
			return !0;
		}
		if (n == 1 || r.node(n - 1).childCount > 1) break;
	}
	return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos - a.nodeSize, i.pos).scrollIntoView()), !0) : !1;
}, Rn = (e, t, n) => {
	let r = In(e, n);
	if (!r) return !1;
	let i = Un(r);
	return i ? Bn(e, i, t) : !1;
}, zn = (e, t, n) => {
	let r = Wn(e, n);
	if (!r) return !1;
	let i = qn(r);
	return i ? Bn(e, i, t) : !1;
};
function Bn(e, t, n) {
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
	let s = nn(e.doc, i, o, A.empty);
	if (!s || s.from != i || s instanceof L && s.slice.size >= o - i) return !1;
	if (n) {
		let t = e.tr.step(s);
		t.setSelection(U.create(t.doc, i)), n(t.scrollIntoView());
	}
	return !0;
}
function Vn(e, t, n = !1) {
	for (let r = e; r; r = t == "start" ? r.firstChild : r.lastChild) {
		if (r.isTextblock) return !0;
		if (n && r.childCount != 1) return !1;
	}
	return !1;
}
var Hn = (e, t, n) => {
	let { $head: r, empty: i } = e.selection, a = r;
	if (!i) return !1;
	if (r.parent.isTextblock) {
		if (n ? !n.endOfTextblock("backward", e) : r.parentOffset > 0) return !1;
		a = Un(r);
	}
	let o = a && a.nodeBefore;
	return !o || !W.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(W.create(e.doc, a.pos - o.nodeSize)).scrollIntoView()), !0);
};
function Un(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		if (e.index(t) > 0) return e.doc.resolve(e.before(t + 1));
		if (e.node(t).type.spec.isolating) break;
	}
	return null;
}
function Wn(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("forward", e) : n.parentOffset < n.parent.content.size) ? null : n;
}
var Gn = (e, t, n) => {
	let r = Wn(e, n);
	if (!r) return !1;
	let i = qn(r);
	if (!i) return !1;
	let a = i.nodeAfter;
	if (sr(e, i, t, 1)) return !0;
	if (r.parent.content.size == 0 && (Vn(a, "start") || W.isSelectable(a))) {
		let n = nn(e.doc, r.before(), r.after(), A.empty);
		if (n && n.slice.size < n.to - n.from) {
			if (t) {
				let r = e.tr.step(n);
				r.setSelection(Vn(a, "start") ? H.findFrom(r.doc.resolve(r.mapping.map(i.pos)), 1) : W.create(r.doc, r.mapping.map(i.pos))), t(r.scrollIntoView());
			}
			return !0;
		}
	}
	return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos, i.pos + a.nodeSize).scrollIntoView()), !0) : !1;
}, Kn = (e, t, n) => {
	let { $head: r, empty: i } = e.selection, a = r;
	if (!i) return !1;
	if (r.parent.isTextblock) {
		if (n ? !n.endOfTextblock("forward", e) : r.parentOffset < r.parent.content.size) return !1;
		a = qn(r);
	}
	let o = a && a.nodeAfter;
	return !o || !W.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(W.create(e.doc, a.pos)).scrollIntoView()), !0);
};
function qn(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		let n = e.node(t);
		if (e.index(t) + 1 < n.childCount) return e.doc.resolve(e.after(t + 1));
		if (n.type.spec.isolating) break;
	}
	return null;
}
var Jn = (e, t) => {
	let n = e.selection, r = n instanceof W, i;
	if (r) {
		if (n.node.isTextblock || !B(e.doc, n.from)) return !1;
		i = n.from;
	} else if (i = $t(e.doc, n.from, -1), i == null) return !1;
	if (t) {
		let n = e.tr.join(i);
		r && n.setSelection(W.create(n.doc, i - e.doc.resolve(i).nodeBefore.nodeSize)), t(n.scrollIntoView());
	}
	return !0;
}, Yn = (e, t) => {
	let n = e.selection, r;
	if (n instanceof W) {
		if (n.node.isTextblock || !B(e.doc, n.to)) return !1;
		r = n.to;
	} else if (r = $t(e.doc, n.to, 1), r == null) return !1;
	return t && t(e.tr.join(r).scrollIntoView()), !0;
}, Xn = (e, t) => {
	let { $from: n, $to: r } = e.selection, i = n.blockRange(r), a = i && Rt(i);
	return a != null && (t && t(e.tr.lift(i, a).scrollIntoView()), !0);
}, Zn = (e, t) => {
	let { $head: n, $anchor: r } = e.selection;
	return !n.parent.type.spec.code || !n.sameParent(r) ? !1 : (t && t(e.tr.insertText("\n").scrollIntoView()), !0);
};
function Qn(e) {
	for (let t = 0; t < e.edgeCount; t++) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
var $n = (e, t) => {
	let { $head: n, $anchor: r } = e.selection;
	if (!n.parent.type.spec.code || !n.sameParent(r)) return !1;
	let i = n.node(-1), a = n.indexAfter(-1), o = Qn(i.contentMatchAt(a));
	if (!o || !i.canReplaceWith(a, a, o)) return !1;
	if (t) {
		let r = n.after(), i = e.tr.replaceWith(r, r, o.createAndFill());
		i.setSelection(H.near(i.doc.resolve(r), 1)), t(i.scrollIntoView());
	}
	return !0;
}, er = (e, t) => {
	let n = e.selection, { $from: r, $to: i } = n;
	if (n instanceof G || r.parent.inlineContent || i.parent.inlineContent) return !1;
	let a = Qn(i.parent.contentMatchAt(i.indexAfter()));
	if (!a || !a.isTextblock) return !1;
	if (t) {
		let n = (!r.parentOffset && i.index() < i.parent.childCount ? r : i).pos, o = e.tr.insert(n, a.createAndFill());
		o.setSelection(U.create(o.doc, n + 1)), t(o.scrollIntoView());
	}
	return !0;
}, tr = (e, t) => {
	let { $cursor: n } = e.selection;
	if (!n || n.parent.content.size) return !1;
	if (n.depth > 1 && n.after() != n.end(-1)) {
		let r = n.before();
		if (z(e.doc, r)) return t && t(e.tr.split(r).scrollIntoView()), !0;
	}
	let r = n.blockRange(), i = r && Rt(r);
	return i != null && (t && t(e.tr.lift(r, i).scrollIntoView()), !0);
};
function nr(e) {
	return (t, n) => {
		let { $from: r, $to: i } = t.selection;
		if (t.selection instanceof W && t.selection.node.isBlock) return !r.parentOffset || !z(t.doc, r.pos) ? !1 : (n && n(t.tr.split(r.pos).scrollIntoView()), !0);
		if (!r.depth) return !1;
		let a = [], o, s, c = !1, l = !1;
		for (let t = r.depth;; t--) if (r.node(t).isBlock) {
			c = r.end(t) == r.pos + (r.depth - t), l = r.start(t) == r.pos - (r.depth - t), s = Qn(r.node(t - 1).contentMatchAt(r.indexAfter(t - 1)));
			let n = e && e(i.parent, c, r);
			a.unshift(n || (c && s ? { type: s } : null)), o = t;
			break;
		} else {
			if (t == 1) return !1;
			a.unshift(null);
		}
		let u = t.tr;
		(t.selection instanceof U || t.selection instanceof G) && u.deleteSelection();
		let d = u.mapping.map(r.pos), f = z(u.doc, d, a.length, a);
		if (f ||= (a[0] = s ? { type: s } : null, z(u.doc, d, a.length, a)), !f) return !1;
		if (u.split(d, a.length, a), !c && l && r.node(o).type != s) {
			let e = u.mapping.map(r.before(o)), t = u.doc.resolve(e);
			s && r.node(o - 1).canReplaceWith(t.index(), t.index() + 1, s) && u.setNodeMarkup(u.mapping.map(r.before(o)), s);
		}
		return n && n(u.scrollIntoView()), !0;
	};
}
var rr = nr(), ir = (e, t) => {
	let { $from: n, to: r } = e.selection, i, a = n.sharedDepth(r);
	return a != 0 && (i = n.before(a), t && t(e.tr.setSelection(W.create(e.doc, i))), !0);
}, ar = (e, t) => (t && t(e.tr.setSelection(new G(e.doc))), !0);
function or(e, t, n) {
	let r = t.nodeBefore, i = t.nodeAfter, a = t.index();
	return !r || !i || !r.type.compatibleContent(i.type) ? !1 : !r.content.size && t.parent.canReplace(a - 1, a) ? (n && n(e.tr.delete(t.pos - r.nodeSize, t.pos).scrollIntoView()), !0) : !t.parent.canReplace(a, a + 1) || !(i.isTextblock || B(e.doc, t.pos)) ? !1 : (n && n(e.tr.join(t.pos).scrollIntoView()), !0);
}
function sr(e, t, n, r) {
	let i = t.nodeBefore, a = t.nodeAfter, o, s, c = i.type.spec.isolating || a.type.spec.isolating;
	if (!c && or(e, t, n)) return !0;
	let l = !c && t.parent.canReplace(t.index(), t.index() + 1);
	if (l && (o = (s = i.contentMatchAt(i.childCount)).findWrapping(a.type)) && s.matchType(o[0] || a.type).validEnd) {
		if (n) {
			let r = t.pos + a.nodeSize, s = O.empty;
			for (let e = o.length - 1; e >= 0; e--) s = O.from(o[e].create(null, s));
			s = O.from(i.copy(s));
			let c = e.tr.step(new R(t.pos - 1, r, t.pos, r, new A(s, 1, 0), o.length, !0)), l = c.doc.resolve(r + 2 * o.length);
			l.nodeAfter && l.nodeAfter.type == i.type && B(c.doc, l.pos) && c.join(l.pos), n(c.scrollIntoView());
		}
		return !0;
	}
	let u = a.type.spec.isolating || r > 0 && c ? null : H.findFrom(t, 1), d = u && u.$from.blockRange(u.$to), f = d && Rt(d);
	if (f != null && f >= t.depth) return n && n(e.tr.lift(d, f).scrollIntoView()), !0;
	if (l && Vn(a, "start", !0) && Vn(i, "end")) {
		let r = i, o = [];
		for (; o.push(r), !r.isTextblock;) r = r.lastChild;
		let s = a, c = 1;
		for (; !s.isTextblock; s = s.firstChild) c++;
		if (r.canReplace(r.childCount, r.childCount, s.content)) {
			if (n) {
				let r = O.empty;
				for (let e = o.length - 1; e >= 0; e--) r = O.from(o[e].copy(r));
				n(e.tr.step(new R(t.pos - o.length, t.pos + a.nodeSize, t.pos + c, t.pos + a.nodeSize - c, new A(r, o.length, 0), 0, !0)).scrollIntoView());
			}
			return !0;
		}
	}
	return !1;
}
function cr(e) {
	return function(t, n) {
		let r = t.selection, i = e < 0 ? r.$from : r.$to, a = i.depth;
		for (; i.node(a).isInline;) {
			if (!a) return !1;
			a--;
		}
		return i.node(a).isTextblock ? (n && n(t.tr.setSelection(U.create(t.doc, e < 0 ? i.start(a) : i.end(a)))), !0) : !1;
	};
}
var lr = cr(-1), ur = cr(1);
function dr(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a), s = o && Bt(o, e, t);
		return s ? (r && r(n.tr.wrap(o, s).scrollIntoView()), !0) : !1;
	};
}
function fr(e, t = null) {
	return function(n, r) {
		let i = !1;
		for (let r = 0; r < n.selection.ranges.length && !i; r++) {
			let { $from: { pos: a }, $to: { pos: o } } = n.selection.ranges[r];
			n.doc.nodesBetween(a, o, (r, a) => {
				if (i) return !1;
				if (!(!r.isTextblock || r.hasMarkup(e, t))) if (r.type == e) i = !0;
				else {
					let t = n.doc.resolve(a), r = t.index();
					i = t.parent.canReplaceWith(r, r + 1, e);
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
function pr(...e) {
	return function(t, n, r) {
		for (let i = 0; i < e.length; i++) if (e[i](t, n, r)) return !0;
		return !1;
	};
}
var mr = pr(Fn, Ln, Hn), hr = pr(Fn, Gn, Kn), J = {
	Enter: pr(Zn, er, tr, rr),
	"Mod-Enter": $n,
	Backspace: mr,
	"Mod-Backspace": mr,
	"Shift-Backspace": mr,
	Delete: hr,
	"Mod-Delete": hr,
	"Mod-a": ar
}, gr = {
	"Ctrl-h": J.Backspace,
	"Alt-Backspace": J["Mod-Backspace"],
	"Ctrl-d": J.Delete,
	"Ctrl-Alt-Backspace": J["Mod-Delete"],
	"Alt-Delete": J["Mod-Delete"],
	"Alt-d": J["Mod-Delete"],
	"Ctrl-a": lr,
	"Ctrl-e": ur
};
for (let e in J) gr[e] = J[e];
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform();
//#endregion
//#region ../../node_modules/prosemirror-schema-list/dist/index.js
function _r(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a);
		if (!o) return !1;
		let s = r ? n.tr : null;
		return vr(s, o, e, t) ? (r && r(s.scrollIntoView()), !0) : !1;
	};
}
function vr(e, t, n, r = null) {
	let i = !1, a = t, o = t.$from.doc;
	if (t.depth >= 2 && t.$from.node(t.depth - 1).type.compatibleContent(n) && t.startIndex == 0) {
		if (t.$from.index(t.depth - 1) == 0) return !1;
		let e = o.resolve(t.start - 2);
		a = new Ee(e, e, t.depth), t.endIndex < t.parent.childCount && (t = new Ee(t.$from, o.resolve(t.$to.end(t.depth)), t.depth)), i = !0;
	}
	let s = Bt(a, n, r, t);
	return s ? (e && yr(e, t, s, i, n), !0) : !1;
}
function yr(e, t, n, r, i) {
	let a = O.empty;
	for (let e = n.length - 1; e >= 0; e--) a = O.from(n[e].type.create(n[e].attrs, a));
	e.step(new R(t.start - (r ? 2 : 0), t.end, t.start, t.end, new A(a, 0, 0), n.length, !0));
	let o = 0;
	for (let e = 0; e < n.length; e++) n[e].type == i && (o = e + 1);
	let s = n.length - o, c = t.start + n.length - (r ? 2 : 0), l = t.parent;
	for (let n = t.startIndex, r = t.endIndex, i = !0; n < r; n++, i = !1) !i && z(e.doc, c, s) && (e.split(c, s), c += 2 * s), c += l.child(n).nodeSize;
	return e;
}
function br(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && t.firstChild.type == e);
		return a ? n ? r.node(a.depth - 1).type == e ? xr(t, n, e, a) : Sr(t, n, a) : !0 : !1;
	};
}
function xr(e, t, n, r) {
	let i = e.tr, a = r.end, o = r.$to.end(r.depth);
	a < o && (i.step(new R(a - 1, o, a, o, new A(O.from(n.create(null, r.parent.copy())), 1, 0), 1, !0)), r = new Ee(i.doc.resolve(r.$from.pos), i.doc.resolve(o), r.depth));
	let s = Rt(r);
	if (s == null) return !1;
	i.lift(r, s);
	let c = i.doc.resolve(i.mapping.map(a, -1) - 1);
	return B(i.doc, c.pos) && c.nodeBefore.type == c.nodeAfter.type && i.join(c.pos), t(i.scrollIntoView()), !0;
}
function Sr(e, t, n) {
	let r = e.tr, i = n.parent;
	for (let e = n.end, t = n.endIndex - 1, a = n.startIndex; t > a; t--) e -= i.child(t).nodeSize, r.delete(e - 1, e + 1);
	let a = r.doc.resolve(n.start), o = a.nodeAfter;
	if (r.mapping.map(n.end) != n.start + a.nodeAfter.nodeSize) return !1;
	let s = n.startIndex == 0, c = n.endIndex == i.childCount, l = a.node(-1), u = a.index(-1);
	if (!l.canReplace(u + +!s, u + 1, o.content.append(c ? O.empty : O.from(i)))) return !1;
	let d = a.pos, f = d + o.nodeSize;
	return r.step(new R(d - +!!s, f + +!!c, d + 1, f - 1, new A((s ? O.empty : O.from(i.copy(O.empty))).append(c ? O.empty : O.from(i.copy(O.empty))), +!s, +!c), +!s)), t(r.scrollIntoView()), !0;
}
function Cr(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && t.firstChild.type == e);
		if (!a) return !1;
		let o = a.startIndex;
		if (o == 0) return !1;
		let s = a.parent, c = s.child(o - 1);
		if (c.type != e) return !1;
		if (n) {
			let r = c.lastChild && c.lastChild.type == s.type, i = O.from(r ? e.create() : null), o = new A(O.from(e.create(null, O.from(s.type.create(null, i)))), r ? 3 : 1, 0), l = a.start, u = a.end;
			n(t.tr.step(new R(l - (r ? 3 : 1), u, l, u, o, 1, !0)).scrollIntoView());
		}
		return !0;
	};
}
for (var wr = {
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
}, Tr = {
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
}, Er = typeof navigator < "u" && /Mac/.test(navigator.platform), Dr = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent), Y = 0; Y < 10; Y++) wr[48 + Y] = wr[96 + Y] = String(Y);
for (var Y = 1; Y <= 24; Y++) wr[Y + 111] = "F" + Y;
for (var Y = 65; Y <= 90; Y++) wr[Y] = String.fromCharCode(Y + 32), Tr[Y] = String.fromCharCode(Y);
for (var Or in wr) Tr.hasOwnProperty(Or) || (Tr[Or] = wr[Or]);
//#endregion
//#region ../../node_modules/@tiptap/core/dist/index.js
typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), typeof navigator < "u" && /Win/.test(navigator.platform), E();
var kr = Object.defineProperty, Ar = (e, t) => {
	for (var n in t) kr(e, n, {
		get: t[n],
		enumerable: !0
	});
};
function jr(e) {
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
var Mr = class {
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
	buildProps(e, t = !0) {
		let { rawCommands: n, editor: r, state: i } = this, { view: a } = r, o = {
			tr: e,
			editor: r,
			view: a,
			state: jr({
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
}, Nr = {};
Ar(Nr, {
	blur: () => Pr,
	clearContent: () => Fr,
	clearNodes: () => Ir,
	command: () => Lr,
	createParagraphNear: () => Rr,
	cut: () => zr,
	deleteCurrentNode: () => Br,
	deleteNode: () => Vr,
	deleteRange: () => Hr,
	deleteSelection: () => Kr,
	enter: () => qr,
	exitCode: () => Jr,
	extendMarkRange: () => ei,
	first: () => ti,
	focus: () => si,
	forEach: () => ci,
	insertContent: () => li,
	insertContentAt: () => hi,
	insertDefaultBlock: () => _i,
	joinBackward: () => bi,
	joinDown: () => yi,
	joinForward: () => xi,
	joinItemBackward: () => Si,
	joinItemForward: () => Ci,
	joinTextblockBackward: () => wi,
	joinTextblockForward: () => Ti,
	joinUp: () => vi,
	keyboardShortcut: () => Oi,
	lift: () => Ai,
	liftEmptyBlock: () => ji,
	liftListItem: () => Mi,
	newlineInCode: () => Ni,
	resetAttributes: () => Ii,
	scrollIntoView: () => Li,
	selectAll: () => Ri,
	selectNodeBackward: () => zi,
	selectNodeForward: () => Bi,
	selectParentNode: () => Vi,
	selectTextblockEnd: () => Hi,
	selectTextblockStart: () => Ui,
	setContent: () => Gi,
	setMark: () => ha,
	setMeta: () => ga,
	setNode: () => _a,
	setNodeSelection: () => va,
	setTextDirection: () => ya,
	setTextSelection: () => ba,
	sinkListItem: () => xa,
	splitBlock: () => Ca,
	splitListItem: () => wa,
	toggleList: () => Aa,
	toggleMark: () => ja,
	toggleNode: () => Ma,
	toggleWrap: () => Na,
	undoInputRule: () => Pa,
	unsetAllMarks: () => Fa,
	unsetMark: () => Ia,
	unsetTextDirection: () => La,
	updateAttributes: () => Ra,
	wrapIn: () => za,
	wrapInList: () => Ba
});
var Pr = () => ({ editor: e, view: t }) => (requestAnimationFrame(() => {
	var n;
	e.isDestroyed || (t.dom.blur(), (n = window == null ? void 0 : window.getSelection()) == null || n.removeAllRanges());
}), !0), Fr = (e = !0) => ({ commands: t }) => t.setContent("", { emitUpdate: e }), Ir = () => ({ state: e, tr: t, dispatch: n }) => {
	let { selection: r } = t, { ranges: i } = r;
	return n && i.forEach(({ $from: n, $to: r }) => {
		e.doc.nodesBetween(n.pos, r.pos, (e, n) => {
			if (e.type.isText) return;
			let { doc: r, mapping: i } = t, a = r.resolve(i.map(n)), o = r.resolve(i.map(n + e.nodeSize)), s = a.blockRange(o);
			if (!s) return;
			let c = Rt(s);
			if (e.type.isTextblock) {
				let { defaultType: e } = a.parent.contentMatchAt(a.index());
				t.setNodeMarkup(s.start, e);
			}
			(c || c === 0) && t.lift(s, c);
		});
	}), !0;
}, Lr = (e) => (t) => e(t), Rr = () => ({ state: e, dispatch: t }) => er(e, t), zr = (e, t) => ({ editor: n, tr: r }) => {
	let { state: i } = n, a = i.doc.slice(e.from, e.to);
	r.deleteRange(e.from, e.to);
	let o = r.mapping.map(t);
	return r.insert(o, a.content), r.setSelection(new U(r.doc.resolve(Math.max(o - 1, 0)))), !0;
}, Br = () => ({ tr: e, dispatch: t }) => {
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
function X(e, t) {
	if (typeof e == "string") {
		if (!t.nodes[e]) throw Error(`There is no node type named '${e}'. Maybe you forgot to add the extension?`);
		return t.nodes[e];
	}
	return e;
}
var Vr = (e) => ({ tr: t, state: n, dispatch: r }) => {
	let i = X(e, n.schema), a = t.selection.$anchor;
	for (let e = a.depth; e > 0; --e) if (a.node(e).type === i) {
		if (r) {
			let n = a.before(e), r = a.after(e);
			t.delete(n, r).scrollIntoView();
		}
		return !0;
	}
	return !1;
}, Hr = (e) => ({ tr: t, dispatch: n }) => {
	let { from: r, to: i } = e;
	return n && t.delete(r, i), !0;
}, Ur = (e) => e.content ? /^text(\*|\+)/.test(e.content) : !1, Wr = (e, t, n) => {
	if (!e.parent.isInline || n === "left" && e.pos > e.start() || n === "right" && e.pos < e.end()) return e.pos;
	let r = t.nodes[e.parent.type.name].spec;
	return Ur(r) ? n === "left" ? e.start() - 1 : e.end() + 1 : e.pos;
}, Gr = (e, t, n) => ({
	from: Wr(e, n, "left"),
	to: Wr(t, n, "right")
}), Kr = () => ({ state: e, dispatch: t }) => {
	if (e.selection.empty) return !1;
	if (t) {
		let n = e.tr, { ranges: r } = e.selection, i = n.steps.length;
		r.forEach((t) => {
			let r = n.mapping.slice(i), { from: a, to: o } = Gr(n.doc.resolve(r.map(t.$from.pos)), n.doc.resolve(r.map(t.$to.pos)), e.schema);
			n.deleteRange(a, o);
		}), n.selection.empty || n.setSelection(U.near(n.doc.resolve(n.selection.from))), n.scrollIntoView(), t(n);
	}
	return !0;
}, qr = () => ({ commands: e }) => e.keyboardShortcut("Enter"), Jr = () => ({ state: e, dispatch: t }) => $n(e, t);
function Yr(e) {
	return Object.prototype.toString.call(e) === "[object RegExp]";
}
function Xr(e, t, n = { strict: !0 }) {
	let r = Object.keys(t);
	return !r.length || r.every((r) => n.strict ? t[r] === e[r] : Yr(t[r]) ? t[r].test(e[r]) : t[r] === e[r]);
}
function Zr(e, t, n = {}) {
	return e.find((e) => e.type === t && Xr(Object.fromEntries(Object.keys(n).map((t) => [t, e.attrs[t]])), n));
}
function Qr(e, t, n = {}) {
	return !!Zr(e, t, n);
}
function $r(e, t, n) {
	if (!e || !t) return;
	let r = e.parent.childAfter(e.parentOffset);
	if ((!r.node || !r.node.marks.some((e) => e.type === t)) && (r = e.parent.childBefore(e.parentOffset)), !r.node || !r.node.marks.some((e) => e.type === t)) return;
	if (!n) {
		let e = r.node.marks.find((e) => e.type === t);
		e && (n = e.attrs);
	}
	if (!Zr([...r.node.marks], t, n)) return;
	let i = r.index, a = e.start() + r.offset, o = i + 1, s = a + r.node.nodeSize;
	for (; i > 0 && Qr([...e.parent.child(i - 1).marks], t, n);) --i, a -= e.parent.child(i).nodeSize;
	for (; o < e.parent.childCount && Qr([...e.parent.child(o).marks], t, n);) s += e.parent.child(o).nodeSize, o += 1;
	return {
		from: a,
		to: s
	};
}
function Z(e, t) {
	if (typeof e == "string") {
		if (!t.marks[e]) throw Error(`There is no mark type named '${e}'. Maybe you forgot to add the extension?`);
		return t.marks[e];
	}
	return e;
}
var ei = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let a = Z(e, r.schema), { doc: o, selection: s } = n, { $from: c, from: l, to: u } = s;
	if (i) {
		let e = $r(c, a, t);
		if (e && e.from <= l && e.to >= u) {
			let t = U.create(o, e.from, e.to);
			n.setSelection(t);
		}
	}
	return !0;
}, ti = (e) => (t) => {
	let n = typeof e == "function" ? e(t) : e;
	for (let e = 0; e < n.length; e += 1) if (n[e](t)) return !0;
	return !1;
};
function ni(e) {
	return e instanceof U;
}
function Q(e = 0, t = 0, n = 0) {
	return Math.min(Math.max(e, t), n);
}
function ri(e, t = null) {
	if (!t) return null;
	let n = H.atStart(e), r = H.atEnd(e);
	if (t === "start" || t === !0) return n;
	if (t === "end") return r;
	let i = n.from, a = r.to;
	return t === "all" ? U.create(e, Q(0, i, a), Q(e.content.size, i, a)) : U.create(e, Q(t, i, a), Q(t, i, a));
}
function ii() {
	return ["Android"].includes(navigator.platform) || /android/i.test(navigator.userAgent);
}
function ai() {
	return [
		"iPad Simulator",
		"iPhone Simulator",
		"iPod Simulator",
		"iPad",
		"iPhone",
		"iPod"
	].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function oi() {
	return typeof navigator < "u" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
var si = (e = null, t = {}) => ({ editor: n, view: r, tr: i, dispatch: a }) => {
	t = {
		scrollIntoView: !0,
		...t
	};
	let o = () => {
		(ai() || ii()) && r.dom.focus(), oi() && !ai() && !ii() && r.dom.focus({ preventScroll: !0 }), requestAnimationFrame(() => {
			n.isDestroyed || (r.focus(), t?.scrollIntoView && n.commands.scrollIntoView());
		});
	};
	try {
		if (r.hasFocus() && e === null || e === !1) return !0;
	} catch {
		return !1;
	}
	if (a && e === null && !ni(n.state.selection)) return o(), !0;
	let s = ri(i.doc, e) || n.state.selection, c = n.state.selection.eq(s);
	return a && (c || i.setSelection(s), c && i.storedMarks && i.setStoredMarks(i.storedMarks), o()), !0;
}, ci = (e, t) => (n) => e.every((e, r) => t(e, {
	...n,
	index: r
})), li = (e, t) => ({ tr: n, commands: r }) => r.insertContentAt({
	from: n.selection.from,
	to: n.selection.to
}, e, t), ui = (e) => {
	let t = e.childNodes;
	for (let n = t.length - 1; n >= 0; --n) {
		let r = t[n];
		r.nodeType === 3 && r.nodeValue && /^(\n\s\s|\n)$/.test(r.nodeValue) ? e.removeChild(r) : r.nodeType === 1 && ui(r);
	}
	return e;
};
function di(e) {
	if (typeof window > "u") throw Error("[tiptap error]: there is no window object available, so this function cannot be used");
	let t = `<body>${e}</body>`, n = new window.DOMParser().parseFromString(t, "text/html").body;
	return ui(n);
}
function fi(e, t, n) {
	if (e instanceof N || e instanceof O) return e;
	n = {
		slice: !0,
		parseOptions: {},
		...n
	};
	let r = typeof e == "object" && !!e, i = typeof e == "string";
	if (r) try {
		if (Array.isArray(e) && e.length > 0) return O.fromArray(e.map((e) => t.nodeFromJSON(e)));
		let r = t.nodeFromJSON(e);
		return n.errorOnInvalidContent && r.check(), r;
	} catch (r) {
		if (n.errorOnInvalidContent) throw Error("[tiptap error]: Invalid JSON content", { cause: r });
		return console.warn("[tiptap warn]: Invalid content.", "Passed value:", e, "Error:", r), fi("", t, n);
	}
	if (i) {
		if (n.errorOnInvalidContent) {
			let r = !1, i = "", a = new Qe({
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
			if (n.slice ? nt.fromSchema(a).parseSlice(di(e), n.parseOptions) : nt.fromSchema(a).parse(di(e), n.parseOptions), n.errorOnInvalidContent && r) throw Error("[tiptap error]: Invalid HTML content", { cause: /* @__PURE__ */ Error(`Invalid element found: ${i}`) });
		}
		let r = nt.fromSchema(t);
		return n.slice ? r.parseSlice(di(e), n.parseOptions).content : r.parse(di(e), n.parseOptions);
	}
	return fi("", t, n);
}
function pi(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof L || i instanceof R)) return;
	let a = e.mapping.maps[r], o = 0;
	a.forEach((e, t, n, r) => {
		o === 0 && (o = r);
	}), e.setSelection(H.near(e.doc.resolve(o), n));
}
var mi = (e) => !("type" in e), hi = (e, t, n) => ({ tr: r, dispatch: i, editor: a }) => {
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
			fi(t, a.schema, {
				parseOptions: s,
				errorOnInvalidContent: !0
			});
		} catch (e) {
			o(e);
		}
		try {
			i = fi(t, a.schema, {
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
		}, u = !0, d = !0;
		if ((mi(i) ? i : [i]).forEach((e) => {
			e.check(), u = u ? e.isText && e.marks.length === 0 : !1, d = d ? e.isBlock : !1;
		}), c === l && d) {
			let { parent: e } = r.doc.resolve(c);
			e.isTextblock && !e.type.spec.code && !e.childCount && (--c, l += 1);
		}
		let f;
		if (u) {
			if (Array.isArray(t)) f = t.map((e) => e.text || "").join("");
			else if (t instanceof O) {
				let e = "";
				t.forEach((t) => {
					t.text && (e += t.text);
				}), f = e;
			} else f = typeof t == "object" && t && t.text ? t.text : t;
			r.insertText(f, c, l);
		} else {
			f = i;
			let e = r.doc.resolve(c), t = e.node(), n = e.parentOffset === 0, a = t.isText || t.isTextblock, o = t.content.size > 0;
			n && a && o && d && (c = Math.max(0, c - 1)), r.replaceWith(c, l, f);
		}
		n.updateSelection && pi(r, r.steps.length - 1, -1), n.applyInputRules && r.setMeta("applyInputRules", {
			from: c,
			text: f
		}), n.applyPasteRules && r.setMeta("applyPasteRules", {
			from: c,
			text: f
		});
	}
	return !0;
};
function gi(e) {
	for (let t = 0; t < e.edgeCount; t += 1) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
var _i = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
	let { pos: i, attrs: a, content: o, updateSelection: s = !0 } = e, c;
	c = typeof i == "number" ? t.doc.resolve(i) : i || t.selection.$from;
	let l = gi(c.parent.contentMatchAt(c.index()));
	if (!l) return !1;
	let u = Object.keys(l.spec.attrs || {}), d = a ? Object.fromEntries(Object.entries(a).filter(([e]) => u.includes(e))) : {}, f;
	if (o) {
		let e = fi(o, r.schema);
		f = l.createAndFill(d, e);
	} else f = l.createAndFill(d);
	return f ? (n && (t.insert(c.pos, f), s && pi(t, t.steps.length - 1, -1)), !0) : !1;
}, vi = () => ({ state: e, dispatch: t }) => Jn(e, t), yi = () => ({ state: e, dispatch: t }) => Yn(e, t), bi = () => ({ state: e, dispatch: t }) => Ln(e, t), xi = () => ({ state: e, dispatch: t }) => Gn(e, t), Si = () => ({ state: e, dispatch: t, tr: n }) => {
	try {
		let r = $t(e.doc, e.selection.$from.pos, -1);
		return r != null && (n.join(r, 2), t && t(n), !0);
	} catch {
		return !1;
	}
}, Ci = () => ({ state: e, dispatch: t, tr: n }) => {
	try {
		let r = $t(e.doc, e.selection.$from.pos, 1);
		return r != null && (n.join(r, 2), t && t(n), !0);
	} catch {
		return !1;
	}
}, wi = () => ({ state: e, dispatch: t }) => Rn(e, t), Ti = () => ({ state: e, dispatch: t }) => zn(e, t);
function Ei() {
	return typeof navigator < "u" && /Mac/.test(navigator.platform);
}
function Di(e) {
	let t = e.split(/-(?!$)/), n = t[t.length - 1];
	n === "Space" && (n = " ");
	let r, i, a, o;
	for (let e = 0; e < t.length - 1; e += 1) {
		let n = t[e];
		if (/^(cmd|meta|m)$/i.test(n)) o = !0;
		else if (/^a(lt)?$/i.test(n)) r = !0;
		else if (/^(c|ctrl|control)$/i.test(n)) i = !0;
		else if (/^s(hift)?$/i.test(n)) a = !0;
		else if (/^mod$/i.test(n)) ai() || Ei() ? o = !0 : i = !0;
		else throw Error(`Unrecognized modifier name: ${n}`);
	}
	return r && (n = `Alt-${n}`), i && (n = `Ctrl-${n}`), o && (n = `Meta-${n}`), a && (n = `Shift-${n}`), n;
}
var Oi = (e) => ({ editor: t, view: n, tr: r, dispatch: i }) => {
	let a = Di(e).split(/-(?!$)/), o = a.find((e) => ![
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
function ki(e, t, n = {}) {
	let { from: r, to: i, empty: a } = e.selection, o = t ? X(t, e.schema) : null, s = [];
	e.doc.nodesBetween(r, i, (e, t) => {
		if (e.isText) return;
		let n = Math.max(r, t), a = Math.min(i, t + e.nodeSize);
		s.push({
			node: e,
			from: n,
			to: a
		});
	});
	let c = i - r, l = s.filter((e) => !o || o.name === e.node.type.name).filter((e) => Xr(e.node.attrs, n, { strict: !1 }));
	return a ? !!l.length : l.reduce((e, t) => e + t.to - t.from, 0) >= c;
}
var Ai = (e, t = {}) => ({ state: n, dispatch: r }) => ki(n, X(e, n.schema), t) ? Xn(n, r) : !1, ji = () => ({ state: e, dispatch: t }) => tr(e, t), Mi = (e) => ({ state: t, dispatch: n }) => br(X(e, t.schema))(t, n), Ni = () => ({ state: e, dispatch: t }) => Zn(e, t);
function Pi(e, t) {
	return t.nodes[e] ? "node" : t.marks[e] ? "mark" : null;
}
function Fi(e, t) {
	let n = typeof t == "string" ? [t] : t;
	return Object.keys(e).reduce((t, r) => (n.includes(r) || (t[r] = e[r]), t), {});
}
var Ii = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let a = null, o = null, s = Pi(typeof e == "string" ? e : e.name, r.schema);
	if (!s) return !1;
	s === "node" && (a = X(e, r.schema)), s === "mark" && (o = Z(e, r.schema));
	let c = !1;
	return n.selection.ranges.forEach((e) => {
		r.doc.nodesBetween(e.$from.pos, e.$to.pos, (e, r) => {
			a && a === e.type && (c = !0, i && n.setNodeMarkup(r, void 0, Fi(e.attrs, t))), o && e.marks.length && e.marks.forEach((a) => {
				o === a.type && (c = !0, i && n.addMark(r, r + e.nodeSize, o.create(Fi(a.attrs, t))));
			});
		});
	}), c;
}, Li = () => ({ tr: e, dispatch: t }) => (t && e.scrollIntoView(), !0), Ri = () => ({ tr: e, dispatch: t }) => {
	if (t) {
		let t = new G(e.doc);
		e.setSelection(t);
	}
	return !0;
}, zi = () => ({ state: e, dispatch: t }) => Hn(e, t), Bi = () => ({ state: e, dispatch: t }) => Kn(e, t), Vi = () => ({ state: e, dispatch: t }) => ir(e, t), Hi = () => ({ state: e, dispatch: t }) => ur(e, t), Ui = () => ({ state: e, dispatch: t }) => lr(e, t);
function Wi(e, t, n = {}, r = {}) {
	return fi(e, t, {
		slice: !1,
		parseOptions: n,
		errorOnInvalidContent: r.errorOnInvalidContent
	});
}
var Gi = (e, { errorOnInvalidContent: t, emitUpdate: n = !0, parseOptions: r = {} } = {}) => ({ editor: i, tr: a, dispatch: o, commands: s }) => {
	let { doc: c } = a;
	if (r.preserveWhitespace !== "full") {
		let s = Wi(e, i.schema, r, { errorOnInvalidContent: t ?? i.options.enableContentCheck });
		return o && a.replaceWith(0, c.content.size, s).setMeta("preventUpdate", !n), !0;
	}
	return o && a.setMeta("preventUpdate", !n), s.insertContentAt({
		from: 0,
		to: c.content.size
	}, e, {
		parseOptions: r,
		errorOnInvalidContent: t ?? i.options.enableContentCheck
	});
};
function Ki(e, t) {
	let n = Z(t, e.schema), { from: r, to: i, empty: a } = e.selection, o = [];
	a ? (e.storedMarks && o.push(...e.storedMarks), o.push(...e.selection.$head.marks())) : e.doc.nodesBetween(r, i, (e) => {
		o.push(...e.marks);
	});
	let s = o.find((e) => e.type.name === n.name);
	return s ? { ...s.attrs } : {};
}
function qi(e, t) {
	let n = new bn(e);
	return t.forEach((e) => {
		e.steps.forEach((e) => {
			n.step(e);
		});
	}), n;
}
function Ji(e, t) {
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
function Yi(e) {
	return (t) => Ji(t.$from, e);
}
function Xi(e, t, n) {
	return e.config[t] === void 0 && e.parent ? Xi(e.parent, t, n) : typeof e.config[t] == "function" ? e.config[t].bind({
		...n,
		parent: e.parent ? Xi(e.parent, t, n) : null
	}) : e.config[t];
}
function Zi(e) {
	return typeof e == "function";
}
function Qi(e, t = void 0, ...n) {
	return Zi(e) ? t ? e.bind(t)(...n) : e(...n) : e;
}
function $i(e) {
	return {
		baseExtensions: e.filter((e) => e.type === "extension"),
		nodeExtensions: e.filter((e) => e.type === "node"),
		markExtensions: e.filter((e) => e.type === "mark")
	};
}
function ea(e) {
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
function ta(e) {
	let t = [], n = ea(e || ""), r = n.length;
	for (let e = 0; e < r; e += 1) {
		let r = n[e], i = r.indexOf(":");
		if (i === -1) continue;
		let a = r.slice(0, i).trim(), o = r.slice(i + 1).trim();
		a && o && t.push([a, o]);
	}
	return t;
}
function na(...e) {
	return e.filter((e) => !!e).reduce((e, t) => {
		let n = { ...e };
		return Object.entries(t).forEach(([e, t]) => {
			if (!n[e]) {
				n[e] = t;
				return;
			}
			if (e === "class") {
				let r = t ? String(t).split(" ") : [], i = n[e] ? n[e].split(" ") : [], a = r.filter((e) => !i.includes(e));
				n[e] = [...i, ...a].join(" ");
			} else if (e === "style") {
				let r = new Map([...ta(n[e]), ...ta(t)]);
				n[e] = Array.from(r.entries()).map(([e, t]) => `${e}: ${t}`).join("; ");
			} else n[e] = t;
		}), n;
	}, {});
}
function ra(e, t) {
	return t.filter((t) => t.type === e.type.name).filter((e) => e.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(e.attrs) || {} : { [t.name]: e.attrs[t.name] }).reduce((e, t) => na(e, t), {});
}
function ia(e, t, n) {
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
		e.isText && (s += (e?.text)?.slice(Math.max(r, n) - n, i - n));
	}), s;
}
function aa(e) {
	return Object.fromEntries(Object.entries(e.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
function oa(e, t = JSON.stringify) {
	let n = {};
	return e.filter((e) => {
		let r = t(e);
		return Object.prototype.hasOwnProperty.call(n, r) ? !1 : n[r] = !0;
	});
}
function sa(e) {
	let t = oa(e);
	return t.length === 1 ? t : t.filter((e, n) => !t.filter((e, t) => t !== n).some((t) => e.oldRange.from >= t.oldRange.from && e.oldRange.to <= t.oldRange.to && e.newRange.from >= t.newRange.from && e.newRange.to <= t.newRange.to));
}
function ca(e) {
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
	}), sa(r);
}
function la(e, t, n) {
	return Object.fromEntries(Object.entries(n).filter(([n]) => {
		let r = e.find((e) => e.type === t && e.name === n);
		return r ? r.attribute.keepOnSplit : !1;
	}));
}
function ua(e, t, n = {}) {
	let { empty: r, ranges: i } = e.selection, a = t ? Z(t, e.schema) : null;
	if (r) return !!(e.storedMarks || e.selection.$from.marks()).filter((e) => !a || a.name === e.type.name).find((e) => Xr(e.attrs, n, { strict: !1 }));
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
	let c = s.filter((e) => !a || a.name === e.mark.type.name).filter((e) => Xr(e.mark.attrs, n, { strict: !1 })).reduce((e, t) => e + t.to - t.from, 0), l = s.filter((e) => !a || e.mark.type !== a && e.mark.type.excludes(a)).reduce((e, t) => e + t.to - t.from, 0);
	return (c > 0 ? c + l : c) >= o;
}
function da(e, t) {
	let { nodeExtensions: n } = $i(t), r = n.find((t) => t.name === e);
	if (!r) return !1;
	let i = Qi(Xi(r, "group", {
		name: r.name,
		options: r.options,
		storage: r.storage
	}));
	return typeof i == "string" && i.split(" ").includes("list");
}
function fa(e, { checkChildren: t = !0, ignoreWhitespace: n = !1 } = {}) {
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
			r !== !1 && (fa(e, {
				ignoreWhitespace: n,
				checkChildren: t
			}) || (r = !1));
		}), r;
	}
	return !1;
}
function pa({ selection: e, pos: t, nodeSize: n, selectedOnTextSelection: r = !1 }) {
	let { from: i, to: a } = e;
	return !!(i <= t && a >= t + n || r && ni(e) && i > t && a < t + n);
}
function ma(e, t, n) {
	let { selection: r } = t, i = null;
	if (ni(r) && (i = r.$cursor), i) {
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
var ha = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let { selection: a } = n, { empty: o, ranges: s } = a, c = Z(e, r.schema);
	if (i) if (o) {
		let e = Ki(r, c);
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
	return ma(r, n, c);
}, ga = (e, t) => ({ tr: n }) => (n.setMeta(e, t), !0), _a = (e, t = {}) => ({ state: n, dispatch: r, chain: i }) => {
	let a = X(e, n.schema), o;
	return n.selection.$anchor.sameParent(n.selection.$head) && (o = n.selection.$anchor.parent.attrs), a.isTextblock ? i().command(({ commands: e }) => fr(a, {
		...o,
		...t
	})(n) ? !0 : e.clearNodes()).command(({ state: e }) => fr(a, {
		...o,
		...t
	})(e, r)).run() : (console.warn("[tiptap warn]: Currently \"setNode()\" only supports text block nodes."), !1);
}, va = (e) => ({ tr: t, dispatch: n }) => {
	if (n) {
		let { doc: n } = t, r = Q(e, 0, n.content.size), i = W.create(n, r);
		t.setSelection(i);
	}
	return !0;
}, ya = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let { selection: a } = r, o, s;
	return typeof t == "number" ? (o = t, s = t) : t && "from" in t && "to" in t ? (o = t.from, s = t.to) : (o = a.from, s = a.to), i && n.doc.nodesBetween(o, s, (t, r) => {
		t.isText || n.setNodeMarkup(r, void 0, {
			...t.attrs,
			dir: e
		});
	}), !0;
}, ba = (e) => ({ tr: t, dispatch: n }) => {
	if (n) {
		let { doc: n } = t, { from: r, to: i } = typeof e == "number" ? {
			from: e,
			to: e
		} : e, a = U.atStart(n).from, o = U.atEnd(n).to, s = Q(r, a, o), c = Q(i, a, o), l = U.create(n, s, c);
		t.setSelection(l);
	}
	return !0;
}, xa = (e) => ({ state: t, dispatch: n }) => Cr(X(e, t.schema))(t, n);
function Sa(e, t) {
	let n = e.storedMarks || e.selection.$to.parentOffset && e.selection.$from.marks();
	if (n) {
		let r = n.filter((e) => t?.includes(e.type.name));
		e.tr.ensureMarks(r);
	}
}
var Ca = ({ keepMarks: e = !0 } = {}) => ({ tr: t, state: n, dispatch: r, editor: i }) => {
	let { selection: a, doc: o } = t, { $from: s, $to: c } = a, l = i.extensionManager.attributes, u = la(l, s.node().type.name, s.node().attrs);
	if (a instanceof W && a.node.isBlock) return !s.parentOffset || !z(o, s.pos) ? !1 : (r && (e && Sa(n, i.extensionManager.splittableMarks), t.split(s.pos).scrollIntoView()), !0);
	if (!s.parent.isBlock) return !1;
	let d = c.parentOffset === c.parent.content.size, f = s.depth === 0 ? void 0 : gi(s.node(-1).contentMatchAt(s.indexAfter(-1))), p = d && f ? [{
		type: f,
		attrs: u
	}] : void 0, m = z(t.doc, t.mapping.map(s.pos), 1, p);
	if (!p && !m && z(t.doc, t.mapping.map(s.pos), 1, f ? [{ type: f }] : void 0) && (m = !0, p = f ? [{
		type: f,
		attrs: u
	}] : void 0), r) {
		if (m && (a instanceof U && t.deleteSelection(), t.split(t.mapping.map(s.pos), 1, p), f && !d && !s.parentOffset && s.parent.type !== f)) {
			let e = t.mapping.map(s.before()), n = t.doc.resolve(e);
			s.node(-1).canReplaceWith(n.index(), n.index() + 1, f) && t.setNodeMarkup(t.mapping.map(s.before()), f);
		}
		e && Sa(n, i.extensionManager.splittableMarks), t.scrollIntoView();
	}
	return m;
}, wa = (e, t = {}) => ({ tr: n, state: r, dispatch: i, editor: a }) => {
	let o = X(e, r.schema), { $from: s, $to: c } = r.selection, l = r.selection.node;
	if (l && l.isBlock || s.depth < 2 || !s.sameParent(c)) return !1;
	let u = s.node(-1);
	if (u.type !== o) return !1;
	let d = a.extensionManager.attributes;
	if (s.parent.content.size === 0 && s.node(-1).childCount === s.indexAfter(-1)) {
		if (s.depth === 2 || s.node(-3).type !== o || s.index(-2) !== s.node(-2).childCount - 1) return !1;
		if (i) {
			let e = O.empty, r = s.index(-1) ? 1 : s.index(-2) ? 2 : 3;
			for (let t = s.depth - r; t >= s.depth - 3; --t) e = O.from(s.node(t).copy(e));
			let i = s.indexAfter(-1) < s.node(-2).childCount ? 1 : s.indexAfter(-2) < s.node(-3).childCount ? 2 : 3, a = {
				...la(d, s.node().type.name, s.node().attrs),
				...t
			}, c = o.contentMatch.defaultType?.createAndFill(a) || void 0;
			e = e.append(O.from(o.createAndFill(null, c) || void 0));
			let l = s.before(s.depth - (r - 1));
			n.replace(l, s.after(-i), new A(e, 4 - r, 0));
			let u = -1;
			n.doc.nodesBetween(l, n.doc.content.size, (e, t) => {
				if (u > -1) return !1;
				e.isTextblock && e.content.size === 0 && (u = t + 1);
			}), u > -1 && n.setSelection(U.near(n.doc.resolve(u))), n.scrollIntoView();
		}
		return !0;
	}
	let f = c.pos === s.end() ? u.contentMatchAt(0).defaultType : null, p = {
		...la(d, u.type.name, u.attrs),
		...t
	}, m = {
		...la(d, s.node().type.name, s.node().attrs),
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
	if (!z(n.doc, s.pos, 2)) return !1;
	if (i) {
		let { selection: e, storedMarks: t } = r, { splittableMarks: o } = a.extensionManager, c = t || e.$to.parentOffset && e.$from.marks();
		if (n.split(s.pos, 2, h).scrollIntoView(), !c || !i) return !0;
		let l = c.filter((e) => o.includes(e.type.name));
		n.ensureMarks(l);
	}
	return !0;
};
function Ta(e) {
	return !e || e === "1" ? null : e;
}
function Ea(e, t) {
	return Ta(e) === Ta(t);
}
var Da = (e, t) => {
	let n = Yi((e) => e.type === t)(e.selection);
	if (!n) return !0;
	let r = e.doc.resolve(Math.max(0, n.pos - 1)).before(n.depth);
	if (r === void 0) return !0;
	let i = e.doc.nodeAt(r);
	return !(n.node.type === i?.type && B(e.doc, n.pos)) || !Ea(n.node.attrs.type, i?.attrs.type) || e.join(n.pos), !0;
}, Oa = (e, t) => {
	let n = Yi((e) => e.type === t)(e.selection);
	if (!n) return !0;
	let r = e.doc.resolve(n.start).after(n.depth);
	if (r === void 0) return !0;
	let i = e.doc.nodeAt(r);
	return !(n.node.type === i?.type && B(e.doc, r)) || !Ea(n.node.attrs.type, i?.attrs.type) || e.join(r), !0;
};
function ka(e) {
	let t = e.doc, n = t.firstChild;
	if (!n) return null;
	let r = t.resolve(1), i = t.resolve(n.nodeSize - 1);
	return U.between(r, i);
}
var Aa = (e, t, n, r = {}) => ({ editor: i, tr: a, state: o, dispatch: s, chain: c, commands: l, can: u }) => {
	let { extensions: d, splittableMarks: f } = i.extensionManager, p = X(e, o.schema), m = X(t, o.schema), { selection: h, storedMarks: g } = o, { $from: _, $to: v } = h, y = _.blockRange(v), b = g || h.$to.parentOffset && h.$from.marks();
	if (!y) return !1;
	let ee = Yi((e) => da(e.type.name, d))(h), te = h.from === 0 && h.to === o.doc.content.size, x = o.doc.content.content, S = x.length === 1 ? x[0] : null, C = te && S && da(S.type.name, d) ? {
		node: S,
		pos: 0,
		depth: 0
	} : null, w = ee ?? C, ne = !!ee && y.depth >= 1 && y.depth - ee.depth <= 1, T = !!C;
	if ((ne || T) && w) {
		if (w.node.type === p) return te && T ? c().command(({ tr: e, dispatch: t }) => {
			let n = ka(e);
			return n ? (e.setSelection(n), t && t(e), !0) : !1;
		}).liftListItem(m).run() : l.liftListItem(m);
		if (da(w.node.type.name, d) && p.validContent(w.node.content)) return c().command(() => (a.setNodeMarkup(w.pos, p), !0)).command(() => Da(a, p)).command(() => Oa(a, p)).run();
	}
	return !n || !b || !s ? c().command(() => u().wrapInList(p, r) ? !0 : l.clearNodes()).wrapInList(p, r).command(() => Da(a, p)).command(() => Oa(a, p)).run() : c().command(() => {
		let e = u().wrapInList(p, r), t = b.filter((e) => f.includes(e.type.name));
		return a.ensureMarks(t), e ? !0 : l.clearNodes();
	}).wrapInList(p, r).command(() => Da(a, p)).command(() => Oa(a, p)).run();
}, ja = (e, t = {}, n = {}) => ({ state: r, commands: i }) => {
	let { extendEmptyMarkRange: a = !1 } = n, o = Z(e, r.schema);
	return ua(r, o, t) ? i.unsetMark(o, { extendEmptyMarkRange: a }) : i.setMark(o, t);
}, Ma = (e, t, n = {}) => ({ state: r, commands: i }) => {
	let a = X(e, r.schema), o = X(t, r.schema), s = ki(r, a, n), c;
	return r.selection.$anchor.sameParent(r.selection.$head) && (c = r.selection.$anchor.parent.attrs), s ? i.setNode(o, c) : i.setNode(a, {
		...c,
		...n
	});
}, Na = (e, t = {}) => ({ state: n, commands: r }) => {
	let i = X(e, n.schema);
	return ki(n, i, t) ? r.lift(i) : r.wrapIn(i, t);
}, Pa = () => ({ state: e, dispatch: t }) => {
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
}, Fa = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
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
}, Ia = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let { extendEmptyMarkRange: a = !1 } = t, { selection: o } = n, s = Z(e, r.schema), { $from: c, empty: l, ranges: u } = o;
	if (!i) return !0;
	if (l && a) {
		let { from: e, to: t } = o, r = $r(c, s, c.marks().find((e) => e.type === s)?.attrs);
		r && (e = r.from, t = r.to), n.removeMark(e, t, s);
	} else u.forEach((e) => {
		n.removeMark(e.$from.pos, e.$to.pos, s);
	});
	return n.removeStoredMark(s), !0;
}, La = (e) => ({ tr: t, state: n, dispatch: r }) => {
	let { selection: i } = n, a, o;
	return typeof e == "number" ? (a = e, o = e) : e && "from" in e && "to" in e ? (a = e.from, o = e.to) : (a = i.from, o = i.to), r && t.doc.nodesBetween(a, o, (e, n) => {
		if (e.isText) return;
		let r = { ...e.attrs };
		delete r.dir, t.setNodeMarkup(n, void 0, r);
	}), !0;
}, Ra = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let a = null, o = null, s = Pi(typeof e == "string" ? e : e.name, r.schema);
	if (!s) return !1;
	s === "node" && (a = X(e, r.schema)), s === "mark" && (o = Z(e, r.schema));
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
}, za = (e, t = {}) => ({ state: n, dispatch: r }) => dr(X(e, n.schema), t)(n, r), Ba = (e, t = {}) => ({ state: n, dispatch: r }) => _r(X(e, n.schema), t)(n, r);
function Va(e) {
	return Object.prototype.toString.call(e).slice(8, -1);
}
function Ha(e) {
	return Va(e) === "Object" && e.constructor === Object && Object.getPrototypeOf(e) === Object.prototype;
}
Ar({}, {
	createAtomBlockMarkdownSpec: () => Ga,
	createBlockMarkdownSpec: () => Ka,
	createInlineMarkdownSpec: () => Ya,
	parseAttributes: () => Ua,
	parseIndentedBlocks: () => Xa,
	renderNestedMarkdownContent: () => Za,
	serializeAttributes: () => Wa
});
function Ua(e) {
	if (!e?.trim()) return {};
	let t = {}, n = [], r = e.replace(/["']([^"']*)["']/g, (e) => (n.push(e), `__QUOTED_${n.length - 1}__`)), i = r.match(/(?:^|\s)\.([\w-]+)/g);
	i && (t.class = i.map((e) => e.trim().slice(1)).join(" "));
	let a = r.match(/(?:^|\s)#([\w-]+)/);
	a && (t.id = a[1]), Array.from(r.matchAll(/([a-zA-Z][\w-]*)\s*=\s*(__QUOTED_\d+__)/g)).forEach(([, e, r]) => {
		let i = parseInt(r.match(/__QUOTED_(\d+)__/)?.[1] || "0", 10), a = n[i];
		a && (t[e] = a.slice(1, -1));
	});
	let o = r.replace(/(?:^|\s)\.([\w-]+)/g, "").replace(/(?:^|\s)#([\w-]+)/g, "").replace(/([a-zA-Z][\w-]*)\s*=\s*__QUOTED_\d+__/g, "").trim();
	return o && o.split(/\s+/).filter(Boolean).forEach((e) => {
		e.match(/^[a-zA-Z][\w-]*$/) && (t[e] = !0);
	}), t;
}
function Wa(e) {
	if (!e || Object.keys(e).length === 0) return "";
	let t = [];
	return e.class && String(e.class).split(/\s+/).filter(Boolean).forEach((e) => t.push(`.${e}`)), e.id && t.push(`#${e.id}`), Object.entries(e).forEach(([e, n]) => {
		e !== "class" && e !== "id" && (n === !0 ? t.push(e) : n !== !1 && n != null && t.push(`${e}="${String(n)}"`));
	}), t.join(" ");
}
function Ga(e) {
	let { nodeName: t, name: n, parseAttributes: r = Ua, serializeAttributes: i = Wa, defaultAttributes: a = {}, requiredAttributes: o = [], allowedAttributes: s } = e, c = n || t, l = (e) => {
		if (!s) return e;
		let t = {};
		return s.forEach((n) => {
			n in e && (t[n] = e[n]);
		}), t;
	};
	return {
		parseMarkdown: (e, n) => {
			let r = {
				...a,
				...e.attributes
			};
			return n.createNode(t, r, []);
		},
		markdownTokenizer: {
			name: t,
			level: "block",
			start(e) {
				let t = RegExp(`^:::${c}(?:\\s|$)`, "m"), n = e.match(t)?.index;
				return n === void 0 ? -1 : n;
			},
			tokenize(e, n, i) {
				let a = RegExp(`^:::${c}(?:\\s+\\{([^}]*)\\})?\\s*:::(?:\\n|$)`), s = e.match(a);
				if (!s) return;
				let l = s[1] || "", u = r(l);
				if (!o.find((e) => !(e in u))) return {
					type: t,
					raw: s[0],
					attributes: u
				};
			}
		},
		renderMarkdown: (e) => {
			let t = l(e.attrs || {}), n = i(t), r = n ? ` {${n}}` : "";
			return `:::${c}${r} :::`;
		}
	};
}
function Ka(e) {
	let { nodeName: t, name: n, getContent: r, parseAttributes: i = Ua, serializeAttributes: a = Wa, defaultAttributes: o = {}, content: s = "block", allowedAttributes: c } = e, l = n || t, u = (e) => {
		if (!c) return e;
		let t = {};
		return c.forEach((n) => {
			n in e && (t[n] = e[n]);
		}), t;
	};
	return {
		parseMarkdown: (e, n) => {
			let i;
			if (r) {
				let t = r(e);
				i = typeof t == "string" ? [{
					type: "text",
					text: t
				}] : t;
			} else i = s === "block" ? n.parseChildren(e.tokens || []) : n.parseInline(e.tokens || []);
			let a = {
				...o,
				...e.attributes
			};
			return n.createNode(t, a, i);
		},
		markdownTokenizer: {
			name: t,
			level: "block",
			start(e) {
				let t = RegExp(`^:::${l}`, "m"), n = e.match(t)?.index;
				return n === void 0 ? -1 : n;
			},
			tokenize(e, n, r) {
				let a = RegExp(`^:::${l}(?:\\s+\\{([^}]*)\\})?\\s*\\n`), o = e.match(a);
				if (!o) return;
				let [c, u = ""] = o, d = i(u), f = 1, p = c.length, m = "", h = /^:::([\w-]*)(\s.*)?/gm, g = e.slice(p);
				for (h.lastIndex = 0;;) {
					let n = h.exec(g);
					if (n === null) break;
					let i = n.index, a = n[1];
					if (!n[2]?.endsWith(":::")) {
						if (a) f += 1;
						else if (--f, f === 0) {
							let a = g.slice(0, i);
							m = a.trim();
							let o = e.slice(0, p + i + n[0].length), c = [];
							if (m) if (s === "block") for (c = r.blockTokens(a), c.forEach((e) => {
								e.text && (!e.tokens || e.tokens.length === 0) && (e.tokens = r.inlineTokens(e.text));
							}); c.length > 0;) {
								let e = c[c.length - 1];
								if (e.type === "paragraph" && (!e.text || e.text.trim() === "")) c.pop();
								else break;
							}
							else c = r.inlineTokens(m);
							return {
								type: t,
								raw: o,
								attributes: d,
								content: m,
								tokens: c
							};
						}
					}
				}
			}
		},
		renderMarkdown: (e, t) => {
			let n = u(e.attrs || {}), r = a(n), i = r ? ` {${r}}` : "", o = t.renderChildren(e.content || [], "\n\n");
			return `:::${l}${i}

${o}

:::`;
		}
	};
}
function qa(e) {
	if (!e.trim()) return {};
	let t = {}, n = /(\w+)=(?:"([^"]*)"|'([^']*)')/g, r = n.exec(e);
	for (; r !== null;) {
		let [, i, a, o] = r;
		t[i] = a || o, r = n.exec(e);
	}
	return t;
}
function Ja(e) {
	return Object.entries(e).filter(([, e]) => e != null).map(([e, t]) => `${e}="${t}"`).join(" ");
}
function Ya(e) {
	let { nodeName: t, name: n, getContent: r, parseAttributes: i = qa, serializeAttributes: a = Ja, defaultAttributes: o = {}, selfClosing: s = !1, allowedAttributes: c } = e, l = n || t, u = (e) => {
		if (!c) return e;
		let t = {};
		return c.forEach((n) => {
			let r = typeof n == "string" ? n : n.name, i = typeof n == "string" ? void 0 : n.skipIfDefault;
			if (r in e) {
				let n = e[r];
				if (i !== void 0 && n === i) return;
				t[r] = n;
			}
		}), t;
	}, d = l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return {
		parseMarkdown: (e, n) => {
			let i = {
				...o,
				...e.attributes
			};
			if (s) return n.createNode(t, i);
			let a = r ? r(e) : e.content || "";
			return a ? n.createNode(t, i, [n.createTextNode(a)]) : n.createNode(t, i, []);
		},
		markdownTokenizer: {
			name: t,
			level: "inline",
			start(e) {
				let t = RegExp(s ? `\\[${d}\\s*[^\\]]*\\]` : `\\[${d}\\s*[^\\]]*\\][\\s\\S]*?\\[\\/${d}\\]`), n = e.match(t)?.index;
				return n === void 0 ? -1 : n;
			},
			tokenize(e, n, r) {
				let a = RegExp(s ? `^\\[${d}\\s*([^\\]]*)\\]` : `^\\[${d}\\s*([^\\]]*)\\]([\\s\\S]*?)\\[\\/${d}\\]`), o = e.match(a);
				if (!o) return;
				let c = "", l = "";
				if (s) {
					let [, e] = o;
					l = e;
				} else {
					let [, e, t] = o;
					l = e, c = t || "";
				}
				let u = i(l.trim());
				return {
					type: t,
					raw: o[0],
					content: c.trim(),
					attributes: u
				};
			}
		},
		renderMarkdown: (e) => {
			let t = "";
			r ? t = r(e) : e.content && e.content.length > 0 && (t = e.content.filter((e) => e.type === "text").map((e) => e.text).join(""));
			let n = u(e.attrs || {}), i = a(n), o = i ? ` ${i}` : "";
			return s ? `[${l}${o}]` : `[${l}${o}]${t}[/${l}]`;
		}
	};
}
function Xa(e, t, n) {
	let r = e.split("\n"), i = [], a = "", o = 0, s = t.baseIndentSize || 2;
	for (; o < r.length;) {
		let e = r[o], c = e.match(t.itemPattern);
		if (!c) {
			if (i.length > 0) break;
			if (e.trim() === "") {
				o += 1, a = `${a}${e}
`;
				continue;
			}
			return;
		}
		let l = t.extractItemData(c), { indentLevel: u, mainContent: d } = l;
		a = `${a}${e}
`;
		let f = [d];
		for (o += 1; o < r.length;) {
			let e = r[o];
			if (e.trim() === "") {
				let t = r.slice(o + 1).findIndex((e) => e.trim() !== "");
				if (t === -1) break;
				if ((r[o + 1 + t].match(/^(\s*)/)?.[1]?.length || 0) > u) {
					f.push(e), a = `${a}${e}
`, o += 1;
					continue;
				}
				break;
			}
			if ((e.match(/^(\s*)/)?.[1]?.length || 0) > u) f.push(e), a = `${a}${e}
`, o += 1;
			else break;
		}
		let p, m = f.slice(1);
		if (m.length > 0) {
			let e = m.map((e) => e.slice(u + s)).join("\n");
			e.trim() && (p = t.customNestedParser ? t.customNestedParser(e) : n.blockTokens(e));
		}
		let h = t.createToken(l, p);
		i.push(h);
	}
	if (i.length !== 0) return {
		items: i,
		raw: a
	};
}
function Za(e, t, n, r) {
	if (!e || !Array.isArray(e.content)) return "";
	let i = typeof n == "function" ? n(r) : n, [a, ...o] = e.content, s = `${i}${t.renderChildren([a])}`;
	return o && o.length > 0 && o.forEach((e, n) => {
		let r = t.renderChild?.call(t, e, n + 1) ?? t.renderChildren([e]);
		if (r != null) {
			let n = r.split("\n").map((e) => e ? t.indent(e) : t.indent("")).join("\n");
			s += e.type === "paragraph" ? `

${n}` : `
${n}`;
		}
	}), s;
}
function Qa(e, t) {
	let n = { ...e };
	return Ha(e) && Ha(t) && Object.keys(t).forEach((r) => {
		Ha(t[r]) && Ha(e[r]) ? n[r] = Qa(e[r], t[r]) : n[r] = t[r];
	}), n;
}
var $a = class {
	constructor(e = {}) {
		this.type = "extendable", this.parent = null, this.child = null, this.name = "", this.config = { name: this.name }, this.config = {
			...this.config,
			...e
		}, this.name = this.config.name;
	}
	get options() {
		return { ...Qi(Xi(this, "addOptions", { name: this.name })) };
	}
	get storage() {
		return { ...Qi(Xi(this, "addStorage", {
			name: this.name,
			options: this.options
		})) };
	}
	configure(e = {}) {
		let t = this.extend({
			...this.config,
			addOptions: () => Qa(this.options, e)
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
};
Ar({}, {
	ClipboardTextSerializer: () => eo,
	Commands: () => to,
	Delete: () => no,
	Drop: () => ro,
	Editable: () => io,
	FocusEvents: () => oo,
	Keymap: () => so,
	Paste: () => co,
	Tabindex: () => lo,
	TextDirection: () => uo,
	focusEventsPluginKey: () => ao
});
var $ = class e extends $a {
	constructor() {
		super(...arguments), this.type = "extension";
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
}, eo = $.create({
	name: "clipboardTextSerializer",
	addOptions() {
		return { blockSeparator: void 0 };
	},
	addProseMirrorPlugins() {
		return [new K({
			key: new q("clipboardTextSerializer"),
			props: { clipboardTextSerializer: () => {
				let { editor: e } = this, { state: t, schema: n } = e, { doc: r, selection: i } = t, a = aa(n), { blockSeparator: o } = this.options, s = {
					...o === void 0 ? {} : { blockSeparator: o },
					textSerializers: a
				};
				return [...i.ranges].sort((e, t) => e.$from.pos - t.$from.pos).map(({ $from: e, $to: t }) => ia(r, {
					from: e.pos,
					to: t.pos
				}, s)).join(o ?? "\n\n");
			} }
		})];
	}
}), to = $.create({
	name: "commands",
	addCommands() {
		return { ...Nr };
	}
}), no = $.create({
	name: "delete",
	onUpdate({ transaction: e, appendedTransactions: t }) {
		let n = () => {
			var n;
			if (((n = this.editor.options.coreExtensionOptions?.delete)?.filterTransaction)?.call(n, e) ?? e.getMeta("y-sync$")) return;
			let r = qi(e.before, [e, ...t]);
			ca(r).forEach((t) => {
				r.mapping.mapResult(t.oldRange.from).deletedAfter && r.mapping.mapResult(t.oldRange.to).deletedBefore && r.before.nodesBetween(t.oldRange.from, t.oldRange.to, (n, i) => {
					let a = i + n.nodeSize - 2, o = t.oldRange.from <= i && a <= t.oldRange.to;
					this.editor.emit("delete", {
						type: "node",
						node: n,
						from: i,
						to: a,
						newFrom: r.mapping.map(i),
						newTo: r.mapping.map(a),
						deletedRange: t.oldRange,
						newRange: t.newRange,
						partial: !o,
						editor: this.editor,
						transaction: e,
						combinedTransform: r
					});
				});
			});
			let i = r.mapping;
			r.steps.forEach((t, n) => {
				if (t instanceof At) {
					let a = i.slice(n).map(t.from, -1), o = i.slice(n).map(t.to), s = i.invert().map(a, -1), c = i.invert().map(o), l = a > 0 && r.doc.nodeAt(a - 1)?.marks.some((e) => e.eq(t.mark)), u = r.doc.nodeAt(o)?.marks.some((e) => e.eq(t.mark));
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
							from: a,
							to: o
						},
						partial: !!(u || l),
						editor: this.editor,
						transaction: e,
						combinedTransform: r
					});
				}
			});
		};
		this.editor.options.coreExtensionOptions?.delete?.async ?? !0 ? setTimeout(n, 0) : n();
	}
}), ro = $.create({
	name: "drop",
	addProseMirrorPlugins() {
		return [new K({
			key: new q("tiptapDrop"),
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
}), io = $.create({
	name: "editable",
	addProseMirrorPlugins() {
		return [new K({
			key: new q("editable"),
			props: { editable: () => this.editor.options.editable }
		})];
	}
}), ao = new q("focusEvents"), oo = $.create({
	name: "focusEvents",
	addProseMirrorPlugins() {
		let { editor: e } = this;
		return [new K({
			key: ao,
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
}), so = $.create({
	name: "keymap",
	addKeyboardShortcuts() {
		let e = () => this.editor.commands.first(({ commands: e }) => [
			() => e.undoInputRule(),
			() => e.command(({ tr: t }) => {
				let { selection: n, doc: r } = t, { empty: i, $anchor: a } = n, { pos: o, parent: s } = a, c = a.parent.isTextblock && o > 0 ? t.doc.resolve(o - 1) : a, l = c.parent.type.spec.isolating, u = a.pos - a.parentOffset, d = l && c.parent.childCount === 1 ? u === a.pos : H.atStart(r).from === o;
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
		return ai() || Ei() ? i : r;
	},
	addProseMirrorPlugins() {
		return [new K({
			key: new q("clearDocument"),
			appendTransaction: (e, t, n) => {
				if (e.some((e) => e.getMeta("composition"))) return;
				let r = e.some((e) => e.docChanged) && !t.doc.eq(n.doc), i = e.some((e) => e.getMeta("preventClearDocument"));
				if (!r || i) return;
				let { empty: a, from: o, to: s } = t.selection, c = H.atStart(t.doc).from, l = H.atEnd(t.doc).to;
				if (a || o !== c || s !== l || !fa(n.doc)) return;
				let u = n.tr, d = jr({
					state: n,
					transaction: u
				}), { commands: f } = new Mr({
					editor: this.editor,
					state: d
				});
				if (f.clearNodes(), u.steps.length) return u;
			}
		})];
	}
}), co = $.create({
	name: "paste",
	addProseMirrorPlugins() {
		return [new K({
			key: new q("tiptapPaste"),
			props: { handlePaste: (e, t, n) => {
				this.editor.emit("paste", {
					editor: this.editor,
					event: t,
					slice: n
				});
			} }
		})];
	}
}), lo = $.create({
	name: "tabindex",
	addOptions() {
		return { value: void 0 };
	},
	addProseMirrorPlugins() {
		return [new K({
			key: new q("tabindex"),
			props: { attributes: () => !this.editor.isEditable && this.options.value === void 0 ? {} : { tabindex: this.options.value ?? "0" } }
		})];
	}
}), uo = $.create({
	name: "textDirection",
	addOptions() {
		return { direction: void 0 };
	},
	addGlobalAttributes() {
		if (!this.options.direction) return [];
		let { nodeExtensions: e } = $i(this.extensions);
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
		return [new K({
			key: new q("textDirection"),
			props: { attributes: () => {
				let e = this.options.direction;
				return e ? { dir: e } : {};
			} }
		})];
	}
}), fo = class e extends $a {
	constructor() {
		super(...arguments), this.type = "node";
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
}, po = class {
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
		var t;
		let { view: n } = this.editor, r = e.target, i = r.nodeType === 3 ? r.parentElement?.closest("[data-drag-handle]") : r.closest("[data-drag-handle]");
		if (!this.dom || this.contentDOM?.contains(r) || !i) return;
		let a = 0, o = 0;
		if (this.dom !== i) {
			let t = this.dom.getBoundingClientRect(), n = i.getBoundingClientRect(), r = e.offsetX ?? e.nativeEvent?.offsetX, s = e.offsetY ?? e.nativeEvent?.offsetY;
			a = n.x - t.x + r, o = n.y - t.y + s;
		}
		let s = this.dom.cloneNode(!0);
		try {
			let e = this.dom.getBoundingClientRect();
			s.style.width = `${Math.round(e.width)}px`, s.style.height = `${Math.round(e.height)}px`, s.style.boxSizing = "border-box", s.style.pointerEvents = "none";
		} catch {}
		let c = null;
		try {
			c = document.createElement("div"), c.style.position = "absolute", c.style.top = "-9999px", c.style.left = "-9999px", c.style.pointerEvents = "none", c.appendChild(s), document.body.appendChild(c), (t = e.dataTransfer) == null || t.setDragImage(s, a, o);
		} finally {
			c && setTimeout(() => {
				try {
					c?.remove();
				} catch {}
			}, 0);
		}
		let l = this.getPos();
		if (typeof l != "number") return;
		let u = W.create(n.state.doc, l), d = n.state.tr.setSelection(u);
		n.dispatch(d);
	}
	stopEvent(e) {
		if (!this.dom) return !1;
		if (typeof this.options.stopEvent == "function") return this.options.stopEvent({ event: e });
		let t = e.target;
		if (!(this.dom.contains(t) && !this.contentDOM?.contains(t))) return !1;
		let n = e.type.startsWith("drag"), r = e.type === "dragover" || e.type === "dragenter", i = e.type === "drop";
		if (([
			"INPUT",
			"BUTTON",
			"SELECT",
			"TEXTAREA"
		].includes(t.tagName) || t.isContentEditable) && !i && !n) return !0;
		let { isEditable: a } = this.editor, { isDragging: o } = this, s = !!this.node.type.spec.draggable, c = W.isSelectable(this.node), l = e.type === "copy", u = e.type === "paste", d = e.type === "cut", f = e.type === "mousedown";
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
		return !this.dom || !this.contentDOM ? !0 : typeof this.options.ignoreMutation == "function" ? this.options.ignoreMutation({ mutation: e }) : this.node.isLeaf || this.node.isAtom ? !0 : e.type === "selection" || this.dom.contains(e.target) && e.type === "childList" && (ai() || ii()) && this.editor.isFocused && [...Array.from(e.addedNodes), ...Array.from(e.removedNodes)].every((e) => e.isContentEditable) ? !1 : this.contentDOM === e.target && e.type === "attributes" || !this.contentDOM.contains(e.target);
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
}, mo = /* @__PURE__ */ S(((t, n) => {
	n.exports = { ...e };
})), ho = /* @__PURE__ */ S(((e) => {
	var t = mo();
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
})), go = /* @__PURE__ */ S(((e, t) => {
	t.exports = ho();
})), _o = /* @__PURE__ */ S(((e) => {
	var t = mo();
	go().useSyncExternalStore, t.useRef, t.useEffect, t.useMemo, t.useDebugValue;
})), vo = /* @__PURE__ */ S(((e, t) => {
	t.exports = _o();
})), yo = go();
vo();
var bo = (...e) => (t) => {
	e.forEach((e) => {
		typeof e == "function" ? e(t) : e && (e.current = t);
	});
}, xo = ({ contentComponent: e }) => {
	let t = (0, yo.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getServerSnapshot);
	return /* @__PURE__ */ _(g, { children: Object.values(t) });
};
function So() {
	let e = /* @__PURE__ */ new Set(), t = {}, n = !1, r = () => {
		n || !e.size || (n = !0, queueMicrotask(() => {
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
var Co = class extends t.Component {
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
			t.append(...e.view.dom.parentNode.childNodes), e.setOptions({ element: t }), e.contentComponent = So(), e.createNodeViews(), e.isEditorContentInitialized = !0, this.forceUpdate();
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
			ref: bo(t, this.editorContentRef),
			...n
		}), e?.contentComponent && /* @__PURE__ */ _(xo, { contentComponent: e.contentComponent })] });
	}
}, wo = o((e, n) => {
	let r = t.useMemo(() => Math.floor(Math.random() * 4294967295).toString(), [e.editor]);
	return t.createElement(Co, {
		key: r,
		innerRef: n,
		...e
	});
}), To = t.memo(wo);
typeof window > "u" || typeof window < "u" && window.next;
var Eo = r({ editor: null });
Eo.Consumer;
var Do = r({
	onDragStart: () => {},
	nodeViewContentChildren: void 0,
	nodeViewContentRef: () => {}
}), Oo = () => l(Do), ko = t.forwardRef((e, t) => {
	let { onDragStart: n } = Oo(), r = e.as || "div";
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
function Ao(e) {
	return !!(typeof e == "function" && e.prototype && e.prototype.isReactComponent);
}
function jo(e) {
	return !!(typeof e == "object" && e.$$typeof && (e.$$typeof.toString() === "Symbol(react.forward_ref)" || e.$$typeof.description === "react.forward_ref"));
}
function Mo(e) {
	return !!(typeof e == "object" && e.$$typeof && (e.$$typeof.toString() === "Symbol(react.memo)" || e.$$typeof.description === "react.memo"));
}
function No(e) {
	if (Ao(e) || jo(e)) return !0;
	if (Mo(e)) {
		let t = e.type;
		if (t) return Ao(t) || jo(t);
	}
	return !1;
}
function Po() {
	try {
		if (p) return parseInt(p.split(".")[0], 10) >= 19;
	} catch {}
	return !1;
}
var Fo = class {
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
		let t = this.component, n = this.props, r = this.editor, i = Po(), a = No(t), o = { ...n };
		o.ref && !(i || a) && delete o.ref, !o.ref && (i || a) && (o.ref = (e) => {
			this.ref = e;
		}), this.reactElement = /* @__PURE__ */ _(t, { ...o }), (e = r?.contentComponent) == null || e.setRenderer(this.id, this);
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
		this.destroyed = !0, (e = this.editor?.contentComponent) == null || e.removeRenderer(this.id);
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
function Io(e) {
	let t = e.getRootNode(), n = typeof t.getSelection == "function" ? t.getSelection() : (e.ownerDocument?.defaultView)?.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let { anchorNode: r, anchorOffset: i, focusNode: a, focusOffset: o } = n;
	return !r || !a || !e.contains(r) || !e.contains(a) ? null : () => {
		try {
			n.setBaseAndExtent(r, i, a, o);
		} catch {}
	};
}
var Lo = class extends po {
	constructor(e, t, n) {
		if (super(e, t, n), this.selectionRafId = null, this.handlePositionUpdate = () => {
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
					let t = Io(this.contentDOMElement);
					e.appendChild(this.contentDOMElement), t?.();
				}
			}
		}, n = this.component, r = c((e) => /* @__PURE__ */ _(Do.Provider, {
			value: t,
			children: i(n, e)
		}));
		r.displayName = "ReactNodeView";
		let o = this.node.isInline ? "span" : "div";
		this.options.as && (o = this.options.as);
		let { className: s = "" } = this.options;
		this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this), this.renderer = new Fo(r, {
			editor: this.editor,
			props: e,
			as: o,
			className: `node-${this.node.type.name} ${s}`.trim()
		}), this.editor.on("selectionUpdate", this.handleSelectionUpdate), this.updateElementAttributes(), this.currentPos = this.getPos();
	}
	get dom() {
		if (this.renderer.element.firstElementChild && !this.renderer.element.firstElementChild?.hasAttribute("data-node-view-wrapper")) throw Error("Please use the NodeViewWrapper component for your node view.");
		return this.renderer.element;
	}
	get contentDOM() {
		return this.node.isLeaf ? null : this.contentDOMElement;
	}
	handleSelectionUpdate() {
		this.selectionRafId &&= (cancelAnimationFrame(this.selectionRafId), null), this.selectionRafId = requestAnimationFrame(() => {
			this.selectionRafId = null;
			let e = this.currentPos;
			if (typeof e == "number") if (pa({
				selection: this.editor.state.selection,
				pos: e,
				nodeSize: this.node.nodeSize,
				selectedOnTextSelection: this.options.selectedOnTextSelection
			})) {
				if (this.renderer.props.selected) return;
				this.selectNode();
			} else {
				if (!this.renderer.props.selected) return;
				this.deselectNode();
			}
		});
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
		this.renderer.updateProps({ selected: !0 }), this.renderer.element.classList.add("ProseMirror-selectednode");
	}
	deselectNode() {
		this.renderer.updateProps({ selected: !1 }), this.renderer.element.classList.remove("ProseMirror-selectednode");
	}
	destroy() {
		this.renderer.destroy(), this.editor.off("selectionUpdate", this.handleSelectionUpdate), this.options.trackNodeViewPosition && this.editor.off("update", this.handlePositionUpdate), this.contentDOMElement = null, this.selectionRafId &&= (cancelAnimationFrame(this.selectionRafId), null);
	}
	updateElementAttributes() {
		if (this.options.attrs) {
			let e = {};
			if (typeof this.options.attrs == "function") {
				let t = this.editor.extensionManager.attributes, n = ra(this.node, t);
				e = this.options.attrs({
					node: this.node,
					HTMLAttributes: n
				});
			} else e = this.options.attrs;
			this.renderer.updateAttributes(e);
		}
	}
};
function Ro(e, t) {
	return (n) => n.editor.contentComponent ? new Lo(e, n, t) : {};
}
var zo = r({ get editor() {
	throw Error("useTiptap must be used within a <Tiptap> provider");
} });
zo.displayName = "TiptapContext";
var Bo = () => l(zo);
function Vo({ children: e, ...t }) {
	let n = "editor" in t ? t.editor : t.instance;
	if (!n) throw Error("Tiptap: An editor instance is required. Pass a non-null `editor` prop.");
	let r = u(() => ({ editor: n }), [n]), i = u(() => ({ editor: n }), [n]);
	return /* @__PURE__ */ _(Eo.Provider, {
		value: i,
		children: /* @__PURE__ */ _(zo.Provider, {
			value: r,
			children: e
		})
	});
}
Vo.displayName = "Tiptap";
function Ho({ ...e }) {
	let { editor: t } = Bo();
	return /* @__PURE__ */ _(To, {
		editor: t,
		...e
	});
}
Ho.displayName = "Tiptap.Content", Object.assign(Vo, { Content: Ho });
//#endregion
//#region resources/js/components/detail-panel.tsx
function Uo(e, t) {
	let n = e > 0 ? Math.min(Math.floor(Math.log10(e) / 3), Go.length - 1) : 0;
	return new Intl.NumberFormat(t, {
		style: "unit",
		unit: Go[n],
		maximumFractionDigits: n === 0 ? 0 : 1
	}).format(e / 1e3 ** n);
}
function Wo({ row: e, update: t, remove: n, onClose: r }) {
	let { t: i } = (0, T.useT)("media"), { locale: a, timezone: o } = (0, T.useFormatContext)(), s = (0, T.useEffectDispatcher)(), [c, l] = f(e.name), [u, d] = f(e.alt ?? ""), [p, m] = f(!1), [h, g] = f(!1), y = i("media.actions.delete.label", "Delete");
	async function b(t, n = {}) {
		m(!0);
		let i = await (0, T.runAction)(() => (0, T.apiFetch)(t.props.endpoint ?? "", {
			method: t.props.method ?? "post",
			ref: t.props.ref ?? "",
			body: JSON.stringify({
				media_id: e.id,
				...n
			}),
			throwOnError: !1
		}), s);
		m(!1), i && r();
	}
	return /* @__PURE__ */ _(T.Dialog, {
		open: !0,
		onOpenChange: (e) => {
			e || r();
		},
		children: /* @__PURE__ */ v(T.DialogContent, {
			"aria-describedby": void 0,
			className: "flex flex-col gap-5",
			"data-test": "media-detail",
			placement: "end",
			width: "md",
			children: [
				/* @__PURE__ */ _(T.DialogHeader, {
					closeLabel: (0, T.translate)("lattice", "common.close", "Close"),
					title: e.name
				}),
				e.url !== null && e.mime_type.startsWith("image/") ? /* @__PURE__ */ _(T.PreviewableImage, {
					alt: e.alt ?? e.name,
					className: "h-64 w-full rounded-lt-sm object-contain",
					previewable: !0,
					src: e.url,
					testId: "media-detail-preview"
				}) : /* @__PURE__ */ _("p", {
					className: "flex h-32 items-center justify-center rounded-lt-sm border border-lt-border text-sm text-lt-muted-fg",
					children: e.mime_type
				}),
				/* @__PURE__ */ v("dl", {
					className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm",
					children: [
						/* @__PURE__ */ _("dt", {
							className: "text-lt-muted-fg",
							children: i("media.columns.type", "Type")
						}),
						/* @__PURE__ */ _("dd", {
							className: "text-lt-fg",
							children: e.mime_type
						}),
						/* @__PURE__ */ _("dt", {
							className: "text-lt-muted-fg",
							children: i("media.columns.size", "Size")
						}),
						/* @__PURE__ */ _("dd", {
							className: "text-lt-fg",
							children: Uo(e.size, a)
						}),
						/* @__PURE__ */ _("dt", {
							className: "text-lt-muted-fg",
							children: i("media.columns.uploaded-at", "Uploaded")
						}),
						/* @__PURE__ */ _("dd", {
							className: "text-lt-fg",
							children: (0, T.formatDateValue)(e.created_at, {
								dateStyle: "medium",
								timeStyle: "short"
							}, {
								locale: a,
								timeZone: o
							})
						}),
						/* @__PURE__ */ _("dt", {
							className: "text-lt-muted-fg",
							children: i("media.columns.usage", "Used")
						}),
						/* @__PURE__ */ _("dd", {
							className: "text-lt-fg",
							children: e.attachments_count
						})
					]
				}),
				/* @__PURE__ */ v(T.Label, {
					className: "grid gap-1.5",
					children: [i("media.columns.name", "Name"), /* @__PURE__ */ _(T.Input, {
						"data-test": "media-detail-name",
						maxLength: 255,
						onChange: (e) => l(e.target.value),
						value: c
					})]
				}),
				/* @__PURE__ */ v(T.Label, {
					className: "grid gap-1.5",
					children: [i("media.columns.alt", "Alt text"), /* @__PURE__ */ _(T.Input, {
						"data-test": "media-detail-alt",
						maxLength: 255,
						onChange: (e) => d(e.target.value),
						value: u
					})]
				}),
				/* @__PURE__ */ v("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ _(T.Button, {
							"data-test": "media-detail-save",
							disabled: p || c.trim() === "",
							onClick: () => void b(t, {
								name: c,
								alt: u === "" ? null : u
							}),
							type: "button",
							variant: "primary",
							children: i("media.detail.save", "Save")
						}),
						e.url !== null && /* @__PURE__ */ _("a", {
							className: "text-sm text-lt-primary underline underline-offset-2",
							href: e.url,
							rel: "noreferrer",
							target: "_blank",
							children: i("media.detail.download", "Download")
						}),
						/* @__PURE__ */ _(T.Button, {
							className: "ms-auto",
							"data-test": "media-detail-delete",
							disabled: p,
							onClick: () => g(!0),
							type: "button",
							variant: "danger",
							children: y
						})
					]
				}),
				h && /* @__PURE__ */ _(T.ConfirmDialog, {
					cancelLabel: (0, T.translate)("lattice", "common.cancel", "Cancel"),
					confirmLabel: y,
					confirmVariant: "danger",
					description: i("media.actions.delete.confirm-description", "This file is attached to {{count}} record(s). Deleting removes it everywhere.", { count: e.attachments_count }),
					onCancel: () => g(!1),
					onConfirm: () => void b(n),
					processing: p,
					title: i("media.actions.delete.confirm-title", "Delete this file?")
				})
			]
		})
	});
}
var Go, Ko = x((() => {
	Go = [
		"byte",
		"kilobyte",
		"megabyte",
		"gigabyte",
		"terabyte"
	];
}));
//#endregion
//#region resources/js/components/use-media-upload.ts
function qo({ body: e }, t) {
	return e.errors?.[`files.${t}`]?.[0] ?? e.message;
}
function Jo({ endpoint: e, ref: t, signed: n }) {
	let r = (0, T.useEffectDispatcher)(), { t: i } = (0, T.useT)("media"), [a, o] = f([]);
	function s(e, t) {
		o((n) => n.map((n) => n.id === e ? {
			...n,
			...t
		} : n));
	}
	function c(e) {
		o((t) => t.filter((t) => t.id !== e));
	}
	function l(e, t, n) {
		if (t.ok) {
			c(e.id);
			return;
		}
		s(e.id, {
			status: "error",
			reason: qo(t, n)
		});
	}
	async function u(e) {
		let t = {}, n;
		return {
			ok: await (0, T.runAction)(async () => {
				let n = await e();
				return t = await n.clone().json().catch(() => ({})), n;
			}, (e) => {
				n = e.find((e) => e.type === "reload-component"), r(e.filter((e) => e.type !== "toast" && e.type !== "reload-component"));
			}),
			body: t,
			reload: n
		};
	}
	async function d(n) {
		let r = new FormData();
		r.append("files[]", n.file);
		let i = await u(() => (0, T.xhrTransfer)({
			url: e,
			method: "POST",
			body: r,
			headers: (0, T.withHeaders)(t, {
				Accept: "application/json",
				"X-Requested-With": "XMLHttpRequest",
				"X-XSRF-TOKEN": (0, T.xsrfToken)()
			}),
			onProgress: (e) => s(n.id, { progress: e })
		}));
		return l(n, i, 0), {
			ok: i.ok,
			reload: i.reload
		};
	}
	async function p(n) {
		let r = await u(() => (0, T.requestSignedUpload)(e, {
			ref: t,
			target: "files",
			filename: n.file.name,
			contentType: n.file.type
		}));
		if (!r.ok) return l(n, r, 0), null;
		let i = r.body;
		return (await (0, T.xhrTransfer)({
			url: i.url,
			method: i.method.toUpperCase(),
			body: n.file,
			headers: i.headers,
			onProgress: (e) => s(n.id, { progress: e })
		}).catch(() => null))?.ok === !0 ? i.key : (l(n, {
			ok: !1,
			body: {}
		}, 0), null);
	}
	async function m(n) {
		let r = await Promise.all(n.map(p)), i = r.filter((e) => e !== null);
		if (i.length === 0) return n.map(() => ({ ok: !1 }));
		let a = await u(() => (0, T.apiFetch)(e, {
			method: "POST",
			ref: t,
			body: JSON.stringify({ files: i }),
			throwOnError: !1
		}));
		return n.filter((e, t) => r[t] !== null).forEach((e, t) => l(e, a, t)), r.map((e) => ({
			ok: e !== null && a.ok,
			reload: a.reload
		}));
	}
	async function h(e) {
		let t = n ? await m(e) : await Promise.all(e.map(d)), a = t.filter((e) => e.ok).length;
		if (a === 0) return;
		let o = t.find((e) => e.reload)?.reload;
		r([{
			type: "toast",
			props: { message: i("media.library.uploaded", "{{count}} file(s) uploaded", { count: a }) }
		}, ...o ? [o] : []]);
	}
	function g(t) {
		let n = Array.from(t ?? []);
		if (n.length === 0 || e === "") return;
		let r = n.map((e) => ({
			id: crypto.randomUUID(),
			name: e.name,
			status: "uploading",
			progress: 0,
			file: e
		}));
		o((e) => [...e, ...r]), h(r);
	}
	function _(e) {
		s(e.id, {
			status: "uploading",
			progress: 0,
			reason: void 0
		}), h([e]);
	}
	return {
		uploads: a,
		addFiles: g,
		retry: _,
		dismiss: c
	};
}
var Yo = x((() => {
	E();
}));
//#endregion
//#region resources/js/components/library-view.tsx
function Xo(e, t) {
	return e.schema?.find((e) => e.key === t);
}
function Zo({ node: e, pick: t }) {
	let { t: n } = (0, T.useT)("media"), r = e.props ?? {}, i = e.schema?.find((e) => e.type === "table") ?? { type: "table" }, a = (0, T.useTable)(i), o = a.rows, s = (0, T.useTableSelection)(o.map((e) => String(e.id))), [c] = (0, T.getBulkActions)(i.props?.bulkActions), l = Xo(e, "media-upload"), u = Xo(e, "media-update"), p = Xo(e, "media-delete"), { uploads: m, addFiles: h, retry: y, dismiss: b } = Jo({
		endpoint: l?.props.endpoint ?? "",
		ref: l?.props.ref ?? "",
		signed: r.signed
	}), ee = d(null), [te, x] = f(!1), [S, C] = f(null), w = o.find((e) => e.id === S) ?? null, ne = u && p ? w : null, re = l?.props.label ?? n("media.actions.upload.label", "Upload"), E = ne === null, D = a.processing && a.hasLoaded, ie = (0, T.useDebouncedCallback)((e) => a.setSearch(e), $o);
	function ae(e) {
		let n = String(e.id), r = s.isSelected(n);
		t && !t.multiple && (s.clear(), r) || t?.max !== void 0 && !r && s.selectedKeys.length >= t.max || s.toggle(n);
	}
	return /* @__PURE__ */ v("div", {
		className: (0, T.cn)("flex flex-col gap-4 rounded-lt-sm border border-dashed border-transparent", te && "border-lt-primary"),
		"data-test": "media-library",
		onDragLeave: (e) => {
			e.currentTarget.contains(e.relatedTarget) || x(!1);
		},
		onDragOver: (e) => {
			e.preventDefault(), E && x(!0);
		},
		onDrop: (e) => {
			e.preventDefault(), x(!1), E && h(e.dataTransfer.files);
		},
		children: [
			/* @__PURE__ */ v("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ _(T.Input, {
						className: "max-w-xs",
						"data-test": "media-search",
						defaultValue: a.search,
						onChange: (e) => ie(e.target.value),
						placeholder: n("media.library.search", "Search media"),
						type: "search"
					}),
					/* @__PURE__ */ v(T.NativeSelect, {
						"aria-label": n("media.filters.type.label", "Type"),
						className: "max-w-40",
						"data-test": "media-type-filter",
						defaultValue: "",
						onChange: (e) => a.setTableFilter("type", { value: e.target.value }),
						children: [
							/* @__PURE__ */ _("option", {
								value: "",
								children: n("media.filters.type.all", "All types")
							}),
							/* @__PURE__ */ _("option", {
								value: "image",
								children: n("media.filters.type.image", "Images")
							}),
							/* @__PURE__ */ _("option", {
								value: "video",
								children: n("media.filters.type.video", "Video")
							}),
							/* @__PURE__ */ _("option", {
								value: "audio",
								children: n("media.filters.type.audio", "Audio")
							}),
							/* @__PURE__ */ _("option", {
								value: "document",
								children: n("media.filters.type.document", "Documents")
							})
						]
					}),
					l?.props.endpoint && /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(T.Button, {
						className: "ms-auto",
						"data-test": "media-upload-button",
						onClick: () => ee.current?.click(),
						type: "button",
						variant: "primary",
						children: re
					}), /* @__PURE__ */ _("input", {
						accept: r.accept ?? void 0,
						"aria-label": re,
						className: "sr-only",
						"data-test": "media-upload-input",
						multiple: !0,
						onChange: (e) => {
							h(e.target.files), e.target.value = "";
						},
						ref: ee,
						type: "file"
					})] })
				]
			}),
			m.length > 0 && /* @__PURE__ */ _("ul", {
				className: "flex flex-wrap gap-2",
				children: m.map((e) => /* @__PURE__ */ v("li", {
					className: "flex max-w-64 items-center gap-2 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1 text-sm",
					children: [/* @__PURE__ */ v("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ _("span", {
							className: "block truncate text-lt-fg",
							children: e.name
						}), e.status === "error" && /* @__PURE__ */ _("span", {
							className: "block truncate text-xs text-lt-danger",
							"data-test": "media-upload-reason",
							children: e.reason ?? n("media.library.upload-failed", "Upload failed")
						})]
					}), e.status === "error" ? /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(T.IconButton, {
						"data-test": "media-upload-retry",
						icon: "rotate-ccw",
						label: n("media.library.upload-retry", "Retry {{name}}", { name: e.name }),
						onClick: () => y(e)
					}), /* @__PURE__ */ _(T.IconButton, {
						"data-test": "media-upload-dismiss",
						icon: "x",
						label: n("media.library.upload-dismiss", "Dismiss {{name}}", { name: e.name }),
						onClick: () => b(e.id)
					})] }) : /* @__PURE__ */ _("span", {
						className: "text-lt-muted-fg",
						children: `${e.progress}%`
					})]
				}, e.id))
			}),
			o.length === 0 && a.hasLoaded ? /* @__PURE__ */ _("p", {
				className: "py-12 text-center text-sm text-lt-muted-fg",
				"data-test": "media-empty",
				children: a.search !== "" || Object.keys(a.tableFilters).length > 0 ? n("media.library.no-results", "No media matches your search.") : n("media.library.empty", "No media yet. Drop files anywhere to upload.")
			}) : /* @__PURE__ */ _("ul", {
				"aria-busy": D,
				className: (0, T.cn)("grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-5", D && "opacity-60"),
				"data-test": "media-grid",
				children: o.map((e) => /* @__PURE__ */ v("li", {
					className: "relative",
					children: [/* @__PURE__ */ v("button", {
						className: (0, T.cn)("flex w-full flex-col overflow-hidden rounded-lt-sm border border-lt-border bg-lt-surface text-left", s.isSelected(String(e.id)) && "ring-[length:var(--lt-ring-width)] ring-lt-ring"),
						"data-test": "media-card",
						onClick: () => t ? ae(e) : C(e.id),
						type: "button",
						children: [e.preview_url !== null && e.mime_type.startsWith("image/") ? /* @__PURE__ */ _("img", {
							alt: e.alt ?? e.name,
							className: "aspect-square w-full object-cover",
							src: e.preview_url
						}) : /* @__PURE__ */ _("span", {
							className: "flex aspect-square w-full items-center justify-center text-sm text-lt-muted-fg",
							children: e.mime_type.split("/")[1] ?? e.mime_type
						}), /* @__PURE__ */ _("span", {
							className: "truncate px-2 py-1.5 text-sm text-lt-fg",
							children: e.name
						})]
					}), /* @__PURE__ */ _(T.Checkbox, {
						"aria-label": n("media.library.select", "Select {{name}}", { name: e.name }),
						checked: s.isSelected(String(e.id)),
						className: "absolute left-2 top-2 bg-lt-surface",
						"data-test": "media-card-select",
						onCheckedChange: () => ae(e)
					})]
				}, e.id))
			}),
			/* @__PURE__ */ _("div", { ref: a.infiniteLoaderRef }),
			t ? /* @__PURE__ */ v("div", {
				className: "flex items-center justify-end gap-3 border-t border-lt-border pt-3",
				children: [t.max !== void 0 && /* @__PURE__ */ _("span", {
					className: (0, T.cn)("text-sm text-lt-muted-fg", s.selectedKeys.length >= t.max && "text-lt-danger"),
					"data-test": "media-pick-counter",
					children: n("media.picker.selected-of-max", "{{count}}/{{max}} selected", {
						count: s.selectedKeys.length,
						max: t.max
					})
				}), /* @__PURE__ */ _(T.Button, {
					"data-test": "media-pick-confirm",
					disabled: !s.active,
					onClick: () => t.onConfirm(o.filter((e) => s.isSelected(String(e.id)))),
					type: "button",
					variant: "primary",
					children: n("media.picker.confirm", "Select {{count}} item(s)", { count: s.selectedKeys.length })
				})]
			}) : c && s.active && /* @__PURE__ */ _(Qo, {
				action: c,
				onDone: s.clear,
				selectedKeys: s.selectedKeys
			}),
			ne && u && p && /* @__PURE__ */ _(Wo, {
				onClose: () => C(null),
				remove: p,
				row: ne,
				update: u
			}, ne.id)
		]
	});
}
function Qo({ action: e, selectedKeys: t, onDone: n }) {
	let { t: r } = (0, T.useT)("media"), i = (0, T.useEffectDispatcher)(), [a, o] = f(!1);
	async function s() {
		o(!0);
		let r = await (0, T.runAction)(() => (0, T.apiFetch)(e.endpoint, {
			method: e.method,
			ref: e.ref,
			body: JSON.stringify({ selected: t }),
			throwOnError: !1
		}), i);
		o(!1), r && n();
	}
	return /* @__PURE__ */ v("div", {
		className: "sticky bottom-0 z-lt-sticky flex items-center justify-between gap-3 rounded-lt-sm border border-lt-border bg-lt-surface px-4 py-3 text-sm shadow-lt-md",
		children: [/* @__PURE__ */ _("span", { children: r("media.library.selected", "{{count}} selected", { count: t.length }) }), /* @__PURE__ */ _(T.Button, {
			"data-test": "media-bulk-delete",
			disabled: a,
			emphasis: e.emphasis ?? "solid",
			onClick: () => void s(),
			type: "button",
			variant: e.variant ?? "danger",
			children: e.label
		})]
	});
}
var $o, es = x((() => {
	E(), Ko(), Yo(), $o = 300;
})), ts = /* @__PURE__ */ C({ default: () => ns });
function ns({ editor: e, library: t, setOpen: n }) {
	let { t: r } = (0, T.useT)("media");
	return /* @__PURE__ */ _(T.Dialog, {
		onOpenChange: n,
		open: !0,
		children: /* @__PURE__ */ v(T.DialogContent, {
			"aria-describedby": void 0,
			className: "flex flex-col gap-5",
			"data-test": "editor-media-image-dialog",
			width: "3xl",
			children: [/* @__PURE__ */ _(T.DialogHeader, {
				closeLabel: (0, T.translate)("lattice", "common.close", "Close"),
				title: r("media.picker.heading", "Choose media")
			}), /* @__PURE__ */ _(Zo, {
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
						}))).run(), n(!1);
					}
				}
			})]
		})
	});
}
var rs = x((() => {
	E(), es();
}));
//#endregion
//#region resources/js/rich-editor/media-image.tsx
E();
var is = s(() => Promise.resolve().then(() => (rs(), ts)));
function as({ editor: e, extension: t, node: n, selected: r, updateAttributes: i }) {
	let { t: a } = (0, T.useT)("media"), o = t.options.conversions, s = n.attrs.url, c = n.attrs.alt ?? n.attrs.mediaAlt ?? "";
	return /* @__PURE__ */ v(ko, {
		className: "flex flex-col gap-2",
		"data-test": "editor-media-image",
		children: [s ? /* @__PURE__ */ _("img", {
			alt: c,
			className: (0, T.cn)("max-w-full rounded-lt-sm", r && "ring-2 ring-lt-ring"),
			src: s
		}) : /* @__PURE__ */ _("div", {
			className: "rounded-lt-sm border border-dashed border-lt-border px-3 py-2 text-sm text-lt-fg-muted",
			"data-test": "editor-media-image-missing",
			children: a("media.editor.missing", "Missing media")
		}), r && e.isEditable && /* @__PURE__ */ v("div", {
			className: "flex items-center gap-2",
			"data-test": "editor-media-image-controls",
			children: [/* @__PURE__ */ _(T.Input, {
				"aria-label": a("media.editor.alt", "Alt text"),
				onChange: (e) => i({ alt: e.target.value === "" ? null : e.target.value }),
				placeholder: a("media.editor.alt", "Alt text"),
				value: n.attrs.alt ?? ""
			}), o.length > 0 && /* @__PURE__ */ v(T.NativeSelect, {
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
var ss = fo.create({
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
		return ["img", na(t, {
			src: e.attrs.url,
			alt: e.attrs.alt ?? e.attrs.mediaAlt ?? "",
			"data-media-id": e.attrs.id
		})];
	},
	addNodeView() {
		return Ro(as);
	}
});
function cs({ editor: e, library: t }) {
	let { t: r } = (0, T.useT)("media"), [i, a] = f(!1);
	return t ? /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(T.ToolbarIconButton, {
		icon: "image",
		label: r("media.editor.insert", "Insert image"),
		onClick: () => a(!0),
		testId: "editor-media-image-insert"
	}), i && /* @__PURE__ */ _(n, {
		fallback: null,
		children: /* @__PURE__ */ _(is, {
			editor: e,
			library: t,
			setOpen: a
		})
	})] }) : null;
}
var ls = {
	extensions: (e) => [ss.configure({ conversions: e.conversions ?? [] })],
	toolbar: (e) => [{
		key: "media-image",
		component: ({ editor: t }) => /* @__PURE__ */ _(cs, {
			editor: t,
			library: e.library ?? null
		})
	}]
}, us = /* @__PURE__ */ C({ default: () => ds }), ds, fs = x((() => {
	es(), ds = ({ node: e }) => /* @__PURE__ */ _(Zo, { node: e });
})), ps = /* @__PURE__ */ C({ default: () => ms }), ms, hs = x((() => {
	E(), es(), ms = ({ node: e }) => {
		let { t } = (0, T.useT)("media"), n = e.props, [r, i] = f(!1), [a, o] = f((n.selected ?? []).map((e) => ({
			...e,
			values: e.values ?? {}
		}))), s = e.schema?.find((e) => e.type === "media.library"), c = e.schema?.filter((e) => e.type !== "media.library") ?? [], l = c.length > 0, u = n.multiple, d = n.maxFiles, p = u && d !== null ? Math.max(0, d - a.length) : void 0;
		return /* @__PURE__ */ _(T.SimpleField, {
			label: n.label ?? "",
			node: e,
			children: ({ name: e, commit: n, disabled: f, readOnly: m }) => {
				let h = f || m, g = (e) => l ? e.map((e) => ({
					id: e.id,
					...e.values
				})) : u ? e.map((e) => e.id) : e[0]?.id ?? "", y = (e) => {
					o(e), n(g(e));
				}, b = (e, t, n) => {
					y(a.map((r, i) => i === e ? {
						...r,
						values: {
							...r.values,
							[t]: n
						}
					} : r));
				};
				return /* @__PURE__ */ v("div", {
					className: "flex flex-col gap-2",
					"data-test": `media-picker-${e}`,
					children: [
						l ? a.map((t, n) => /* @__PURE__ */ _("input", {
							name: `${e}[${n}][id]`,
							type: "hidden",
							value: t.id
						}, t.id)) : u ? a.map((t) => /* @__PURE__ */ _("input", {
							name: `${e}[]`,
							type: "hidden",
							value: t.id
						}, t.id)) : /* @__PURE__ */ _("input", {
							name: e,
							type: "hidden",
							value: a[0]?.id ?? ""
						}),
						a.length > 0 && /* @__PURE__ */ _("ul", {
							className: l ? "flex flex-col gap-2" : "flex flex-wrap gap-2",
							children: a.map((n, r) => /* @__PURE__ */ v("li", {
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
										!h && /* @__PURE__ */ _(T.IconButton, {
											"data-test": "media-picker-remove",
											icon: "x",
											label: t("media.picker.remove", "Remove {{name}}", { name: n.name }),
											onClick: () => y(a.filter((e) => e.id !== n.id))
										})
									]
								}), l && !f && /* @__PURE__ */ _(T.FieldScopeProvider, {
									base: e,
									index: r,
									onChange: (e, t) => b(r, e, t),
									row: {
										id: n.id,
										...n.values
									},
									children: /* @__PURE__ */ _("div", {
										className: "flex flex-col gap-3",
										"data-test": "media-picker-item-fields",
										children: c.map((e, t) => /* @__PURE__ */ _(T.RenderNode, { node: e }, t))
									})
								})]
							}, n.id))
						}),
						/* @__PURE__ */ _(T.Button, {
							className: "self-start",
							"data-test": "media-picker-open",
							disabled: h,
							onClick: () => i(!0),
							type: "button",
							children: t("media.picker.open", "Choose from library")
						}),
						r && s && /* @__PURE__ */ _(T.Dialog, {
							onOpenChange: i,
							open: !0,
							children: /* @__PURE__ */ v(T.DialogContent, {
								"aria-describedby": void 0,
								className: "flex flex-col gap-5",
								"data-test": "media-picker-dialog",
								width: "3xl",
								children: [/* @__PURE__ */ _(T.DialogHeader, {
									closeLabel: (0, T.translate)("lattice", "common.close", "Close"),
									title: t("media.picker.heading", "Choose media")
								}), /* @__PURE__ */ _(Zo, {
									node: s,
									pick: {
										multiple: u,
										max: p,
										onConfirm: (e) => {
											let t = e.map((e) => ({
												...e,
												values: a.find((t) => t.id === e.id)?.values ?? {}
											})), n = u ? [...a.filter((e) => !t.some((t) => t.id === e.id)), ...t] : t.slice(0, 1);
											y(u && d !== null ? n.slice(0, d) : n), i(!1);
										}
									}
								})]
							})
						})
					]
				});
			}
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
E();
var gs = {
	name: "media",
	components: {
		"media.library": (0, T.lazyComponent)(() => Promise.resolve().then(() => (fs(), us))),
		"field.media-picker": (0, T.lazyComponent)(() => Promise.resolve().then(() => (hs(), ps)))
	},
	extensions: { [T.RICH_EDITOR_EXTENSION]: { "media-image": ls } },
	i18n: { namespace: "media" }
};
//#endregion
export { gs as default };
