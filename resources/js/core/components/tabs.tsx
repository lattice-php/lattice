import { router } from "@inertiajs/react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import type { Tab } from "@lattice-php/lattice/types/generated";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";

type TabsContextValue = {
  activeValue: string;
  setActiveValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);

  if (!context) {
    return {
      activeValue: "",
      setActiveValue: () => {},
    };
  }

  return context;
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
  const { t } = useT("lattice");
  const tabs = useMemo(() => getTabs(node), [node]);
  const firstValue = tabs[0]?.value ?? "";
  const queryKey = node.props.queryKey;
  const orientation = node.props.orientation;
  const isVertical = orientation === "vertical";
  const serverActiveValue = node.props.activeValue;
  const defaultValue = node.props.defaultValue ?? firstValue;
  const tablistRef = useRef<HTMLDivElement>(null);
  const [activeValue, setActiveTabValue] = useState(
    () => serverActiveValue || (queryValue(queryKey, tabs) ?? defaultValue) || firstValue,
  );

  function selectTab(tab: TabItem): void {
    if (tab.confirm?.required) {
      router.visit(queryUrl(queryKey, tab.value), {
        preserveScroll: true,
      });

      return;
    }

    setActiveTabValue(tab.value);
    replaceQueryValue(queryKey, tab.value);
  }

  function selectTabValue(value: string): void {
    const tab = tabs.find((item) => item.value === value);

    if (tab) {
      selectTab(tab);
    }
  }

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
    <TabsContext.Provider value={{ activeValue, setActiveValue: selectTabValue }}>
      <div
        className={cn("gap-6", isVertical ? "flex" : "grid")}
        data-lattice-tabs={node.key ?? node.id}
      >
        <div
          aria-label={t("a11y.tabs", "Tabs")}
          aria-orientation={orientation}
          className={cn(
            "gap-1 rounded-lt bg-lt-muted p-1",
            isVertical ? "flex flex-col" : "inline-flex w-fit max-w-full overflow-x-auto",
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
                  "whitespace-nowrap rounded-lt-sm px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-lt-bg text-lt-fg shadow-lt-xs"
                    : "text-lt-muted-fg hover:bg-lt-bg/60 hover:text-lt-fg",
                  isVertical && "text-left",
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

        <div className={cn("min-w-0", isVertical && "flex-1")}>{children}</div>
      </div>
    </TabsContext.Provider>
  );
};

const TabComponent: RendererComponent<"tab"> = ({ children, node }) => {
  const { activeValue } = useTabsContext();
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
      aria-labelledby={`${value}-tab`}
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
