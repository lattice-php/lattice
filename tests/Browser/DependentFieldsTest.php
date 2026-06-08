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
        ->wait(1)
        ->assertSee('The company field is required.');
});
