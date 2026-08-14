import { useEffect, useMemo, useState } from "react";
import type { RemoteAccess } from "@lattice-php/core/api";
import { Icon } from "@lattice-php/ui/icons";
import type { ResolveAccessToken } from "./access-token";
import { Badge } from "@lattice-php/ui/badge";
import { CopyButton } from "@lattice-php/ui/copyable-text";
import { httpMethodColor } from "./http-method-color";
import { operationToMarkdown } from "./operation-markdown";
import { OperationView } from "./OperationView";
import { buildNavigation, filterNavigationByTags, parseOperation } from "./parse";
import { operationUrl } from "./request-builder";
import type { TwoColumnBreakpoint } from "./RequestPlayground";
import { ServerPicker } from "./ServerPicker";
import type { ApiInfo, Navigation } from "./types";

export type ApiReferenceProps = {
  /** Inline OpenAPI 3.x document. */
  spec?: unknown;
  /** URL to fetch the OpenAPI document from instead of passing it inline. */
  url?: string | null;
  /** Render a single operation instead of the grouped navigation. */
  operation?: string | null;
  /** Only show operations carrying one of these tags. */
  tags?: string[] | null;
  /** Operation to expand initially when no deep link targets one. */
  defaultOperation?: string | null;
  hideHeader?: boolean;
  hideBaseUrl?: boolean;
  /** Overrides the spec's info.title in the header. */
  title?: string | null;
  expandDepth?: number;
  twoColumnBreakpoint?: TwoColumnBreakpoint;
  /** Pre-fills the playground's bearer token. */
  token?: string | null;
  /** Sealed per-scope-set token accesses; execute fetches a scoped token lazily. Wins over token. */
  remoteTokens?: RemoteAccess[] | null;
  /** Standalone hosts: fetch a scoped token on execute without a Lattice backend. Wins over remoteTokens and token. */
  resolveAccessToken?: ResolveAccessToken | null;
  /** Controls the expanded operation; pair with onOperationChange. */
  selectedOperation?: string | null;
  onOperationChange?: (id: string) => void;
  /** Sync the expanded operation with location.hash. Ignored when controlled. */
  deepLinking?: boolean;
};

function firstSummaryId(navigation: Navigation | null): string | null {
  if (!navigation) return null;

  for (const group of navigation.groups) {
    const [id] = group.operationIds;
    if (id) return id;
  }

  return null;
}

function currentHashId(): string | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.slice(1);

  return hash === "" ? null : hash;
}

function InfoHeader({ title, info }: { title: string | null; info: ApiInfo }): React.ReactNode {
  const resolvedTitle = title ?? info.title;

  if (!resolvedTitle && !info.version && !info.description) return null;

  return (
    <header className="border-b border-lt-border py-6">
      {resolvedTitle ? <h1 className="text-lg font-semibold text-lt-fg">{resolvedTitle}</h1> : null}
      {info.version ? <p className="mt-1 text-xs text-lt-muted-fg">v{info.version}</p> : null}
      {info.description ? <p className="mt-2 text-lt-muted-fg">{info.description}</p> : null}
    </header>
  );
}

export function ApiReference({
  spec: inlineSpec = null,
  url = null,
  operation = null,
  tags = null,
  defaultOperation = null,
  hideHeader = false,
  hideBaseUrl = false,
  title = null,
  expandDepth = 2,
  twoColumnBreakpoint = "lg",
  token = null,
  remoteTokens = null,
  resolveAccessToken = null,
  selectedOperation,
  onOperationChange,
  deepLinking = true,
}: ApiReferenceProps): React.ReactNode {
  const controlled = selectedOperation !== undefined;
  const [spec, setSpec] = useState<unknown>(inlineSpec ?? null);
  const [loading, setLoading] = useState<boolean>(Boolean(url));
  const [error, setError] = useState<string | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(() =>
    deepLinking ? currentHashId() : null,
  );
  const selectedId = controlled ? selectedOperation : internalSelectedId;
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [collapsedOperationKey, setCollapsedOperationKey] = useState<string | null>(null);
  const [selectedRootServerUrl, setSelectedRootServerUrl] = useState<string | null>(null);
  const [selectedOperationServerUrls, setSelectedOperationServerUrls] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!url) return;

    let active = true;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch spec: ${res.status} ${res.statusText}`);
        }

        return res.json();
      })
      .then((json: unknown) => {
        if (active) setSpec(json);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url]);

  const rawNavigation = useMemo(() => (spec ? buildNavigation(spec) : null), [spec]);
  const navigation = useMemo(
    () =>
      rawNavigation && tags?.length ? filterNavigationByTags(rawNavigation, tags) : rawNavigation,
    [rawNavigation, tags],
  );
  const components = (spec as { components?: unknown } | null)?.components ?? null;
  const activeOperationId = operation ?? selectedId;
  const activeGroupId =
    navigation?.groups.find(
      (group) =>
        group.id === selectedGroupId && selectedId && group.operationIds.includes(selectedId),
    )?.id ??
    navigation?.groups.find((group) => selectedId && group.operationIds.includes(selectedId))?.id;
  const activeOperation = useMemo(() => {
    if (!spec || !activeOperationId) return null;

    const parsedOperation = parseOperation(spec, activeOperationId);
    if (!parsedOperation) return null;

    const selectedServerUrl = parsedOperation.usesRootServers
      ? selectedRootServerUrl
      : (selectedOperationServerUrls[activeOperationId] ?? null);

    return parseOperation(spec, activeOperationId, selectedServerUrl);
  }, [spec, activeOperationId, selectedRootServerUrl, selectedOperationServerUrls]);

  useEffect(() => {
    if (controlled || selectedId !== null || !navigation) return;

    const initial =
      (deepLinking ? currentHashId() : null) ?? defaultOperation ?? firstSummaryId(navigation);
    if (initial) setInternalSelectedId(initial);
  }, [controlled, navigation, selectedId, defaultOperation, deepLinking]);

  useEffect(() => {
    if (!navigation || navigation.servers.some((server) => server.url === selectedRootServerUrl))
      return;

    const initial = navigation.servers[0]?.url ?? null;
    if (initial) setSelectedRootServerUrl(initial);
  }, [navigation, selectedRootServerUrl]);

  useEffect(() => {
    if (controlled || !deepLinking) return;

    function onHashChange(): void {
      setInternalSelectedId(currentHashId());
    }

    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, [controlled, deepLinking]);

  function selectOperation(id: string): void {
    onOperationChange?.(id);

    if (controlled) return;

    setInternalSelectedId(id);
    if (deepLinking) window.location.hash = id;
  }

  function toggleOperation(groupId: string, id: string): void {
    const key = `${groupId}:${id}`;

    if (id === selectedId && groupId === activeGroupId && collapsedOperationKey !== key) {
      setCollapsedOperationKey(key);

      return;
    }

    setCollapsedOperationKey(null);
    setSelectedGroupId(groupId);
    selectOperation(id);
  }

  function selectServer(url: string): void {
    if (!activeOperationId || activeOperation?.usesRootServers !== false) {
      setSelectedRootServerUrl(url);

      return;
    }

    setSelectedOperationServerUrls((current) => ({ ...current, [activeOperationId]: url }));
  }

  function selectedServerUrlFor(operationId: string): string | null {
    const parsedOperation = parseOperation(spec, operationId);
    if (!parsedOperation) return selectedRootServerUrl;

    const selectedServerUrl = parsedOperation.usesRootServers
      ? selectedRootServerUrl
      : (selectedOperationServerUrls[operationId] ?? null);

    return parseOperation(spec, operationId, selectedServerUrl)?.serverUrl ?? selectedRootServerUrl;
  }

  if (loading) {
    return <div className="p-6 text-base text-lt-muted-fg">Loading API reference…</div>;
  }

  if (error) {
    return <div className="p-6 text-base text-lt-danger">{error}</div>;
  }

  if (!spec || !navigation) {
    return <div className="p-6 text-base text-lt-muted-fg">No API specification provided.</div>;
  }

  const header = (
    <>
      {!hideHeader ? <InfoHeader title={title} info={navigation.info} /> : null}
      {activeOperation && !hideBaseUrl ? (
        <div className="border-b border-lt-border py-3">
          <ServerPicker
            servers={activeOperation.servers}
            selectedServerUrl={activeOperation.serverUrl}
            onServerChange={selectServer}
          />
        </div>
      ) : null}
    </>
  );

  if (operation) {
    return (
      <div className="flex w-full text-base">
        <div className="flex min-w-0 flex-1 flex-col">
          {header}
          <OperationView
            key={operation}
            spec={spec}
            operationId={operation}
            baseUrl={selectedServerUrlFor(operation)}
            token={token}
            remoteTokens={remoteTokens}
            resolveAccessToken={resolveAccessToken}
            expandDepth={expandDepth}
            twoColumnBreakpoint={twoColumnBreakpoint}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 w-full flex-col text-base">
      {header}
      <div className="flex flex-col gap-8 py-6">
        {navigation.groups.map((group) => (
          <section key={group.id} aria-labelledby={`api-reference-tag-${group.id}`}>
            <h2 id={`api-reference-tag-${group.id}`} className="mb-3 font-semibold text-lt-fg">
              {group.title}
            </h2>
            <div className="overflow-hidden rounded-lt border border-lt-border">
              {group.operationIds.map((id) => {
                const summary = navigation.summaries[id];
                if (!summary) return null;

                const operationKey = `${group.id}:${id}`;
                const isOpen =
                  id === selectedId &&
                  group.id === activeGroupId &&
                  collapsedOperationKey !== operationKey;
                const contentId = `api-reference-operation-${group.id}-${id}`;
                const serverUrl = selectedServerUrlFor(id);
                const url = operationUrl(serverUrl, summary.path);
                const parsedOperation = parseOperation(spec, id, serverUrl);
                const markdown = parsedOperation
                  ? operationToMarkdown(parsedOperation, components)
                  : "";

                return (
                  <div key={id} className="border-b border-lt-border last:border-b-0">
                    <div className="relative bg-lt-muted">
                      <div className="@container pointer-events-none relative z-10 flex items-center gap-2 px-4 py-3">
                        <Icon
                          name="chevron-down"
                          className={`size-lt-icon-xs shrink-0 text-lt-muted-fg transition-transform${isOpen ? "" : " -rotate-90"}`}
                        />
                        <Badge color={httpMethodColor(summary.method)} className="text-xs">
                          {summary.method}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <span className="block font-medium text-lt-fg">{summary.title}</span>
                          <div className="flex items-center gap-1">
                            <span className="min-w-0 break-words font-mono text-xs text-lt-muted-fg">
                              {url}
                            </span>
                            <CopyButton
                              value={url}
                              label={`${summary.title} URL`}
                              iconOnly
                              className="pointer-events-auto size-7 shrink-0"
                            />
                          </div>
                        </div>
                        <CopyButton
                          value={markdown}
                          label={`${summary.title} as Markdown`}
                          testId={`copy-${id}-markdown`}
                          className="pointer-events-auto shrink-0"
                        >
                          <span className="hidden @3xl:inline">Copy as Markdown</span>
                        </CopyButton>
                      </div>
                      <button
                        type="button"
                        aria-label={summary.title}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        onClick={() => toggleOperation(group.id, id)}
                        className="absolute inset-0 z-0 cursor-pointer transition-colors hover:bg-lt-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lt-ring"
                      />
                    </div>
                    {isOpen ? (
                      <div id={contentId}>
                        <OperationView
                          key={id}
                          spec={spec}
                          operationId={id}
                          baseUrl={selectedServerUrlFor(id)}
                          token={token}
                          remoteTokens={remoteTokens}
                          resolveAccessToken={resolveAccessToken}
                          expandDepth={expandDepth}
                          twoColumnBreakpoint={twoColumnBreakpoint}
                          hideHeaderIdentity
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
