import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { configureEcho } from "@laravel/echo-react";
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
import plugins from "virtual:lattice/plugins";
import { appColumns } from "./columns";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

const appRegistry = extendRegistry(registry, appColumns, ...plugins);

type ReverbProp = {
  host: string;
  port: number;
  key: string;
  scheme: string;
};

function configureEchoFromProps(reverb: ReverbProp): void {
  configureEcho({
    broadcaster: "reverb",
    key: reverb.key,
    wsHost: reverb.host,
    wsPort: reverb.port,
    wssPort: reverb.port,
    forceTLS: false,
    enabledTransports: ["ws"],
  });
}

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

    const reverb = props.initialPage.props.reverb as ReverbProp | null | undefined;

    if (typeof window !== "undefined" && reverb) {
      configureEchoFromProps(reverb);
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
