/// <reference types="google.maps" />

export type GoogleMapsLibraries = {
  core: google.maps.CoreLibrary;
  maps: google.maps.MapsLibrary;
  marker: google.maps.MarkerLibrary;
};

type ImportLibrary = typeof google.maps.importLibrary;

declare global {
  interface Window {
    google?: typeof google;
  }
}

let bootstrap: Promise<ImportLibrary> | null = null;

// With `loading=async` the API initializes after the script has executed, so
// `script.onload` fires before `google.maps.importLibrary` exists — readiness
// is only signalled through the `callback` parameter.
function loadScript(apiKey: string): Promise<ImportLibrary> {
  bootstrap ??= new Promise((resolve, reject) => {
    const callbackName = "__latticeGoogleMapsReady";
    const callbackHost = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const parameters = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      loading: "async",
      callback: callbackName,
    });

    callbackHost[callbackName] = () => {
      delete callbackHost[callbackName];
      const importLibrary = window.google?.maps?.importLibrary;

      if (importLibrary) {
        resolve(importLibrary);
      } else {
        reject(new Error("Google Maps failed to initialize."));
      }
    };

    script.src = `https://maps.googleapis.com/maps/api/js?${parameters}`;
    script.async = true;
    script.onerror = () => {
      bootstrap = null;
      delete callbackHost[callbackName];
      script.remove();
      reject(new Error("The Google Maps script failed to load."));
    };
    document.head.append(script);
  });

  return bootstrap;
}

export async function loadGoogleMaps(apiKey: string): Promise<GoogleMapsLibraries> {
  const importLibrary = window.google?.maps?.importLibrary ?? (await loadScript(apiKey));
  const [core, maps, marker] = await Promise.all([
    importLibrary("core") as Promise<google.maps.CoreLibrary>,
    importLibrary("maps") as Promise<google.maps.MapsLibrary>,
    importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
  ]);

  return { core, maps, marker };
}
