export type ThemeToken = {
  name: string;
  hostVar: string | null;
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

function splitVar(value: string): { hostVar: string | null; fallback: string } {
  const match = value.match(/^var\(\s*(--[\w-]+)\s*,\s*(.+)\)$/);
  if (match) {
    return { hostVar: match[1], fallback: match[2].trim() };
  }
  return { hostVar: null, fallback: value };
}

export function parseTokens(css: string): ThemeToken[] {
  const light = parseDeclarations(extractBlock(css, /:root,\s*\[data-theme="light"\]\s*\{/));
  const dark = parseDeclarations(extractBlock(css, /\[data-theme="dark"\],\s*\.dark\s*\{/));

  return [...light].map(([name, lightValue]) => {
    const { hostVar, fallback: lightFallback } = splitVar(lightValue);
    const darkValue = dark.get(name);
    const darkFallback = darkValue ? splitVar(darkValue).fallback : lightFallback;
    return {
      name,
      hostVar,
      light: lightFallback,
      dark: darkFallback,
      category: name.includes("radius") ? "radius" : "color",
    };
  });
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
