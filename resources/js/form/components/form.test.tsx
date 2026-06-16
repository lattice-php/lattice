import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ButtonComponent from "@lattice-php/lattice/core/components/button";
import { fakeNode } from "@lattice-php/lattice/test-support";
import {
  CheckboxComponent,
  ChoiceComponent,
  FormComponent,
  HiddenInputComponent,
  PasswordInputComponent,
  TextInputComponent,
} from "./index";

const formSlotState = vi.hoisted(() => ({
  clearErrors: vi.fn<(field: string) => void>(),
  reset: vi.fn<(...fields: string[]) => void>(),
  touch: vi.fn<(field: string) => void>(),
  validate: vi.fn<(field: string) => void>(),
}));

vi.mock("@inertiajs/react", () => ({
  Form: ({
    children,
    errorBag: _errorBag,
    resetOnError: _resetOnError,
    resetOnSuccess: _resetOnSuccess,
    headers,
    validationTimeout,
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
  }) => (
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
  ),
  Link: ({ children, ...props }: { children: ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("Lattice form schema components", () => {
  beforeEach(() => {
    formSlotState.clearErrors.mockClear();
    formSlotState.reset.mockClear();
    formSlotState.touch.mockClear();
    formSlotState.validate.mockClear();
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

  it("renders fields from child schema components", () => {
    const formNode = fakeNode({
      id: "login-form",
      props: {
        action: "/login",
        method: "post",
        resetOnSuccess: ["password"],
        submitButton: false,
        submitLabel: "Log in",
      },
      type: "form",
    });

    const emailNode = fakeNode({
      props: {
        autoComplete: "email",
        autoFocus: true,
        label: "Email address",
        name: "email",
        placeholder: "email@example.com",
        readOnly: true,
        required: true,
        value: "taylor@example.com",
      },
      type: "form.text-input",
    });

    const passwordNode = fakeNode({
      props: {
        autoComplete: "current-password",
        autoFocus: true,
        label: "Password",
        labelAction: {
          href: "/forgot-password",
          label: "Forgot your password?",
          tabIndex: 5,
        },
        confirmation: {
          label: "Confirm password",
          name: "password_confirmation",
          placeholder: "Confirm password",
        },
        name: "password",
        passwordRules: "minlength:8",
        required: true,
      },
      type: "form.password-input",
    });

    const rememberNode = fakeNode({
      props: {
        label: "Remember me",
        name: "remember",
        required: true,
      },
      type: "form.checkbox",
    });

    const tokenNode = fakeNode({
      props: {
        name: "token",
        value: "reset-token",
      },
      type: "form.hidden-input",
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
        <HiddenInputComponent node={tokenNode}>{null}</HiddenInputComponent>
        <TextInputComponent node={emailNode}>{null}</TextInputComponent>
        <PasswordInputComponent node={passwordNode}>{null}</PasswordInputComponent>
        <CheckboxComponent node={rememberNode}>{null}</CheckboxComponent>
        <ButtonComponent node={submitNode}>{null}</ButtonComponent>
      </FormComponent>,
    );

    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAttribute("name", "email");
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveValue(
      "taylor@example.com",
    );
    expect(screen.getByRole("textbox", { name: "Email address" })).not.toHaveAttribute("required");
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAttribute("readonly");
    expect(document.querySelector('input[type="hidden"][name="token"]')).toHaveValue("reset-token");
    expect(screen.getByLabelText("Password")).toHaveAttribute("name", "password");
    expect(screen.getByLabelText("Password")).not.toHaveAttribute("required");
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "name",
      "password_confirmation",
    );
    expect(screen.getByLabelText("Confirm password")).not.toHaveAttribute("required");
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "passwordrules",
      "minlength:8",
    );
    expect(screen.getByRole("checkbox", { name: "Remember me" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Remember me" })).not.toHaveAttribute("required");
    expect(screen.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
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
      type: "form.text-input",
    });

    const statusNode = fakeNode({
      props: {
        label: "Status",
        name: "status",
        options: [
          { label: "Draft", value: "draft" },
          { label: "Active", value: "active" },
        ],
      },
      type: "form.choice",
    });

    const featuredNode = fakeNode({
      props: {
        label: "Featured",
        name: "featured",
      },
      type: "form.checkbox",
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
      type: "form.text-input",
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

  it("passes precognitive validation delay to the inertia form", () => {
    const formNode = fakeNode({
      id: "product-form",
      props: {
        action: "/lattice/forms/workbench.products.form",
        precognitive: true,
        validationTimeout: 650,
      },
      type: "form",
    });

    render(<FormComponent node={formNode}>{null}</FormComponent>);

    expect(document.querySelector("form")).toHaveAttribute("data-validation-timeout", "650");
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
      type: "form.text-input",
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
});
