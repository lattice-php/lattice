import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { clearRemoteTokenCache, type RemoteAccess } from "@lattice-php/core/api";
import { parameter, requestContract } from "../test-support";
import { ApiReference } from "./ApiReference";
import { RequestPlayground } from "./RequestPlayground";
import type { Contract, Operation } from "./types";

const REAL_TOKEN = "real-secret-token";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  clearRemoteTokenCache();
});

function bodyContract(overrides: Partial<Contract> = {}): Contract {
  return requestContract({
    schema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", example: "Desk" },
      },
    },
    required: true,
    ...overrides,
  });
}

function playgroundOperation(overrides: Partial<Operation> = {}): Operation {
  const id = parameter({ name: "id", location: "path", required: true, example: "42" });
  const status = parameter({
    name: "status",
    location: "query",
    schema: { type: "string", enum: ["active", "archived"] },
  });
  const debug = parameter({
    name: "X-Debug",
    location: "header",
    schema: { type: "boolean", default: false },
  });

  return {
    summary: {
      id: "update-widget",
      method: "PATCH",
      path: "/widgets/{id}",
      title: "Update widget",
      deprecated: false,
    },
    description: null,
    tooltip: null,
    tags: [],
    paramGroups: [
      { location: "path", params: [id] },
      { location: "query", params: [status] },
      { location: "header", params: [debug] },
    ],
    requests: [bodyContract()],
    responses: [],
    security: [],
    ...overrides,
    serverUrl: overrides.serverUrl ?? "https://api.example.test",
    servers: overrides.servers ?? [{ url: "https://api.example.test", description: null }],
    usesRootServers: overrides.usesRootServers ?? true,
  };
}

describe("RequestPlayground", () => {
  it("builds, copies, executes, and presents a request without exposing its token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', {
        status: 201,
        statusText: "Created",
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          security: [
            {
              schemes: [
                { name: "oauth2", scopes: ["widgets:write"], type: "oauth2", scheme: null },
              ],
            },
          ],
        })}
        baseUrl="https://api.example.test/v1"
        token={REAL_TOKEN}
        components={{ securitySchemes: { oauth2: { type: "oauth2" } } }}
        twoColumnBreakpoint="xl"
      />,
    );

    const id = screen.getByLabelText("id");
    const bodyName = screen.getByLabelText("name");
    const snippet = screen.getByLabelText("Request snippet", { exact: true });
    const requestPanel = screen.getByRole("complementary", { name: "Request" });
    const execute = requestPanel.getByRole("button", { name: "Execute" });
    const markdownCopy = requestPanel.getByRole("button", { name: "Copy as Markdown" });

    await expect.element(id).toHaveValue("42");
    await expect.element(screen.getByLabelText("status")).toBeVisible();
    await expect.element(screen.getByLabelText("X-Debug")).toBeVisible();
    await expect.element(bodyName).toHaveValue("Desk");
    await expect
      .element(screen.getByRole("radio", { name: "cURL" }))
      .toHaveAttribute("aria-checked", "true");
    await expect.element(snippet).toHaveAttribute("data-slot", "code-block");
    await expect.element(snippet).toMatchTextContent("Bearer <YOUR_TOKEN>");
    await expect.element(snippet).not.toMatchTextContent(REAL_TOKEN);
    await expect.element(screen.getByText("Access token supplied by the host page.")).toBeVisible();

    await id.fill("a/b");
    await screen.getByLabelText("status").selectOptions("archived");
    await bodyName.fill("Lamp");
    await screen.getByRole("radio", { name: "JavaScript" }).click();

    await expect
      .element(snippet)
      .toMatchTextContent('fetch("https://api.example.test/v1/widgets/a%2Fb?status=archived"');
    await expect.element(snippet).toMatchTextContent('\\"name\\": \\"Lamp\\"');

    const selectedSnippet = snippet.element().querySelector<HTMLElement>(".cm-content")?.innerText;
    expect(selectedSnippet).not.toBeNull();
    const clipboardWrite = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await screen.getByRole("button", { name: "Copy Request snippet" }).click();
    await expect.poll(() => clipboardWrite.mock.calls.length).toBe(1);
    expect(clipboardWrite).toHaveBeenCalledWith(selectedSnippet);
    await expect
      .element(screen.getByRole("button", { name: "Copied Request snippet" }))
      .toBeVisible();
    await markdownCopy.click();
    await expect.poll(() => clipboardWrite.mock.calls[1]?.[0]).toContain("# Update widget");
    await execute.click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.example.test/v1/widgets/a%2Fb?status=archived",
    );
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("Authorization")).toBe(
      `Bearer ${REAL_TOKEN}`,
    );
    await expect.element(screen.getByText("201 Created")).toBeVisible();
    const responseBody = screen.getByRole("region", { name: "Live response body" });
    await expect.element(responseBody).toHaveAttribute("data-slot", "code-block");
    await expect.element(responseBody).toMatchTextContent('"ok": true');
    await expect.element(screen.locator).not.toMatchTextContent(REAL_TOKEN);
  });

  it("edits JSON object request bodies as schema fields", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          summary: {
            id: "create-order",
            method: "POST",
            path: "/orders",
            title: "Create order",
            deprecated: false,
          },
          paramGroups: [],
          requests: [
            bodyContract({
              schema: {
                type: "object",
                required: ["name", "active", "launchDate", "publishedAt", "address", "items"],
                properties: {
                  name: { type: "string", example: "Desk" },
                  status: { type: "string", enum: ["draft", "confirmed"] },
                  active: { type: "boolean", default: false },
                  launchDate: { type: "string", format: "date", example: "2026-08-03" },
                  publishedAt: {
                    type: "string",
                    format: "date-time",
                    example: "2026-08-03T10:30:00Z",
                  },
                  address: {
                    type: "object",
                    required: ["city"],
                    properties: {
                      city: { type: "string", example: "Berlin" },
                    },
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["sku", "quantity"],
                      properties: {
                        sku: { type: "string", example: "SKU-1" },
                        quantity: { type: "integer", default: 1 },
                      },
                    },
                  },
                },
              },
            }),
          ],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    await expect.element(screen.getByLabelText("name")).toHaveValue("Desk");
    await expect.element(screen.getByLabelText("status")).toHaveValue("");
    await expect.element(screen.getByLabelText("active")).toHaveValue("false");
    await expect.element(screen.getByLabelText("launchDate")).toHaveValue("2026-08-03");
    await expect.element(screen.getByLabelText("publishedAt")).toHaveValue("2026-08-03T10:30:00Z");
    await expect.element(screen.getByLabelText("address.city")).toHaveValue("Berlin");
    await expect.element(screen.getByLabelText("items[0].sku")).toHaveValue("SKU-1");
    await expect.element(screen.getByLabelText("items[0].quantity")).toHaveValue(1);

    await screen.getByRole("button", { name: "Execute" }).click();
    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).not.toHaveProperty("status");
    fetchMock.mockClear();

    await screen.getByLabelText("name").fill("Lamp");
    await screen.getByLabelText("status").selectOptions("confirmed");
    await screen.getByLabelText("active").selectOptions("true");
    await screen.getByLabelText("items[0].sku").fill("SKU-2");
    await screen.getByLabelText("items[0].quantity").fill("3");
    await screen.getByRole("button", { name: "Add items item" }).click();
    await screen.getByLabelText("items[1].sku").fill("SKU-3");
    await screen.getByLabelText("items[1].quantity").fill("2");
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      name: "Lamp",
      status: "confirmed",
      active: true,
      launchDate: "2026-08-03",
      publishedAt: "2026-08-03T10:30:00Z",
      address: { city: "Berlin" },
      items: [
        { sku: "SKU-2", quantity: 3 },
        { sku: "SKU-3", quantity: 2 },
      ],
    });
  });

  it("switches discriminated oneOf request body variants", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          summary: {
            id: "store-page",
            method: "POST",
            path: "/pages",
            title: "Store page",
            deprecated: false,
          },
          paramGroups: [],
          requests: [
            bodyContract({
              schema: { $ref: "#/components/schemas/StorePageData" },
            }),
          ],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={{
          schemas: {
            StorePageData: {
              type: "object",
              required: ["title", "blocks"],
              properties: {
                title: { type: "string", example: "Landing" },
                blocks: {
                  type: "array",
                  items: {
                    oneOf: [
                      { $ref: "#/components/schemas/TextBlockData" },
                      { $ref: "#/components/schemas/ImageBlockData" },
                    ],
                    discriminator: {
                      propertyName: "type",
                      mapping: {
                        text: "#/components/schemas/TextBlockData",
                        image: "#/components/schemas/ImageBlockData",
                      },
                    },
                  },
                },
              },
            },
            TextBlockData: {
              type: "object",
              required: ["text", "type"],
              properties: {
                type: { type: "string", enum: ["text"] },
                text: { type: "string", example: "Welcome" },
              },
            },
            ImageBlockData: {
              type: "object",
              required: ["url", "type"],
              properties: {
                type: { type: "string", enum: ["image"] },
                url: {
                  type: "string",
                  format: "uri",
                  example: "https://example.test/hero.png",
                },
                caption: { type: ["string", "null"] },
              },
            },
          },
        }}
      />,
    );

    const variant = screen.getByLabelText("blocks[0] variant");

    await expect.element(variant).toHaveValue("text");
    await expect.element(screen.getByLabelText("blocks[0].text")).toHaveValue("Welcome");
    await variant.selectOptions("image");
    await expect.element(screen.getByLabelText("blocks[0].text")).not.toBeInTheDocument();
    await expect
      .element(screen.getByLabelText("blocks[0].url"))
      .toHaveValue("https://example.test/hero.png");
    await screen.getByLabelText("blocks[0].url").fill("https://example.test/banner.png");
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      title: "Landing",
      blocks: [{ type: "image", url: "https://example.test/banner.png" }],
    });
  });

  it("keeps raw JSON editing for schemas without a finite field shape", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [],
          requests: [
            bodyContract({
              schema: {
                type: "object",
                additionalProperties: true,
              },
            }),
          ],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    await expect.element(screen.getByLabelText("JSON body")).toBeVisible();
  });

  it("edits nullable enum properties as optional selects", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [],
          requests: [
            bodyContract({
              schema: {
                type: "object",
                required: ["name", "salutation"],
                properties: {
                  name: { type: "string", example: "Ada" },
                  accountType: { $ref: "#/components/schemas/AccountType" },
                  salutation: {
                    anyOf: [{ $ref: "#/components/schemas/Salutation" }, { type: "null" }],
                  },
                },
              },
            }),
          ],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={{
          schemas: {
            AccountType: { type: "string", enum: ["person", "company"] },
            Salutation: { type: "string", enum: ["mr", "ms"] },
          },
        }}
      />,
    );

    await screen.getByLabelText("accountType").selectOptions("company");
    await screen.getByLabelText("salutation").selectOptions("ms");
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      name: "Ada",
      accountType: "company",
      salutation: "ms",
    });
    fetchMock.mockClear();

    await screen.getByLabelText("salutation").selectOptions("Not set");
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).not.toHaveProperty("salutation");
  });

  it("degrades only the unrepresentable property to raw JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [],
          requests: [
            bodyContract({
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Desk" },
                  metadata: { oneOf: [{ type: "string" }, { type: "integer" }] },
                },
              },
            }),
          ],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    const metadata = screen.getByLabelText("metadata");

    await screen.getByLabelText("name").fill("Lamp");
    await metadata.fill("{ nope");

    await expect.element(screen.getByText("Enter valid JSON.")).toBeVisible();
    await expect.element(metadata).toHaveValue("{ nope");

    await metadata.fill('{"weight":3}');
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      name: "Lamp",
      metadata: { weight: 3 },
    });
  });

  it("keeps raw JSON editing when the body schema is not an object", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [],
          requests: [bodyContract({ schema: { type: "array", items: { type: "string" } } })],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    await screen.getByLabelText("JSON body").fill('["office","sale"]');
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual(["office", "sale"]);
  });

  it("builds Laravel Query Builder filters, sorts, includes, and fields", async () => {
    const filter = parameter({ name: "filter[name]", location: "query" });
    const sort = parameter({
      name: "sort",
      location: "query",
      style: "form",
      explode: false,
      schema: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "name",
            "-name",
            "created_at",
            "-created_at",
            "email",
            "-email",
            "id",
            "-id",
            "status",
            "-status",
          ],
        },
      },
    });
    const include = parameter({
      name: "include",
      location: "query",
      style: "form",
      explode: false,
      schema: { type: "array", items: { type: "string", enum: ["roles", "rolesCount"] } },
    });
    const fields = parameter({
      name: "fields[users]",
      location: "query",
      style: "form",
      explode: false,
      schema: { type: "array", items: { type: "string", enum: ["id", "name", "email"] } },
    });
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          summary: {
            id: "list-users",
            method: "GET",
            path: "/users",
            title: "List users",
            deprecated: false,
          },
          paramGroups: [{ location: "query", params: [filter, sort, include, fields] }],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    const filterField = screen.getByLabelText("filter[name]");
    const sortField = screen.getByRole("button", { name: "sort" });
    const includeField = screen.getByRole("button", { name: "include" });
    const fieldsField = screen.getByRole("button", { name: "fields[users]" });
    const snippet = screen.getByLabelText("Request snippet", { exact: true });

    await filterField.fill("Taylor");
    await sortField.click();
    await expect.element(screen.getByLabelText("Search options")).toBeVisible();
    const sortOption = screen.getByRole("option", { name: "-created_at" });
    await sortOption.click();
    await userEvent.keyboard("{Escape}");
    await includeField.click();
    await expect.element(screen.getByLabelText("Search options")).not.toBeInTheDocument();
    await screen.getByRole("option", { name: "roles", exact: true }).click();
    const rolesCountOption = screen.getByRole("option", { name: "rolesCount" });
    await rolesCountOption.click();
    await userEvent.keyboard("{Escape}");
    await fieldsField.click();
    await screen.getByRole("option", { name: "id" }).click();
    const emailOption = screen.getByRole("option", { name: "email" });
    await emailOption.click();
    await userEvent.keyboard("{Escape}");

    await expect.element(sortField).toMatchTextContent("-created_at");
    await expect.element(includeField).toMatchTextContent("roles, rolesCount");
    await expect.element(fieldsField).toMatchTextContent("id, email");
    await expect
      .element(snippet)
      .toMatchTextContent(
        "https://api.example.test/users?filter%5Bname%5D=Taylor&sort=-created_at&include=roles%2CrolesCount&fields%5Busers%5D=id%2Cemail",
      );
  });

  it("edits Spectacular typed, multi-enum, operator, and between filters", async () => {
    await page.viewport(390, 800);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const status = parameter({
      name: "filter[status]",
      location: "query",
      style: "form",
      explode: false,
      schema: { type: "array", items: { type: "integer", enum: [1, 2, 3] } },
    });
    const email = parameter({
      name: "filter[email]",
      location: "query",
      style: "form",
      explode: false,
      schema: { type: "array", items: { type: "string", format: "email" } },
    });
    const operator = parameter({
      name: "filter[created_at]",
      location: "query",
      description: "Prefix the value with a comparison operator.",
      filterType: "operator",
      schema: { type: "string", "x-value-format": "date-time" },
    });
    const between = parameter({
      name: "filter[published_on.between]",
      location: "query",
      style: "form",
      explode: false,
      filterType: "between",
      schema: {
        type: "array",
        items: { type: "string", format: "date" },
        minItems: 2,
        maxItems: 2,
      },
    });
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          summary: {
            id: "list-users",
            method: "GET",
            path: "/users",
            title: "List users",
            deprecated: false,
          },
          paramGroups: [{ location: "query", params: [status, email, operator, between] }],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    const statuses = screen.getByRole("button", { name: "filter[status]" });
    await statuses.click();
    await screen.getByRole("option", { name: "1" }).click();
    await screen.getByRole("option", { name: "3" }).click();
    await userEvent.keyboard("{Escape}");
    await screen.getByLabelText("filter[email]").fill("ada@example.test, linus@example.test");
    await screen.getByLabelText("filter[created_at]").fill(">=2026-08-01T00:00:00Z");
    await expect.element(screen.getByText("Value format: date-time.")).toBeVisible();
    const start = screen.getByLabelText("filter[published_on.between] start");
    const end = screen.getByLabelText("filter[published_on.between] end");
    await expect.element(start).toHaveAttribute("type", "date");
    await expect.element(end).toHaveAttribute("type", "date");
    await start.fill("2026-08-01");
    await end.fill("2026-08-31");
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    const playground = screen.getByRole("complementary", { name: "Request" }).element()
      .parentElement as HTMLElement;
    expect(playground.scrollWidth).toBeLessThanOrEqual(playground.clientWidth + 1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.example.test/users?filter%5Bstatus%5D=1%2C3&filter%5Bemail%5D=ada%40example.test%2Clinus%40example.test&filter%5Bcreated_at%5D=%3E%3D2026-08-01T00%3A00%3A00Z&filter%5Bpublished_on.between%5D=2026-08-01%2C2026-08-31",
    );
    await page.viewport(1280, 800);
  });

  it("groups filters, sorts, and includes before pagination", async () => {
    const filter = parameter({ name: "filter[name]", location: "query" });
    const sort = parameter({ name: "sort", location: "query" });
    const include = parameter({ name: "include", location: "query" });
    const search = parameter({ name: "search", location: "query" });
    const page = parameter({ name: "page", location: "query" });
    const perPage = parameter({ name: "per_page", location: "query" });
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [
            { location: "query", params: [filter, sort, include, search, page, perPage] },
          ],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    const fieldsets = Array.from(
      screen
        .getByRole("heading", { name: "Parameters", exact: true })
        .element()
        .parentElement?.querySelectorAll("fieldset") ?? [],
    );

    expect(
      fieldsets.map((fieldset) => fieldset.querySelector("legend")?.textContent?.trim()),
    ).toEqual(["Filter", "Sort", "Include", "Pagination"]);
    expect(
      screen
        .getByRole("group", { name: "Filter" })
        .element()
        .querySelector("[data-field-key]")
        ?.getAttribute("data-field-key"),
    ).toBe("query:filter[name]");
    await expect.element(screen.getByLabelText("search")).toBeVisible();
  });

  it("groups pagination controls and shows only the active mode fields", async () => {
    const page = parameter({
      name: "page",
      description: "The page number to retrieve.",
      schema: { type: "integer", minimum: 1 },
    });
    const cursor = parameter({ name: "cursor" });
    const perPage = parameter({
      name: "per_page",
      description:
        "The number of items to retrieve per page. Use a smaller page size when requesting expensive relationships.",
      schema: { type: "integer", minimum: 1, maximum: 100 },
    });
    const mode = parameter({
      name: "x-pagination",
      location: "header",
      schema: {
        type: "string",
        enum: ["default", "simple", "cursor"],
        default: "default",
      },
    });
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          summary: {
            id: "list-users",
            method: "GET",
            path: "/users",
            title: "List users",
            deprecated: false,
          },
          paramGroups: [
            { location: "query", params: [page, cursor, perPage] },
            { location: "header", params: [mode] },
          ],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    const pagination = screen.getByRole("group", { name: "Pagination" });
    const paginationMode = screen.getByLabelText("x-pagination");
    const snippet = screen.getByLabelText("Request snippet", { exact: true });
    const fieldKeys = () =>
      Array.from(pagination.element().querySelectorAll<HTMLElement>("[data-field-key]")).map(
        (field) => field.dataset.fieldKey,
      );

    await screen.getByLabelText("page", { exact: true }).fill("3");
    await screen.getByLabelText("per_page").fill("25");
    await expect.element(snippet).toMatchTextContent("/users?page=3&per_page=25");

    await paginationMode.selectOptions("cursor");

    expect(fieldKeys()).toEqual(["header:x-pagination", "query:cursor", "query:per_page"]);
    await expect.element(screen.getByLabelText("page", { exact: true })).not.toBeInTheDocument();
    await screen.getByLabelText("cursor").fill("next-page");
    await expect.element(snippet).toMatchTextContent("/users?cursor=next-page&per_page=25");
    await expect.element(snippet).not.toMatchTextContent("page=3");
  });

  it.each(["page", "cursor"])("groups %s pagination without a mode selector", async (name) => {
    const active = parameter({ name });
    const perPage = parameter({ name: "per_page", schema: { type: "integer", minimum: 1 } });
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [{ location: "query", params: [active, perPage] }],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    const pagination = screen.getByRole("group", { name: "Pagination" });
    const fieldKeys = Array.from(
      pagination.element().querySelectorAll<HTMLElement>("[data-field-key]"),
    ).map((field) => field.dataset.fieldKey);

    expect(fieldKeys).toEqual([`query:${name}`, "query:per_page"]);
    await expect.element(screen.getByLabelText("x-pagination")).not.toBeInTheDocument();
  });

  it("shows stable required errors without fetching and focuses the first invalid field", async () => {
    const id = parameter({ name: "id", location: "path", required: true });
    const trace = parameter({
      name: "X-Trace",
      location: "header",
      required: true,
      schema: { type: "boolean" },
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [
            { location: "path", params: [id] },
            { location: "header", params: [trace] },
          ],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    await screen.getByRole("button", { name: "Execute" }).click();

    const idField = screen.getByLabelText("id");
    const traceField = screen.getByLabelText("X-Trace");

    await expect.element(screen.getByText("This path parameter is required.")).toBeVisible();
    await expect.element(screen.getByText("This header parameter is required.")).toBeVisible();
    await expect.element(idField).toHaveAttribute("aria-describedby");
    await expect.element(traceField).toHaveAttribute("aria-describedby");
    await expect.element(idField).toHaveAttribute("aria-labelledby");
    await expect.element(traceField).toHaveAttribute("aria-labelledby");
    await expect.element(idField).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps schema formats and constraints to native inputs", async () => {
    const email = parameter({
      name: "email",
      required: true,
      schema: {
        type: "string",
        format: "email",
        minLength: 5,
        maxLength: 64,
        pattern: "^[^@]+@[^@]+$",
      },
    });
    const rating = parameter({
      name: "rating",
      schema: { type: "number", minimum: 1, maximum: 10, multipleOf: 0.5 },
    });
    const birthday = parameter({ name: "birthday", schema: { type: "string", format: "date" } });
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [{ location: "query", params: [email, rating, birthday] }],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    await expect.element(screen.getByLabelText("email")).toHaveAttribute("type", "email");
    await expect.element(screen.getByLabelText("email")).toHaveAttribute("minlength", "5");
    await expect.element(screen.getByLabelText("email")).toHaveAttribute("maxlength", "64");
    await expect
      .element(screen.getByLabelText("email"))
      .toHaveAttribute("pattern", "^[^@]+@[^@]+$");
    await expect.element(screen.getByLabelText("rating")).toHaveAttribute("type", "number");
    await expect.element(screen.getByLabelText("rating")).toHaveAttribute("min", "1");
    await expect.element(screen.getByLabelText("rating")).toHaveAttribute("max", "10");
    await expect.element(screen.getByLabelText("rating")).toHaveAttribute("step", "0.5");
    await expect.element(screen.getByLabelText("birthday")).toHaveAttribute("type", "date");
  });

  it("shows and executes the selected operation-level server instead of the root server", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const spec = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      servers: [
        { url: "https://production.example.test", description: "Production" },
        { url: "https://staging.example.test", description: "Staging" },
      ],
      security: [{ oauth2: [] }],
      paths: {
        "/widgets": {
          get: {
            servers: [
              { url: "https://canary.operation.example", description: "Canary operation" },
              { url: "https://sandbox.operation.example", description: "Sandbox operation" },
            ],
            responses: { "200": { description: "OK" } },
          },
        },
      },
      components: {
        securitySchemes: {
          oauth2: {
            type: "oauth2",
            flows: {
              authorizationCode: {
                authorizationUrl: "https://auth.example.test/oauth/authorize",
                tokenUrl: "https://auth.example.test/oauth/token",
                scopes: {},
              },
            },
          },
        },
      },
    };
    const screen = await render(
      <ApiReference spec={spec} defaultOperation="get-widgets" hideHeader token={REAL_TOKEN} />,
    );
    const serverPicker = screen.getByLabelText("Select server");
    const snippet = screen.getByLabelText("Request snippet", { exact: true });

    await expect.element(serverPicker).toHaveValue("https://canary.operation.example");
    await expect.element(snippet).toMatchTextContent("https://canary.operation.example/widgets");
    await serverPicker.selectOptions("https://sandbox.operation.example");
    await expect.element(snippet).toMatchTextContent("https://sandbox.operation.example/widgets");
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://sandbox.operation.example/widgets");
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("Authorization")).toBe(
      `Bearer ${REAL_TOKEN}`,
    );
  });

  it("explains the required oauth2 scopes and where a token comes from", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          requests: [],
          security: [
            {
              schemes: [
                {
                  name: "oauth2",
                  scopes: ["widgets:read", "widgets:write"],
                  type: "oauth2",
                  scheme: null,
                },
              ],
            },
          ],
        })}
        baseUrl="https://api.example.test"
        token={REAL_TOKEN}
        components={{
          securitySchemes: {
            oauth2: {
              type: "oauth2",
              flows: {
                authorizationCode: {
                  authorizationUrl: "https://auth.example.test/oauth/authorize",
                  tokenUrl: "https://auth.example.test/oauth/token",
                  scopes: {
                    "widgets:read": "View widgets",
                    "widgets:write": "Create and change widgets",
                  },
                },
              },
            },
          },
        }}
      />,
    );

    await expect.element(screen.getByText("View widgets")).toBeVisible();
    await expect.element(screen.getByText("Create and change widgets")).toBeVisible();
    await expect
      .element(screen.getByText("https://auth.example.test/oauth/authorize"))
      .toBeVisible();
    await expect.element(screen.getByText("https://auth.example.test/oauth/token")).toBeVisible();
  });

  it("marks unsupported live-request authentication schemes", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          requests: [],
          security: [
            {
              schemes: [{ name: "service-key", scopes: [], type: "apiKey", scheme: null }],
            },
          ],
        })}
        baseUrl="https://api.example.test"
        token={REAL_TOKEN}
        components={{
          securitySchemes: {
            "service-key": { type: "apiKey", in: "header", name: "X-Service-Key" },
          },
        }}
      />,
    );

    await expect.element(screen.getByText("API key (header: X-Service-Key)")).toBeVisible();
    await expect
      .element(screen.getByText("This authentication scheme is not supported for live requests."))
      .toBeVisible();
    await expect
      .element(screen.getByLabelText("Request snippet", { exact: true }))
      .not.toMatchTextContent("Bearer");
  });

  it("switches response contracts with a select", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          responses: [
            bodyContract({ role: "response", status: "422", title: "Validation response" }),
            bodyContract({ role: "response", status: "200", title: "Successful response" }),
          ],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );
    const responseStatus = screen.getByRole("combobox", { name: "Response status" });

    await expect.element(responseStatus).toHaveValue("200 application/json");
    await expect.element(screen.getByText("Successful response")).toBeVisible();
    await expect.element(screen.getByText("200", { exact: true })).toBeVisible();
    await responseStatus.selectOptions("422 application/json");
    await expect.element(screen.getByText("Validation response")).toBeVisible();
    await expect.element(screen.getByText("422", { exact: true })).toBeVisible();
  });

  it("disables Execute while in flight and aborts the active request when unmounted", async () => {
    let signal = new AbortController().signal;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      signal = init?.signal ?? signal;

      return new Promise<Response>((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("The operation was aborted.", "AbortError")),
          { once: true },
        );
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation()}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );
    const execute = screen.getByRole("button", { name: "Execute" });

    await execute.click();

    await expect.element(execute).toBeDisabled();

    await screen.unmount();

    expect(signal.aborted).toBe(true);
  });

  it("opens a path parameter's tooltip as markup while keeping its description as text", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [
            {
              location: "path",
              params: [
                parameter({
                  name: "id",
                  location: "path",
                  required: true,
                  example: "42",
                  description: "The widget identifier.",
                  tooltip: '<a href="https://docs.example.test/ids">Identifier format</a>',
                }),
              ],
            },
          ],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    await expect.element(screen.getByText("The widget identifier.")).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "Identifier format" }))
      .not.toBeInTheDocument();

    await screen.getByRole("button", { name: "More information" }).click();

    const link = screen.getByRole("link", { name: "Identifier format" });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute("href", "https://docs.example.test/ids");
  });

  it("opens a grouped query parameter's tooltip as markup from its label", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [
            {
              location: "query",
              params: [
                parameter({
                  name: "filter[type]",
                  location: "query",
                  description: "Restricts the result set by type.",
                  tooltip: '<a href="https://docs.example.test/filters">Filtering guide</a>',
                }),
              ],
            },
          ],
          requests: [],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );

    await expect.element(screen.getByText("Restricts the result set by type.")).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "Filtering guide" }))
      .not.toBeInTheDocument();

    await screen.getByRole("button", { name: "More information" }).click();

    const link = screen.getByRole("link", { name: "Filtering guide" });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute("href", "https://docs.example.test/filters");
  });

  it("opens request body tooltips written plainly, beside a $ref, and on a nullable wrapper", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [],
          requests: [
            bodyContract({
              schema: {
                type: "object",
                required: ["name", "accountType"],
                properties: {
                  name: {
                    type: "string",
                    example: "Ada",
                    description: "Shown on invoices.",
                    "x-tooltip": '<a href="https://docs.example.test/names">Naming rules</a>',
                  },
                  accountType: {
                    $ref: "#/components/schemas/AccountType",
                    "x-tooltip": '<a href="https://docs.example.test/accounts">Account types</a>',
                  },
                  salutation: {
                    anyOf: [{ $ref: "#/components/schemas/Salutation" }, { type: "null" }],
                    "x-tooltip": '<a href="https://docs.example.test/salutations">Salutations</a>',
                  },
                },
              },
            }),
          ],
        })}
        baseUrl="https://api.example.test"
        token={null}
        components={{
          schemas: {
            AccountType: { type: "string", enum: ["person", "company"] },
            Salutation: { type: "string", enum: ["mr", "ms"] },
          },
        }}
      />,
    );
    const bodyFields = screen.getByLabelText("JSON body fields");
    const [plain, behindRef, nullableWrapper] = bodyFields
      .getByRole("button", { name: "More information" })
      .all();

    await expect.element(bodyFields.getByText("Shown on invoices.")).toBeVisible();

    await plain!.click();
    await expect
      .element(screen.getByRole("link", { name: "Naming rules" }))
      .toHaveAttribute("href", "https://docs.example.test/names");

    await behindRef!.click();
    await expect
      .element(screen.getByRole("link", { name: "Account types" }))
      .toHaveAttribute("href", "https://docs.example.test/accounts");

    await nullableWrapper!.click();
    await expect
      .element(screen.getByRole("link", { name: "Salutations" }))
      .toHaveAttribute("href", "https://docs.example.test/salutations");
  });
});

describe("RequestPlayground remote token access", () => {
  const FETCHED_TOKEN = "fetched-access-token";
  const TOKEN_ENDPOINT = "https://api.example.test/lattice/remote-sources/api-docs-tokens/token";

  function remoteAccess(overrides: Partial<RemoteAccess> = {}): RemoteAccess {
    return {
      source: "api-docs-tokens",
      audience: "acme",
      scopes: ["widgets:write"],
      nodeId: "api-docs",
      nodeType: "api-reference",
      tokenEndpoint: TOKEN_ENDPOINT,
      ref: "sealed-ref",
      ...overrides,
    };
  }

  function browserToken(accessToken: string): Response {
    return new Response(
      JSON.stringify({
        accessToken,
        tokenType: "Bearer",
        expiresIn: 300,
        audience: "acme",
        scopes: ["widgets:write"],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  function securedOperation(): Operation {
    return playgroundOperation({
      security: [
        { schemes: [{ name: "oauth2", scopes: ["widgets:write"], type: "oauth2", scheme: null }] },
      ],
    });
  }

  function renderRemotePlayground(remote: RemoteAccess = remoteAccess()) {
    return render(
      <RequestPlayground
        operation={securedOperation()}
        baseUrl="https://api.example.test/v1"
        token={null}
        remoteTokens={[remote]}
        components={{ securitySchemes: { oauth2: { type: "oauth2" } } }}
        twoColumnBreakpoint="xl"
      />,
    );
  }

  it("fetches a scoped token before executing and keeps it out of the snippet", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        String(input) === TOKEN_ENDPOINT
          ? browserToken(FETCHED_TOKEN)
          : new Response('{"ok":true}', { status: 200, statusText: "OK" }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const screen = await renderRemotePlayground();

    await expect
      .element(
        screen.getByText(
          "A scoped access token is fetched automatically when you execute a request. If that fails, sign in again.",
        ),
      )
      .toBeVisible();
    await expect
      .element(screen.getByLabelText("Request snippet", { exact: true }))
      .toMatchTextContent("Bearer <YOUR_TOKEN>");

    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(2);
    const [tokenCall, apiCall] = fetchMock.mock.calls;
    expect(String(tokenCall?.[0])).toBe(TOKEN_ENDPOINT);
    expect(JSON.parse(String(tokenCall?.[1]?.body))).toMatchObject({
      nodeId: "api-docs",
      nodeType: "api-reference",
      audience: "acme",
      scopes: ["widgets:write"],
    });
    expect(new Headers(apiCall?.[1]?.headers).get("Authorization")).toBe(`Bearer ${FETCHED_TOKEN}`);
    await expect.element(screen.getByText("200 OK")).toBeVisible();
    await expect.element(screen.locator).not.toMatchTextContent(FETCHED_TOKEN);
  });

  it("reuses the cached token for repeated executes", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        String(input) === TOKEN_ENDPOINT
          ? browserToken(FETCHED_TOKEN)
          : new Response('{"ok":true}', { status: 200, statusText: "OK" }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const screen = await renderRemotePlayground();
    const execute = screen.getByRole("button", { name: "Execute" });

    await execute.click();
    await expect.poll(() => fetchMock.mock.calls.length).toBe(2);
    await execute.click();
    await expect.poll(() => fetchMock.mock.calls.length).toBe(3);

    const tokenCalls = fetchMock.mock.calls.filter((call) => String(call[0]) === TOKEN_ENDPOINT);
    expect(tokenCalls).toHaveLength(1);
  });

  it("retries once with a fresh token when the API answers 401", async () => {
    const apiResponses = [
      new Response("{}", { status: 401, statusText: "Unauthorized" }),
      new Response('{"ok":true}', { status: 200, statusText: "OK" }),
    ];
    const issuedTokens = ["stale-token", "fresh-token"];
    const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        String(input) === TOKEN_ENDPOINT
          ? browserToken(issuedTokens.shift() ?? "unexpected")
          : (apiResponses.shift() ?? new Response("{}", { status: 500 })),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const screen = await renderRemotePlayground();

    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.element(screen.getByText("200 OK")).toBeVisible();
    const apiCalls = fetchMock.mock.calls.filter((call) => String(call[0]) !== TOKEN_ENDPOINT);
    expect(apiCalls).toHaveLength(2);
    expect(new Headers(apiCalls[0]?.[1]?.headers).get("Authorization")).toBe("Bearer stale-token");
    expect(new Headers(apiCalls[1]?.[1]?.headers).get("Authorization")).toBe("Bearer fresh-token");
  });

  it("surfaces the token endpoint's error message and skips the API call", async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL) =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Sign in again to use the playground." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const screen = await renderRemotePlayground();

    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.element(screen.getByText("Sign in again to use the playground.")).toBeVisible();
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes("/widgets/"))).toBe(false);
  });

  it("resolves tokens through a host callback without any backend", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{"ok":true}', { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const resolveAccessToken = vi
      .fn()
      .mockResolvedValue({ accessToken: "callback-token", expiresIn: 300 });
    const screen = await render(
      <RequestPlayground
        operation={securedOperation()}
        baseUrl="https://api.example.test/v1"
        token={REAL_TOKEN}
        resolveAccessToken={resolveAccessToken}
        components={{ securitySchemes: { oauth2: { type: "oauth2" } } }}
        twoColumnBreakpoint="xl"
      />,
    );
    const execute = screen.getByRole("button", { name: "Execute" });

    await expect
      .element(
        screen.getByText(
          "A scoped access token is fetched automatically when you execute a request. If that fails, sign in again.",
        ),
      )
      .toBeVisible();
    await expect
      .element(screen.getByLabelText("Request snippet", { exact: true }))
      .toMatchTextContent("Bearer <YOUR_TOKEN>");

    await execute.click();
    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);

    expect(resolveAccessToken).toHaveBeenCalledWith({
      scopes: ["widgets:write"],
      forceRefresh: false,
    });
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("Authorization")).toBe(
      "Bearer callback-token",
    );

    await execute.click();
    await expect.poll(() => fetchMock.mock.calls.length).toBe(2);
    expect(resolveAccessToken).toHaveBeenCalledTimes(1);
    await expect.element(screen.locator).not.toMatchTextContent("callback-token");
  });

  it("does not cache plain-string callback results", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{"ok":true}', { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const resolveAccessToken = vi.fn().mockResolvedValue("uncached-token");
    const screen = await render(
      <RequestPlayground
        operation={securedOperation()}
        baseUrl="https://api.example.test/v1"
        token={null}
        resolveAccessToken={resolveAccessToken}
        components={{ securitySchemes: { oauth2: { type: "oauth2" } } }}
        twoColumnBreakpoint="xl"
      />,
    );
    const execute = screen.getByRole("button", { name: "Execute" });

    await execute.click();
    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    await execute.click();
    await expect.poll(() => fetchMock.mock.calls.length).toBe(2);

    expect(resolveAccessToken).toHaveBeenCalledTimes(2);
  });

  it("retries once with forceRefresh when the API answers 401 in callback mode", async () => {
    const apiResponses = [
      new Response("{}", { status: 401, statusText: "Unauthorized" }),
      new Response('{"ok":true}', { status: 200, statusText: "OK" }),
    ];
    const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(apiResponses.shift() ?? new Response("{}")),
    );
    vi.stubGlobal("fetch", fetchMock);
    const resolveAccessToken = vi
      .fn()
      .mockResolvedValueOnce({ accessToken: "stale-token", expiresIn: 300 })
      .mockResolvedValueOnce({ accessToken: "fresh-token", expiresIn: 300 });
    const screen = await render(
      <RequestPlayground
        operation={securedOperation()}
        baseUrl="https://api.example.test/v1"
        token={null}
        resolveAccessToken={resolveAccessToken}
        components={{ securitySchemes: { oauth2: { type: "oauth2" } } }}
        twoColumnBreakpoint="xl"
      />,
    );

    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.element(screen.getByText("200 OK")).toBeVisible();
    expect(resolveAccessToken).toHaveBeenNthCalledWith(2, {
      scopes: ["widgets:write"],
      forceRefresh: true,
    });
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get("Authorization")).toBe(
      "Bearer fresh-token",
    );
  });

  it("surfaces a rejected callback and skips the API call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const resolveAccessToken = vi.fn().mockRejectedValue(new Error("Token service unavailable."));
    const screen = await render(
      <RequestPlayground
        operation={securedOperation()}
        baseUrl="https://api.example.test/v1"
        token={null}
        resolveAccessToken={resolveAccessToken}
        components={{ securitySchemes: { oauth2: { type: "oauth2" } } }}
        twoColumnBreakpoint="xl"
      />,
    );

    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.element(screen.getByText("Token service unavailable.")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the static token when no remote access matches the operation scopes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{"ok":true}', { status: 200, statusText: "OK" }));
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={securedOperation()}
        baseUrl="https://api.example.test/v1"
        token={REAL_TOKEN}
        remoteTokens={[remoteAccess({ scopes: ["other:scope"] })]}
        components={{ securitySchemes: { oauth2: { type: "oauth2" } } }}
        twoColumnBreakpoint="xl"
      />,
    );

    await expect.element(screen.getByText("Access token supplied by the host page.")).toBeVisible();
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("Authorization")).toBe(
      `Bearer ${REAL_TOKEN}`,
    );
  });
});
