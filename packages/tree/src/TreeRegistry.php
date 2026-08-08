<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Illuminate\Http\Request;
use Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<TreeDefinition>
 */
final class TreeRegistry extends DefinitionRegistry
{
    /**
     * One level of the tree for the lazy endpoint: the roots when no parent
     * is given, otherwise the immediate children of `?parent=`.
     *
     * @return array{nodes: list<TreeNodeData>}
     */
    public function response(string $key, Request $request, ?TreeDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);
        $source = $definition->source();

        if ($source instanceof EloquentTreeSource) {
            $source->lazy();
        }

        $parent = trim((string) $request->query('parent', ''));
        $nodes = $parent === '' ? $source->roots() : $source->children($parent);

        return ['nodes' => array_map($this->serialiseLevelNode(...), $nodes)];
    }

    private function serialiseLevelNode(TreeNode $node): TreeNodeData
    {
        return $node->data([], $node->hasChildren || $node->children !== []);
    }

    /**
     * @param  class-string<TreeDefinition>  $tree
     * @param  array<string, mixed>  $context
     */
    public function component(string $tree, array $context = []): Tree
    {
        return $this->gatedComponent(
            $tree,
            fn (string $key): Tree => Tree::make($key),
            fn (TreeDefinition $definition, Tree $component, string $key): Tree => $component
                ->id($key)
                ->endpoint($this->endpointFor($key))
                ->source($definition->source()),
            $context,
        );
    }

    protected function definitionClass(): string
    {
        return TreeDefinition::class;
    }

    public function attributeClass(): string
    {
        return AsTree::class;
    }

    protected function name(): string
    {
        return 'tree';
    }

    public function group(): string
    {
        return 'trees';
    }
}
