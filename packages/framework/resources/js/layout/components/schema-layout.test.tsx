import { usePage } from "@inertiajs/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "@lattice-php/lattice";
import type { PagePayload } from "@lattice-php/lattice";
import SchemaLayout from "./schema-layout";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock(),
);

const mockedUsePage = vi.mocked(usePage);

function payload(lattice: Partial<PagePayload> = {}): PagePayload {
  return {
    breadcrumbs: [],
    listeners: [],
    schema: [],
    container: "default",
    layout: null,
    title: "Lattice",
    ...lattice,
  };
}

function renderLayout(lattice: PagePayload) {
  mockedUsePage.mockReturnValue({ props: { lattice } } as unknown as ReturnType<typeof usePage>);

  return render(
    <Provider>
      <SchemaLayout>
        <span>Page body</span>
      </SchemaLayout>
    </Provider>,
  );
}

describe("SchemaLayout", () => {
  it("renders the layout schema and the page at the outlet", () => {
    renderLayout(
      payload({
        layout: {
          key: "app",
          schema: [{ props: { text: "Sidebar" }, type: "text" }, { type: "outlet" }],
        },
      }),
    );

    expect(screen.getByText("Sidebar")).toBeVisible();
    expect(screen.getByText("Page body")).toBeVisible();
  });

  it("renders the page standalone when there is no layout", () => {
    renderLayout(payload({ layout: null }));

    expect(screen.getByText("Page body")).toBeVisible();
  });
});
