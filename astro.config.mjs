import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
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
            { label: "Navigation", link: "/core/navigation/" },
          ],
        },
        {
          label: "Forms",
          items: [{ label: "Overview", link: "/forms/overview/" }],
        },
        {
          label: "Tables",
          items: [{ label: "Overview", link: "/tables/overview/" }],
        },
        {
          label: "Actions",
          items: [{ label: "Overview", link: "/actions/overview/" }],
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
  },
});
