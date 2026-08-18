import { Renderer, registry } from "@lattice-php/lattice";
import { extendRegistry, RegistryContext as RuntimeRegistryContext } from "@lattice-php/core";
import { FormValuesProvider } from "@lattice-php/form";
import type { Node } from "@lattice-php/core";
import { RegistryContext as PackageRegistryContext } from "../../packages/core/resources/js/registry-context";
import chatPlugin from "../../packages/chat/resources/js/plugin";
import mapPlugin from "../../packages/map/resources/js/plugin";
import pdfPlugin from "../../packages/pdf/resources/js/plugin";
import type {} from "../../packages/pdf/resources/js/types";
import treePlugin from "../../packages/tree/resources/js/plugin";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
};

const previewRegistry = extendRegistry(registry, chatPlugin, mapPlugin, pdfPlugin, treePlugin);

export default function PreviewRuntime({ nodes, values = {} }: Props) {
  return (
    <RuntimeRegistryContext.Provider value={previewRegistry}>
      <PackageRegistryContext.Provider value={previewRegistry}>
        <FormValuesProvider initial={values}>
          <Renderer nodes={nodes} />
        </FormValuesProvider>
      </PackageRegistryContext.Provider>
    </RuntimeRegistryContext.Provider>
  );
}
