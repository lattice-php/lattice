import { configure, render } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { hiddenInputsFor } from "./hidden-inputs";

beforeAll(() => configure({ testIdAttribute: "data-test" }));

function renderInputs(name: string, value: unknown) {
  return render(<>{hiddenInputsFor(name, value)}</>).container.querySelectorAll(
    'input[type="hidden"]',
  );
}

describe("hiddenInputsFor", () => {
  it("emits hidden inputs for nested slot rows including their rowId", () => {
    const inputs = renderInputs("content[0][slots]", {
      left: [{ rowId: "x", type: "text", body: "L" }],
    });

    const byName = Object.fromEntries(
      Array.from(inputs).map((input) => [input.getAttribute("name"), input.getAttribute("value")]),
    );

    expect(byName["content[0][slots][left][0][type]"]).toBe("text");
    expect(byName["content[0][slots][left][0][body]"]).toBe("L");
    expect(byName["content[0][slots][left][0][rowId]"]).toBe("x");
    expect(inputs).toHaveLength(3);
  });

  it("emits nothing for null or undefined", () => {
    expect(hiddenInputsFor("content[0][slots]", null)).toHaveLength(0);
    expect(hiddenInputsFor("content[0][slots]", undefined)).toHaveLength(0);
  });
});
