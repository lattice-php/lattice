export type GoogleMapsLibraries = {
    core: google.maps.CoreLibrary;
    maps: google.maps.MapsLibrary;
    marker: google.maps.MarkerLibrary;
};
declare global {
    interface Window {
        google?: typeof google;
    }
}
export declare function loadGoogleMaps(apiKey: string): Promise<GoogleMapsLibraries>;
