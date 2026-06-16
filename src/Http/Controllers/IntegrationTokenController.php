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
        $nodeId = $request->string('nodeId')->toString();
        abort_if($nodeId === '', 403);

        $nodeType = $request->string('nodeType')->toString();
        abort_if($nodeType === '', 403);

        abort_unless(str_starts_with($nodeType, 'remote.'), 403);

        $context = $this->references->trustedContext($request, $nodeType, $nodeId);

        abort_unless(($context['integration'] ?? null) === $integration, 403);

        $audience = $request->string('audience')->toString();
        $scopes = $this->scopes($request);

        abort_unless(($context['audience'] ?? null) === $audience, 403);
        abort_unless($this->scopesMatch($context['scopes'] ?? null, $scopes), 403);

        $definition = $this->integrations->resolve($integration);

        abort_unless($definition->authorize($request), 403);

        return response()->json($definition->issueBrowserToken($request));
    }

    /**
     * @return list<string>
     */
    private function scopes(Request $request): array
    {
        $scopes = [];

        foreach ($request->array('scopes') as $scope) {
            abort_unless(is_string($scope), 403);

            $scopes[] = $scope;
        }

        return $scopes;
    }

    /**
     * @param  list<string>  $requested
     */
    private function scopesMatch(mixed $trusted, array $requested): bool
    {
        if (! is_array($trusted)) {
            return false;
        }

        $trustedScopes = [];

        foreach ($trusted as $scope) {
            if (! is_string($scope)) {
                return false;
            }

            $trustedScopes[] = $scope;
        }

        sort($trustedScopes);
        sort($requested);

        return $trustedScopes === $requested;
    }
}
