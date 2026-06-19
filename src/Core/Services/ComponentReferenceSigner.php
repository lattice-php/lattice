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

        $request = app(Request::class);

        $userId = $payload['user_id'] ?? null;
        if ($userId !== null && (string) $userId !== (string) $request->user()?->getAuthIdentifier()) {
            return null;
        }

        $session = $payload['session'] ?? null;
        if (is_string($session) && (! $request->hasSession() || ! hash_equals($session, hash('sha256', $request->session()->getId())))) {
            return null;
        }

        return is_array($payload['context'] ?? null) ? $payload['context'] : [];
    }

    /**
     * @return array<string, mixed>
     */
    public function trustedContext(Request $request, string $type, string $key): array
    {
        $payload = $this->payload($request);

        if (($payload['type'] ?? null) !== $type || ($payload['key'] ?? null) !== $key) {
            abort(403);
        }

        if (! is_int($payload['expires_at'] ?? null) || $payload['expires_at'] < now()->timestamp) {
            abort(403);
        }

        $this->validateUser($request, $payload['user_id'] ?? null);
        $this->validateSession($request, $payload['session'] ?? null);

        return is_array($payload['context'] ?? null) ? $payload['context'] : [];
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Request $request): array
    {
        $token = $this->token($request);

        if ($token === '') {
            abort(403);
        }

        try {
            $payload = json_decode($this->encrypter->decryptString($token), true, flags: JSON_THROW_ON_ERROR);
        } catch (DecryptException|JsonException) {
            abort(403);
        }

        if (! is_array($payload)) {
            abort(403);
        }

        return $payload;
    }

    private function token(Request $request): string
    {
        return $request->header('X-Lattice-Ref', '');
    }

    private function validateUser(Request $request, mixed $userId): void
    {
        if ($userId === null) {
            return;
        }

        if ((string) $userId !== (string) $request->user()?->getAuthIdentifier()) {
            abort(403);
        }
    }

    private function validateSession(Request $request, mixed $sessionHash): void
    {
        if (! is_string($sessionHash)) {
            return;
        }

        if (! $request->hasSession() || ! hash_equals($sessionHash, hash('sha256', $request->session()->getId()))) {
            abort(403);
        }
    }

    private function lifetime(): int
    {
        return max(1, (int) config('lattice.security.ref_lifetime', 30));
    }
}
