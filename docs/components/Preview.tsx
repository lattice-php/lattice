/// <reference types="@lattice-php/vite-svg-sprite/client" />
import sprite from "virtual:svg-sprite";
import { Renderer, registry } from "@lattice-php/lattice";
import { extendRegistry, RegistryContext } from "@lattice-php/core";
import { SpriteProvider } from "@lattice-php/ui/icons";
import { FormValuesProvider } from "@lattice-php/form";
import type { Node } from "@lattice-php/core";
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

export default function Preview({ nodes, values = {} }: Props) {
  return (
    <SpriteProvider sprite={sprite}>
      <RegistryContext.Provider value={previewRegistry}>
        <FormValuesProvider initial={values}>
          <Renderer nodes={nodes} />
        </FormValuesProvider>
      </RegistryContext.Provider>
    </SpriteProvider>
  );
}
