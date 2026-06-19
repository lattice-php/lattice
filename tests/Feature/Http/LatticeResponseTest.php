<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Effects\EffectFlasher;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\FormResponse;
use Lattice\Lattice\Http\LatticeResponse;

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
        ->callout(Callout::make(Variant::Info, 'Heads up'))
        ->reloadPage()
        ->closeModal('two-factor')
        ->effect(Effect::reloadComponent('teams.members'))
        ->to('/dashboard')
        ->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toContain('/dashboard');
    expect(app(EffectFlasher::class)->all())->toHaveCount(4);
});

test('Effects::respond starts a fluent response', function (): void {
    $response = Effects::respond()
        ->toast('Done.')
        ->toRoute('after-save')
        ->toResponse(request());

    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);
});

test('the deprecated FormResponse alias still builds a working response', function (): void {
    $response = FormResponse::make()->toast('Saved.')->toRoute('after-save')->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toBe(route('after-save'));
});

test('FormDefinition::toast starts a fluent response from the handler', function (): void {
    $response = (new FlashForm)->handle(request())->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);
});

test('FormDefinition::respond starts an empty fluent response from the handler', function (): void {
    $response = (new RespondForm)->handle(request())->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);
});

final class FlashForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form;
    }

    public function handle(Request $request): LatticeResponse
    {
        return $this->toast('Saved.', Variant::Success)->toRoute('after-save');
    }
}

final class RespondForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form;
    }

    public function handle(Request $request): LatticeResponse
    {
        return $this->respond()->reloadPage()->toRoute('after-save');
    }
}
