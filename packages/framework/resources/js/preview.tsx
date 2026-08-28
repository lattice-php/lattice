import type { ReactNode } from "react";
import type { Node } from "@lattice-php/core";
import { Renderer } from "@lattice-php/core";
import type { Plugin, Registry } from "@lattice-php/core/registry";
import { extendRegistry } from "@lattice-php/core/registry";
import { RegistryProvider } from "@lattice-php/core/registry-context";
import { FormValuesProvider } from "@lattice-php/form";
import { ModalProvider } from "@lattice-php/ui/components/modal/modal-host";
import type { SpriteValue } from "@lattice-php/ui/icons/sprite";
import { SpriteProvider } from "@lattice-php/ui/icons/sprite";
import { registry } from "./registry";

/**
 * The framework registry extended with opt-in package plugins (map, pdf,
 * media, tree, chat, …). The opt-in plugins ship via Composer, not npm, so a
 * preview host imports them from the vendor sources and passes them in.
 */
export function createPreviewRegistry(...plugins: Plugin[]): Registry {
  return plugins.length === 0 ? registry : extendRegistry(registry, ...plugins);
}

const defaultSprite: SpriteValue = { href: "" };

export type LatticePreviewProps = {
  children?: ReactNode;
  nodes?: Node[];
  registry?: Registry;
  sprite?: SpriteValue;
  values?: Record<string, unknown>;
};

/**
 * Renders node schemas outside a Lattice app — docs, design tooling, static
 * captures. Mounts the provider stack node renderers rely on (registry, form
 * values, sprite, modal host) without Inertia, a server, or the runtime
 * event bridge. Links fall back to plain anchors via the default navigation
 * adapter.
 */
export function LatticePreview({
  children,
  nodes = [],
  registry: previewRegistry = registry,
  sprite = defaultSprite,
  values = {},
}: LatticePreviewProps) {
  return (
    <RegistryProvider registry={previewRegistry}>
      <SpriteProvider sprite={sprite}>
        <ModalProvider>
          <FormValuesProvider initial={values}>
            {nodes.length > 0 ? <Renderer nodes={nodes} /> : null}
            {children}
          </FormValuesProvider>
        </ModalProvider>
      </SpriteProvider>
    </RegistryProvider>
  );
}
