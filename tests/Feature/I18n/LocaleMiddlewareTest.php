<?php
declare(strict_types=1);

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\getJson;
use function Pest\Laravel\withSession;

beforeEach(function (): void {
    config(['lattice.i18n.locales' => ['en', 'de']]);

    App::setLocale('en');

    Route::middleware('web')->get('/_locale-test', fn () => response()->json([
        'locale' => App::currentLocale(),
    ]));
});

it('uses the accept language header when it matches a configured locale', function (): void {
    getJson('/_locale-test', ['Accept-Language' => 'de-DE,de;q=0.9,en;q=0.8'])
        ->assertOk()
        ->assertJsonPath('locale', 'de');
});

it('prefers the plain locale cookie over the accept language header', function (): void {
    $this->withCredentials()->withUnencryptedCookie('locale', 'de');

    getJson('/_locale-test', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('locale', 'de');
});

it('uses the session locale when no cookie is present', function (): void {
    config(['session.driver' => 'array']);

    withSession(['locale' => 'de']);

    getJson('/_locale-test', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('locale', 'de');
});

it('ignores unsupported locale values', function (): void {
    $this->withCredentials()->withUnencryptedCookie('locale', 'fr');

    getJson('/_locale-test', ['Accept-Language' => 'fr'])
        ->assertOk()
        ->assertJsonPath('locale', 'en');
});
