<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Values;

use JsonSerializable;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final class TreeNode implements JsonSerializable
{
    public ?string $icon = null;

    public ?string $badge = null;

    public ?string $href = null;

    public Action|ActionGroup|null $actions = null;

    /** @var list<TreeNode> */
    public array $children = [];

    public bool $hasChildren = false;

    public bool $disabled = false;

    private function __construct(
        public readonly string $label,
        public readonly string $id,
    ) {}

    public static function make(string $label, string $id): self
    {
        return new self($label, $id);
    }

    public function icon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function badge(string $badge): self
    {
        $this->badge = $badge;

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
     * The eager child nodes (used by Tree for depth-aware serialization).
     *
     * @return list<TreeNode>
     */
    public function childNodes(): array
    {
        return $this->children;
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
        $tree = self::make((string) $node['label'], (string) $node['id']);

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
        $data = ['id' => $this->id, 'label' => $this->label];

        foreach (['icon' => $this->icon, 'badge' => $this->badge, 'href' => $this->href] as $key => $value) {
            if ($value !== null) {
                $data[$key] = $value;
            }
        }

        if ($this->disabled) {
            $data['disabled'] = true;
        }

        if ($this->hasChildren) {
            $data['hasChildren'] = true;
        }

        if ($this->actions !== null) {
            $data['actions'] = $this->actions->jsonSerialize();
        }

        if ($this->children !== []) {
            $data['children'] = array_map(static fn (TreeNode $child): array => $child->jsonSerialize(), $this->children);
        }

        return $data;
    }
}
