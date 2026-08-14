import { existsSync, readFileSync } from "node:fs";

const artifacts = [
  { package: "packages/framework", manifest: "dist-standalone/manifest.json" },
  { package: "packages/calendar", manifest: "dist/manifest.json", module: "dist/plugin.js" },
  { package: "packages/chat", manifest: "dist/manifest.json", module: "dist/plugin.js" },
  { package: "packages/map", manifest: "dist/manifest.json", module: "dist/plugin.js" },
  { package: "packages/tree", manifest: "dist/manifest.json", module: "dist/plugin.js" },
  { package: "packages/media", manifest: "dist/manifest.json", module: "dist/plugin.js" },
  {
    package: "packages/api-reference",
    manifest: "dist-standalone/manifest.json",
    module: "dist-standalone/plugin.js",
  },
  { package: "packages/search", manifest: "dist/manifest.json", module: "dist/plugin.js" },
];

let failed = false;

const fail = (message) => {
  console.error(`${message}; run npm run build:standalone.`);
  failed = true;
};

for (const { package: pkg, manifest, module } of artifacts) {
  const manifestPath = `${pkg}/${manifest}`;

  if (!existsSync(manifestPath)) {
    fail(`${manifestPath} is missing`);
    continue;
  }

  const built = JSON.parse(readFileSync(manifestPath, "utf8"));
  const { version } = JSON.parse(readFileSync(`${pkg}/package.json`, "utf8"));

  if (built.version !== version) {
    fail(`${manifestPath} ${built.version} != package ${version}`);
  }

  if (module !== undefined && !existsSync(`${pkg}/${module}`)) {
    fail(`${pkg}/${module} is missing`);
  }
}

if (failed) {
  process.exit(1);
}
