import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ApiReference } from "./ApiReference";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ApiReference", () => {
  it("groups operations by tag and mounts only the selected operation", async () => {
    window.history.replaceState(null, "", window.location.pathname);

    const screen = await render(
      <ApiReference
        defaultOperation="get-products"
        hideHeader
        spec={{
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
        }}
      />,
    );

    const listProducts = screen.getByRole("button", { name: /^List products/ });
    const createProduct = screen.getByRole("button", { name: /^Create product/ });
    const listOrders = screen.getByRole("button", { name: /^List orders/ }).all();
    const copyListProductsMarkdown = screen.getByRole("button", {
      name: "Copy List products as Markdown",
    });
    const clipboardWrite = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const listProductsHeader = listProducts.element().parentElement;

    await expect.element(screen.getByRole("heading", { name: "Products", level: 2 })).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "Orders", level: 2 })).toBeVisible();
    await expect.element(screen.getByLabelText("Select server")).toBeVisible();
    await expect.element(listProducts).toHaveAttribute("aria-expanded", "true");
    expect(listProductsHeader).not.toBeNull();
    await expect
      .element(listProductsHeader as HTMLElement)
      .toMatchTextContent("https://api.example.test/products");
    await expect.element(createProduct).toHaveAttribute("aria-expanded", "false");
    expect(listOrders).toHaveLength(2);
    await expect.element(listOrders[0]).toHaveAttribute("aria-expanded", "false");
    await expect.element(listOrders[1]).toHaveAttribute("aria-expanded", "false");
    const description = screen.getByText(/Browse the product catalog/);
    await expect.element(description).toBeVisible();
    const separator = screen.getByRole("separator");
    await expect.element(separator).toBeVisible();
    const requestPanel = screen.getByRole("complementary", { name: "Request" });
    await expect.element(requestPanel).toBeVisible();
    await expect
      .element(requestPanel.getByRole("button", { name: "Copy as Markdown" }))
      .not.toBeInTheDocument();

    await copyListProductsMarkdown.click();
    await expect.poll(() => clipboardWrite.mock.calls[0]?.[0]).toContain("# List products");
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
        defaultOperation="get-products"
        hideBaseUrl
        spec={{
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
        }}
      />,
    );

    const copyUrl = screen.getByRole("button", { name: "Copy List products URL" });

    await expect.element(screen.getByLabelText("Select server")).not.toBeInTheDocument();
    await expect
      .element(copyUrl.element().parentElement as HTMLElement)
      .toMatchTextContent("https://api.example.test/products");
  });

  it("keeps Execute directly below parameters when the response reference is tall", async () => {
    window.history.replaceState(null, "", window.location.pathname);

    const responseProperties = Object.fromEntries(
      Array.from({ length: 40 }, (_, index) => [`field_${index}`, { type: "string" }]),
    );
    const screen = await render(
      <ApiReference
        defaultOperation="get-products"
        hideHeader
        spec={{
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
        }}
      />,
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

  it("delegates selection to the host when controlled", async () => {
    window.history.replaceState(null, "", window.location.pathname);

    const onOperationChange = vi.fn();
    const screen = await render(
      <ApiReference
        hideHeader
        selectedOperation="post-products"
        onOperationChange={onOperationChange}
        spec={{
          openapi: "3.1.0",
          info: { title: "Catalog", version: "1.0.0" },
          paths: {
            "/products": {
              get: {
                summary: "List products",
                tags: ["Products"],
                responses: { "200": { description: "OK" } },
              },
              post: {
                summary: "Create product",
                tags: ["Products"],
                responses: { "201": { description: "Created" } },
              },
            },
          },
        }}
      />,
    );

    const listProducts = screen.getByRole("button", { name: /^List products/ });
    const createProduct = screen.getByRole("button", { name: /^Create product/ });

    await expect.element(createProduct).toHaveAttribute("aria-expanded", "true");
    await expect.element(listProducts).toHaveAttribute("aria-expanded", "false");

    await listProducts.click();

    expect(onOperationChange).toHaveBeenCalledWith("get-products");
    await expect.element(createProduct).toHaveAttribute("aria-expanded", "true");
    await expect.element(listProducts).toHaveAttribute("aria-expanded", "false");
    expect(window.location.hash).toBe("");
  });

  it("leaves location.hash alone when deep linking is disabled", async () => {
    window.history.replaceState(null, "", `${window.location.pathname}#get-products`);

    const screen = await render(
      <ApiReference
        hideHeader
        deepLinking={false}
        defaultOperation="post-products"
        spec={{
          openapi: "3.1.0",
          info: { title: "Catalog", version: "1.0.0" },
          paths: {
            "/products": {
              get: {
                summary: "List products",
                tags: ["Products"],
                responses: { "200": { description: "OK" } },
              },
              post: {
                summary: "Create product",
                tags: ["Products"],
                responses: { "201": { description: "Created" } },
              },
            },
          },
        }}
      />,
    );

    const listProducts = screen.getByRole("button", { name: /^List products/ });
    const createProduct = screen.getByRole("button", { name: /^Create product/ });

    await expect.element(createProduct).toHaveAttribute("aria-expanded", "true");

    await listProducts.click();

    await expect.element(listProducts).toHaveAttribute("aria-expanded", "true");
    await expect.element(createProduct).toHaveAttribute("aria-expanded", "false");
    expect(window.location.hash).toBe("#get-products");

    window.history.replaceState(null, "", window.location.pathname);
  });
});
