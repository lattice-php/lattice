import "./types";
import { eagerComponent, type Plugin } from "@lattice-php/core/registry";
import BlockEditorAdapter from "./components/editor/block-editor-adapter";
import BlockFrameAdapter from "./components/view/block-frame-adapter";
import BlockViewAdapter from "./components/view/block-view-adapter";
import RichTextAdapter from "./components/view/rich-text-adapter";
import SlotOutletAdapter from "./components/view/slot-outlet-adapter";
import UnknownBlockAdapter from "./components/view/unknown-block-adapter";

export default {
  name: "lattice/blocks",
  components: {
    "blocks.editor": eagerComponent(BlockEditorAdapter),
    "blocks.frame": eagerComponent(BlockFrameAdapter),
    "blocks.rich-text": eagerComponent(RichTextAdapter),
    "blocks.slot": eagerComponent(SlotOutletAdapter),
    "blocks.unknown": eagerComponent(UnknownBlockAdapter),
    "blocks.view": eagerComponent(BlockViewAdapter),
  },
  i18n: {
    namespace: "blocks",
  },
} satisfies Plugin;
