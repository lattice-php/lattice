<?php
declare(strict_types=1);

it('filters rows through the global search box and restores them on clear', function (): void {
    $this->actingAs(workbenchTestUser());
    seedNamedWorkbenchUsers();

    $page = visit('/');

    $page->assertSee('Ada Lovelace')
        ->assertSee('Maya Chen')
        ->fill('@table-search', 'Ada');

    eventually(function () use ($page): void {
        $page->assertDontSee('Maya Chen');
    });

    $page->assertSee('Ada Lovelace')
        ->click('@table-search-clear');

    eventually(function () use ($page): void {
        $page->assertSee('Maya Chen');
    });

    $page->assertNoSmoke();
});

it('matches against a searchable relation-free email column', function (): void {
    $this->actingAs(workbenchTestUser());
    seedNamedWorkbenchUsers();

    $page = visit('/');

    $page->fill('@table-search', 'grace@example.com');

    eventually(function () use ($page): void {
        $page->assertDontSee('Ada Lovelace');
    });

    $page->assertSee('Grace Hopper')
        ->assertNoSmoke();
});
