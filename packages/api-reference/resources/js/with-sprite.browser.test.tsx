import { SpriteProvider } from "@lattice-php/ui/icons";
import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ApiReference } from "./with-sprite";

const spec = {
  openapi: "3.1.0",
  info: { title: "Widgets", version: "1.0.0" },
  paths: {
    "/widgets": {
      get: {
        summary: "List widgets",
        tags: ["Widgets"],
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

it("provides the bundled sprite so icons resolve without any host wiring", async () => {
  const screen = await render(<ApiReference hideHeader spec={spec} />);

  await expect.element(screen.getByRole("button", { name: /^List widgets/ })).toBeVisible();
  expect(screen.container.querySelector('use[href="#chevron-down"]')).not.toBeNull();
  expect(screen.container.querySelector("symbol#chevron-down")).not.toBeNull();
});

it("defers to a host-provided sprite", async () => {
  const screen = await render(
    <SpriteProvider sprite={{ href: "/host-sprite.svg" }}>
      <ApiReference hideHeader spec={spec} />
    </SpriteProvider>,
  );

  await expect.element(screen.getByRole("button", { name: /^List widgets/ })).toBeVisible();
  expect(
    screen.container.querySelector('use[href="/host-sprite.svg#chevron-down"]'),
  ).not.toBeNull();
  expect(screen.container.querySelector("symbol#chevron-down")).toBeNull();
});
