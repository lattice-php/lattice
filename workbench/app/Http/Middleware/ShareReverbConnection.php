<?php

declare(strict_types=1);

namespace Workbench\App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Shares the per-worker Reverb connection params as an Inertia prop so the
 * client can call configureEcho() at runtime. The value is populated only by
 * the browser test harness; it is null (and therefore absent) in normal use.
 *
 * Sharing happens per request because the browser test server flushes Inertia's
 * shared props at the start of every request.
 */
final class ShareReverbConnection
{
    public function handle(Request $request, Closure $next): Response
    {
        $reverb = config('workbench.reverb');

        if ($reverb !== null) {
            Inertia::share('reverb', $reverb);
        }

        return $next($request);
    }
}
