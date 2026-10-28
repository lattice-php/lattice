import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { mount } from "./browser";

it("mounts the reference into an element and unmounts it again", async () => {
  const element = document.createElement("div");
  document.body.append(element);

  const unmount = mount(element, {
    deepLinking: false,
    spec: {
      openapi: "3.1.0",
      info: { title: "Mounted API", version: "2.0.0" },
      paths: {},
    },
  });

  await expect.element(page.getByRole("heading", { name: "Mounted API", level: 1 })).toBeVisible();

  unmount();

  expect(element.childElementCount).toBe(0);
  element.remove();
});
