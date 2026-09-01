<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Facades\Effects;
use Lattice\Http\LatticeResponse;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Effects\Builtin\Callout;
use Lattice\Ui\Effects\EffectFlasher;
use Lattice\Ui\Enums\Variant;

beforeEach(function (): void {
    app()->forgetScopedInstances();
    Route::get('after-save', fn (): string => 'ok')->middleware('web')->name('after-save');
});

test('a lattice response flashes its effects and redirects to a route', function (): void {
    $response = LatticeResponse::make()
        ->toast('Saved.', Variant::Success)
        ->reloadComponent('settings.passkeys')
        ->toRoute('after-save')
        ->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(2);
});

test('a lattice response redirects back by default and flashes nothing', function (): void {
    $response = LatticeResponse::make()->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect(app(EffectFlasher::class)->all())->toBe([]);
});

test('a lattice response queues every effect helper and redirects to a url', function (): void {
    $response = LatticeResponse::make()
        ->callout(Callout::make('Heads up', Variant::Info))
        ->reloadPage()
        ->closeModal('two-factor')
        ->effect(Effects::reloadComponent('teams.members'))
        ->to('/dashboard')
        ->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toContain('/dashboard');
    expect(app(EffectFlasher::class)->all())->toHaveCount(4);
});

test('a lattice response flashes the trait-provided effects', function (): void {
    $response = LatticeResponse::make()
        ->openModal(Modal::make('two-factor'))
        ->localeChange('de')
        ->to('/dashboard')
        ->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect(app(EffectFlasher::class)->all())->toHaveCount(2);
    expect(wire(app(EffectFlasher::class)->all()[0])['type'])->toBe('open-modal');
    expect(wire(app(EffectFlasher::class)->all()[1])['type'])->toBe('locale-change');
});

test('a json request gets the effects as a body instead of a redirect', function (): void {
    $request = request();
    $request->headers->set('Accept', 'application/json');

    $response = LatticeResponse::make()
        ->toast('Saved.', Variant::Success)
        ->reloadComponent('projects.summary')
        ->toResponse($request);

    expect($response->getStatusCode())->toBe(200);
    expect($response->headers->get('Content-Type'))->toContain('application/json');

    $effects = json_decode((string) $response->getContent(), true)['effects'];
    expect($effects)->toHaveCount(2);
    expect($effects[0]['type'])->toBe('toast');
    expect($effects[1])->toBe(['type' => 'reload-component', 'props' => ['component' => 'projects.summary']]);
    expect(app(EffectFlasher::class)->all())->toBe([]);
});

test('a json request carries an explicit redirect as a redirect effect', function (): void {
    $request = request();
    $request->headers->set('Accept', 'application/json');

    $response = LatticeResponse::make()
        ->toast('Saved.')
        ->toRoute('after-save')
        ->toResponse($request);

    $effects = json_decode((string) $response->getContent(), true)['effects'];
    expect($effects)->toHaveCount(2);
    expect($effects[1])->toBe(['type' => 'redirect', 'props' => ['url' => route('after-save')]]);
});

test('an inertia request keeps the redirect flow even when it accepts json', function (): void {
    $request = request();
    $request->headers->set('Accept', 'application/json');
    $request->headers->set('X-Inertia', 'true');

    $response = LatticeResponse::make()
        ->toast('Saved.')
        ->toResponse($request);

    expect($response->getStatusCode())->toBe(302);
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);
});

test('Effects::respond starts a fluent response', function (): void {
    $response = Effects::respond()
        ->toast('Done.')
        ->toRoute('after-save')
        ->toResponse(request());

    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);
});
