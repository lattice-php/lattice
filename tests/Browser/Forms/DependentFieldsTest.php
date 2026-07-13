<?php
declare(strict_types=1);

it('toggles the company field instantly based on type', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/form/dependent')
        ->assertSee('Dependent & computed')
        ->assertMissing('input[name="company"]')
        ->click('@type-business')
        ->assertPresent('input[name="company"]')
        ->click('@type-personal')
        ->assertMissing('input[name="company"]')
        ->assertNoSmoke();
});

it('requires the company field for business on submit', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/form/dependent');

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

    $page = visit('/form/dependent?type=computed');

    $page->assertSee('Total')
        ->fill('@qty', '3')
        ->fill('@unit_price', '4');

    eventually(function () use ($page): void {
        $page->assertValue('total', '12');
    });

    $page->assertNoSmoke();
});
