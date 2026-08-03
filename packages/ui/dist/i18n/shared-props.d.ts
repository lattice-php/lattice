import { I18nConfig } from '../types.js';
/**
 * Parse the backend-shared `lattice.i18n` Inertia prop. Lives apart from the
 * configure entrypoint so callers can inspect the prop without pulling the
 * i18next backend into their bundle.
 */
export declare function i18nConfigFromPageProps(props: unknown): I18nConfig | undefined;
