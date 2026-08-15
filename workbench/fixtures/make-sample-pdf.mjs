// Regenerates workbench/fixtures/sample.pdf, the document behind the
// /components/pdf demo page: node workbench/fixtures/make-sample-pdf.mjs
//
// Deterministic by construction (no dates, no randomness) so the committed
// binary only changes when this script does. The browser test pins the page
// count and the number of "quick" occurrences (5, case-insensitive).
import { writeFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const PAGE_COUNT = 5;

function escapeText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function textBlock(x, y, font, size, lines, leading = size * 1.4) {
  const [first, ...rest] = lines.map(escapeText);
  const ops = [`BT /${font} ${size} Tf ${leading} TL ${x} ${y} Td (${first}) Tj`];
  for (const line of rest) {
    ops.push(`T* (${line}) Tj`);
  }
  ops.push("ET");
  return ops.join("\n");
}

function footer(pageNumber) {
  return textBlock(MARGIN, 48, "F1", 9, [`Page ${pageNumber} of ${PAGE_COUNT}`]);
}

function approxWidth(text, size) {
  return text.length * size * 0.55;
}

function gradientImage(width, height) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 3;
      pixels[offset] = Math.round((x / (width - 1)) * 255);
      pixels[offset + 1] = Math.round((y / (height - 1)) * 255);
      pixels[offset + 2] = 160;
    }
  }
  return { width, height, data: pixels };
}

function colorBarsImage(width, height) {
  const bars = [
    [220, 60, 60],
    [235, 155, 50],
    [235, 220, 70],
    [90, 190, 90],
    [70, 165, 220],
    [90, 90, 210],
    [170, 90, 200],
    [120, 120, 120],
  ];
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = bars[Math.min(bars.length - 1, Math.floor((x / width) * bars.length))];
      const offset = (y * width + x) * 3;
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
    }
  }
  return { width, height, data: pixels };
}

const paragraph1 = [
  "This fixture exists so the Lattice PDF viewer has something realistic to",
  "chew on: flowing paragraphs, a table with grid lines, embedded raster",
  "images, and link annotations. The quick brown fox jumps over the lazy dog,",
  "as tradition demands of every document that wants its text layer taken",
  "seriously.",
];

const paragraph2 = [
  "Scrolling through a longer document is where virtualization earns its keep.",
  "Only the pages near the viewport hold a live canvas; the rest are sized",
  "placeholders that materialize during a quick scroll and are released again",
  "once they leave the render margin. Selecting text works because a",
  "transparent text layer sits on top of each canvas, mirroring the glyph",
  "positions the renderer produced.",
];

const paragraph3 = [
  "Search reads the extracted text of every page, so terms on unmounted pages",
  "are found and counted before their canvases ever exist. Jumping to a match",
  "scrolls the page into view, mounts it, and highlights the hit.",
  "Quick reference line for search tests.",
];

const tableColumns = [
  { label: "Item", width: 220, align: "left" },
  { label: "Qty", width: 60, align: "right" },
  { label: "Unit price", width: 90, align: "right" },
  { label: "Total", width: 90, align: "right" },
];

const tableRows = [
  ["Aluminium bracket, anodized", "12", "4.90", "58.80"],
  ["Hex bolt M6 x 40", "200", "0.11", "22.00"],
  ["Bearing 608-2RS", "16", "1.85", "29.60"],
  ["Timing belt GT2, 6 mm", "4", "7.25", "29.00"],
  ["Stepper driver TMC2209", "5", "8.40", "42.00"],
  ["Power supply 24 V / 150 W", "1", "34.50", "34.50"],
  ["Cable chain 10 x 20 mm", "3", "6.10", "18.30"],
  ["Limit switch, roller lever", "6", "1.20", "7.20"],
];

function tableOps() {
  const top = 640;
  const left = MARGIN;
  const headerHeight = 26;
  const rowHeight = 22;
  const width = tableColumns.reduce((sum, column) => sum + column.width, 0);
  const bottom = top - headerHeight - tableRows.length * rowHeight - rowHeight;
  const ops = [];

  ops.push(`0.92 0.93 0.95 rg ${left} ${top - headerHeight} ${width} ${headerHeight} re f`);
  ops.push(`0.97 0.97 0.98 rg ${left} ${bottom} ${width} ${rowHeight} re f`);

  ops.push("0.7 G 0.75 w");
  ops.push(`${left} ${bottom} ${width} ${top - bottom} re S`);
  ops.push("0.8 G 0.5 w");
  let x = left;
  for (const column of tableColumns.slice(0, -1)) {
    x += column.width;
    ops.push(`${x} ${bottom} m ${x} ${top} l S`);
  }
  for (let row = 0; row <= tableRows.length; row += 1) {
    const y = top - headerHeight - row * rowHeight;
    ops.push(`${left} ${y} m ${left + width} ${y} l S`);
  }

  const cell = (text, column, columnLeft, baseline, font, size) => {
    const escaped = escapeText(text);
    const textX =
      column.align === "right"
        ? columnLeft + column.width - 10 - approxWidth(text, size)
        : columnLeft + 10;
    return `BT /${font} ${size} Tf ${textX} ${baseline} Td (${escaped}) Tj ET`;
  };

  ops.push("0 g");
  let columnLeft = left;
  for (const column of tableColumns) {
    ops.push(cell(column.label, column, columnLeft, top - headerHeight + 9, "F2", 10));
    columnLeft += column.width;
  }

  tableRows.forEach((row, rowIndex) => {
    const baseline = top - headerHeight - (rowIndex + 1) * rowHeight + 7;
    let cellLeft = left;
    row.forEach((value, columnIndex) => {
      ops.push(cell(value, tableColumns[columnIndex], cellLeft, baseline, "F1", 10));
      cellLeft += tableColumns[columnIndex].width;
    });
  });

  const totalsBaseline = bottom + 7;
  ops.push(cell("Grand total", tableColumns[0], left, totalsBaseline, "F2", 10));
  ops.push(
    cell(
      "241.40",
      tableColumns[3],
      left + tableColumns[0].width + tableColumns[1].width + tableColumns[2].width,
      totalsBaseline,
      "F2",
      10,
    ),
  );

  return ops.join("\n");
}

const docsLinkText = "Open the pdf.js project page";
const docsLinkY = 512;
const backLinkText = "Back to the title page";
const backLinkY = 610;

const pageContents = [
  [
    textBlock(MARGIN, 700, "F2", 28, ["Lattice PDF Fixture"]),
    textBlock(MARGIN, 668, "F1", 12, ["A multi-page document for exercising the viewer."]),
    textBlock(MARGIN, 620, "F1", 11, paragraph1, 15),
    `0.1 0.35 0.7 rg ${textBlock(MARGIN, docsLinkY, "F1", 11, [docsLinkText])} 0 g`,
    `0.1 0.35 0.7 RG 0.75 w ${MARGIN} ${docsLinkY - 2} m ${MARGIN + approxWidth(docsLinkText, 11)} ${docsLinkY - 2} l S`,
    footer(1),
  ],
  [
    textBlock(MARGIN, 700, "F2", 16, ["1. Reading text"]),
    textBlock(MARGIN, 664, "F1", 11, paragraph2, 15),
    textBlock(MARGIN, 540, "F1", 11, paragraph3, 15),
    footer(2),
  ],
  [
    textBlock(MARGIN, 700, "F2", 16, ["2. Invoice table"]),
    textBlock(MARGIN, 668, "F1", 11, [
      "Grid lines, a shaded header row, and right-aligned numbers.",
    ]),
    tableOps(),
    footer(3),
  ],
  [
    textBlock(MARGIN, 700, "F2", 16, ["3. Embedded images"]),
    textBlock(MARGIN, 664, "F1", 11, [
      "Two uncompressed-at-source RGB rasters, deflated into the file - handy",
      "for a quick visual check that image decoding and scaling behave.",
    ], 15),
    `q 300 0 0 200 ${MARGIN} 420 cm /Im1 Do Q`,
    textBlock(MARGIN, 402, "F1", 9, ["Figure 1. A generated RGB gradient."]),
    `q 300 0 0 75 ${MARGIN} 300 cm /Im2 Do Q`,
    textBlock(MARGIN, 282, "F1", 9, ["Figure 2. Color bars."]),
    footer(4),
  ],
  [
    textBlock(MARGIN, 700, "F2", 16, ["4. Links and navigation"]),
    textBlock(MARGIN, 664, "F1", 11, [
      "This page carries an internal link annotation pointing back at the title",
      "page, next to the external one on page 1. That concludes the quick tour.",
    ], 15),
    `0.1 0.35 0.7 rg ${textBlock(MARGIN, backLinkY, "F1", 11, [backLinkText])} 0 g`,
    `0.1 0.35 0.7 RG 0.75 w ${MARGIN} ${backLinkY - 2} m ${MARGIN + approxWidth(backLinkText, 11)} ${backLinkY - 2} l S`,
    footer(5),
  ],
];

const objects = [];
function addObject(body) {
  objects.push(body);
  return objects.length;
}

function streamObject(dict, data) {
  return Buffer.concat([
    Buffer.from(`<< ${dict} /Length ${data.length} >>\nstream\n`, "latin1"),
    data,
    Buffer.from("\nendstream", "latin1"),
  ]);
}

const fontRegular = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
const fontBold = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

function imageObject(image) {
  return streamObject(
    `/Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} ` +
      "/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode",
    deflateSync(image.data),
  );
}

const gradientId = addObject(imageObject(gradientImage(240, 160)));
const barsId = addObject(imageObject(colorBarsImage(240, 60)));

const contentIds = pageContents.map((ops) =>
  addObject(streamObject("", Buffer.from(ops.join("\n"), "latin1"))),
);

const pagesId = objects.length + PAGE_COUNT + 3;
const firstPageId = objects.length + 3;

const uriAnnotationId = addObject(
  `<< /Type /Annot /Subtype /Link /Rect [${MARGIN} ${docsLinkY - 4} ${MARGIN + approxWidth(docsLinkText, 11)} ${docsLinkY + 11}] ` +
    "/Border [0 0 0] /A << /S /URI /URI (https://mozilla.github.io/pdf.js/) >> >>",
);
const gotoAnnotationId = addObject(
  `<< /Type /Annot /Subtype /Link /Rect [${MARGIN} ${backLinkY - 4} ${MARGIN + approxWidth(backLinkText, 11)} ${backLinkY + 11}] ` +
    `/Border [0 0 0] /A << /S /GoTo /D [${firstPageId} 0 R /Fit] >> >>`,
);

const resources =
  `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ` +
  `/XObject << /Im1 ${gradientId} 0 R /Im2 ${barsId} 0 R >> >>`;

const pageIds = contentIds.map((contentId, index) => {
  const annotations =
    index === 0
      ? ` /Annots [${uriAnnotationId} 0 R]`
      : index === PAGE_COUNT - 1
        ? ` /Annots [${gotoAnnotationId} 0 R]`
        : "";
  return addObject(
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `${resources} /Contents ${contentId} 0 R${annotations} >>`,
  );
});

addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${PAGE_COUNT} >>`);
const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

const chunks = [Buffer.from("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n", "latin1")];
let offset = chunks[0].length;
const offsets = [];

objects.forEach((body, index) => {
  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body, "latin1");
  const object = Buffer.concat([
    Buffer.from(`${index + 1} 0 obj\n`, "latin1"),
    buffer,
    Buffer.from("\nendobj\n", "latin1"),
  ]);
  offsets.push(offset);
  chunks.push(object);
  offset += object.length;
});

let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const objectOffset of offsets) {
  xref += `${String(objectOffset).padStart(10, "0")} 00000 n \n`;
}
xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
chunks.push(Buffer.from(xref, "latin1"));

const target = path.join(import.meta.dirname, "sample.pdf");
writeFileSync(target, Buffer.concat(chunks));
console.log(`wrote ${target} (${Buffer.concat(chunks).length} bytes, ${PAGE_COUNT} pages)`);
