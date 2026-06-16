<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Chat\Enums\ChatRole;
use Lattice\Lattice\Core\Components\Component;

#[TypeScript]
final readonly class ChatMessage implements JsonSerializable
{
    /**
     * @param  list<Component>  $parts
     */
    public function __construct(
        public string $id,
        public ChatRole $role,
        public array $parts = [],
    ) {}

    /**
     * @return array{id: string, role: string, parts: list<array<string, mixed>>}
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role->value,
            'parts' => array_map(
                static fn (Component $part): array => $part->jsonSerialize(),
                $this->parts,
            ),
        ];
    }
}
