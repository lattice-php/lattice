import type { RendererComponent } from "@lattice-php/core";
import { nodeIdentity } from "@lattice-php/core";
import { Board } from "./board";

export const BoardAdapter: RendererComponent<"board"> = ({ node }) => {
  const {
    cardAction,
    columns,
    createAction,
    endpoint,
    filters,
    moveAction,
    perColumn,
    ref,
    result,
    searchable,
  } = node.props;

  return (
    <Board
      cardAction={cardAction}
      columns={columns}
      componentRef={ref}
      createAction={createAction}
      data-test={nodeIdentity(node)}
      endpoint={endpoint}
      filters={filters}
      identity={nodeIdentity(node)}
      moveAction={moveAction}
      perColumn={perColumn}
      result={result}
      schema={node.schema ?? []}
      searchable={searchable}
    />
  );
};

export default BoardAdapter;
