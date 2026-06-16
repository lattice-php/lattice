<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Definition;

abstract class RemoteSourceDefinition extends Definition
{
    /**
     * @param  list<array<string, mixed>>  $manifest
     * @return list<Component>
     */
    protected function schemaFromManifest(array $manifest): array
    {
        return app(RemoteSchemaNormalizer::class)->normalize($manifest, [
            'source' => $this->key(),
        ]);
    }

    protected function key(): string
    {
        return app(RemoteSourceRegistry::class)->keyForDefinition(static::class);
    }

    /**
     * @return list<Component>
     */
    public function schema(Request $request): array
    {
        $endpoint = $this->schemaEndpoint($request);

        if ($endpoint === null) {
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
