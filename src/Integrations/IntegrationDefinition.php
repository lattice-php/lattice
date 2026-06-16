<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Definition;

abstract class IntegrationDefinition extends Definition
{
    public function issueBrowserToken(Request $request): BrowserToken
    {
        abort(403);
    }
}
