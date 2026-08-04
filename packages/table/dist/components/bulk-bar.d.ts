import { BulkAction } from '../lib/bulk.js';
export declare function BulkBar({ actions, selectedKeys, allMatching, total, query, canSelectAllMatching, onSelectAllMatching, onCompleted, }: {
    actions: BulkAction[];
    selectedKeys: string[];
    allMatching: boolean;
    total?: number;
    query: Record<string, unknown>;
    canSelectAllMatching: boolean;
    onSelectAllMatching: () => void;
    onCompleted: () => void;
}): import("react").JSX.Element;
