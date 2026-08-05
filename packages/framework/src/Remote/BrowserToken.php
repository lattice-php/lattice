<?php
declare(strict_types=1);

namespace Lattice\Remote;

use Lattice\Core\Attributes\TypeScript;

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
