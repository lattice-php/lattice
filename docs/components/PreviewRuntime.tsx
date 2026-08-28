import { Renderer } from "@lattice-php/lattice";
import { createPreviewRegistry, LatticePreview } from "@lattice-php/lattice/preview";
import type { Node } from "@lattice-php/core";
import { RegistryProvider as PackageRegistryProvider } from "../../packages/core/resources/js/registry-context";
import chatPlugin from "../../packages/chat/resources/js/plugin";
import mapPlugin from "../../packages/map/resources/js/plugin";
import mediaPlugin from "../../packages/media/resources/js/plugin";
import type {} from "../../packages/media/resources/js/types";
import pdfPlugin from "../../packages/pdf/resources/js/plugin";
import type {} from "../../packages/pdf/resources/js/types";
import treePlugin from "../../packages/tree/resources/js/plugin";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
};

const previewRegistry = createPreviewRegistry(
  chatPlugin,
  mapPlugin,
  mediaPlugin,
  pdfPlugin,
  treePlugin,
);

// The source-path RegistryProvider mirrors the published one: the doc pages
// import package sources directly, which resolve the registry through a
// second module instance of the registry context.
export default function PreviewRuntime({ nodes, values = {} }: Props) {
  return (
    <LatticePreview registry={previewRegistry} values={values}>
      <PackageRegistryProvider registry={previewRegistry}>
        <Renderer nodes={nodes} />
      </PackageRegistryProvider>
    </LatticePreview>
  );
}
