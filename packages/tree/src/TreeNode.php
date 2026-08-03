<?php
declare(strict_types=1);

namespace Lattice\Tree;

use JsonSerializable;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorName;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Icon;
use Lattice\Lattice\Ui\Components\Link;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Side;
use Lattice\Lattice\Ui\Enums\StackDirection;
use Lattice\Lattice\Ui\Enums\Width;

final class TreeNode implements JsonSerializable
{
    /** @var list<Component>|null */
    private ?array $schema = null;

    public ?string $icon = null;

    public ?string $badge = null;

    public Color|ColorName|string|null $badgeColor = null;

    public ?string $href = null;

    public Action|ActionGroup|null $actions = null;

    /** @var list<TreeNode> */
    public array $children = [];

    public bool $hasChildren = false;

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

    public function disabled(bool $disabled = true): self
    {
        $this->disabled = $disabled;

        return $this;
    }

    /**
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
     * @param  array<string, mixed>  $node
     */
    private static function fromArray(array $node): self
    {
        $tree = self::make((string) $node['id'], (string) $node['label']);

        foreach (['icon', 'badge', 'href'] as $key) {
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

        if (! empty($node['disabled'])) {
            $tree->disabled(true);
        }

        return $tree;
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        $data = $this->serialiseShallow();

        if ($this->children !== []) {
            $data['children'] = array_map(static fn (TreeNode $child): array => $child->jsonSerialize(), $this->children);
        }

        return $data;
    }

    /**
     * This node's own fields without its children, so a depth-aware walk (see
     * Tree) can serialize each level exactly once.
     *
     * @return array<string, mixed>
     */
    public function serialiseShallow(): array
    {
        $data = [
            'id' => $this->id,
            'label' => $this->label,
            'schema' => array_map(
                static fn (Component $component): array => $component->jsonSerialize(),
                $this->compiledSchema(),
            ),
        ];

        if ($this->href !== null) {
            $data['href'] = $this->href;
        }

        if ($this->disabled) {
            $data['disabled'] = true;
        }

        if ($this->hasChildren) {
            $data['hasChildren'] = true;
        }

        return $data;
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
                ->direction(StackDirection::Row)
                ->width(Width::Auto)
                ->float(Side::End)
                ->schema([$this->actions]);
        }

        return $schema;
    }
}
