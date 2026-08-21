import { useCallback, useMemo, useState } from "react";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { Node, RendererComponent } from "@lattice-php/core/types";
import type { Tab as WireTab } from "../../generated";
import { UI_NAMESPACE, useT } from "../../i18n";
import { useNavigation } from "../../navigation";
import { Tab, Tabs } from "./tabs";

export const TabsAdapter: RendererComponent<"tabs"> = ({ children, node }) => {
  const { t } = useT(UI_NAMESPACE);
  const tabs = useMemo(() => getTabs(node), [node]);
  const firstValue = tabs[0]?.value ?? "";
  const queryKey = node.props.queryKey;
  const { visit } = useNavigation();
  const serverActiveValue = node.props.activeValue;
  const defaultValue = node.props.defaultValue ?? firstValue;
  const [activeValue, setActiveValue] = useState(
    () => serverActiveValue || (queryValue(queryKey, tabs) ?? defaultValue) || firstValue,
  );

  const selectTab = useCallback(
    (value: string): void => {
      const tab = tabs.find((item) => item.value === value);

      if (!tab) {
        return;
      }

      if (tab.confirm?.required) {
        visit(queryUrl(queryKey, value), { preserveScroll: true });
        return;
      }

      setActiveValue(value);
      replaceQueryValue(queryKey, value);
    },
    [queryKey, tabs, visit],
  );

  return (
    <Tabs
      aria-label={t("common.tabs", "Tabs")}
      alignment={node.props.alignment}
      data-lattice-component={nodeIdentity(node)}
      items={tabs.map((tab) => ({ label: tab.label, value: tab.value }))}
      onValueChange={selectTab}
      orientation={node.props.orientation}
      sticky={node.props.sticky}
      value={activeValue}
    >
      {children}
    </Tabs>
  );
};

const TabAdapter: RendererComponent<"tab"> = ({ children, node }) => (
  <Tab label={node.props.label} value={node.props.value}>
    {children}
  </Tab>
);

function getTabs(node: Node): WireTab[] {
  return (node.schema ?? [])
    .filter((child) => child.type === "tab")
    .map((child) => child.props as WireTab)
    .filter((tab) => tab.value !== "");
}

function queryValue(queryKey: string, tabs: WireTab[]): string | null {
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

export default TabAdapter;
