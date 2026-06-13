import { Renderer, registry } from "@lattice-php/lattice";
import { FormValuesProvider } from "@lattice-php/lattice/form/components/values";
import type { Node } from "@lattice-php/lattice/core/types";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
};

export default function Preview({ nodes, values = {} }: Props) {
  return (
    <FormValuesProvider initial={values}>
      <Renderer nodes={nodes} registry={registry.components} />
    </FormValuesProvider>
  );
}
