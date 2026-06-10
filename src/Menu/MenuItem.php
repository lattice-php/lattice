<?php

declare(strict_types=1);

namespace Lattice\Lattice\Menu;

use BackedEnum;
use Closure;
use Lattice\Lattice\Core\Enums\HttpMethod;

/**
 * @phpstan-consistent-constructor
 */
class MenuItem
{
    private ?string $group = null;

    private ?string $href = null;

    private ?string $icon = null;

    private ?string $key;

    private ?string $label = null;

    private string $method = 'get';

    private int $sort = 0;

    public function __construct(?string $key = null)
    {
        $this->key = $key;
    }

    public static function make(?string $key = null): static
    {
        return new static($key);
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
     * @param  array{group?: string|null, href?: string|null, icon?: string|null, key?: string|null, label?: string|null, method?: string|null, sort?: int}  $data
     */
    public static function fromArray(array $data): static
    {
        return static::make($data['key'] ?? null)
            ->group($data['group'] ?? null)
            ->href($data['href'] ?? null)
            ->icon($data['icon'] ?? null)
            ->label($data['label'] ?? null)
            ->method($data['method'] ?? HttpMethod::Get)
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

    public function key(?string $key): static
    {
        $this->key = $key;

        return $this;
    }

    public function label(?string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function method(BackedEnum|string $method): static
    {
        $this->method = $method instanceof BackedEnum ? (string) $method->value : strtolower($method);

        return $this;
    }

    public function sort(int $sort): static
    {
        $this->sort = $sort;

        return $this;
    }

    public function getGroup(): ?string
    {
        return $this->group;
    }

    public function getHref(): ?string
    {
        return $this->href;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getKey(): ?string
    {
        return $this->key;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getSort(): int
    {
        return $this->sort;
    }

    /**
     * @return array{group: string|null, href: string|null, icon: string|null, key: string|null, label: string|null, method: string, sort: int}
     */
    public function toArray(): array
    {
        return [
            'group' => $this->group,
            'href' => $this->href,
            'icon' => $this->icon,
            'key' => $this->key,
            'label' => $this->label,
            'method' => $this->method,
            'sort' => $this->sort,
        ];
    }
}
