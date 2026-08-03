//#region resources/js/component-ref.ts
/**
* The signed component reference travels to the server as the `X-Lattice-Ref`
* request header on every interactive request (GET and writes alike). This must
* match ComponentReferenceSigner::token() on the PHP side, which reads the same
* header.
*/
var LATTICE_REF_HEADER = "X-Lattice-Ref";
/**
* Refs are sealed with a lifetime and baked into node props at render time, so
* a long-lived tab cannot pick up a renewed token through React state. Renewed
* tokens are instead kept here, keyed by the original prop value, and resolved
* whenever a ref travels — every consumer keeps passing the ref it was rendered
* with.
*/
var refreshedRefs = /* @__PURE__ */ new Map();
function latestRef(componentRef) {
	return refreshedRefs.get(componentRef) ?? componentRef;
}
function storeRefreshedRef(componentRef, refreshed) {
	refreshedRefs.set(componentRef, refreshed);
}
function clearRefreshedRefs() {
	refreshedRefs.clear();
}
function withRefHeader(componentRef) {
	const ref = latestRef(componentRef);
	return ref ? { [LATTICE_REF_HEADER]: ref } : {};
}
//#endregion
export { LATTICE_REF_HEADER, clearRefreshedRefs, latestRef, storeRefreshedRef, withRefHeader };

//# sourceMappingURL=component-ref.js.map