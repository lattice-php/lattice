<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class BrowserToken
{
    /**
     * @param  list<string>  $scopes
     */
    public function __construct(
        public string $accessToken,
        public string $tokenType,
        public int $expiresIn,
        public string $audience,
        public array $scopes,
    ) {}
}
