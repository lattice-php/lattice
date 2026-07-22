import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlugin, createRegistry, eagerComponent, Renderer } from "@lattice-php/lattice";
import type { Node, Plugin } from "@lattice-php/lattice";
import { formComponents } from "@lattice-php/lattice/form";
import { useFormContext } from "@lattice-php/lattice/form/toolkit";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { actionComponents } from "@lattice-php/lattice/action/plugin";
import { ActionForm } from "./action-form";

type ValidateFieldsOptions = { onSuccess?: () => void; onValidationError?: () => void };

let capturedValidateFields: ((fields: string[], options?: ValidateFieldsOptions) => void) | null =
  null;
let capturedValidating = false;

function ValidateFieldsProbe() {
  ({ validateFields: capturedValidateFields, validating: capturedValidating } = useFormContext());

  return null;
}

const validateFieldsProbePlugin: Plugin = createPlugin({
  components: {
    "test.validate-fields-probe": eagerComponent(ValidateFieldsProbe),
  },
  name: "test/validate-fields-probe",
});

function validateFieldsAction(): Node {
  return fakeNode({
    id: "test.validate-fields",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Save", title: "Validate fields?" },
      endpoint: "/lattice/actions/test.validate-fields",
      form: {
        id: "test.validate-fields-form",
        props: {},
        schema: [
          { key: "name", props: { label: "Name", name: "name" }, type: "field.text-input" },
          { key: "email", props: { label: "Email", name: "email" }, type: "field.text-input" },
          { key: "probe", props: {}, type: "test.validate-fields-probe" },
        ],
        type: "form",
      },
      label: "Validate",
      method: "post",
      ref: "sealed-ref",
    },
  });
}

function wizardAction(): Node {
  return fakeNode({
    id: "test.wizard",
    type: "action",
    props: {
      confirmation: { confirmLabel: "Save", title: "Checkout wizard" },
      endpoint: "/lattice/actions/test.wizard",
      form: {
        id: "test.wizard-form",
        props: { submitButton: false },
        schema: [
          {
            key: "wizard",
            props: { orientation: "horizontal" },
            schema: [
              {
                props: { label: "Customer", name: "customer" },
                schema: [
                  {
                    key: "name",
                    props: { label: "Name", name: "name" },
                    type: "field.text-input",
                  },
                ],
                type: "wizard-step",
              },
              { props: { label: "Review", name: "review" }, schema: [], type: "wizard-step" },
            ],
            type: "wizard",
          },
        ],
        type: "form",
      },
      label: "Open wizard",
      method: "post",
      ref: "sealed-ref",
    },
  });
}

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock(),
);

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

function renderAction(node: Node, ...extraPlugins: Plugin[]) {
  return renderWithRegistry(
    <Renderer nodes={[node]} />,
    createRegistry(actionComponents, formComponents, ...extraPlugins),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  capturedValidateFields = null;
  capturedValidating = false;
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

  it("dispatches effects and keeps the modal open on a domain rejection (422 without errors)", async () => {
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => ({
        effects: [{ props: { message: "Rejected." }, type: "toast" }],
      }),
      ok: false,
      status: 422,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const toastListener = vi.fn<(event: Event) => void>();

    window.addEventListener("lattice:toast", toastListener);

    const { container } = renderAction(rejectAction());

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    fireEvent.change(await screen.findByRole("textbox", { name: "Reason" }), {
      target: { value: "spam" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(toastListener).toHaveBeenCalledTimes(1);
    });

    const [[toastEvent]] = toastListener.mock.calls as [[CustomEvent]];

    expect(toastEvent.detail).toEqual({ message: "Rejected." });
    expect(screen.getByRole("textbox", { name: "Reason" })).toBeVisible();
    expect(container.querySelector("p.text-lt-danger")).toBeNull();

    window.removeEventListener("lattice:toast", toastListener);
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

  it("validates multiple fields on demand and reports success", async () => {
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => ({}),
      ok: true,
      status: 204,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(validateFieldsAction(), validateFieldsProbePlugin);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("textbox", { name: "Name" });

    expect(capturedValidateFields).not.toBeNull();

    const onSuccess = vi.fn();
    const onValidationError = vi.fn();

    capturedValidateFields?.(["name", "name.*"], { onSuccess, onValidationError });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(onValidationError).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Precognition).toBe("true");
    expect(headers["Precognition-Validate-Only"]).toBe("name,name.*");
  });

  it("sets the field error and reports a validation failure on a 422", async () => {
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => ({ errors: { name: ["Required"] } }),
      ok: false,
      status: 422,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(validateFieldsAction(), validateFieldsProbePlugin);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("textbox", { name: "Name" });

    const onSuccess = vi.fn();
    const onValidationError = vi.fn();

    capturedValidateFields?.(["name", "name.*"], { onSuccess, onValidationError });

    expect(await screen.findByText("Required")).toBeVisible();
    expect(onValidationError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("clears a previously set field error once a later validation call succeeds", async () => {
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce({
        json: async () => ({ errors: { name: ["Required"] } }),
        ok: false,
        status: 422,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => ({}),
        ok: true,
        status: 204,
      } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(validateFieldsAction(), validateFieldsProbePlugin);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("textbox", { name: "Name" });

    capturedValidateFields?.(["name"]);
    expect(await screen.findByText("Required")).toBeVisible();

    capturedValidateFields?.(["name"]);
    await waitFor(() => expect(screen.queryByText("Required")).not.toBeInTheDocument());
  });

  it("reports a validation failure on a non-422 error response without clearing errors", async () => {
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce({
        json: async () => ({ errors: { name: ["Required"] } }),
        ok: false,
        status: 422,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => ({}),
        ok: false,
        status: 500,
      } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(validateFieldsAction(), validateFieldsProbePlugin);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("textbox", { name: "Name" });

    capturedValidateFields?.(["name"]);
    expect(await screen.findByText("Required")).toBeVisible();

    const onSuccess = vi.fn();
    const onValidationError = vi.fn();

    capturedValidateFields?.(["name"], { onSuccess, onValidationError });

    await waitFor(() => expect(onValidationError).toHaveBeenCalledTimes(1));

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByText("Required")).toBeVisible();
  });

  it("reports a validation failure when the request itself rejects", async () => {
    const fetchMock = vi.fn<FetchMock>().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    renderAction(validateFieldsAction(), validateFieldsProbePlugin);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("textbox", { name: "Name" });

    const onSuccess = vi.fn();
    const onValidationError = vi.fn();

    capturedValidateFields?.(["name"], { onSuccess, onValidationError });

    await waitFor(() => expect(onValidationError).toHaveBeenCalledTimes(1));

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("keeps an unrelated field's error through another field's 422 merge and success-clear", async () => {
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce({
        json: async () => ({ errors: { email: ["Invalid email"] } }),
        ok: false,
        status: 422,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => ({ errors: { name: ["Required"] } }),
        ok: false,
        status: 422,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => ({}),
        ok: true,
        status: 204,
      } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(validateFieldsAction(), validateFieldsProbePlugin);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("textbox", { name: "Name" });

    capturedValidateFields?.(["email"]);
    expect(await screen.findByText("Invalid email")).toBeVisible();

    capturedValidateFields?.(["name"]);
    expect(await screen.findByText("Required")).toBeVisible();
    expect(screen.getByText("Invalid email")).toBeVisible();

    capturedValidateFields?.(["name"]);
    await waitFor(() => expect(screen.queryByText("Required")).not.toBeInTheDocument());
    expect(screen.getByText("Invalid email")).toBeVisible();
  });

  it("tracks a validating state across the validation round-trip", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    const fetchMock = vi.fn<FetchMock>().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderAction(validateFieldsAction(), validateFieldsProbePlugin);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("textbox", { name: "Name" });

    expect(capturedValidating).toBe(false);

    capturedValidateFields?.(["name"]);
    await waitFor(() => expect(capturedValidating).toBe(true));

    resolveFetch({ json: async () => ({}), ok: true, status: 204 } as unknown as Response);
    await waitFor(() => expect(capturedValidating).toBe(false));
  });

  it("drops its own save button when the form suppresses the submit row", async () => {
    renderAction(wizardAction());

    fireEvent.click(screen.getByRole("button", { name: "Open wizard" }));
    await screen.findByRole("textbox", { name: "Name" });

    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeVisible();
  });

  it("advances a wizard step once its precognitive validation passes", async () => {
    const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
      json: async () => ({}),
      ok: true,
      status: 204,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    renderAction(wizardAction());

    fireEvent.click(screen.getByRole("button", { name: "Open wizard" }));
    await screen.findByRole("textbox", { name: "Name" });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByRole("button", { name: "Finish" })).toBeVisible();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Precognition).toBe("true");
    expect(headers["Precognition-Validate-Only"]).toBe("name,name.*");
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
