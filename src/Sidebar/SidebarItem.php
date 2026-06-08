<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Sidebar;

use BackedEnum;
use Closure;

final class SidebarItem
{
    private ?string $group = null;

    private ?string $href = null;

    private ?string $icon = null;

    private ?string $label = null;

    private int $sort = 0;

    public static function make(): static
    {
        return new self;
    }

    /**
     * @param  Closure(static): mixed|string|null  $label
     */
    public static function configure(Closure|string|null $label = null, BackedEnum|string|null $icon = null): static
    {
        $item = static::make();

        if ($label instanceof Closure) {
            $label($item);

            return $item;
        }

        if ($label !== null) {
            $item->label($label);
        }

        if ($icon !== null) {
            $item->icon($icon);
        }

        return $item;
    }

    /**
     * @param  array{group?: string|null, href?: string|null, icon?: string|null, label?: string|null, sort?: int}  $data
     */
    public static function fromArray(array $data): static
    {
        return static::make()
            ->group($data['group'] ?? null)
            ->href($data['href'] ?? null)
            ->icon($data['icon'] ?? null)
            ->label($data['label'] ?? null)
            ->sort($data['sort'] ?? 0);
    }

    public function group(?string $group): static
    {
        $this->group = $group;

        return $this;
    }

    public function href(?string $href): static
    {
        $this->href = $href;

        return $this;
    }

    public function icon(BackedEnum|string|null $icon): static
    {
        $this->icon = $icon instanceof BackedEnum ? (string) $icon->value : $icon;

        return $this;
    }

    public function label(?string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function sort(int $sort): static
    {
        $this->sort = $sort;

        return $this;
    }

    /**
     * @return array{group: string|null, href: string|null, icon: string|null, label: string|null, sort: int}
     */
    public function toArray(): array
    {
        return [
            'group' => $this->group,
            'href' => $this->href,
            'icon' => $this->icon,
            'label' => $this->label,
            'sort' => $this->sort,
        ];
    }
}
