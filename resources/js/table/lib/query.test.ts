import { expect, it, vi } from "vitest";
import { operatorLabel } from "./query";

const translate = vi.hoisted(() =>
  vi.fn<(namespace: string, key: string, fallback?: string) => string>((_namespace, key) => key),
);

vi.mock("@lattice-php/lattice/i18n", () => ({ translate }));

it("builds the operator translation key from the operator value verbatim", () => {
  expect(operatorLabel("starts_with")).toBe("table.operators.starts_with");
  expect(operatorLabel("not_in")).toBe("table.operators.not_in");
});
