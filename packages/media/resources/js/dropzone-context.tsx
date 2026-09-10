import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type DropzoneApi = {
  disabled: boolean;
  remove(): void;
};

const DropzoneContext = createContext<DropzoneApi | null>(null);

export function DropzoneProvider({ value, children }: { value: DropzoneApi; children: ReactNode }) {
  return <DropzoneContext.Provider value={value}>{children}</DropzoneContext.Provider>;
}

/** The dropzone a remove control belongs to; null outside one, where the control renders nothing. */
export function useDropzone(): DropzoneApi | null {
  return useContext(DropzoneContext);
}
