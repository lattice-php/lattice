import { useFieldScope } from "../form/hooks/field-scope";

export const renderCounts = new Map<string, number>();

export function RenderNode({ node }: { node: { props: { name: string } } }) {
  const scope = useFieldScope();
  const key = scope ? scope.scopedName(node.props.name) : "no-scope";
  renderCounts.set(key, (renderCounts.get(key) ?? 0) + 1);

  return (
    <>
      <span data-test="child">{key}</span>
      <button
        aria-label={`commit ${key}`}
        data-test={`commit-${key}`}
        type="button"
        onClick={() => scope?.setValue(node.props.name, "x")}
      />
    </>
  );
}
