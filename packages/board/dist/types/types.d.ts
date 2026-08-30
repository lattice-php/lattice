import { ComponentPropsMap } from './generated';
declare module "@lattice-php/core" {
    interface ComponentProps extends ComponentPropsMap {
    }
}
export type { Board as BoardWireProps, BoardColumnCards, BoardColumnData, BoardNodeType, BoardQuery, BoardResult, } from './generated';
export type { FilterIndicator, FilterNode } from '@lattice-php/table';
