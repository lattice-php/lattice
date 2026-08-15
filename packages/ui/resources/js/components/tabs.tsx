import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { Node, RendererComponent } from "@lattice-php/core/types";
import type { Tab } from "../generated";
import { cn } from "../lib/utils";
import { useMediaQuery } from "../lib/use-media-query";
import { NativeSelect } from "../native-select";
import { useNavigation } from "../navigation";
import { pillClassName } from "../pill";
import { UI_NAMESPACE, useT } from "../i18n";

type TabsContextValue = {
  activeValue: string;
  hasTablist: boolean;
  setActiveValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);

  if (!context) {
    return {
      activeValue: "",
      hasTablist: true,
      setActiveValue: () => {},
    };
  }

  return context;
}

const SELECT_COLLAPSE_THRESHOLD = 3;

function verticalTabClassName(active: boolean): string {
  return cn(
    "relative rounded-lt-sm px-3 py-2.5 text-left text-sm font-medium transition-colors",
    active
      ? "bg-lt-muted text-lt-fg before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-lt-primary"
      : "text-lt-muted-fg hover:bg-lt-muted/60 hover:text-lt-fg",
  );
}

type TabItem = {
  confirm?: {
    required?: boolean;
  };
  label: string;
  value: string;
};

function getTabs(node: Node): TabItem[] {
  return (node.schema ?? [])
    .filter((child) => child.type === "tab")
    .map((child) => {
      const props = child.props as unknown as Tab;

      return {
        confirm: props.confirm ? { required: props.confirm.required } : undefined,
        label: props.label,
        value: props.value,
      };
    })
    .filter((tab) => tab.value !== "");
}

function queryValue(queryKey: string, tabs: Array<{ value: string }>): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = new URLSearchParams(window.location.search).get(queryKey);

  if (!value || !tabs.some((tab) => tab.value === value)) {
    return null;
  }

  return value;
}

function replaceQueryValue(queryKey: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set(queryKey, value);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function queryUrl(queryKey: string, value: string): string {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);
  url.searchParams.set(queryKey, value);

  return `${url.pathname}${url.search}${url.hash}`;
}

export const TabsComponent: RendererComponent<"tabs"> = ({ children, node }) => {
  const { t } = useT(UI_NAMESPACE);
  const tabs = useMemo(() => getTabs(node), [node]);
  const firstValue = tabs[0]?.value ?? "";
  const queryKey = node.props.queryKey;
  const orientation = node.props.orientation;
  const isVertical = orientation === "vertical";
  const alignment = node.props.alignment;
  const isStretched = !isVertical && alignment === "stretch";
  const { visit } = useNavigation();
  const serverActiveValue = node.props.activeValue;
  const defaultValue = node.props.defaultValue ?? firstValue;
  const tablistRef = useRef<HTMLDivElement>(null);
  const [activeValue, setActiveTabValue] = useState(
    () => serverActiveValue || (queryValue(queryKey, tabs) ?? defaultValue) || firstValue,
  );

  const selectTab = useCallback(
    (tab: TabItem): void => {
      if (tab.confirm?.required) {
        visit(queryUrl(queryKey, tab.value), {
          preserveScroll: true,
        });

        return;
      }

      setActiveTabValue(tab.value);
      replaceQueryValue(queryKey, tab.value);
    },
    [queryKey, visit],
  );

  const selectTabValue = useCallback(
    (value: string): void => {
      const tab = tabs.find((item) => item.value === value);

      if (tab) {
        selectTab(tab);
      }
    },
    [selectTab, tabs],
  );

  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  // A side rail cannot work on a phone regardless of tab count, so vertical
  // tabs always collapse below md; horizontal strips only when they overflow.
  const collapseToSelect = !isDesktop && (isVertical || tabs.length > SELECT_COLLAPSE_THRESHOLD);

  const contextValue = useMemo(
    () => ({ activeValue, hasTablist: !collapseToSelect, setActiveValue: selectTabValue }),
    [activeValue, collapseToSelect, selectTabValue],
  );

  function onTablistKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";

    if (
      event.key !== nextKey &&
      event.key !== prevKey &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    const buttons = Array.from(
      tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );

    if (buttons.length === 0) {
      return;
    }

    event.preventDefault();
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);

    let index: number;
    if (event.key === "Home") {
      index = 0;
    } else if (event.key === "End") {
      index = buttons.length - 1;
    } else {
      const delta = event.key === nextKey ? 1 : -1;
      const base = current < 0 ? 0 : current;
      index = (base + delta + buttons.length) % buttons.length;
    }

    buttons[index]?.focus();
  }

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={cn(
          "gap-6",
          isVertical && !collapseToSelect
            ? cn("flex", alignment === "end" && "flex-row-reverse")
            : "grid",
        )}
        data-lattice-tabs={node.key ?? node.id}
      >
        {collapseToSelect ? (
          <NativeSelect
            aria-label={t("common.tabs", "Tabs")}
            data-test="tabs-select"
            onChange={(event) => selectTabValue(event.target.value)}
            value={activeValue}
          >
            {tabs.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </NativeSelect>
        ) : (
          <div
            aria-label={t("common.tabs", "Tabs")}
            aria-orientation={orientation}
            className={cn(
              "gap-1",
              isVertical ? "flex w-44 shrink-0 flex-col self-start" : "rounded-lt bg-lt-muted p-1",
              isStretched && "flex w-full",
              !isVertical &&
                !isStretched &&
                cn("inline-flex w-fit max-w-full overflow-x-auto", {
                  "justify-self-center": alignment === "center",
                  "justify-self-end": alignment === "end",
                }),
            )}
            ref={tablistRef}
            role="tablist"
          >
            {tabs.map((tab) => {
              const isActive = activeValue === tab.value;

              return (
                <button
                  aria-controls={`${tab.value}-panel`}
                  aria-selected={isActive}
                  data-test={`tab-${tab.value}`}
                  className={cn(
                    isVertical ? verticalTabClassName(isActive) : pillClassName(isActive),
                    isStretched && "flex-1",
                  )}
                  id={`${tab.value}-tab`}
                  key={tab.value}
                  onClick={() => selectTab(tab)}
                  onKeyDown={onTablistKeyDown}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        <div className={cn("min-w-0", isVertical && !collapseToSelect && "flex-1")}>{children}</div>
      </div>
    </TabsContext.Provider>
  );
};

const TabComponent: RendererComponent<"tab"> = ({ children, node }) => {
  const { activeValue, hasTablist } = useTabsContext();
  const value = node.props.value;
  const isActive = activeValue === value;
  const [hasOpened, setHasOpened] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setHasOpened(true);
    }
  }, [isActive]);

  return (
    <section
      aria-label={hasTablist ? undefined : node.props.label}
      aria-labelledby={hasTablist ? `${value}-tab` : undefined}
      className={cn("space-y-8", !isActive && "hidden")}
      hidden={!isActive}
      id={`${value}-panel`}
      role="tabpanel"
      tabIndex={0}
    >
      {hasOpened ? (children as ReactNode) : null}
    </section>
  );
};

export default TabComponent;
