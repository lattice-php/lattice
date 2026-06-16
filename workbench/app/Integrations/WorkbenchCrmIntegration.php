<?php
declare(strict_types=1);

namespace Workbench\App\Integrations;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsIntegration;
use Lattice\Lattice\Integrations\BrowserToken;
use Lattice\Lattice\Integrations\IntegrationDefinition;

#[AsIntegration('workbench.crm')]
final class WorkbenchCrmIntegration extends IntegrationDefinition
{
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
