import path from "node:path";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLlmsTxt from "starlight-llms-txt";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { svgSprite } from "@lattice-php/vite-svg-sprite";

const site = process.env.SITE_URL || "https://latticephp.com";
const viteCacheSuffix = process.argv.includes("build") ? "build" : "dev";

export default defineConfig({
  site,
  srcDir: "./docs",
  outDir: "./dist-docs",
  publicDir: "./docs/public",
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react(),
    starlight({
      title: "Lattice",
      description: "Server-driven React components for Laravel and Inertia.",
      lastUpdated: true,
      plugins: [
        starlightLlmsTxt({
          projectName: "Lattice",
          description:
            "Lattice is a server-driven UI layer for Laravel applications running Inertia with React. Describe pages, forms, tables, and actions in PHP; Lattice serializes them to a typed component tree that real React components render through Inertia — no hand-written API or duplicated UI contract.",
          details:
            "Lattice targets Laravel 13 and PHP 8.4 with Inertia v3 and React 19. It is open source under the MIT license. Source: https://github.com/lattice-php/lattice",
          rawContent: true,
        }),
      ],
      logo: {
        light: "./docs/assets/logo.svg",
        dark: "./docs/assets/logo-dark.svg",
        replacesTitle: true,
      },
      components: {
        Head: "./docs/components/Head.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/lattice-php/lattice",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/lattice-php/lattice/edit/main/",
      },
      customCss: ["./docs/styles/global.css"],
      sidebar: [
        {
          label: "Introduction",
          items: [
            { label: "What is Lattice?", link: "/introduction/what-is-lattice/" },
            { label: "Core Concepts", link: "/introduction/core-concepts/" },
            { label: "Installation", link: "/introduction/installation/" },
            { label: "Getting Started", link: "/introduction/getting-started/" },
            { label: "Configuration", link: "/introduction/configuration/" },
            { label: "No-Build Installation", link: "/introduction/no-build/" },
            { label: "Development with AI", link: "/introduction/development-with-ai/" },
          ],
        },
        {
          label: "Core",
          collapsed: true,
          items: [
            { label: "Pages", link: "/core/pages/" },
            { label: "Layouts", link: "/core/layouts/" },
            { label: "Closure evaluation", link: "/core/closure-evaluation/" },
            { label: "Authorization", link: "/core/authorization/" },
            { label: "Fragments", link: "/core/fragments/" },
            { label: "Navigation", link: "/core/navigation/" },
            { label: "Icons", link: "/core/icons/" },
            { label: "Internationalization", link: "/core/i18n/" },
            { label: "Realtime", link: "/core/realtime/" },
            { label: "Artisan commands", link: "/core/artisan-commands/" },
          ],
        },
        {
          label: "Components",
          collapsed: true,
          items: [
            { label: "Overview", link: "/components/overview/" },
            { label: "Layout", link: "/components/layout/" },
            { label: "Section & Collapsible", link: "/components/section-collapsible/" },
            { label: "Separator", link: "/components/separator/" },
            { label: "Floating panel", link: "/components/floating-panel/" },
            { label: "Text & badges", link: "/components/text/" },
            { label: "Avatar", link: "/components/avatar/" },
            { label: "Buttons & links", link: "/components/buttons/" },
            { label: "Tabs", link: "/components/tabs/" },
            { label: "Modals", link: "/components/modals/" },
            { label: "Tooltip", link: "/components/tooltip/" },
            { label: "Charts", link: "/components/charts/" },
            { label: "Notifications", link: "/components/notifications/" },
          ],
        },
        {
          label: "Forms",
          collapsed: true,
          items: [
            { label: "Overview", link: "/forms/overview/" },
            {
              label: "Fields",
              items: [
                { label: "Overview", link: "/forms/fields/overview/" },
                { label: "Text input", link: "/forms/fields/text-input/" },
                { label: "Textarea", link: "/forms/fields/textarea/" },
                { label: "Select", link: "/forms/fields/select/" },
                { label: "Choice", link: "/forms/fields/choice/" },
                { label: "Checkbox", link: "/forms/fields/checkbox/" },
                { label: "Toggle", link: "/forms/fields/toggle/" },
                { label: "Date input", link: "/forms/fields/date-input/" },
                { label: "Time input", link: "/forms/fields/time-input/" },
                { label: "Date time input", link: "/forms/fields/date-time-input/" },
                { label: "Number input", link: "/forms/fields/number-input/" },
                { label: "Password input", link: "/forms/fields/password-input/" },
                { label: "Hidden input", link: "/forms/fields/hidden-input/" },
                { label: "File upload", link: "/forms/fields/file-upload/" },
                { label: "Rich editor", link: "/forms/fields/rich-editor/" },
                { label: "Repeater", link: "/forms/fields/repeater/" },
                { label: "Builder", link: "/forms/fields/builder/" },
              ],
            },
            { label: "Validation", link: "/forms/validation/" },
            { label: "Conditional fields", link: "/forms/conditional-fields/" },
          ],
        },
        {
          label: "Tables",
          collapsed: true,
          items: [
            { label: "Overview", link: "/tables/overview/" },
            { label: "Data sources", link: "/tables/data-sources/" },
            { label: "Eloquent tables", link: "/tables/eloquent-tables/" },
            {
              label: "Columns",
              items: [
                { label: "Overview", link: "/tables/columns/overview/" },
                { label: "Text", link: "/tables/columns/text/" },
                { label: "Number", link: "/tables/columns/number/" },
                { label: "Money", link: "/tables/columns/money/" },
                { label: "Boolean", link: "/tables/columns/boolean/" },
                { label: "Badge", link: "/tables/columns/badge/" },
                { label: "Icon", link: "/tables/columns/icon/" },
                { label: "Image", link: "/tables/columns/image/" },
                { label: "Stack", link: "/tables/columns/stack/" },
              ],
            },
            { label: "Filtering", link: "/tables/filtering/" },
            { label: "Sorting & pagination", link: "/tables/sorting-and-pagination/" },
            { label: "Actions", link: "/tables/actions/" },
          ],
        },
        {
          label: "Actions",
          collapsed: true,
          items: [
            { label: "Overview", link: "/actions/overview/" },
            { label: "Effects & results", link: "/actions/effects/" },
            { label: "Toasts", link: "/actions/toasts/" },
            { label: "Confirmation & forms", link: "/actions/confirmation-and-forms/" },
            { label: "Bulk actions", link: "/actions/bulk-actions/" },
          ],
        },
        {
          label: "Extending",
          collapsed: true,
          items: [
            { label: "Overview", link: "/extending/overview/" },
            { label: "Custom fields", link: "/extending/custom-fields/" },
            { label: "Custom columns", link: "/extending/custom-columns/" },
            { label: "Registry and types", link: "/extending/registry-and-types/" },
            { label: "Component packages", link: "/extending/component-packages/" },
          ],
        },
        {
          label: "Theming",
          collapsed: true,
          items: [
            { label: "Overview", link: "/theming/" },
          ],
        },
        {
          label: "Advanced",
          collapsed: true,
          items: [
            { label: "Security", link: "/advanced/security/" },
            { label: "Remote components", link: "/advanced/remote/" },
            { label: "Bundle size", link: "/advanced/bundle-size/" },
            { label: "Enums reference", link: "/advanced/enums/" },
          ],
        },
        {
          label: "Testing",
          collapsed: true,
          items: [
            { label: "Overview", link: "/testing/overview/" },
          ],
        },
        {
          label: "Contributing",
          collapsed: true,
          items: [
            { label: "Local Development", link: "/contributing/local-development/" },
          ],
        },
      ],
    }),
  ],
  vite: {
    cacheDir: `node_modules/.vite-${viteCacheSuffix}`,
    plugins: [tailwindcss(), svgSprite({ iconDirs: [path.resolve("./resources/icons")] })],
    resolve: {
      alias: {
        "@lattice-php/lattice/css": path.resolve("./resources/css/lattice.css"),
        "@lattice-php/lattice": path.resolve("./resources/js"),
        "@lattice/lattice": path.resolve("./resources/js"),
        "@components": path.resolve("./docs/components"),
        "@lib": path.resolve("./docs/lib"),
      },
      dedupe: ["react", "react-dom"],
    },
  },
});
