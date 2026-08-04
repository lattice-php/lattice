import { RefObject } from 'react';
import { PaginationType } from '@lattice-php/core/generated';
import { PerPageOption } from '../lib/payload.js';
import { TablePagination as TablePaginationData } from '../types.js';
export declare function TablePagination({ pagination, currentPage, processing, mode, hasNextPage, visiblePages, infiniteLoaderRef, perPageOptions, perPageValue, onPerPage, onPage, onLoadMore, }: {
    pagination: TablePaginationData;
    currentPage: number;
    processing: boolean;
    mode: PaginationType;
    hasNextPage: boolean;
    visiblePages: number[];
    infiniteLoaderRef: RefObject<HTMLDivElement | null>;
    perPageOptions: PerPageOption[];
    perPageValue: PerPageOption;
    onPerPage: (option: PerPageOption) => void;
    onPage: (page: number) => void;
    onLoadMore: () => void;
}): import("react").JSX.Element;
