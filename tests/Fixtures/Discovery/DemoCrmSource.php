<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsRemoteSource;
use Lattice\Lattice\Remote\BrowserToken;
use Lattice\Lattice\Remote\RemoteSourceDefinition;

#[AsRemoteSource('fixtures.crm')]
final class DemoCrmSource extends RemoteSourceDefinition
{
    public function issueBrowserToken(Request $request): BrowserToken
    {
        return new BrowserToken(
            accessToken: 'fake-browser-token',
            tokenType: 'Bearer',
            expiresIn: 120,
            audience: $request->string('audience')->toString(),
            scopes: $request->array('scopes'),
        );
    }
}
