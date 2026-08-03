//#region resources/js/hooks/column-sizing.ts
var DEFAULT_COLUMN_WIDTH = "md";
var tracks = {
	xs: {
		track: "minmax(4rem, 0.35fr)",
		minPx: 64,
		defaultPx: 96
	},
	sm: {
		track: "minmax(6rem, 0.5fr)",
		minPx: 96,
		defaultPx: 128
	},
	md: {
		track: "minmax(8rem, 1fr)",
		minPx: 128,
		defaultPx: 176
	},
	lg: {
		track: "minmax(12rem, 1.5fr)",
		minPx: 192,
		defaultPx: 240
	},
	xl: {
		track: "minmax(16rem, 2fr)",
		minPx: 256,
		defaultPx: 320
	}
};
var maxColumnWidthPx = 1024;
function columnWidthTrack(width) {
	return tracks[width].track;
}
function minColumnWidthPx(column) {
	return tracks[column.width].minPx;
}
function defaultColumnWidthPx(column) {
	return tracks[column.width].defaultPx;
}
function buildColumnGridTemplate({ columns, leadingTracks = [], trailingTracks = [], overrides = {} }) {
	return [
		...leadingTracks,
		...columns.map((column) => {
			const override = overrides[column.key];
			if (override !== void 0) return `${Math.min(maxColumnWidthPx, Math.max(minColumnWidthPx(column), override))}px`;
			return columnWidthTrack(column.width);
		}),
		...trailingTracks
	].join(" ");
}
//#endregion
export { DEFAULT_COLUMN_WIDTH, buildColumnGridTemplate, columnWidthTrack, defaultColumnWidthPx, maxColumnWidthPx, minColumnWidthPx };

//# sourceMappingURL=column-sizing.js.map