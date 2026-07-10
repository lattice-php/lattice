<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class RemoteAccess
{
    /**
     * @param  list<string>  $scopes
     */
    public function __construct(
        public string $source,
        public string $audience,
        public array $scopes,
        public string $nodeId,
        public string $nodeType,
        public string $tokenEndpoint,
        public string $ref,
    ) {}
}
