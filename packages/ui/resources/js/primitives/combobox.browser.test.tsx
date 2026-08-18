import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { useState } from "react";
import { Combobox } from "./combobox";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

const options = Array.from({ length: 40 }, (_, index) => ({
  data: {},
  label: `Option ${index + 1}`,
  value: `option-${index + 1}`,
}));

function DialogWithCombobox() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open>
      <DialogContent>
        <DialogTitle>Webhook</DialogTitle>
        <Combobox
          multiple
          onSelect={() => {}}
          open={open}
          onOpenChange={setOpen}
          options={options}
          selected={[]}
          showSearch={false}
          testId="events"
          trigger={<span>Select…</span>}
        />
      </DialogContent>
    </Dialog>
  );
}

function PageWithCombobox({ onSubmit }: { onSubmit: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Combobox
        multiple
        onSelect={() => {}}
        open={open}
        onOpenChange={setOpen}
        options={options}
        selected={[]}
        showSearch={false}
        testId="events"
        trigger={<span>Select…</span>}
      />
      <button onClick={onSubmit} type="button">
        Save
      </button>
    </div>
  );
}

describe("Combobox in a browser", () => {
  it("keeps wheel scrolling alive inside a modal dialog", async () => {
    const screen = await render(<DialogWithCombobox />);

    await screen.getByRole("button", { name: "Select…" }).click();
    await expect.element(screen.getByRole("listbox")).toBeVisible();

    const listbox = screen.getByRole("listbox").element();
    const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 120 });
    listbox.dispatchEvent(wheel);

    expect(wheel.defaultPrevented).toBe(false);

    listbox.scrollTop = 100;
    expect(listbox.scrollTop).toBeGreaterThan(0);
  });

  it("lets an outside click land in one go when not inside a dialog", async () => {
    let submitted = 0;
    const screen = await render(<PageWithCombobox onSubmit={() => submitted++} />);

    await screen.getByRole("button", { name: "Select…" }).click();
    await expect.element(screen.getByRole("listbox")).toBeVisible();

    await screen.getByRole("button", { name: "Save" }).click();

    expect(submitted).toBe(1);
  });
});
