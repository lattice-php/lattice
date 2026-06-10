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
          label: "Getting Started",
          items: [
            { label: "Introduction", link: "/" },
            { label: "Installation", link: "/getting-started/installation/" },
            { label: "Quickstart", link: "/getting-started/quickstart/" },
            { label: "Configuration", link: "/getting-started/configuration/" },
            { label: "Frontend Setup", link: "/getting-started/frontend-setup/" },
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
  },
});
