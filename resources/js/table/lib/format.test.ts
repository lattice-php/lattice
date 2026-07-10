import { describe, expect, it } from "vitest";
import type { TableColumn, TableRow } from "@lattice-php/lattice/table/types";
import { formatCell, resolveLink } from "./format";

const dateColumn = {
  key: "created",
  label: "Created",
  props: { date: { dateStyle: "medium", timeStyle: "short" } },
} as never;

describe("formatCell date rendering", () => {
  it("renders the default date format in the requested timezone", () => {
    const berlin = formatCell("2026-06-18T00:30:00Z", dateColumn, {
      locale: "en-GB",
      timeZone: "Europe/Berlin",
    });

    expect(berlin).toContain("02:30");
  });

  it("renders the same instant differently in another timezone", () => {
    const newYork = formatCell("2026-06-18T00:30:00Z", dateColumn, {
      locale: "en-GB",
      timeZone: "America/New_York",
    });

    expect(newYork).toContain("20:30");
  });
});

describe("formatCell primitives", () => {
  it("returns an empty string for null and undefined", () => {
    expect(formatCell(null)).toBe("");
    expect(formatCell(undefined)).toBe("");
  });

  it("stringifies primitives directly", () => {
    expect(formatCell("hello")).toBe("hello");
    expect(formatCell(42)).toBe("42");
    expect(formatCell(true)).toBe("true");
  });

  it("JSON-encodes non-primitive values", () => {
    expect(formatCell({ a: 1 })).toBe('{"a":1}');
  });
});

describe("resolveLink", () => {
  const column = (link: unknown): TableColumn =>
    ({ key: "name", label: "Name", props: { link } }) as never;
  const row: TableRow = { id: 7, name: "Ada" } as never;

  it("returns null when the column has no link", () => {
    expect(resolveLink(column(null), row, "Ada")).toBeNull();
  });

  it("returns null when the resolved href is empty", () => {
    expect(resolveLink(column({ href: null }), row, "")).toBeNull();
  });

  it("interpolates the value and row tokens into the href", () => {
    expect(resolveLink(column({ href: "/users/{id}?q={value}" }), row, "Ada & Co")).toBe(
      "/users/7?q=Ada%20%26%20Co",
    );
  });

  it("coerces missing row tokens to an empty string", () => {
    expect(resolveLink(column({ href: "/x/{missing}" }), row, "v")).toBe("/x/");
  });

  it("falls back to the cell value when no explicit href is set", () => {
    expect(resolveLink(column({ href: null }), row, "https://example.test")).toBe(
      "https://example.test",
    );
  });
});
