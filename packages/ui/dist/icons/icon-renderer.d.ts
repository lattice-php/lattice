import { ReactNode } from "react";
export type IconRendererProps = {
  className?: string;
  icon: string;
};
export type IconRendererFunction = (props: IconRendererProps) => ReactNode;
type IconRendererProviderProps = {
  children: ReactNode;
  renderer: IconRendererFunction;
};
export declare function IconRendererProvider({
  children,
  renderer,
}: IconRendererProviderProps): import("react").JSX.Element;
export declare function IconRenderer({
  className,
  icon,
}: IconRendererProps):
  | string
  | number
  | bigint
  | true
  | Iterable<ReactNode>
  | Promise<
      | string
      | number
      | bigint
      | boolean
      | import("react").ReactPortal
      | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>
      | Iterable<ReactNode>
      | null
      | undefined
    >
  | import("react").JSX.Element;
