<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User as Authenticatable;
use Inertia\Testing\AssertableInertia;
use Lattice\Ui\I18n\Contracts\HasTimezonePreference;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

test('a user without a timezone preference shares null', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/')->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->where('lattice.i18n.timezone', null));
});

test('the authenticated user timezone preference is shared to the frontend', function (): void {
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
