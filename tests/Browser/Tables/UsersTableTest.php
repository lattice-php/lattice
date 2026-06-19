<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Orchestra\Testbench\Factories\UserFactory;

it('lists users with their columns', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/')
        ->assertSee('Workbench users')
        ->assertSee('Maya Chen')
        ->assertSee('Ada Lovelace')
        ->assertSee('Created at')
        ->assertSee('Updated at')
        ->assertDontSee('Browser User 26')
        ->assertNoSmoke();
});

it('copies a cell value to the clipboard', function (): void {
    $this->actingAs(workbenchTestUser());
    User::query()->delete();
    UserFactory::new()->create(['name' => 'Ada Lovelace', 'email' => 'ada@example.com']);

    visit('/')
        ->click('@copy-email')
        ->assertSee('Copied')
        ->assertNoSmoke();
});
