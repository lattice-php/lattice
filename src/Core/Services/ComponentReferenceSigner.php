<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Services;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Contracts\Encryption\StringEncrypter;
use Illuminate\Http\Request;
use JsonException;
use Lattice\Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Values\ReferenceIdentity;

final readonly class ComponentReferenceSigner implements SignsComponentReferences
{
    public function __construct(
        private StringEncrypter $encrypter,
        private ResolvesReferenceIdentity $identity,
    ) {}

    public function seal(string $type, string $key, array $context): string
    {
        $identity = $this->identity->current();

        $payload = [
            'type' => $type,
            'key' => $key,
            'context' => $context,
            'user_id' => $identity->userId,
            'session' => $identity->sessionHash,
            'expires_at' => now()->addMinutes($this->lifetime())->timestamp,
        ];

        return $this->encrypter->encryptString(json_encode($payload, JSON_THROW_ON_ERROR));
    }

    public function unseal(string $token, string $type, string $key): ?array
    {
        return $this->verify($token, $type, $key);
    }

    /**
     * @return array<string, mixed>
     */
    public function trustedContext(Request $request, string $type, string $key): array
    {
        $context = $this->verify($this->token($request), $type, $key);

        if ($context === null) {
            abort(403);
        }

        return $context;
    }

    /**
     * Decrypt and fully validate a sealed token: structure, type/key, expiry, and
     * the identity it was bound to. Returns the trusted context on success (an
     * empty array when none was sealed), or null when any check fails — callers
     * turn that into a silent miss (unseal) or a 403 (trustedContext).
     *
     * @return array<string, mixed>|null
     */
    private function verify(string $token, string $type, string $key): ?array
    {
        if ($token === '') {
            return null;
        }

        try {
            $payload = json_decode($this->encrypter->decryptString($token), true, flags: JSON_THROW_ON_ERROR);
        } catch (DecryptException|JsonException) {
            return null;
        }

        if (! is_array($payload)) {
            return null;
        }

        if (($payload['type'] ?? null) !== $type || ($payload['key'] ?? null) !== $key) {
            return null;
        }

        if (! is_int($payload['expires_at'] ?? null) || $payload['expires_at'] < now()->timestamp) {
            return null;
        }

        $identity = $this->identity->current();

        if (! $this->userMatches($identity, $payload['user_id'] ?? null)) {
            return null;
        }

        if (! $this->sessionMatches($identity, $payload['session'] ?? null)) {
            return null;
        }

        return is_array($payload['context'] ?? null) ? $payload['context'] : [];
    }

    private function token(Request $request): string
    {
        return $request->header('X-Lattice-Ref', '');
    }

    private function userMatches(ReferenceIdentity $identity, mixed $userId): bool
    {
        return $userId === null || (string) $userId === (string) $identity->userId;
    }

    private function sessionMatches(ReferenceIdentity $identity, mixed $sessionHash): bool
    {
        if (! is_string($sessionHash)) {
            return true;
        }

        return $identity->sessionHash !== null
            && hash_equals($sessionHash, $identity->sessionHash);
    }

    private function lifetime(): int
    {
        return max(1, (int) config('lattice.security.ref_lifetime', 30));
    }
}
