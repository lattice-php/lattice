import { BlockStyle, FrameClasses, StyleClasses } from "../types";
/** The frame classes a block style resolves to, mirroring the server's StyleClassMap. */
export declare function frameClasses(map: StyleClasses, style: BlockStyle): FrameClasses;
