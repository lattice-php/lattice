<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
use Workbench\App\Models\User;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

function createWorkbenchTimezoneUser(?string $timezone): User
{
    return User::query()->create([
        'name' => 'Timezone User',
        'email' => 'timezone-user@example.com',
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
        'timezone' => $timezone,
    ]);
}

test('an authenticated user timezone preference is shared to the frontend', function (): void {
    withoutVite();
    $this->actingAs(createWorkbenchTimezoneUser('Europe/Berlin'));

    get('/')->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->where('lattice.i18n.timezone', 'Europe/Berlin'));
});

test('a user without a timezone preference shares null', function (): void {
    withoutVite();
    $this->actingAs(createWorkbenchTimezoneUser(null));

    get('/')->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->where('lattice.i18n.timezone', null));
});
