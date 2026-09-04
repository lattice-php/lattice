<?php
declare(strict_types=1);

namespace Lattice\Blocks\Attributes;

use Attribute;
use BackedEnum;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Core\Attributes\DefinitionAttribute;

/**
 * Marks a {@see BlockDefinition} as a discoverable block. The
 * editor-facing metadata lives on the attribute so a block class stays a pure
 * fields-plus-render declaration; the definition can still override any of it.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class AsBlock extends DefinitionAttribute
{
    /**
     * @param  array<int, string>  $keywords
     * @param  string|BackedEnum|array<int, string|BackedEnum>  $can
     */
    public function __construct(
        string $key,
        public readonly ?string $label = null,
        public readonly BackedEnum|string|null $icon = null,
        public readonly BlockCategory|string $category = BlockCategory::Text,
        public readonly ?string $description = null,
        public readonly array $keywords = [],
        string|BackedEnum|array $can = [],
        ?string $on = null,
    ) {
        parent::__construct($key, $can, $on);
    }
}
