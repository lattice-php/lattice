import { ComponentProps } from 'react';
import { Option } from '@lattice-php/core/types';
/**
 * Presentational segmented pill group. Used by the form choice field (bound to a
 * form value) and the core segmented control (standalone, emits an event).
 */
export declare function SegmentedPills({ ariaLabel, autoFocus, className, disabled, name, onSelect, options, tabIndex, value, ...props }: Omit<ComponentProps<"div">, "children" | "onSelect" | "ref"> & {
    ariaLabel?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    name: string;
    onSelect: (value: string) => void;
    options: Option[];
    tabIndex?: number;
    value: string;
}): import("react").JSX.Element;
