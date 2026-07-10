<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Chat\Enums\ChatRole;
use Lattice\Lattice\Core\Components\Component;

#[TypeScript]
final readonly class ChatMessage
{
    /**
     * @param  list<Component>  $parts
     */
    public function __construct(
        public string $id,
        public ChatRole $role,
        public array $parts = [],
    ) {}
}
