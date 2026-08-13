/// <reference types="@lattice-php/vite-svg-sprite/client" />
import sprite from "virtual:svg-sprite";
import { SpriteProvider } from "@lattice-php/ui/icons";
import { ApiReference } from "../../packages/api-reference/resources/js/api-reference/ApiReference";
import spec from "../fixtures/api-reference.openapi.json";

export default function ApiReferenceDemo() {
  return (
    <SpriteProvider sprite={sprite}>
      <ApiReference spec={spec} />
    </SpriteProvider>
  );
}
