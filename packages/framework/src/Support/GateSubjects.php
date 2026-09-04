<?php
declare(strict_types=1);

namespace Lattice\Support;

use Illuminate\Http\Request;
use Lattice\Core\Services\ContextResolutions;
use Lattice\Core\Services\ContextResolvers;
use Lattice\Http\Middleware\AuthorizeGateSubject;
use Lattice\Http\Page;

/**
 * Resolves a page's `on` gate subject from a route parameter, shared by
 * {@see Page::gateSubject()} and
 * {@see AuthorizeGateSubject} so the render path and
 * the route middleware can never resolve the same key differently.
 */
final class GateSubjects
{
    public static function fromRoute(Request $request, string $key): ?object
    {
        $value = $request->route($key);

        if (is_object($value)) {
            return $value;
        }

        if ($value === null || ! app(ContextResolvers::class)->has($key)) {
            return null;
        }

        return app(ContextResolutions::class)->resolve($key, $value, $request->route()?->parameters() ?? []);
    }
}
