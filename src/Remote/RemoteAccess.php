<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class RemoteAccess implements JsonSerializable
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

    /**
     * @return array{source: string, audience: string, scopes: list<string>, nodeId: string, nodeType: string, tokenEndpoint: string, ref: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'source' => $this->source,
            'audience' => $this->audience,
            'scopes' => $this->scopes,
            'nodeId' => $this->nodeId,
            'nodeType' => $this->nodeType,
            'tokenEndpoint' => $this->tokenEndpoint,
            'ref' => $this->ref,
        ];
    }
}
