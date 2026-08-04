import { i18n as I18nInstance } from 'i18next';
/**
 * i18next's built-in `datetime` formatter throws on a string, and
 * `Translatable::with()` sends dates over the wire as ISO 8601 strings, so
 * coercion to `Date` is required first.
 *
 * Replaces i18next's built-in `datetime` formatter on the shared instance,
 * for every consumer of it — not just Lattice's own translations.
 *
 * Pins the formatter to Lattice's own {@link currentTimezone}, the same
 * source `<DateTime>` renders through, so both agree on calendar day.
 */
export declare function registerDateTimeFormatter(instance: I18nInstance): void;
