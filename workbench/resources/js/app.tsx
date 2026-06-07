import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";

type PageModule = { default: ComponentType<Record<string, unknown>> };

const packagePages = import.meta.glob<PageModule>("../../../resources/js/pages/**/*.tsx", {
  eager: true,
});
const workbenchPages = import.meta.glob<PageModule>("./Pages/**/*.tsx", {
  eager: true,
});

createInertiaApp({
  strictMode: true,
  resolve: (name: string): PageModule => {
    return (
      workbenchPages[`./Pages/${name}.tsx`] ??
      packagePages[`../../../resources/js/pages/${name}.tsx`]
    );
  },
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    createRoot(el).render(<App {...props} />);
  },
});
