<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Contracts\SignsComponentReferences;

function signer(): SignsComponentReferences
{
    return app(SignsComponentReferences::class);
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
