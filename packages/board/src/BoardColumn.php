<?php
declare(strict_types=1);

namespace Lattice\Board;

use Lattice\Core\Color;
use Lattice\Core\Enums\ColorName;

final class BoardColumn
{
    private string $label;

    private ?Color $color = null;

    private ?string $icon = null;

    private function __construct(private readonly string $key)
    {
        $this->label = $key;
    }

    public static function make(string $key): self
    {
        return new self($key);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function color(Color|ColorName|string $color): self
    {
        $this->color = Color::from($color);

        return $this;
    }

    public function icon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function key(): string
    {
        return $this->key;
    }

    public function data(): BoardColumnData
    {
        return new BoardColumnData($this->key, $this->label, $this->color, $this->icon);
    }
}
