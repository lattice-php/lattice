<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class RemoteAccess implements JsonSerializable
{
    /**
     * @param  list<string>  $scopes
     */
    public function __construct(
        public string $integration,
        public string $audience,
        public array $scopes,
        public string $nodeId,
        public string $nodeType,
        public string $ref,
    ) {}

    /**
     * @return array{integration: string, audience: string, scopes: list<string>, nodeId: string, nodeType: string, ref: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'integration' => $this->integration,
            'audience' => $this->audience,
            'scopes' => $this->scopes,
            'nodeId' => $this->nodeId,
            'nodeType' => $this->nodeType,
            'ref' => $this->ref,
        ];
    }
}
