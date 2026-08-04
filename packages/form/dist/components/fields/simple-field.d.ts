import { ReactNode } from 'react';
import { Node } from '@lattice-php/core/types';
import { FormFieldControlProps } from '../base/field.js';
import { ControlledField } from '../../hooks/use-controlled-field.js';
export declare function SimpleField({ node, label, children, }: {
    node: Node;
    label: string;
    children: (field: ControlledField, controlProps: FormFieldControlProps) => ReactNode;
}): import("react").JSX.Element | null;
