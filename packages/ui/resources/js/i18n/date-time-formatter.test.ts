import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ensureI18n, i18n, translate } from "./instance";
import { setTimezone } from "./timezone";

const namespace = "date-time-formatter-test";
const key = "subscription-ends";
const iso = "2026-03-06T00:00:00+00:00";

function addBundles(format: string): void {
  for (const locale of ["en", "de"]) {
    if (i18n.hasResourceBundle(locale, namespace)) {
      i18n.removeResourceBundle(locale, namespace);
    }
  }

  i18n.addResourceBundle(
    "en",
    namespace,
    { [key]: `Your subscription ends on {{date, ${format}}}` },
    true,
    true,
  );
  i18n.addResourceBundle(
    "de",
    namespace,
    { [key]: `Ihr Abonnement endet am {{date, ${format}}}` },
    true,
    true,
  );
}

describe("datetime formatter", () => {
  beforeEach(async () => {
    await ensureI18n();
    setTimezone("UTC");
    addBundles("datetime(dateStyle: long)");
    await i18n.changeLanguage("en");
  });

  afterEach(() => {
    setTimezone("");
  });

  it("formats an ISO string in the reader's locale", async () => {
    const english = translate(namespace, key, key, { date: iso });
    expect(english).toBe("Your subscription ends on March 6, 2026");

    await i18n.changeLanguage("de");
    const german = translate(namespace, key, key, { date: iso });
    expect(german).toBe("Ihr Abonnement endet am 6. März 2026");

    expect(english).not.toBe(german);
  });

  it("still formats a Date instance", () => {
    expect(translate(namespace, key, key, { date: new Date(iso) })).toBe(
      "Your subscription ends on March 6, 2026",
    );
  });

  it("degrades an unparseable string to its raw value instead of throwing", () => {
    expect(() => translate(namespace, key, key, { date: "not-a-date" })).not.toThrow();
    expect(translate(namespace, key, key, { date: "not-a-date" })).toBe(
      "Your subscription ends on not-a-date",
    );
  });

  it("degrades an already-invalid Date instance to the literal 'Invalid Date'", () => {
    const invalid = new Date("nonsense");

    expect(() => translate(namespace, key, key, { date: invalid })).not.toThrow();
    expect(translate(namespace, key, key, { date: invalid })).toBe(
      "Your subscription ends on Invalid Date",
    );
  });

  it("formats in Lattice's currentTimezone(), not the host's local zone", () => {
    setTimezone("America/New_York");

    expect(translate(namespace, key, key, { date: iso })).toBe(
      "Your subscription ends on March 5, 2026",
    );
  });

  it("lets an explicit timeZone in the translation string's format options override currentTimezone()", () => {
    addBundles("datetime(dateStyle: long; timeZone: 'America/New_York')");

    expect(translate(namespace, key, key, { date: iso })).toBe(
      "Your subscription ends on March 5, 2026",
    );
  });
});
