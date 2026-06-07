import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LatticeNode } from "@/lattice/core/types";
import {
  CheckboxComponent,
  FormComponent,
  HiddenInputComponent,
  PasswordInputComponent,
  SubmitButtonComponent,
  TextInputComponent,
} from "./index";

describe("Lattice form schema components", () => {
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
        name: "password",
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
    expect(screen.getByRole("checkbox", { name: "Remember me" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.getByRole("button", { name: "Log in" })).toHaveAttribute("type", "submit");
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });
});
