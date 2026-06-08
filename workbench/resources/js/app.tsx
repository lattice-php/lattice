import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import LatticePage from "../../../resources/js/page";

type PageModule = { default: ComponentType<any> };

const workbenchPages = import.meta.glob<PageModule>("./Pages/**/*.tsx", {
  eager: true,
});

createInertiaApp({
  strictMode: true,
  resolve: (name: string): PageModule => {
    if (name === "lattice/page") {
      return { default: LatticePage };
    }

    return workbenchPages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    createRoot(el).render(<App {...props} />);
  },
});
