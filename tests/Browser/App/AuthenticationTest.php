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
    visit('/login')
        ->assertSee('Lattice Workbench')
        ->click('@form-submit')
        ->assertPathIs('/')
        ->assertSee('Workbench page')
        ->assertNoSmoke();
});

it('keeps invalid credentials on the login form', function (): void {
    visit('/login')
        ->fill('@password', 'wrong-password')
        ->click('@form-submit')
        ->assertPathIs('/login')
        ->assertSee('These credentials do not match the seeded workbench user.')
        ->assertNoSmoke();
});
