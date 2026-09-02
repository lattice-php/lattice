import type { RendererComponent } from "@lattice-php/core";

const BlockViewAdapter: RendererComponent<"blocks.view"> = ({ children }) => (
  <div className="lt-blocks flex w-full flex-col" data-test="blocks-view">
    {children}
  </div>
);

export default BlockViewAdapter;
