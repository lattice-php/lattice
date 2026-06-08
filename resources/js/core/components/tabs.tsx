import { router } from "@inertiajs/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getStringProp } from "@lattice/core/props";
import type { Node, RendererComponent } from "@lattice/core/types";
import { cn } from "@lattice/lib/utils";

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
  return (node.children ?? [])
    .filter((child) => child.type === "tab")
    .map((child) => ({
      confirm: getConfirmationProp(child.props),
      label: getStringProp(child.props, "label"),
      value: getStringProp(child.props, "value"),
    }))
    .filter((tab) => tab.value !== "");
}

function getConfirmationProp(props: Node["props"]): TabItem["confirm"] {
  const confirm = props?.confirm;

  if (!confirm || typeof confirm !== "object" || Array.isArray(confirm)) {
    return undefined;
  }

  const confirmation = confirm as Record<string, unknown>;

  return {
    required: confirmation.required === true,
  };
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

declare module "@lattice/core/types" {
  interface ComponentProps {
    tab: {
      confirm?: {
        redirectUrl?: string;
        required?: boolean;
        timeout?: number;
      };
      label?: string;
      value?: string;
    };
    tabs: {
      activeValue?: string;
      defaultValue?: string;
      queryKey?: string;
    };
  }
}

export const TabsComponent: RendererComponent<"tabs"> = ({ children, node }) => {
  const tabs = useMemo(() => getTabs(node), [node]);
  const firstValue = tabs[0]?.value ?? "";
  const queryKey = getStringProp(node.props, "queryKey", "tabs");
  const serverActiveValue = getStringProp(node.props, "activeValue", "");
  const defaultValue = getStringProp(node.props, "defaultValue", firstValue);
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

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue: selectTabValue }}>
      <div className="grid gap-6" data-lattice-tabs={node.key ?? node.id}>
        <div
          aria-label={getStringProp(node.props, "label", "Tabs")}
          className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = activeValue === tab.value;

            return (
              <button
                aria-controls={`${tab.value}-panel`}
                aria-selected={isActive}
                className={cn(
                  "whitespace-nowrap rounded-lt-sm px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-lt-bg text-lt-fg shadow-xs"
                    : "text-lt-muted-fg hover:bg-lt-bg/60 hover:text-lt-fg",
                )}
                id={`${tab.value}-tab`}
                key={tab.value}
                onClick={() => selectTab(tab)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </TabsContext.Provider>
  );
};

const TabComponent: RendererComponent<"tab"> = ({ children, node }) => {
  const { activeValue } = useTabsContext();
  const value = getStringProp(node.props, "value");
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
