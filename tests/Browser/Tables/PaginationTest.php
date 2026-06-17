<?php
declare(strict_types=1);

it('shows pagination modes in lazily loaded tabs', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/tables')
        ->assertSee('Pagination modes')
        ->assertSee('No pagination')
        ->assertSee('Maya Chen')
        ->assertDontSee('Simple pagination')
        ->assertDontSee('Table pagination')
        ->assertDontSee('Infinite pagination')
        ->click('@tab-simple')
        ->assertSee('Simple pagination')
        ->click('@tab-table')
        ->assertSee('Table pagination')
        ->assertSee('Showing 1-25 of 30')
        ->click('@tab-infinite')
        ->assertSee('Infinite pagination')
        ->assertSee('Load more')
        ->assertNoSmoke();
});

it('navigates between pages in table pagination mode', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/tables')
        ->click('@tab-table')
        ->assertSee('Showing 1-25 of 30')
        ->click('@pagination-next')
        ->assertSee('Showing 26-30 of 30')
        ->click('@pagination-page-1')
        ->assertSee('Showing 1-25 of 30')
        ->assertNoSmoke();
});

it('loads more rows in infinite mode', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/tables')
        ->click('@tab-infinite')
        ->assertDontSee('Browser User 26')
        ->click('@pagination-load-more')
        ->assertSee('Browser User 26')
        ->assertNoSmoke();
});

it('keeps the topbar user menu visible on infinite pagination pages', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/tables');

    $page->resize(1280, 720)
        ->click('@tab-infinite')
        ->click('@pagination-load-more')
        ->assertSee('Browser User 26')
        ->assertVisible('@user-menu');

    expect($page->script(<<<'JS'
        () => {
            const menu = document.querySelector('[data-test="user-menu"]');

            if (!menu) {
                return false;
            }

            const rect = menu.getBoundingClientRect();

            return rect.top >= 0
                && rect.bottom <= window.innerHeight
                && rect.left >= 0
                && rect.right <= window.innerWidth;
        }
    JS))->toBeTrue();

    $page->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});
