//#region resources/js/lib/listeners.ts
function createListeners() {
	const listeners = /* @__PURE__ */ new Set();
	return {
		subscribe(callback) {
			listeners.add(callback);
			return () => {
				listeners.delete(callback);
			};
		},
		notify() {
			listeners.forEach((listener) => listener());
		}
	};
}
//#endregion
export { createListeners };

//# sourceMappingURL=listeners.js.map