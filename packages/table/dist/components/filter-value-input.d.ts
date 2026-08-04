import { FilterType } from '@lattice-php/core/generated';
export declare function FilterValueInput({ type, label, value, processing, withSearchIcon, grouped, ariaLabel, testId, onCommit, onClear, }: {
    type: FilterType;
    label: string;
    value: string;
    processing: boolean;
    withSearchIcon?: boolean;
    grouped?: boolean;
    ariaLabel?: string;
    testId?: string;
    onCommit: (value: string) => void;
    onClear?: () => void;
}): import("react").JSX.Element;
