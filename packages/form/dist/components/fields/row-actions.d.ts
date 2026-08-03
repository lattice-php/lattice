export type RowAction = {
    key: string;
    label: string;
    icon: string;
    onClick: () => void;
    danger?: boolean;
};
export declare function RowActions({ actions }: {
    actions: RowAction[];
}): import("react").JSX.Element | null;
