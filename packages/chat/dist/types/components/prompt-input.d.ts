import { ReactNode } from 'react';
type PromptInputProps = {
    onSubmit: (text: string) => void;
    disabled?: boolean;
    placeholder?: string;
};
export declare function PromptInput({ onSubmit, disabled, placeholder, }: PromptInputProps): ReactNode;
export {};
