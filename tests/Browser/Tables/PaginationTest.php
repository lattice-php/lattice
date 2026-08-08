<?php
declare(strict_types=1);

use Workbench\App\Models\User;

it('shows pagination modes in lazily loaded tabs', function (): void {
    $page = $this->visitWithSeededUsers('/tables/pagination');
    disableInfiniteScrollAutoLoad($page);

    $page->assertSee('Pagination')
        ->assertSee('No pagination')
        ->assertSee('Maya Chen')
        ->assertDontSee('Simple pagination')
        ->assertDontSee('Table pagination')
        ->assertDontSee('Infinite pagination')
        ->click('@tab-simple')
        ->assertSee('Simple pagination')
        ->click('@tab-table')
        ->assertSee('Table pagination');

    assertSeeEventually($page, 'Showing 1-25 of '.User::query()->count());

    $page->click('@tab-infinite')
        ->assertSee('Infinite pagination');

    assertSeeEventually($page, 'Load more');

    $page->assertNoSmoke();
});

it('navigates between pages in table pagination mode', function (): void {
    $page = $this->visitWithSeededUsers('/tables/pagination');

    $total = User::query()->count();

    $page->click('@tab-table');
    assertSeeEventually($page, "Showing 1-25 of {$total}");

    $page->click('@pagination-next');
    assertSeeEventually($page, "Showing 26-{$total} of {$total}");

    $page->click('@pagination-page-1');
    assertSeeEventually($page, "Showing 1-25 of {$total}");

    $page->assertNoSmoke();
});

it('loads more rows in infinite mode', function (): void {
    $page = $this->visitWithSeededUsers('/tables/pagination');
    disableInfiniteScrollAutoLoad($page);

    $page->click('@tab-infinite');
    assertSeeEventually($page, 'Load more');

    $page->assertDontSee('Browser User 26')
        ->click('@pagination-load-more');

    assertSeeEventually($page, 'Browser User 26');

    $page->assertNoSmoke();
});

it('keeps the topbar user menu visible on infinite pagination pages', function (): void {
    $page = $this->visitWithSeededUsers('/tables/pagination');
    disableInfiniteScrollAutoLoad($page);

    $page->click('@tab-infinite');
    assertSeeEventually($page, 'Load more');

    $page->click('@pagination-load-more');
    assertSeeEventually($page, 'Browser User 26');

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
