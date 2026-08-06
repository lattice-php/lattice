import "../../../../../workbench/resources/css/app.css";
import { afterEach } from "vitest";
import { cleanup } from "vitest-browser-react";

afterEach(async () => {
  await cleanup();
});
