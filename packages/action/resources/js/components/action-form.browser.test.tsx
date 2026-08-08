import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, Renderer } from "@lattice-php/lattice";
import type { Node } from "@lattice-php/lattice";
import { RegistryContext } from "@lattice-php/core";
import { formComponents } from "@lattice-php/form";
import { fakeNode } from "@lattice-php/core/test-support";
import { actionComponents } from "@lattice-php/action/plugin";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({
    createInertiaApp: vi.fn(),
  }),
);

function rejectAction(): Node {
  return fakeNode({
    id: "test.reject",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Submit", title: "Reject item?" },
      endpoint: "/lattice/actions/test.reject",
      form: {
        id: "test.reject-form",
        props: { precognitive: true },
        schema: [
          { key: "reason", props: { label: "Reason", name: "reason" }, type: "field.text-input" },
        ],
        type: "form",
      },
      label: "Reject",
      method: "post",
      ref: "sealed-ref",
    },
  });
}

const registry = createRegistry(actionComponents, formComponents);

describe("action form modal in a browser", () => {
  it("validates precognitively as the user types", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const screen = await render(<Renderer nodes={[rejectAction()]} />, {
      wrapper: ({ children }) => (
        <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
      ),
    });

    await screen.getByRole("button", { name: "Reject" }).click();

    const reason = screen.getByRole("textbox", { name: "Reason" });
    await expect.element(reason).toBeVisible();
    await userEvent.type(reason, "x");

    await expect.poll(() => fetchMock.mock.calls.length, { timeout: 3000 }).toBeGreaterThan(0);

    const [, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Precognition).toBe("true");
    expect(headers["Precognition-Validate-Only"]).toBe("reason");
  });
});
