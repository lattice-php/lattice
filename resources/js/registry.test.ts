import { describe, expect, it } from "vitest";
import { actionComponents } from "./action/plugin";
import { chatComponents } from "./chat/plugin";
import { formComponents } from "./form/plugin";
import { notificationsComponents } from "./notifications/plugin";
import { registry } from "./registry";
import { tableComponents } from "./table/plugin";
import { uiComponents } from "./ui/plugin";

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
    expect(uiComponents.name).toBe("lattice/ui");
    expect(formComponents.name).toBe("lattice/form");
    expect(tableComponents.name).toBe("lattice/table");
    expect(chatComponents.name).toBe("lattice/chat");
    expect(notificationsComponents.name).toBe("lattice/notifications");
  });
});
