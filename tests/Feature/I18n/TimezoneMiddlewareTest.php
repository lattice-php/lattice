<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User as Authenticatable;
use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Contracts\HasTimezonePreference;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

it('shares a null timezone when the user does not implement HasTimezonePreference', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/')->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->where('lattice.i18n.timezone', null));
});

it('shares the authenticated user timezone preference', function (): void {
    withoutVite();

    $user = new class extends Authenticatable implements HasTimezonePreference
    {
        protected $table = 'users';

        public function preferredTimezone(): string
        {
            return 'Europe/Berlin';
        }
    };

    $this->actingAs($user);

    get('/')->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->where('lattice.i18n.timezone', 'Europe/Berlin'));
});
