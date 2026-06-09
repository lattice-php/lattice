<?php

declare(strict_types=1);

it('renders the form showcase with every field type', function (): void {
    visit('/showcase')
        ->assertSee('Form Showcase')
        ->assertNoSmoke()
        ->assertSee('Full name')
        ->assertSee('Email')
        ->assertSee('Password')
        ->assertSee('Bio')
        ->assertSee('Age')
        ->assertSee('Satisfaction')
        ->assertSee('Birthday')
        ->assertSee('Plan')
        ->assertSee('Account type')
        ->assertSee('Quantity')
        ->assertSee('Total')
        ->assertSee('Article')
        ->assertSee('Subscribe to the newsletter')
        ->assertPresent('[aria-label="Bold"]')
        ->assertPresent('.lattice-prose')
        ->assertPresent('input[type="hidden"][name="source"]');
});

it('inserts a table and a details block into the rich editor', function (): void {
    visit('/showcase')
        ->assertPresent('[aria-label="Insert table"]')
        ->assertPresent('[aria-label="Details"]')
        ->assertPresent('[aria-label="Insert emoji"]')
        ->click('[aria-label="Details"]')
        ->assertPresent('.lattice-prose [data-type="details"]')
        ->click('[aria-label="Insert table"]')
        ->assertPresent('.lattice-prose table')
        ->assertNoJavaScriptErrors();
});

it('runs conditional and computed behavior on the showcase', function (): void {
    visit('/showcase')
        ->assertDontSee('Company')
        ->click('Business')
        ->assertSee('Company')
        ->fill('quantity', '4')
        ->fill('unit_price', '5')
        ->wait(1)
        ->assertValue('total', '20');
});
