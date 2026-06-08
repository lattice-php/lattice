import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice/core/types";
import {
  CheckboxComponent,
  ChoiceComponent,
  FormComponent,
  HiddenInputComponent,
  PasswordInputComponent,
  SubmitButtonComponent,
  TextInputComponent,
} from "./index";

const formSlotState = vi.hoisted(() => ({
  clearErrors: vi.fn<(field: string) => void>(),
  touch: vi.fn<(field: string) => void>(),
  validate: vi.fn<(field: string) => void>(),
}));

vi.mock("@inertiajs/react", () => ({
  Form: ({
    children,
    errorBag: _errorBag,
    resetOnError: _resetOnError,
    resetOnSuccess: _resetOnSuccess,
    transform,
    validationTimeout,
    ...props
  }: {
    children: (state: {
      clearErrors: (field: string) => void;
      errors: Record<string, string>;
      invalid: (field: string) => boolean;
      processing: boolean;
      touch: (field: string) => void;
      validate: (field: string) => void;
      validating: boolean;
      valid: (field: string) => boolean;
    }) => ReactNode;
    errorBag?: string;
    resetOnError?: boolean | string[];
    resetOnSuccess?: boolean | string[];
    transform?: (data: Record<string, unknown>) => Record<string, unknown>;
    validationTimeout?: number;
  }) => (
    <form
      {...props}
      data-transformed={JSON.stringify(transform?.({ name: "Updated team" }) ?? null)}
      data-validation-timeout={validationTimeout}
    >
      {children({
        clearErrors: formSlotState.clearErrors,
        errors: {},
        invalid: () => false,
        processing: false,
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
    formSlotState.touch.mockClear();
    formSlotState.validate.mockClear();
  });

  it("transforms submitted data with the sealed component reference", () => {
    const formNode = {
      id: "team-form",
      props: {
        action: "/lattice/forms/teams.update",
        ref: "sealed-reference",
        method: "patch",
      },
      type: "form",
    } satisfies Node<"form">;

    render(<FormComponent node={formNode}>{null}</FormComponent>);

    expect(document.querySelector("form")).toHaveAttribute("action", "/lattice/forms/teams.update");
    expect(document.querySelector("form")).toHaveAttribute(
      "data-transformed",
      JSON.stringify({
        name: "Updated team",
        _lattice: "sealed-reference",
      }),
    );
  });

  it("renders fields from child schema components", () => {
    const formNode = {
      id: "login-form",
      props: {
        action: "/login",
        method: "post",
        resetOnSuccess: ["password"],
        submitButton: false,
        submitLabel: "Log in",
      },
      type: "form",
    } satisfies Node<"form">;

    const emailNode = {
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
    } satisfies Node<"form.text-input">;

    const passwordNode = {
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
    } satisfies Node<"form.password-input">;

    const rememberNode = {
      props: {
        label: "Remember me",
        name: "remember",
        required: true,
      },
      type: "form.checkbox",
    } satisfies Node<"form.checkbox">;

    const tokenNode = {
      props: {
        name: "token",
        value: "reset-token",
      },
      type: "form.hidden-input",
    } satisfies Node<"form.hidden-input">;

    const submitNode = {
      props: {
        label: "Log in",
      },
      type: "form.submit-button",
    } satisfies Node<"form.submit-button">;

    render(
      <FormComponent node={formNode}>
        <HiddenInputComponent node={tokenNode}>{null}</HiddenInputComponent>
        <TextInputComponent node={emailNode}>{null}</TextInputComponent>
        <PasswordInputComponent node={passwordNode}>{null}</PasswordInputComponent>
        <CheckboxComponent node={rememberNode}>{null}</CheckboxComponent>
        <SubmitButtonComponent node={submitNode}>{null}</SubmitButtonComponent>
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
    const formNode = {
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
    } satisfies Node<"form">;

    const nameNode = {
      props: {
        label: "Name",
        name: "name",
      },
      type: "form.text-input",
    } satisfies Node<"form.text-input">;

    const statusNode = {
      props: {
        label: "Status",
        name: "status",
        options: [
          { label: "Draft", value: "draft" },
          { label: "Active", value: "active" },
        ],
      },
      type: "form.choice",
    } satisfies Node<"form.choice">;

    const featuredNode = {
      props: {
        label: "Featured",
        name: "featured",
      },
      type: "form.checkbox",
    } satisfies Node<"form.checkbox">;

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

  it("passes precognitive validation delay to the inertia form", () => {
    const formNode = {
      id: "product-form",
      props: {
        action: "/lattice/forms/workbench.products.form",
        precognitive: true,
        validationTimeout: 650,
      },
      type: "form",
    } satisfies Node<"form">;

    render(<FormComponent node={formNode}>{null}</FormComponent>);

    expect(document.querySelector("form")).toHaveAttribute("data-validation-timeout", "650");
  });

  it("validates text inputs on change when precognition is enabled", () => {
    const formNode = {
      id: "product-form",
      props: {
        action: "/lattice/forms/workbench.products.form",
        precognitive: true,
      },
      type: "form",
    } satisfies Node<"form">;

    const nameNode = {
      props: {
        label: "Name",
        name: "name",
      },
      type: "form.text-input",
    } satisfies Node<"form.text-input">;

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
});
