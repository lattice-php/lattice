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

it('loads more workbench users in the infinite table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->click('Load more')
        ->assertSee('Maya Chen')
        ->assertSee('Browser User 26')
        ->assertNoSmoke();
});

it('sorts workbench users in the table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->click('@sort-name')
        ->assertSee('1. Name')
        ->assertSee('Ada Lovelace')
        ->assertSee('Browser User 26')
        ->assertDontSee('Maya Chen')
        ->click('@sort-email')
        ->assertSee('2. Email')
        ->click('@clear-name-sort')
        ->assertDontSee('1. Name')
        ->assertSee('1. Email')
        ->assertNoSmoke();
});

it('filters workbench users in the table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->fill('[aria-label="Filter Name"]', 'Ada')
        ->keys('[aria-label="Filter Name"]', 'Enter')
        ->assertSee('Ada Lovelace')
        ->assertDontSee('Maya Chen')
        ->assertDontSee('Grace Hopper')
        ->assertNoSmoke();
});

it('showcases pagination types in lazily loaded tabs', function (): void {
    seedWorkbenchUsers();

    visit('/tables')
        ->assertSee('Pagination modes')
        ->assertSee('No pagination')
        ->assertSee('Maya Chen')
        ->assertDontSee('Simple pagination')
        ->assertDontSee('Table pagination')
        ->assertDontSee('Infinite pagination')
        ->click('Simple')
        ->assertSee('Simple pagination')
        ->assertSee('Previous')
        ->assertSee('Next')
        ->click('Table')
        ->assertSee('Table pagination')
        ->assertSee('Showing 1-25 of 30')
        ->assertSee('Previous')
        ->assertSee('Next')
        ->click('Infinite')
        ->assertSee('Infinite pagination')
        ->assertSee('Load more')
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
