import { lazyComponent, type Plugin } from "@lattice-php/core/registry";
import { RICH_EDITOR_EXTENSION } from "@lattice-php/form/rich-editor";
// ponytail: pulls @tiptap/core+react into the eager bundle; revisit if lattice
// grows lazy extension registration.
import { mediaImageExtension } from "./rich-editor/media-image";

export default {
  name: "media",
  components: {
    "media.library": lazyComponent(() => import("./library")),
    "field.media-picker": lazyComponent(() => import("./media-picker")),
  },
  extensions: {
    [RICH_EDITOR_EXTENSION]: {
      "media-image": mediaImageExtension,
    },
  },
  i18n: { namespace: "media" },
} satisfies Plugin;
