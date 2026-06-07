import { describe, expect, it } from "vitest";
import { actionComponents } from "./action";
import { authComponents } from "./auth";
import { formComponents } from "./form";
import { tableComponents } from "./table";
import { latticeRegistry } from "./index";

describe("lattice component registry", () => {
  it("keeps visual primitives eager to avoid suspense flicker", () => {
    expect(latticeRegistry.badge?.mode).toBe("eager");
    expect(latticeRegistry.card?.mode).toBe("eager");
    expect(latticeRegistry.grid?.mode).toBe("eager");
    expect(latticeRegistry.link?.mode).toBe("eager");
    expect(latticeRegistry.tab?.mode).toBe("eager");
    expect(latticeRegistry.tabs?.mode).toBe("eager");
  });

  it("keeps interactive primitives in lazy chunks", () => {
    const form = latticeRegistry.form;

    expect(form).toMatchObject({
      mode: "lazy",
      fallback: expect.any(Function),
    });

    expect(latticeRegistry.action?.mode).toBe("lazy");
    expect(latticeRegistry["auth.passkey-verify"]?.mode).toBe("lazy");
    expect(latticeRegistry["auth.two-factor-challenge-form"]?.mode).toBe("lazy");
    expect(latticeRegistry["form.checkbox"]?.mode).toBe("lazy");
    expect(latticeRegistry["form.hidden-input"]?.mode).toBe("lazy");
    expect(latticeRegistry["form.password-input"]?.mode).toBe("lazy");
    expect(latticeRegistry["form.submit-button"]?.mode).toBe("lazy");
    expect(latticeRegistry["form.text-input"]?.mode).toBe("lazy");
    expect(latticeRegistry.table?.mode).toBe("lazy");
  });

  it("keeps action form and table components in separate registries", () => {
    expect(actionComponents.name).toBe("lattice/action");
    expect(authComponents.name).toBe("lattice/auth");
    expect(formComponents.name).toBe("lattice/form");
    expect(tableComponents.name).toBe("lattice/table");
  });
});
