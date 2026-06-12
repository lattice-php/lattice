// Vendors the lucide SVGs that Lattice's built-in components and default icon
// names rely on into ./icons (committed). The Vite sprite plugin compiles these
// — together with the consumer's own folder — into one sprite.
//
// Run: node scripts/sync-icons.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "lucide-static", "icons");
const target = join(root, "resources", "icons");

// Canonical lucide icon names Lattice ships. Keep sorted and grouped by origin.
const icons = [
  // Server-driven defaults (names components emit / consumers commonly use)
  "arrow-down", "arrow-up", "check", "chevrons-up-down", "copy", "external-link",
  "eye-off", "layout-dashboard", "link", "more-horizontal", "pencil", "pencil-line",
  "send", "settings", "trash-2", "x",
  // Internal chrome
  "chevron-down", "chevron-right", "circle-alert", "circle-check", "circle-help", "circle-x",
  "eye", "filter", "info", "loader-2", "minus", "panel-left", "plus", "search",
  // Rich-editor toolbar
  "align-center", "align-justify", "align-left", "align-right", "bold", "code",
  "columns-3", "heading-1", "heading-2", "heading-3", "highlighter", "italic",
  "list", "list-ordered", "quote", "rows-3", "smile", "strikethrough", "table", "underline",
];

// Convenience aliases: <alias filename> => <canonical lucide name>
const aliases = {
  delete: "trash-2",
  edit: "pencil-line",
  trash: "trash-2",
};

if (!existsSync(source)) {
  console.error(`lucide-static not found at ${source}. Run: npm install --save-dev lucide-static`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

const missing = [];
const write = (name, file) => {
  const from = join(source, `${name}.svg`);
  if (!existsSync(from)) {
    missing.push(name);
    return;
  }
  copyFileSync(from, join(target, `${file}.svg`));
};

for (const name of icons) {
  write(name, name);
}
for (const [alias, name] of Object.entries(aliases)) {
  write(name, alias);
}

if (missing.length > 0) {
  console.error(`Missing lucide icons: ${[...new Set(missing)].sort().join(", ")}`);
  process.exit(1);
}

const total = readdirSync(target).filter((f) => f.endsWith(".svg")).length;
console.log(`Synced ${total} icons → ${target}`);
