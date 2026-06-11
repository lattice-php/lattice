import css from "../../resources/css/lattice.css?raw";
import { parseSuffixMap, parseTokens } from "./tokens";

export const tokenRegistry = parseTokens(css);
export const suffixMap = parseSuffixMap(css);
