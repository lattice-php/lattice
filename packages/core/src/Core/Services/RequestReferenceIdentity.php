<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Services;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Lattice\Core\Values\ReferenceIdentity;

/**
 * Resolves the reference identity from the current request — the single place
 * the signer's user/session binding touches request-scoped state. Resolved lazily
 * per call so it stays correct while bound as a singleton across requests.
 */
final class RequestReferenceIdentity implements ResolvesReferenceIdentity
{
    public function current(): ReferenceIdentity
    {
        $request = app(Request::class);
        $userId = $request->user()?->getAuthIdentifier();

        return new ReferenceIdentity(
            userId: $userId === null ? null : (string) $userId,
            sessionHash: $request->hasSession()
                ? hash('sha256', $request->session()->getId())
                : null,
        );
    }
}
