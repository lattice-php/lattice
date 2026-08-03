<?php
declare(strict_types=1);

it('renders the tree demo page without javascript errors', function (): void {
    $page = visit('/tree');

    $page->assertSee('Electronics')
        ->assertSee('Documents')
        ->assertPresent('[role="tree"]')
        ->assertPresent('[data-test="tree-node-electronics"]')
        ->assertNoJavaScriptErrors();
});
