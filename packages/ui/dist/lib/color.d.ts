import { CSSProperties } from 'react';
import { Color, ColorName } from '../types.js';
export declare function namedColor(value: ColorName): Color;
export declare function coerceColor(value: unknown): Color | undefined;
export declare function colorValue(color: Color): string;
export declare function toneProps(color: Color): {
    className?: string;
    style?: CSSProperties;
};
