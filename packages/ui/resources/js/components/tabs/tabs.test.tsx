import { fireEvent, render, screen } from "@testing-library/react";
import { stubMatchMedia } from "@lattice-php/core/test-support";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tab, Tabs } from "./tabs";

describe("Tabs", () => {
  beforeEach(() => stubMatchMedia(true));

  it("switches client panels and mounts their content lazily", () => {
    render(
      <Tabs defaultValue="overview">
        <Tab label={<span>Overview</span>} value="overview">
          Overview panel
        </Tab>
        <Tab label={<span>Details</span>} value="details">
          Details panel
        </Tab>
      </Tabs>,
    );

    expect(screen.getByText("Overview panel")).toBeVisible();
    expect(screen.queryByText("Details panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Details" }));

    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Details panel")).toBeVisible();
    expect(screen.getByText("Overview panel")).not.toBeVisible();
  });

  it("reports changes without mutating controlled selection", () => {
    const onValueChange = vi.fn();

    render(
      <Tabs onValueChange={onValueChange} value="overview">
        <Tab label="Overview" value="overview">
          Overview panel
        </Tab>
        <Tab label="Details" value="details">
          Details panel
        </Tab>
      </Tabs>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Details" }));

    expect(onValueChange).toHaveBeenCalledWith("details");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Overview panel")).toBeVisible();
  });

  it("pins a sticky vertical rail below the published sticky offset", () => {
    render(
      <Tabs defaultValue="overview" orientation="vertical" sticky>
        <Tab label="Overview" value="overview" />
        <Tab label="Details" value="details" />
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toHaveClass(
      "sticky top-[calc(var(--lt-sticky-offset)+--spacing(6))]",
    );
  });

  it("keeps a horizontal strip in flow even when sticky is requested", () => {
    render(
      <Tabs defaultValue="overview" sticky>
        <Tab label="Overview" value="overview" />
        <Tab label="Details" value="details" />
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).not.toHaveClass("sticky");
  });

  it("roves focus with orientation-aware keyboard navigation", () => {
    render(
      <Tabs defaultValue="overview" orientation="vertical">
        <Tab label="Overview" value="overview" />
        <Tab label="Details" value="details" />
        <Tab label="History" value="history" />
      </Tabs>,
    );
    const overview = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });
    const history = screen.getByRole("tab", { name: "History" });

    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowDown" });
    expect(details).toHaveFocus();

    fireEvent.keyDown(details, { key: "End" });
    expect(history).toHaveFocus();

    fireEvent.keyDown(history, { key: "Home" });
    expect(overview).toHaveFocus();

    fireEvent.keyDown(overview, { key: "ArrowRight" });
    expect(overview).toHaveFocus();
  });
});
