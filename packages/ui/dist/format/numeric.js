//#region resources/js/format/numeric.ts
function numericValue(value) {
	const number = typeof value === "number" ? value : Number(value);
	return value !== null && value !== void 0 && value !== "" && !Number.isNaN(number) ? number : null;
}
//#endregion
export { numericValue };

//# sourceMappingURL=numeric.js.map