<?php
declare(strict_types=1);

use Lattice\Core\Contracts\SignsComponentReferences;

it('exchanges an expired ref for a fresh one that unseals again', function (): void {
    $signer = app(SignsComponentReferences::class);
    $token = $signer->seal('table', 'users', ['scope' => 'active']);

    $this->travel(config('lattice.security.ref_lifetime', 30) + 1)->minutes();

    expect($signer->unseal($token, 'table', 'users'))->toBeNull();

    $response = $this->postJson(route('lattice.refs.refresh'), ['ref' => $token])
        ->assertSuccessful();

    $refreshed = $response->json('ref');

    expect($refreshed)->toBeString()
        ->and($signer->unseal($refreshed, 'table', 'users'))->toBe(['scope' => 'active']);
});

it('rejects a forged ref', function (): void {
    $this->postJson(route('lattice.refs.refresh'), ['ref' => 'not-a-real-token'])
        ->assertForbidden();
});

it('rejects a request without a ref', function (): void {
    $this->postJson(route('lattice.refs.refresh'))
        ->assertForbidden();
});

it('honours the configured middleware stack', function (): void {
    expect(app('router')->getRoutes()->getByName('lattice.refs.refresh')->gatherMiddleware())
        ->toBe(['web']);
});
