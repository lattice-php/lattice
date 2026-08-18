import { Renderer, registry } from "@lattice-php/lattice";
import { extendRegistry, RegistryProvider as RuntimeRegistryProvider } from "@lattice-php/core";
import { FormValuesProvider } from "@lattice-php/form";
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

const previewRegistry = extendRegistry(
  registry,
  chatPlugin,
  mapPlugin,
  mediaPlugin,
  pdfPlugin,
  treePlugin,
);

export default function PreviewRuntime({ nodes, values = {} }: Props) {
  return (
    <RuntimeRegistryProvider registry={previewRegistry}>
      <PackageRegistryProvider registry={previewRegistry}>
        <FormValuesProvider initial={values}>
          <Renderer nodes={nodes} />
        </FormValuesProvider>
      </PackageRegistryProvider>
    </RuntimeRegistryProvider>
  );
}
