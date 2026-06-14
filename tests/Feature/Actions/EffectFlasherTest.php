<?php
declare(strict_types=1);

use Inertia\Inertia;
use Lattice\Lattice\Actions\Effect;
use Lattice\Lattice\Actions\EffectFlasher;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Facades\Effects;

test('effects accumulate across multiple flash calls', function () {
    Effects::flash(Effect::toast(ToastMessage::make(Variant::Success, 'Saved.')));
    Effects::flash(Effect::callout(Callout::make(Variant::Warning, 'Heads up.')));

    $effects = app(EffectFlasher::class)->all();

    expect($effects)->toHaveCount(2)
        ->and($effects[0]->jsonSerialize()['type'])->toBe('toast')
        ->and($effects[1]->jsonSerialize()['type'])->toBe('callout');
});

test('the scoped buffer resets between request cycles', function () {
    Effects::flash(Effect::toast(ToastMessage::make(Variant::Info, 'One.')));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);

    app()->forgetScopedInstances();

    expect(app(EffectFlasher::class)->all())->toBeEmpty();
});

test('flash sends the accumulated effects to the latticeEffects bag', function () {
    Inertia::spy();

    Effects::flash(Effect::toast(ToastMessage::make(Variant::Success, 'Saved.')));
    Effects::flash(Effect::callout(Callout::make(Variant::Warning, 'Heads up.')));

    Inertia::shouldHaveReceived('flash')
        ->with('latticeEffects', Mockery::on(fn (array $effects): bool => count($effects) === 2))
        ->atLeast()->once();
});
