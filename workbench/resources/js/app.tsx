import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import {
  createColumnRegistry,
  createLayoutResolver,
  createPageResolver,
  IconRendererProvider,
  Provider,
  registry,
} from "@lattice/lattice";
import { createRoot } from "react-dom/client";
import { appColumns } from "./lattice/columns";
import { appIcons } from "./lattice/icons";

const columns = createColumnRegistry(appColumns);

createInertiaApp({
  strictMode: true,
  resolve: createPageResolver({}),
  layout: createLayoutResolver(),
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    createRoot(el).render(
      <Provider registry={registry} columns={columns}>
        <IconRendererProvider renderer={appIcons}>
          <App {...props} />
        </IconRendererProvider>
      </Provider>,
    );
  },
});
