<?php
declare(strict_types=1);

namespace Lattice\Tree;

use InvalidArgumentException;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\IsInteractive;
use LogicException;

#[AsComponent('tree')]
class Tree extends Component implements InteractiveComponent
{
    use IsInteractive;

    private ?TreeSource $source = null;

    public ?string $activeId = null;

    /** @var list<string> */
    public array $defaultExpanded = [];

    public bool $rememberState = false;

    public ?string $endpoint = null;

    public bool $lazy = false;

    private int $eagerDepth = self::MAX_DEPTH;

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
     * Build a tree from a registered {@see TreeDefinition}: the definition's
     * source provides the nodes, and the sealed reference lets the endpoint
     * re-resolve it with the same context on a later request.
     *
     * @param  class-string<TreeDefinition>  $definition
     * @param  array<string, mixed>  $context
     */
    public static function use(string $definition, array $context = []): static
    {
        /** @var static */
        return app(TreeRegistry::class)->component($definition, $context);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    /**
     * Serialize only the first $eagerDepth levels; deeper nodes are fetched
     * from the endpoint when expanded. 0 serializes a bare skeleton whose
     * roots the client fetches too.
     */
    public function lazy(int $eagerDepth = 1): static
    {
        if ($this->signatureKey === null) {
            throw new LogicException('Tree::lazy() requires a definition-backed tree — build it with Tree::use(). Inline nodes()/source() trees cannot round-trip to the endpoint.');
        }

        if ($eagerDepth < 0) {
            throw new InvalidArgumentException('Tree eager depth must be zero or greater.');
        }

        $this->lazy = true;
        $this->eagerDepth = min($eagerDepth, self::MAX_DEPTH);

        return $this;
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
        // Eager trees serialize one level beyond MAX_DEPTH as a shallow
        // boundary row; lazy trees serialize exactly $eagerDepth levels.
        $maxLevels = $this->lazy ? $this->eagerDepth : self::MAX_DEPTH + 1;

        $roots = $maxLevels > 0 && $this->source instanceof TreeSource
            ? $this->nodeList($this->source->roots())
            : [];

        $data['props']['nodes'] = array_map(
            fn (TreeNode $node): array => $this->serialiseNode($node, 1, $maxLevels),
            $roots,
        );

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function serialiseNode(TreeNode $node, int $level, int $maxLevels): array
    {
        $data = $node->serialiseShallow();

        if ($level >= $maxLevels) {
            if ($node->children !== []) {
                $data['hasChildren'] = true;
            }

            return $data;
        }

        $children = $this->resolveChildren($node);

        if ($children !== []) {
            $data['children'] = array_map(fn (TreeNode $child): array => $this->serialiseNode($child, $level + 1, $maxLevels), $children);
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
