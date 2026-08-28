import { ReactNode } from 'react';
import { UseSearchReturn } from './types';
export type SearchContextValue = UseSearchReturn & {
    instanceId: string;
    placeholder: string;
};
export declare function SearchProvider({ value, children, }: {
    value: SearchContextValue;
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useSearchContext(): SearchContextValue;
