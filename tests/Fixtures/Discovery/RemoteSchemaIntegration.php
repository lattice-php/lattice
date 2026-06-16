<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsIntegration;
use Lattice\Lattice\Integrations\BrowserToken;
use Lattice\Lattice\Integrations\ExternalSchemaEndpoint;
use Lattice\Lattice\Integrations\IntegrationDefinition;

#[AsIntegration('fixtures.remote-crm')]
final class RemoteSchemaIntegration extends IntegrationDefinition
{
    public static ?ExternalSchemaEndpoint $endpoint = null;

    public static function reset(): void
    {
        self::$endpoint = null;
    }

    public function schemaEndpoint(Request $request): ?ExternalSchemaEndpoint
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
