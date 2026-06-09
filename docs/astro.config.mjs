import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL || "https://latticephp.com";
const viteCacheSuffix = process.argv.includes("build") ? "build" : "dev";

export default defineConfig({
  site,
  devToolbar: {
    enabled: false,
  },
  integrations: [
    starlight({
      title: "Lattice",
      description: "Server-driven React components for Laravel and Inertia.",
      logo: {
        light: "./src/assets/logo.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: true,
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/bambamboole/lattice",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/bambamboole/lattice/edit/main/docs/",
      },
      customCss: ["./src/styles/global.css"],
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
      ],
    }),
  ],
  vite: {
    cacheDir: `node_modules/.vite-${viteCacheSuffix}`,
    plugins: [tailwindcss()],
  },
});
