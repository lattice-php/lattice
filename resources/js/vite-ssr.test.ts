// @vitest-environment node
import path from "node:path";
import type { Page } from "@inertiajs/core";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import { describe, expect, it } from "vitest";
import { lattice } from "./vite";

// Node environment on purpose: jsdom would provide the browser globals whose
// absence these tests are meant to prove Lattice can live without.

function ssrServer(): Promise<ViteDevServer> {
  const appRoot = process.cwd();

  return createServer({
    configFile: false,
    logLevel: "silent",
    server: { middlewareMode: true },
    plugins: lattice({ appRoot, icons: { dts: false }, typescript: false }),
    resolve: {
      alias: { "@lattice-php/lattice": path.resolve(appRoot, "resources/js") },
    },
  });
}

describe("lattice Vite helper under SSR", () => {
  // Regression: aliasing react to an absolute path defeated Vite's SSR
  // externalization (only bare specifiers externalize), inlining react's CJS
  // into the module runner — `module is not defined` the moment anything
  // SSR-loaded an entry importing Lattice (e.g. @inertiajs/vite's warm-up).
  it("ssr-loads an entry importing @lattice-php/lattice", async () => {
    const server = await ssrServer();

    try {
      const entry = await server.ssrLoadModule(
        path.resolve(process.cwd(), "resources/js/test/ssr-entry.tsx"),
      );

      expect(entry.createLatticeApp).toBeTypeOf("function");
      expect(entry.render()).toContain("lattice-ssr");
    } finally {
      await server.close();
    }
  }, 60_000);

  it("server-renders a lattice page through the workbench ssr entry", async () => {
    const server = await ssrServer();

    try {
      const entry = await server.ssrLoadModule(
        path.resolve(process.cwd(), "workbench/resources/js/ssr.tsx"),
      );
      const page = {
        component: "lattice/page",
        props: {
          errors: {},
          lattice: {
            breadcrumbs: [{ label: "Dashboard", href: "/" }],
            container: "default",
            layout: { key: "app", schema: [] },
            listeners: [],
            schema: [
              { type: "heading", props: { text: "SSR proof" } },
              { type: "text", props: { text: "Rendered on the server" } },
            ],
            title: "SSR proof",
          },
        },
        url: "/",
        version: "",
      } as unknown as Page;

      const { body } = await entry.default(page);

      expect(body).toContain('data-server-rendered="true"');
      expect(body).toContain("SSR proof");
      expect(body).toContain("Rendered on the server");
    } finally {
      await server.close();
    }
  }, 60_000);
});
