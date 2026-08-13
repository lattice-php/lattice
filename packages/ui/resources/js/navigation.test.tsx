import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  defaultNavigation,
  NavigationProvider,
  useNavigation,
  type NavigationAdapter,
} from "./navigation";

function ProbeLink(props: { href: string; method?: "get" | "delete" }) {
  const { Link } = useNavigation();

  return <Link {...props}>Go</Link>;
}

describe("defaultNavigation", () => {
  it("renders links as plain anchors without leaking the method into the DOM", () => {
    render(<ProbeLink href="/somewhere" method="get" />);

    const anchor = screen.getByRole("link", { name: "Go" });
    expect(anchor).toHaveAttribute("href", "/somewhere");
    expect(anchor).not.toHaveAttribute("method");
  });

  it("warns once when a non-GET link renders without an adapter", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <>
        <ProbeLink href="/records/1" method="delete" />
        <ProbeLink href="/records/1" method="delete" />
      </>,
    );

    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("visits and reloads through window.location", () => {
    const assign = vi.fn();
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign, reload });

    defaultNavigation.visit("/next", { preserveScroll: true });
    defaultNavigation.reload();

    expect(assign).toHaveBeenCalledWith("/next");
    expect(reload).toHaveBeenCalledOnce();
  });
});

describe("NavigationProvider", () => {
  it("overrides how links render and visits run", () => {
    const visit = vi.fn();
    const adapter: NavigationAdapter = {
      Link: ({ href, children }) => (
        <button type="button" data-adapter-href={href} onClick={() => visit(href)}>
          {children}
        </button>
      ),
      visit,
      reload: vi.fn(),
    };

    render(
      <NavigationProvider adapter={adapter}>
        <ProbeLink href="/spa" />
      </NavigationProvider>,
    );

    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("data-adapter-href", "/spa");
  });
});
