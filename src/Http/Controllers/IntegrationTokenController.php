<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Integrations\IntegrationRegistry;

final readonly class IntegrationTokenController
{
    public function __construct(
        private IntegrationRegistry $integrations,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $integration): JsonResponse
    {
        $component = $request->string('component')->toString();
        abort_if($component === '', 403);

        $context = $this->references->trustedContext($request, 'integration.browser-data', $component);

        abort_unless(($context['integration'] ?? null) === $integration, 403);

        $definition = $this->integrations->resolve($integration);

        abort_unless($definition->authorize($request), 403);

        return response()->json($definition->issueBrowserToken($request));
    }
}
