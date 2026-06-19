import { describe, expect, it } from "vitest";
import { actionComponents } from "./action";
import { formComponents } from "./form";
import { tableComponents } from "./table";
import { registry } from "./index";

describe("lattice component registry", () => {
  it("keeps visual primitives eager to avoid suspense flicker", () => {
    expect(registry.components.action?.mode).toBe("eager");
    expect(registry.components["action.group"]?.mode).toBe("eager");
    expect(registry.components.badge?.mode).toBe("eager");
    expect(registry.components.card?.mode).toBe("eager");
    expect(registry.components["floating-panel"]?.mode).toBe("eager");
    expect(registry.components.grid?.mode).toBe("eager");
    expect(registry.components.link?.mode).toBe("eager");
    expect(registry.components.tab?.mode).toBe("eager");
    expect(registry.components.tabs?.mode).toBe("eager");
  });

  it("keeps larger interactive primitives in lazy chunks", () => {
    const form = registry.components.form;

    expect(form).toMatchObject({
      mode: "lazy",
      fallback: expect.any(Function),
    });

    expect(registry.components["field.checkbox"]?.mode).toBe("lazy");
    expect(registry.components["field.hidden-input"]?.mode).toBe("lazy");
    expect(registry.components["field.password-input"]?.mode).toBe("lazy");
    expect(registry.components["field.text-input"]?.mode).toBe("lazy");
    expect(registry.components["field.toggle"]?.mode).toBe("lazy");
    expect(registry.components.table?.mode).toBe("lazy");
  });

  it("keeps action form and table components in separate registries", () => {
    expect(actionComponents.name).toBe("lattice/action");
    expect(formComponents.name).toBe("lattice/form");
    expect(tableComponents.name).toBe("lattice/table");
  });
});
