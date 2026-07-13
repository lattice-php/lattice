import { expect, it, vi } from "vitest";
import { operatorLabel } from "./query";

const translate = vi.hoisted(() =>
  vi.fn<(namespace: string, key: string, fallback?: string) => string>((_namespace, key) => key),
);

vi.mock("@lattice-php/lattice/i18n", () => ({ translate }));

it("uses kebab-case operator translation keys", () => {
  expect(operatorLabel("starts_with")).toBe("table.operators.starts-with");
});
