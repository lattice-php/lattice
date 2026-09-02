import { RefObject } from "react";
export declare function BlockToolbar({
  id,
  label,
  icon,
  handleRef,
}: {
  id: string;
  label: string;
  icon: string | null;
  handleRef: RefObject<HTMLButtonElement | null>;
}): import("react").JSX.Element;
