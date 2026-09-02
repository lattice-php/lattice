import { ReactNode } from "react";
export declare function FieldRow({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  htmlFor?: string;
}): import("react").JSX.Element;
export declare function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): import("react").JSX.Element;
