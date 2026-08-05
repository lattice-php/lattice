<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

use Illuminate\Http\Request;

interface SignsComponentReferences
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function seal(string $type, string $key, array $context): string;

    /**
     * @return array<string, mixed>
     */
    public function trustedContext(Request $request, string $type, string $key): array;

    /**
     * Decrypt and verify a token sealed with {@see seal()}. Returns the trusted
     * context, or null when the token is missing, forged, expired, or bound to a
     * different type/key/user/session. Never aborts — callers skip invalid tokens.
     *
     * @return array<string, mixed>|null
     */
    public function unseal(string $token, string $type, string $key): ?array;

    /**
     * Re-seal a token whose lifetime has (or is about to have) run out. The
     * token's integrity and identity binding are fully verified — only expiry
     * is ignored, so a long-lived tab can renew its refs without a reload while
     * a forged token or a rotated session still fails. Returns the fresh token,
     * or null when the token is missing, forged, or bound to another identity.
     */
    public function refresh(string $token): ?string;
}
