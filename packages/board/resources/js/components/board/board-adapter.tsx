import type { RendererComponent } from "@lattice-php/core";
import { nodeIdentity } from "@lattice-php/core";
import { Board } from "./board";

export const BoardAdapter: RendererComponent<"board"> = ({ node }) => {
  const { columns, endpoint, moveAction, perColumn, ref, result } = node.props;

  return (
    <Board
      columns={columns}
      componentRef={ref}
      data-test={nodeIdentity(node)}
      endpoint={endpoint}
      identity={nodeIdentity(node)}
      moveAction={moveAction}
      perColumn={perColumn}
      result={result}
      schema={node.schema ?? []}
    />
  );
};

export default BoardAdapter;
