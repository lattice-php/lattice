import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry, Renderer } from "@lattice-php/lattice";
import type { Node } from "@lattice-php/lattice";
import { formComponents } from "@lattice-php/lattice/form";
import { actionComponents } from "../index";

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
  return {
    id: "test.reject",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Submit", title: "Reject item?" },
      endpoint: "/lattice/actions/test.reject",
      form: {
        id: "test.reject-form",
        props: { precognitive },
        schema: [
          { key: "reason", props: { label: "Reason", name: "reason" }, type: "form.text-input" },
        ],
        type: "form",
      },
      label: "Reject",
      method: "post",
      ref: "sealed-ref",
    },
  } as unknown as Node;
}

function lazyAction(): Node {
  return {
    id: "test.edit",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Submit", title: "Edit item?" },
      endpoint: "/lattice/actions/test.edit",
      form: null,
      label: "Edit",
      lazyForm: true,
      method: "post",
      ref: "sealed-ref",
    },
  } as unknown as Node;
}

function renderAction(node: Node) {
  return render(
    <Renderer
      nodes={[node]}
      registry={createRegistry(actionComponents, formComponents).components}
    />,
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
      schema: [{ key: "title", props: { label: "Title", name: "title" }, type: "form.text-input" }],
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
    expect(
      fetchMock.mock.calls.some(
        ([, init]) => (JSON.parse(String((init as RequestInit).body)) as { _form?: boolean })._form,
      ),
    ).toBe(true);
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
