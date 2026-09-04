<?php
declare(strict_types=1);

namespace Lattice\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Http\Page;
use Lattice\LatticeServiceProvider;
use Lattice\Support\GateSubjects;
use Symfony\Component\HttpFoundation\Response;

/**
 * The route-middleware half of a page's `can: … on: …` declaration
 * ({@see LatticeServiceProvider::bootPages()} emits it in place of
 * the framework `can:` middleware whenever `on` is set): Laravel's own `can:`
 * middleware hands an unbound route parameter to the gate as a raw scalar, so
 * it cannot see a `Lattice::context()` resolver. This resolves the subject
 * through the same {@see GateSubjects::fromRoute()} {@see Page::gateSubject()}
 * uses, so the middleware and the page body never disagree about the subject.
 */
final class AuthorizeGateSubject
{
    public function handle(Request $request, Closure $next, string $ability, string $on): Response
    {
        $subject = GateSubjects::fromRoute($request, $on);

        abort_if($subject === null, 403);

        Gate::forUser($request->user())->authorize($ability, [$subject]);

        return $next($request);
    }
}
