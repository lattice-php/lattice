<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsIntegration;
use Lattice\Lattice\Integrations\BrowserToken;
use Lattice\Lattice\Integrations\IntegrationDefinition;

#[AsIntegration('fixtures.crm')]
final class DemoCrmIntegration extends IntegrationDefinition
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
