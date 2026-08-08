import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { OperationView } from "./OperationView";

describe("OperationView", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows path and query controls with an always-active request panel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response('{"data":{"id":"product-1"}}', {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const screen = await render(
      <OperationView
        operationId="get-products-id"
        spec={{
          openapi: "3.1.0",
          info: { title: "Products", version: "1.0.0" },
          servers: [{ url: "https://api.example.test" }],
          paths: {
            "/products/{id}": {
              get: {
                parameters: [
                  {
                    name: "id",
                    in: "path",
                    required: true,
                    example: "product-1",
                    schema: { type: "string" },
                  },
                  {
                    name: "include",
                    in: "query",
                    style: "form",
                    explode: false,
                    schema: {
                      type: "array",
                      items: { type: "string", enum: ["variants", "prices"] },
                    },
                  },
                ],
                responses: { "200": { description: "OK" } },
              },
            },
          },
        }}
      />,
    );

    const requestPanel = screen.getByRole("complementary", { name: "Request" });
    const referencePanel = screen.getByRole("complementary", { name: "Reference" });
    const id = screen.getByLabelText("id");

    await expect.element(id).toBeVisible();
    await expect.element(id).toHaveValue("product-1");
    await expect.element(screen.getByRole("button", { name: "include" })).toBeVisible();
    await expect
      .element(referencePanel.getByLabelText("Request snippet", { exact: true }))
      .toHaveTextContent("https://api.example.test/products/product-1");
    await expect
      .element(requestPanel.getByLabelText("Request snippet", { exact: true }))
      .not.toBeInTheDocument();

    await requestPanel.getByRole("button", { name: "Execute" }).click();
    await expect.element(requestPanel.getByText("Live response")).toBeVisible();
    await expect.element(referencePanel.getByText("Live response")).not.toBeInTheDocument();

    await id.fill("product/2");
    await expect
      .element(screen.getByLabelText("Request snippet", { exact: true }))
      .toHaveTextContent("https://api.example.test/products/product%2F2");

    await id.fill("");
    await requestPanel.getByRole("button", { name: "Execute" }).click();
    await expect.element(screen.getByText("This path parameter is required.")).toBeVisible();
    await expect.element(id).toHaveFocus();
  });

  it("resets request state when the selected operation changes", async () => {
    const spec = {
      openapi: "3.1.0",
      info: { title: "Products", version: "1.0.0" },
      servers: [{ url: "https://api.example.test" }],
      paths: {
        "/products/{id}": {
          get: {
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                example: "product-1",
                schema: { type: "string" },
              },
            ],
            responses: { "200": { description: "OK" } },
          },
        },
        "/orders/{order}": {
          get: {
            parameters: [
              {
                name: "order",
                in: "path",
                required: true,
                example: "order-1",
                schema: { type: "string" },
              },
            ],
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };
    const screen = await render(<OperationView operationId="get-products-id" spec={spec} />);

    await screen.getByLabelText("id").fill("changed");
    await expect
      .element(screen.getByLabelText("Request snippet", { exact: true }))
      .toHaveTextContent("/products/changed");

    await screen.rerender(<OperationView operationId="get-orders-order" spec={spec} />);

    await expect.element(screen.getByLabelText("id")).not.toBeInTheDocument();
    await expect.element(screen.getByLabelText("order")).toHaveValue("order-1");
    await expect
      .element(screen.getByLabelText("Request snippet", { exact: true }))
      .toHaveTextContent("/orders/order-1");
  });

  it("shows a generated example by default for schema-only responses", async () => {
    const screen = await render(
      <OperationView
        operationId="get-products-id"
        spec={{
          openapi: "3.1.0",
          info: { title: "Products", version: "1.0.0" },
          components: {
            schemas: {
              Product: {
                allOf: [
                  {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "product-1" },
                    },
                  },
                  {
                    type: "object",
                    properties: {
                      name: { type: "string", example: "Desk" },
                    },
                  },
                ],
              },
            },
          },
          paths: {
            "/products/{id}": {
              get: {
                responses: {
                  "200": {
                    description: "OK",
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          properties: {
                            data: { $ref: "#/components/schemas/Product" },
                          },
                        },
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

    await expect
      .element(
        screen
          .getByRole("complementary", { name: "Reference" })
          .getByRole("radio", { name: "Example" }),
      )
      .toBeChecked();
    await expect.element(screen.getByText("Generated from schema")).toBeVisible();
    await expect.element(screen.getByRole("region", { name: "Response example" })).toBeVisible();
    await expect
      .poll(
        () => document.querySelector('[aria-label="Response example"] .cm-content')?.textContent,
      )
      .toContain('"id": "product-1"');
  });

  it("shows example descriptions and external values", async () => {
    const screen = await render(
      <OperationView
        operationId="get-widgets"
        spec={{
          openapi: "3.1.0",
          info: { title: "Widgets", version: "1.0.0" },
          paths: {
            "/widgets": {
              get: {
                responses: {
                  "200": {
                    description: "OK",
                    content: {
                      "application/json": {
                        examples: {
                          inline: {
                            description: "A complete inline example.",
                            value: { id: 1 },
                          },
                          external: {
                            summary: "Large payload",
                            externalValue: "https://example.test/widgets.json",
                          },
                        },
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

    await screen.getByRole("radio", { name: "Example" }).click();
    await expect.element(screen.getByText("A complete inline example.")).toBeVisible();
    await expect.element(screen.getByRole("region", { name: "Response example" })).toBeVisible();
    await expect
      .poll(() => document.querySelector(".cm-content")?.getAttribute("contenteditable"))
      .toBe("false");
    await expect.poll(() => document.querySelector(".cm-lineNumbers")).not.toBeNull();

    await screen.getByRole("combobox", { name: "Response example selection" }).selectOptions("1");
    await expect
      .element(screen.getByRole("link", { name: "Open external example" }))
      .toHaveAttribute("href", "https://example.test/widgets.json");
  });
});
