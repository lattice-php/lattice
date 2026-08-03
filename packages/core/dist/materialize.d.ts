import { Node, NodeProps, Schema } from "./index.js";
export type RemoteRow = Record<string, unknown>;
export type DataBindings = Record<string, string>;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function dataBindings(value: unknown): DataBindings;
export declare function rowValue(row: RemoteRow, key: string): unknown;
export declare function materializeProps(props: unknown, row: RemoteRow): NodeProps;
export declare function materializeNode(node: Node, row: RemoteRow): Node;
export declare function materializeSchema(schema: Schema | undefined, row: RemoteRow): Schema;
