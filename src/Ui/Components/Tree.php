<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Ui\Contracts\TreeSource;
use Lattice\Lattice\Ui\Sources\CallbackTreeSource;
use Lattice\Lattice\Ui\Values\TreeNode;

#[AsComponent('tree')]
class Tree extends Component
{
    private ?TreeSource $source = null;

    public ?string $activeId = null;

    /** @var list<string> */
    public array $defaultExpanded = [];

    public bool $rememberState = false;

    /**
     * Serialization depth cap: the termination guarantee for source-backed
     * trees whose adjacency data contains a cycle. Not a feature knob — lazy
     * loading is the planned path for genuinely deep hierarchies.
     */
    private const int MAX_DEPTH = 50;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * @param  list<TreeNode|array<string, mixed>>  $nodes
     */
    public function nodes(array $nodes): static
    {
        $expanded = TreeNode::expand($nodes);
        $this->source = new CallbackTreeSource(roots: static fn (): array => $expanded);

        return $this;
    }

    public function source(TreeSource $source): static
    {
        $this->source = $source;

        return $this;
    }

    public function activeId(?string $id): static
    {
        $this->activeId = $id;

        return $this;
    }

    /**
     * @param  list<string>  $ids
     */
    public function defaultExpanded(array $ids): static
    {
        $this->defaultExpanded = $ids;

        return $this;
    }

    public function rememberState(bool $remember = true): static
    {
        $this->rememberState = $remember;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseNodes(array $data): array
    {
        $roots = $this->source instanceof TreeSource ? $this->nodeList($this->source->roots()) : [];

        $data['props']['nodes'] = array_map(
            fn (TreeNode $node): array => $this->serialiseNode($node, 0),
            $roots,
        );

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function serialiseNode(TreeNode $node, int $depth): array
    {
        $data = $node->serialiseShallow();

        if ($depth >= self::MAX_DEPTH) {
            if ($node->children !== []) {
                $data['hasChildren'] = true;
            }

            return $data;
        }

        $children = $this->resolveChildren($node);

        if ($children !== []) {
            $data['children'] = array_map(fn (TreeNode $child): array => $this->serialiseNode($child, $depth + 1), $children);
        }

        return $data;
    }

    /**
     * @return list<TreeNode>
     */
    private function resolveChildren(TreeNode $node): array
    {
        if ($node->children !== []) {
            return $node->children;
        }

        if ($node->hasChildren && $this->source instanceof TreeSource) {
            return $this->nodeList($this->source->children($node->id));
        }

        return [];
    }

    /**
     * @param  iterable<int, TreeNode>  $nodes
     * @return list<TreeNode>
     */
    private function nodeList(iterable $nodes): array
    {
        return is_array($nodes) ? array_values($nodes) : iterator_to_array($nodes, false);
    }
}
