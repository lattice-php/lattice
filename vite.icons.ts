import { discoverComponentPackages } from "./packages/framework/resources/js/vite.ts";

// The lucide icons Lattice's built-in components rely on. The sprite plugin
// idempotently vendors these into packages/ui/resources/icons at build time, so
// consumers can use the icon set shipped by lattice-php/ui without
// installing lucide-static. Keep sorted and grouped by origin.
export const latticeIcons = [
  // Server-driven defaults (names components emit / consumers commonly use)
  "arrow-down",
  "arrow-left-to-line",
  "arrow-right-to-line",
  "arrow-up",
  "check",
  "chevrons-up-down",
  "copy",
  "corner-down-right",
  "external-link",
  "eye-off",
  "grip-vertical",
  "layout-dashboard",
  "link",
  "list-plus",
  "more-horizontal",
  "pencil",
  "pencil-line",
  "send",
  "settings",
  "trash-2",
  "x",
  // Internal chrome
  "bell",
  "calendar",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "circle-alert",
  "circle-check",
  "circle-help",
  "circle-x",
  "clock",
  "eye",
  "filter",
  "info",
  "loader-2",
  "minus",
  "panel-left",
  "plus",
  "rotate-ccw",
  "search",
  // Rich-editor toolbar
  "align-center",
  "align-justify",
  "align-left",
  "align-right",
  "bold",
  "code",
  "code-xml",
  "columns-3",
  "heading",
  "heading-1",
  "heading-2",
  "heading-3",
  "heading-4",
  "heading-5",
  "heading-6",
  "highlighter",
  "italic",
  "list",
  "list-ordered",
  "quote",
  "rows-3",
  "smile",
  "strikethrough",
  "table",
  "underline",
];

export const latticeIconsDir = "packages/ui/resources/icons";

// Icon directories the workbench sprite bundles on top of Lattice's own set.
export const workbenchIconDirs = (root: string): string[] => [
  ...discoverComponentPackages(root).flatMap((pkg) => (pkg.icons ? [pkg.icons] : [])),
  "packages/signature-example/resources/icons",
  "workbench/resources/icons",
];

export const workbenchIconTypes = {
  file: "workbench/resources/js/sprite-icons.ts",
  augmentModule: "@lattice-php/ui",
  augmentInterface: "KnownIcons",
};
