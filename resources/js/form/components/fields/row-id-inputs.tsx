import { appendPath, toHtmlName } from "../form-path";
import { ROW_ID_KEY, type RepeaterRow } from "./repeater-rows";

/** Submits each row's reserved uuid so validated data identifies the row. */
export function RowIdInputs({ path, rows }: { path: string; rows: RepeaterRow[] }) {
  return (
    <>
      {rows.map((row, index) => (
        <input
          key={String(row[ROW_ID_KEY] ?? index)}
          type="hidden"
          name={toHtmlName(appendPath(path, index, ROW_ID_KEY))}
          value={String(row[ROW_ID_KEY] ?? "")}
        />
      ))}
    </>
  );
}
