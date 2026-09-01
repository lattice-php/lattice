import type { Breakpoint, RemoteAccess } from "@lattice-php/core";

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
export type ApiReferenceNodeType = "api-reference";
export type ComponentPropsMap = {
  "api-reference": ApiReference;
};
