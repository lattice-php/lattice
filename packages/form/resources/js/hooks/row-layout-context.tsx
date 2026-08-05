import { createContext, useContext } from "react";

const TableCellContext = createContext(false);

export function TableCellProvider({ children }: { children: React.ReactNode }) {
  return <TableCellContext.Provider value={true}>{children}</TableCellContext.Provider>;
}

/** True when a field is being rendered inside a table-layout cell (no own label). */
export function useInTableCell(): boolean {
  return useContext(TableCellContext);
}
