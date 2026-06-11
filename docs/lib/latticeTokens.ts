import latticeCss from "../../resources/css/lattice.css?raw";
import { parseSuffixMap, parseTokens } from "./tokens";

export const tokenRegistry = parseTokens(latticeCss);
export const suffixMap = parseSuffixMap(latticeCss);
