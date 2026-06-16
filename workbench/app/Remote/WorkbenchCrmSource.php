<?php
declare(strict_types=1);

namespace Workbench\App\Remote;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsRemoteSource;
use Lattice\Lattice\Remote\BrowserToken;
use Lattice\Lattice\Remote\RemoteSchemaEndpoint;
use Lattice\Lattice\Remote\RemoteSourceDefinition;

#[AsRemoteSource('workbench.crm')]
final class WorkbenchCrmSource extends RemoteSourceDefinition
{
    public function schemaEndpoint(Request $request): RemoteSchemaEndpoint
    {
        return RemoteSchemaEndpoint::file(dirname(__DIR__, 2).'/remote/crm-schema.json');
    }

    public function issueBrowserToken(Request $request): BrowserToken
    {
        return new BrowserToken(
            accessToken: 'fake-workbench-crm-token',
            tokenType: 'Bearer',
            expiresIn: 120,
            audience: $request->string('audience')->toString(),
            scopes: $request->array('scopes'),
        );
    }
}
