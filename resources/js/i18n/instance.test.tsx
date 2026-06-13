import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { i18n, translate, useT } from "./instance";

const namespace = "test";

function Greeting() {
  const { t } = useT(namespace);

  return <span>{t("greeting", "Hello")}</span>;
}

describe("i18n instance", () => {
  beforeEach(() => {
    if (i18n.isInitialized && i18n.hasResourceBundle("en", namespace)) {
      i18n.removeResourceBundle("en", namespace);
    }
  });

  it("returns inline defaults without the React i18next adapter", () => {
    render(<Greeting />);

    expect(screen.getByText("Hello")).toBeVisible();
    expect(translate(namespace, "greeting", "Hello")).toBe("Hello");
  });

  it("rerenders hook consumers when resources change", async () => {
    render(<Greeting />);

    expect(screen.getByText("Hello")).toBeVisible();

    await waitFor(() => expect(i18n.isInitialized).toBe(true));

    act(() => {
      i18n.addResourceBundle("en", namespace, { greeting: "Hallo" }, true, true);
    });

    expect(await screen.findByText("Hallo")).toBeVisible();
  });
});
