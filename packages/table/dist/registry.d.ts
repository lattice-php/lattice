import { ReactNode } from 'react';
import { ColumnPropsOf, TableColumn, TableRow } from './types.js';
import { ColumnPropsMap } from '@lattice-php/core/generated';
export type ColumnCellArgs<TType extends string = string> = {
    column: TableColumn;
    props: ColumnPropsOf<TType>;
    row: TableRow;
    value: unknown;
};
export type ColumnCellComponent<TType extends string = string> = (args: ColumnCellArgs<TType>) => ReactNode;
export type ColumnRegistry = Record<string, ColumnCellComponent>;
export declare const COLUMN_REGISTRY_EXTENSION = "table.columns";
export declare function useColumnRegistry(): ColumnRegistry;
export type ColumnRegistryFor<TTypes extends keyof ColumnPropsMap & string> = Record<TTypes, ColumnCellComponent>;
/**
 * Registers a typed column cell, erasing the type parameter so it fits the
 * registry. Mirrors `eagerComponent`/`lazyComponent` for the component registry:
 * author against `ColumnCellComponent<"my.type">` for typed `props`, register
 * through this.
 */
export declare function columnCell<TType extends string>(cell: ColumnCellComponent<TType>): ColumnCellComponent;
