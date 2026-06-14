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

it('persists resized column widths until the column keys change', function (): void {
    seedWorkbenchUsers();

    $page = visit('/');

    $page->resize(1280, 800)
        ->script('() => window.localStorage.clear()');

    $page->assertPresent('[aria-label="Resize Name"]')
        ->keys('[aria-label="Resize Name"]', 'ArrowRight')
        ->assertNoJavaScriptErrors();

    expect($page->script(<<<'JS'
        () => JSON.parse(window.localStorage.getItem('lattice:table-columns:workbench.users'))
    JS))->toEqual([
        'columns' => ['name', 'email', 'created_at', 'updated_at'],
        'overrides' => [
            'name' => 184,
        ],
    ]);

    $page->refresh();

    $page->assertPresent('[aria-label="Resize Name"]');

    expect(workbenchUsersTableColumns($page))->toStartWith('184px ');

    $page->script(<<<'JS'
        () => window.localStorage.setItem('lattice:table-columns:workbench.users', JSON.stringify({
            columns: ['name'],
            overrides: { name: 240 },
        }))
    JS);

    $page->refresh();

    $page->assertPresent('[aria-label="Resize Name"]');

    expect($page->script(
        "() => window.localStorage.getItem('lattice:table-columns:workbench.users')",
    ))->toBeNull()
        ->and(workbenchUsersTableColumns($page))->toStartWith('minmax(8rem, 1fr) ');

    $page->assertNoSmoke();
});

it('reveals a reset control once columns are resized and clears them on click', function (): void {
    seedWorkbenchUsers();

    $page = visit('/');
    $page->resize(1280, 800)->script('() => window.localStorage.clear()');
    $page->refresh();

    $page->assertPresent('[aria-label="Resize Name"]')
        ->assertMissing('@table-reset-columns');

    $page->keys('[aria-label="Resize Name"]', 'ArrowRight')
        ->assertPresent('@table-reset-columns')
        ->assertNoJavaScriptErrors();

    expect($page->script(
        "() => window.localStorage.getItem('lattice:table-columns:workbench.users')",
    ))->not->toBeNull();

    $page->click('@table-reset-columns')
        ->assertMissing('@table-reset-columns');

    expect($page->script(
        "() => window.localStorage.getItem('lattice:table-columns:workbench.users')",
    ))->toBeNull()
        ->and(workbenchUsersTableColumns($page))->toStartWith('minmax(8rem, 1fr) ');

    $page->assertNoSmoke();
});

function workbenchUsersTableColumns(mixed $page): string
{
    return (string) $page->script(<<<'JS'
        () => {
            const row = document.querySelector('[data-lattice-component="workbench.users"] [role="row"][style*="--lattice-table-columns"]');

            return getComputedStyle(row).getPropertyValue('--lattice-table-columns').trim();
        }
    JS);
}
