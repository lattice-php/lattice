import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { createColumnRegistry, createLayoutResolver, Provider, registry } from "@lattice/lattice";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import LatticePage from "@lattice/lattice/page";
import { appColumns } from "./lattice/columns";

type PageModule = { default: ComponentType<any> };

const workbenchPages = import.meta.glob<PageModule>("./Pages/**/*.tsx", {
  eager: true,
});

const columns = createColumnRegistry(appColumns);

createInertiaApp({
  strictMode: true,
  resolve: (name: string): PageModule => {
    if (name === "lattice/page") {
      return { default: LatticePage };
    }

    return workbenchPages[`./Pages/${name}.tsx`];
  },
  layout: createLayoutResolver(),
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    createRoot(el).render(
      <Provider registry={registry} columns={columns}>
        <App {...props} />
      </Provider>,
    );
  },
});
