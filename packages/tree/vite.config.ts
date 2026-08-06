import { defineConfig } from "vite";
import { standalonePluginConfig } from "../vite.standalone.ts";

export default defineConfig(standalonePluginConfig(import.meta.dirname));
