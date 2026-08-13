/**
 * Bundle-bench fixture, never executed: models the entry of an npm consumer
 * app so `vite.bench.ts` can measure what @lattice-php/lattice adds to a
 * production bundle (tree-shaken, minified, peers external).
 */
import { createLatticeApp } from "@lattice-php/lattice";

void createLatticeApp();
