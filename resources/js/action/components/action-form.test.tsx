import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry, Renderer } from "@lattice-php/lattice";
import type { Node } from "@lattice-php/lattice";
import { formComponents } from "@lattice-php/lattice/form";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { actionComponents } from "@lattice-php/lattice/action/plugin";
import { ActionForm } from "./action-form";

vi.mock("@inertiajs/react", () => ({
  router: { reload: vi.fn<() => void>(), visit: vi.fn<() => void>() },
  useHttp: () => ({
    delete: vi.fn<() => void>(),
    get: vi.fn<() => void>(),
    patch: vi.fn<() => void>(),
    post: vi.fn<() => void>(),
    processing: false,
    put: vi.fn<() => void>(),
  }),
  Form: ({ children }: { children: ReactNode }) => <form>{children}</form>,
  Link: ({ children, ...props }: { children: ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

type FetchMock = (input: string, init: RequestInit) => Promise<Response>;

function rejectAction(precognitive = false): Node {
  return fakeNode({
    id: "test.reject",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Submit", title: "Reject item?" },
      endpoint: "/lattice/actions/test.reject",
      form: {
        id: "test.reject-form",
        props: { precognitive },
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

function lazyAction(method = "post"): Node {
  return fakeNode({
    id: "test.edit",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Submit", title: "Edit item?" },
      endpoint: "/lattice/actions/test.edit",
      form: null,
      label: "Edit",
      lazyForm: true,
      method,
      ref: "sealed-ref",
    },
  });
}

function editProductActionWithExistingImage(): Node {
  return fakeNode({
    id: "test.edit-product",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Save", title: "Edit product" },
      endpoint: "/lattice/actions/test.edit-product",
      form: {
        id: "test.edit-product-form",
        props: {
          state: {
            images: ["workbench/products/lamp.jpg"],
            name: "Desk Lamp",
          },
        },
        schema: [
          { key: "name", props: { label: "Name", name: "name" }, type: "field.text-input" },
          {
            key: "images",
            props: {
              files: [
                {
                  key: "workbench/products/lamp.jpg",
                  name: "lamp.jpg",
                  size: 10,
                  token: "sealed-lamp",
                  url: "https://rustfs.test/lamp.jpg?signature=1",
                },
              ],
              image: true,
              label: "Images",
              multiple: true,
              name: "images",
              signed: true,
            },
            type: "field.file-upload",
          },
        ],
        type: "form",
      },
      label: "Edit",
      method: "patch",
      ref: "sealed-ref",
    },
  });
}

function renderAction(node: Node) {
  return renderWithRegistry(
    <Renderer nodes={[node]} />,
    createRegistry(actionComponents, formComponents),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("action form modal", () => {
  it("collects the form values and posts them to the action endpoint", async () => {
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => ({ effects: [], ok: true }),
      ok: true,
      status: 200,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(rejectAction());

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    fireEvent.change(await screen.findByRole("textbox", { name: "Reason" }), {
      target: { value: "spam" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    expect(url).toBe("/lattice/actions/test.reject");
    expect(JSON.parse(init.body as string)).toMatchObject({ reason: "spam" });
    expect((init.headers as Record<string, string>)["X-Lattice-Ref"]).toBe("sealed-ref");

    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Reason" })).not.toBeInTheDocument(),
    );
  });

  it("closes the modal when dismissed", async () => {
    renderAction(rejectAction());

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    await screen.findByRole("textbox", { name: "Reason" });

    fireEvent.keyDown(document.body, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Reason" })).not.toBeInTheDocument(),
    );
  });

  it("shows server validation errors returned on submit", async () => {
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => ({ errors: { reason: ["The Reason field is required."] } }),
      ok: false,
      status: 422,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(rejectAction());

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    fireEvent.click(await screen.findByRole("button", { name: "Submit" }));

    expect(await screen.findByText("The Reason field is required.")).toBeVisible();
  });

  it("lazily fetches the schema when the action declares a lazy form", async () => {
    const formNode = {
      id: "test.edit-form",
      props: {},
      schema: [
        { key: "title", props: { label: "Title", name: "title" }, type: "field.text-input" },
      ],
      type: "form",
    };
    const fetchMock = vi.fn<FetchMock>().mockImplementation((_url, init) => {
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      const payload = body._form ? formNode : { effects: [], ok: true };

      return Promise.resolve({
        json: async () => payload,
        ok: true,
        status: 200,
      } as unknown as Response);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderAction(lazyAction());

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(await screen.findByRole("textbox", { name: "Title" })).toBeVisible();
    const [, init] = fetchMock.mock.calls.find(
      ([, requestInit]) =>
        (JSON.parse(String((requestInit as RequestInit).body)) as { _form?: boolean })._form,
    ) as [string, RequestInit];

    expect(init.method).toBe("POST");
  });

  it("posts lazy schema requests even when the action submits with another method", async () => {
    const formNode = {
      id: "test.edit-form",
      props: {},
      schema: [
        { key: "title", props: { label: "Title", name: "title" }, type: "field.text-input" },
      ],
      type: "form",
    };
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => formNode,
      ok: true,
      status: 200,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(lazyAction("patch"));

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await screen.findByRole("textbox", { name: "Title" });

    const [, init] = fetchMock.mock.calls.at(0) as [string, RequestInit];
    expect(init.method).toBe("POST");
  });

  it("submits removed file tokens without stale existing file values", async () => {
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => ({ effects: [], ok: true }),
      ok: true,
      status: 200,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(editProductActionWithExistingImage());

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(await screen.findByRole("button", { name: "Remove lamp.jpg" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({
      images: [],
      images__removed: ["sealed-lamp"],
      name: "Desk Lamp",
    });
  });

  it("validates precognitively as the user types", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValue({ json: async () => ({}), ok: true, status: 204 } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(rejectAction(true));

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Reason" }), { target: { value: "x" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Precognition).toBe("true");
    expect(headers["Precognition-Validate-Only"]).toBe("reason");
  });
});

describe("ActionForm", () => {
  it("renders the form dialog as a sheet when configured", () => {
    render(
      <ActionForm
        cancelLabel="Cancel"
        componentRef="ref"
        endpoint="/lattice/actions/demo"
        formNode={null}
        method="post"
        onClose={() => {}}
        onSuccess={() => {}}
        placement="end"
        submitLabel="Save"
        title="Demo"
        width="2xl"
      />,
    );

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toHaveClass("end-0", "max-w-2xl");
  });

  it("defaults to the centered dialog", () => {
    render(
      <ActionForm
        cancelLabel="Cancel"
        componentRef="ref"
        endpoint="/lattice/actions/demo"
        formNode={null}
        method="post"
        onClose={() => {}}
        onSuccess={() => {}}
        submitLabel="Save"
        title="Demo"
      />,
    );

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toHaveClass("left-1/2", "max-w-lg");
  });
});
