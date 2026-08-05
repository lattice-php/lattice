import { createLatticeApp } from "@lattice-php/lattice";
import { renderToString } from "react-dom/server";

export { createLatticeApp };

export function render(): string {
  return renderToString(<div data-lattice-ssr>lattice-ssr</div>);
}
