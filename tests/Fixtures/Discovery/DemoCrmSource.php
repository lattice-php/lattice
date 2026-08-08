<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsRemoteSource;
use Lattice\Remote\BrowserToken;
use Lattice\Remote\RemoteSourceDefinition;

#[AsRemoteSource('fixtures.crm')]
final class DemoCrmSource extends RemoteSourceDefinition
{
    #[\Override]
    public function issueBrowserToken(Request $request): BrowserToken
    {
        return new BrowserToken(
            accessToken: 'fake-browser-token',
            tokenType: 'Bearer',
            expiresIn: 120,
            audience: $request->string('audience')->toString(),
            scopes: array_values(array_map(strval(...), $request->array('scopes'))),
        );
    }
}
