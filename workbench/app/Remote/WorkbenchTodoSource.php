<?php
declare(strict_types=1);

namespace Workbench\App\Remote;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsRemoteSource;
use Lattice\Remote\BrowserToken;
use Lattice\Remote\RemoteSchemaEndpoint;
use Lattice\Remote\RemoteSourceDefinition;

#[AsRemoteSource('workbench.todos')]
final class WorkbenchTodoSource extends RemoteSourceDefinition
{
    public function schemaEndpoint(Request $request): RemoteSchemaEndpoint
    {
        return RemoteSchemaEndpoint::file(dirname(__DIR__, 2).'/remote/todo-schema.json');
    }

    #[\Override]
    public function issueBrowserToken(Request $request): BrowserToken
    {
        return new BrowserToken(
            accessToken: 'fake-workbench-todos-token',
            tokenType: 'Bearer',
            expiresIn: 120,
            audience: $request->string('audience')->toString(),
            scopes: array_values(array_map(strval(...), $request->array('scopes'))),
        );
    }
}
