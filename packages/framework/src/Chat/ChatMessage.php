<?php

declare(strict_types=1);

namespace Lattice\Chat;

use Lattice\Chat\Enums\ChatRole;
use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

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
