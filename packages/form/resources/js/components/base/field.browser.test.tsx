import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { FormFieldFrame } from "./field";

describe("FormFieldFrame in a browser", () => {
  it("keeps a required field's control at the same height as an optional sibling", async () => {
    await render(
      <div style={{ display: "flex", gap: "16px", width: "400px" }}>
        <div style={{ flex: 1 }}>
          <FormFieldFrame id="required-field" label="Steuersatzart" required>
            {(controlProps) => <input {...controlProps} data-test="required-control" />}
          </FormFieldFrame>
        </div>
        <div style={{ flex: 1 }}>
          <FormFieldFrame id="optional-field" label="Steuerkategorie">
            {(controlProps) => <input {...controlProps} data-test="optional-control" />}
          </FormFieldFrame>
        </div>
      </div>,
    );

    const requiredControl = document.querySelector('[data-test="required-control"]') as HTMLElement;
    const optionalControl = document.querySelector('[data-test="optional-control"]') as HTMLElement;

    expect(requiredControl.getBoundingClientRect().top).toBe(
      optionalControl.getBoundingClientRect().top,
    );
  });
});
