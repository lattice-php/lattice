<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Orchestra\Testbench\Factories\UserFactory;

it('lists users with their columns', function (): void {
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

it('loads more users in the infinite table', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->assertDontSee('Browser User 26')
        ->click('@pagination-load-more')
        ->assertSee('Browser User 26')
        ->assertNoSmoke();
});

it('sorts and clears sorting', function (): void {
    seedWorkbenchUsers();

    visit('/')
        ->click('@sort-name')
        ->assertSee('1. Name')
        ->assertSee('Ada Lovelace')
        ->click('@sort-email')
        ->assertSee('2. Email')
        ->click('@clear-name-sort')
        ->assertDontSee('1. Name')
        ->assertSee('1. Email')
        ->assertNoSmoke();
});

it('copies a cell value to the clipboard', function (): void {
    User::query()->delete();
    UserFactory::new()->create(['name' => 'Ada Lovelace', 'email' => 'ada@example.com']);

    visit('/')
        ->click('@copy-email')
        ->assertSee('Copied')
        ->assertNoSmoke();
});
