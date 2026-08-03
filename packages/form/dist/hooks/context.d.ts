import { Option } from '@lattice-php/core/types';
export type FormContextValue = {
    action: string;
    clearErrors: (field: string) => void;
    componentId?: string;
    componentRef: string;
    errors: Record<string, string | undefined>;
    fieldIdPrefix?: string;
    fieldLabels: Record<string, string>;
    precognitive: boolean;
    processing: boolean;
    searchOptions?: (field: string, query: string, values: Record<string, unknown>, signal: AbortSignal) => Promise<Option[]>;
    touch: (fields: string[]) => void;
    validate: (field: string) => void;
    validateFields: (fields: string[], options?: {
        onSuccess?: () => void;
        onValidationError?: () => void;
    }) => void;
    validating: boolean;
};
export declare function FormProvider({ children, value, }: {
    children: React.ReactNode;
    value: FormContextValue;
}): import("react").JSX.Element;
export declare function useFormContext(): FormContextValue;
