import type { RemoteAccess } from "@lattice-php/core";
import type { Breakpoint } from "@lattice-php/ui";

export type ApiReference = {
  defaultOperation: string | null;
  expandDepth: number;
  hideBaseUrl: boolean;
  hideHeader: boolean;
  operation: string | null;
  remoteTokens: RemoteAccess[] | null;
  spec: Record<string, unknown>;
  tags: string[] | null;
  title: string | null;
  token: string | null;
  twoColumnBreakpoint: Breakpoint;
  url: string | null;
};
export type ComponentPropsMap = {
  "api-reference": ApiReference;
};
export type NodeType = "api-reference";
