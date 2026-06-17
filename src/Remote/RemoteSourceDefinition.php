<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Definition;

abstract class RemoteSourceDefinition extends Definition
{
    private ?string $sourceKey = null;

    public function sourceKey(): string
    {
        return $this->sourceKey ?? app(RemoteSourceRegistry::class)->keyForDefinition(static::class);
    }

    public function withSourceKey(string $sourceKey): static
    {
        $this->sourceKey = $sourceKey;

        return $this;
    }

    /**
     * @param  list<array<string, mixed>>  $manifest
     * @return list<Component>
     */
    protected function schemaFromManifest(array $manifest): array
    {
        return app(RemoteSchemaNormalizer::class)->normalize($manifest, [
            'source' => $this->sourceKey(),
        ]);
    }

    /**
     * @return list<Component>
     */
    public function schema(Request $request): array
    {
        $endpoint = $this->schemaEndpoint($request);

        if (! $endpoint instanceof RemoteSchemaEndpoint) {
            return [];
        }

        return app(RemoteSchemaResolver::class)->resolve($this, $endpoint, $request);
    }

    public function schemaEndpoint(Request $request): ?RemoteSchemaEndpoint
    {
        return null;
    }

    public function issueBrowserToken(Request $request): BrowserToken
    {
        abort(403);
    }
}
