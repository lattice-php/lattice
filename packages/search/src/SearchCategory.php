<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class SearchCategory
{
    public function __construct(
        public string $name,
        public string $label,
        public ?string $icon = null,
        public ?int $count = null,
    ) {}

    public function withCount(int $count): self
    {
        return new self($this->name, $this->label, $this->icon, $count);
    }
}
