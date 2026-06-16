<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsRemoteSource;
use Lattice\Lattice\Remote\BrowserToken;
use Lattice\Lattice\Remote\RemoteSchemaEndpoint;
use Lattice\Lattice\Remote\RemoteSourceDefinition;

#[AsRemoteSource('fixtures.remote-crm')]
final class RemoteSchemaSource extends RemoteSourceDefinition
{
    public static ?RemoteSchemaEndpoint $endpoint = null;

    public static function reset(): void
    {
        self::$endpoint = null;
    }

    public function schemaEndpoint(Request $request): ?RemoteSchemaEndpoint
    {
        return self::$endpoint;
    }

    public function issueBrowserToken(Request $request): BrowserToken
    {
        return new BrowserToken(
            accessToken: 'fake-remote-token',
            tokenType: 'Bearer',
            expiresIn: 120,
            audience: $request->string('audience')->toString(),
            scopes: $request->array('scopes'),
        );
    }
}
