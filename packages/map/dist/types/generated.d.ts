import { Color, Node } from '@lattice-php/core';
export type ComponentPropsMap = {
    map: Map;
};
export type CoordinateData = {
    readonly latitude: number;
    readonly longitude: number;
};
export type FeatureType = "marker" | "route";
export type Map = {
    center: CoordinateData | null;
    features: (MarkerData | RouteData)[];
    height: number;
    navigationControls: boolean;
    provider: MapProviderData;
    scrollZoom: boolean;
    zoom: number | null;
};
export type MapNodeType = "map";
export type MapProviderData = {
    readonly maximumZoom: number;
    readonly minimumZoom: number;
    readonly name: string;
    readonly options: Record<string, unknown>;
};
export type MarkerData = {
    readonly color: Color | null;
    readonly icon: string | null;
    readonly id: string;
    readonly label: string;
    readonly open: boolean;
    readonly position: CoordinateData;
    readonly schema: Node[];
    readonly type: FeatureType;
};
export type NodeType = "map";
export type RouteData = {
    readonly color: Color | null;
    readonly id: string;
    readonly path: CoordinateData[];
    readonly type: FeatureType;
    readonly weight: number | null;
};
