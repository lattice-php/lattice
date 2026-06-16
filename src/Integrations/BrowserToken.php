<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations;

use JsonSerializable;

final readonly class BrowserToken implements JsonSerializable
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

    /**
     * @return array{accessToken: string, tokenType: string, expiresIn: int, audience: string, scopes: list<string>}
     */
    public function jsonSerialize(): array
    {
        return [
            'accessToken' => $this->accessToken,
            'tokenType' => $this->tokenType,
            'expiresIn' => $this->expiresIn,
            'audience' => $this->audience,
            'scopes' => $this->scopes,
        ];
    }
}
