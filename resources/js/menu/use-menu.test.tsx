import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMenu } from "./use-menu";

vi.mock("@inertiajs/react", () => ({
  usePage: () => ({
    props: {
      lattice: {
        menus: {
          sidebar: {
            groups: [
              {
                label: "Account",
                items: [
                  {
                    active: true,
                    href: "/settings",
                    icon: "settings",
                    key: "settings.edit",
                    label: "Settings",
                    method: "get",
                  },
                ],
              },
            ],
          },
        },
      },
    },
  }),
}));

describe("useMenu", () => {
  it("returns the menu payload for a location", () => {
    render(<MenuProbe location="sidebar" />);

    expect(screen.getByText("Settings")).toBeVisible();
  });

  it("returns null when the location is missing", () => {
    render(<MenuProbe location="user-menu" />);

    expect(screen.getByText("missing")).toBeVisible();
  });
});

function MenuProbe({ location }: { location: string }) {
  const menu = useMenu(location);

  return <div>{menu?.groups[0]?.items[0]?.label ?? "missing"}</div>;
}
