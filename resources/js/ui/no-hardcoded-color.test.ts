import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const files = ["./color-picker.tsx", "../form/components/fields/color-picker-field.tsx"];

describe("no raw hex colors in the color-picker components", () => {
  it.each(files)("%s does not reference #6b7280", (relative) => {
    const path = fileURLToPath(new URL(relative, import.meta.url));
    expect(readFileSync(path, "utf8")).not.toContain("#6b7280");
  });
});
