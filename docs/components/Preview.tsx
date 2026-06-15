import { Renderer, registry } from "@lattice-php/lattice";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { FormValuesProvider } from "@lattice-php/lattice/form/components/values";
import type { Node } from "@lattice-php/lattice/core/types";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
};

export default function Preview({ nodes, values = {} }: Props) {
  return (
    <RegistryContext.Provider value={registry}>
      <FormValuesProvider initial={values}>
        <Renderer nodes={nodes} />
      </FormValuesProvider>
    </RegistryContext.Provider>
  );
}
