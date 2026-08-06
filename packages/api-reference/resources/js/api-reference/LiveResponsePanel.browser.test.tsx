import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { LiveResponsePanel } from "./LiveResponsePanel";

describe("LiveResponsePanel", () => {
  it("shows line numbers and scrolls response bodies longer than 150 lines", async () => {
    const screen = await render(
      <LiveResponsePanel
        result={{
          kind: "response",
          status: 200,
          statusText: "OK",
          durationMs: 12,
          headers: [],
          body: Array.from({ length: 151 }, (_, index) => `Line ${index + 1}`).join("\n"),
          contentType: "text/plain",
        }}
      />,
    );

    await expect
      .element(screen.getByLabelText("Live response body").getByText("1", { exact: true }))
      .toBeVisible();

    await expect
      .poll(() => {
        const scroller = document.querySelector<HTMLElement>(".cm-scroller");

        return scroller !== null && scroller.scrollHeight > scroller.clientHeight;
      })
      .toBe(true);
    await expect
      .poll(() => {
        const editor = document.querySelector<HTMLElement>(".cm-editor");

        return editor ? getComputedStyle(editor).maxHeight : null;
      })
      .toBe("800px");
  });
});
