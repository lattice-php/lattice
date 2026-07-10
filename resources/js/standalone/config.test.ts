import { expect, it, vi } from "vitest";
import { readStandaloneConfig } from "./config";

function documentWith(html: string): Document {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = html;

  return doc;
}

it("reads the config from the data-lattice-config script", () => {
  const doc = documentWith(
    `<script type="application/json" data-lattice-config>{"spriteUrl":"/vendor/lattice/sprite.svg?v=abc","echo":{"broadcaster":"reverb"}}</script>`,
  );

  expect(readStandaloneConfig(doc)).toEqual({
    spriteUrl: "/vendor/lattice/sprite.svg?v=abc",
    echo: { broadcaster: "reverb" },
  });
});

it("returns an empty config when the script is absent", () => {
  expect(readStandaloneConfig(documentWith("<div></div>"))).toEqual({});
});

it("warns and falls back to an empty config on invalid JSON", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const doc = documentWith(`<script type="application/json" data-lattice-config>{nope</script>`);

  expect(readStandaloneConfig(doc)).toEqual({});
  expect(warn).toHaveBeenCalledOnce();

  warn.mockRestore();
});
