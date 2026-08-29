import { ComponentPropsMap } from "./generated";
declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}
export type {
  CoordinateData,
  FeatureType,
  Map as MapWireProps,
  MapNodeType,
  MapProviderData,
  MarkerData,
  RouteData,
} from "./generated";
