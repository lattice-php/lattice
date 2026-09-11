import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnPropsOf } from "@lattice-php/table/types";
import { col } from "../../test-support";
import { BadgeCell } from "./badge-cell";

describe("BadgeCell", () => {
  it("renders one badge per list item with its option label and colour", () => {
    const column = col({
      key: "grant_types",
      label: "Grant types",
      type: "column.badge",
      props: {
        colors: { client_credentials: "#7c3aed" },
        options: [
          { label: "Client credentials", value: "client_credentials" },
          { label: "Device code", value: "device_code" },
        ],
      },
    });

    render(
      <BadgeCell
        column={column}
        props={column.props as ColumnPropsOf<"column.badge">}
        row={{}}
        value={["client_credentials", "device_code"]}
      />,
    );

    expect(screen.getByText("Client credentials").style.getPropertyValue("--lt-tone-fg")).toBe(
      "#7c3aed",
    );
    expect(screen.getByText("Device code")).toBeInTheDocument();
  });
});
