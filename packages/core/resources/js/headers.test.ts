import { afterEach, expect, it } from "vitest";
import { setRequestHeaderProvider, withHeaders } from "./headers";

afterEach(() => {
  setRequestHeaderProvider(() => ({}));
});

it("composes configured request headers with the component reference header", () => {
  setRequestHeaderProvider(() => ({ "Accept-Language": "de" }));

  expect(withHeaders("sealed-ref", { Accept: "application/json" })).toEqual({
    "Accept-Language": "de",
    "X-Lattice-Ref": "sealed-ref",
    Accept: "application/json",
  });
});

it("omits the component reference header when no reference is available", () => {
  expect(withHeaders()).toEqual({});
});
