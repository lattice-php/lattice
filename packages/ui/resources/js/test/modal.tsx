import { createElement, type ReactElement, type ReactNode } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { ModalProvider } from "../components/modal/modal-host";

/** Wraps `ui` in the host every action confirm/form overlay opens against. */
export function withModal(ui: ReactNode): ReactElement {
  return createElement(ModalProvider, null, ui);
}

export function renderWithModal(ui: ReactNode): RenderResult {
  return render(withModal(ui));
}
