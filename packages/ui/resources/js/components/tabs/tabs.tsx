import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentProps, KeyboardEvent, ReactElement, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { useMediaQuery } from "../../lib/use-media-query";
import { NativeSelect } from "../../native-select";
import { pillClassName } from "../../pill";

export type TabsAlignment = "start" | "center" | "end" | "stretch";
export type TabsOrientation = "horizontal" | "vertical";

export type TabsItem = {
  label: ReactNode;
  selectLabel?: string;
  value: string;
};

export type TabsProps = Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  alignment?: TabsAlignment;
  children?: ReactNode;
  defaultValue?: string;
  items?: readonly TabsItem[];
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  value?: string;
};

export type TabProps = Omit<ComponentProps<"section">, "children" | "title"> & {
  children?: ReactNode;
  label: ReactNode;
  selectLabel?: string;
  value: string;
};

type TabsContextValue = {
  activeValue: string;
  hasTablist: boolean;
};

type TabElement = ReactElement<TabProps, typeof Tab>;

const TabsContext = createContext<TabsContextValue | null>(null);
const SELECT_COLLAPSE_THRESHOLD = 3;

function useTabsContext(): TabsContextValue {
  return useContext(TabsContext) ?? { activeValue: "", hasTablist: true };
}

export function Tabs({
  "aria-label": ariaLabel = "Tabs",
  alignment = "stretch",
  children,
  className,
  defaultValue,
  items,
  onValueChange,
  orientation = "horizontal",
  value,
  ...props
}: TabsProps) {
  const tabElements = collectTabs(children);
  const tabItems = items ?? tabElements.map(({ props: tab }) => tab);
  const firstValue = tabItems[0]?.value ?? "";
  const [uncontrolledValue, setUncontrolledValue] = useState(() => defaultValue || firstValue);
  const activeValue = value ?? uncontrolledValue;
  const tablistRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === "vertical";
  const isStretched = !isVertical && alignment === "stretch";
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const collapseToSelect =
    !isDesktop && (isVertical || tabItems.length > SELECT_COLLAPSE_THRESHOLD);
  const contextValue = useMemo(
    () => ({ activeValue, hasTablist: !collapseToSelect }),
    [activeValue, collapseToSelect],
  );

  function selectTab(nextValue: string): void {
    if (!tabItems.some((tab) => tab.value === nextValue)) {
      return;
    }

    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  function onTablistKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";

    if (
      event.key !== nextKey &&
      event.key !== previousKey &&
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
        {...props}
        className={cn(
          "gap-6",
          isVertical && !collapseToSelect
            ? cn("flex", alignment === "end" && "flex-row-reverse")
            : "grid",
          className,
        )}
      >
        {collapseToSelect ? (
          <NativeSelect
            aria-label={ariaLabel}
            data-test="tabs-select"
            onChange={(event) => selectTab(event.target.value)}
            value={activeValue}
          >
            {tabItems.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.selectLabel ?? tabLabelText(tab.label, tab.value)}
              </option>
            ))}
          </NativeSelect>
        ) : (
          <div
            aria-label={ariaLabel}
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
            {tabItems.map((tab) => {
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
                  onClick={() => selectTab(tab.value)}
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
}

export function Tab({
  "aria-label": ariaLabel,
  children,
  className,
  label,
  selectLabel,
  value,
  ...props
}: TabProps) {
  const { activeValue, hasTablist } = useTabsContext();
  const isActive = activeValue === value;
  const [hasOpened, setHasOpened] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setHasOpened(true);
    }
  }, [isActive]);

  return (
    <section
      {...props}
      aria-label={hasTablist ? undefined : (ariaLabel ?? selectLabel ?? tabLabelText(label, value))}
      aria-labelledby={hasTablist ? `${value}-tab` : undefined}
      className={cn("space-y-8", !isActive && "hidden", className)}
      hidden={!isActive}
      id={`${value}-panel`}
      role="tabpanel"
      tabIndex={0}
    >
      {hasOpened ? children : null}
    </section>
  );
}

function collectTabs(children: ReactNode): TabElement[] {
  const tabs: TabElement[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    if (child.type === Tab) {
      tabs.push(child as TabElement);
      return;
    }

    if (child.type === Fragment) {
      tabs.push(...collectTabs((child.props as { children?: ReactNode }).children));
    }
  });

  return tabs;
}

function tabLabelText(label: ReactNode, fallback: string): string {
  if (typeof label === "string" || typeof label === "number" || typeof label === "bigint") {
    return String(label);
  }

  if (isValidElement<{ children?: ReactNode }>(label)) {
    return tabLabelText(label.props.children, fallback);
  }

  if (Array.isArray(label)) {
    const text = label.map((part) => tabLabelText(part, "")).join("");
    return text || fallback;
  }

  return fallback;
}

function verticalTabClassName(active: boolean): string {
  return cn(
    "relative rounded-lt-sm px-3 py-2.5 text-left text-sm font-medium transition-colors",
    active
      ? "bg-lt-muted text-lt-fg before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-lt-primary"
      : "text-lt-muted-fg hover:bg-lt-muted/60 hover:text-lt-fg",
  );
}
