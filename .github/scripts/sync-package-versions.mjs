import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const rootManifest = path.join(repositoryRoot, "package.json");
const packageManifests = readdirSync(path.join(repositoryRoot, "packages"))
  .map((directory) => path.join(repositoryRoot, "packages", directory, "package.json"))
  .filter(existsSync);
const manifestPaths = [rootManifest, ...packageManifests];
const packages = manifestPaths.map((manifestPath) => ({
  manifestPath,
  package: JSON.parse(readFileSync(manifestPath, "utf8")),
}));
const version = packages[0].package.version;
const workspaceNames = new Set(
  packages.slice(1).map(({ package: packageJson }) => packageJson.name),
);
const check = process.argv.includes("--check");
const changed = [];

for (const entry of packages) {
  const packageJson = entry.package;
  let packageChanged = false;

  if (entry.manifestPath !== rootManifest && packageJson.version !== version) {
    packageJson.version = version;
    packageChanged = true;
  }

  for (const section of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const dependency of Object.keys(packageJson[section] ?? {})) {
      if (workspaceNames.has(dependency) && packageJson[section][dependency] !== version) {
        packageJson[section][dependency] = version;
        packageChanged = true;
      }
    }
  }

  if (!packageChanged) {
    continue;
  }

  changed.push(path.relative(repositoryRoot, entry.manifestPath));

  if (!check) {
    writeFileSync(entry.manifestPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  }
}

if (check && changed.length > 0) {
  console.error(`Package versions differ from ${version}: ${changed.join(", ")}`);
  process.exitCode = 1;
}
