import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getStringProp } from "@/lattice/core/props";
import type { LatticeNode, LatticeRendererComponent } from "@/lattice/core/types";
import { cn } from "@/lib/utils";

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

function getTabs(node: LatticeNode): Array<{ label: string; value: string }> {
  return (node.children ?? [])
    .filter((child) => child.type === "tab")
    .map((child) => ({
      label: getStringProp(child.props, "label"),
      value: getStringProp(child.props, "value"),
    }))
    .filter((tab) => tab.value !== "");
}

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    tab: {
      label?: string;
      value?: string;
    };
    tabs: {
      defaultValue?: string;
    };
  }
}

export const TabsComponent: LatticeRendererComponent<"tabs"> = ({ children, node }) => {
  const tabs = useMemo(() => getTabs(node), [node]);
  const firstValue = tabs[0]?.value ?? "";
  const defaultValue = getStringProp(node.props, "defaultValue", firstValue);
  const [activeValue, setActiveValue] = useState(defaultValue || firstValue);

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className="grid gap-6" data-lattice-tabs={node.key ?? node.id}>
        <div
          aria-label={getStringProp(node.props, "label", "Tabs")}
          className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = activeValue === tab.value;

            return (
              <button
                aria-controls={`${tab.value}-panel`}
                aria-selected={isActive}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
                id={`${tab.value}-tab`}
                key={tab.value}
                onClick={() => setActiveValue(tab.value)}
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

const TabComponent: LatticeRendererComponent<"tab"> = ({ children, node }) => {
  const { activeValue } = useTabsContext();
  const value = getStringProp(node.props, "value");
  const isActive = activeValue === value;

  return (
    <section
      aria-labelledby={`${value}-tab`}
      className={cn("space-y-8", !isActive && "hidden")}
      hidden={!isActive}
      id={`${value}-panel`}
      role="tabpanel"
      tabIndex={0}
    >
      {children as ReactNode}
    </section>
  );
};

export default TabComponent;
