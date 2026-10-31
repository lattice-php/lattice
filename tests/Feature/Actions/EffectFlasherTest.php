<?php
declare(strict_types=1);

use Inertia\Inertia;
use Lattice\Facades\Effects;
use Lattice\Ui\Effects\Builtin\Callout;
use Lattice\Ui\Effects\Builtin\Toast;
use Lattice\Ui\Effects\Effect;
use Lattice\Ui\Effects\EffectFlasher;
use Lattice\Ui\Enums\Variant;

test('effects accumulate across multiple flash calls', function (): void {
    Effects::flash(Effects::toast(Toast::make('Saved.', Variant::Success)));
    Effects::flash(Callout::make('Heads up.', Variant::Warning));

    $effects = app(EffectFlasher::class)->all();

    expect($effects)->toHaveCount(2)
        ->and($effects[0]->jsonSerialize()['type'])->toBe('toast')
        ->and($effects[1]->jsonSerialize()['type'])->toBe('callout');
});

test('flashing no effects is a no-op', function (): void {
    Effects::flash();

    expect(app(EffectFlasher::class)->all())->toBeEmpty();
});

test('the scoped buffer resets between request cycles', function (): void {
    Effects::flash(Effects::toast(Toast::make('One.', Variant::Info)));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);

    app()->forgetScopedInstances();

    expect(app(EffectFlasher::class)->all())->toBeEmpty();
});

test('flash sends the accumulated effects to the latticeEffects bag', function (): void {
    request()->setLaravelSession(app('session.store'));

    Effects::flash(Effects::toast(Toast::make('Saved.', Variant::Success)));
    Effects::flash(Callout::make('Heads up.', Variant::Warning));

    expect(flashedEffectTypes())->toBe(['toast', 'callout']);
});

test('a flash on the request after a redirect keeps the effects the redirect carried', function (): void {
    request()->setLaravelSession($session = app('session.store'));

    Effects::flash(Effects::toast(Toast::make('Saved.', Variant::Success)));

    $session->ageFlashData();
    app()->forgetScopedInstances();
    Effects::clearResolvedInstances();

    Effects::flash(Callout::make('Heads up.', Variant::Warning));

    expect(flashedEffectTypes())->toBe(['toast', 'callout'])
        ->and(app(EffectFlasher::class)->all())->toHaveCount(1);
});

/**
 * @return list<mixed>
 */
function flashedEffectTypes(): array
{
    $flashed = Inertia::getFlashed()['latticeEffects'] ?? [];

    return array_values(array_map(fn (Effect $effect): mixed => $effect->jsonSerialize()['type'], is_array($flashed) ? $flashed : []));
}
