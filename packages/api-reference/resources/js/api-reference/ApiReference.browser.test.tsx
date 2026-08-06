import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { Node } from "@lattice-php/lattice";
import ApiReference from "./ApiReference";
import { ServerPicker } from "./ServerPicker";

function apiReferenceNode(props: Record<string, unknown>): Node<"api-reference"> {
  return { type: "api-reference", props };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ApiReference", () => {
  it("aligns a single base URL without horizontal padding", async () => {
    const screen = await render(
      <ServerPicker
        servers={[{ url: "https://api.example.test", description: "Production" }]}
        selectedServerUrl="https://api.example.test"
        onServerChange={() => undefined}
      />,
    );

    const url = screen.getByText("Production — https://api.example.test");

    await expect.element(url).toBeVisible();
    expect(url.element().classList).toContain("py-1");
    expect(url.element().classList).not.toContain("px-2");
  });

  it("groups operations by tag and mounts only the selected operation", async () => {
    window.history.replaceState(null, "", window.location.pathname);

    const screen = await render(
      <ApiReference
        node={apiReferenceNode({
          defaultOperation: "get-products",
          hideHeader: true,
          spec: {
            openapi: "3.1.0",
            info: { title: "Catalog", version: "1.0.0" },
            servers: [
              { url: "https://api.example.test", description: "Production" },
              { url: "https://sandbox.example.test", description: "Sandbox" },
            ],
            paths: {
              "/products": {
                get: {
                  summary: "List products",
                  description:
                    "Browse the product catalog and inspect the current availability of every item.\n\nUse filters to narrow the result set.",
                  tags: ["Products"],
                  responses: { "200": { description: "OK" } },
                },
                post: {
                  summary: "Create product",
                  tags: ["Products"],
                  responses: { "201": { description: "Created" } },
                },
              },
              "/orders": {
                get: {
                  summary: "List orders",
                  tags: ["Products", "Orders"],
                  responses: { "200": { description: "OK" } },
                },
              },
            },
          },
        })}
      >
        {null}
      </ApiReference>,
    );

    const listProducts = screen.getByRole("button", { name: /^List products/ });
    const createProduct = screen.getByRole("button", { name: /^Create product/ });
    const listOrders = screen.getByRole("button", { name: /^List orders/ }).all();
    const copyListProductsUrl = screen.getByRole("button", { name: "Copy List products URL" });
    const copyListProductsMarkdown = screen.getByRole("button", {
      name: "Copy List products as Markdown",
    });
    const clipboardWrite = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const listProductsHeader = listProducts.element().parentElement;
    const listProductsUrlRow = copyListProductsUrl.element().parentElement;
    const listProductsUrl = listProductsUrlRow?.querySelector("span");
    const markdownLabel = copyListProductsMarkdown.element().querySelector(":scope > span");
    const groups = screen.getByRole("heading", { name: "Products", level: 2 }).element()
      .parentElement?.parentElement;
    const serverRow = screen.getByLabelText("Select server").element().parentElement;

    await expect.element(screen.getByRole("navigation")).not.toBeInTheDocument();
    await expect.element(screen.getByRole("heading", { name: "Products", level: 2 })).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "Orders", level: 2 })).toBeVisible();
    await expect.element(screen.getByLabelText("Select server")).toBeVisible();
    await expect.element(listProducts).toHaveAttribute("aria-expanded", "true");
    expect(listProductsHeader).not.toBeNull();
    await expect
      .element(listProductsHeader as HTMLElement)
      .toHaveTextContent("https://api.example.test/products");
    expect(listProducts.element().className).toContain("absolute inset-0");
    expect(listProductsHeader?.className).toContain("bg-lt-muted");
    expect(listProductsHeader?.firstElementChild?.classList).toContain("@container");
    expect(listProductsUrl?.classList).toContain("break-words");
    expect(markdownLabel?.classList).toContain("hidden");
    expect(markdownLabel?.classList).toContain("@3xl:inline");
    expect(serverRow?.classList).toContain("py-3");
    expect(serverRow?.classList).not.toContain("p-3");
    expect(groups?.classList).toContain("py-6");
    expect(groups?.classList).not.toContain("p-6");
    expect(listProductsUrlRow?.previousElementSibling?.textContent).toBe("List products");
    expect(copyListProductsMarkdown.element().parentElement).not.toBe(listProductsUrlRow);
    expect(
      listProductsHeader?.querySelector("svg")?.compareDocumentPosition(listProducts.element()),
    ).toBe(globalThis.Node.DOCUMENT_POSITION_FOLLOWING);
    await expect.element(createProduct).toHaveAttribute("aria-expanded", "false");
    expect(listOrders).toHaveLength(2);
    await expect.element(listOrders[0]).toHaveAttribute("aria-expanded", "false");
    await expect.element(listOrders[1]).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("h1")).toBeNull();
    const description = screen.getByText(/Browse the product catalog/);
    await expect.element(description).toBeVisible();
    expect(getComputedStyle(description.element()).whiteSpace).toBe("pre-line");
    const separator = screen.getByRole("separator");
    await expect.element(separator).toBeVisible();
    expect(getComputedStyle(separator.element()).marginTop).toBe("32px");
    expect(getComputedStyle(separator.element()).marginBottom).toBe("32px");
    expect(getComputedStyle(description.element()).fontSize).toBe("14px");
    const requestPanel = screen.getByRole("complementary", { name: "Request" });
    await expect.element(requestPanel).toBeVisible();
    await expect
      .element(requestPanel.getByRole("button", { name: "Copy as Markdown" }))
      .not.toBeInTheDocument();

    await copyListProductsUrl.click();
    await expect
      .poll(() => clipboardWrite.mock.calls[0]?.[0])
      .toBe("https://api.example.test/products");
    await copyListProductsMarkdown.click();
    await expect.poll(() => clipboardWrite.mock.calls[1]?.[0]).toContain("# List products");
    await expect.element(listProducts).toHaveAttribute("aria-expanded", "true");

    await listProducts.click();
    await expect.element(listProducts).toHaveAttribute("aria-expanded", "false");
    await expect
      .poll(() => screen.getByRole("complementary", { name: "Request" }).all().length)
      .toBe(0);
    await listProducts.click();
    await expect.element(listProducts).toHaveAttribute("aria-expanded", "true");

    await createProduct.click();

    await expect.element(listProducts).toHaveAttribute("aria-expanded", "false");
    await expect.element(createProduct).toHaveAttribute("aria-expanded", "true");
    await expect.element(screen.getByRole("separator")).not.toBeInTheDocument();
    expect(document.querySelector("h1")).toBeNull();
    await expect
      .poll(() => screen.getByRole("complementary", { name: "Request" }).all().length)
      .toBe(1);
    expect(window.location.hash).toBe("#post-products");

    await listOrders[1].click();

    await expect.element(listOrders[0]).toHaveAttribute("aria-expanded", "false");
    await expect.element(listOrders[1]).toHaveAttribute("aria-expanded", "true");
    await expect
      .poll(() => screen.getByRole("complementary", { name: "Request" }).all().length)
      .toBe(1);
  });

  it("hides the base URL row without shortening operation URLs", async () => {
    window.history.replaceState(null, "", window.location.pathname);

    const screen = await render(
      <ApiReference
        node={apiReferenceNode({
          defaultOperation: "get-products",
          hideBaseUrl: true,
          spec: {
            openapi: "3.1.0",
            info: { title: "Catalog", version: "1.0.0" },
            servers: [
              { url: "https://api.example.test", description: "Production" },
              { url: "https://sandbox.example.test", description: "Sandbox" },
            ],
            paths: {
              "/products": {
                get: {
                  summary: "List products",
                  tags: ["Products"],
                  responses: { "200": { description: "OK" } },
                },
              },
            },
          },
        })}
      >
        {null}
      </ApiReference>,
    );

    const copyUrl = screen.getByRole("button", { name: "Copy List products URL" });
    const clipboardWrite = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const infoHeader = screen
      .getByRole("heading", { name: "Catalog", level: 1 })
      .element().parentElement;

    await expect.element(screen.getByLabelText("Select server")).not.toBeInTheDocument();
    expect(infoHeader?.classList).toContain("py-6");
    expect(infoHeader?.classList).not.toContain("p-6");
    await expect
      .element(copyUrl.element().parentElement as HTMLElement)
      .toHaveTextContent("https://api.example.test/products");

    await copyUrl.click();

    await expect
      .poll(() => clipboardWrite.mock.calls[0]?.[0])
      .toBe("https://api.example.test/products");
  });

  it("keeps Execute directly below parameters when the response reference is tall", async () => {
    window.history.replaceState(null, "", window.location.pathname);

    const responseProperties = Object.fromEntries(
      Array.from({ length: 40 }, (_, index) => [`field_${index}`, { type: "string" }]),
    );
    const screen = await render(
      <ApiReference
        node={apiReferenceNode({
          defaultOperation: "get-products",
          hideHeader: true,
          spec: {
            openapi: "3.1.0",
            info: { title: "Catalog", version: "1.0.0" },
            paths: {
              "/products": {
                get: {
                  summary: "List products",
                  tags: ["Products"],
                  parameters: [
                    {
                      name: "per_page",
                      in: "query",
                      description: "The number of products per page.",
                      schema: { type: "integer", default: 15 },
                    },
                  ],
                  responses: {
                    "200": {
                      description: "OK",
                      content: {
                        "application/json": {
                          schema: { type: "object", properties: responseProperties },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })}
      >
        {null}
      </ApiReference>,
    );

    const parameter = screen.getByLabelText("per_page");
    const execute = screen.getByRole("button", { name: "Execute" });

    await expect.element(parameter).toBeVisible();
    await expect.element(execute).toBeVisible();
    await expect
      .poll(
        () =>
          execute.element().getBoundingClientRect().top -
          parameter.element().getBoundingClientRect().bottom,
      )
      .toBeLessThan(96);
  });
});
