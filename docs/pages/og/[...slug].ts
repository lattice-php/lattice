import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

const entries = await getCollection("docs");

const pages = Object.fromEntries(
  entries.map((entry) => [entry.id || "index", { data: entry.data }]),
);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "slug",
  pages,
  getImageOptions: (_id, page: (typeof pages)[string]) => ({
    title: page.data.title,
    description: page.data.description,
    logo: {
      path: "./docs/assets/og-logo.png",
      size: [340],
    },
    bgGradient: [[13, 17, 23]],
    border: { color: [0, 149, 133], width: 24, side: "inline-start" },
    padding: 70,
    font: {
      title: {
        families: ["Inter"],
        weight: "Bold",
        color: [255, 255, 255],
        size: 64,
        lineHeight: 1.1,
      },
      description: {
        families: ["Inter"],
        weight: "Normal",
        color: [148, 161, 178],
        size: 32,
        lineHeight: 1.4,
      },
    },
    fonts: [
      "./docs/assets/fonts/inter-latin-400-normal.ttf",
      "./docs/assets/fonts/inter-latin-700-normal.ttf",
    ],
  }),
});
