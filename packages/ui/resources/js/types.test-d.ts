import type { VisibilityBreakpoint } from "@lattice-php/core/renderer";
import type { Breakpoint } from "./generated";

const _toCore: VisibilityBreakpoint = {} as Exclude<Breakpoint, "default">;
const _fromCore: Exclude<Breakpoint, "default"> = {} as VisibilityBreakpoint;

void _toCore;
void _fromCore;
