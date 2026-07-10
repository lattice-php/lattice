<?php
declare(strict_types=1);

it('toggles the company field instantly based on type', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/dependent-demo')
        ->assertSee('Dependent Demo')
        ->assertMissing('input[name="company"]')
        ->click('@type-business')
        ->assertPresent('input[name="company"]')
        ->click('@type-personal')
        ->assertMissing('input[name="company"]')
        ->assertNoSmoke();
});

it('requires the company field for business on submit', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/dependent-demo');

    $page->click('@type-business')
        ->assertPresent('input[name="company"]')
        ->click('@form-submit');

    eventually(function () use ($page): void {
        $page->assertSee('The Company field is required.');
    });

    $page->assertNoSmoke();
});

it('computes the total from qty and unit price via a round-trip', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/dependent-demo');

    $page->assertSee('Total')
        ->fill('@qty', '3')
        ->fill('@unit_price', '4');

    eventually(function () use ($page): void {
        $page->assertValue('total', '12');
    });

    $page->assertNoSmoke();
});

it('renders textarea, number, slider, and date fields', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/dependent-demo')
        ->assertSee('Bio')
        ->assertSee('Level')
        ->assertSee('Due date')
        ->fill('@bio', 'Hello world')
        ->fill('@due', '2026-06-08')
        ->assertValue('bio', 'Hello world')
        ->assertValue('due', '06/08/2026')
        ->assertPresent('input[type="hidden"][name="due"][value="2026-06-08"]')
        ->assertNoSmoke();
});

it('renders the rich text editor with a toolbar', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/dependent-demo')
        ->assertSee('Article')
        ->assertPresent('[aria-label="Bold"]')
        ->assertPresent('input[type="hidden"][name="article"]')
        ->assertNoSmoke();
});
