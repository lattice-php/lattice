<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

/**
 * Everything the editor needs to know about one block type: library entry,
 * inspector field schema, slot rules, and supported style controls.
 */
#[TypeScript]
final readonly class BlockTypeData
{
    /**
     * @param  list<string>  $keywords
     * @param  list<Component>  $schema
     * @param  list<SlotData>  $slots
     * @param  array<string, mixed>  $defaults
     */
    public function __construct(
        public string $type,
        public string $label,
        public ?string $icon,
        public string $category,
        public ?string $description,
        public array $keywords,
        public array $schema,
        public array $slots,
        public BlockSupports $supports,
        public array $defaults,
    ) {}
}
