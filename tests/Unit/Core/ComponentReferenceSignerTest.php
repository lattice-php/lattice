<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;

function signer(): SignsComponentReferences
{
    return app(SignsComponentReferences::class);
}

function bindRequestWithSession(string $sessionId): Request
{
    $request = Request::create('/');
    $session = app('session')->driver();
    $session->setId($sessionId);
    $request->setLaravelSession($session);
    app()->instance('request', $request);

    return $request;
}

function bindRequestForUser(mixed $user): Request
{
    $request = Request::create('/');
    app()->instance('request', $request);
    // Bind first: instance() fires the auth request-rebinding handler, which
    // overwrites the user resolver — so set ours after the container has it.
    $request->setUserResolver(fn (): mixed => $user);

    return $request;
}

it('unseals a token it sealed and returns the context', function (): void {
    $token = signer()->seal('file', 'avatar', ['disk' => 's3', 'path' => 'uploads/a.jpg']);

    expect(signer()->unseal($token, 'file', 'avatar'))
        ->toBe(['disk' => 's3', 'path' => 'uploads/a.jpg']);
});

it('returns null for a token with the wrong type or key', function (): void {
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    expect(signer()->unseal($token, 'file', 'other'))->toBeNull()
        ->and(signer()->unseal($token, 'table', 'avatar'))->toBeNull();
});

it('returns null for a forged or empty token', function (): void {
    expect(signer()->unseal('not-a-real-token', 'file', 'avatar'))->toBeNull()
        ->and(signer()->unseal('', 'file', 'avatar'))->toBeNull();
});

it('returns null once the token has expired', function (): void {
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    $this->travel(config('lattice.security.ref_lifetime', 30) + 1)->minutes();

    expect(signer()->unseal($token, 'file', 'avatar'))->toBeNull();
});

it('unseals a token for the user it was sealed for', function (): void {
    bindRequestForUser(workbenchTestUser());
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    expect(signer()->unseal($token, 'file', 'avatar'))->toBe(['path' => 'x']);
});

it('returns null for a token sealed for a different user', function (): void {
    bindRequestForUser(workbenchTestUser());
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    bindRequestForUser(workbenchTestUser());

    expect(signer()->unseal($token, 'file', 'avatar'))->toBeNull();
});

it('unseals a token while its sealed session still matches', function (): void {
    bindRequestWithSession(str_repeat('a', 40));
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    expect(signer()->unseal($token, 'file', 'avatar'))->toBe(['path' => 'x']);
});

it('returns null once the sealed session no longer matches', function (): void {
    $session = bindRequestWithSession(str_repeat('a', 40))->session();
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    $session->setId(str_repeat('b', 40));

    expect(signer()->unseal($token, 'file', 'avatar'))->toBeNull();
});
