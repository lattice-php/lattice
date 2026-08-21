import { buildSprite, writeIconTypes } from "@lattice-php/vite-svg-sprite";
import path from "node:path";
import { latticeIconsDir, workbenchIconDirs, workbenchIconTypes } from "../../vite.icons.ts";

// Writes the workbench's generated IconName union without a full Vite build, so
// `tsc` can resolve `./sprite-icons` on a fresh checkout (CI, pre-push).
const root = path.resolve(import.meta.dirname, "../..");
const fromRoot = (dir) => path.resolve(root, dir);

const { ids } = buildSprite([latticeIconsDir, ...workbenchIconDirs(root)].map(fromRoot));
writeIconTypes(ids, { ...workbenchIconTypes, file: fromRoot(workbenchIconTypes.file) });
console.log(`Wrote ${workbenchIconTypes.file} (${ids.length} icons)`);
