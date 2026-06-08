import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { LatticeNode } from "@/lattice/core/types";
import {
  CheckboxComponent,
  FormComponent,
  HiddenInputComponent,
  PasswordInputComponent,
  SubmitButtonComponent,
  TextInputComponent,
} from "./index";

vi.mock("@inertiajs/react", () => ({
  Form: ({
    children,
    errorBag: _errorBag,
    resetOnError: _resetOnError,
    resetOnSuccess: _resetOnSuccess,
    transform,
    ...props
  }: {
    children: (state: { errors: Record<string, string>; processing: boolean }) => ReactNode;
    errorBag?: string;
    resetOnError?: boolean | string[];
    resetOnSuccess?: boolean | string[];
    transform?: (data: Record<string, unknown>) => Record<string, unknown>;
  }) => (
    <form
      {...props}
      data-transformed={JSON.stringify(transform?.({ name: "Updated team" }) ?? null)}
    >
      {children({ errors: {}, processing: false })}
    </form>
  ),
  Link: ({ children, ...props }: { children: ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("Lattice form schema components", () => {
  it("transforms submitted data with the sealed component reference", () => {
    const formNode = {
      id: "team-form",
      props: {
        action: "/lattice/forms/teams.update",
        ref: "sealed-reference",
        method: "patch",
      },
      type: "form",
    } satisfies LatticeNode<"form">;

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
    } satisfies LatticeNode<"form">;

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
    } satisfies LatticeNode<"form.text-input">;

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
    } satisfies LatticeNode<"form.password-input">;

    const rememberNode = {
      props: {
        label: "Remember me",
        name: "remember",
      },
      type: "form.checkbox",
    } satisfies LatticeNode<"form.checkbox">;

    const tokenNode = {
      props: {
        name: "token",
        value: "reset-token",
      },
      type: "form.hidden-input",
    } satisfies LatticeNode<"form.hidden-input">;

    const submitNode = {
      props: {
        label: "Log in",
      },
      type: "form.submit-button",
    } satisfies LatticeNode<"form.submit-button">;

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
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAttribute("readonly");
    expect(document.querySelector('input[type="hidden"][name="token"]')).toHaveValue("reset-token");
    expect(screen.getByLabelText("Password")).toHaveAttribute("name", "password");
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "name",
      "password_confirmation",
    );
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "passwordrules",
      "minlength:8",
    );
    expect(screen.getByRole("checkbox", { name: "Remember me" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.getByRole("button", { name: "Log in" })).toHaveAttribute("type", "submit");
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });
});
