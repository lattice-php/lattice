<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Effects\EffectFlasher;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\FormResponse;

beforeEach(function (): void {
    app()->forgetScopedInstances();
    Route::get('after-save', fn (): string => 'ok')->middleware('web')->name('after-save');
});

test('a form response flashes its effects and redirects to a route', function (): void {
    $response = FormResponse::make()
        ->toast('Saved.', Variant::Success)
        ->reloadPage()
        ->toRoute('after-save')
        ->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(2);
});

test('a form response redirects back by default and flashes nothing', function (): void {
    $response = FormResponse::make()->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect(app(EffectFlasher::class)->all())->toBe([]);
});

test('FormDefinition::toast starts a fluent response from the handler', function (): void {
    $response = (new FlashForm)->handle(request())->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toBe(route('after-save'));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);
});

test('a form response queues every effect helper and redirects to a url', function (): void {
    $response = FormResponse::make()
        ->callout(Callout::make(Variant::Info, 'Heads up'))
        ->reloadComponent('settings.passkeys')
        ->closeModal('two-factor')
        ->effect(Effect::reloadPage())
        ->to('/dashboard')
        ->toResponse(request());

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toContain('/dashboard');
    expect(app(EffectFlasher::class)->all())->toHaveCount(4);
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

    public function handle(Request $request): FormResponse
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

    public function handle(Request $request): FormResponse
    {
        return $this->respond()->reloadPage()->toRoute('after-save');
    }
}
