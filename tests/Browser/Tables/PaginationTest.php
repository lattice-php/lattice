<?php

declare(strict_types=1);

beforeEach(fn () => seedWorkbenchUsers());

it('shows pagination modes in lazily loaded tabs', function (): void {
    visit('/tables')
        ->assertSee('Pagination modes')
        ->assertSee('No pagination')
        ->assertSee('Maya Chen')
        ->assertDontSee('Simple pagination')
        ->assertDontSee('Table pagination')
        ->assertDontSee('Infinite pagination')
        ->click('Simple')
        ->assertSee('Simple pagination')
        ->click('Table')
        ->assertSee('Table pagination')
        ->assertSee('Showing 1-25 of 30')
        ->click('Infinite')
        ->assertSee('Infinite pagination')
        ->assertSee('Load more')
        ->assertNoSmoke();
});

it('navigates between pages in table pagination mode', function (): void {
    visit('/tables')
        ->click('Table')
        ->assertSee('Showing 1-25 of 30')
        ->click('@pagination-next')
        ->assertSee('Showing 26-30 of 30')
        ->click('@pagination-page-1')
        ->assertSee('Showing 1-25 of 30')
        ->assertNoSmoke();
});

it('loads more rows in infinite mode', function (): void {
    visit('/tables')
        ->click('Infinite')
        ->assertDontSee('Browser User 26')
        ->click('@pagination-load-more')
        ->assertSee('Browser User 26')
        ->assertNoSmoke();
});
