import type { RendererComponent } from "@lattice-php/core";

const SlotOutletAdapter: RendererComponent<"blocks.slot"> = ({ children }) => (
  <div className="flex min-w-0 flex-col gap-4">{children}</div>
);

export default SlotOutletAdapter;
