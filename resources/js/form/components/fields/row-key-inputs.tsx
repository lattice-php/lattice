import { appendPath, toHtmlName } from "../form-path";
import { ROW_ID_KEY, type RepeaterRow } from "./repeater-rows";

/** Inertia serializes the live DOM on submit, so reserved row keys must be mounted as inputs. */
export function RowKeyInputs({
  path,
  rows,
  rowKey,
}: {
  path: string;
  rows: RepeaterRow[];
  rowKey: string;
}) {
  return (
    <>
      {rows.map((row, index) => (
        <input
          key={String(row[ROW_ID_KEY] ?? index)}
          type="hidden"
          name={toHtmlName(appendPath(path, index, rowKey))}
          value={String(row[rowKey] ?? "")}
        />
      ))}
    </>
  );
}
