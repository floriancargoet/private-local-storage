//#region src/private-local-storage.ts
function e(e, t) {
	if (typeof Proxy > "u" || typeof Proxy == "object") throw Error("Private localStorage requires ES 2015 Proxy support");
	function n(t) {
		return e + t;
	}
	function r() {
		return Object.keys(t).filter((t) => t.startsWith(e)).map((t) => t.replace(e, ""));
	}
	let i = {
		getItem(e) {
			return t.getItem(n(e));
		},
		setItem(e, r) {
			return t.setItem(n(e), r);
		},
		removeItem(e) {
			return t.removeItem(n(e));
		},
		clear() {
			for (let e of r()) t.removeItem(n(e));
		},
		key(e) {
			return r()[e] ?? null;
		}
	};
	return new Proxy({}, {
		has(e, r) {
			return typeof r == "symbol" ? !1 : n(r) in t;
		},
		ownKeys(e) {
			return r();
		},
		getOwnPropertyDescriptor(e, r) {
			if (typeof r != "symbol") return Object.getOwnPropertyDescriptor(t, n(r));
		},
		set(e, t, n) {
			if (typeof t == "symbol") return !0;
			if (t in i) return !1;
			switch (t) {
				case "length": return !1;
				default: return i.setItem(t, n), !0;
			}
		},
		get(e, a) {
			if (typeof a != "symbol") {
				if (a in i) return i[a];
				switch (a) {
					case "length": return r().length;
					default: if (n(a) in t) return i.getItem(a);
				}
			}
		},
		deleteProperty(e, r) {
			if (typeof r == "symbol") return !0;
			let i = n(r);
			return i in t && t.removeItem(i), !0;
		}
	});
}
//#endregion
//#region src/main.ts
t();
function t() {
	let t = globalThis.realLocalStorage = globalThis.localStorage, r = e(n(), t);
	Object.defineProperty(globalThis, "localStorage", { get() {
		return r;
	} });
}
function n() {
	return document.currentScript?.dataset.prefix ?? location.pathname + "__";
}
//#endregion
