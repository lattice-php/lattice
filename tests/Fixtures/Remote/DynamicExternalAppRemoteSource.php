<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Remote;

use Illuminate\Http\Request;
use Lattice\Lattice\Remote\BrowserToken;
use Lattice\Lattice\Remote\RemoteSchemaEndpoint;
use Lattice\Lattice\Remote\RemoteSourceDefinition;

final class DynamicExternalAppRemoteSource extends RemoteSourceDefinition
{
    public function __construct(
        private readonly DynamicExternalAppStore $apps,
        private readonly string $sourceKey,
    ) {}

    public function schemaEndpoint(Request $request): ?RemoteSchemaEndpoint
    {
        return $this->apps->schemaEndpoint($this->sourceKey);
    }

    #[\Override]
    public function issueBrowserToken(Request $request): BrowserToken
    {
        return new BrowserToken(
            accessToken: $this->apps->token($this->sourceKey),
            tokenType: 'Bearer',
            expiresIn: 120,
            audience: $request->string('audience')->toString(),
            scopes: $request->array('scopes'),
        );
    }
}
