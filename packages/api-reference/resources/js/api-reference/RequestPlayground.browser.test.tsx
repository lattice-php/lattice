import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { Node } from "@lattice-php/lattice";
import ApiReference from "./ApiReference";
import { RequestPlayground } from "./RequestPlayground";
import type { Contract, Operation, Param } from "./types";

const REAL_TOKEN = "real-secret-token";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function parameter(overrides: Partial<Param>): Param {
  return {
    name: "value",
    location: "query",
    required: false,
    deprecated: false,
    description: null,
    schema: { type: "string" },
    example: null,
    ...overrides,
  };
}

function requestContract(overrides: Partial<Contract> = {}): Contract {
  return {
    role: "request",
    status: null,
    mediaType: "application/json",
    schema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", example: "Desk" },
      },
    },
    title: null,
    examples: [],
    headers: [],
    required: true,
    ...overrides,
  };
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
    tags: [],
    paramGroups: [
      { location: "path", params: [id] },
      { location: "query", params: [status] },
      { location: "header", params: [debug] },
    ],
    requests: [requestContract()],
    responses: [],
    security: [],
    ...overrides,
    serverUrl: overrides.serverUrl ?? "https://api.example.test",
    servers: overrides.servers ?? [{ url: "https://api.example.test", description: null }],
    usesRootServers: overrides.usesRootServers ?? true,
  };
}

function apiReferenceNode(props: Record<string, unknown>): Node<"api-reference"> {
  return { type: "api-reference", props };
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
    const referencePanel = screen.getByRole("complementary", { name: "Reference" });
    const execute = requestPanel.getByRole("button", { name: "Execute" });
    const markdownCopy = requestPanel.getByRole("button", { name: "Copy as Markdown" });
    const statusRow = screen.getByLabelText("status").element().closest("li");
    const statusType = statusRow?.querySelectorAll("span")[1];

    await expect.element(id).toHaveValue("42");
    await expect.element(requestPanel.getByText("Try it out")).not.toBeInTheDocument();
    expect(requestPanel.element().querySelector('[data-slot="card"]')).toBeNull();
    expect(execute.element().parentElement).toBe(markdownCopy.element().parentElement);
    expect(requestPanel.element().parentElement?.classList).toContain(
      "xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
    );
    expect(referencePanel.element().classList).toContain("xl:border-l");
    expect(statusRow?.classList).toContain("sm:grid-cols-[minmax(0,3fr)_minmax(12rem,2fr)]");
    expect(statusType?.classList).toContain("px-2");
    expect(statusType?.classList).toContain("py-1");
    await expect.element(markdownCopy).toHaveClass("ml-auto");
    await expect.element(screen.getByLabelText("status")).toBeVisible();
    await expect.element(screen.getByLabelText("X-Debug")).toBeVisible();
    await expect.element(bodyName).toHaveValue("Desk");
    await expect
      .element(screen.getByRole("radio", { name: "cURL" }))
      .toHaveAttribute("aria-checked", "true");
    await expect.element(snippet).toHaveAttribute("data-slot", "code-block");
    await expect
      .poll(() => document.querySelector(".cm-content")?.getAttribute("contenteditable"))
      .toBe("false");
    await expect.poll(() => snippet.element().querySelector(".cm-lineNumbers")).not.toBeNull();
    await expect.element(snippet).toHaveTextContent("Bearer <YOUR_TOKEN>");
    await expect.element(snippet).not.toHaveTextContent(REAL_TOKEN);
    await expect.element(screen.getByText("Access token supplied by the host page.")).toBeVisible();

    await id.fill("a/b");
    await screen.getByLabelText("status").selectOptions("archived");
    await bodyName.fill("Lamp");
    await screen.getByRole("radio", { name: "JavaScript" }).click();

    await expect
      .element(snippet)
      .toHaveTextContent('fetch("https://api.example.test/v1/widgets/a%2Fb?status=archived"');
    await expect.element(snippet).toHaveTextContent('\\"name\\": \\"Lamp\\"');
    await expect.element(snippet).toHaveTextContent("Bearer <YOUR_TOKEN>");
    await expect.element(snippet).not.toHaveTextContent(REAL_TOKEN);

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
    await expect.element(responseBody).toHaveTextContent('"ok": true');
    await expect.element(screen.locator).not.toHaveTextContent(REAL_TOKEN);
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
            requestContract({
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

  it("keeps raw JSON editing for schemas without a finite field shape", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          paramGroups: [],
          requests: [
            requestContract({
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
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await includeField.click();
    await expect.element(screen.getByLabelText("Search options")).not.toBeInTheDocument();
    await screen.getByRole("option", { name: "roles", exact: true }).click();
    const rolesCountOption = screen.getByRole("option", { name: "rolesCount" });
    await rolesCountOption.click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await fieldsField.click();
    await screen.getByRole("option", { name: "id" }).click();
    const emailOption = screen.getByRole("option", { name: "email" });
    await emailOption.click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    await expect.element(sortField).toHaveTextContent("-created_at");
    await expect.element(includeField).toHaveTextContent("roles, rolesCount");
    await expect.element(fieldsField).toHaveTextContent("id, email");
    await expect
      .element(snippet)
      .toHaveTextContent(
        "https://api.example.test/users?filter%5Bname%5D=Taylor&sort=-created_at&include=roles%2CrolesCount&fields%5Busers%5D=id%2Cemail",
      );
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

    expect(pagination.element().classList).toContain("p-3");
    expect(paginationMode.element().parentElement?.parentElement?.classList).toContain("flex-wrap");
    await expect.element(paginationMode).toHaveValue("default");
    expect(fieldKeys()).toEqual(["header:x-pagination", "query:page", "query:per_page"]);
    expect(
      screen.getByLabelText("page", { exact: true }).element().getBoundingClientRect().top,
    ).toBe(screen.getByLabelText("per_page").element().getBoundingClientRect().top);

    await screen.getByLabelText("page", { exact: true }).fill("3");
    await screen.getByLabelText("per_page").fill("25");
    await expect.element(snippet).toHaveTextContent("/users?page=3&per_page=25");

    await paginationMode.selectOptions("cursor");

    expect(fieldKeys()).toEqual(["header:x-pagination", "query:cursor", "query:per_page"]);
    await expect.element(screen.getByLabelText("page", { exact: true })).not.toBeInTheDocument();
    await screen.getByLabelText("cursor").fill("next-page");
    await expect.element(snippet).toHaveTextContent("/users?cursor=next-page&per_page=25");
    await expect.element(snippet).not.toHaveTextContent("page=3");
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
      <ApiReference
        node={apiReferenceNode({
          spec,
          defaultOperation: "get-widgets",
          hideHeader: true,
          token: REAL_TOKEN,
        })}
      >
        {null}
      </ApiReference>,
    );
    const serverPicker = screen.getByLabelText("Select server");
    const snippet = screen.getByLabelText("Request snippet", { exact: true });

    await expect.element(serverPicker).toHaveValue("https://canary.operation.example");
    await expect.element(snippet).toHaveTextContent("https://canary.operation.example/widgets");
    await serverPicker.selectOptions("https://sandbox.operation.example");
    await expect.element(snippet).toHaveTextContent("https://sandbox.operation.example/widgets");
    await screen.getByRole("button", { name: "Execute" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://sandbox.operation.example/widgets");
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("Authorization")).toBe(
      `Bearer ${REAL_TOKEN}`,
    );
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
      .not.toHaveTextContent("Bearer");
  });

  it("switches response contracts with a select", async () => {
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation({
          responses: [
            requestContract({ role: "response", status: "422", title: "Validation response" }),
            requestContract({ role: "response", status: "200", title: "Successful response" }),
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
    await expect.element(screen.getByText("200", { exact: true })).toHaveClass("lt-tone-success");
    await responseStatus.selectOptions("422 application/json");
    await expect.element(screen.getByText("Validation response")).toBeVisible();
    await expect.element(screen.getByText("422", { exact: true })).toHaveClass("lt-tone-warning");
  });

  it("aborts the active request before starting another", async () => {
    let firstSignal = new AbortController().signal;
    const fetchMock = vi.fn();
    fetchMock.mockImplementationOnce((_input: RequestInfo | URL, init?: RequestInit) => {
      firstSignal = init?.signal ?? firstSignal;

      return new Promise<Response>((_resolve, reject) => {
        firstSignal.addEventListener(
          "abort",
          () => reject(new DOMException("The operation was aborted.", "AbortError")),
          { once: true },
        );
      });
    });
    fetchMock.mockResolvedValueOnce(
      new Response("second response", { status: 200, statusText: "OK" }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const screen = await render(
      <RequestPlayground
        operation={playgroundOperation()}
        baseUrl="https://api.example.test"
        token={null}
        components={null}
      />,
    );
    const executeButton = screen.getByRole("button", { name: "Execute" });

    await executeButton.click();
    const button = (await executeButton.element()) as HTMLButtonElement;

    if (button.form === null) {
      throw new Error("Expected the execute button to submit the playground form.");
    }

    button.disabled = false;
    await executeButton.click();

    await expect.poll(() => fetchMock.mock.calls.length).toBe(2);
    expect(firstSignal.aborted).toBe(true);
    await expect.element(screen.getByText("200 OK")).toBeVisible();
    await expect
      .element(screen.getByRole("region", { name: "Live response body" }))
      .toHaveTextContent("second response");
  });

  it("aborts the active request when unmounted", async () => {
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

    await screen.getByRole("button", { name: "Execute" }).click();
    await screen.unmount();

    expect(signal.aborted).toBe(true);
  });
});
