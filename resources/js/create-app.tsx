import type { Page as InertiaPage, VisitOptions } from "@inertiajs/core";
import { createInertiaApp } from "@inertiajs/react";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { initializeTheme } from "./appearance";
import { extendRegistry, type Plugin, type Registry } from "./core/registry";
import { setDefaultRegistry } from "./core/registry-context";
import type { SpriteValue } from "./icons/sprite";
import { LocaleReload } from "./i18n/locale-reload";
import { i18nConfigFromPageProps } from "./i18n/shared-props";
import {
  createLayoutResolver,
  createPageResolver,
  withVisitHeaders,
  type CreateLayoutResolverOptions,
  type PageModules,
} from "./inertia";
import { ProviderBase } from "./provider-base";
import { registry as defaultRegistry } from "./registry";

type InertiaAppOptions = NonNullable<Parameters<typeof createInertiaApp>[0]>;

export type CreateLatticeAppI18nOptions = {
  /** i18next namespaces to load, e.g. `["lattice", "app"]`. Defaults to the package's own. */
  namespaces?: string[];
};

export type CreateLatticeAppOptions = Omit<
  InertiaAppOptions,
  "resolve" | "layout" | "setup" | "withApp" | "pages"
> & {
  registry?: Registry;
  /**
   * Component-package plugins to merge onto the registry — pass the
   * Composer-discovered `virtual:lattice/plugins` here to register vendor
   * components with no manual `extendRegistry` call.
   */
  plugins?: Plugin[];
  sprite?: SpriteValue;
  /** Normal Inertia page modules, e.g. `import.meta.glob('./pages/**\/*.tsx')`. */
  pages?: PageModules;
  defaultLayout?: CreateLayoutResolverOptions["defaultLayout"];
  /**
   * Lattice's i18n bootstrap, on by default: when the backend shares the
   * `lattice.i18n` prop, the first render waits for the translation setup (no
   * flash of untranslated fallbacks), `LocaleReload` re-fetches the page after
   * a locale switch, and every visit carries the locale/timezone headers. The
   * i18next chunk only loads when the backend actually shares the prop. Pass
   * `false` to opt out entirely.
   */
  i18n?: CreateLatticeAppI18nOptions | false;
  /**
   * App bootstrap that needs the initial page — e.g. `configureEcho` from a
   * shared connection prop. Runs on the client before the first render; a
   * returned promise delays that render until it resolves.
   */
  boot?: (context: { page: InertiaPage }) => void | Promise<void>;
  /**
   * Compose providers or siblings around the app. Applied inside the Lattice
   * Provider, so the registry, sprite, and toaster contexts are available.
   */
  wrap?: (app: ReactElement) => ReactElement;
};

// Fail-open: a failed bootstrap renders the app anyway (with fallback strings)
// rather than a blank page.
function AwaitReady({ ready, children }: { ready: Promise<unknown>; children: ReactNode }) {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const reveal = (): void => {
      if (active) {
        setReady(true);
      }
    };

    void ready.then(reveal, reveal);

    return () => {
      active = false;
    };
  }, [ready]);

  return isReady ? children : null;
}

/**
 * Bootstrap an Inertia app with the Lattice shell: the page/layout resolvers
 * (server-driven Lattice pages and normal Inertia pages alike), the Provider —
 * registry, sprite, flash toasts via Lattice's own Toaster — theme
 * initialization, and the i18n bootstrap. Forwards any other createInertiaApp
 * option.
 */
export function createLatticeApp({
  registry,
  plugins,
  sprite,
  pages = {},
  defaultLayout,
  strictMode = true,
  i18n,
  boot,
  wrap,
  ...inertiaOptions
}: CreateLatticeAppOptions = {}) {
  const baseRegistry = registry ?? defaultRegistry;
  const activeRegistry =
    plugins && plugins.length > 0 ? extendRegistry(baseRegistry, ...plugins) : baseRegistry;

  setDefaultRegistry(activeRegistry);

  const i18nEnabled = i18n !== false;
  const userVisitOptions = inertiaOptions.defaults?.visitOptions;
  const defaults = i18nEnabled
    ? {
        ...inertiaOptions.defaults,
        visitOptions: (href: string, options: VisitOptions): VisitOptions =>
          withVisitHeaders(href, userVisitOptions?.(href, options) ?? options),
      }
    : inertiaOptions.defaults;

  const app = createInertiaApp({
    ...inertiaOptions,
    defaults,
    strictMode,
    resolve: createPageResolver(pages),
    layout: createLayoutResolver({ defaultLayout }),
    withApp: (node: ReactElement, { ssr, page }: { ssr: boolean; page: InertiaPage }) => {
      const pending: Promise<unknown>[] = [];

      if (!ssr) {
        // Loaded on demand so apps without the shared i18n prop never ship the
        // i18next backend; the disabled-config call still stores the timezone.
        if (i18nEnabled && i18nConfigFromPageProps(page.props) !== undefined) {
          pending.push(
            import("./i18n/page-props").then((module) =>
              module.configureI18nFromPageProps(page.props, i18n ?? {}),
            ),
          );
        }

        const booted = boot?.({ page });

        if (booted) {
          pending.push(booted);
        }
      }

      const inner = (
        <>
          {node}
          {i18nEnabled ? <LocaleReload /> : null}
        </>
      );

      // The whole shell waits, not just the page: anything rendering a
      // translated string (the Toaster included) would otherwise initialize
      // i18next before the backend can register — init runs exactly once,
      // first caller wins.
      const shell = (
        <ProviderBase registry={activeRegistry} sprite={sprite}>
          {wrap ? wrap(inner) : inner}
        </ProviderBase>
      );

      return pending.length > 0 ? (
        <AwaitReady ready={Promise.all(pending)}>{shell}</AwaitReady>
      ) : (
        shell
      );
    },
  });

  initializeTheme();

  return app;
}
