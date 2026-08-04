import { I18nConfig } from '../types.js';
type Config = {
    readonly locales: readonly string[];
    readonly timezone: string | null;
};
export declare const subscribeConfig: (callback: () => void) => () => void;
export declare function setConfig(config: I18nConfig | undefined): void;
export declare function configTimezone(): string | null;
export declare function useConfig(): Config;
export {};
