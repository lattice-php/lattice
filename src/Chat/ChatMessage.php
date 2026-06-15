<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Chat\Enums\ChatRole;

#[TypeScript]
final readonly class ChatMessage implements JsonSerializable
{
    /**
     * @param  list<ChatPart>  $parts
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
                static fn (ChatPart $part): array => $part->jsonSerialize(),
                $this->parts,
            ),
        ];
    }
}
