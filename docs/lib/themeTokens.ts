import css from "@lattice-php/lattice/css?raw";
import { parseSuffixMap, parseTokens } from "./tokens";

export const tokenRegistry = parseTokens(css);
export const suffixMap = parseSuffixMap(css);
