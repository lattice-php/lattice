/// <reference types="@lattice-php/vite-svg-sprite/client" />
import sprite from "virtual:svg-sprite";
import { SpriteProvider } from "@lattice-php/ui/icons";
import ApiReference from "../../packages/api-reference/resources/js/api-reference/ApiReference";
import spec from "../fixtures/api-reference.openapi.json";

export default function ApiReferenceDemo() {
  return (
    <SpriteProvider sprite={sprite}>
      <ApiReference
        node={{
          type: "api-reference",
          props: {
            spec,
            url: null,
            operation: null,
            tags: null,
            defaultOperation: null,
            hideHeader: false,
            hideBaseUrl: false,
            title: null,
            expandDepth: 2,
            twoColumnBreakpoint: "lg",
            token: null,
          },
        }}
      >
        {null}
      </ApiReference>
    </SpriteProvider>
  );
}
