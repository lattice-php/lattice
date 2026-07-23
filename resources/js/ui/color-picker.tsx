import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@lattice-php/lattice/lib/utils";
import { Input } from "./input";

export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "").toLowerCase();

  if (/^[0-9a-f]{6}$/.test(raw)) {
    return `#${raw}`;
  }

  if (/^[0-9a-f]{3}$/.test(raw)) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
  }

  return null;
}

export function ColorPicker({
  value,
  onChange,
  palette,
  hexLabel = "Hex color",
  paletteLabel = "Color palette",
}: {
  value: string;
  onChange: (hex: string) => void;
  palette: string[];
  hexLabel?: string;
  paletteLabel?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const color = normalizeHex(value) ?? "var(--lt-muted-fg)";

  return (
    <div className="flex w-56 flex-col gap-3" data-slot="color-picker">
      <HexColorPicker className="!w-full" color={color} onChange={onChange} />
      {palette.length > 0 && (
        <div aria-label={paletteLabel} className="flex flex-wrap gap-1.5" role="listbox">
          {palette.map((swatch) => {
            const normalized = normalizeHex(swatch) ?? swatch;

            return (
              <button
                aria-label={normalized}
                aria-selected={normalized === color}
                className={cn(
                  "size-6 shrink-0 rounded-full border border-lt-border",
                  normalized === color && "ring-[length:var(--lt-ring-width)] ring-lt-ring/50",
                )}
                key={swatch}
                onClick={() => onChange(normalized)}
                role="option"
                style={{ background: swatch }}
                type="button"
              />
            );
          })}
        </div>
      )}
      <Input
        aria-label={hexLabel}
        onBlur={() => setDraft(null)}
        onChange={(event) => {
          const text = event.target.value;
          const hex = normalizeHex(text);
          setDraft(text);

          if (hex !== null) {
            onChange(hex);
          }
        }}
        value={draft ?? color}
      />
    </div>
  );
}
