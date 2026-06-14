<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

use Illuminate\Http\Request;

interface SignsComponentReferences
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function seal(string $type, string $key, array $context): string;

    public function mergeTrustedContext(Request $request, string $type, string $key): Request;

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
}
