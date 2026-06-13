<?php
declare(strict_types=1);

it('toggles the company field instantly based on type', function (): void {
    visit('/dependent-demo')
        ->assertSee('Dependent Demo')
        ->assertDontSee('Company')
        ->click('Business')
        ->assertSee('Company')
        ->click('Personal')
        ->assertDontSee('Company');
});

it('requires the company field for business on submit', function (): void {
    visit('/dependent-demo')
        ->click('Business')
        ->assertSee('Company')
        ->click('Save')
        ->assertSee('The Company field is required.');
});

it('computes the total from qty and unit price via a round-trip', function (): void {
    visit('/dependent-demo')
        ->assertSee('Total')
        ->fill('qty', '3')
        ->fill('unit_price', '4')
        ->assertValue('total', '12');
});

it('renders textarea, number, slider, and date fields', function (): void {
    visit('/dependent-demo')
        ->assertSee('Bio')
        ->assertSee('Level')
        ->assertSee('Due date')
        ->fill('bio', 'Hello world')
        ->fill('due', '2026-06-08')
        ->assertValue('bio', 'Hello world')
        ->assertValue('due', '2026-06-08');
});

it('renders the rich text editor with a toolbar', function (): void {
    visit('/dependent-demo')
        ->assertSee('Article')
        ->assertPresent('[aria-label="Bold"]')
        ->assertPresent('input[type="hidden"][name="article"]');
});
