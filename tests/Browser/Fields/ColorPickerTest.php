<?php
declare(strict_types=1);

it('picks a palette swatch into the field value', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/color-picker')
        ->assertSee('Pick a color')
        ->click('[data-test="color-picker-color"]')
        ->click('button[aria-label="#3b82f6"]')
        ->assertValue('input[type="hidden"][name="color"]', '#3b82f6')
        ->assertSee('#3b82f6')
        ->assertNoSmoke();
});
