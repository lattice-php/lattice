<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Lattice\Actions\Components\Action;
use Lattice\Actions\Components\ActionGroup;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorName;
use Lattice\Ui\Components\Badge;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Icon;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Side;
use Lattice\Ui\Enums\Width;

final class TreeNode
{
    /** @var list<Component>|null */
    private ?array $schema = null;

    public ?string $icon = null;

    public ?string $badge = null;

    public Color|ColorName|string|null $badgeColor = null;

    public ?string $href = null;

    public ?string $class = null;

    public Action|ActionGroup|null $actions = null;

    /** @var list<TreeNode> */
    public array $children = [];

    public bool $hasChildren = false;

    public bool $acceptsChildren = true;

    public bool $disabled = false;

    private function __construct(
        public readonly string $id,
        public readonly string $label,
    ) {}

    public static function make(string $id, string $label): self
    {
        return new self($id, $label);
    }

    public function icon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function badge(string $badge, Color|ColorName|string|null $color = null): self
    {
        $this->badge = $badge;
        $this->badgeColor = $color;

        return $this;
    }

    public function href(string $href): self
    {
        $this->href = $href;

        return $this;
    }

    public function class(string $class): self
    {
        $this->class = $class;

        return $this;
    }

    public function action(Action $action): self
    {
        $this->actions = $action;

        return $this;
    }

    public function actions(ActionGroup $group): self
    {
        $this->actions = $group;

        return $this;
    }

    /** @param  list<Component>  $components */
    public function schema(array $components): self
    {
        $this->schema = $components;

        return $this;
    }

    /**
     * @param  list<TreeNode|array<string, mixed>>  $children
     */
    public function children(array $children): self
    {
        $this->children = self::expand($children);

        return $this;
    }

    public function hasChildren(bool $hasChildren = true): self
    {
        $this->hasChildren = $hasChildren;

        return $this;
    }

    public function acceptsChildren(bool $acceptsChildren = true): self
    {
        $this->acceptsChildren = $acceptsChildren;

        return $this;
    }

    public function disabled(bool $disabled = true): self
    {
        $this->disabled = $disabled;

        return $this;
    }

    /**
     * Normalizes a mixed list of nodes and array shorthands; see
     * {@see TreeNode::fromArray()} for the keys the array form supports.
     *
     * @param  list<TreeNode|array<string, mixed>>  $nodes
     * @return list<TreeNode>
     */
    public static function expand(array $nodes): array
    {
        return array_map(
            static fn (TreeNode|array $node): TreeNode => $node instanceof self ? $node : self::fromArray($node),
            $nodes,
        );
    }

    /**
     * The array form is a convenience subset of the builder API. Supported keys:
     * `id` and `label` (required, cast to string), `icon`, `badge`, `href`,
     * `class` (cast to string), `children` (nodes or arrays, expanded
     * recursively), `hasChildren` and `disabled` (truthy), and
     * `acceptsChildren` (boolean, defaults to true). Unknown keys are
     * ignored. A badge
     * colour, `->action()`/`->actions()`, and `->schema()` have no array form —
     * build those nodes with {@see TreeNode::make()}.
     *
     * @param  array<string, mixed>  $node
     */
    private static function fromArray(array $node): self
    {
        $tree = self::make((string) $node['id'], (string) $node['label']);

        foreach (['icon', 'badge', 'href', 'class'] as $key) {
            if (isset($node[$key])) {
                $tree->{$key} = (string) $node[$key];
            }
        }

        if (! empty($node['children'])) {
            $tree->children($node['children']);
        }

        if (! empty($node['hasChildren'])) {
            $tree->hasChildren(true);
        }

        if (isset($node['acceptsChildren'])) {
            $tree->acceptsChildren((bool) $node['acceptsChildren']);
        }

        if (! empty($node['disabled'])) {
            $tree->disabled(true);
        }

        return $tree;
    }

    /**
     * @param  list<TreeNodeData>  $children
     */
    public function data(array $children, bool $hasChildren): TreeNodeData
    {
        return new TreeNodeData(
            id: $this->id,
            label: $this->label,
            schema: $this->compiledSchema(),
            href: $this->href,
            class: $this->class,
            disabled: $this->disabled,
            hasChildren: $hasChildren,
            acceptsChildren: $this->acceptsChildren,
            children: $children,
        );
    }

    /** @return list<Component> */
    private function compiledSchema(): array
    {
        if ($this->schema !== null) {
            return $this->schema;
        }

        $schema = [];

        if ($this->icon !== null) {
            $schema[] = Icon::make($this->icon)->class('size-lt-icon-md shrink-0');
        }

        $schema[] = $this->href !== null && ! $this->disabled
            ? Link::make($this->label)->href($this->href)
            : Text::make($this->label);

        if ($this->badge !== null) {
            $badge = Badge::make($this->badge);

            if ($this->badgeColor !== null) {
                $badge->color($this->badgeColor);
            }

            $schema[] = $badge;
        }

        if ($this->actions !== null) {
            $schema[] = Stack::make()
                ->direction(Orientation::Horizontal)
                ->width(Width::Auto)
                ->float(Side::End)
                ->schema([$this->actions]);
        }

        return $schema;
    }
}
