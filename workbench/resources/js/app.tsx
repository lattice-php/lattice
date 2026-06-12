/// <reference types="@lattice-php/vite-svg-sprite/client" />
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import {
  createLayoutResolver,
  createPageResolver,
  extendRegistry,
  Provider,
  registry,
} from "@lattice/lattice";
import { createRoot } from "react-dom/client";
import sprite from "virtual:svg-sprite";
import { appColumns } from "./lattice/columns";

const appRegistry = extendRegistry(registry, appColumns);

createInertiaApp({
  strictMode: true,
  resolve: createPageResolver({}),
  layout: createLayoutResolver(),
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    createRoot(el).render(
      <Provider registry={appRegistry} sprite={sprite}>
        <App {...props} />
      </Provider>,
    );
  },
});
