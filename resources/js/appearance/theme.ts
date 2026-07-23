import { readableForeground, shiftLightness } from "./oklch";

export type ThemeColors = {
  bg: string;
  fg: string;
  surface: string;
  surfaceFg: string;
  popover: string;
  popoverFg: string;
  primary: string;
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  muted: string;
  mutedFg: string;
  accent: string;
  accentFg: string;
  danger: string;
  dangerFg: string;
  success: string;
  successFg: string;
  info: string;
  infoFg: string;
  warning: string;
  warningFg: string;
  border: string;
  input: string;
  ring: string;
  overlay: string;
  disabled: string;
  disabledFg: string;
};

type Scalars = {
  radius: string;
  ringWidth: string;
  ringOffset: string;
  borderWidth: string;
  fontSans: string;
  fontMono: string;
  fontDisplay: string;
  chart: string[];
};

export type Theme = Partial<Scalars> & {
  colors?: Partial<ThemeColors>;
  dark?: Partial<Scalars> & { colors?: Partial<ThemeColors> };
};

const STATEFUL = ["primary", "secondary", "danger", "success", "info"] as const;
type StatefulKey = (typeof STATEFUL)[number];
type State = { hover: string; active: string };
type Mode = { colors: ThemeColors; states: Record<StatefulKey, State> } & Scalars;

const HOST_VAR: Record<keyof ThemeColors, string> = {
  bg: "background",
  fg: "foreground",
  surface: "card",
  surfaceFg: "card-foreground",
  popover: "popover",
  popoverFg: "popover-foreground",
  primary: "primary",
  primaryFg: "primary-foreground",
  secondary: "secondary",
  secondaryFg: "secondary-foreground",
  muted: "muted",
  mutedFg: "muted-foreground",
  accent: "accent",
  accentFg: "accent-foreground",
  danger: "destructive",
  dangerFg: "destructive-foreground",
  success: "success",
  successFg: "success-foreground",
  info: "info",
  infoFg: "info-foreground",
  warning: "warning",
  warningFg: "warning-foreground",
  border: "border",
  input: "input",
  ring: "ring",
  overlay: "overlay",
  disabled: "disabled",
  disabledFg: "disabled-foreground",
};

const SCALAR_VAR: Record<keyof Omit<Scalars, "chart">, string> = {
  radius: "radius",
  ringWidth: "ring-width",
  ringOffset: "ring-offset",
  borderWidth: "border-width",
  fontSans: "font-sans",
  fontMono: "font-mono",
  fontDisplay: "font-display",
};

const FG_PAIR: Partial<Record<keyof ThemeColors, keyof ThemeColors>> = {
  surface: "surfaceFg",
  popover: "popoverFg",
  primary: "primaryFg",
  secondary: "secondaryFg",
  muted: "mutedFg",
  accent: "accentFg",
  danger: "dangerFg",
  success: "successFg",
  info: "infoFg",
  warning: "warningFg",
  disabled: "disabledFg",
};

const lightMode: Mode = {
  colors: {
    bg: "oklch(0.97 0 0)",
    fg: "oklch(0.145 0 0)",
    surface: "oklch(1 0 0)",
    surfaceFg: "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    popoverFg: "oklch(0.145 0 0)",
    primary: "oklch(0.48 0.092 182)",
    primaryFg: "oklch(0.985 0 0)",
    secondary: "oklch(0.97 0 0)",
    secondaryFg: "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    mutedFg: "oklch(0.556 0 0)",
    accent: "oklch(0.965 0.013 182)",
    accentFg: "oklch(0.4 0.07 182)",
    danger: "oklch(0.585 0.21 27.3)",
    dangerFg: "oklch(0.985 0 0)",
    success: "oklch(0.62 0.125 160)",
    successFg: "oklch(0.985 0 0)",
    info: "oklch(0.62 0.14 240)",
    infoFg: "oklch(0.985 0 0)",
    warning: "oklch(0.84 0.14 88)",
    warningFg: "oklch(0.205 0 0)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.72 0.075 182)",
    overlay: "oklch(0 0 0 / 0.5)",
    disabled: "oklch(0.95 0 0)",
    disabledFg: "oklch(0.7 0 0)",
  },
  states: {
    primary: { hover: "oklch(0.43 0.092 182)", active: "oklch(0.39 0.092 182)" },
    secondary: { hover: "oklch(0.93 0 0)", active: "oklch(0.9 0 0)" },
    danger: { hover: "oklch(0.53 0.21 27.3)", active: "oklch(0.48 0.21 27.3)" },
    success: { hover: "oklch(0.57 0.125 160)", active: "oklch(0.52 0.125 160)" },
    info: { hover: "oklch(0.57 0.14 240)", active: "oklch(0.52 0.14 240)" },
  },
  radius: "0.5rem",
  ringWidth: "3px",
  ringOffset: "0px",
  borderWidth: "1px",
  fontSans: "",
  fontMono: "",
  fontDisplay: "",
  chart: [],
};

const darkMode: Mode = {
  colors: {
    bg: "oklch(0.145 0 0)",
    fg: "oklch(0.985 0 0)",
    surface: "oklch(0.145 0 0)",
    surfaceFg: "oklch(0.985 0 0)",
    popover: "oklch(0.145 0 0)",
    popoverFg: "oklch(0.985 0 0)",
    primary: "oklch(0.74 0.105 182)",
    primaryFg: "oklch(0.2 0.025 182)",
    secondary: "oklch(0.269 0 0)",
    secondaryFg: "oklch(0.985 0 0)",
    muted: "oklch(0.269 0 0)",
    mutedFg: "oklch(0.708 0 0)",
    accent: "oklch(0.278 0.018 182)",
    accentFg: "oklch(0.985 0 0)",
    danger: "oklch(0.42 0.13 26)",
    dangerFg: "oklch(0.985 0 0)",
    success: "oklch(0.7 0.15 162)",
    successFg: "oklch(0.205 0 0)",
    info: "oklch(0.7 0.14 240)",
    infoFg: "oklch(0.205 0 0)",
    warning: "oklch(0.7 0.13 78)",
    warningFg: "oklch(0.205 0 0)",
    border: "oklch(0.269 0 0)",
    input: "oklch(0.269 0 0)",
    ring: "oklch(0.55 0.08 182)",
    overlay: "oklch(0 0 0 / 0.6)",
    disabled: "oklch(0.32 0 0)",
    disabledFg: "oklch(0.55 0 0)",
  },
  states: {
    primary: { hover: "oklch(0.79 0.105 182)", active: "oklch(0.84 0.105 182)" },
    secondary: { hover: "oklch(0.32 0 0)", active: "oklch(0.36 0 0)" },
    danger: { hover: "oklch(0.47 0.13 26)", active: "oklch(0.52 0.13 26)" },
    success: { hover: "oklch(0.75 0.15 162)", active: "oklch(0.8 0.15 162)" },
    info: { hover: "oklch(0.75 0.14 240)", active: "oklch(0.8 0.14 240)" },
  },
  radius: "0.5rem",
  ringWidth: "3px",
  ringOffset: "0px",
  borderWidth: "1px",
  fontSans: "",
  fontMono: "",
  fontDisplay: "",
  chart: [],
};

const DELTAS = {
  light: { hover: -0.05, active: -0.09 },
  dark: { hover: 0.05, active: 0.1 },
};

type ModeInput = Partial<Scalars> & { colors?: Partial<ThemeColors> };

function emitMode(
  base: Mode,
  input: ModeInput | undefined,
  deltas: { hover: number; active: number },
): string {
  const userColors = input?.colors ?? {};
  const lines: string[] = [];

  (Object.keys(HOST_VAR) as (keyof ThemeColors)[]).forEach((key) => {
    if (key.endsWith("Fg")) {
      return;
    }
    lines.push(`--${HOST_VAR[key]}:${userColors[key] ?? base.colors[key]};`);
  });

  (Object.keys(FG_PAIR) as (keyof ThemeColors)[]).forEach((baseKey) => {
    const fgKey = FG_PAIR[baseKey]!;
    const baseValue = userColors[baseKey] ?? base.colors[baseKey];
    const fg =
      userColors[fgKey] ??
      (userColors[baseKey] !== undefined ? readableForeground(baseValue) : base.colors[fgKey]);
    lines.push(`--${HOST_VAR[fgKey]}:${fg};`);
  });

  STATEFUL.forEach((key) => {
    const baseValue = userColors[key] ?? base.colors[key];
    const overrode = userColors[key] !== undefined;
    const hover = overrode ? shiftLightness(baseValue, deltas.hover) : base.states[key].hover;
    const active = overrode ? shiftLightness(baseValue, deltas.active) : base.states[key].active;
    lines.push(`--${HOST_VAR[key]}-hover:${hover};`);
    lines.push(`--${HOST_VAR[key]}-active:${active};`);
  });

  (Object.keys(SCALAR_VAR) as (keyof typeof SCALAR_VAR)[]).forEach((key) => {
    const value = input?.[key] ?? base[key];
    if (value) {
      lines.push(`--${SCALAR_VAR[key]}:${value};`);
    }
  });

  return lines.join("");
}

export function createTheme(theme: Theme = {}): string {
  const { dark, ...light } = theme;
  const root = emitMode(lightMode, light, DELTAS.light);
  const darkBlock = emitMode(darkMode, dark, DELTAS.dark);
  return `:root{${root}}\n.dark{${darkBlock}}`;
}

export const defaultTheme = { light: lightMode, dark: darkMode } as const;

export function injectTheme(theme: Theme = {}): void {
  if (typeof document === "undefined") {
    return;
  }
  const id = "lattice-theme";
  const style =
    document.getElementById(id) ??
    document.head.appendChild(Object.assign(document.createElement("style"), { id }));
  style.textContent = createTheme(theme);
}
