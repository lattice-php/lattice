import path from "node:path";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL || "https://latticephp.com";
const viteCacheSuffix = process.argv.includes("build") ? "build" : "dev";

export default defineConfig({
  site,
  srcDir: "./docs",
  outDir: "./dist-docs",
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react(),
    starlight({
      title: "Lattice",
      description: "Server-driven React components for Laravel and Inertia.",
      logo: {
        light: "./docs/assets/logo.svg",
        dark: "./docs/assets/logo-dark.svg",
        replacesTitle: true,
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
          ],
        },
        {
          label: "Core",
          items: [
            { label: "Pages", link: "/core/pages/" },
            { label: "Components", link: "/core/components/" },
            { label: "Fragments", link: "/core/fragments/" },
            { label: "Navigation", link: "/core/navigation/" },
            { label: "Theming", link: "/core/theming/" },
          ],
        },
        {
          label: "Forms",
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
                { label: "Date input", link: "/forms/fields/date-input/" },
                { label: "Number input", link: "/forms/fields/number-input/" },
                { label: "Password input", link: "/forms/fields/password-input/" },
                { label: "Hidden input", link: "/forms/fields/hidden-input/" },
                { label: "Rich editor", link: "/forms/fields/rich-editor/" },
              ],
            },
            { label: "Validation", link: "/forms/validation/" },
            { label: "Conditional fields", link: "/forms/conditional-fields/" },
          ],
        },
        {
          label: "Tables",
          items: [
            { label: "Overview", link: "/tables/overview/" },
            { label: "Eloquent tables", link: "/tables/eloquent-tables/" },
            { label: "Columns", link: "/tables/columns/" },
            { label: "Sorting, filtering & pagination", link: "/tables/sorting-filtering-pagination/" },
            { label: "Actions", link: "/tables/actions/" },
          ],
        },
        {
          label: "Actions",
          items: [
            { label: "Overview", link: "/actions/overview/" },
            { label: "Effects & results", link: "/actions/effects/" },
            { label: "Confirmation & forms", link: "/actions/confirmation-and-forms/" },
            { label: "Bulk actions", link: "/actions/bulk-actions/" },
          ],
        },
        {
          label: "Extending",
          items: [
            { label: "Overview", link: "/extending/overview/" },
            { label: "Custom fields", link: "/extending/custom-fields/" },
            { label: "Custom columns", link: "/extending/custom-columns/" },
            { label: "Registry and types", link: "/extending/registry-and-types/" },
          ],
        },
        {
          label: "Contributing",
          items: [
            { label: "Local Development", link: "/contributing/local-development/" },
          ],
        },
      ],
    }),
  ],
  vite: {
    cacheDir: `node_modules/.vite-${viteCacheSuffix}`,
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@lattice/lattice": path.resolve("./resources/js"),
        "@components": path.resolve("./docs/components"),
        "@lib": path.resolve("./docs/lib"),
      },
      dedupe: ["react", "react-dom"],
    },
  },
});
