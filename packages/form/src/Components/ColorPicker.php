<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Concerns\HasPlaceholder;

#[AsField(FieldType::ColorPicker)]
class ColorPicker extends Field
{
    use HasPlaceholder;

    public const array DefaultPalette = [
        '#ef4444',
        '#f97316',
        '#f59e0b',
        '#22c55e',
        '#14b8a6',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#6b7280',
    ];

    /** @var list<string> */
    public array $palette = self::DefaultPalette;

    /**
     * @param  list<string>  $colors
     */
    public function palette(array $colors): static
    {
        $this->palette = $colors;

        return $this;
    }
}
