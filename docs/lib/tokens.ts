export type ThemeToken = {
  name: string;
  light: string;
  dark: string;
  category: "color" | "radius";
};

export type SuffixMap = Record<string, string>;

function extractBlock(css: string, selector: RegExp): string {
  const match = css.match(selector);
  if (!match || match.index === undefined) {
    return "";
  }
  const start = match.index + match[0].length;
  const end = css.indexOf("}", start);
  return end === -1 ? css.slice(start) : css.slice(start, end);
}

function parseDeclarations(block: string): Map<string, string> {
  const declarations = new Map<string, string>();
  const pattern = /(--lt-[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(block)) !== null) {
    declarations.set(match[1], match[2].trim());
  }
  return declarations;
}

export function parseTokens(css: string): ThemeToken[] {
  const light = parseDeclarations(extractBlock(css, /:root,\s*\[data-theme="light"\]\s*\{/));
  const dark = parseDeclarations(extractBlock(css, /\[data-theme="dark"\],\s*\.dark\s*\{/));

  return [...light].map(([name, lightValue]) => ({
    name,
    light: lightValue,
    dark: dark.get(name) ?? lightValue,
    category: name.includes("radius") ? "radius" : "color",
  }));
}

export function parseSuffixMap(css: string): SuffixMap {
  const block = extractBlock(css, /@theme inline\s*\{/);
  const map: SuffixMap = {};
  const pattern = /--(?:color|radius)-(lt[\w-]*)\s*:\s*var\(\s*(--lt-[\w-]+)\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(block)) !== null) {
    map[match[1]] = match[2];
  }
  return map;
}

export function resolveTokens(classNames: string[], suffixMap: SuffixMap): string[] {
  const found = new Set<string>();
  for (const raw of classNames) {
    for (const className of raw.split(/\s+/)) {
      if (!className) {
        continue;
      }
      const withoutVariant = className.slice(className.lastIndexOf(":") + 1);
      const withoutOpacity = withoutVariant.replace(/\/[\d.]+$/, "");
      const match = withoutOpacity.match(/(?:^|-)(lt(?:-[a-z]+)*)$/);
      if (match && suffixMap[match[1]]) {
        found.add(suffixMap[match[1]]);
      }
    }
  }
  return [...found];
}

const LABEL_WORDS: Record<string, string> = {
  fg: "foreground",
  bg: "background",
  sm: "small",
  xs: "extra-small",
};

export function tokenLabel(name: string): string {
  const words = name
    .replace(/^--lt-/, "")
    .split("-")
    .map((word) => LABEL_WORDS[word] ?? word);
  const label = words.join(" ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function collectClassNames(root: ParentNode): string[] {
  const classNames: string[] = [];
  for (const element of root.querySelectorAll("*")) {
    const value = element.getAttribute("class");
    if (value) {
      classNames.push(value);
    }
  }
  return classNames;
}
