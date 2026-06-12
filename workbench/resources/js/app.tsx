import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import {
  createLayoutResolver,
  createPageResolver,
  extendRegistry,
  IconRendererProvider,
  Provider,
  registry,
} from "@lattice/lattice";
import { enableBackend } from "@lattice/lattice/i18n";
import { createRoot } from "react-dom/client";
import { appColumns } from "./lattice/columns";
import { appIcons } from "./lattice/icons";
import { LanguageSwitcher } from "./lattice/language-switcher";

const appRegistry = extendRegistry(registry, appColumns);

// Load Lattice's chrome translations from the bambamboole/laravel-i18next backend.
void enableBackend();

createInertiaApp({
  strictMode: true,
  resolve: createPageResolver({}),
  layout: createLayoutResolver(),
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    createRoot(el).render(
      <Provider registry={appRegistry}>
        <IconRendererProvider renderer={appIcons}>
          <App {...props} />
          <LanguageSwitcher />
        </IconRendererProvider>
      </Provider>,
    );
  },
});
