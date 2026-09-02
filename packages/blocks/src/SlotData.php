<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class SlotData
{
    /**
     * @param  list<string>|null  $allows  Allowed block type keys; null accepts every block.
     */
    public function __construct(
        public string $name,
        public string $label,
        public ?array $allows,
        public ?int $min,
        public ?int $max,
    ) {}

    public function accepts(string $type): bool
    {
        return $this->allows === null || in_array($type, $this->allows, true);
    }
}
