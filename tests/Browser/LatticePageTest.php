<?php

declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Orchestra\Testbench\Factories\UserFactory;

it('loads the workbench lattice page without browser smoke failures', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->assertSee('Workbench page')
        ->assertSee('Lattice Package')
        ->assertNoSmoke();
});

it('lists workbench users in the table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->assertSee('Workbench users')
        ->assertSee('Maya Chen')
        ->assertSee('Ada Lovelace')
        ->assertSee('Created at')
        ->assertSee('Updated at')
        ->assertDontSee('Browser User 26')
        ->assertNoSmoke();
});

it('paginates workbench users in the table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->click('Next')
        ->assertSee('Browser User 26')
        ->assertDontSee('Maya Chen')
        ->assertNoSmoke();
});

it('sorts workbench users in the table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->click('Sort Name')
        ->assertSee('Sorted by')
        ->assertSee('1. Name ascending')
        ->assertSee('Ada Lovelace')
        ->assertSee('Browser User 26')
        ->assertDontSee('Maya Chen')
        ->click('Sort Email')
        ->assertSee('2. Email ascending')
        ->click('@clear-name-sort')
        ->assertDontSee('Name ascending')
        ->assertSee('1. Email ascending')
        ->assertNoSmoke();
});

it('filters workbench users in the table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->fill('Filter Name', 'Ada')
        ->click('Apply filters')
        ->assertSee('Ada Lovelace')
        ->assertDontSee('Maya Chen')
        ->assertDontSee('Grace Hopper')
        ->assertNoSmoke();
});

function seedWorkbenchUsers(): void
{
    User::query()->delete();

    UserFactory::new()->create([
        'name' => 'Maya Chen',
        'email' => 'maya@example.com',
    ]);

    UserFactory::new()->create([
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
    ]);

    UserFactory::new()->create([
        'name' => 'Grace Hopper',
        'email' => 'grace@example.com',
    ]);

    UserFactory::new()->create([
        'name' => 'Katherine Johnson',
        'email' => 'katherine@example.com',
    ]);

    foreach (range(1, 26) as $number) {
        UserFactory::new()->create([
            'name' => "Browser User {$number}",
            'email' => "browser-user-{$number}@example.com",
        ]);
    }
}
