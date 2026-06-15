import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import {
  createLayoutResolver,
  createPageResolver,
  extendRegistry,
  Provider,
  registry,
  withVisitHeaders,
} from "@lattice-php/lattice";
import { configureI18nFromPageProps, LocaleReload } from "@lattice-php/lattice/i18n";
import { createRoot } from "react-dom/client";
import sprite from "virtual:svg-sprite";
import { appColumns } from "./columns";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

const appRegistry = extendRegistry(registry, appColumns);

createInertiaApp({
  strictMode: true,
  resolve: createPageResolver({}),
  layout: createLayoutResolver(),
  defaults: {
    visitOptions: withVisitHeaders,
  },
  setup({ el, App, props }) {
    if (!el) {
      return;
    }

    const root = createRoot(el);
    const render = () => {
      root.render(
        <Provider registry={appRegistry} sprite={sprite}>
          <App {...props} />
          <LocaleReload />
        </Provider>,
      );
    };

    void configureI18nFromPageProps(props.initialPage.props, {
      namespaces: ["lattice", WORKBENCH_I18N_NAMESPACE],
    }).then(render, render);
  },
});
