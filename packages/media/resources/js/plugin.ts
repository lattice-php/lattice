import { lazyComponent, type Plugin } from "@lattice-php/core";
import { registerMediaImage } from "./rich-editor/media-image";

// Must run before the app boots — the editor resolves definitions from the
// registry when it mounts, so this cannot live in a lazy chunk.
// ponytail: pulls @tiptap/core+react into the eager bundle; revisit if lattice
// grows lazy extension registration.
registerMediaImage();

export default {
  name: "media",
  components: {
    "media.library": lazyComponent(() => import("./library")),
    "field.media-picker": lazyComponent(() => import("./media-picker")),
  },
  i18n: { namespace: "media" },
} satisfies Plugin;
