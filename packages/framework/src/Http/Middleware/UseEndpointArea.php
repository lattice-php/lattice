<?php
declare(strict_types=1);

namespace Lattice\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Lattice\Core\Services\EndpointAreas;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves a route's request from an endpoint area registered with
 * `Lattice::endpoints()`, for pages that cannot declare
 * `#[AsPage(endpoints: …)]` themselves: a package's page rendered by the
 * package's own controller, or any Inertia response that builds components.
 * Usage: `UseEndpointArea::class.':account'`.
 */
final readonly class UseEndpointArea
{
    public function __construct(private EndpointAreas $areas) {}

    public function handle(Request $request, Closure $next, string $area): Response
    {
        $this->areas->activate($area);

        return $next($request);
    }
}
