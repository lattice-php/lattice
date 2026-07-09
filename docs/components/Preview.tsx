/// <reference types="@lattice-php/vite-svg-sprite/client" />
import sprite from "virtual:svg-sprite";
import { Renderer, registry } from "@lattice-php/lattice";
import { RegistryContext } from "@lattice-php/lattice/core";
import { SpriteProvider } from "@lattice-php/lattice/icons";
import { FormValuesProvider } from "@lattice-php/lattice/form";
import type { Node } from "@lattice-php/lattice/core";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
};

export default function Preview({ nodes, values = {} }: Props) {
  return (
    <SpriteProvider sprite={sprite}>
      <RegistryContext.Provider value={registry}>
        <FormValuesProvider initial={values}>
          <Renderer nodes={nodes} />
        </FormValuesProvider>
      </RegistryContext.Provider>
    </SpriteProvider>
  );
}
