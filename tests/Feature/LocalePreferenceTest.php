<?php
declare(strict_types=1);

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Workbench\App\Actions\SetLocaleAction;
use Workbench\App\Models\User;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

beforeEach(function (): void {
    config(['lattice.i18n.locales' => ['en', 'de']]);

    App::setLocale('en');

    Route::middleware('web')->get('/_workbench-user-locale', fn () => response()->json([
        'locale' => App::currentLocale(),
    ]));
});

function createWorkbenchLocaleUser(string $locale): User
{
    return User::query()->create([
        'name' => 'Locale User',
        'email' => 'locale-user@example.com',
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
        'locale' => $locale,
    ]);
}

test('locale middleware prefers the authenticated user locale', function (): void {
    $this->actingAs(createWorkbenchLocaleUser('de'));
    $this->withCredentials()->withUnencryptedCookie('locale', 'en');

    getJson('/_workbench-user-locale', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('locale', 'de');
});

test('locale action persists the authenticated user locale preference', function (): void {
    $user = createWorkbenchLocaleUser('en');
    $this->actingAs($user);

    $ref = componentRef(wire(ActionComponent::use(SetLocaleAction::class)
        ->context(['locale' => 'de'])));

    postJson('/lattice/actions/workbench.locale.set', [], latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('ok', true)
        ->assertJsonPath('effects.0.type', 'localeChange')
        ->assertJsonPath('effects.0.locale', 'de');

    expect($user->refresh()->preferredLocale())->toBe('de');
});
