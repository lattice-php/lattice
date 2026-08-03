/// <reference types="@lattice-php/lattice/svg-sprite-client" />
/// <reference types="@lattice-php/lattice/vite-client" />
import "../css/app.css";
import { createLatticeApp } from "@lattice-php/lattice";
import sprite from "virtual:svg-sprite";
import plugins from "virtual:lattice/plugins";

void createLatticeApp({
  plugins,
  sprite,
});
