<?php
declare(strict_types=1);

use Pest\Browser\Api\PendingAwaitablePage;

/**
 * The infinite tab's IntersectionObserver auto-fires loadMore() when the
 * sentinel enters its 240px root margin — which can happen before the first
 * page paints under CI load, unmounting the "Load more" button mid-test.
 * use-table bails when the API is undefined, pinning these tests to the
 * manual load path.
 */
function disableInfiniteScrollAutoLoad(PendingAwaitablePage $page): void
{
    $page->script('window.IntersectionObserver = undefined');
}

it('shows pagination modes in lazily loaded tabs', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/tables');
    disableInfiniteScrollAutoLoad($page);

    $page->assertSee('Pagination modes')
        ->assertSee('No pagination')
        ->assertSee('Maya Chen')
        ->assertDontSee('Simple pagination')
        ->assertDontSee('Table pagination')
        ->assertDontSee('Infinite pagination')
        ->click('@tab-simple')
        ->assertSee('Simple pagination')
        ->click('@tab-table')
        ->assertSee('Table pagination');

    eventually(function () use ($page): void {
        $page->assertSee('Showing 1-25 of 30');
    });

    $page->click('@tab-infinite')
        ->assertSee('Infinite pagination');

    eventually(function () use ($page): void {
        $page->assertSee('Load more');
    });

    $page->assertNoSmoke();
});

it('navigates between pages in table pagination mode', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/tables');

    $page->click('@tab-table');
    eventually(function () use ($page): void {
        $page->assertSee('Showing 1-25 of 30');
    });

    $page->click('@pagination-next');
    eventually(function () use ($page): void {
        $page->assertSee('Showing 26-30 of 30');
    });

    $page->click('@pagination-page-1');
    eventually(function () use ($page): void {
        $page->assertSee('Showing 1-25 of 30');
    });

    $page->assertNoSmoke();
});

it('loads more rows in infinite mode', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/tables');
    disableInfiniteScrollAutoLoad($page);

    $page->click('@tab-infinite');
    eventually(function () use ($page): void {
        $page->assertSee('Load more');
    });

    $page->assertDontSee('Browser User 26')
        ->click('@pagination-load-more');

    eventually(function () use ($page): void {
        $page->assertSee('Browser User 26');
    });

    $page->assertNoSmoke();
});

it('keeps the topbar user menu visible on infinite pagination pages', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/tables');
    disableInfiniteScrollAutoLoad($page);

    $page->click('@tab-infinite');
    eventually(function () use ($page): void {
        $page->assertSee('Load more');
    });

    $page->click('@pagination-load-more');
    eventually(function () use ($page): void {
        $page->assertSee('Browser User 26');
    });

    $page->assertVisible('@user-menu');

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
