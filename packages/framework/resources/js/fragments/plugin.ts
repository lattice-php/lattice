import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { FragmentNodeType } from "@lattice-php/lattice/types/generated";
import FragmentComponent from "./fragment";

export const fragmentComponents: Plugin = {
  components: {
    fragment: eagerComponent(FragmentComponent),
  } satisfies ComponentRegistryFor<FragmentNodeType>,
  name: "lattice/fragments",
};
