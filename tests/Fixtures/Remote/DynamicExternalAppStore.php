<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Remote;

use Lattice\Lattice\Remote\RemoteSchemaEndpoint;

final class DynamicExternalAppStore
{
    /**
     * @var array<string, array{schemaEndpoint: RemoteSchemaEndpoint, token: string}>
     */
    private array $apps = [];

    public function register(string $sourceKey, RemoteSchemaEndpoint $schemaEndpoint, string $token): void
    {
        $this->apps[$sourceKey] = [
            'schemaEndpoint' => $schemaEndpoint,
            'token' => $token,
        ];
    }

    public function schemaEndpoint(string $sourceKey): ?RemoteSchemaEndpoint
    {
        return $this->apps[$sourceKey]['schemaEndpoint'] ?? null;
    }

    public function token(string $sourceKey): string
    {
        return $this->apps[$sourceKey]['token'] ?? 'missing-token';
    }
}
