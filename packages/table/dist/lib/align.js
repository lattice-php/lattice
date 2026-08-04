//#region resources/js/lib/align.ts
var TEXT = {
	start: "text-start",
	center: "text-center",
	end: "text-end"
};
var JUSTIFY = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end"
};
var JUSTIFY_ITEMS = {
	start: "justify-items-start",
	center: "justify-items-center",
	end: "justify-items-end"
};
var alignText = (align) => TEXT[align];
var alignJustify = (align) => JUSTIFY[align];
var alignJustifyItems = (align) => JUSTIFY_ITEMS[align];
//#endregion
export { alignJustify, alignJustifyItems, alignText };

//# sourceMappingURL=align.js.map