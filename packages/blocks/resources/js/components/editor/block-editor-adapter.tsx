import { lazy, Suspense } from "react";
import type { RendererComponent } from "@lattice-php/core";
import { Spinner } from "@lattice-php/ui/primitives/spinner";

const BlockEditorView = lazy(() => import("./block-editor-view"));

const BlockEditorAdapter: RendererComponent<"blocks.editor"> = ({ node }) => (
  <Suspense
    fallback={
      <div className="flex h-64 items-center justify-center" data-test="blocks-editor-loading">
        <Spinner />
      </div>
    }
  >
    <BlockEditorView node={node} />
  </Suspense>
);

export default BlockEditorAdapter;
