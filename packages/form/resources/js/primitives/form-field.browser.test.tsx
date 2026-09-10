import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { FormField } from "./form-field";

describe("FormField in a browser", () => {
  it("keeps a required field's control at the same height as an optional sibling", async () => {
    await render(
      <div style={{ display: "flex", gap: "16px", width: "400px" }}>
        <div style={{ flex: 1 }}>
          <FormField id="required-field" label="Steuersatzart" required>
            {(controlProps) => <input {...controlProps} data-test="required-control" />}
          </FormField>
        </div>
        <div style={{ flex: 1 }}>
          <FormField id="optional-field" label="Steuerkategorie">
            {(controlProps) => <input {...controlProps} data-test="optional-control" />}
          </FormField>
        </div>
      </div>,
    );

    const requiredControl = document.querySelector('[data-test="required-control"]') as HTMLElement;
    const optionalControl = document.querySelector('[data-test="optional-control"]') as HTMLElement;

    expect(requiredControl.getBoundingClientRect().top).toBe(
      optionalControl.getBoundingClientRect().top,
    );
  });

  it("clamps a control wider than the frame instead of growing with it", async () => {
    await render(
      <div style={{ width: "400px" }}>
        <FormField id="wide-field" label="Document">
          {(controlProps) => (
            <div
              {...controlProps}
              data-test="wide-control"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                data-test="wide-viewer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  height: "200px",
                }}
              >
                <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                  <div style={{ flex: 1, overflow: "auto" }}>
                    <div style={{ width: "3000px", height: "50px" }}>a very wide document</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </FormField>
      </div>,
    );

    const control = document.querySelector('[data-test="wide-control"]')!;
    const viewer = document.querySelector('[data-test="wide-viewer"]')!;

    expect(Math.round(control.getBoundingClientRect().width)).toBe(400);
    expect(Math.round(viewer.getBoundingClientRect().width)).toBe(400);
  });
});
