/// <reference types="@lattice-php/vite-svg-sprite/client" />
import sprite from "virtual:svg-sprite";
import { SpriteProvider } from "@lattice-php/ui/icons";
import type { Node } from "@lattice-php/core";
import PreviewRuntime from "./PreviewRuntime";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
};

export default function Preview({ nodes, values = {} }: Props) {
  return (
    <SpriteProvider sprite={sprite}>
      <PreviewRuntime nodes={nodes} values={values} />
    </SpriteProvider>
  );
}
