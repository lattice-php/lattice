import "../css/app.css";
import { configureEcho } from "@laravel/echo-react";
import { createLatticeApp } from "@lattice-php/lattice";
import sprite from "virtual:svg-sprite";
import plugins from "virtual:lattice/plugins";
import { appColumns } from "./columns";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

type ReverbProp = {
  host: string;
  port: number;
  key: string;
  scheme: string;
};

void createLatticeApp({
  plugins: [appColumns, ...plugins],
  sprite,
  i18n: { namespaces: ["lattice", WORKBENCH_I18N_NAMESPACE] },
  boot: ({ page }) => {
    const reverb = page.props.reverb as ReverbProp | null | undefined;

    if (reverb) {
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
  },
});
