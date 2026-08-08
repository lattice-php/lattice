<?php
declare(strict_types=1);

it('round-trips a date through the hidden input', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/date-time')
        ->assertSee('Due date')
        ->fill('@due', '2026-06-08')
        ->assertValue('due', '06/08/2026')
        ->assertPresent('input[type="hidden"][name="due"][value="2026-06-08"]')
        ->assertNoSmoke();
});

it('picks a time from the standalone TimeInput popover', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/date-time?type=time')
        ->click('[aria-label="Open Meeting time time picker"]')
        ->assertDisabled('[aria-label="Hour 07"]')
        ->click('[aria-label="Hour 09"]')
        ->click('[aria-label="Minute 30"]')
        ->assertValue('input[name="meeting_time"]', '09:30')
        ->assertNoSmoke();
});
