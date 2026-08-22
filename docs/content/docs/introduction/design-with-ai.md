---
title: Design with AI
description: Lattice's React clients, icon sprite, and stylesheets are prepared for Claude Design's design-sync, so an app can publish its own design system from the components it already ships.
---

Lattice does not ship a design system — the look belongs to your app. What it ships is everything
a design-system sync needs: props-based React clients exported from each package, a way to build
the icon sprite outside Vite, and per-package stylesheets. With those in place,
[Claude Design](https://claude.ai/design)'s `/design-sync` can turn the components your app renders
into a design project that designers and agents compose real screens from.

## What design-sync needs

`/design-sync` (a Claude Code skill) bundles a component library, renders a preview card per
component, extracts prop contracts from the package's `.d.ts` files, and uploads the result to a
Claude Design project. It needs three things from a library:

1. **Components that render from props alone.** A design canvas has no Laravel server and no wire
   nodes.
2. **Styles and icons that work without a dev server.** Previews are static HTML.
3. **Typed exports**, so every card carries a real prop contract instead of `unknown`.

## What Lattice provides

**Props-based clients.** Every node type is split into a wire adapter and a client (see
[Components](/components/overview/)). The clients are root exports: `Button`, `Card`, `Dialog`,
`Tabs`, `Sidebar`, `Topbar`, `Menu`, `Toast`, … from `@lattice-php/ui`; `Input`, `Textarea`,
`Checkbox`, `Toggle`, `Combobox`, `MultiSelect`, `DatePicker`, `TimePicker`, `FileUpload`,
`FormField`, … from `@lattice-php/form`; the `DataTable*` shell primitives from
`@lattice-php/table`; `SearchBox`, `SearchPalette` and the palette slots from
`@lattice-php/search`; `MessageList` and `PromptInput` from `@lattice-php/chat`. None of them
know about wire nodes.

**The icon sprite without Vite.** `buildLatticeSprite()` from `@lattice-php/lattice/vite` builds
the same sprite the `lattice()` plugin serves and returns an inline value for `SpriteProvider` —
see [Icons](/core/icons/#the-sprite-outside-vite). Wrap the preview root in
`<SpriteProvider sprite={…}>` and every `Icon` resolves.

**Stylesheets.** `@lattice-php/ui/css` carries the design tokens and base styles; packages with
their own chrome declare a stylesheet in `composer.json` under `extra.lattice.css` (`map.css`,
`pdf.css`, `search.css`, …). Tailwind utilities are compiled by your app, so a sync compiles one
full stylesheet from a small entry that imports these files and `@source`-scans the packages.

**Typed props.** Every published package ships its `.d.ts` tree, and the `./*` export wildcard on
`ui`, `form`, `table`, `action` and `api-reference` lets a sync deep-import a single client when it
needs to.

## Setting it up in your app

Run `/design-sync` in Claude Code at your app's root and point it at the package that holds your
design system — typically a small workspace package that re-exports the Lattice clients you use
plus your own brand components (app shell, page header, logo). The skill writes a
`.design-sync/config.json`; the Lattice-specific parts are:

- a build command that produces the full stylesheet, e.g.
  `npx @tailwindcss/cli -i .design-sync/entry.css -o dist/full.css`, where `entry.css` imports
  `tailwindcss`, `@lattice-php/ui/css` and any package CSS you use;
- a tiny module that exports `buildLatticeSprite()`'s result, registered as an extra entry and
  passed to `SpriteProvider` as the preview provider;
- `ModalProvider` / `Toaster` in the provider chain for components that open overlays.

Components that render server-driven schemas — a node's `schema`, popup content, option cards —
need a component registry and stay out of the design project; everything that takes plain props
is in.

:::note
Previews for heavy clients such as the map or the PDF viewer work too: render the provider or
engine component directly with the same props the adapter would pass. Assets the preview needs
(a pdf.js worker, a sample document) have to be inlined, since a design project has no asset host.
:::
