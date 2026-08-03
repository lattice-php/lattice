import { useEffect, useLayoutEffect as useLayoutEffect$1 } from "react";
//#region resources/js/lib/use-layout-effect.ts
/**
* Drop-in for React's `useLayoutEffect`, which warns under `renderToString`;
* effects never run there, so the server-side substitution is free.
*/
var useLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect$1;
//#endregion
export { useLayoutEffect };

//# sourceMappingURL=use-layout-effect.js.map