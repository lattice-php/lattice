<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Values\ReferenceIdentity;
use Lattice\Lattice\Tests\Fixtures\Core\FakeReferenceIdentity;

function signer(): SignsComponentReferences
{
    return app(SignsComponentReferences::class);
}

function fakeIdentity(): FakeReferenceIdentity
{
    $identity = new FakeReferenceIdentity;
    app()->instance(ResolvesReferenceIdentity::class, $identity);

    return $identity;
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
    $identity = fakeIdentity();
    $identity->identity = new ReferenceIdentity('7', null);

    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    expect(signer()->unseal($token, 'file', 'avatar'))->toBe(['path' => 'x']);
});

it('returns null for a token sealed for a different user', function (): void {
    $identity = fakeIdentity();
    $identity->identity = new ReferenceIdentity('7', null);
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    $identity->identity = new ReferenceIdentity('8', null);

    expect(signer()->unseal($token, 'file', 'avatar'))->toBeNull();
});

it('unseals a token while its sealed session still matches', function (): void {
    $identity = fakeIdentity();
    $identity->identity = new ReferenceIdentity(null, 'session-hash-a');

    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    expect(signer()->unseal($token, 'file', 'avatar'))->toBe(['path' => 'x']);
});

it('returns null once the sealed session no longer matches', function (): void {
    $identity = fakeIdentity();
    $identity->identity = new ReferenceIdentity(null, 'session-hash-a');
    $token = signer()->seal('file', 'avatar', ['path' => 'x']);

    $identity->identity = new ReferenceIdentity(null, 'session-hash-b');

    expect(signer()->unseal($token, 'file', 'avatar'))->toBeNull();
});
