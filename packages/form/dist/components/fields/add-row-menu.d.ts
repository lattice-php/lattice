export type AddRowOption = {
    type: string;
    label: string;
};
export declare function AddRowMenu({ addLabel, options, onSelect, }: {
    addLabel: string;
    options: AddRowOption[];
    onSelect: (type: string) => void;
}): import("react").JSX.Element;
