import { Option } from '@lattice-php/core/types';
import * as React from "react";
/**
 * A popover select list with an optional search box and single/multi selection.
 *
 * Selection state is controlled by the consumer (`selected` + `onSelect`); the
 * consumer also owns option fetching. Pass `onSearch` for remote search (the
 * combobox debounces the query and renders `options` as given); omit it to
 * filter the provided `options` locally by label. The combobox closes itself
 * after a single-select. Pass `renderOption` to render rich option rows; the
 * option's label stays the accessible name. `onSelect` toggles selection
 * (used by dropdown-row clicks); tag-entry commits (Enter/comma/paste) that
 * match an existing option call `onCommit` instead, falling back to
 * `onSelect` when it is not provided, so consumers can make tag entry
 * additive instead of toggling.
 */
declare function Combobox({ contentClassName, creatable, emptyLabel, loading, multiple, onCommit, onCreate, onSearch, onSelect, open, onOpenChange, options, renderOption, searchLabel, searchPlaceholder, selected, showSearch, testId, trigger, triggerClassName, triggerProps, }: {
    contentClassName?: string;
    creatable?: boolean;
    emptyLabel?: string;
    loading?: boolean;
    multiple?: boolean;
    onCommit?: (value: string) => void;
    onCreate?: (label: string) => void;
    onSearch?: (query: string) => void;
    onSelect: (value: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: Option[];
    renderOption?: (option: Option) => React.ReactNode;
    searchLabel?: string;
    searchPlaceholder?: string;
    selected: string[];
    showSearch?: boolean;
    testId?: string;
    trigger: React.ReactNode;
    triggerClassName?: string;
    triggerProps?: React.ComponentProps<"button"> & {
        "data-test"?: string;
    };
}): React.JSX.Element;
export { Combobox };
