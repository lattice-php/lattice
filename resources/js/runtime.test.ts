import { expect, it } from "vitest";
import { router } from "@inertiajs/react";
import { RenderNode } from "@lattice-php/core";
import { eagerComponent, loadPluginModules } from "@lattice-php/core/registry";
import { runAction } from "@lattice-php/action";
import { ToolbarIconButton } from "@lattice-php/form/rich-editor";
import { useTable } from "@lattice-php/table";
import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import {
  eagerComponent as runtimeEagerComponent,
  loadPluginModules as runtimeLoadPluginModules,
  Node as runtimeNode,
  ReactNodeViewRenderer as runtimeReactNodeViewRenderer,
  RenderNode as runtimeRenderNode,
  runAction as runtimeRunAction,
  router as runtimeRouter,
  ToolbarIconButton as runtimeToolbarIconButton,
  useTable as runtimeUseTable,
} from "./runtime";

it("exposes the public Lattice API to standalone plugins", () => {
  expect(runtimeEagerComponent).toBe(eagerComponent);
  expect(runtimeLoadPluginModules).toBe(loadPluginModules);
  expect(runtimeNode).toBe(Node);
  expect(runtimeReactNodeViewRenderer).toBe(ReactNodeViewRenderer);
  expect(runtimeRouter).toBe(router);
  expect(runtimeRenderNode).toBe(RenderNode);
  expect(runtimeRunAction).toBe(runAction);
  expect(runtimeToolbarIconButton).toBe(ToolbarIconButton);
  expect(runtimeUseTable).toBe(useTable);
});
