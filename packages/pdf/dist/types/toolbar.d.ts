import { ReactNode } from 'react';
export type ToolbarProps = {
    sidebarToggle: boolean;
    sidebarOpen: boolean;
    onToggleSidebar(): void;
    currentPage: number;
    totalPages: number;
    onJump(page: number): void;
    zoomPercent: number | null;
    canZoomIn: boolean;
    canZoomOut: boolean;
    onZoomIn(): void;
    onZoomOut(): void;
    onFitWidth(): void;
    searchable: boolean;
    query: string;
    onQueryChange(query: string): void;
    matchCount: number;
    currentMatch: number;
    onNextMatch(): void;
    onPreviousMatch(): void;
    downloadable: boolean;
    url: string;
    filename: string | null;
    /** Content rendered after the built-in controls: the viewer node's own schema. */
    end?: ReactNode;
};
export declare function Toolbar(props: ToolbarProps): React.ReactElement;
