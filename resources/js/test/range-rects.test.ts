import { expect, it } from "vitest";

it("gives Range the rect methods ProseMirror calls during scrollToSelection", () => {
  const range = document.createRange();
  range.selectNodeContents(document.body);

  expect(range.getClientRects()).toHaveLength(0);
  expect(() => range.getBoundingClientRect()).not.toThrow();
});
