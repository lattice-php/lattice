<?php
declare(strict_types=1);

namespace Lattice\Tree;

use InvalidArgumentException;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\IsInteractive;
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

    public string|int|null $revision = null;

    public ?Action $selectAction = null;

    public ?Action $moveAction = null;

    public ?string $endpoint = null;

    public bool $lazy = false;

    private ?int $eagerDepth = null;

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
        $this->eagerDepth = $eagerDepth;

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

    public function revision(string|int|null $revision): static
    {
        $this->revision = $revision;

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function selectAction(string $action, array $context = []): static
    {
        $this->selectAction = Action::use($action, $context);

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function moveAction(string $action, array $context = []): static
    {
        $this->moveAction = Action::use($action, $context);

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseActivePath(array $data): array
    {
        if ($this->activeId !== null && $this->source instanceof TreeSource) {
            $data['props']['activePath'] = $this->source->path($this->activeId);
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseNodes(array $data): array
    {
        $maxLevels = $this->lazy ? $this->eagerDepth : null;

        $roots = ($maxLevels === null || $maxLevels > 0) && $this->source instanceof TreeSource
            ? $this->nodeList($this->source->roots())
            : [];

        $data['props']['nodes'] = array_map(
            fn (TreeNode $node): array => $this->serialiseNode($node, 1, $maxLevels),
            $roots,
        );

        return $data;
    }

    /**
     * @param  array<string, true>  $ancestors
     * @return array<string, mixed>
     */
    private function serialiseNode(TreeNode $node, int $level, ?int $maxLevels, array $ancestors = []): array
    {
        $data = $node->serialiseShallow();

        if ($maxLevels !== null && $level >= $maxLevels) {
            if ($node->children !== []) {
                $data['hasChildren'] = true;
            }

            return $data;
        }

        $ancestors[$node->id] = true;
        $children = $this->resolveChildren($node);
        $children = array_values(array_filter(
            $children,
            static fn (TreeNode $child): bool => ! isset($ancestors[$child->id]),
        ));

        if ($children !== []) {
            $data['children'] = array_map(
                fn (TreeNode $child): array => $this->serialiseNode($child, $level + 1, $maxLevels, $ancestors),
                $children,
            );
        } elseif ($node->hasChildren || $node->children !== []) {
            $data['hasChildren'] = true;
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
