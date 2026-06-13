import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import {
  createLayoutResolver,
  createPageResolver,
  extendRegistry,
  Provider,
  registry,
} from "@lattice-php/lattice";
import { configureI18n, type I18nConfig } from "@lattice-php/lattice/i18n";
import { createRoot } from "react-dom/client";
import sprite from "virtual:svg-sprite";
import { appColumns } from "./lattice/columns";
import { LanguageSwitcher } from "./lattice/language-switcher";

const appRegistry = extendRegistry(registry, appColumns);

createInertiaApp({
  strictMode: true,
  resolve: createPageResolver({}),
  layout: createLayoutResolver(),
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    const shared = props.initialPage.props as { lattice?: { i18n?: I18nConfig } };
    void configureI18n(shared.lattice?.i18n);

    createRoot(el).render(
      <Provider registry={appRegistry} sprite={sprite}>
        <App {...props} />
        <LanguageSwitcher />
      </Provider>,
    );
  },
});
