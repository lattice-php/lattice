import "../css/app.css";
import { configureEcho } from "@laravel/echo-react";
import { createLatticeApp, registerRichEditorExtension } from "@lattice-php/lattice";
import sprite from "virtual:svg-sprite";
import plugins from "virtual:lattice/plugins";
import { appColumns } from "./columns";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

// Exercises the custom rich-editor extension seam: the PHP side ships the bare
// "stamp" wire type (see RichEditorDemoForm) and this client registration
// provides its behavior.
registerRichEditorExtension("stamp", {
  toolbar: () => [
    {
      icon: "check",
      key: "stamp",
      label: "Stamp",
      isActive: () => false,
      run: (editor) => editor.chain().focus().insertContent("Stamped!").run(),
    },
  ],
});

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
