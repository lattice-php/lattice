import { RepeaterRow } from './repeater-rows.js';
/** Inertia serializes the live DOM on submit, so reserved row keys must be mounted as inputs. */
export declare function RowKeyInputs({ path, rows, rowKey, }: {
    path: string;
    rows: RepeaterRow[];
    rowKey: string;
}): import("react").JSX.Element;
