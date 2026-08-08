<?php
declare(strict_types=1);

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Workbench\App\Actions\SetLocaleAction;

use function Pest\Laravel\getJson;

beforeEach(function (): void {
    config(['lattice.i18n.locales' => ['en', 'de']]);

    App::setLocale('en');

    Route::middleware('web')->get('/_workbench-user-locale', fn () => response()->json([
        'locale' => App::currentLocale(),
    ]));
});

test('locale middleware prefers the authenticated user locale', function (): void {
    $this->actingAs(workbenchTestUser(['locale' => 'de']));
    $this->withCredentials()->withUnencryptedCookie('locale', 'en');

    getJson('/_workbench-user-locale', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('locale', 'de');
});

test('locale action persists the authenticated user locale preference', function (): void {
    $user = workbenchTestUser();
    $this->actingAs($user);

    $this->callAction(SetLocaleAction::class, [], ['locale' => 'de'])
        ->assertOk()
        ->assertJsonPath('effects.0.type', 'locale-change')
        ->assertJsonPath('effects.0.props.locale', 'de');

    expect($user->refresh()->preferredLocale())->toBe('de');
});
