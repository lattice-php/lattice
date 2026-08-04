import { ReactNode } from 'react';
import { TableNode } from '../types.js';
declare const TableComponent: ({ node }: {
    children?: ReactNode;
    node: TableNode;
}) => import("react").JSX.Element;
export default TableComponent;
