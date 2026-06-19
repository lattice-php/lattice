import "../../../workbench/resources/css/app.css";
import { afterEach } from "vitest";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(async () => {
  const { cleanup } = await import("vitest-browser-react");

  await cleanup();
});
