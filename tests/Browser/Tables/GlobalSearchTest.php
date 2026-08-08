<?php
declare(strict_types=1);

it('filters rows through the global search box and restores them on clear', function (): void {
    $page = $this->visitWithSeededUsers(namedUsersOnly: true);

    $page->assertSee('Ada Lovelace')
        ->assertSee('Maya Chen')
        ->fill('@table-search', 'Ada');

    assertDontSeeEventually($page, 'Maya Chen');

    $page->assertSee('Ada Lovelace')
        ->click('@table-search-clear');

    assertSeeEventually($page, 'Maya Chen');

    $page->assertNoSmoke();
});

it('matches against a searchable relation-free email column', function (): void {
    $page = $this->visitWithSeededUsers(namedUsersOnly: true);

    $page->fill('@table-search', 'grace@example.com');

    assertDontSeeEventually($page, 'Ada Lovelace');

    $page->assertSee('Grace Hopper')
        ->assertNoSmoke();
});
