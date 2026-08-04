import { ComponentProps, Ref } from 'react';
type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
    passwordrules?: string;
    ref?: Ref<HTMLInputElement>;
};
export default function PasswordInput({ className, ref, ...props }: PasswordInputProps): import("react").JSX.Element;
export {};
