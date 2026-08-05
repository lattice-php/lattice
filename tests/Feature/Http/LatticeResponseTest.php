<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Effects\Builtin\Callout;
use Lattice\Effects\EffectFlasher;
use Lattice\Facades\Effects;
use Lattice\Http\LatticeResponse;
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
        ->openModal('two-factor')
        ->localeChange('de')
        ->to('/dashboard')
        ->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect(app(EffectFlasher::class)->all())->toHaveCount(2);
    expect(wire(app(EffectFlasher::class)->all()[0])['type'])->toBe('open-modal');
    expect(wire(app(EffectFlasher::class)->all()[1])['type'])->toBe('locale-change');
});

test('Effects::respond starts a fluent response', function (): void {
    $response = Effects::respond()
        ->toast('Done.')
        ->toRoute('after-save')
        ->toResponse(request());

    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);
});
