<?php

declare(strict_types=1);

use Workbench\App\Models\User;

beforeEach(function (): void {
    User::query()->create([
        'name' => 'Workbench User',
        'email' => 'workbench@example.com',
        'password' => 'password',
        'locale' => 'en',
    ]);
});

it('signs a workbench user in through the rendered login form', function (): void {
    $page = visit('/login')
        ->assertSee('Lattice Workbench')
        ->click('@form-submit');

    retryUntil(function () use ($page): void {
        $page->assertPathIs('/');
    });

    $page->assertSee('Workbench page')
        ->assertNoSmoke();
});

it('keeps invalid credentials on the login form', function (): void {
    $page = visit('/login')
        ->fill('@password', 'wrong-password')
        ->click('@form-submit');

    retryUntil(function () use ($page): void {
        $page->assertSee('These credentials do not match the seeded workbench user.');
    });

    $page->assertPathIs('/login')
        ->assertNoSmoke();
});
