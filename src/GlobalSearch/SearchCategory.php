<?php
declare(strict_types=1);

namespace Lattice\Lattice\GlobalSearch;

use JsonSerializable;

final readonly class SearchCategory implements JsonSerializable
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

    /** @return array{name:string,label:string,icon:?string,count:?int} */
    public function jsonSerialize(): array
    {
        return [
            'name' => $this->name,
            'label' => $this->label,
            'icon' => $this->icon,
            'count' => $this->count,
        ];
    }
}
