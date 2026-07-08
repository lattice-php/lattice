import { describe, expect, it } from "vitest";
import { actionComponents } from "./action";
import { chatComponents } from "./chat";
import { formComponents } from "./form";
import { notificationsComponents } from "./notifications";
import { registry } from "./registry";
import { tableComponents } from "./table";

describe("lattice component registry", () => {
  it("registers every domain's components eagerly", () => {
    const types = [
      "badge",
      "link",
      "chart",
      "action",
      "action.group",
      "form",
      "field.text-input",
      "field.rich-editor",
      "field.date-input",
      "table",
      "notifications",
    ] as const;

    for (const type of types) {
      expect(registry.components[type]?.mode).toBe("eager");
    }
  });

  it("names each domain plugin under one namespace", () => {
    expect(actionComponents.name).toBe("lattice/action");
    expect(formComponents.name).toBe("lattice/form");
    expect(tableComponents.name).toBe("lattice/table");
    expect(chatComponents.name).toBe("lattice/chat");
    expect(notificationsComponents.name).toBe("lattice/notifications");
  });
});
