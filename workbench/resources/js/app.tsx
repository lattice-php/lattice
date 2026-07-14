import "../css/app.css";
import { configureEcho } from "@laravel/echo-react";
import { createLatticeApp, registerRichEditorExtension } from "@lattice-php/lattice";
import { ToolbarIconButton } from "@lattice-php/lattice/form/rich-editor";
import sprite from "virtual:svg-sprite";
import plugins from "virtual:lattice/plugins";
import { appColumns } from "./columns";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

// Exercises the custom rich-editor extension seam: the PHP side ships the bare
// "stamp" wire type (see RichEditorFieldForm) and this client registration
// provides its behavior. A custom control labels itself, so the demo adds no
// key to the package's `form.editor.*` namespace.
registerRichEditorExtension("stamp", {
  toolbar: () => [
    {
      key: "stamp",
      component: ({ editor }) => (
        <ToolbarIconButton
          icon="check"
          label="Stamp"
          onClick={() => editor.chain().focus().insertContent("Stamped!").run()}
          testId="editor-stamp"
        />
      ),
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
