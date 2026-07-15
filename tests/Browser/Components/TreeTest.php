<?php
declare(strict_types=1);

it('renders the tree demo with categories, active state, and row actions', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/components/tree')
        ->assertSee('Electronics')
        ->assertSee('Laptops')
        ->assertSee('Phones')
        ->assertSee('Clothing')
        ->assertSee('Documents')
        ->assertNotPresent('[data-test="tree-node-clothing-men"]')
        ->assertAriaAttribute('[data-test="tree-node-electronics-phones"]', 'selected', 'true')
        ->click('[data-test="tree-documents-actions"]')
        ->assertPresent('[data-test="action-tree-documents-rename"]')
        ->assertPresent('[data-test="action-tree-documents-archive"]')
        ->assertSee('Rename')
        ->assertSee('Archive')
        ->assertNoJavaScriptErrors();
});

it('expands a collapsed subtree and reveals its children when the chevron is clicked', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/components/tree')
        ->assertNotPresent('[data-test="tree-node-clothing-men"]')
        ->click('[data-test="tree-node-clothing-toggle"]');

    eventually(function () use ($page): void {
        $page->assertPresent('[data-test="tree-node-clothing-men"]');
    });

    $page
        ->assertSee('Men')
        ->assertSee('Women')
        ->assertAriaAttribute('[data-test="tree-node-clothing"]', 'expanded', 'true')
        ->assertNoJavaScriptErrors();
});

it('moves focus with ArrowDown and expands a node with ArrowRight', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/components/tree')
        ->keys('[data-test="tree-node-electronics"]', ['ArrowDown']);

    eventually(function () use ($page): void {
        $page->assertAttribute('[data-test="tree-node-electronics-laptops"]', 'tabindex', '0');
    });

    $page
        ->assertAttribute('[data-test="tree-node-electronics"]', 'tabindex', '-1')
        ->assertNotPresent('[data-test="tree-node-clothing-men"]')
        ->keys('[data-test="tree-node-clothing"]', ['ArrowRight']);

    eventually(function () use ($page): void {
        $page->assertPresent('[data-test="tree-node-clothing-men"]');
    });

    $page->assertNoJavaScriptErrors();
});

it('navigates when an href node link is clicked', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/components/tree')
        ->click('[data-test="tree-node-clothing-toggle"]');

    eventually(function () use ($page): void {
        $page->assertPresent('[data-test="tree-node-clothing-women"]');
    });

    $page
        ->assertAttribute('[data-test="tree-node-clothing-women"] a', 'href', '/components/containers')
        ->click('[data-test="tree-node-clothing-women"] a');

    eventually(function () use ($page): void {
        $page->assertPathIs('/components/containers');
    });

    $page
        ->assertSee('Team settings')
        ->assertNoJavaScriptErrors();
});
