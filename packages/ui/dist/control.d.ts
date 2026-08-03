export declare const FOCUS_RING = "focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-offset-[length:var(--lt-ring-offset)]";
/**
 * The shared chrome for single-line form/table controls (text inputs, native
 * selects, and the Select/filter trigger buttons). `density` is the only axis
 * that differs between forms (comfortable) and table filters (compact); the
 * border, focus ring, invalid, and disabled treatment are unified.
 */
export declare const controlSurface: (props?: ({
    density?: "comfortable" | "compact" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
