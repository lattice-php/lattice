<?php
declare(strict_types=1);

namespace Lattice\Table\Support;

use Illuminate\Http\Request;

/**
 * Scopes the page request a synced table/board reads its initial query from.
 * Without a `urlQueryKey()`, the component reads the request's top-level
 * params as-is. With one, only that bracketed key's nested params
 * (`products[q]`, `products[tf][...]`) are exposed, under the unprefixed
 * names the endpoint's own request-parsing already expects — so more than
 * one synced component can share a page without colliding.
 */
final class QueryUrlScope
{
    public static function request(Request $request, ?string $key): Request
    {
        if ($key === null) {
            return $request;
        }

        return $request->duplicate(query: (array) $request->query($key));
    }
}
