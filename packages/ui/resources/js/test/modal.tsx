import { createElement, type ReactElement, type ReactNode } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { ModalHostProvider } from "../modal";

/** Wraps `ui` in the host every action confirm/form overlay opens against. */
export function withModalHost(ui: ReactNode): ReactElement {
  return createElement(ModalHostProvider, null, ui);
}

export function renderWithModalHost(ui: ReactNode): RenderResult {
  return render(withModalHost(ui));
}
