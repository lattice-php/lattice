<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Services;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Contracts\Encryption\StringEncrypter;
use Illuminate\Http\Request;
use JsonException;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;

final readonly class ComponentReferenceSigner implements SignsComponentReferences
{
    public function __construct(private StringEncrypter $encrypter) {}

    /**
     * @param  array<string, mixed>  $context
     */
    public function seal(string $type, string $key, array $context): string
    {
        $request = app(Request::class);
        $sessionHash = $request->hasSession()
            ? hash('sha256', $request->session()->getId())
            : null;

        $payload = [
            'type' => $type,
            'key' => $key,
            'context' => $context,
            'user_id' => $request->user()?->getAuthIdentifier(),
            'session' => $sessionHash,
            'expires_at' => now()->addMinutes($this->lifetime())->timestamp,
        ];

        return $this->encrypter->encryptString(json_encode($payload, JSON_THROW_ON_ERROR));
    }

    public function unseal(string $token, string $type, string $key): ?array
    {
        return $this->verify(app(Request::class), $token, $type, $key);
    }

    /**
     * @return array<string, mixed>
     */
    public function trustedContext(Request $request, string $type, string $key): array
    {
        $context = $this->verify($request, $this->token($request), $type, $key);

        if ($context === null) {
            abort(403);
        }

        return $context;
    }

    /**
     * Decrypt and fully validate a sealed token: structure, type/key, expiry, and
     * the user and session it was bound to. Returns the trusted context on success
     * (an empty array when none was sealed), or null when any check fails — callers
     * turn that into a silent miss (unseal) or a 403 (trustedContext).
     *
     * @return array<string, mixed>|null
     */
    private function verify(Request $request, string $token, string $type, string $key): ?array
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

        if (! $this->userMatches($request, $payload['user_id'] ?? null)) {
            return null;
        }

        if (! $this->sessionMatches($request, $payload['session'] ?? null)) {
            return null;
        }

        return is_array($payload['context'] ?? null) ? $payload['context'] : [];
    }

    private function token(Request $request): string
    {
        return $request->header('X-Lattice-Ref', '');
    }

    private function userMatches(Request $request, mixed $userId): bool
    {
        return $userId === null
            || (string) $userId === (string) $request->user()?->getAuthIdentifier();
    }

    private function sessionMatches(Request $request, mixed $sessionHash): bool
    {
        if (! is_string($sessionHash)) {
            return true;
        }

        return $request->hasSession()
            && hash_equals($sessionHash, hash('sha256', $request->session()->getId()));
    }

    private function lifetime(): int
    {
        return max(1, (int) config('lattice.security.ref_lifetime', 30));
    }
}
