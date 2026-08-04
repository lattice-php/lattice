export declare function normalizeHex(input: string): string | null;
export declare function ColorPicker({ value, onChange, palette, hexLabel, paletteLabel, }: {
    value: string;
    onChange: (hex: string) => void;
    palette: string[];
    hexLabel?: string;
    paletteLabel?: string;
}): import("react").JSX.Element;
