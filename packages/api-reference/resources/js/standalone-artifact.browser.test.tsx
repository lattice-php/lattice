import type { LazyComponentRegistration } from "@lattice-php/core/registry";
import { Suspense } from "react";
import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { apiReferenceNode } from "./test-support";

// The import-shape test (standalone-artifact.test.ts) cannot catch runtime
// barrel gaps: the bundle re-exports `@lattice-php/lattice/runtime` as a
// namespace, so a missing export only surfaces as `undefined` when a
// component renders. This test mounts the committed artifact for real.
it("the committed standalone artifact renders against the runtime barrel", async () => {
  const { default: plugin } = (await import("../../dist-standalone/plugin.js")) as {
    default: { components: Record<string, LazyComponentRegistration> };
  };

  const Registration = plugin.components["api-reference"].component;

  const screen = await render(
    <Suspense fallback={null}>
      <Registration
        node={apiReferenceNode({
          hideHeader: true,
          defaultOperation: "post-widgets",
          spec: {
            openapi: "3.1.0",
            info: { title: "Widgets", version: "1.0.0" },
            servers: [{ url: "https://api.example.test" }],
            paths: {
              "/widgets": {
                post: {
                  summary: "Create widget",
                  tags: ["Widgets"],
                  requestBody: {
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          properties: { name: { type: "string" } },
                        },
                      },
                    },
                  },
                  responses: { "201": { description: "Created" } },
                },
              },
            },
          },
        })}
      >
        {null}
      </Registration>
    </Suspense>,
  );

  const createWidget = screen.getByRole("button", { name: /^Create widget/ });
  await expect.element(createWidget).toHaveAttribute("aria-expanded", "true");
  await expect.element(screen.getByRole("button", { name: "Execute" })).toBeVisible();
});
