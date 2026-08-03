export type UseTimezoneReturn = {
    readonly timezone: string;
    readonly setTimezone: (timezone: string) => void;
};
export declare function currentTimezone(): string;
export declare function setTimezone(timezone: string): void;
export declare function useTimezone(): UseTimezoneReturn;
