import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRefreshedRefs } from "@lattice-php/core/component-ref";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import ButtonComponent from "@lattice-php/ui/components/button";
import { fakeNode } from "@lattice-php/core/test-support";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import { CheckboxComponent, ChoiceComponent, FormComponent, TextInputComponent } from ".";

const formSlotState = vi.hoisted(() => ({
  clearErrors: vi.fn<(field: string) => void>(),
  reset: vi.fn<(...fields: string[]) => void>(),
  touch: vi.fn<(field: string) => void>(),
  validate: vi.fn<(field: string) => void>(),
}));

const formCallbacks = vi.hoisted(
  (): {
    onError?: () => void;
    onHttpException?: (response: { status: number }) => boolean | undefined;
    onStart?: () => void;
    onSuccess?: () => void;
  } => ({}),
);

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({
    Form: ({
      children,
      errorBag: _errorBag,
      resetOnError: _resetOnError,
      resetOnSuccess: _resetOnSuccess,
      headers,
      validationTimeout,
      onError,
      onHttpException,
      onStart,
      onSuccess,
      ref: _ref,
      ...props
    }: {
      children: (state: {
        clearErrors: (field: string) => void;
        errors: Record<string, string>;
        invalid: (field: string) => boolean;
        processing: boolean;
        reset: (...fields: string[]) => void;
        touch: (field: string) => void;
        validate: (field: string) => void;
        validating: boolean;
        valid: (field: string) => boolean;
      }) => ReactNode;
      errorBag?: string;
      resetOnError?: boolean | string[];
      resetOnSuccess?: boolean | string[];
      headers?: Record<string, string>;
      validationTimeout?: number;
      onError?: () => void;
      onHttpException?: (response: { status: number }) => boolean | undefined;
      onStart?: () => void;
      onSuccess?: () => void;
      ref?: unknown;
    }) => {
      formCallbacks.onError = onError;
      formCallbacks.onHttpException = onHttpException;
      formCallbacks.onStart = onStart;
      formCallbacks.onSuccess = onSuccess;

      return (
        <form
          {...props}
          data-headers={JSON.stringify(headers ?? null)}
          data-validation-timeout={validationTimeout}
        >
          {children({
            clearErrors: formSlotState.clearErrors,
            errors: {},
            invalid: () => false,
            processing: false,
            reset: formSlotState.reset,
            touch: formSlotState.touch,
            validate: formSlotState.validate,
            validating: false,
            valid: () => false,
          })}
        </form>
      );
    },
    Link: ({ children, ...props }: { children: ReactNode; href: string }) => (
      <a {...props}>{children}</a>
    ),
  }),
);

describe("Lattice form schema components", () => {
  beforeEach(() => {
    formSlotState.clearErrors.mockClear();
    formSlotState.reset.mockClear();
    formSlotState.touch.mockClear();
    formSlotState.validate.mockClear();
  });

  afterEach(() => {
    clearRefreshedRefs();
    vi.unstubAllGlobals();
  });

  it("sends the sealed component reference as a header", () => {
    const formNode = fakeNode({
      id: "team-form",
      props: {
        action: "/lattice/forms/teams.update",
        ref: "sealed-reference",
        method: "patch",
      },
      type: "form",
    });

    render(<FormComponent node={formNode}>{null}</FormComponent>);

    expect(document.querySelector("form")).toHaveAttribute("action", "/lattice/forms/teams.update");
    expect(document.querySelector("form")).toHaveAttribute(
      "data-headers",
      JSON.stringify({ "Accept-Language": "en", "X-Lattice-Ref": "sealed-reference" }),
    );
  });

  it("omits the managed submit button when submitButton is false", () => {
    const formNode = fakeNode({
      id: "login-form",
      props: {
        action: "/login",
        method: "post",
        submitButton: false,
      },
      type: "form",
    });

    const submitNode = fakeNode({
      props: {
        buttonType: "submit",
        label: "Log in",
      },
      type: "button",
    });

    render(
      <FormComponent node={formNode}>
        <ButtonComponent node={submitNode}>{null}</ButtonComponent>
      </FormComponent>,
    );

    expect(screen.getByRole("button", { name: "Log in" })).toHaveAttribute("type", "submit");
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });

  it("uses form state as field defaults", () => {
    const formNode = fakeNode({
      id: "product-form",
      props: {
        action: "/lattice/forms/workbench.products.form",
        method: "patch",
        state: {
          name: "Desk Lamp",
          status: "active",
          featured: true,
        },
      },
      type: "form",
    });

    const nameNode = fakeNode({
      props: {
        label: "Name",
        name: "name",
      },
      type: "field.text-input",
    });

    const statusNode = fakeNode({
      props: {
        label: "Status",
        name: "status",
        options: [
          { label: "Draft", value: "draft", data: null },
          { label: "Active", value: "active", data: null },
        ],
      },
      type: "field.choice",
    });

    const featuredNode = fakeNode({
      props: {
        label: "Featured",
        name: "featured",
      },
      type: "field.checkbox",
    });

    render(
      <FormComponent node={formNode}>
        <TextInputComponent node={nameNode}>{null}</TextInputComponent>
        <ChoiceComponent node={statusNode}>{null}</ChoiceComponent>
        <CheckboxComponent node={featuredNode}>{null}</CheckboxComponent>
      </FormComponent>,
    );

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Desk Lamp");
    expect(screen.getByRole("radio", { name: "Active" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: "Featured" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("refreshes field values when form state props change", () => {
    const formNode = fakeNode({
      id: "product-form",
      props: {
        action: "/lattice/forms/workbench.products.form",
        state: {
          name: "Desk Lamp",
        },
      },
      type: "form",
    });

    const nameNode = fakeNode({
      props: {
        label: "Name",
        name: "name",
      },
      type: "field.text-input",
    });

    const { rerender } = render(
      <FormComponent node={formNode}>
        <TextInputComponent node={nameNode}>{null}</TextInputComponent>
      </FormComponent>,
    );

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Desk Lamp");

    rerender(
      <FormComponent
        node={{
          ...formNode,
          props: {
            ...formNode.props,
            state: {
              name: "Floor Lamp",
            },
          },
        }}
      >
        <TextInputComponent node={nameNode}>{null}</TextInputComponent>
      </FormComponent>,
    );

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Floor Lamp");
  });

  it("validates text inputs on change when precognition is enabled", () => {
    const formNode = fakeNode({
      id: "product-form",
      props: {
        action: "/lattice/forms/workbench.products.form",
        precognitive: true,
      },
      type: "form",
    });

    const nameNode = fakeNode({
      props: {
        label: "Name",
        name: "name",
      },
      type: "field.text-input",
    });

    render(
      <FormComponent node={formNode}>
        <TextInputComponent node={nameNode}>{null}</TextInputComponent>
      </FormComponent>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Desk Lamp" },
    });

    expect(formSlotState.validate).toHaveBeenCalledWith("name");
  });

  it("resets when a matching reset-form effect is dispatched", () => {
    const formNode = fakeNode({
      id: "teams.create",
      props: { action: "/lattice/forms/teams.create", method: "post" },
      type: "form",
    });

    render(<FormComponent node={formNode}>{null}</FormComponent>);

    window.dispatchEvent(new CustomEvent("lattice:reset-form", { detail: { form: "other.form" } }));
    expect(formSlotState.reset).not.toHaveBeenCalled();

    window.dispatchEvent(
      new CustomEvent("lattice:reset-form", { detail: { form: "teams.create" } }),
    );
    expect(formSlotState.reset).toHaveBeenCalledOnce();
  });

  it("resets the value store on submit success when resetOnSuccess is set", () => {
    const nameNode = fakeNode({
      props: { label: "Name", name: "name", value: "" },
      type: "field.text-input",
    });
    const formNode = fakeNode({
      id: "resetting-form",
      props: { action: "/items", resetOnSuccess: true, submitButton: false },
      schema: [nameNode],
      type: "form",
    });

    render(
      <FormComponent node={formNode}>
        <TextInputComponent node={nameNode}>{null}</TextInputComponent>
      </FormComponent>,
    );

    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(input, { target: { value: "Widget" } });
    expect(input).toHaveValue("Widget");

    act(() => formCallbacks.onSuccess?.());

    expect(input).toHaveValue("");
  });

  it("resets only the configured fields and keeps values without configuration", () => {
    const nameNode = fakeNode({
      props: { label: "Name", name: "name", value: "" },
      type: "field.text-input",
    });
    const emailNode = fakeNode({
      props: { label: "Email", name: "email", value: "" },
      type: "field.text-input",
    });
    const formNode = fakeNode({
      id: "partial-reset-form",
      props: { action: "/items", resetOnSuccess: ["name"], submitButton: false },
      schema: [nameNode, emailNode],
      type: "form",
    });

    render(
      <FormComponent node={formNode}>
        <TextInputComponent node={nameNode}>{null}</TextInputComponent>
        <TextInputComponent node={emailNode}>{null}</TextInputComponent>
      </FormComponent>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Widget" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "a@example.com" },
    });

    act(() => formCallbacks.onSuccess?.());

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("a@example.com");
  });

  it("clears controlled values through the reset-form event", () => {
    const nameNode = fakeNode({
      props: { label: "Name", name: "name", value: "" },
      type: "field.text-input",
    });
    const formNode = fakeNode({
      id: "event-reset-form",
      props: { action: "/items", submitButton: false },
      schema: [nameNode],
      type: "form",
    });

    render(
      <FormComponent node={formNode}>
        <TextInputComponent node={nameNode}>{null}</TextInputComponent>
      </FormComponent>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Widget" },
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("lattice:reset-form", { detail: { form: null } }));
    });

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
  });

  it("suppresses a sealed form's first 403, renews the ref, and lets the second surface", async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ ref: "renewed-ref" }),
        }) as unknown as Response,
    );
    vi.stubGlobal("fetch", fetchMock);

    const formNode = fakeNode({
      id: "sealed-form",
      props: { action: "/items", ref: "sealed-form-ref", submitButton: false },
      type: "form",
    });

    render(<FormComponent node={formNode}>{null}</FormComponent>);

    let firstResult: boolean | undefined;
    await act(async () => {
      firstResult = formCallbacks.onHttpException?.({ status: 403 });
    });

    expect(firstResult).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith("/lattice/refs/refresh", expect.anything());

    act(() => formCallbacks.onStart?.());

    expect(formCallbacks.onHttpException?.({ status: 403 })).toBeUndefined();
  });

  it("does not intercept a 403 on a form without a ref", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const formNode = fakeNode({
      id: "unsealed-form",
      props: { action: "/items", submitButton: false },
      type: "form",
    });

    render(<FormComponent node={formNode}>{null}</FormComponent>);

    expect(formCallbacks.onHttpException?.({ status: 403 })).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders custom submit buttons, substituting the managed submit button", () => {
    const registry = createRegistry({
      components: { button: eagerComponent(ButtonComponent) },
      name: "test/form-submit-buttons",
    });

    const formNode = fakeNode({
      id: "custom-submit-form",
      props: {
        action: "/custom",
        submitButton: true,
        submitButtons: [
          fakeNode({ props: { buttonType: "button", label: "Cancel" }, type: "button" }),
          fakeNode({ props: { buttonType: "submit", label: "Save" }, type: "button" }),
        ],
      },
      type: "form",
    });

    renderWithRegistry(<FormComponent node={formNode}>{null}</FormComponent>, registry);

    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });
});
