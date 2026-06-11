import { describe, expect, it } from "vitest";
import { actionComponents } from "./action";
import { formComponents } from "./form";
import { tableComponents } from "./table";
import { registry } from "./index";

describe("lattice component registry", () => {
  it("keeps visual primitives eager to avoid suspense flicker", () => {
    expect(registry.action?.mode).toBe("eager");
    expect(registry["action.group"]?.mode).toBe("eager");
    expect(registry.badge?.mode).toBe("eager");
    expect(registry.card?.mode).toBe("eager");
    expect(registry.grid?.mode).toBe("eager");
    expect(registry.link?.mode).toBe("eager");
    expect(registry.tab?.mode).toBe("eager");
    expect(registry.tabs?.mode).toBe("eager");
  });

  it("keeps larger interactive primitives in lazy chunks", () => {
    const form = registry.form;

    expect(form).toMatchObject({
      mode: "lazy",
      fallback: expect.any(Function),
    });

    expect(registry["form.checkbox"]?.mode).toBe("lazy");
    expect(registry["form.hidden-input"]?.mode).toBe("lazy");
    expect(registry["form.password-input"]?.mode).toBe("lazy");
    expect(registry["form.text-input"]?.mode).toBe("lazy");
    expect(registry.table?.mode).toBe("lazy");
  });

  it("keeps action form and table components in separate registries", () => {
    expect(actionComponents.name).toBe("lattice/action");
    expect(formComponents.name).toBe("lattice/form");
    expect(tableComponents.name).toBe("lattice/table");
  });
});
